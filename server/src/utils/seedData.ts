import { v4 as uuidv4 } from 'uuid';
import { CourseModel } from '../models/Course';

/**
 * Seed the database with sample courses for testing
 */
export async function seedCourses() {
  // Check if we already have courses in the database
  try {
    const existingCourses = await CourseModel.scan().exec();
    
    if (existingCourses && existingCourses.length > 0) {
      console.log(`Database already contains ${existingCourses.length} courses - skipping seed`);
      return;
    }
    
    // Sample courses data covering different categories and levels
    const coursesData = [
      // Web Development courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher1',
        teacherName: 'John Smith',
        title: 'Web Development with React',
        description: 'Learn modern front-end development with React. Build responsive, interactive UIs with the most popular JavaScript library.',
        category: 'web development',
        image: 'https://example.com/images/react.jpg',
        price: 49.99,
        level: 'beginner',
        status: 'Published'
      },
      {
        courseId: uuidv4(),
        teacherId: 'teacher2',
        teacherName: 'Sarah Johnson',
        title: 'Advanced Full-Stack Development',
        description: 'Master both front-end and back-end development with React, Node.js, and MongoDB. Build complete web applications from scratch.',
        category: 'web development',
        image: 'https://example.com/images/fullstack.jpg',
        price: 79.99,
        level: 'advanced',
        status: 'Published'
      },
      {
        courseId: uuidv4(),
        teacherId: 'teacher3',
        teacherName: 'David Wilson',
        title: 'Backend Development with Node.js',
        description: 'Learn server-side JavaScript development with Node.js and Express. Build RESTful APIs and connect to databases.',
        category: 'web development',
        image: 'https://example.com/images/nodejs.jpg',
        price: 59.99,
        level: 'intermediate',
        status: 'Published'
      },
      
      // Mobile Development courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher4',
        teacherName: 'Emily Chen',
        title: 'Mobile App Development with Flutter',
        description: 'Build beautiful cross-platform mobile apps for iOS and Android with a single codebase using Flutter and Dart.',
        category: 'mobile development',
        image: 'https://example.com/images/flutter.jpg',
        price: 69.99,
        level: 'beginner',
        status: 'Published'
      },
      {
        courseId: uuidv4(),
        teacherId: 'teacher5',
        teacherName: 'Michael Brown',
        title: 'iOS Development with Swift',
        description: 'Learn iOS app development using Swift and Xcode. Build real-world apps and publish them to the App Store.',
        category: 'mobile development',
        image: 'https://example.com/images/swift.jpg',
        price: 74.99,
        level: 'intermediate',
        status: 'Published'
      },
      
      // AI courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher6',
        teacherName: 'Linda Martinez',
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning algorithms and techniques. Learn how to build and evaluate ML models using Python.',
        category: 'artificial intelligence',
        image: 'https://example.com/images/ml.jpg',
        price: 89.99,
        level: 'beginner',
        status: 'Published'
      },
      {
        courseId: uuidv4(),
        teacherId: 'teacher7',
        teacherName: 'Robert Zhang',
        title: 'Deep Learning with PyTorch',
        description: 'Master deep neural networks with PyTorch. Build image recognition, natural language processing, and generative AI systems.',
        category: 'artificial intelligence',
        image: 'https://example.com/images/pytorch.jpg',
        price: 99.99,
        level: 'advanced',
        status: 'Published'
      },
      
      // Design courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher8',
        teacherName: 'Sophia Garcia',
        title: 'UX/UI Design Principles',
        description: 'Learn essential principles of user experience and interface design. Create intuitive, engaging digital products that users love.',
        category: 'design',
        image: 'https://example.com/images/uxui.jpg',
        price: 59.99,
        level: 'beginner',
        status: 'Published'
      },
      
      // Business courses
      {
        courseId: uuidv4(),
        teacherId: 'teacher9',
        teacherName: 'James Wilson',
        title: 'Digital Marketing Fundamentals',
        description: 'Master the essentials of digital marketing including SEO, social media, content marketing, and analytics.',
        category: 'business',
        image: 'https://example.com/images/marketing.jpg',
        price: 49.99,
        level: 'beginner',
        status: 'Published'
      }
    ];
    
    console.log(`Seeding database with ${coursesData.length} sample courses...`);
    
    // Create all courses
    for (const courseData of coursesData) {
      await CourseModel.create(courseData);
    }
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding courses:', error);
  }
} 