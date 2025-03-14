/**
 * Enhanced rule-based AI system for educational responses in both English and Vietnamese
 */
import { getRecommendations } from './courseRecommender';

interface SimpleRule {
  keywords: string[];
  keywordsVi: string[];
  responses: string[];
  responsesVi: string[];
}

// Simplified pattern to detect course recommendation requests
// Now matches simpler queries like "học về AI" or "tôi muốn học web"
const courseRequestPattern = /(khóa học|course|learn|học|recommend|đề xuất|gợi ý|suggest|tìm kiếm|search|find|về|về về|muốn học|want to learn).*(AI|artificial intelligence|trí tuệ nhân tạo|machine learning|học máy|deep learning|web|design|thiết kế|business|kinh doanh|software|phần mềm|lập trình|development|code|programming|react|native|mobile|app|ứng dụng|di động|flutter|ios|android)/i;

// Special case pattern for mobile app related queries
const mobileAppPattern = /(mobile|app|ứng dụng|di động|điện thoại|phone|smartphone|react native|flutter|ios|android)/i;

// Từng chủ đề và câu trả lời phù hợp
const rules: SimpleRule[] = [
  // Programming & mobile app development
  {
    keywords: ['programming', 'code', 'developer', 'web development', 'mobile app', 'app development', 'software'],
    keywordsVi: ['lập trình', 'code', 'phát triển', 'phần mềm', 'mobile', 'ứng dụng', 'app', 'react', 'react native'],
    responses: [
      "Our programming courses cover a range of technologies from web development to mobile apps. Web Development with React is one of our most popular courses that teaches modern front-end development practices.",
      "Programming fundamentals are essential for any developer. Our courses provide hands-on experience with real-world projects to help you build a strong portfolio.",
      "Mobile app development requires knowledge of specific frameworks. React Native and Flutter are popular choices for cross-platform development, allowing you to build apps for both iOS and Android.",
      "For beginners interested in programming, I recommend starting with our Web Development course which covers HTML, CSS, and JavaScript - the building blocks of modern web applications."
    ],
    responsesVi: [
      "Các khóa học lập trình của chúng tôi bao gồm nhiều công nghệ từ phát triển web đến ứng dụng di động. Phát triển Web với React là một trong những khóa học phổ biến nhất dạy các phương pháp phát triển front-end hiện đại.",
      "Nền tảng lập trình là điều cần thiết cho bất kỳ nhà phát triển nào. Khóa học của chúng tôi cung cấp kinh nghiệm thực hành với các dự án thực tế để giúp bạn xây dựng một portfolio mạnh mẽ.",
      "Phát triển ứng dụng di động đòi hỏi kiến thức về các framework cụ thể. React Native và Flutter là những lựa chọn phổ biến cho phát triển đa nền tảng, cho phép bạn xây dựng ứng dụng cho cả iOS và Android.",
      "Đối với người mới bắt đầu quan tâm đến lập trình, tôi khuyên bạn nên bắt đầu với khóa học Phát triển Web của chúng tôi, bao gồm HTML, CSS và JavaScript - những khối xây dựng của ứng dụng web hiện đại."
    ]
  },
  // AI and machine learning
  {
    keywords: ['AI', 'artificial intelligence', 'machine learning', 'ML', 'deep learning', 'neural network', 'data science'],
    keywordsVi: ['AI', 'trí tuệ nhân tạo', 'học máy', 'machine learning', 'deep learning', 'mạng neural', 'khoa học dữ liệu'],
    responses: [
      "Our Machine Learning Fundamentals course is perfect for beginners in AI. It covers supervised and unsupervised learning techniques, neural networks, and practical model evaluation.",
      "For advanced AI students, we offer Deep Learning with PyTorch which dives into advanced neural network architectures and implementation practices for state-of-the-art AI applications.",
      "AI education requires a solid foundation in mathematics and programming. Our courses ensure you understand the underlying principles while providing practical implementation experience.",
      "Data science and AI go hand in hand. Our courses teach you how to collect, clean, and analyze data to build effective machine learning models for real-world problems."
    ],
    responsesVi: [
      "Khóa học Machine Learning Fundamentals của chúng tôi là lựa chọn hoàn hảo cho người mới bắt đầu về AI. Khóa học bao gồm các kỹ thuật học có giám sát và không giám sát, mạng neural, và đánh giá mô hình thực tế.",
      "Đối với học viên AI nâng cao, chúng tôi cung cấp khóa học Deep Learning với PyTorch, đi sâu vào các kiến trúc mạng neural nâng cao và thực hành triển khai cho các ứng dụng AI hiện đại.",
      "Giáo dục AI đòi hỏi nền tảng vững chắc về toán học và lập trình. Các khóa học của chúng tôi đảm bảo bạn hiểu các nguyên tắc cơ bản đồng thời cung cấp kinh nghiệm triển khai thực tế.",
      "Khoa học dữ liệu và AI đi đôi với nhau. Các khóa học của chúng tôi dạy bạn cách thu thập, làm sạch và phân tích dữ liệu để xây dựng các mô hình machine learning hiệu quả cho các vấn đề thực tế."
    ]
  },
  // Design
  {
    keywords: ['design', 'ui', 'ux', 'user interface', 'user experience', 'graphic'],
    keywordsVi: ['thiết kế', 'ui', 'ux', 'giao diện người dùng', 'trải nghiệm người dùng', 'đồ họa'],
    responses: [
      "Our UX/UI Design Principles course teaches the fundamentals of creating intuitive, engaging digital products that users love.",
      "Good design is about understanding user needs. Our design courses emphasize user research, testing, and iterative design processes.",
      "UI/UX design requires both creative and analytical skills. Our courses balance design theory with practical projects to build your portfolio.",
      "Design systems are essential for modern product development. Our courses teach you how to create cohesive, scalable design components."
    ],
    responsesVi: [
      "Khóa học Nguyên tắc Thiết kế UX/UI của chúng tôi dạy những nguyên tắc cơ bản về việc tạo ra các sản phẩm kỹ thuật số trực quan, hấp dẫn mà người dùng yêu thích.",
      "Thiết kế tốt là về việc hiểu nhu cầu người dùng. Các khóa học thiết kế của chúng tôi nhấn mạnh nghiên cứu người dùng, kiểm thử và quy trình thiết kế lặp đi lặp lại.",
      "Thiết kế UI/UX đòi hỏi cả kỹ năng sáng tạo và phân tích. Các khóa học của chúng tôi cân bằng lý thuyết thiết kế với các dự án thực tế để xây dựng portfolio của bạn.",
      "Hệ thống thiết kế là điều cần thiết cho phát triển sản phẩm hiện đại. Các khóa học của chúng tôi dạy bạn cách tạo ra các thành phần thiết kế liên kết và có khả năng mở rộng."
    ]
  },
  // Business
  {
    keywords: ['business', 'marketing', 'management', 'entrepreneur', 'startup'],
    keywordsVi: ['kinh doanh', 'marketing', 'quản lý', 'khởi nghiệp', 'doanh nhân'],
    responses: [
      "Our Digital Marketing Fundamentals course covers essential strategies for online promotion, SEO, social media marketing, and analytics.",
      "Effective business strategy requires understanding market dynamics. Our courses teach you how to identify opportunities and develop competitive advantage.",
      "Entrepreneurship is about turning ideas into reality. Our business courses provide frameworks for validating concepts and building sustainable ventures.",
      "Modern marketing is data-driven. Our courses emphasize measurable results through analytics, A/B testing, and customer journey optimization."
    ],
    responsesVi: [
      "Khóa học Digital Marketing Fundamentals của chúng tôi bao gồm các chiến lược thiết yếu cho quảng bá trực tuyến, SEO, marketing mạng xã hội và phân tích.",
      "Chiến lược kinh doanh hiệu quả đòi hỏi hiểu biết về động lực thị trường. Các khóa học của chúng tôi dạy bạn cách xác định cơ hội và phát triển lợi thế cạnh tranh.",
      "Khởi nghiệp là về việc biến ý tưởng thành hiện thực. Các khóa học kinh doanh của chúng tôi cung cấp khuôn khổ để xác nhận khái niệm và xây dựng doanh nghiệp bền vững.",
      "Marketing hiện đại dựa trên dữ liệu. Các khóa học của chúng tôi nhấn mạnh kết quả đo lường được thông qua phân tích, thử nghiệm A/B và tối ưu hóa hành trình khách hàng."
    ]
  }
];

