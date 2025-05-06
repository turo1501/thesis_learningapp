import axios from 'axios';
import { generateSimpleResponse } from './simpleAI';
import { getRecommendations } from './courseRecommender';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Các từ khóa quan tâm chính được theo dõi trong lịch sử chat
interface InterestKeywords {
  programming: string[];
  ai: string[];
  design: string[];
  business: string[];
  science: string[];
}

// Cấu trúc theo dõi mối quan tâm của người dùng
interface UserInterests {
  programming: number;
  ai: number;
  design: number;
  business: number;
  science: number;
  lastAnalyzed: number;
}

// Cache để lưu trữ mối quan tâm của người dùng
const userInterestsCache: Map<string, UserInterests> = new Map();

// Bộ nhớ các chủ đề đã nói gần đây cho mỗi người dùng
const recentTopicsCache: Map<string, string[]> = new Map();

// Từ khóa phân loại chủ đề quan tâm
const interestKeywords: InterestKeywords = {
  programming: ['programming', 'code', 'developer', 'web', 'javascript', 'python', 'react', 'html', 'css', 'app', 'mobile', 'lập trình', 'phát triển', 'code', 'frontend', 'backend', 'fullstack', 'web development', 'app development'],
  ai: ['ai', 'machine learning', 'deep learning', 'neural network', 'artificial intelligence', 'data science', 'trí tuệ nhân tạo', 'học máy', 'big data', 'NLP', 'machine learning', 'data analytics', 'data mining', 'artificial neural network'],
  design: ['design', 'ui', 'ux', 'user interface', 'user experience', 'graphic', 'figma', 'thiết kế', 'giao diện', 'photoshop', 'illustrator', 'responsive design', 'visual design', 'interaction design', 'thiết kế đồ họa', 'thiết kế website', 'ux/ui', 'ui/ux', 'user research', 'usability', 'wireframe', 'prototype', 'color theory', 'typography', 'user-centered', 'interface', 'accessibility', 'information architecture', 'thiết kế trải nghiệm người dùng', 'thiết kế giao diện người dùng', 'layout', 'component', 'mockup'],
  business: ['business', 'marketing', 'entrepreneur', 'startup', 'management', 'kinh doanh', 'quản lý', 'khởi nghiệp', 'tiếp thị', 'digital marketing', 'SEO', 'thương mại điện tử', 'ecommerce', 'finance', 'tài chính', 'accounting', 'kế toán'],
  science: ['science', 'khoa học', 'physics', 'vật lý', 'chemistry', 'hóa học', 'biology', 'sinh học', 'research', 'nghiên cứu', 'scientific', 'experiment', 'thí nghiệm', 'laboratory', 'lab', 'mathematics', 'toán học', 'statistics', 'thống kê']
};

// Mẫu để phát hiện yêu cầu giới thiệu khóa học
const courseRequestPattern = /(khóa học|course|learn|học|recommend|đề xuất|gợi ý|suggest|tìm kiếm|search|find|học về|chia sẻ|nói về|dạy|muốn học|want to learn|introduce|giới thiệu|for beginners|newbie|guide|hướng dẫn).*(AI|artificial intelligence|trí tuệ nhân tạo|machine learning|học máy|deep learning|web|design|thiết kế|business|kinh doanh|software|phần mềm|lập trình|development|code|programming|science|khoa học)/i;

// Thêm trọng số ưu tiên cho các từ khóa mới nhất
const RECENCY_FACTOR = 1.5;

/**
 * Phân tích mối quan tâm của người dùng dựa trên lịch sử chat
 * @param userId ID của người dùng
 * @param history Lịch sử chat
 * @returns Trả về các mối quan tâm đã được cập nhật
 */
export const analyzeUserInterests = (userId: string, history: ChatMessage[]): UserInterests => {
  // Lấy thông tin quan tâm hiện tại hoặc tạo mới
  const existingInterests = userInterestsCache.get(userId) || {
    programming: 0,
    ai: 0,
    design: 0,
    business: 0,
    science: 0, // Thêm chủ đề science
    lastAnalyzed: 0
  };
  
  // Chỉ phân tích tin nhắn người dùng
  const userMessages = history.filter(msg => msg.role === 'user');
  
  // Trọng số sẽ tăng dần cho các tin nhắn gần đây hơn
  const messageCount = userMessages.length;
  
  // Nếu không có tin nhắn, trả về thông tin hiện tại
  if (messageCount === 0) {
    return existingInterests;
  }
  
  // Lưu trữ các chủ đề đã phát hiện để tránh lặp lại
  const detectedTopics = new Set<string>();
  
  // Phân tích mối quan tâm qua từ khóa
  userMessages.forEach((msg, index) => {
    const lowerContent = msg.content.toLowerCase();
    // Trọng số dành cho vị trí tin nhắn (tin nhắn gần đây sẽ có trọng số cao hơn)
    const recencyWeight = 1 + (index / messageCount) * RECENCY_FACTOR;
    
    // Kiểm tra từng loại mối quan tâm
    for (const [category, keywords] of Object.entries(interestKeywords)) {
      for (const keyword of keywords) {
        if (lowerContent.includes(keyword) && !detectedTopics.has(`${category}-${keyword}`)) {
          // Tăng điểm cho danh mục này với trọng số theo thời gian
          const categoryKey = category as keyof Omit<UserInterests, 'lastAnalyzed'>;
          existingInterests[categoryKey] += 1 * recencyWeight;
          // Đánh dấu chủ đề này đã được phát hiện
          detectedTopics.add(`${category}-${keyword}`);
          
          // Lưu chủ đề gần đây
          const recentTopics = recentTopicsCache.get(userId) || [];
          if (!recentTopics.includes(category)) {
            recentTopics.unshift(category);
            // Giới hạn số lượng chủ đề gần đây
            if (recentTopics.length > 3) {
              recentTopics.pop();
            }
            recentTopicsCache.set(userId, recentTopics);
          }
        }
      }
    }
  });
  
  // Cập nhật thời gian phân tích
  existingInterests.lastAnalyzed = Date.now();
  
  // Chuẩn hóa điểm số (tránh điểm quá cao sau nhiều tin nhắn)
  const total = Object.entries(existingInterests)
    .filter(([key]) => key !== 'lastAnalyzed')
    .reduce((sum, [_, value]) => sum + (value as number), 0);
  
  if (total > 20) {
    const factor = 20 / total;
    for (const key of Object.keys(existingInterests)) {
      if (key !== 'lastAnalyzed') {
        existingInterests[key as keyof Omit<UserInterests, 'lastAnalyzed'>] *= factor;
      }
    }
  }
  
  // Lưu vào cache
  userInterestsCache.set(userId, existingInterests);
  
  return existingInterests;
};

/**
 * Gợi ý khóa học dựa trên mối quan tâm của người dùng
 * @param userId ID của người dùng
 * @param interests Mối quan tâm đã phân tích
 * @returns Danh sách gợi ý khóa học
 */
export const suggestCoursesBasedOnInterests = (_userId: string, interests: UserInterests): string[] => {
  // Tìm danh mục có điểm cao nhất
  let maxCategory = 'programming';
  let maxScore = interests.programming;
  
  for (const [category, score] of Object.entries(interests)) {
    if (category !== 'lastAnalyzed' && score > maxScore) {
      maxCategory = category;
      maxScore = score as number;
    }
  }
  
  // Danh sách khóa học theo danh mục
  const coursesByCategory: Record<string, string[]> = {
    programming: [
      'Web Development with React',
      'Full-Stack JavaScript Development', 
      'Mobile App Development with Flutter', 
      'Python for Beginners'
    ],
    ai: [
      'Machine Learning Fundamentals', 
      'Deep Learning with PyTorch', 
      'Data Science and Analytics', 
      'Natural Language Processing'
    ],
    design: [
      'UX/UI Design Principles', 
      'Responsive Web Design', 
      'Design Systems for Developers', 
      'Graphic Design Masterclass',
      'User Research Methods',
      'UI Prototyping with Figma'
    ],
    business: [
      'Digital Marketing Fundamentals', 
      'Startup Business Strategy', 
      'Project Management Professional', 
      'Financial Analysis for Business'
    ],
    science: [
      'Introduction to Data Science',
      'Physics for Engineers',
      'Biology and Genetics Fundamentals',
      'Mathematics for Machine Learning'
    ]
  };
  
  // Lấy gợi ý khóa học từ danh mục hàng đầu
  return coursesByCategory[maxCategory] || coursesByCategory.programming;
};

/**
 * Kiểm tra xem có nên chuyển hướng cuộc trò chuyện không dựa trên ngữ cảnh
 * @param lastMessage Tin nhắn mới nhất của người dùng
 * @param history Lịch sử trò chuyện
 * @returns Tin nhắn gợi ý nếu cần chuyển hướng, null nếu không
 */
