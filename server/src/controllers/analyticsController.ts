import { Request, Response } from "express";
import { clerkClient } from "../index";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

// Helper functions
const calculateGrowthPercentage = (current: number, previous: number): string => {
  if (previous === 0) return "+100%";
  const growth = ((current - previous) / previous) * 100;
  return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
};

// Parse timeRange to get start date
const getStartDateFromTimeRange = (timeRange: string): Date => {
  const now = new Date();
  
  switch (timeRange) {
    case '7days':
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sevenDaysAgo;
    case '30days':
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return thirtyDaysAgo;
    case '3months':
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return threeMonthsAgo;
    case '1year':
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return oneYearAgo;
    case '6months':
    default:
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      return sixMonthsAgo;
  }
};

// Get analytics summary
export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    const startDate = getStartDateFromTimeRange(timeRange);
    
    // Get total users
    const usersResponse = await clerkClient.users.getUserList({
      limit: 500,
    });
    
    // Get users created after start date
    const recentUsers = usersResponse.data.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= startDate;
    });
    
    // Calculate total enrollments
    const enrollments = await UserCourseProgress.scan().exec();
    const recentEnrollments = enrollments.filter(enrollment => {
      if (!enrollment.enrollmentDate) return false;
      const enrollmentDate = new Date(enrollment.enrollmentDate);
      return enrollmentDate >= startDate;
    });
    
    // Calculate completion rates
    const completedCourses = enrollments.filter(enrollment => enrollment.progress === 100);
    const completionRate = enrollments.length > 0 
      ? (completedCourses.length / enrollments.length) * 100 
      : 0;
    
    // Calculate previous period statistics for growth rates
    const prevPeriodStartDate = new Date(startDate);
    const timeDiff = new Date().getTime() - startDate.getTime();
    prevPeriodStartDate.setTime(prevPeriodStartDate.getTime() - timeDiff);
    
    // Users in previous period
    const prevPeriodUsers = usersResponse.data.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= prevPeriodStartDate && createdAt < startDate;
    });
    
    // Enrollments in previous period
    const prevPeriodEnrollments = enrollments.filter(enrollment => {
      if (!enrollment.enrollmentDate) return false;
      const enrollmentDate = new Date(enrollment.enrollmentDate);
      return enrollmentDate >= prevPeriodStartDate && enrollmentDate < startDate;
    });
    
    // Calculate growth
    const userGrowth = calculateGrowthPercentage(recentUsers.length, prevPeriodUsers.length);
    const enrollmentGrowth = calculateGrowthPercentage(recentEnrollments.length, prevPeriodEnrollments.length);
    const completionRateGrowth = "+5.2%"; // Placeholder, would need historical data
    
    res.json({
      success: true,
      data: {
        newUsers: {
          total: recentUsers.length,
          growth: userGrowth,
          growthValue: parseFloat(userGrowth.replace('%', ''))
        },
        enrollments: {
          total: recentEnrollments.length,
          growth: enrollmentGrowth,
          growthValue: parseFloat(enrollmentGrowth.replace('%', ''))
        },
        completionRate: {
          rate: completionRate.toFixed(1),
          growth: completionRateGrowth,
          growthValue: 5.2
        },
        activeUsers: {
          total: Math.ceil(usersResponse.data.length * 0.65), // Placeholder: 65% of total users
          growth: "+8.7%",
          growthValue: 8.7
        }
      }
    });
  } catch (error) {
    console.error("Error getting analytics summary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics summary"
    });
  }
};