// Default responses không phải là câu hỏi mà là thông tin hữu ích
const defaultResponses = [
  "Our learning platform offers a wide range of courses in programming, AI, design, and business. You can browse our catalog to find courses that match your interests and career goals.",
  "We provide both beginner and advanced courses to help you develop new skills. Our most popular courses include Web Development with React, Machine Learning Fundamentals, and UX/UI Design Principles.",
  "Learning is most effective when theory is combined with practice. Our courses include hands-on projects that help you apply what you've learned to real-world scenarios.",
  "Our instructors are industry professionals with years of practical experience. They provide insights from the field and keep course content up to date with the latest trends and technologies."
];

const defaultResponsesVi = [
  "Nền tảng học tập của chúng tôi cung cấp nhiều khóa học về lập trình, AI, thiết kế và kinh doanh. Bạn có thể duyệt qua danh mục để tìm các khóa học phù hợp với sở thích và mục tiêu nghề nghiệp của bạn.",
  "Chúng tôi cung cấp cả khóa học cho người mới bắt đầu và nâng cao để giúp bạn phát triển kỹ năng mới. Các khóa học phổ biến nhất của chúng tôi bao gồm Phát triển Web với React, Cơ bản về Machine Learning và Nguyên tắc Thiết kế UX/UI.",
  "Học tập hiệu quả nhất khi lý thuyết được kết hợp với thực hành. Các khóa học của chúng tôi bao gồm các dự án thực tế giúp bạn áp dụng những gì bạn đã học vào các tình huống thực tế.",
  "Giảng viên của chúng tôi là các chuyên gia trong ngành với nhiều năm kinh nghiệm thực tế. Họ cung cấp cái nhìn sâu sắc từ lĩnh vực và cập nhật nội dung khóa học với xu hướng và công nghệ mới nhất."
];

