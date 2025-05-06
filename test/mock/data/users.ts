import { faker } from '@faker-js/faker';

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// Generate a mock user with specified role
export const generateMockUser = (role = USER_ROLES.STUDENT) => {
  const userId = faker.string.uuid();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    id: userId,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }),
    imageUrl: faker.image.avatar(),
    publicMetadata: {
      userType: role,
    },
    createdAt: faker.date.past().getTime(),
  };
};

// Generate multiple users with specified roles
export const generateMockUsers = (count = 5, role = USER_ROLES.STUDENT) => {
  return Array.from({ length: count }, () => generateMockUser(role));
};

// Create predefined users for consistent testing
export const MOCK_USERS = {
  STUDENT: generateMockUser(USER_ROLES.STUDENT),
  TEACHER: generateMockUser(USER_ROLES.TEACHER),
  ADMIN: generateMockUser(USER_ROLES.ADMIN),
};

// User authentication data
export const USER_AUTH_DATA = {
  STUDENT: {
    userId: MOCK_USERS.STUDENT.id,
    email: MOCK_USERS.STUDENT.email,
    password: 'Password123!',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJzdHVkZW50LXVzZXItaWQiLCJyb2xlIjoic3R1ZGVudCJ9.example',
  },
  TEACHER: {
    userId: MOCK_USERS.TEACHER.id,
    email: MOCK_USERS.TEACHER.email,
    password: 'Password123!',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZWFjaGVyLXVzZXItaWQiLCJyb2xlIjoidGVhY2hlciJ9.example',
  },
  ADMIN: {
    userId: MOCK_USERS.ADMIN.id,
    email: MOCK_USERS.ADMIN.email,
    password: 'Password123!',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi11c2VyLWlkIiwicm9sZSI6ImFkbWluIn0.example',
  },
};