// Get user analytics
export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    
    // Get users from Clerk
    const usersResponse = await clerkClient.users.getUserList({
      limit: 500,
    });
    
    // Calculate user growth data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowthData = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStr = month.toLocaleString('default', { month: 'short' });
      
      // Count users created in this month
      const studentsInMonth = usersResponse.data.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt.getMonth() === month.getMonth() && 
               createdAt.getFullYear() === month.getFullYear() &&
               user.publicMetadata?.role === 'student';
      }).length;
      
      const teachersInMonth = usersResponse.data.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt.getMonth() === month.getMonth() && 
               createdAt.getFullYear() === month.getFullYear() &&
               user.publicMetadata?.role === 'teacher';
      }).length;
      
      // Add data point
      userGrowthData.unshift({
        month: monthStr,
        students: studentsInMonth,
        teachers: teachersInMonth
      });
    }
    
    // Calculate role distribution
    const students = usersResponse.data.filter(user => 
      user.publicMetadata?.role === 'student'
    ).length;
    
    const teachers = usersResponse.data.filter(user => 
      user.publicMetadata?.role === 'teacher'
    ).length;
    
    const admins = usersResponse.data.filter(user => 
      user.publicMetadata?.role === 'admin'
    ).length;
    
    const roleDistribution = [
      { name: 'Students', value: students },
      { name: 'Teachers', value: teachers },
      { name: 'Admins', value: admins }
    ];
    
    // Generate registration trend data
    const registrationTrend = [];
    const daysCount = timeRange === '7days' ? 7 : 30;
    
    for (let i = 0; i < daysCount; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const usersOnDay = usersResponse.data.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= day && createdAt < nextDay;
      }).length;
      
      registrationTrend.unshift({
        date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: usersOnDay
      });
    }
    
    res.json({
      success: true,
      data: {
        userGrowth: userGrowthData,
        roleDistribution,
        registrationTrend,
        demographics: {
          age: [
            { range: '18-24', value: 30 },
            { range: '25-34', value: 45 },
            { range: '35-44', value: 15 },
            { range: '45+', value: 10 }
          ],
          location: [
            { country: 'United States', value: 40 },
            { country: 'India', value: 12 },
            { country: 'UK', value: 8 },
            { country: 'Canada', value: 7 },
            { country: 'Other', value: 33 }
          ]
        }
      }
    });
  } catch (error) {
    console.error("Error getting user analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user analytics"
    });
  }
};

// Get course analytics
export const getCourseAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    
    // Get all courses
    const courses = await Course.scan().exec();
    
    // Get enrollment data
    const enrollments = await UserCourseProgress.scan().exec();
    
    // Calculate enrollment by category
    const categoryMap = new Map<string, number>();
    
    for (const enrollment of enrollments) {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (course) {
        const category = course.category || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      }
    }
    
    const enrollmentByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    // Calculate course creation trend
    const creationTrend = [];
    const daysCount = timeRange === '7days' ? 7 : 30;
    
    for (let i = 0; i < daysCount; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const coursesOnDay = courses.filter(course => {
        if (!course.createdAt) return false;
        const createdAt = new Date(course.createdAt);
        return createdAt >= day && createdAt < nextDay;
      }).length;
      
      creationTrend.unshift({
        date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: coursesOnDay
      });
    }
    
    // Calculate completion rates by category
    const completionRates = [];
    for (const [category, _] of categoryMap.entries()) {
      // Find all enrollments for courses in this category
      const categoryEnrollments = enrollments.filter(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        return course && course.category === category;
      });
      
      // Calculate completion rate
      const completed = categoryEnrollments.filter(e => e.progress === 100).length;
      const rate = categoryEnrollments.length > 0 
        ? (completed / categoryEnrollments.length) * 100 
        : 0;
      
      completionRates.push({
        category,
        rate: Math.round(rate)
      });
    }
    
    // Sort by rate descending
    completionRates.sort((a, b) => b.rate - a.rate);
    
    res.json({
      success: true,
      data: {
        enrollmentByCategory,
        creationTrend,
        completionRates,
        popularCourses: courses
          .sort((a, b) => {
            const aEnrollments = enrollments.filter(e => e.courseId === a.id).length;
            const bEnrollments = enrollments.filter(e => e.courseId === b.id).length;
            return bEnrollments - aEnrollments;
          })
          .slice(0, 5)
          .map(course => ({
            id: course.id,
            title: course.title,
            enrollments: enrollments.filter(e => e.courseId === course.id).length
          }))
      }
    });
  } catch (error) {
    console.error("Error getting course analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course analytics"
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = req.query.timeRange as string || '6months';
    // Log time range for debugging
    console.log(`Getting revenue analytics for time range: ${timeRange}`);
    
    // Get all transactions
    const transactions = await Transaction.scan().exec();
    
    // Get all courses for category information
    const courses = await Course.scan().exec();
    
    // Calculate revenue by category
    const revenueByCategory = [];
    const categoryMap = new Map<string, number>();
    
    for (const transaction of transactions) {
      if (!transaction.courseId) continue;
      
      const course = courses.find(c => c.id === transaction.courseId);
      if (course) {
        const category = course.category || 'Uncategorized';
        categoryMap.set(
          category, 
          (categoryMap.get(category) || 0) + (transaction.amount || 0)
        );
      }
    }
    
    for (const [category, revenue] of categoryMap.entries()) {
      revenueByCategory.push({ category, revenue });
    }
    
    // Sort by revenue descending
    revenueByCategory.sort((a, b) => b.revenue - a.revenue);
    
    // Generate revenue forecast data
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const revenueForecast = [];
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, currentMonth - 11 + i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // Get actual revenue for past months
      let actual = 0;
      if (month < new Date()) {
        const monthTransactions = transactions.filter(transaction => {
          if (!transaction.dateTime) return false;
          const transactionDate = new Date(transaction.dateTime);
          return transactionDate.getMonth() === month.getMonth() && 
                 transactionDate.getFullYear() === month.getFullYear();
        });
        
        actual = monthTransactions.reduce((sum, transaction) => 
          sum + (transaction.amount || 0), 0);
      }
      
      // Generate forecast for future months
      let forecast = 0;
      if (month <= new Date()) {
        forecast = actual;
      } else {
        // Simple forecast based on average growth
        const lastMonth = revenueForecast.length > 0 ? revenueForecast[revenueForecast.length - 1].actual : 0;
        forecast = Math.round(lastMonth * (1 + (Math.random() * 0.2 + 0.05))); // 5-25% growth
      }
      
      revenueForecast.push({
        month: monthName,
        actual: actual,
        forecast: forecast
      });
    }
    
    res.json({
      success: true,
      data: {
        revenueByCategory,
        revenueForecast,
        topCoursesByRevenue: courses
          .map(course => {
            const courseTransactions = transactions.filter(t => t.courseId === course.id);
            const revenue = courseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            return {
              id: course.id,
              title: course.title,
              revenue
            };
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      }
    });
  } catch (error) {
    console.error("Error getting revenue analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch revenue analytics"
    });
  }
};