function detectAndSuggestRedirection(lastMessage: string, history: ChatMessage[]): string | null {
  // Cải thiện: Chỉ xem tin nhắn gần đây hơn để tránh lặp lại
  const recentMessages = history.slice(-6);
  const userMessages = recentMessages.filter(msg => msg.role === 'user');
  const botMessages = recentMessages.filter(msg => msg.role === 'assistant');
  
  // Kiểm tra xem đã gợi ý khóa học gần đây hay chưa
  const hasRecentlySuggestedScience = botMessages.some(msg => 
    msg.content.includes('Introduction to Data Science') && 
    msg.content.includes('Physics for Engineers')
  );
  
  // Nếu đã gợi ý gần đây, không lặp lại
  if (hasRecentlySuggestedScience && 
      (lastMessage.toLowerCase().includes('science') || 
       lastMessage.includes('khoa học'))) {
    return null;
  }

  // Đếm số lần người dùng đề cập đến các chủ đề
  const scienceReferences = userMessages.filter(msg => 
    msg.content.toLowerCase().includes('science') || 
    msg.content.toLowerCase().includes('khoa học')
  ).length;
  
  const aiReferences = userMessages.filter(msg => 
    msg.content.toLowerCase().includes('ai') || 
    msg.content.toLowerCase().includes('artificial intelligence') ||
    msg.content.toLowerCase().includes('trí tuệ nhân tạo')
  ).length;
  
  const webReferences = userMessages.filter(msg => 
    msg.content.toLowerCase().includes('web') || 
    msg.content.toLowerCase().includes('react') ||
    msg.content.toLowerCase().includes('javascript')
  ).length;
  
  const designReferences = userMessages.filter(msg => 
    msg.content.toLowerCase().includes('design') || 
    msg.content.toLowerCase().includes('ui') || 
    msg.content.toLowerCase().includes('ux') ||
    msg.content.toLowerCase().includes('ux/ui') ||
    msg.content.toLowerCase().includes('thiết kế')
  ).length;
  
  // Kiểm tra xem bot có đang cung cấp câu trả lời hữu ích không
  const hasHelpfulScienceResponse = botMessages.some(msg => 
    (msg.content.toLowerCase().includes('science') || 
     msg.content.toLowerCase().includes('khoa học')) &&
    msg.content.length > 100
  );
  
  const hasHelpfulAIResponse = botMessages.some(msg => 
    (msg.content.toLowerCase().includes('machine learning') || 
     msg.content.toLowerCase().includes('ai')) &&
    msg.content.length > 100
  );
  
  const hasHelpfulWebResponse = botMessages.some(msg => 
    (msg.content.toLowerCase().includes('web') || 
     msg.content.toLowerCase().includes('react')) &&
    msg.content.length > 100
  );
  
  const hasHelpfulDesignResponse = botMessages.some(msg => 
    (msg.content.toLowerCase().includes('design') || 
     msg.content.toLowerCase().includes('ui') ||
     msg.content.toLowerCase().includes('ux')) &&
    msg.content.length > 100
  );
  
  // Phát hiện lặp lại câu hỏi
  const repeatedScienceQuestions = scienceReferences >= 2 && !hasHelpfulScienceResponse;
  const repeatedAIQuestions = aiReferences >= 2 && !hasHelpfulAIResponse;
  const repeatedWebQuestions = webReferences >= 2 && !hasHelpfulWebResponse;
  const repeatedDesignQuestions = designReferences >= 2 && !hasHelpfulDesignResponse;

  // Lấy chủ đề được hỏi nhiều nhất
  const topics = [
    { name: 'science', count: scienceReferences, hasResponse: hasHelpfulScienceResponse },
    { name: 'ai', count: aiReferences, hasResponse: hasHelpfulAIResponse },
    { name: 'web', count: webReferences, hasResponse: hasHelpfulWebResponse },
    { name: 'design', count: designReferences, hasResponse: hasHelpfulDesignResponse }
  ];
  
  const mostAskedTopic = topics.sort((a, b) => {
    // Ưu tiên những chủ đề chưa có câu trả lời hữu ích
    if (a.hasResponse !== b.hasResponse) {
      return a.hasResponse ? 1 : -1;
    }
    // Sau đó sắp xếp theo số lần hỏi
    return b.count - a.count;
  })[0];
  
  // Kiểm tra nếu tin nhắn gần đây của người dùng đề cập đến chủ đề cụ thể
  const isCurrentMessageAboutScience = lastMessage.toLowerCase().includes('science') || 
                                      lastMessage.toLowerCase().includes('khoa học');
  
  const isCurrentMessageAboutAI = lastMessage.toLowerCase().includes('ai') || 
                                 lastMessage.toLowerCase().includes('artificial intelligence') ||
                                 lastMessage.toLowerCase().includes('trí tuệ nhân tạo');
  
  const isCurrentMessageAboutWeb = lastMessage.toLowerCase().includes('web') || 
                                  lastMessage.toLowerCase().includes('react') ||
                                  lastMessage.toLowerCase().includes('javascript');
  
  const isCurrentMessageAboutDesign = lastMessage.toLowerCase().includes('design') || 
                                     lastMessage.toLowerCase().includes('ui') || 
                                     lastMessage.toLowerCase().includes('ux') ||
                                     lastMessage.toLowerCase().includes('ux/ui') ||
                                     lastMessage.toLowerCase().includes('thiết kế');
  
  // Trả lời dựa trên chủ đề được quan tâm nhất hiện tại
  const isVietnamese = detectVietnamese(lastMessage);
  
  if (isCurrentMessageAboutScience && repeatedScienceQuestions) {
    return isVietnamese
      ? "Về khóa học khoa học, chúng tôi cung cấp: 'Introduction to Data Science', 'Physics for Engineers', 'Biology and Genetics Fundamentals', và 'Mathematics for Machine Learning'. Bạn quan tâm đến lĩnh vực khoa học cụ thể nào?"
      : "For science courses, we offer: 'Introduction to Data Science', 'Physics for Engineers', 'Biology and Genetics Fundamentals', and 'Mathematics for Machine Learning'. Which area of science interests you most?";
  }
  
  if (isCurrentMessageAboutAI && repeatedAIQuestions) {
    return isVietnamese
      ? "Về AI, khóa học Machine Learning Fundamentals của chúng tôi phù hợp cho người mới bắt đầu. Khóa học bao gồm kỹ thuật học có giám sát và không giám sát, mạng neural, và đánh giá mô hình thực tế."
      : "Our Machine Learning Fundamentals course is perfect for beginners in AI. It covers supervised and unsupervised learning techniques, neural networks, and practical model evaluation.";
  }
  
  if (isCurrentMessageAboutWeb && repeatedWebQuestions) {
    return isVietnamese
      ? "Đối với phát triển web, chúng tôi cung cấp khóa học 'Web Development with React' cho cả người mới bắt đầu và những người đã có kinh nghiệm. Khóa học bao gồm JavaScript cơ bản, React và xây dựng ứng dụng web hiện đại."
      : "For web development, we offer 'Web Development with React' for both beginners and experienced developers. The course covers JavaScript fundamentals, React, and building modern web applications.";
  }
  
  if (isCurrentMessageAboutDesign && repeatedDesignQuestions) {
    return isVietnamese
      ? "Về thiết kế UX/UI, chúng tôi cung cấp các khóa học 'UX/UI Design Principles', 'Responsive Web Design', 'Design Systems for Developers', 'Graphic Design Masterclass', 'User Research Methods', và 'UI Prototyping with Figma'. Khóa học UX/UI Design của chúng tôi bao gồm nguyên tắc thiết kế giao diện người dùng, wireframing, prototyping, và đánh giá usability."
      : "For UX/UI design, we offer 'UX/UI Design Principles', 'Responsive Web Design', 'Design Systems for Developers', 'Graphic Design Masterclass', 'User Research Methods', and 'UI Prototyping with Figma'. The UX/UI Design Principles course covers user interface design principles, wireframing, prototyping, and usability testing.";
  }
  
  // Nếu chủ đề được hỏi nhiều lần mà không được trả lời cụ thể
  if (mostAskedTopic.count >= 2 && !mostAskedTopic.hasResponse) {
    if (mostAskedTopic.name === 'science') {
      return isVietnamese
        ? "Tôi nhận thấy bạn quan tâm đến các khóa học khoa học. Chúng tôi cung cấp: 'Introduction to Data Science', 'Physics for Engineers', 'Biology and Genetics Fundamentals', và 'Mathematics for Machine Learning'. Bạn muốn tìm hiểu thêm về khóa học nào?"
        : "I notice you're interested in science courses. We currently offer 'Introduction to Data Science', 'Physics for Engineers', 'Biology and Genetics Fundamentals', and 'Mathematics for Machine Learning'. Would you like more information about any of these?";
    } else if (mostAskedTopic.name === 'ai') {
      return isVietnamese
        ? "Tôi thấy bạn quan tâm đến AI. Khóa học Machine Learning Fundamentals của chúng tôi phù hợp cho người mới bắt đầu, bao gồm kỹ thuật học có giám sát và không giám sát, mạng neural, và đánh giá mô hình thực tế."
        : "I see you're interested in AI. Our Machine Learning Fundamentals course is perfect for beginners, covering supervised and unsupervised learning techniques, neural networks, and practical model evaluation.";
    } else if (mostAskedTopic.name === 'web') {
      return isVietnamese
        ? "Tôi nhận thấy bạn quan tâm đến phát triển web. Chúng tôi cung cấp khóa học 'Web Development with React' bao gồm JavaScript cơ bản và xây dựng ứng dụng web hiện đại."
        : "I notice you're interested in web development. We offer a 'Web Development with React' course that covers JavaScript fundamentals and building modern web applications.";
    } else if (mostAskedTopic.name === 'design') {
      return isVietnamese
        ? "Tôi nhận thấy bạn quan tâm đến thiết kế UX/UI. Chúng tôi cung cấp nhiều khóa học thiết kế như 'UX/UI Design Principles', 'Responsive Web Design', và 'Design Systems for Developers'. Khóa học UX/UI Design của chúng tôi bao gồm nguyên tắc thiết kế giao diện người dùng, wireframing, prototyping, và đánh giá usability."
        : "I see you're interested in UX/UI design. We offer several design courses including 'UX/UI Design Principles', 'Responsive Web Design', and 'Design Systems for Developers'. Our UX/UI Design course covers user interface design principles, wireframing, prototyping, and usability testing.";
    }
  }
  
  return null;
}

/**
 * Phát hiện xem một đoạn văn bản có phải tiếng Việt hay không
 */
function detectVietnamese(text: string): boolean {
  const vietnameseChars = 'ăâđêôơưáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ';
  const lowerText = text.toLowerCase();
  
  // Kiểm tra các ký tự đặc biệt của tiếng Việt
  for (const char of vietnameseChars) {
    if (lowerText.includes(char)) return true;
  }
  
  // Kiểm tra các từ thông dụng
  const commonWords = ['tôi', 'bạn', 'của', 'và', 'không', 'học', 'giúp', 'cần', 'muốn'];
  for (const word of commonWords) {
    if (lowerText.includes(` ${word} `)) return true;
  }
  
  return false;
}

