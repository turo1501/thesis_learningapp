import axios from 'axios';
import { generateSimpleResponse } from './simpleAI';
import { getRecommendations } from './courseRecommender';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Simplified pattern to detect course recommendation requests
// Now matches simpler queries like "học về AI" or "tôi muốn học web"
const courseRequestPattern = /(khóa học|course|learn|học|recommend|đề xuất|gợi ý|suggest|tìm kiếm|search|find|về|về về|muốn học|want to learn).*(AI|artificial intelligence|trí tuệ nhân tạo|machine learning|học máy|deep learning|web|design|thiết kế|business|kinh doanh|software|phần mềm|lập trình|development|code|programming)/i;

/**
 * Generates AI response using DeepSeek API
 * @param message User message
 * @param history Previous conversation history
 * @returns AI response as string
 */
export const generateAIResponse = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  try {
    // Check if this is a course recommendation request
    if (courseRequestPattern.test(message)) {
      console.log('Detected course recommendation request, using course recommender');
      return await getRecommendations(message);
    }

    // Check if DeepSeek API key is set
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.trim() === '') {
      console.warn('DeepSeek API key not set, using simple AI fallback');
      return generateSimpleResponse(message);
    }

    // Format conversation history for the model
    const formattedMessages = formatConversationHistory(history, message);
    
    try {
      // Call DeepSeek API
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 500,
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
      // For API errors, fall back to simpleAI
      return generateSimpleResponse(message);
    }
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    // Use simple AI when DeepSeek API fails
    console.log('Falling back to simple AI response system');
    return generateSimpleResponse(message);
  }
};

/**
 * Format conversation history for DeepSeek API format
 */
function formatConversationHistory(history: ChatMessage[], currentMessage: string): any[] {
  const messages = [];
  
  // Add system prompt
  messages.push({
    role: 'system',
    content: "You are an educational assistant helping students with their courses. Provide helpful, concise, and accurate information about academic subjects. If asked about coding or programming, provide code examples when appropriate. Focus on being educational and supportive."
  });
  
  // Add conversation history
  for (const msg of history) {
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