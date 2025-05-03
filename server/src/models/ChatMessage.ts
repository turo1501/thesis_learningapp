import * as dynamoose from 'dynamoose';

const ChatMessageSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    userId: {
      type: String,
      index: {
        name: 'userIdIndex',
        type: 'global'
      },
    },
    content: String,
    role: {
      type: String,
      enum: ['user', 'bot'],
    },
    timestamp: Number,
    feedback: {
      type: Object,
      schema: {
        isPositive: Boolean,
        timestamp: Number,
        comment: String
      },
      required: false
    }
  },
  {
    timestamps: true,
  }
);

export const ChatMessageModel = dynamoose.model('ChatMessage', ChatMessageSchema);

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: number;
  feedback?: {
    isPositive: boolean;
    timestamp: number;
    comment?: string;
  };
} 