/**
 * Enhanced system prompt with more detailed context about the platform
 */
const getSystemPrompt = (userId?: string): string => {
  // Thêm thông tin về mối quan tâm gần đây của người dùng nếu có
  let userContext = '';
  if (userId && recentTopicsCache.has(userId)) {
    const recentTopics = recentTopicsCache.get(userId)!;
    if (recentTopics.length > 0) {
      userContext = `\nThis user has recently shown interest in: ${recentTopics.join(', ')}.`;
    }
  }
  
  return `You are an intelligent AI learning assistant for our educational platform. Your role is to provide helpful, accurate, and personalized support to our students.${userContext}

PLATFORM INFORMATION:
- You are part of a comprehensive e-learning platform with courses in programming, AI, design, business, and science
- The platform offers both free and premium courses with video lectures, interactive exercises, and quizzes
- Students can track their progress, create flashcards for spaced repetition learning, and participate in virtual meetings with instructors
- The platform has a blog section with educational articles, a discussion forum, and personalized learning paths

MAIN PLATFORM FEATURES:
- Course enrollment and progress tracking
- Interactive video lessons with quizzes
- Memory cards for spaced repetition learning
- Virtual meetings with instructors
- Assignment submission and grading
- Course recommendations based on interests and goals
- Blog posts and educational resources
- Community forum for student discussions
- Personal learning path customization
- Mobile app for learning on the go

COURSE CATEGORIES:
1. Programming & Development: Web development (React, Angular, Vue), Mobile app development (Flutter, React Native), Backend (Node.js, Python, Java)
2. AI & Data Science: Machine Learning, Deep Learning, Data Analytics, Computer Vision, NLP
3. Design: UX/UI Design, Graphic Design, Web Design, 3D Modeling
4. Business: Digital Marketing, Entrepreneurship, Project Management, Finance
5. Science: Data Science, Physics, Biology, Mathematics, Statistics

DETAILED COURSE OFFERINGS:
- Web Development: We offer comprehensive Web Development with React courses covering modern JavaScript, component architecture, and state management
- AI & ML: Our Machine Learning Fundamentals course teaches supervised and unsupervised learning, neural networks, and practical model evaluation
- Design: UX/UI Design Principles covers user research, wireframing, prototyping and design systems
- Science: We offer courses in Data Science, Physics for Engineers, Biology and Genetics, and Mathematics for Machine Learning

YOUR PERSONALITY AND CONVERSATIONAL STYLE:
- Be friendly, encouraging, and enthusiastic about helping users find the right courses
- Use a conversational, natural tone that feels helpful without being overly formal
- Adapt your tone to match the user's level of formality - if they're casual, be casual; if they're formal, be more professional
- When responding to straightforward questions, provide concise answers without unnecessary explanations
- For more complex topics, start with a brief answer, then provide details if relevant
- Occasionally use light conversational phrases like "Great question!" or "I'd be happy to help with that" to make the conversation feel more natural
- Avoid overly repetitive language patterns - vary your responses for similar questions
- When a user expresses interest in a topic, show enthusiasm in your response
- Personalize responses when possible by referencing the user's interests or previous questions

RESPONSE PRINCIPLES:
- Be concise but thorough in your answers - avoid unnecessarily long explanations
- Focus on being helpful rather than demonstrating knowledge
- For technical topics, balance simplicity with accuracy
- For course recommendations, highlight practical benefits and learning outcomes
- Match the language style of the user (Vietnamese or English)
- If the user expresses frustration, acknowledge it and provide extra assistance
- When in doubt about a specific detail, focus on providing general guidance rather than potentially incorrect specifics
- Be consistent with your previous responses

Remember, your goal is to enhance the learning experience and help students achieve their educational goals.`;
};

/**
 * Format conversation history for DeepSeek API format with enhanced context
 */
function formatConversationHistory(history: ChatMessage[], currentMessage: string, userId?: string): any[] {
  const messages = [];
  
  // Add enhanced system prompt
  messages.push({
    role: 'system',
    content: getSystemPrompt(userId)
  });
  
  // Add specific instruction for consistent responses
  messages.push({
    role: 'system',
    content: `IMPORTANT INSTRUCTIONS:
1. Do not repeat the same answers multiple times.
2. If the user asks about a topic multiple times, provide more detailed information each time.
3. Be consistent in your course recommendations - if you've mentioned we offer a course, don't later say we don't have it.
4. Provide specific course recommendations based on the user's expressed interests.
5. If the user asks about science courses, recommend: 'Introduction to Data Science', 'Physics for Engineers', 'Biology and Genetics Fundamentals', and 'Mathematics for Machine Learning'.
6. If the user asks about AI courses, recommend: 'Machine Learning Fundamentals', 'Deep Learning with PyTorch', 'Natural Language Processing', and 'Data Science and Analytics'.
7. If the user asks about web development, recommend: 'Web Development with React', 'Full-Stack JavaScript Development', 'Responsive Web Design', and 'Modern Frontend Development'.
8. If the user asks about design, recommend: 'UX/UI Design Principles', 'Graphic Design Masterclass', 'Web Design Essentials', and 'Design Systems for Developers'.
9. Be attentive to the language the user is using (English or Vietnamese) and respond in the same language.
10. If the user asks about platform features or website functionality, explain our e-learning platform features (NOT chatbot features).
11. Understand when a user is asking for a general introduction to the platform versus asking about specific courses.
12. When asked for an introduction to the platform, provide a comprehensive overview of the learning platform.`
  });
  
  // Analyze the current message to improve context
  let contextEnhancement = "";
  const lowerMessage = currentMessage.toLowerCase();
  
  if (lowerMessage.includes("giới thiệu") || lowerMessage.includes("introduce") || 
      lowerMessage.includes("about") || lowerMessage.includes("overview") ||
      lowerMessage.includes("về ứng dụng") || lowerMessage.includes("về website")) {
    contextEnhancement = `The user is asking for an introduction to the platform. Provide a comprehensive overview of the e-learning platform features, not just about specific courses.`;
    
    // Add additional context for platform introduction
    messages.push({
      role: 'system',
      content: contextEnhancement
    });
  } else if (lowerMessage.includes("chức năng") || lowerMessage.includes("feature") || 
             lowerMessage.includes("có gì") || lowerMessage.includes("what can you do")) {
    contextEnhancement = `The user is asking about platform features and functionality. Explain the e-learning features of our platform, not the chatbot capabilities.`;
    
    messages.push({
      role: 'system',
      content: contextEnhancement
    });
  }
  
  // Add conversation history - limit to the last 15 messages for better context
  const recentHistory = history.slice(-15);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  }
  
  // Add current message
  messages.push({
    role: 'user',
    content: currentMessage
  });
  
  return messages;
}

/**
 * Advanced AI context processing using intent classification and semantic matching
 * This helps prioritize relevant response patterns based on conversational context
 */
interface IntentClassification {
  primaryIntent: string;
  confidence: number;
  entities: Record<string, string>;
  context: string[];
}

/**
 * Semantic similarity scoring between user query and reference texts
 * Uses cosine similarity approximation on word frequency vectors
 * @param query The user's query text
 * @param reference The reference text to compare against
 * @returns Similarity score between 0-1
 */


/**
 * Classify user intent from message and conversation history
 * @param message Current user message
 * @param history Conversation history
 * @returns Classification of user intent
 */
