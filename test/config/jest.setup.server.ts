import 'jest-extended';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test file if exists
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockS3 = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({ Location: 'https://test-bucket.s3.amazonaws.com/test-file.jpg' }),
    getSignedUrl: jest.fn().mockReturnValue('https://test-signed-url.com'),
    deleteObject: jest.fn().mockReturnThis(),
  };

  const mockDynamoDB = {
    scan: jest.fn().mockReturnThis(),
    query: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    batchWrite: jest.fn().mockReturnThis(),
    createSet: jest.fn().mockImplementation((arr) => arr),
    promise: jest.fn().mockResolvedValue({ Items: [] }),
  };

  return {
    S3: jest.fn(() => mockS3),
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDynamoDB),
    },
    config: {
      update: jest.fn(),
    },
  };
});

// Mock Clerk
jest.mock('@clerk/express', () => {
  return {
    getAuth: jest.fn(() => () => ({
      sessionId: 'test-session-id',
      userId: 'test-user-id',
    })),
    requireAuth: jest.fn(() => (req: any, res: any, next: () => void) => next()),
    createClerkClient: jest.fn(() => ({
      users: {
        getUser: jest.fn().mockResolvedValue({
          id: 'test-user-id',
          firstName: 'Test',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          imageUrl: 'https://example.com/image.jpg',
          publicMetadata: { userType: 'student' },
        }),
      },
    })),
    ClerkExpressWithAuth: jest.fn(),
  };
});

// Mock dynamoose
jest.mock('dynamoose', () => {
  class MockModel {
    static get = jest.fn().mockResolvedValue({});
    static scan = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    static query = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    static update = jest.fn().mockResolvedValue({});
    static delete = jest.fn().mockResolvedValue({});
    static batchGet = jest.fn().mockResolvedValue([]);
    static batchPut = jest.fn().mockResolvedValue([]);
    static batchDelete = jest.fn().mockResolvedValue([]);
    
    save = jest.fn().mockResolvedValue(this);
  }

  return {
    model: jest.fn(() => MockModel),
    Schema: jest.fn(),
    aws: {
      ddb: {
        local: jest.fn(),
        set: jest.fn(),
      },
    },
  };
});

// Increase timeout for server tests
jest.setTimeout(15000);