// Câu trả lời đặc biệt cho các từ khóa cụ thể
const specialResponses: Record<string, Record<string, string>> = {
  'react native': {
    vi: "Hiện tại chúng tôi chưa có khóa học React Native cụ thể, nhưng khóa học Web Development with React của chúng tôi cung cấp nền tảng tốt về React, giúp bạn dễ dàng chuyển sang React Native sau này. Bạn cũng có thể tham khảo khóa học Mobile App Development with Flutter để học về phát triển ứng dụng di động đa nền tảng.",
    en: "Currently we don't have a specific React Native course, but our Web Development with React course provides a solid foundation in React, making it easier to transition to React Native later. You might also be interested in our Mobile App Development with Flutter course to learn about cross-platform mobile app development."
  },
  'training': {
    vi: "Chúng tôi liên tục cải thiện chatbot của mình để cung cấp câu trả lời tốt hơn. Tất cả các khóa học của chúng tôi đều bao gồm hỗ trợ trực tiếp từ giảng viên, diễn đàn thảo luận, và các bài tập thực hành đánh giá tự động để đảm bảo bạn hiểu rõ nội dung.",
    en: "We're constantly improving our chatbot to provide better responses. All our courses include direct instructor support, discussion forums, and automatically graded practical exercises to ensure you understand the material."
  }
};

/**
 * Detect if message is in Vietnamese
 */
function isVietnamese(text: string): boolean {
  // Check for Vietnamese-specific characters or common Vietnamese words
  const vietnamesePatterns = [
    'ă', 'â', 'đ', 'ê', 'ô', 'ơ', 'ư', 'á', 'à', 'ả', 'ã', 'ạ',
    'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'í', 'ì', 'ỉ', 'ĩ', 'ị',
    'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ú', 'ù', 'ủ', 'ũ', 'ụ',
    'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ',
    'tôi', 'bạn', 'của', 'và', 'hoặc', 'không', 'học', 'giúp', 'cần', 'muốn'
  ];
  
  const lowerText = text.toLowerCase();
  return vietnamesePatterns.some(pattern => lowerText.includes(pattern));
}

/**
 * Keep track of previous responses to avoid repetition
 */
const recentResponses: string[] = [];
const MAX_RECENT_RESPONSES = 10; // Tăng lên để tránh lặp lại

// Lưu trữ context cuộc trò chuyện
let conversationContext = {
  lastMentionedTopic: '',
  askedQuestionCount: 0
};

function addToRecentResponses(response: string): void {
  recentResponses.push(response);
  if (recentResponses.length > MAX_RECENT_RESPONSES) {
    recentResponses.shift(); // Remove oldest response
  }
}