function classifyUserIntent(message: string, history: ChatMessage[]): IntentClassification {
  const lowerMessage = message.toLowerCase();
  
  // Define intent patterns with regex and keywords - Enhanced with more variations
  const intentPatterns = [
    {
      name: 'get_course_recommendations',
      patterns: [
        /recommend.*course/i, /suggest.*course/i, /what.*course/i, /khóa học/i, 
        /learning path/i, /học cái gì/i, /học về/i, /muốn học/i, 
        /interested in learning/i, /want to learn/i, /what should i learn/i,
        /which courses/i, /course.*(for|about)/i, /classes/i, /lessons/i,
        /khóa học nào/i, /nên học gì/i, /có khóa học/i, /muốn tìm hiểu/i
      ],
      keywords: ['recommend', 'suggest', 'course', 'khóa học', 'học', 'recommendation', 'interested', 'learn', 'courses', 'classes', 'lessons', 'lớp học', 'bài học', 'buổi học', 'khóa', 'học tập'],
      context: ['learning', 'study', 'education', 'class', 'giáo dục', 'đào tạo', 'trình độ', 'kỹ năng', 'skills', 'development']
    },
    {
      name: 'get_platform_info',
      patterns: [
        /about.*platform/i, /platform.*feature/i, /what.*can.*do/i, /giới thiệu/i,
        /introduce/i, /về ứng dụng/i, /về website/i, /chức năng/i, /how.*work/i,
        /tell me about/i, /what is/i, /website offer/i, /platform offer/i,
        /^what$/i, /^how$/i, /about you/i, /trang web.*làm gì/i, /nền tảng.*làm gì/i
      ],
      keywords: ['platform', 'application', 'website', 'ứng dụng', 'giới thiệu', 'chức năng', 'feature', 'what is', 'how does', 'tell me about', 'trang web', 'nền tảng', 'hệ thống', 'là gì', 'cách thức', 'hoạt động'],
      context: ['platform', 'system', 'application', 'website', 'trang web', 'ứng dụng', 'hệ thống', 'site']
    },
    {
      name: 'get_course_details',
      patterns: [
        /detail.*course/i, /about.*course/i, /information.*course/i, /chi tiết.*khóa/i,
        /thông tin.*khóa/i, /nội dung.*khóa/i, /what.*in the course/i, /course.*content/i,
        /what.*cover/i, /syllabus/i, /curriculum/i, /what.*learn in/i, /course.*include/i,
        /khóa học.*bao gồm/i, /nội dung.*bài học/i, /giáo trình/i, /chương trình học/i
      ],
      keywords: ['detail', 'information', 'about', 'chi tiết', 'thông tin', 'nội dung', 'content', 'syllabus', 'curriculum', 'cover', 'include', 'bao gồm', 'giáo trình', 'chương trình học', 'học gì', 'dạy gì'],
      context: ['course', 'class', 'khóa học', 'lớp học', 'bài học', 'môn học', 'chương trình']
    },
    {
      name: 'get_registration_link',
      patterns: [
        /link.*register/i, /link.*sign up/i, /how.*register/i, /đường link/i, 
        /đăng k[íiy]/i, /đăng ký/i, /link đăng ký/i, /url.*đăng ký/i, /link.*khóa/i,
        /sign up/i, /join.*course/i, /enroll/i, /registration/i, /how.*join/i,
        /where.*register/i, /link.*enroll/i, /muốn đăng ký/i, /cách đăng ký/i,
        /làm thế nào để đăng ký/i, /đăng ký.*như thế nào/i, /đăng ký.*ở đâu/i
      ],
      keywords: ['link', 'register', 'registration', 'sign up', 'đăng ký', 'đăng kí', 'đường link', 'đường dẫn', 'enroll', 'join', 'url', 'website', 'address', 'địa chỉ', 'trang web', 'đăng nhập', 'tài khoản', 'account'],
      context: ['register', 'enrollment', 'join', 'course', 'khóa học', 'signup', 'account', 'login', 'website']
    },
    {
      name: 'improve_ai',
      patterns: [
        /improve.*ai/i, /better.*ai/i, /ai.*smarter/i, /thông minh.*ai/i,
        /cải thiện.*ai/i, /nâng cao.*ai/i, /chatbot.*tốt hơn/i, /enhance.*ai/i,
        /upgrade.*ai/i, /optimize.*ai/i, /advance.*ai/i, /phát triển.*ai/i,
        /how.*ai.*work/i, /ai.*methodology/i, /ai.*architecture/i,
        /ai.*framework/i, /ai.*model/i, /ai.*training/i, /ai.*learning/i
      ],
      keywords: ['improve', 'better', 'enhance', 'smarter', 'thông minh', 'cải thiện', 'nâng cao', 'upgrade', 'optimize', 'advance', 'intelligence', 'phát triển', 'methodology', 'architecture', 'framework', 'model', 'training', 'learning'],
      context: ['ai', 'chatbot', 'model', 'intelligence', 'trí tuệ', 'nhân tạo', 'máy học', 'machine learning', 'neural network', 'deep learning', 'nlp', 'natural language']
    },
    {
      name: 'identity_query',
      patterns: [
        /^who are you/i, /^what are you/i, /your name/i, /^bạn là ai/i, /^bạn là gì/i,
        /tên của bạn/i, /introduce yourself/i, /giới thiệu.*bản thân/i, /bạn.*là.*trợ lý/i,
        /ai.*bạn/i, /tên bạn/i, /^ai đây/i, /tự giới thiệu/i, /tell me about yourself/i,
        /what's your purpose/i, /what do you do/i, /how do you work/i, /your function/i,
        /your role/i, /nhiệm vụ của bạn/i, /bạn làm gì/i, /vai trò của bạn/i,
        /you a human/i, /you a bot/i, /you an ai/i, /you a person/i, /are you real/i
      ],
      keywords: ['who', 'what are you', 'your name', 'bạn là ai', 'bạn là gì', 'tên của bạn', 'giới thiệu', 'introduce yourself', 'about yourself', 'purpose', 'function', 'role', 'nhiệm vụ', 'vai trò', 'human', 'bot', 'ai', 'real', 'person', 'con người', 'máy', 'robot'],
      context: ['identity', 'introduction', 'name', 'about you', 'giới thiệu', 'danh tính', 'tên', 'nhận dạng']
    },
    {
      name: 'greeting',
      patterns: [
        /^hi$/i, /^hello$/i, /^hey$/i, /^xin chào$/i, /^chào$/i, /^hola$/i,
        /^good morning$/i, /^good afternoon$/i, /^good evening$/i, /^sup$/i,
        /^yo$/i, /^hiya$/i, /^howdy$/i, /^greetings$/i, /^what's up$/i,
        /^nice to meet you$/i, /^chào buổi sáng$/i, /^chào buổi chiều$/i,
        /^chào buổi tối$/i, /^rất vui được gặp bạn$/i, /^xin chào bạn$/i
      ],
      keywords: ['hi', 'hello', 'hey', 'xin chào', 'chào', 'hola', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 'greetings', 'what\'s up', 'nice to meet you', 'chào buổi', 'rất vui'],
      context: ['greeting', 'introduction', 'lời chào', 'giới thiệu', 'bắt đầu', 'start']
    },
    // New intent for pricing and payment questions
    {
      name: 'pricing_payment',
      patterns: [
        /how much.*cost/i, /price.*course/i, /fee/i, /payment/i, /purchase/i,
        /buy.*course/i, /subscription/i, /discount/i, /free trial/i, /pay/i,
        /giá.*khóa học/i, /học phí/i, /thanh toán/i, /mua/i, /phí/i, /tiền/i,
        /trial/i, /dùng thử/i, /khuyến mãi/i, /giảm giá/i
      ],
      keywords: ['price', 'cost', 'fee', 'payment', 'purchase', 'buy', 'subscription', 'discount', 'free trial', 'pay', 'giá', 'học phí', 'thanh toán', 'mua', 'phí', 'tiền', 'trial', 'dùng thử', 'khuyến mãi', 'giảm giá'],
      context: ['price', 'cost', 'payment', 'money', 'financial', 'purchase', 'subscription', 'giá', 'tiền', 'chi phí', 'học phí']
    },
    // New intent for technical support
    {
      name: 'technical_support',
      patterns: [
        /can't access/i, /problem with/i, /issue with/i, /help with/i, /trouble with/i,
        /not working/i, /error/i, /bug/i, /fix/i, /support/i, /assistance/i,
        /không truy cập được/i, /vấn đề với/i, /lỗi/i, /giúp đỡ/i, /khó khăn với/i,
        /không hoạt động/i, /sửa/i, /hỗ trợ/i, /trợ giúp/i, /technical/i, /kỹ thuật/i
      ],
      keywords: ['access', 'problem', 'issue', 'help', 'trouble', 'not working', 'error', 'bug', 'fix', 'support', 'assistance', 'truy cập', 'vấn đề', 'lỗi', 'giúp đỡ', 'khó khăn', 'không hoạt động', 'sửa', 'hỗ trợ', 'trợ giúp', 'technical', 'kỹ thuật'],
      context: ['technical', 'support', 'help', 'issue', 'problem', 'error', 'kỹ thuật', 'hỗ trợ', 'giúp đỡ', 'vấn đề', 'lỗi']
    },
    // Add new intent for personal questions
    {
      name: 'personal_question',
      patterns: [
        /bạn biết tôi là ai/i, /bạn.*biết.*tôi/i, /who am i/i, /tôi là ai/i,
        /tôi đang ở đâu/i, /where am i/i, /vị trí của tôi/i, /địa điểm/i,
        /tôi.*làm gì/i, /what.*i do/i, /nghề nghiệp.*tôi/i, /công việc.*tôi/i
      ],
      keywords: ['tôi là ai', 'bạn biết tôi', 'who am i', 'tôi đang ở đâu', 'where am i', 'địa điểm', 'làm gì', 'nghề nghiệp', 'công việc'],
      context: ['personal', 'identity', 'location', 'cá nhân', 'danh tính', 'vị trí']
    },
    // Add new intent for out-of-context questions
    {
      name: 'out_of_context',
      patterns: [
        /thời tiết/i, /weather/i, /tin tức/i, /news/i, /thể thao/i, /sports/i,
        /chính trị/i, /politics/i, /giải trí/i, /entertainment/i,
        /lịch sử/i, /history/i, /địa lý/i, /geography/i
      ],
      keywords: ['thời tiết', 'weather', 'tin tức', 'news', 'thể thao', 'sports', 'chính trị', 'politics', 'giải trí', 'entertainment', 'lịch sử', 'history', 'địa lý', 'geography'],
      context: ['general knowledge', 'kiến thức chung', 'thông tin chung']
    }
  ];
  
  // Score each intent
  const intentScores: Record<string, number> = {};
  let topIntent = 'general_query';
  let maxScore = 0;
  const entities: Record<string, string> = {};
  
  // Extract context from recent history - Look at more history for better context understanding
  const recentUserMessages = history
    .filter(msg => msg.role === 'user')
    .slice(-5) // Increased from 3 to 5 for better context
    .map(msg => msg.content);
  
  const contextualInfo = [...recentUserMessages, message].join(' ');
  
  // Score intents based on patterns and keywords
  intentPatterns.forEach(intent => {
    let score = 0;
    
    // Check regex patterns - Higher weight for full pattern matches
    intent.patterns.forEach(pattern => {
      if (pattern.test(lowerMessage)) {
        score += 0.5;  // Increased from 0.4 to 0.5 for stronger pattern matching
      }
    });
    
    // Check keywords - Iterate and count matches for more precise scoring
    let keywordCount = 0;
    intent.keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        keywordCount++;
      }
    });
    
    // Apply diminishing returns for multiple keywords
    if (keywordCount > 0) {
      score += Math.min(0.3, 0.1 + (keywordCount * 0.05));
    }
    
    // Consider conversation context - More weight for context in recent messages
    let contextCount = 0;
    intent.context.forEach(contextWord => {
      if (contextualInfo.toLowerCase().includes(contextWord.toLowerCase())) {
        contextCount++;
      }
    });
    
    // Apply context score with diminishing returns
    if (contextCount > 0) {
      score += Math.min(0.2, 0.05 + (contextCount * 0.03));
    }
    
    // Enhanced entity extraction - more comprehensive course type detection
    if (intent.name === 'get_course_details' || intent.name === 'get_course_recommendations' || intent.name === 'get_registration_link') {
      // Expanded course types list with common variations
      const courseTypes = [
        { key: 'react', variations: ['react', 'react.js', 'reactjs', 'react development'] },
        { key: 'web', variations: ['web', 'website', 'web development', 'frontend', 'front-end', 'front end'] },
        { key: 'ai', variations: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'trí tuệ nhân tạo'] },
        { key: 'python', variations: ['python', 'python programming', 'python development'] },
        { key: 'design', variations: ['design', 'designing', 'thiết kế'] },
        { key: 'ux', variations: ['ux', 'user experience', 'ux design', 'trải nghiệm người dùng'] },
        { key: 'ui', variations: ['ui', 'user interface', 'interface design', 'giao diện người dùng'] },
        { key: 'science', variations: ['science', 'khoa học', 'scientific', 'data science'] },
        { key: 'physics', variations: ['physics', 'vật lý', 'physical', 'mechanics'] },
        { key: 'mathematics', variations: ['mathematics', 'math', 'toán học', 'toán', 'calculus', 'algebra'] },
        { key: 'business', variations: ['business', 'kinh doanh', 'management', 'entrepreneurship', 'startup'] },
        { key: 'mobile', variations: ['mobile', 'mobile app', 'mobile development', 'app development', 'android', 'ios'] }
      ];
      
      // Check for course types in the message
      for (const courseType of courseTypes) {
        for (const variation of courseType.variations) {
          if (lowerMessage.includes(variation.toLowerCase())) {
            entities['course_type'] = courseType.key;
            break;
          }
        }
        if (entities['course_type']) break;
      }
    }
    
    intentScores[intent.name] = score;
    
    if (score > maxScore) {
      maxScore = score;
      topIntent = intent.name;
    }
  });
  
  // Special case handling with more nuanced confidence thresholds
  if (maxScore < 0.3) {
    if (lowerMessage.length < 15) {
      // Check if it's potentially a greeting
      const greetingKeywords = ['hi', 'hello', 'hey', 'xin chào', 'chào', 'hola'];
      if (greetingKeywords.some(keyword => lowerMessage.includes(keyword))) {
        topIntent = 'greeting';
        maxScore = 0.6;
      } else {
        // Very short messages that aren't greetings are likely follow-up queries
        // Use context from previous messages to infer intent
        const previousMessages = history.filter(msg => msg.role === 'user').slice(-2);
        if (previousMessages.length > 0) {
          // Re-classify with added context from previous messages
          const contextMessage = previousMessages[previousMessages.length - 1].content + " " + message;
          const tempClassification = classifyUserIntent(contextMessage, history.slice(0, -2));
          topIntent = tempClassification.primaryIntent;
          maxScore = Math.max(0.3, tempClassification.confidence * 0.8); // Slightly lower confidence for context-inferred intents
        } else {
          topIntent = 'general_query';
          maxScore = 0.3;
        }
      }
    } else {
      // For longer messages with low confidence, check for question indicators
      const questionIndicators = ['?', 'what', 'how', 'where', 'why', 'when', 'is', 'are', 'can', 'could', 'would', 'should', 'làm sao', 'như thế nào', 'có phải', 'ở đâu', 'tại sao', 'khi nào', 'ai'];
      if (questionIndicators.some(indicator => lowerMessage.includes(indicator))) {
        // Message contains a question - analysis likely missed the intent
        // Keep as general query but with higher confidence that it's a valid question
        topIntent = 'general_query';
        maxScore = 0.4;
      } else {
        topIntent = 'general_query';
        maxScore = 0.3;
      }
    }
  }
  
  // Extract relevant context words with improved categorization
  const contextWords = Object.entries(interestKeywords)
    .flatMap(([category, keywords]) => {
      const found = keywords.filter((keyword: string) => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      return found.length > 0 ? [category] : [];
    });
  
  return {
    primaryIntent: topIntent,
    confidence: maxScore,
    entities,
    context: contextWords
  };
}

