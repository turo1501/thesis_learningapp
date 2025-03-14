import { CourseModel } from '../models/Course';

// Cache for course searches to reduce database queries
const courseCache: Record<string, any[]> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
let cacheTimestamp = 0;

/**
 * Enhanced course recommendation system
 * Detects intent and categories from user queries and returns relevant courses
 */

// Expanded categories and their related keywords
const categoryKeywords: Record<string, string[]> = {
  'web development': ['web', 'website', 'frontend', 'front-end', 'front end', 'backend', 'back-end', 'back end', 'fullstack', 'full-stack', 'full stack', 'html', 'css', 'javascript', 'js', 'react', 'vue', 'angular', 'node', 'express', 'php', 'django', 'flask', 'web development', 'web app', 'website development'],
  'mobile development': ['mobile', 'app', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'mobile app', 'app development', 'phone app', 'smartphone app'],
  'data science': ['data', 'data science', 'machine learning', 'ml', 'statistics', 'statistical', 'analytics', 'data analytics', 'big data', 'data processing', 'pandas', 'numpy', 'hadoop', 'spark', 'data mining'],
  'artificial intelligence': ['ai', 'artificial intelligence', 'trí tuệ nhân tạo', 'machine learning', 'ml', 'deep learning', 'neural network', 'neural networks', 'nlp', 'natural language processing', 'computer vision', 'reinforcement learning', 'ai model', 'gpt', 'generative ai'],
  'design': ['design', 'thiết kế', 'ui', 'ux', 'user interface', 'user experience', 'graphics', 'graphic design', 'photoshop', 'illustrator', 'figma', 'sketch', 'adobe', 'visual design', 'product design', 'web design'],
  'business': ['business', 'marketing', 'kinh doanh', 'management', 'quản lý', 'entrepreneur', 'khởi nghiệp', 'startup', 'finance', 'tài chính', 'accounting', 'seo', 'digital marketing', 'e-commerce', 'ecommerce', 'social media marketing'],
  'game development': ['game', 'gaming', 'game development', 'unity', 'unreal', 'game design', 'gamedev', '3d', '2d', 'game programming', 'c#', 'c++', 'game engine'],
  'devops': ['devops', 'deployment', 'cloud', 'aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'ci/cd', 'continuous integration', 'continuous deployment', 'jenkins', 'terraform', 'infrastructure', 'microservices', 'serverless'],
  'cryptocurrency': ['crypto', 'cryptocurrency', 'blockchain', 'bitcoin', 'ethereum', 'smart contract', 'web3', 'defi', 'nft', 'token', 'decentralized', 'distributed ledger', 'mining']
};

// Expanded levels and their related keywords
const levelKeywords: Record<string, string[]> = {
  'beginner': ['beginner', 'newbie', 'starter', 'introduction', 'intro', 'basic', 'fundamental', 'foundation', 'novice', 'starting', 'start', 'cơ bản', 'người mới', 'mới bắt đầu', 'nhập môn', 'first step', 'getting started'],
  'intermediate': ['intermediate', 'mid-level', 'medium', 'middle', 'some experience', 'trung cấp', 'trung bình', 'nâng cao', 'building on'],
  'advanced': ['advanced', 'expert', 'professional', 'proficient', 'experienced', 'specialty', 'specialized', 'cao cấp', 'chuyên sâu', 'chuyên nghiệp', 'master', 'mastery', 'deep dive', 'in-depth']
};

/**
 * Detect the most likely course category from user message
 */
function detectCategory(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // First check for exact mention of a category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    // Check if any category name is mentioned directly
    if (lowerMessage.includes(category.toLowerCase())) {
      return category;
    }
    
    // Check all keywords for this category
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // No category detected
  return null;
}

/**
 * Detect the likely course level from user message
 */
function detectLevel(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const [level, keywords] of Object.entries(levelKeywords)) {
    // Check if level is mentioned directly
    if (lowerMessage.includes(level.toLowerCase())) {
      return level;
    }
    
    // Check all keywords for this level
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return level;
      }
    }
  }
  
  // Default to beginner if no level specified but checking for negations
  if (!lowerMessage.includes('not beginner') && 
      !lowerMessage.includes('not a beginner') && 
      !lowerMessage.includes('không phải người mới')) {
    return 'beginner';
  }
  
  return null;
}

/**
 * Get course recommendations based on user message
 */
