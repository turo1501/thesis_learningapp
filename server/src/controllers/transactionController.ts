import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY os required but was not found in env variables"
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const listTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.query;

  try {
    const transactions = userId
      ? await Transaction.query("userId").eq(userId).exec()
      : await Transaction.scan().exec();

    res.json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transactions", error });
  }
};

export const createStripePaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { amount } = req.body;

  // Validate amount
  if (!amount || isNaN(amount) || amount <= 0) {
    amount = 50; // Default fallback amount (50 cents)
  }

  // Convert amount to integer if it's not already
  amount = Math.floor(Number(amount));

  // Ensure amount is within Stripe limits
  const MAX_AMOUNT = 99999999; // $999,999.99 in cents
  const MIN_AMOUNT = 50; // 50 cents minimum for Stripe
  
  if (amount > MAX_AMOUNT) {
    amount = MAX_AMOUNT;
  }
  
  if (amount < MIN_AMOUNT) {
    amount = MIN_AMOUNT;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    res
      .status(500)
      .json({ message: "Error creating stripe payment intent", error });
  }
};

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;

  // Validate required fields
  if (!userId || !courseId || !transactionId || !paymentProvider) {
    res.status(400).json({ 
      message: "Missing required fields: userId, courseId, transactionId, paymentProvider" 
    });
    return;
  }

  console.log(`Creating transaction for user ${userId}, course ${courseId}, transaction ${transactionId}`);

  try {
    // 1. Get course info
    console.log(`Fetching course data for courseId: ${courseId}`);
    const course = await Course.get(courseId);
    
    if (!course) {
      console.error(`Course not found: ${courseId}`);
      res.status(404).json({ message: "Course not found" });
      return;
    }

    console.log(`Course found: ${course.title}`);

    // 2. Check if user is already enrolled to prevent duplicate enrollments
    console.log(`Checking existing enrollment for user ${userId} in course ${courseId}`);
    try {
      const existingProgress = await UserCourseProgress.scan()
        .where("userId").eq(userId)
        .where("courseId").eq(courseId)
        .exec();
      
      if (existingProgress && existingProgress.length > 0) {
        console.log(`User ${userId} already enrolled in course ${courseId}`);
        res.status(409).json({ 
          message: "User is already enrolled in this course",
          data: {
            transaction: null,
            courseProgress: existingProgress[0]
          }
        });
        return;
      }
    } catch (checkError) {
      console.log("Error checking existing enrollment, proceeding with enrollment");
    }

    // 3. Create transaction record
    console.log(`Creating transaction record`);
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    });
    await newTransaction.save();
    console.log(`Transaction saved: ${newTransaction.transactionId}`);

    // 4. Create initial course progress with required id field
    console.log(`Creating course progress for user ${userId}`);
    const initialProgress = new UserCourseProgress({
      id: uuidv4(), // Add required id field as hashKey
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections?.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters?.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })) || [],
      })) || [],
      lastAccessedTimestamp: new Date().toISOString(),
      isPreview: false,
    });
    await initialProgress.save();
    console.log(`Course progress created with id: ${initialProgress.id}`);

    // 5. Add enrollment to relevant course
    console.log(`Adding enrollment to course ${courseId}`);
    try {
    await Course.update(
      { courseId },
      {
        $ADD: {
          enrollments: [{ userId }],
        },
      }
    );
      console.log(`Enrollment added to course ${courseId}`);
    } catch (enrollmentError) {
      console.error("Error adding enrollment to course:", enrollmentError);
      // Don't fail the transaction if enrollment update fails
    }

    console.log(`Transaction completed successfully for user ${userId}, course ${courseId}`);

    res.json({
      message: "Course purchased and enrolled successfully",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
        course: {
          courseId: course.courseId,
          title: course.title,
        }
      },
    });
  } catch (error) {
    console.error("Error creating transaction and enrollment:", error);
    res
      .status(500)
      .json({ 
        message: "Error creating transaction and enrollment", 
        error: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
  }
};