/**
 * Enhanced response generation with context awareness
 * @param message User message
 * @param history Conversation history
 * @param userId User ID for personalization
 * @returns AI response
 */
export const generateAIResponse = async (
  message: string,
  history: ChatMessage[] = [],
  userId?: string
): Promise<string> => {
  try {
    // Apply intent classification for more intelligent response generation
    const intentClassification = classifyUserIntent(message, history);
    console.log(`Detected intent: ${intentClassification.primaryIntent} (confidence: ${intentClassification.confidence.toFixed(2)})`);
    
    // Phát hiện ngôn ngữ
    
    // Thêm xử lý đặc biệt cho các loại intent không được nhận diện rõ ràng hoặc ý định ngoài ngữ cảnh
    if (intentClassification.primaryIntent === 'general_query' || 
        intentClassification.primaryIntent === 'personal_question' || 
        intentClassification.confidence < 0.4 ||
        intentClassification.primaryIntent === 'out_of_context') {
      console.log('Sử dụng DeepSeek model để trả lời với ngữ cảnh đầy đủ hơn');
      
      try {
        // Tạo system prompt nâng cao để xử lý tất cả các loại câu hỏi
        const enhancedSystemPrompt = `Bạn là trợ lý AI thông minh trên nền tảng học tập trực tuyến. Bạn cần tuân thủ các hướng dẫn sau:

1. Ưu tiên trả lời những câu hỏi liên quan đến nền tảng học tập, khóa học, và nội dung học tập.

2. Nếu người dùng hỏi về thông tin cá nhân (như "bạn biết tôi là ai không", "tôi đang ở đâu"):
   - Trả lời lịch sự rằng bạn là trợ lý AI, không có thông tin cá nhân về họ
   - Giải thích rằng bạn tập trung vào việc giúp đỡ trong học tập

3. Nếu người dùng hỏi về chủ đề không liên quan (thời tiết, tin tức, chính trị):
   - Giải thích ngắn gọn rằng bạn được thiết kế tập trung vào học tập
   - Hướng người dùng quay lại các chủ đề liên quan đến học tập

4. Với câu hỏi về khóa học, hãy cung cấp thông tin về các khóa học sau:
   - Lập trình: Web Development with React, Python, Full-Stack JavaScript
   - AI: Machine Learning Fundamentals, Deep Learning with PyTorch
   - Thiết kế: UX/UI Design Principles, Graphic Design Masterclass
   - Kinh doanh: Digital Marketing, Business Strategy
   - Khoa học: Data Science, Mathematics for Machine Learning

5. Duy trì giọng điệu thân thiện, hữu ích, và tự nhiên.
6. Trả lời ngắn gọn và đi thẳng vào vấn đề.
7. Sử dụng ngôn ngữ tương tự người dùng (Tiếng Việt hoặc Tiếng Anh).

Thông tin nền tảng:
- Nền tảng học tập trực tuyến với khóa học trong nhiều lĩnh vực
- Có cả khóa học miễn phí và trả phí
- Người dùng có thể đăng ký tại https://learning.example.com/register`;

        // Tạo messages với system prompt nâng cao
        const enhancedMessages = [
          { role: 'system', content: enhancedSystemPrompt },
          // Thêm một số tin nhắn gần đây để context (tối đa 5 tin nhắn gần đây)
          ...history.slice(-5).map(msg => {
            // Convert từ định dạng ChatMessage sang định dạng DeepSeek
            let deepseekRole: 'user' | 'assistant' | 'system' = 'user';
            if (msg.role === 'user') {
              deepseekRole = 'user';
            } else {
              deepseekRole = 'assistant'; // Cho bất kỳ role nào không phải user
            }
            
            return {
              role: deepseekRole,
              content: msg.content
            };
          }),
          { role: 'user', content: message }
        ];
        
        // Gọi DeepSeek API với cấu hình nâng cao để đảm bảo phản hồi tự nhiên và đa dạng
        const response = await axios.post(
          'https://api.deepseek.com/v1/chat/completions',
          {
            model: 'deepseek-chat',
            messages: enhancedMessages,
            temperature: 0.8, // Tăng temperature để có phản hồi đa dạng, tự nhiên hơn
            max_tokens: 500, // Đủ dài cho câu trả lời chi tiết
            top_p: 0.92, // Giữ mức độ đa dạng cao nhưng vẫn liên quan
            presence_penalty: 0.1, // Khuyến khích sự đa dạng nhẹ
            frequency_penalty: 0.1 // Giảm sự lặp lại
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Lấy phản hồi từ deepseek
        const aiResponse = response.data.choices[0]?.message?.content || '';
        if (aiResponse) {
          return aiResponse;
        }
      } catch (error: any) {
        console.error('Lỗi khi gọi DeepSeek API cho câu hỏi đặc biệt:', error.message);
        // Sẽ tiếp tục với luồng xử lý bình thường nếu có lỗi
      }
    }
    
    // Implement custom handling for high-confidence intents
    if (intentClassification.confidence > 0.5) {
      const isVietnamese = detectVietnamese(message);
      
      // Registration link intent - Direct, factual response
      if (intentClassification.primaryIntent === 'get_registration_link') {
        const courseType = intentClassification.entities['course_type'] || '';
        
        // Base registration URL
        const baseUrl = "https://learning.example.com/register";
        
        // Course-specific registration links with more detailed paths
        let specificPath = "";
        let courseName = "";
        
        if (courseType) {
          switch (courseType) {
            case 'ai':
            case 'machine learning':
              specificPath = "/ai-courses";
              courseName = isVietnamese ? "Khóa học AI và Machine Learning" : "AI and Machine Learning courses";
              break;
            case 'web':
            case 'react':
              specificPath = "/web-development";
              courseName = isVietnamese ? "Khóa học Phát triển Web" : "Web Development courses";
              break;
            case 'design':
            case 'ux':
            case 'ui':
              specificPath = "/ux-ui-design";
              courseName = isVietnamese ? "Khóa học Thiết kế UX/UI" : "UX/UI Design courses";
              break;
            case 'science':
            case 'physics':
            case 'mathematics':
              specificPath = "/science-courses";
              courseName = isVietnamese ? "Khóa học Khoa học" : "Science courses";
              break;
            case 'mobile':
              specificPath = "/mobile-development";
              courseName = isVietnamese ? "Khóa học Phát triển Mobile" : "Mobile Development courses";
              break;
            case 'python':
              specificPath = "/python-programming";
              courseName = isVietnamese ? "Khóa học Python" : "Python Programming courses";
              break;
            case 'business':
              specificPath = "/business-courses";
              courseName = isVietnamese ? "Khóa học Kinh doanh" : "Business courses";
              break;
            default:
              specificPath = "/all-courses";
              courseName = isVietnamese ? "tất cả khóa học" : "all courses";
          }
        }
        
        const registrationUrl = baseUrl + specificPath;
        
        if (isVietnamese) {
          let response = "";
          
          // More conversational Vietnamese responses with variations
          if (courseType) {
            const registrationPhrases = [
              `Bạn có thể đăng ký ${courseName} tại đây: ${registrationUrl}`,
              `Đường link đăng ký cho ${courseName} là: ${registrationUrl}`,
              `Để đăng ký ${courseName}, vui lòng truy cập: ${registrationUrl}`,
              `Link đăng ký ${courseName}: ${registrationUrl}`
            ];
            
            // Choose a random phrase for variation
            response = registrationPhrases[Math.floor(Math.random() * registrationPhrases.length)];
            
            if (courseType === 'ai' || courseType === 'machine learning') {
              response += `\n\nKhóa học AI của chúng tôi bao gồm:
              
1. Machine Learning Fundamentals: Khóa học cơ bản về ML cho người mới bắt đầu
2. Deep Learning with PyTorch: Khám phá mạng neural sâu và ứng dụng
3. Natural Language Processing: Xử lý ngôn ngữ tự nhiên với AI
4. Data Science and Analytics: Phân tích và trực quan hóa dữ liệu

Sau khi đăng ký, bạn sẽ nhận được thông tin đăng nhập và hướng dẫn chi tiết qua email.`;
            } else if (courseType === 'web' || courseType === 'react') {
              response += `\n\nKhóa học Phát triển Web của chúng tôi bao gồm:
              
1. Web Development with React: Phát triển frontend hiện đại với React
2. Full-Stack JavaScript Development: Phát triển cả frontend và backend
3. Responsive Web Design: Thiết kế website thích ứng với mọi thiết bị
4. Modern Frontend Development: Công nghệ và kỹ thuật frontend mới nhất

Sau khi đăng ký, bạn sẽ được cung cấp lộ trình học tập phù hợp với trình độ của bạn.`;
            } else if (courseType === 'design' || courseType === 'ux' || courseType === 'ui') {
              response += `\n\nKhóa học Thiết kế UX/UI của chúng tôi bao gồm:
              
1. UX/UI Design Principles: Nguyên tắc thiết kế giao diện người dùng
2. Graphic Design Masterclass: Kỹ thuật thiết kế đồ họa chuyên nghiệp
3. Design Systems for Developers: Xây dựng hệ thống thiết kế cho sản phẩm
4. User Research Methods: Phương pháp nghiên cứu người dùng

Khóa học của chúng tôi kết hợp lý thuyết và thực hành giúp bạn xây dựng portfolio thiết kế chuyên nghiệp.`;
            }
          } else {
            // Generic registration response
            response = `Bạn có thể đăng ký khóa học tại đường link chính của chúng tôi: ${registrationUrl}\n\nTại đây, bạn có thể xem tất cả các khóa học và chọn lựa phù hợp với sở thích và mục tiêu của mình. Sau khi đăng ký, bạn sẽ nhận được email hướng dẫn các bước tiếp theo.`;
          }
          
          return response;
        } else {
          // English responses with variations
          let response = "";
          
          if (courseType) {
            const registrationPhrases = [
              `You can register for ${courseName} here: ${registrationUrl}`,
              `The registration link for ${courseName} is: ${registrationUrl}`,
              `To register for ${courseName}, please visit: ${registrationUrl}`,
              `Registration link for ${courseName}: ${registrationUrl}`
            ];
            
            // Choose a random phrase for variation
            response = registrationPhrases[Math.floor(Math.random() * registrationPhrases.length)];
            
            if (courseType === 'ai' || courseType === 'machine learning') {
              response += `\n\nOur AI courses include:
              
1. Machine Learning Fundamentals: Basic ML course for beginners
2. Deep Learning with PyTorch: Explore deep neural networks and applications
3. Natural Language Processing: Natural language processing with AI
4. Data Science and Analytics: Data analysis and visualization

After registration, you will receive login information and detailed instructions via email.`;
            } else if (courseType === 'web' || courseType === 'react') {
              response += `\n\nOur Web Development courses include:
              
1. Web Development with React: Modern frontend development with React
2. Full-Stack JavaScript Development: Both frontend and backend development
3. Responsive Web Design: Design websites that adapt to any device
4. Modern Frontend Development: Latest frontend technologies and techniques

After registration, you'll be provided with a learning path appropriate for your skill level.`;
            } else if (courseType === 'design' || courseType === 'ux' || courseType === 'ui') {
              response += `\n\nOur UX/UI Design courses include:
              
1. UX/UI Design Principles: User interface design principles
2. Graphic Design Masterclass: Professional graphic design techniques
3. Design Systems for Developers: Building design systems for products
4. User Research Methods: User research methodologies

Our courses combine theory and practice to help you build a professional design portfolio.`;
            }
          } else {
            // Generic registration response
            response = `You can register for courses at our main registration page: ${registrationUrl}\n\nThere, you can view all available courses and select the ones that match your interests and goals. After registration, you will receive an email with instructions on next steps.`;
          }
          
          return response;
        }
      }
      
      // Identity query intent - Personalized assistant introduction
      if (intentClassification.primaryIntent === 'identity_query') {
        // Check if this is in Vietnamese
        if (isVietnamese) {
          const identityResponses = [
            `Tôi là trợ lý học tập AI của nền tảng học trực tuyến này. Tôi được thiết kế để giúp bạn tìm kiếm thông tin về các khóa học, trả lời các câu hỏi và hỗ trợ hành trình học tập của bạn.`,
            `Xin chào! Tôi là chatbot AI của nền tảng học tập này. Nhiệm vụ của tôi là giúp bạn khám phá các khóa học phù hợp, giải đáp thắc mắc và hướng dẫn bạn trên hành trình học tập.`,
            `Tôi là trợ lý ảo được tạo ra để hỗ trợ người dùng trên nền tảng học tập của chúng tôi. Tôi có thể giúp bạn tìm hiểu về các khóa học, đăng ký và trả lời các câu hỏi về nội dung học tập.`
          ];
          
          // Randomly select a response for variety
          return identityResponses[Math.floor(Math.random() * identityResponses.length)] + `\n\nBạn có thể hỏi tôi về các khóa học, cách đăng ký, hoặc chủ đề bạn quan tâm để học. Tôi sẽ cố gắng hỗ trợ bạn tốt nhất!`;
        } else {
          const identityResponses = [
            `I'm an AI learning assistant for this educational platform. I'm designed to help you find information about courses, answer questions, and support your learning journey.`,
            `Hello! I'm the AI chatbot for this learning platform. My job is to help you discover suitable courses, answer your questions, and guide you on your educational path.`,
            `I'm a virtual assistant created to help users on our learning platform. I can help you learn about courses, register, and answer questions about learning content.`
          ];
          
          // Randomly select a response for variety
          return identityResponses[Math.floor(Math.random() * identityResponses.length)] + `\n\nYou can ask me about courses, how to register, or topics you're interested in learning. I'll do my best to assist you!`;
        }
      }
      
      // Pricing and payment intent
      if (intentClassification.primaryIntent === 'pricing_payment') {
        if (isVietnamese) {
          return `Chúng tôi cung cấp nhiều gói học phí khác nhau phù hợp với nhu cầu của bạn:

1. Gói Free: Truy cập giới hạn vào các bài học cơ bản
2. Gói Standard: $25/tháng - Truy cập đầy đủ các khóa học và bài tập thực hành
3. Gói Premium: $45/tháng - Bao gồm tất cả tính năng Standard, cộng thêm buổi tư vấn 1-1 và chứng chỉ hoàn thành
4. Gói Enterprise: Giá linh hoạt - Giải pháp đào tạo cho doanh nghiệp

Chúng tôi cũng cung cấp các khóa học riêng lẻ với giá từ $40-120 tùy vào độ phức tạp và thời lượng.

Thanh toán có thể thực hiện qua thẻ tín dụng, PayPal, hoặc chuyển khoản ngân hàng. Ngoài ra, chúng tôi cũng có chương trình giảm giá 20% cho học sinh, sinh viên và giảm 15% khi đăng ký theo nhóm từ 3 người trở lên.`;
        } else {
          return `We offer various pricing plans to suit your needs:

1. Free Plan: Limited access to basic lessons
2. Standard Plan: $25/month - Full access to courses and practical exercises
3. Premium Plan: $45/month - Includes all Standard features, plus 1-on-1 consultation and completion certificates
4. Enterprise Plan: Flexible pricing - Training solutions for businesses

We also offer individual courses ranging from $40-120 depending on complexity and duration.

Payments can be made via credit card, PayPal, or bank transfer. Additionally, we offer a 20% discount for students and a 15% discount for group registrations of 3 or more people.`;
        }
      }
      
      // Technical support intent
      if (intentClassification.primaryIntent === 'technical_support') {
        if (isVietnamese) {
          return `Rất tiếc khi bạn gặp vấn đề kỹ thuật. Đây là một số cách để nhận hỗ trợ:

1. Truy cập trung tâm trợ giúp của chúng tôi tại: https://learning.example.com/help
2. Liên hệ đội ngũ hỗ trợ kỹ thuật qua email: support@learning.example.com
3. Gọi đường dây nóng hỗ trợ: 1900-1234 (7h-22h hàng ngày)

Đối với các vấn đề phổ biến như đăng nhập, phát video, hoặc nộp bài tập, bạn có thể tìm thấy hướng dẫn khắc phục tại: https://learning.example.com/troubleshooting

Đội ngũ hỗ trợ của chúng tôi sẽ phản hồi trong vòng 24 giờ để giúp bạn giải quyết vấn đề.`;
        } else {
          return `I'm sorry you're experiencing technical issues. Here are some ways to get support:

1. Visit our help center at: https://learning.example.com/help
2. Contact our technical support team via email: support@learning.example.com
3. Call our support hotline: 1-800-123-4567 (7am-10pm daily)

For common issues like login problems, video playback, or assignment submission, you can find troubleshooting guides at: https://learning.example.com/troubleshooting

Our support team will respond within 24 hours to help resolve your issue.`;
        }
      }
      
      // AI improvement intent
      if (intentClassification.primaryIntent === 'improve_ai') {
        if (isVietnamese) {
          return `Để cải thiện trí thông minh và tự nhiên của chatbot AI, bạn nên:

1. Cải thiện mô hình ngôn ngữ:
   - Sử dụng mô hình lớn như GPT-4, Claude, hoặc PaLM
   - Fine-tune mô hình với dữ liệu tập trung vào lĩnh vực của bạn
   - Áp dụng kỹ thuật RLHF (Reinforcement Learning from Human Feedback)

2. Nâng cao xử lý ngữ cảnh:
   - Phát triển hệ thống phân loại ý định (intent classification)
   - Theo dõi trạng thái hội thoại để duy trì mạch nói
   - Tích hợp bộ nhớ ngắn và dài hạn

3. Cải thiện phản hồi:
   - Thực hiện Knowledge Retrieval Augmentation kết nối với cơ sở dữ liệu
   - Tạo các mẫu phản hồi đặc biệt cho các chủ đề phổ biến
   - Tích hợp công cụ tạo ngôn ngữ đa mô hình

4. Đánh giá và cải tiến liên tục:
   - Thu thập phản hồi từ người dùng
   - Đánh giá chất lượng hội thoại bằng các chỉ số khách quan
   - Cập nhật mô hình dựa trên lỗi phổ biến

Đối với hệ thống của bạn, tôi khuyên nên tập trung vào việc cải thiện xử lý ngữ cảnh và phân loại ý định để tạo phản hồi phù hợp hơn với người dùng.`;
        } else {
          return `To improve your AI chatbot's intelligence and natural responses, you should:

1. Enhance the language model:
   - Use large models like GPT-4, Claude, or PaLM
   - Fine-tune the model with domain-specific data
   - Apply RLHF (Reinforcement Learning from Human Feedback)

2. Improve context handling:
   - Develop advanced intent classification systems
   - Track conversation state to maintain coherence
   - Implement short and long-term memory

3. Enhance responses:
   - Implement Knowledge Retrieval Augmentation to connect with databases
   - Create special response templates for common topics
   - Integrate multi-modal language generation tools

4. Evaluate and continuously improve:
   - Collect user feedback
   - Evaluate conversation quality using objective metrics
   - Update your model based on common errors

For your system specifically, I recommend focusing on improving context handling and intent classification to create more relevant responses for users.`;
        }
      }
      
      // Platform information intent
      if (intentClassification.primaryIntent === 'get_platform_info') {
        if (isVietnamese) {
          return `Nền tảng học tập của chúng tôi là một hệ thống e-learning toàn diện cung cấp các khóa học trong nhiều lĩnh vực khác nhau:

1. Các tính năng chính:
   - Thư viện khóa học đa dạng với video bài giảng chất lượng cao
   - Hệ thống theo dõi tiến độ học tập cá nhân
   - Thẻ ghi nhớ giúp học và ôn tập hiệu quả
   - Họp trực tuyến với giảng viên và cố vấn học tập
   - Nộp bài tập và nhận đánh giá
   - Gợi ý khóa học dựa trên sở thích và mục tiêu cá nhân
   - Cộng đồng học tập trực tuyến để trao đổi và hỗ trợ

2. Danh mục khóa học:
   - Lập trình & Phát triển: React, Angular, Flutter, Node.js, Python
   - AI & Khoa học dữ liệu: Machine Learning, Deep Learning, Data Analytics
   - Thiết kế: UX/UI Design, Graphic Design, Web Design
   - Kinh doanh: Digital Marketing, Khởi nghiệp, Quản lý dự án
   - Khoa học: Khoa học dữ liệu, Vật lý, Sinh học, Toán học

Bạn có thể tương tác với hệ thống qua máy tính hoặc ứng dụng di động, truy cập bài học mọi lúc mọi nơi và nhận được hỗ trợ cá nhân hóa cho hành trình học tập của mình.

Bạn quan tâm đến lĩnh vực học tập nào? Tôi có thể giới thiệu chi tiết hơn về các khóa học phù hợp.`;
        } else {
          return `Our learning platform is a comprehensive e-learning system offering courses across multiple disciplines:

1. Key Features:
   - Diverse course library with high-quality video lectures
   - Personal learning progress tracking
   - Flashcards for efficient learning and revision
   - Virtual meetings with instructors and learning advisors
   - Assignment submission and feedback
   - Course recommendations based on interests and goals
   - Online learning community for exchange and support

2. Course Categories:
   - Programming & Development: React, Angular, Flutter, Node.js, Python
   - AI & Data Science: Machine Learning, Deep Learning, Data Analytics
   - Design: UX/UI Design, Graphic Design, Web Design
   - Business: Digital Marketing, Entrepreneurship, Project Management
   - Science: Data Science, Physics, Biology, Mathematics

You can interact with the system via desktop or mobile app, access lessons anytime, anywhere, and receive personalized support for your learning journey.

What learning area interests you most? I can provide more detailed information about relevant courses.`;
        }
      }
      
      // Course recommendation intent with context-specific responses
      if (intentClassification.primaryIntent === 'get_course_recommendations') {
        // Check if there's a specific course type mentioned
        if (intentClassification.entities['course_type']) {
          const courseType = intentClassification.entities['course_type'];
          
          // Build a contextually appropriate response based on the course type
          let response = '';
          
          switch (courseType) {
            case 'web':
            case 'react':
              response = isVietnamese
                ? "Đối với phát triển web, chúng tôi cung cấp các khóa học sau:\n\n- Web Development with React: Khóa học toàn diện về React, bao gồm JavaScript ES6, component architecture, và state management.\n- Full-Stack JavaScript Development: Học cả frontend và backend với Node.js và React.\n- Responsive Web Design: Thiết kế website thích ứng trên mọi thiết bị.\n\nKhóa học Web Development with React rất phù hợp cho người mới bắt đầu và bao gồm các dự án thực tế để xây dựng portfolio."
                : "For web development, we offer the following courses:\n\n- Web Development with React: A comprehensive course on React, covering JavaScript ES6, component architecture, and state management.\n- Full-Stack JavaScript Development: Learn both frontend and backend with Node.js and React.\n- Responsive Web Design: Design websites that adapt to any device.\n\nThe Web Development with React course is perfect for beginners and includes practical projects to build your portfolio.";
              break;
            case 'ai':
            case 'machine learning':
              response = isVietnamese
                ? "Về AI và Machine Learning, chúng tôi cung cấp các khóa học sau:\n\n- Machine Learning Fundamentals: Khóa học cơ bản về ML, bao gồm các thuật toán học có giám sát và không giám sát.\n- Deep Learning with PyTorch: Học sâu về neural networks và ứng dụng thực tế.\n- Natural Language Processing: Xử lý ngôn ngữ tự nhiên và các ứng dụng AI.\n- Data Science and Analytics: Phân tích dữ liệu và trực quan hóa.\n\nKhóa học Machine Learning Fundamentals phù hợp cho người mới bắt đầu và không yêu cầu kiến thức chuyên sâu về toán học."
                : "For AI and Machine Learning, we offer the following courses:\n\n- Machine Learning Fundamentals: A foundational ML course covering supervised and unsupervised learning algorithms.\n- Deep Learning with PyTorch: In-depth study of neural networks and practical applications.\n- Natural Language Processing: Natural language processing and AI applications.\n- Data Science and Analytics: Data analysis and visualization.\n\nThe Machine Learning Fundamentals course is suitable for beginners and doesn't require advanced mathematical knowledge.";
              break;
            case 'design':
            case 'ux':
            case 'ui':
              response = isVietnamese
                ? "Về thiết kế UX/UI, chúng tôi cung cấp các khóa học sau:\n\n- UX/UI Design Principles: Nguyên tắc thiết kế giao diện và trải nghiệm người dùng.\n- Graphic Design Masterclass: Kỹ thuật thiết kế đồ họa chuyên nghiệp.\n- Design Systems for Developers: Xây dựng hệ thống thiết kế cho sản phẩm.\n- User Research Methods: Phương pháp nghiên cứu người dùng.\n- UI Prototyping with Figma: Tạo prototype giao diện với Figma.\n\nKhóa học UX/UI Design Principles giúp bạn hiểu về quy trình thiết kế, tâm lý người dùng, và các nguyên tắc thiết kế hiện đại."
                : "For UX/UI design, we offer the following courses:\n\n- UX/UI Design Principles: User interface and experience design principles.\n- Graphic Design Masterclass: Professional graphic design techniques.\n- Design Systems for Developers: Building design systems for products.\n- User Research Methods: User research methodologies.\n- UI Prototyping with Figma: Creating interface prototypes with Figma.\n\nThe UX/UI Design Principles course helps you understand the design process, user psychology, and modern design principles.";
              break;
            case 'science':
            case 'physics':
            case 'mathematics':
              response = isVietnamese
                ? "Về khoa học, chúng tôi cung cấp các khóa học sau:\n\n- Introduction to Data Science: Khoa học dữ liệu cơ bản với Python.\n- Physics for Engineers: Vật lý ứng dụng cho kỹ sư và nhà phát triển.\n- Biology and Genetics Fundamentals: Cơ bản về sinh học và di truyền học.\n- Mathematics for Machine Learning: Toán học cần thiết cho machine learning.\n\nKhóa học Introduction to Data Science rất phù hợp cho người mới bắt đầu quan tâm đến phân tích dữ liệu và machine learning."
                : "For science courses, we offer the following:\n\n- Introduction to Data Science: Basic data science with Python.\n- Physics for Engineers: Applied physics for engineers and developers.\n- Biology and Genetics Fundamentals: Basics of biology and genetics.\n- Mathematics for Machine Learning: Essential mathematics for machine learning.\n\nThe Introduction to Data Science course is perfect for beginners interested in data analysis and machine learning.";
              break;
            default:
              // Use the standard course recommendation function
              return detectAndSuggestRedirection(message, history) || generateCourseRecommendations(userId || '');
          }
          
          return response;
        }
      }
    }
    
    // Process with the existing flow for other intents or lower confidence
    // Check for redirect suggestion
    const redirectSuggestion = detectAndSuggestRedirection(message, history);
    if (redirectSuggestion) {
      console.log('Đề xuất chuyển hướng cuộc trò chuyện');
      return redirectSuggestion;
    }
    
    // Check if this is a course recommendation request
    if (courseRequestPattern.test(message)) {
      console.log('Detected course recommendation request, using course recommender');
      return await getRecommendations(message);
    }

    // Phân tích và cập nhật mối quan tâm của người dùng nếu có userId
    if (userId) {
      const interests = analyzeUserInterests(userId, [...history, { role: 'user', content: message }]);
      console.log(`User ${userId} interests:`, interests);
    }

    // Check if DeepSeek API key is set
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.trim() === '') {
      console.warn('DeepSeek API key not set, using simple AI fallback');
      return generateSimpleResponse(message);
    }

    // Format conversation history for the model with enhanced context
    const formattedMessages = formatConversationHistory(history, message, userId);
    
    // Add intent classification as additional context
    formattedMessages.push({
      role: 'system',
      content: `Current user intent: ${intentClassification.primaryIntent} (confidence: ${intentClassification.confidence.toFixed(2)}). 
      Context topics: ${intentClassification.context.join(', ') || 'general'}.
      ${intentClassification.entities['course_type'] ? `The user is specifically interested in: ${intentClassification.entities['course_type']}` : ''}`
    });
    
    try {
      // Call DeepSeek API with enhanced context
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 5000, // Increased for more detailed responses
          top_p: 0.95
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract response from DeepSeek
      const aiResponse = response.data.choices[0]?.message?.content || '';
      return aiResponse || 'Sorry, I couldn\'t generate a response.';
      
    } catch (error: any) {
      console.error('Error calling DeepSeek API:', error.message || 'No error message');
      if (error.response) {
        console.error('API response error:', error.response.data || 'No response data');
      }
      
      // Advanced fallback: Check if we have a specific context to generate a response
      if (intentClassification.confidence > 0.4) {
        // Generate contextual fallback response based on intent
        const isVietnamese = detectVietnamese(message);
        
        if (intentClassification.primaryIntent === 'get_course_recommendations') {
          return isVietnamese 
            ? "Tôi đề xuất một số khóa học phổ biến của chúng tôi: Web Development with React, Machine Learning Fundamentals, và UX/UI Design Principles. Bạn quan tâm đến lĩnh vực nào nhất?" 
            : "I recommend some of our popular courses: Web Development with React, Machine Learning Fundamentals, and UX/UI Design Principles. Which area interests you the most?";
        } else if (intentClassification.primaryIntent === 'greeting') {
          return isVietnamese
            ? "Xin chào! Tôi có thể giúp gì cho bạn hôm nay? Bạn quan tâm đến khóa học nào trên nền tảng của chúng tôi?"
            : "Hello! How can I help you today? Are you interested in any specific courses on our platform?";
        } else if (intentClassification.primaryIntent === 'get_registration_link') {
          return isVietnamese
            ? "Bạn có thể đăng ký khóa học tại đường link: https://learning.example.com/register. Sau khi đăng ký, bạn sẽ nhận được email hướng dẫn chi tiết."
            : "You can register for courses at this link: https://learning.example.com/register. After registration, you will receive detailed instructions via email.";
        }
      }
      
      // For API errors, fall back to simpleAI
      return generateSimpleResponse(message);
    }
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    // Sử dụng DeepSeek API thay vì simpleAI khi có lỗi
    console.log('Falling back to DeepSeek API with simplified prompt');
    
    try {
      // Tạo simplified system prompt cho trường hợp fallback
      const fallbackPrompt = `Bạn là trợ lý AI trên nền tảng học tập. Hãy trả lời câu hỏi của người dùng một cách ngắn gọn, tự nhiên và hữu ích. Tập trung vào việc hỗ trợ học tập.`;
      
      // Tạo messages đơn giản
      const fallbackMessages = [
        { role: 'system', content: fallbackPrompt },
        { role: 'user', content: message }
      ];
      
      // Gọi DeepSeek API với cấu hình đơn giản
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: fallbackMessages,
          temperature: 0.7,
          max_tokens: 5000,
          top_p: 0.95
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const fallbackResponse = response.data.choices[0]?.message?.content;
      if (fallbackResponse) {
        return fallbackResponse;
      }
    } catch (fallbackError) {
      console.error('Error with DeepSeek fallback:', fallbackError);
      // Final fallback to simpleAI if DeepSeek also fails
    }
    
    // Use simple AI as last resort
    console.log('Falling back to simple AI response system');
    return generateSimpleResponse(message);
  }
};

/**
 * Tạo gợi ý khóa học cho người dùng dựa trên mối quan tâm
 * @param userId ID của người dùng
 * @returns Văn bản gợi ý khóa học
 */
export const generateCourseRecommendations = (userId: string): string => {
  // Kiểm tra nếu đã phân tích mối quan tâm cho người dùng này
  if (!userInterestsCache.has(userId)) {
    // Trả về gợi ý mặc định với nhiều khóa học hơn và thông tin chi tiết hơn
    return `Dựa trên phân tích, tôi đề xuất các khóa học sau:

- Web Development with React: Khóa học toàn diện về React, bao gồm JavaScript ES6, Redux và xây dựng SPA.
- Machine Learning Fundamentals: Phù hợp cho người mới bắt đầu với AI, bao gồm các thuật toán cơ bản và ứng dụng thực tế.
- Introduction to Data Science: Khóa học khám phá phân tích dữ liệu với Python, visualization và thống kê cơ bản.
- UX/UI Design Principles: Học thiết kế giao diện người dùng hiệu quả và tạo trải nghiệm người dùng tuyệt vời.

Bạn quan tâm đến khóa học nào nhất?`;
  }
  
  const interests = userInterestsCache.get(userId)!;
  const suggestedCourses = suggestCoursesBasedOnInterests(userId, interests);
  
  // Tạo văn bản gợi ý với thông tin chi tiết hơn về mỗi khóa học
  let recommendations = '';
  suggestedCourses.forEach(course => {
    // Thêm thông tin chi tiết về khóa học
    let courseBrief = '';
    if (course.includes('React')) {
      courseBrief = ': Học xây dựng giao diện phong phú với React hooks, router và state management';
    } else if (course.includes('Machine Learning')) {
      courseBrief = ': Khám phá các thuật toán ML, mô hình dự đoán và kỹ thuật xử lý dữ liệu';
    } else if (course.includes('Data Science')) {
      courseBrief = ': Phân tích dữ liệu với Python, pandas và scikit-learn';
    } else if (course.includes('Design')) {
      courseBrief = ': Nguyên tắc thiết kế, wireframing và tạo prototype';
    } else if (course.includes('Physics')) {
      courseBrief = ': Cơ học, điện từ học và các ứng dụng kỹ thuật';
    } else if (course.includes('Genetics')) {
      courseBrief = ': Di truyền học cơ bản, tế bào học và sinh học phân tử';
    } else if (course.includes('Mathematics')) {
      courseBrief = ': Đại số tuyến tính, giải tích và xác suất thống kê cho ML';
    } else {
      courseBrief = '';
    }
    
    recommendations += `- ${course}${courseBrief}\n`;
  });
  
  // Lấy danh mục được đề xuất
  const topCategory = getTopCategory(interests);
  
  // Tạo văn bản giới thiệu dựa trên danh mục
  let intro: string;
  switch (topCategory) {
    case 'programming':
      intro = "Dựa trên cuộc trò chuyện của chúng ta, tôi thấy bạn quan tâm đến lập trình và phát triển phần mềm. Dưới đây là các khóa học tốt nhất về chủ đề này:";
      break;
    case 'ai':
      intro = "Tôi nhận thấy bạn quan tâm đến AI và khoa học dữ liệu. Đây là những khóa học hàng đầu của chúng tôi trong lĩnh vực này:";
      break;
    case 'design':
      intro = "Dựa trên sở thích của bạn về thiết kế, tôi nghĩ những khóa học sau sẽ phù hợp với bạn:";
      break;
    case 'business':
      intro = "Với sự quan tâm của bạn đến kinh doanh và marketing, tôi đề xuất những khóa học sau:";
      break;
    case 'science':
      intro = "Tôi thấy bạn đặc biệt quan tâm đến khoa học. Đây là những khóa học khoa học tốt nhất của chúng tôi:";
      break;
    default:
      intro = "Dựa trên những gì chúng ta đã thảo luận, tôi nghĩ bạn có thể quan tâm đến các khóa học sau đây:";
  }
  
  return `${intro}\n\n${recommendations}\nBạn có muốn tìm hiểu thêm về khóa học nào không?`;
};

/**
 * Lấy danh mục hàng đầu từ mối quan tâm
 */
function getTopCategory(interests: UserInterests): string {
  let topCategory = 'programming';
  let maxScore = interests.programming;
  
  for (const [category, score] of Object.entries(interests)) {
    if (category !== 'lastAnalyzed' && score > maxScore) {
      topCategory = category;
      maxScore = score as number;
    }
  }
  
  return topCategory;
} 