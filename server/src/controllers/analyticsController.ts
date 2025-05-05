import { Request, Response } from "express";
import Course from "../models/courseModel";
import BlogPostModel from "../models/blogPostModel";
import Transaction from "../models/transactionModel";
import { clerkClient } from "../index";
import UserCourseProgress from "../models/userCourseProgressModel";

/**
 * Calculate growth percentage between current and previous value
 */
const calculateGrowthPercentage = (currentValue: number, previousValue: number): string => {
  if (previousValue === 0) return "+100%";
  const growthRate = ((currentValue - previousValue) / previousValue) * 100;
  const sign = growthRate >= 0 ? "+" : "";
  return `${sign}${growthRate.toFixed(1)}%`;
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get start date based on time range parameter
 */
const getStartDateFromRange = (timeRange: string): Date => {
  const now = new Date();
  
  switch(timeRange) {
    case '7days':
      return new Date(now.setDate(now.getDate() - 7));
    case '30days':
      return new Date(now.setDate(now.getDate() - 30));
    case '3months':
      return new Date(now.setMonth(now.getMonth() - 3));
    case '6months':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '1year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setMonth(now.getMonth() - 6)); // Default to 6 months
  }
};

/**
 * Generate date sequence between start and end dates
 */
const generateDateSequence = (start: Date, end: Date, format: 'daily' | 'monthly' = 'daily'): string[] => {
  const dates: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    if (format === 'monthly') {
      dates.push(current.toLocaleString('default', { month: 'short', year: 'numeric' }));
      current.setMonth(current.getMonth() + 1);
    } else {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
  }
  
  return dates;
};

/**
 * Get analytics summary data
 */
export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    const startDate = getStartDateFromRange(timeRange);
    
    // Get enrollment data within time range
    const progressEntries = await UserCourseProgress.scan().exec();
    const enrollmentsInRange = progressEntries.filter(progress => {
      const enrollmentDate = new Date(progress.enrollmentDate || 0);
      return enrollmentDate >= startDate;
    });
    
    // Calculate previous period for comparison
    const previousPeriodStart = new Date(startDate);
    const timeDiff = new Date().getTime() - startDate.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - timeDiff);
    
    const enrollmentsInPreviousPeriod = progressEntries.filter(progress => {
      const enrollmentDate = new Date(progress.enrollmentDate || 0);
      return enrollmentDate >= previousPeriodStart && enrollmentDate < startDate;
    });
    
    // Calculate enrollment metrics
    const totalEnrollments = enrollmentsInRange.length;
    const previousEnrollments = enrollmentsInPreviousPeriod.length;
    const enrollmentGrowth = calculateGrowthPercentage(totalEnrollments, previousEnrollments);
    const enrollmentGrowthValue = parseFloat(enrollmentGrowth.replace(/%$/, ''));
    
    // Calculate course completion rate
    const completedCourses = enrollmentsInRange.filter(progress => 
      progress.overallProgress >= 100
    ).length;
    
    const completionRate = totalEnrollments > 0 
      ? (completedCourses / totalEnrollments) * 100 
      : 0;
    
    // Generate sample data if no real data is available
    if (totalEnrollments === 0) {
    res.json({
        enrollments: {
          total: 0,
          growth: "+0%",
          growthValue: 0
        },
        completionRate: "0",
        averageProgress: 0,
        popularCategories: await getPopularCategories([])
      });
      return;
    }
    
    // Return the summary data
    res.json({
      enrollments: {
        total: totalEnrollments,
        growth: enrollmentGrowth,
        growthValue: enrollmentGrowthValue
      },
      completionRate: completionRate.toFixed(1),
      averageProgress: calculateAverageProgress(enrollmentsInRange),
      popularCategories: await getPopularCategories(enrollmentsInRange)
    });
  } catch (error) {
    console.error("Error getting analytics summary:", error);
    res.status(500).json({
      message: "Failed to get analytics summary",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get user analytics data
 */
export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    const startDate = getStartDateFromRange(timeRange);
    const endDate = new Date();
    
    // Get all users from Clerk
    const usersResponse = await clerkClient.users.getUserList({
      limit: 100,
    });
    
    // Filter users by creation date within time range
    const usersInRange = usersResponse.data.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });
    
    // Calculate user growth by month
    const usersByMonth = new Map<string, { students: number, teachers: number }>();
    
    // Initialize all months
    const months = generateDateSequence(startDate, endDate, 'monthly');
    months.forEach(month => {
      usersByMonth.set(month, { students: 0, teachers: 0 });
    });
    
    // Count users by month and role
    usersInRange.forEach(user => {
        const createdAt = new Date(user.createdAt);
      const monthYear = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (usersByMonth.has(monthYear)) {
        const entry = usersByMonth.get(monthYear)!;
        const userType = (user.publicMetadata?.userType as string) || 'student';
        
        if (userType === 'teacher') {
          entry.teachers += 1;
        } else {
          entry.students += 1;
        }
        
        usersByMonth.set(monthYear, entry);
      }
    });
    
    // Convert map to array for response
    const userGrowth = Array.from(usersByMonth.entries()).map(([month, data]) => ({
      month,
      students: data.students,
      teachers: data.teachers
    }));
    
    // Create registration trend
    const registrationTrend = createRegistrationTrend(usersInRange, startDate, endDate);
    
    // Calculate user activity
    const userActivity = await calculateUserActivity(timeRange);
    
    // Calculate user retention
    const userRetention = await calculateUserRetention(timeRange);
    
    // Return the user analytics data
    res.json({
      userGrowth,
        registrationTrend,
      userActivity,
      userRetention,
      usersByRole: calculateUsersByRole(usersResponse.data)
    });
  } catch (error) {
    console.error("Error getting user analytics:", error);
    res.status(500).json({
      message: "Failed to get user analytics",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get course analytics data
 */
export const getCourseAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    const startDate = getStartDateFromRange(timeRange);
    const endDate = new Date();
    
    // Get all courses
    const courses = await Course.scan().exec();
    
    // Get all user progress entries
    const progressEntries = await UserCourseProgress.scan().exec();
    
    // Calculate enrollment by category
    const enrollmentsByCategory = await calculateEnrollmentsByCategory(progressEntries, courses);
    
    // Calculate course creation trend
    const creationTrend = createCourseCreationTrend(courses, startDate, endDate);
    
    // Calculate course completion rates
    const completionRates = calculateCourseCompletionRates(progressEntries, courses);
    
    // Calculate average course ratings
    // Note: This would require a ratings model, using placeholder data for now
    const courseRatings = calculateCourseRatings(courses);
    
    // Return the course analytics data
    res.json({
      enrollmentByCategory: enrollmentsByCategory,
        creationTrend,
        completionRates,
      courseRatings
    });
  } catch (error) {
    console.error("Error getting course analytics:", error);
    res.status(500).json({
      message: "Failed to get course analytics",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get revenue analytics data
 */
export const getRevenueAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    const startDate = getStartDateFromRange(timeRange);
    const endDate = new Date();
    
    // Get all transactions
    const transactions = await Transaction.scan().exec();
    
    // Filter transactions within time range
    const transactionsInRange = transactions.filter(transaction => {
      const createdAt = new Date(transaction.createdAt || Date.now());
      return createdAt >= startDate && createdAt <= endDate;
    });
    
    // Get all courses for reference
    const courses = await Course.scan().exec();
    
    // Calculate revenue by category
    const revenueByCategory = calculateRevenueByCategory(transactionsInRange, courses);
    
    // Calculate revenue trend
    const revenueTrend = createRevenueTrend(transactionsInRange, startDate, endDate);
    
    // Calculate average transaction value
    const avgTransactionValue = calculateAverageTransactionValue(transactionsInRange);
    
    // Calculate revenue per user
    const revenuePerUser = await calculateRevenuePerUser(transactionsInRange);
    
    // Return the revenue analytics data
    res.json({
        revenueByCategory,
      revenueTrend,
      avgTransactionValue,
      revenuePerUser
    });
  } catch (error) {
    console.error("Error getting revenue analytics:", error);
    res.status(500).json({
      message: "Failed to get revenue analytics",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get platform analytics data
 */
export const getPlatformAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    
    // Get daily active users (simulated data)
    // In a real app, this would come from user session/activity logs
    const dailyActiveUsers = simulateDailyActiveUsers();
    
    // Get session duration by device (simulated data)
    const sessionByDevice = simulateSessionByDevice();
    
    // Get engagement metrics (simulated data)
    const engagementMetrics = simulateEngagementMetrics(timeRange);
    
    // Return the platform analytics data
    res.json({
        dailyActiveUsers,
      sessionByDevice,
      engagementMetrics
    });
  } catch (error) {
    console.error("Error getting platform analytics:", error);
    res.status(500).json({
      message: "Failed to get platform analytics",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Helper Functions

/**
 * Calculate average progress across all enrollments
 */
const calculateAverageProgress = (enrollments: any[]): number => {
  if (enrollments.length === 0) return 0;
  
  const totalProgress = enrollments.reduce((sum, enrollment) => 
    sum + (enrollment.overallProgress || 0), 0);
  
  return Math.round((totalProgress / enrollments.length) * 10) / 10;
};

/**
 * Get popular course categories based on enrollments
 */
const getPopularCategories = async (enrollments: any[]): Promise<{ name: string, count: number }[]> => {
  if (enrollments.length === 0) {
    // Check if we have any blog post categories to use
    const blogPosts = await BlogPostModel.scan().exec();
    const categories = [...new Set(blogPosts.map(post => post.category).filter(Boolean))];
    
    if (categories.length > 0) {
      return categories.slice(0, 4).map(name => ({ name, count: 0 }));
    }
    
    return [
      { name: "Web Development", count: 0 },
      { name: "Data Science", count: 0 },
      { name: "Mobile Development", count: 0 },
      { name: "Design", count: 0 }
    ];
  }
  
  const courses = await Course.scan().exec();
  const categoryCounts = new Map<string, number>();
  
  enrollments.forEach(enrollment => {
    const course = courses.find(c => c.courseId === enrollment.courseId);
    if (course && course.category) {
      const count = categoryCounts.get(course.category) || 0;
      categoryCounts.set(course.category, count + 1);
    }
  });
  
  // Convert to array and sort by count
  const categories = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  // Return top categories
  return categories.slice(0, 5);
};

/**
 * Create registration trend data for visualization
 */
const createRegistrationTrend = (users: any[], startDate: Date, endDate: Date): any[] => {
  const dateMap = new Map<string, number>();
  
  // Initialize all dates with 0
  const dates = generateDateSequence(startDate, endDate);
  dates.forEach(date => dateMap.set(date, 0));
  
  // Count users per date
  users.forEach(user => {
    const createdAt = new Date(user.createdAt);
    const dateStr = formatDate(createdAt);
    
    if (dateMap.has(dateStr)) {
      dateMap.set(dateStr, dateMap.get(dateStr)! + 1);
    }
  });
  
  // Convert to array for response
  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculate user activity (simulated)
 */
const calculateUserActivity = async (timeRange: string): Promise<any[]> => {
  // In a real application, this would be based on actual user activity logs
  // For demo purposes, we'll return simulated data that varies based on timeRange
  
  let baseValue = 100;
  
  // Adjust base value based on time range
  if (timeRange === '30days') {
    baseValue = 120;
  } else if (timeRange === '3months') {
    baseValue = 140;
  } else if (timeRange === '6months') {
    baseValue = 160;
  } else if (timeRange === '1year') {
    baseValue = 180;
  }
  
  return [
    { day: "Mon", activeUsers: baseValue + 20 },
    { day: "Tue", activeUsers: baseValue + 45 },
    { day: "Wed", activeUsers: baseValue + 60 },
    { day: "Thu", activeUsers: baseValue + 70 },
    { day: "Fri", activeUsers: baseValue + 55 },
    { day: "Sat", activeUsers: baseValue + 90 },
    { day: "Sun", activeUsers: baseValue + 110 }
  ];
};

/**
 * Calculate user retention (simulated)
 */
const calculateUserRetention = async (timeRange: string): Promise<any[]> => {
  // In a real application, this would analyze user return rates
  // For demo purposes, we'll return simulated data with some variation based on timeRange
  
  // Different retention curves based on time period
  const retentionStart = timeRange === '1year' ? 95 : 100;
  const retentionDrop = timeRange === '30days' ? 8 : 
                        timeRange === '3months' ? 10 : 
                        timeRange === '6months' ? 12 : 15;
  
  return [
    { week: "Week 1", retention: retentionStart },
    { week: "Week 2", retention: retentionStart - retentionDrop },
    { week: "Week 3", retention: retentionStart - (retentionDrop * 2) },
    { week: "Week 4", retention: retentionStart - (retentionDrop * 2.5) },
    { week: "Week 5", retention: retentionStart - (retentionDrop * 3) },
    { week: "Week 6", retention: retentionStart - (retentionDrop * 3.3) },
    { week: "Week 7", retention: retentionStart - (retentionDrop * 3.5) },
    { week: "Week 8", retention: retentionStart - (retentionDrop * 3.8) }
  ];
};

/**
 * Calculate percentage of users by role
 */
const calculateUsersByRole = (users: any[]): any[] => {
  const roles = new Map<string, number>();
  
  // Count users by role
  users.forEach(user => {
    const role = (user.publicMetadata?.userType as string) || 'student';
    const count = roles.get(role) || 0;
    roles.set(role, count + 1);
  });
  
  // Convert to array for chart data
  return Array.from(roles.entries()).map(([name, value]) => ({ name, value }));
};

/**
 * Calculate enrollments by course category
 */
const calculateEnrollmentsByCategory = async (
  progressEntries: any[],
  courses: any[]
): Promise<{ name: string, value: number }[]> => {
  const categoryCounts = new Map<string, number>();
  
  // Calculate enrollments per category
  progressEntries.forEach(progress => {
    const course = courses.find(c => c.courseId === progress.courseId);
    if (course && course.category) {
      const count = categoryCounts.get(course.category) || 0;
      categoryCounts.set(course.category, count + 1);
    }
  });
  
  // If no enrollments or categories, provide sample data
  if (categoryCounts.size === 0) {
    return [
      { name: "Web Development", value: 35 },
      { name: "Data Science", value: 25 },
      { name: "Mobile Development", value: 15 },
      { name: "Design", value: 10 },
      { name: "Other", value: 15 }
    ];
  }
  
  // Convert to array for pie chart
  return Array.from(categoryCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Create course creation trend data for visualization
 */
const createCourseCreationTrend = (courses: any[], startDate: Date, endDate: Date): any[] => {
  const dateMap = new Map<string, number>();
  
  // Initialize all dates with 0
  const dates = generateDateSequence(startDate, endDate);
  dates.forEach(date => dateMap.set(date, 0));
  
  // Count courses per date
  courses.forEach(course => {
    const createdAt = new Date(course.createdAt || Date.now());
    const dateStr = formatDate(createdAt);
    
    if (dateMap.has(dateStr)) {
      dateMap.set(dateStr, dateMap.get(dateStr)! + 1);
    }
  });
  
  // Convert to array for response
  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculate course completion rates
 */
const calculateCourseCompletionRates = (progressEntries: any[], courses: any[]): any[] => {
  const results: { courseId: string, title: string, completionRate: number }[] = [];
  
  // Calculate completion rate for each course
  courses.forEach(course => {
    const enrollments = progressEntries.filter(p => p.courseId === course.courseId);
    const completedEnrollments = enrollments.filter(p => p.overallProgress >= 100);
    
    const completionRate = enrollments.length > 0
      ? (completedEnrollments.length / enrollments.length) * 100
      : 0;
    
    results.push({
      courseId: course.courseId,
      title: course.title,
      completionRate: Math.round(completionRate * 10) / 10
    });
  });
  
  // Sort by completion rate descending
  return results.sort((a, b) => b.completionRate - a.completionRate).slice(0, 10);
};

/**
 * Calculate course ratings (simulated)
 */
const calculateCourseRatings = (courses: any[]): any[] => {
  // In a real application, this would be based on actual course ratings
  // For demo purposes, we'll generate random ratings
  
  return courses.slice(0, 10).map(course => ({
    courseId: course.courseId,
    title: course.title,
    rating: (3.5 + Math.random() * 1.5).toFixed(1)
  }));
};

/**
 * Calculate revenue by course category
 */
const calculateRevenueByCategory = (transactions: any[], courses: any[]): any[] => {
  const categoryRevenue = new Map<string, number>();
  
  // Calculate revenue per category
  transactions.forEach(transaction => {
    if (!transaction.courseId) return;
    
    const course = courses.find(c => c.courseId === transaction.courseId);
    if (course && course.category) {
      const revenue = categoryRevenue.get(course.category) || 0;
      categoryRevenue.set(course.category, revenue + (transaction.amount || 0));
    }
  });
  
  // If no revenue data, provide sample
  if (categoryRevenue.size === 0) {
    return [
      { category: "Web Development", revenue: 12500 },
      { category: "Data Science", revenue: 9800 },
      { category: "Mobile Development", revenue: 7600 },
      { category: "Design", revenue: 5200 },
      { category: "Other", revenue: 3900 }
    ];
  }
  
  // Convert to array for chart
  return Array.from(categoryRevenue.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
};

/**
 * Create revenue trend data for visualization
 */
const createRevenueTrend = (transactions: any[], startDate: Date, endDate: Date): any[] => {
  const monthMap = new Map<string, number>();
  
  // Initialize all months with 0
  const months = generateDateSequence(startDate, endDate, 'monthly');
  months.forEach(month => monthMap.set(month, 0));
  
  // Calculate revenue per month
  transactions.forEach(transaction => {
    const createdAt = new Date(transaction.createdAt || Date.now());
    const monthStr = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (monthMap.has(monthStr)) {
      monthMap.set(monthStr, monthMap.get(monthStr)! + (transaction.amount || 0));
    }
  });
  
  // If no revenue data, provide sample
  if (transactions.length === 0) {
    const baseAmount = 8000;
    let i = 0;
    
    for (const [month, _] of monthMap.entries()) {
      const randomVariation = Math.random() * 2000 - 1000;
      const trend = i * 500; // Slight upward trend
      monthMap.set(month, baseAmount + trend + randomVariation);
      i++;
    }
  }
  
  // Convert to array for chart
  return Array.from(monthMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });
};

/**
 * Calculate average transaction value
 */
const calculateAverageTransactionValue = (transactions: any[]): number => {
  if (transactions.length === 0) return 0;
  
  const totalValue = transactions.reduce((sum, transaction) => 
    sum + (transaction.amount || 0), 0);
  
  return Math.round((totalValue / transactions.length) * 100) / 100;
};

/**
 * Calculate revenue per user
 */
const calculateRevenuePerUser = async (transactions: any[]): Promise<number> => {
  try {
    const usersResponse = await clerkClient.users.getUserList({
      limit: 100,
    });
    
    const totalUsers = usersResponse.data.length;
    
    if (totalUsers === 0) return 0;
    
    const totalRevenue = transactions.reduce((sum, transaction) => 
      sum + (transaction.amount || 0), 0);
    
    return Math.round((totalRevenue / totalUsers) * 100) / 100;
  } catch (error) {
    console.error("Error calculating revenue per user:", error);
    return 0;
  }
};

/**
 * Simulate daily active users data for platform analytics
 */
const simulateDailyActiveUsers = (): any[] => {
  // In a real application, this would come from user analytics data
  return [
    { day: "Mon", activeUsers: 120 },
    { day: "Tue", activeUsers: 145 },
    { day: "Wed", activeUsers: 160 },
    { day: "Thu", activeUsers: 170 },
    { day: "Fri", activeUsers: 155 },
    { day: "Sat", activeUsers: 190 },
    { day: "Sun", activeUsers: 210 }
  ];
};

/**
 * Simulate session duration by device data for platform analytics
 */
const simulateSessionByDevice = (): any[] => {
  // In a real application, this would come from user analytics data
  return [
    { device: "Desktop", duration: 42 },
    { device: "Mobile", duration: 23 },
    { device: "Tablet", duration: 38 }
  ];
};

/**
 * Simulate engagement metrics data for platform analytics
 */
const simulateEngagementMetrics = (timeRange: string): any => {
  // In a real application, this would be calculated from user activity data
  // Create variation based on timeRange
  
  let baseMultiplier;
  switch(timeRange) {
    case '7days':
      baseMultiplier = 0.9;
      break;
    case '30days':
      baseMultiplier = 0.95;
      break;
    case '3months':
      baseMultiplier = 1.0;
      break;
    case '6months':
      baseMultiplier = 1.05;
      break;
    case '1year':
      baseMultiplier = 1.1;
      break;
    default:
      baseMultiplier = 1.0;
  }
  
  return {
    avgSessionDuration: Math.round(baseMultiplier * 35.2 * 10) / 10,
    courseCompletionRate: Math.round(baseMultiplier * 68.7 * 10) / 10,
    videoWatchRate: Math.round(baseMultiplier * 79.5 * 10) / 10,
    quizCompletionRate: Math.round(baseMultiplier * 82.3 * 10) / 10
  };
}; 