import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateAIResponse, generateCourseRecommendations } from '../utils/aiService';
import { ChatMessageModel, ChatMessage } from '../models/ChatMessage';

// Interface matching aiService's ChatMessage
interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      res.status(400).json({ message: 'Message and userId are required' });
      return;
    }

    console.log(`Received message from user ${userId}: "${message}"`);

    // Save user message
    const userMessageId = uuidv4();
    const userMessageData: ChatMessage = {
      id: userMessageId,
      userId,
      content: message,
      role: 'user',
      timestamp: Date.now(),
    };

    try {
      await ChatMessageModel.create(userMessageData);
      console.log(`Saved user message with ID: ${userMessageId}`);
    } catch (dbError) {
      console.error('Error saving user message to database:', dbError);
      // Continue execution even if database save fails
    }

    // Get chat history for context (last 15 messages for better context)
    let chatHistory: ChatMessage[] = [];
    try {
      const queryResponse = await ChatMessageModel.query('userId').eq(userId)
        .sort('descending')
        .limit(15)
        .exec();
      
      // Convert query response to ChatMessage array
      chatHistory = queryResponse as unknown as ChatMessage[];
      console.log(`Retrieved ${chatHistory.length} history messages for context`);
    } catch (historyError) {
      console.error('Error fetching chat history:', historyError);
      // Continue with empty history if retrieval fails
    }

    // Format history for AI
    const formattedHistory: AIChatMessage[] = chatHistory
      .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp ascending
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      } as AIChatMessage));

    // Analyze language to provide better response
    const isVietnamese = detectVietnameseLanguage(message);
    console.log(`Message language is ${isVietnamese ? 'Vietnamese' : 'English'}`);

    // Generate AI response - now passing userId for interest tracking
    console.log('Generating AI response...');
    const aiResponse = await generateAIResponse(message, formattedHistory, userId);
    console.log(`AI response generated (${aiResponse.length} chars)`);

    // Save bot response
    const botMessageId = uuidv4();
    const botMessageData: ChatMessage = {
      id: botMessageId,
      userId,
      content: aiResponse,
      role: 'bot',
      timestamp: Date.now(),
    };

    try {
      await ChatMessageModel.create(botMessageData);
      console.log(`Saved bot response with ID: ${botMessageId}`);
    } catch (dbError) {
      console.error('Error saving bot response to database:', dbError);
      // Continue execution even if database save fails
    }

    // Send response
    res.json({
      id: botMessageId,
      response: aiResponse,
      timestamp: botMessageData.timestamp
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ 
      message: 'Failed to process message',
      id: uuidv4(),
      response: 'I apologize, but I encountered an error processing your request. Please try again later.',
      timestamp: Date.now()
    });
  }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: 'UserId is required' });
      return;
    }

    // Get chat history
    const queryResponse = await ChatMessageModel.query('userId').eq(userId)
      .sort('ascending')
      .exec();
    
    // Convert query response to ChatMessage array
    const chatHistory = queryResponse as unknown as ChatMessage[];

    // Format messages for client
    const messages = chatHistory.map(msg => ({
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp
    }));

    res.json({ messages });
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

/**
 * Add feedback to a chat message
 * @param req Request with messageId, userId, and feedback information
 * @param res Response with success or error message
 */
