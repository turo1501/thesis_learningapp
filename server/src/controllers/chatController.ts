import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateAIResponse } from '../utils/aiService';
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

    // Get chat history for context (last 10 messages)
    let chatHistory: ChatMessage[] = [];
    try {
      const queryResponse = await ChatMessageModel.query('userId').eq(userId)
        .sort('descending')
        .limit(10)
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

    // Generate AI response
    console.log('Generating AI response...');
    const aiResponse = await generateAIResponse(message, formattedHistory);
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