function getUniqueResponse(responses: string[]): string {
  // Filter out recently used responses
  const availableResponses = responses.filter(r => !recentResponses.includes(r));
  
  // If all responses have been recently used, reset and use all
  if (availableResponses.length === 0) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Select random response from available ones
  const response = availableResponses[Math.floor(Math.random() * availableResponses.length)];
  addToRecentResponses(response);
  return response;
}

/**
 * Check for special keyword matches
 */
function checkSpecialKeywords(message: string, language: 'vi' | 'en'): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const [keyword, responses] of Object.entries(specialResponses)) {
    if (lowerMessage.includes(keyword)) {
      return language === 'vi' ? responses.vi : responses.en;
    }
  }
  
  return null;
}

/**
 * Generate a simple AI response based on keywords in the message
 * Support both English and Vietnamese
 * @param message The user's message
 * @returns A relevant educational response
 */
export const generateSimpleResponse = async (message: string): Promise<string> => {
  // First check if this is a course recommendation request
  if (courseRequestPattern.test(message) || mobileAppPattern.test(message)) {
    console.log('SimpleAI detected course recommendation request');
    // Không bị ảnh hưởng bởi conversation context
    conversationContext.lastMentionedTopic = '';
    conversationContext.askedQuestionCount = 0;
    
    try {
      return await getRecommendations(message);
    } catch (error) {
      console.error('Error getting course recommendations:', error);
      // Fall back to specific response for mobile app queries if recommendation fails
      if (mobileAppPattern.test(message)) {
        const isVi = isVietnamese(message);
        return isVi
          ? "Hiện tại chúng tôi có hai khóa học phổ biến về phát triển ứng dụng di động: 'Mobile App Development with Flutter' (dành cho người mới bắt đầu) và 'iOS Development with Swift' (trung cấp). Cả hai khóa học đều cung cấp kiến thức thực tế và dự án thực hành để xây dựng ứng dụng di động chất lượng cao."
          : "We currently have two popular mobile app development courses: 'Mobile App Development with Flutter' (for beginners) and 'iOS Development with Swift' (intermediate). Both courses provide practical knowledge and hands-on projects to build high-quality mobile applications.";
      }
      // Fall back to standard responses if recommendation fails
    }
  }
  
  const isVi = isVietnamese(message);
  const lowerMessage = message.toLowerCase();
  
  // Check for special keyword responses first
  const specialResponse = checkSpecialKeywords(message, isVi ? 'vi' : 'en');
  if (specialResponse) {
    console.log('Using special response for specific keyword');
    // Reset context vì đã cung cấp thông tin cụ thể
    conversationContext.lastMentionedTopic = '';
    conversationContext.askedQuestionCount = 0;
    return specialResponse;
  }
  
  // Check if message matches any rules
  for (const rule of rules) {
    // Check appropriate keywords based on language
    const keywordsToCheck = isVi ? rule.keywordsVi : rule.keywords;
    
    for (const keyword of keywordsToCheck) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        // Chúng ta tìm thấy một chủ đề - update context
        conversationContext.lastMentionedTopic = keyword;
        conversationContext.askedQuestionCount = 0; // Reset question counter khi có chủ đề mới
        
        // Return random response from matching rule in appropriate language
        const responsesToUse = isVi ? rule.responsesVi : rule.responses;
        return getUniqueResponse(responsesToUse);
      }
    }
  }
  
  // Nếu người dùng tiếp tục trong cùng một chủ đề, tránh hỏi quá nhiều câu hỏi
  if (conversationContext.lastMentionedTopic && conversationContext.askedQuestionCount > 1) {
    console.log('Too many questions in the same context, providing information instead');
    conversationContext.askedQuestionCount = 0; // Reset counter
    
    // Provide information instead of asking questions
    const infoResponse = isVi 
      ? `Các khóa học của chúng tôi về ${conversationContext.lastMentionedTopic} được thiết kế để cung cấp kiến thức thực tế và kỹ năng có thể áp dụng ngay. Bạn có thể tìm thấy thông tin chi tiết về các khóa học này trên trang chủ của chúng tôi.`
      : `Our courses on ${conversationContext.lastMentionedTopic} are designed to provide practical knowledge and immediately applicable skills. You can find detailed information about these courses on our homepage.`;
    
    return infoResponse;
  }
  
  // If no keywords match, return a default response in appropriate language
  const defaultsToUse = isVi ? defaultResponsesVi : defaultResponses;
  conversationContext.askedQuestionCount++; // Increment question counter
  return getUniqueResponse(defaultsToUse);
}; 