import { faker } from '@faker-js/faker';
import { MOCK_USERS } from './users';

// Course difficulty levels
export const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Course categories
export const COURSE_CATEGORIES = [
  'Programming',
  'Data Science',
  'Web Development',
  'Mobile Development',
  'DevOps',
  'Business',
  'Design',
  'Marketing',
  'Languages',
  'Mathematics'
];

// Course statuses
export const COURSE_STATUSES = ['Draft', 'Published'];

// Generate a mock section with chapters
export const generateMockSection = () => {
  const sectionId = faker.string.uuid();
  
  return {
    sectionId,
    sectionTitle: faker.lorem.sentence(),
    sectionDescription: faker.lorem.paragraph(),
    chapters: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => ({
      chapterId: faker.string.uuid(),
      type: faker.helpers.arrayElement(['Text', 'Quiz', 'Video']),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      comments: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
        commentId: faker.string.uuid(),
        userId: faker.string.uuid(),
        text: faker.lorem.paragraph(),
        timestamp: faker.date.recent().toISOString(),
      })),
      video: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.3 }),
    })),
  };
};

// Generate a mock course
export const generateMockCourse = (teacherId = MOCK_USERS.TEACHER.id) => {
  const courseId = faker.string.uuid();
  
  return {
    courseId,
    teacherId,
    teacherName: MOCK_USERS.TEACHER.fullName,
    title: faker.lorem.words({ min: 3, max: 6 }),
    description: faker.lorem.paragraph(),
    category: faker.helpers.arrayElement(COURSE_CATEGORIES),
    image: faker.image.url(),
    price: faker.number.int({ min: 0, max: 199 }),
    level: faker.helpers.arrayElement(COURSE_LEVELS),
    status: faker.helpers.arrayElement(COURSE_STATUSES),
    sections: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, generateMockSection),
    enrollments: Array.from({ length: faker.number.int({ min: 0, max: 50 }) }, () => ({
      userId: faker.string.uuid(),
      status: 'enrolled',
      enrolledAt: faker.date.recent().getTime(),
    })),
    createdAt: faker.date.past().getTime(),
    updatedAt: faker.date.recent().getTime(),
  };
};

// Generate multiple courses
export const generateMockCourses = (count = 10) => {
  return Array.from({ length: count }, () => generateMockCourse());
};

// Create predefined courses for consistent testing
export const MOCK_COURSES = {
  PUBLISHED: {
    ...generateMockCourse(),
    status: 'Published',
  },
  DRAFT: {
    ...generateMockCourse(),
    status: 'Draft',
  },
  BEGINNER: {
    ...generateMockCourse(),
    level: 'Beginner',
    status: 'Published',
  },
  ADVANCED: {
    ...generateMockCourse(),
    level: 'Advanced',
    status: 'Published',
  },
  FREE: {
    ...generateMockCourse(),
    price: 0,
    status: 'Published',
  },
  PREMIUM: {
    ...generateMockCourse(),
    price: 199,
    status: 'Published',
  },
};