// Get platform analytics
export const getPlatformAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Use the timeRange query parameter for future dynamic data generation
    const timeRange = req.query.timeRange as string || '6months';
    console.log(`Generating platform analytics for time range: ${timeRange}`);
    
    // Generate daily active users data
    const dailyActiveUsers = [
      { day: 'Mon', activeUsers: Math.floor(Math.random() * 50) + 100 },
      { day: 'Tue', activeUsers: Math.floor(Math.random() * 50) + 120 },
      { day: 'Wed', activeUsers: Math.floor(Math.random() * 50) + 140 },
      { day: 'Thu', activeUsers: Math.floor(Math.random() * 50) + 150 },
      { day: 'Fri', activeUsers: Math.floor(Math.random() * 50) + 130 },
      { day: 'Sat', activeUsers: Math.floor(Math.random() * 50) + 90 },
      { day: 'Sun', activeUsers: Math.floor(Math.random() * 50) + 80 }
    ];
    
    // Generate engagement metrics
    const courseCompletionTime = {
      average: Math.floor(Math.random() * 10) + 15, // Average days to complete a course
      byCategory: [
        { category: 'Web Development', days: Math.floor(Math.random() * 10) + 20 },
        { category: 'Data Science', days: Math.floor(Math.random() * 10) + 25 },
        { category: 'Mobile App Dev', days: Math.floor(Math.random() * 10) + 18 },
        { category: 'AI & ML', days: Math.floor(Math.random() * 10) + 30 }
      ]
    };
    
    // Generate retention data
    const retentionData = {
      overall: Math.floor(Math.random() * 20) + 70, // Overall retention rate (%)
      byMonth: [
        { month: 'Jan', rate: Math.floor(Math.random() * 20) + 65 },
        { month: 'Feb', rate: Math.floor(Math.random() * 20) + 68 },
        { month: 'Mar', rate: Math.floor(Math.random() * 20) + 70 },
        { month: 'Apr', rate: Math.floor(Math.random() * 20) + 72 },
        { month: 'May', rate: Math.floor(Math.random() * 20) + 75 },
        { month: 'Jun', rate: Math.floor(Math.random() * 20) + 78 }
      ]
    };
    
    res.json({
      success: true,
      data: {
        dailyActiveUsers,
        courseCompletionTime,
        retentionData,
        deviceUsage: [
          { device: 'Desktop', percentage: 65 },
          { device: 'Mobile', percentage: 28 },
          { device: 'Tablet', percentage: 7 }
        ],
        browserUsage: [
          { browser: 'Chrome', percentage: 55 },
          { browser: 'Firefox', percentage: 15 },
          { browser: 'Safari', percentage: 20 },
          { browser: 'Edge', percentage: 8 },
          { browser: 'Others', percentage: 2 }
        ]
      }
    });
  } catch (error) {
    console.error("Error getting platform analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch platform analytics"
    });
  }
}; 