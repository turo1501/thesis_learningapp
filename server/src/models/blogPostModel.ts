import dynamoose from 'dynamoose';

const blogPostSchema = new dynamoose.Schema(
  {
    postId: {
      type: String,
      hashKey: true,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: 'userIndex',
        type: 'global',
      },
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      schema: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
      index: {
        name: 'statusIndex',
        type: 'global',
        rangeKey: 'createdAt'
      }
    },
    moderatedBy: {
      type: String,
    },
    moderationComment: {
      type: String,
    },
    featuredImage: {
      type: String,
    },
    createdAt: {
      type: Number, // Unix timestamp
      required: true,
    },
    updatedAt: {
      type: Number, // Unix timestamp
      required: true,
    },
    publishedAt: {
      type: Number, // Unix timestamp
    },
  },
  {
    timestamps: false, // we'll manage timestamps manually
  }
);

const BlogPostModel = dynamoose.model('BlogPost', blogPostSchema);

export default BlogPostModel; 