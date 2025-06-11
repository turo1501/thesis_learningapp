import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import Quiz from "../models/quizModel";
import QuizSubmission from "../models/quizSubmissionModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import Course from "../models/courseModel";
import { v4 as uuidv4 } from "uuid";

// Create a new quiz
export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const {
      courseId,
      sectionId,
      chapterId,
      title,
      description,
      instructions,
      questions,
      settings
    } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Verify user is the course teacher
    const course = await Course.get(courseId);
    if (!course || course.teacherId !== userId) {
      res.status(403).json({ message: "Only course teachers can create quizzes" });
      return;
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);

    const newQuiz = new Quiz({
      quizId: uuidv4(),
      courseId,
      sectionId,
      chapterId,
      title,
      description,
      instructions,
      questions: questions.map((q: any) => ({
        questionId: uuidv4(),
        ...q
      })),
      settings: {
        timeLimit: settings?.timeLimit || null,
        shuffleQuestions: settings?.shuffleQuestions || false,
        shuffleOptions: settings?.shuffleOptions || false,
        showResultsImmediately: settings?.showResultsImmediately ?? true,
        allowRetake: settings?.allowRetake ?? true,
        maxAttempts: settings?.maxAttempts || 3,
        passingScore: settings?.passingScore || 70,
        showCorrectAnswers: settings?.showCorrectAnswers ?? true,
        showExplanations: settings?.showExplanations ?? true,
        randomizeFromPool: settings?.randomizeFromPool || false,
        questionsPerAttempt: settings?.questionsPerAttempt || questions.length
      },
      totalPoints,
      difficulty: settings?.difficulty || "medium",
      tags: settings?.tags || [],
      createdBy: userId,
      analytics: {
        totalAttempts: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        passRate: 0,
        mostMissedQuestions: [],
        lastUpdated: new Date().toISOString()
      }
    });

    await newQuiz.save();

    res.status(201).json({
      message: "Quiz created successfully",
      data: newQuiz
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({
      message: "Error creating quiz",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get quiz by ID
export const getQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { userId } = getAuth(req);

    const quiz = await Quiz.get(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Check if user has access to this quiz
    const course = await Course.get(quiz.courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Allow access if user is teacher or enrolled student
    const isTeacher = course.teacherId === userId;
    const isEnrolled = course.enrollments?.some((e: any) => e.userId === userId);

    if (!isTeacher && !isEnrolled) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // For students, hide correct answers unless they've completed the quiz
    let responseQuiz: any = quiz;
    if (!isTeacher) {
      // Check if student has completed the quiz
      const submissions = await QuizSubmission.scan()
        .where("userId").eq(userId)
        .where("quizId").eq(quizId)
        .where("status").eq("completed")
        .exec();

      const hasCompleted = submissions.length > 0;
      
      if (!hasCompleted || !quiz.settings?.showCorrectAnswers) {
        // Remove correct answers and explanations for students who haven't completed
        responseQuiz = {
          ...quiz.toJSON(),
          questions: quiz.questions.map((q: any) => ({
            ...q,
            options: q.options?.map((opt: any) => ({
              optionId: opt.optionId,
              text: opt.text,
              // Hide correct answers
            })),
            correctAnswer: undefined,
            explanation: undefined
          }))
        };
      }
    }

    res.json({
      message: "Quiz retrieved successfully",
      data: responseQuiz
    });
  } catch (error) {
    console.error("Error getting quiz:", error);
    res.status(500).json({
      message: "Error retrieving quiz",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get quizzes for a course/chapter
export const getQuizzesByChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, chapterId } = req.params;
    const { userId } = getAuth(req);

    // Verify access to course
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const isTeacher = course.teacherId === userId;
    const isEnrolled = course.enrollments?.some((e: any) => e.userId === userId);

    if (!isTeacher && !isEnrolled) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const quizzes = await Quiz.scan()
      .where("courseId").eq(courseId)
      .where("chapterId").eq(chapterId)
      .where("isActive").eq(true)
      .exec();

    res.json({
      message: "Quizzes retrieved successfully",
      data: quizzes
    });
  } catch (error) {
    console.error("Error getting quizzes:", error);
    res.status(500).json({
      message: "Error retrieving quizzes",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Start a quiz attempt
export const startQuizAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { userId } = getAuth(req);
    const { deviceInfo } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const quiz = await Quiz.get(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Check if user can take quiz
    const existingSubmissions = await QuizSubmission.scan()
      .where("userId").eq(userId)
      .where("quizId").eq(quizId)
      .exec();

    const completedAttempts = existingSubmissions.filter(s => s.status === "completed").length;
    
    if (!quiz.settings?.allowRetake && completedAttempts > 0) {
      res.status(400).json({ message: "Retakes not allowed for this quiz" });
      return;
    }

    if (completedAttempts >= (quiz.settings?.maxAttempts || 3)) {
      res.status(400).json({ message: "Maximum attempts reached" });
      return;
    }

    // Check for ongoing attempt
    const ongoingAttempt = existingSubmissions.find(s => s.status === "in-progress");
    if (ongoingAttempt) {
      res.json({
        message: "Ongoing attempt found",
        data: ongoingAttempt
      });
      return;
    }

    // Create new attempt
    const submission = new QuizSubmission({
      submissionId: uuidv4(),
      userId,
      quizId,
      courseId: quiz.courseId,
      sectionId: quiz.sectionId,
      chapterId: quiz.chapterId,
      attemptNumber: completedAttempts + 1,
      answers: [],
      score: 0,
      percentage: 0,
      totalPoints: quiz.totalPoints,
      passed: false,
      timeSpent: 0,
      status: "in-progress",
      startedAt: new Date().toISOString(),
      deviceInfo
    });

    await submission.save();

    res.json({
      message: "Quiz attempt started",
      data: submission
    });
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    res.status(500).json({
      message: "Error starting quiz attempt",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Submit quiz answer
export const submitQuizAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { questionId, userAnswer, selectedOptions, timeSpent, hintsUsed } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const submission = await QuizSubmission.get(submissionId);
    if (!submission || submission.userId !== userId) {
      res.status(404).json({ message: "Submission not found" });
      return;
    }

    if (submission.status !== "in-progress") {
      res.status(400).json({ message: "Quiz is not in progress" });
      return;
    }

    const quiz = await Quiz.get(submission.quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Find the question
    const question = quiz.questions.find((q: any) => q.questionId === questionId);
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    // Evaluate answer
    let isCorrect = false;
    let pointsEarned = 0;

    switch (question.type) {
      case "multiple-choice":
        const correctOptions = question.options?.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.optionId) || [];
        isCorrect = selectedOptions && correctOptions.length === selectedOptions.length && 
                   correctOptions.every((opt: string) => selectedOptions.includes(opt));
        break;
      
      case "true-false":
        const correctOption = question.options?.find((opt: any) => opt.isCorrect);
        isCorrect = selectedOptions && selectedOptions.length === 1 && selectedOptions[0] === correctOption?.optionId;
        break;
      
      case "fill-in-blank":
      case "short-answer":
        // Simple string comparison (case insensitive, trimmed)
        isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
        break;
    }

    if (isCorrect) {
      pointsEarned = question.points || 1;
      // Reduce points if hints were used
      if (hintsUsed && hintsUsed > 0) {
        pointsEarned = Math.max(pointsEarned * (1 - hintsUsed * 0.1), pointsEarned * 0.5);
      }
    }

    // Update or add answer
    const existingAnswerIndex = submission.answers.findIndex((a: any) => a.questionId === questionId);
    const answerData = {
      questionId,
      userAnswer,
      selectedOptions,
      isCorrect,
      pointsEarned,
      timeSpent,
      hintsUsed
    };

    if (existingAnswerIndex >= 0) {
      submission.answers[existingAnswerIndex] = answerData;
    } else {
      submission.answers.push(answerData);
    }

    await submission.save();

    res.json({
      message: "Answer submitted successfully",
      data: {
        isCorrect,
        pointsEarned,
        explanation: quiz.settings?.showExplanations ? question.explanation : undefined
      }
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      message: "Error submitting answer",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Complete quiz attempt
export const completeQuizAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { totalTimeSpent } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const submission = await QuizSubmission.get(submissionId);
    if (!submission || submission.userId !== userId) {
      res.status(404).json({ message: "Submission not found" });
      return;
    }

    if (submission.status !== "in-progress") {
      res.status(400).json({ message: "Quiz is not in progress" });
      return;
    }

    const quiz = await Quiz.get(submission.quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Calculate final score
    const totalScore = submission.answers.reduce((sum: number, answer: any) => sum + answer.pointsEarned, 0);
    const percentage = (totalScore / quiz.totalPoints) * 100;
    const passed = percentage >= (quiz.settings?.passingScore || 70);

    // Generate feedback
    const feedback = generateQuizFeedback(submission.answers, quiz, percentage);

    // Update submission
    submission.score = totalScore;
    submission.percentage = percentage;
    submission.passed = passed;
    submission.timeSpent = totalTimeSpent;
    submission.status = "completed";
    submission.completedAt = new Date().toISOString();
    submission.submittedAt = new Date().toISOString();
    submission.feedback = feedback;

    await submission.save();

    // Update course progress if quiz passed
    if (passed) {
      await updateCourseProgressForQuiz(userId, quiz.courseId, quiz.sectionId, quiz.chapterId, percentage);
    }

    // Update quiz analytics
    await updateQuizAnalytics(quiz.quizId, submission);

    res.json({
      message: "Quiz completed successfully",
      data: {
        submission,
        passed,
        score: totalScore,
        percentage,
        feedback
      }
    });
  } catch (error) {
    console.error("Error completing quiz:", error);
    res.status(500).json({
      message: "Error completing quiz",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get user's quiz submissions
export const getUserQuizSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const submissions = await QuizSubmission.scan()
      .where("userId").eq(userId)
      .where("quizId").eq(quizId)
      .exec();

    res.json({
      message: "Submissions retrieved successfully",
      data: submissions
    });
  } catch (error) {
    console.error("Error getting submissions:", error);
    res.status(500).json({
      message: "Error retrieving submissions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Helper function to generate quiz feedback
const generateQuizFeedback = (answers: any[], quiz: any, percentage: number) => {
  
  let overallFeedback = "";
  const strengthAreas: string[] = [];
  const improvementAreas: string[] = [];
  const suggestedResources: string[] = [];

  if (percentage >= 90) {
    overallFeedback = "Excellent work! You've demonstrated mastery of the material.";
  } else if (percentage >= 70) {
    overallFeedback = "Good job! You've passed the quiz with a solid understanding.";
  } else if (percentage >= 50) {
    overallFeedback = "You're on the right track, but there's room for improvement.";
  } else {
    overallFeedback = "Consider reviewing the material and retaking the quiz.";
  }

  // Analyze performance by question topics/tags
  const topicPerformance = new Map();
  
  answers.forEach(answer => {
    const question = quiz.questions.find((q: any) => q.questionId === answer.questionId);
    if (question && question.tags) {
      question.tags.forEach((tag: string) => {
        if (!topicPerformance.has(tag)) {
          topicPerformance.set(tag, { correct: 0, total: 0 });
        }
        const stats = topicPerformance.get(tag);
        stats.total++;
        if (answer.isCorrect) stats.correct++;
      });
    }
  });

  // Identify strengths and weaknesses
  topicPerformance.forEach((stats, topic) => {
    const topicPercentage = (stats.correct / stats.total) * 100;
    if (topicPercentage >= 80) {
      strengthAreas.push(topic);
    } else if (topicPercentage < 60) {
      improvementAreas.push(topic);
      suggestedResources.push(`Review materials on ${topic}`);
    }
  });

  return {
    overallFeedback,
    strengthAreas,
    improvementAreas,
    suggestedResources,
    nextSteps: percentage >= 70 ? "Continue to the next chapter" : "Review the material and retake the quiz"
  };
};

// Helper function to update course progress
const updateCourseProgressForQuiz = async (
  userId: string, 
  courseId: string, 
  sectionId: string, 
  chapterId: string, 
  quizScore: number
) => {
  try {
    const progressEntries = await UserCourseProgress.scan()
      .where("userId").eq(userId)
      .where("courseId").eq(courseId)
      .exec();

    if (progressEntries.length > 0) {
      const progress = progressEntries[0];
      const section = progress.sections?.find((s: any) => s.sectionId === sectionId);
      
      if (section) {
        const chapter = section.chapters?.find((c: any) => c.chapterId === chapterId);
        if (chapter) {
          chapter.completed = true;
          chapter.completedAt = new Date().toISOString();
          chapter.quizScore = quizScore;
          chapter.engagementScore = Math.min(100, (chapter.engagementScore || 0) + 20);
        }
      }

      await progress.save();
    }
  } catch (error) {
    console.error("Error updating course progress:", error);
  }
};

// Helper function to update quiz analytics
const updateQuizAnalytics = async (quizId: string, _submission: any) => {
  try {
    const quiz = await Quiz.get(quizId);
    if (!quiz) return;

    // Get all completed submissions for this quiz
    const allSubmissions = await QuizSubmission.scan()
      .where("quizId").eq(quizId)
      .where("status").eq("completed")
      .exec();

    const totalAttempts = allSubmissions.length;
    const averageScore = allSubmissions.reduce((sum, sub) => sum + sub.percentage, 0) / totalAttempts;
    const averageTimeSpent = allSubmissions.reduce((sum, sub) => sum + sub.timeSpent, 0) / totalAttempts;
    const passedCount = allSubmissions.filter(sub => sub.passed).length;
    const passRate = (passedCount / totalAttempts) * 100;

    // Find most missed questions
    const questionMissCount = new Map();
    allSubmissions.forEach(sub => {
      sub.answers.forEach((answer: any) => {
        if (!answer.isCorrect) {
          const count = questionMissCount.get(answer.questionId) || 0;
          questionMissCount.set(answer.questionId, count + 1);
        }
      });
    });

    const mostMissedQuestions = Array.from(questionMissCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    quiz.analytics = {
      totalAttempts,
      averageScore,
      averageTimeSpent,
      passRate,
      mostMissedQuestions,
      lastUpdated: new Date().toISOString()
    };

    await quiz.save();
  } catch (error) {
    console.error("Error updating quiz analytics:", error);
  }
}; 