export async function getRecommendations(message: string): Promise<string> {
  try {
    // Check if cache needs refreshing
    const now = Date.now();
    if (now - cacheTimestamp > CACHE_TTL) {
      // Clear cache if expired
      for (const key in courseCache) {
        delete courseCache[key];
      }
      cacheTimestamp = now;
    }
    
    // Detect category and level from message
    const category = detectCategory(message);
    const level = detectLevel(message);
    
    console.log(`Detected category: ${category}, level: ${level}`);
    
    // Generate cache key
    const cacheKey = `${category || 'all'}-${level || 'all'}`;
    
    // Check if we have a cached result
    if (courseCache[cacheKey]) {
      console.log('Using cached course results');
      return formatCourseResponse(courseCache[cacheKey], category, level, message);
    }
    
    // Query database based on detected category and level
    let query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    // If we have both category and level
    if (Object.keys(query).length > 0) {
      const courses = await CourseModel.scan(query).exec();
      courseCache[cacheKey] = courses;
      return formatCourseResponse(courses, category, level, message);
    } else {
      // If no specific category/level detected, return general courses
      const courses = await CourseModel.scan().limit(5).exec();
      courseCache[cacheKey] = courses;
      return formatCourseResponse(courses, null, null, message);
    }
  } catch (error) {
    console.error('Error getting course recommendations:', error);
    return "Xin lỗi, tôi không thể tìm kiếm khóa học lúc này. Vui lòng thử lại sau.";
  }
}

/**
 * Format the course response in a user-friendly way
 */
function formatCourseResponse(courses: any[], category: string | null, level: string | null, message: string): string {
  // Helper to detect language
  const isVietnamese = (text: string): boolean => {
    const vietnamesePatterns = ['ă', 'â', 'đ', 'ê', 'ô', 'ơ', 'ư', 'á', 'à', 'tôi', 'bạn', 'của', 'học', 'muốn'];
    return vietnamesePatterns.some(pattern => text.toLowerCase().includes(pattern));
  };
  
  const useVietnamese = isVietnamese(message);
  
  // If no courses found
  if (!courses || courses.length === 0) {
    if (category) {
      return useVietnamese 
        ? `Hiện tại chúng tôi không có khóa học nào về ${category}${level ? ` cho cấp độ ${level}` : ''}. Bạn có thể thử tìm kiếm một chủ đề khác không?`
        : `We currently don't have any courses on ${category}${level ? ` for ${level} level` : ''}. Would you like to try another topic?`;
    }
    
    return useVietnamese
      ? "Xin lỗi, tôi không tìm thấy khóa học nào phù hợp với yêu cầu của bạn. Bạn có thể mô tả rõ hơn về chủ đề bạn quan tâm không?"
      : "Sorry, I couldn't find any courses matching your request. Could you describe the topic you're interested in more clearly?";
  }
  
  // Format courses
  let responsePrefix = '';
  
  if (category && level) {
    responsePrefix = useVietnamese
      ? `Đây là một số khóa học ${level} về ${category} mà tôi tìm thấy:\n\n`
      : `Here are some ${level} courses on ${category} that I found:\n\n`;
  } else if (category) {
    responsePrefix = useVietnamese
      ? `Đây là một số khóa học về ${category} mà tôi tìm thấy:\n\n`
      : `Here are some courses on ${category} that I found:\n\n`;
  } else if (level) {
    responsePrefix = useVietnamese
      ? `Đây là một số khóa học cấp độ ${level} mà tôi tìm thấy:\n\n`
      : `Here are some ${level} level courses that I found:\n\n`;
  } else {
    responsePrefix = useVietnamese
      ? "Đây là một số khóa học phổ biến của chúng tôi:\n\n"
      : "Here are some of our popular courses:\n\n";
  }
  
  let courseList = courses.map((course, index) => {
    return `${index + 1}. ${course.title} (${course.level}) - ${course.description.substring(0, 100)}...`;
  }).join('\n\n');
  
  let responseSuffix = useVietnamese
    ? "\n\nBạn có muốn biết thêm chi tiết về bất kỳ khóa học nào không? Hoặc tôi có thể giúp bạn tìm kiếm khóa học về chủ đề khác?"
    : "\n\nWould you like to know more about any of these courses? Or can I help you find courses on a different topic?";
  
  return responsePrefix + courseList + responseSuffix;
} 