export const addMessageFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageId, isPositive, comment } = req.body;

    if (!messageId) {
      res.status(400).json({ message: 'MessageId is required' });
      return;
    }

    console.log(`Received feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);

    // Find the message
    try {
      const message = await ChatMessageModel.get(messageId);
      
      if (!message) {
        res.status(404).json({ message: 'Message not found' });
        return;
      }

      // Add feedback to the message
      await ChatMessageModel.update(
        { id: messageId },
        { 
          feedback: {
            isPositive: !!isPositive,
            timestamp: Date.now(),
            comment: comment || ''
          }
        }
      );

      // Log feedback for analysis
      console.log(`Saved feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
      
      // Track feedback metrics for analytics
      const feedbackType = isPositive ? 'positive' : 'negative';
      console.log(`Feedback metrics: ${feedbackType} feedback for message type: ${message.role}`);

      // If negative feedback, store for later analysis and model improvement
      if (!isPositive) {
        // Store content and context for analysis
        console.log(`Negative feedback response: "${message.content.substring(0, 100)}..."`);
        
        // In production, this would be sent to a feedback analytics system
        // to improve the AI model and identify common issues
        try {
          // Get the surrounding conversation context
          const surroundingMessages = await ChatMessageModel.query('userId').eq(message.userId)
            .sort('ascending')
            .exec() as unknown as ChatMessage[];
            
          // Find the index of this message
          const messageIndex = surroundingMessages.findIndex(m => m.id === messageId);
          
          if (messageIndex >= 0) {
            // Get up to 3 messages before this one for context
            const contextStart = Math.max(0, messageIndex - 3);
            const context = surroundingMessages.slice(contextStart, messageIndex)
              .map(m => `${m.role}: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`)
              .join('\n');
              
            console.log(`Negative feedback context:\n${context}`);
          }
        } catch (contextError) {
          console.error('Error getting context for negative feedback:', contextError);
        }
      }

      res.json({ 
        success: true, 
        message: 'Feedback saved successfully'
      });
    } catch (dbError) {
      console.error('Error updating message with feedback:', dbError);
      res.status(500).json({ message: 'Failed to save feedback' });
    }
  } catch (error) {
    console.error('Error in addMessageFeedback:', error);
    res.status(500).json({ message: 'Failed to process feedback' });
  }
};

/**
 * Lấy gợi ý khóa học dựa trên lịch sử chat
 * @param req Request với userId
 * @param res Response với danh sách khóa học được gợi ý
 */
export const getCourseRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({ message: 'UserId is required' });
      return;
    }
    
    // Get chat history for better recommendations
    try {
      const queryResponse = await ChatMessageModel.query('userId').eq(userId)
        .sort('ascending')
        .exec();
      
      const chatHistory = queryResponse as unknown as ChatMessage[];
      
      if (chatHistory.length < 3) {
        // Not enough history for personalized recommendations
        console.log(`Not enough chat history for user ${userId} to generate personalized recommendations`);
        
        // Send generic recommendations
        const recommendations = generateCourseRecommendations(userId);
        
        res.json({
          userId,
          recommendations,
          timestamp: Date.now()
        });
        return;
      }
      
      console.log(`Retrieved ${chatHistory.length} messages for recommendation context`);
      
      // Extract user messages for better recommendations
      const userMessages = chatHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join(' ');
        
      console.log(`User message content for analysis: ${userMessages.substring(0, 200)}...`);
      
      // Get course recommendations based on interest analysis
      const recommendations = generateCourseRecommendations(userId);
      
      res.json({
        userId,
        recommendations,
        timestamp: Date.now()
      });
    } catch (historyError) {
      console.error('Error fetching chat history for recommendations:', historyError);
      // Provide general recommendations instead
      const recommendations = generateCourseRecommendations(userId);
      
      res.json({
        userId,
        recommendations,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('Error generating course recommendations:', error);
    res.status(500).json({ message: 'Failed to generate course recommendations' });
  }
};

/**
 * Detect if text is Vietnamese
 * @param text Text to check
 * @returns true if text is likely Vietnamese
 */
function detectVietnameseLanguage(text: string): boolean {
  // Vietnamese-specific characters
  const vietnamesePatterns = [
    'ă', 'â', 'đ', 'ê', 'ô', 'ơ', 'ư', 'á', 'à', 'ả', 'ã', 'ạ',
    'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'í', 'ì', 'ỉ', 'ĩ', 'ị',
    'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ú', 'ù', 'ủ', 'ũ', 'ụ',
    'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ',
    // Common Vietnamese words
    ' tôi ', ' bạn ', ' của ', ' và ', ' hoặc ', ' không ', ' học ', ' giúp ', ' cần ', ' muốn '
  ];
  
  const lowerText = ' ' + text.toLowerCase() + ' '; // Add spaces for word boundary checks
  return vietnamesePatterns.some(pattern => lowerText.includes(pattern));
} 