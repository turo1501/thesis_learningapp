"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Wallet,
  Award,
  ChevronRight,
  TrendingUp,
  History,
  Gift,
  BookOpen,
  CheckCircle,
  Trophy,
  Calendar,
  Activity,
  Zap,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  BarChart2,
  Clock,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/shared/Header";
import { format } from "date-fns";
import { toast } from "sonner";

import { 
  useGetUserCoinsQuery, 
  useGetUserTransactionsQuery,
  useGetAvailableRewardsQuery,
  useGetUserRewardsQuery,
  usePurchaseRewardMutation,
  useActivateRewardMutation,
} from "@/state/api/coinsApi";

import type { 
  CoinTransaction as ApiCoinTransaction,
  CoinReward as ApiCoinReward,
  UserCoinStats as ApiUserCoinStats,
  UserReward
} from "@/state/api/coinsApi";

// Local interface types (existing)
interface CoinTransaction {
  id: string;
  amount: number;
  type: "earned" | "spent";
  description: string;
  category: "assignment" | "quiz" | "streak" | "purchase" | "challenge" | "other";
  timestamp: Date;
}

interface CoinReward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  coinsRequired: number;
  category: "customization" | "award" | "special" | "premium";
  unlocked: boolean;
  featured?: boolean;
}

interface UserCoinStats {
  totalCoins: number;
  coinsEarned: number;
  coinsSpent: number;
  streakDays: number;
  achievements: number;
  level: number;
  nextLevelProgress: number;
}

// Sample data (keep as fallback)
const SAMPLE_TRANSACTIONS: CoinTransaction[] = [
  {
    id: "tx1",
    amount: 50,
    type: "earned",
    description: "Completed JavaScript Fundamentals Quiz",
    category: "quiz",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: "tx2",
    amount: 25,
    type: "earned",
    description: "5-day streak bonus",
    category: "streak",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: "tx3",
    amount: 75,
    type: "earned",
    description: "Completed React Components Assignment",
    category: "assignment",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48)
  },
  {
    id: "tx4",
    amount: 120,
    type: "spent",
    description: "Purchased Dark Mode Theme",
    category: "purchase",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72)
  },
  {
    id: "tx5",
    amount: 100,
    type: "earned",
    description: "Won Weekly Coding Challenge",
    category: "challenge",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96)
  }
];

const SAMPLE_REWARDS: CoinReward[] = [
  {
    id: "reward1",
    name: "Dark Theme",
    description: "Unlock a sleek dark mode for the entire platform",
    icon: <Sparkles size={24} />,
    coinsRequired: 200,
    category: "customization",
    unlocked: true,
    featured: true
  },
  {
    id: "reward2",
    name: "AI Study Assistant",
    description: "Get access to our AI-powered study assistant for 1 month",
    icon: <Zap size={24} />,
    coinsRequired: 500,
    category: "premium",
    unlocked: false,
    featured: true
  },
  {
    id: "reward3",
    name: "Coding Expert Badge",
    description: "Show off your expertise with a special profile badge",
    icon: <Award size={24} />,
    coinsRequired: 300,
    category: "award",
    unlocked: false
  },
  {
    id: "reward4",
    name: "Exclusive Tutorial Access",
    description: "Get access to premium tutorials and courses",
    icon: <BookOpen size={24} />,
    coinsRequired: 400,
    category: "premium",
    unlocked: false
  },
  {
    id: "reward5",
    name: "Custom Avatar Frame",
    description: "Unlock a special frame for your profile picture",
    icon: <Sparkles size={24} />,
    coinsRequired: 150,
    category: "customization",
    unlocked: true
  }
];

const SAMPLE_USER_STATS: UserCoinStats = {
  totalCoins: 230,
  coinsEarned: 350,
  coinsSpent: 120,
  streakDays: 7,
  achievements: 12,
  level: 3,
  nextLevelProgress: 65
};

// Helper functions
const getCategoryIcon = (category: CoinTransaction['category']) => {
  switch (category) {
    case "assignment":
      return <CheckCircle className="text-green-500" />;
    case "quiz":
      return <BookOpen className="text-blue-500" />;
    case "streak":
      return <Zap className="text-amber-500" />;
    case "purchase":
      return <Wallet className="text-purple-500" />;
    case "challenge":
      return <Trophy className="text-red-500" />;
    default:
      return <Activity className="text-gray-500" />;
  }
};

const LearningCoins = () => {
  const { user } = useUser();
  const userId = user?.id || "";
  
  // API queries
  const { data: userStatsData, isLoading: statsLoading } = useGetUserCoinsQuery(userId, {
    skip: !userId
  });
  
  const { data: transactionsData, isLoading: transactionsLoading } = useGetUserTransactionsQuery(userId, {
    skip: !userId
  });
  
  const { data: availableRewards, isLoading: rewardsLoading } = useGetAvailableRewardsQuery();
  
  const { data: userRewards, isLoading: userRewardsLoading } = useGetUserRewardsQuery(userId, {
    skip: !userId
  });
  
  // Mutations
  const [purchaseReward, { isLoading: isPurchasing }] = usePurchaseRewardMutation();
  const [activateReward, { isLoading: isActivating }] = useActivateRewardMutation();
  
  // State for the UI
  const [activeTab, setActiveTab] = useState("overview");
  
  // Transform API data to match the component's expected format
  const transactions = useMemo(() => {
    if (!transactionsData) return SAMPLE_TRANSACTIONS;
    
    return transactionsData.map((tx: ApiCoinTransaction) => ({
      ...tx,
      timestamp: new Date(tx.timestamp)
    }));
  }, [transactionsData]);
  
  // Transform rewards data
  const rewards = useMemo(() => {
    if (!availableRewards || !userRewards) return SAMPLE_REWARDS;
    
    const userRewardIds = new Set(userRewards.map((ur: UserReward) => ur.rewardId));
    
    return availableRewards.map((reward: ApiCoinReward) => {
      const iconComponent = getIconComponent(reward.iconName);
      
      return {
        ...reward,
        icon: iconComponent,
        unlocked: userRewardIds.has(reward.id)
      };
    });
  }, [availableRewards, userRewards]);
  
  // Transform user stats
  const coinStats = useMemo(() => {
    if (!userStatsData) return SAMPLE_USER_STATS;
    
    return {
      ...userStatsData,
      // Map any needed fields
    };
  }, [userStatsData]);
  
  // Sort transactions by timestamp (newest first)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [transactions]);
  
  // Group rewards by category for the display
  const rewardsByCategory = useMemo(() => {
    return rewards.reduce<Record<string, CoinReward[]>>(
      (acc: Record<string, CoinReward[]>, reward: CoinReward) => {
        if (!acc[reward.category]) {
          acc[reward.category] = [];
        }
        acc[reward.category].push(reward);
        return acc;
      },
      {} as Record<string, CoinReward[]>
    );
  }, [rewards]);
  
  // Featured rewards (for the dashboard)
  const featuredRewards = useMemo(() => {
    return rewards.filter((reward: CoinReward) => reward.featured);
  }, [rewards]);
  
  // Handle reward purchase
  const handlePurchaseReward = async (rewardId: string) => {
    if (!userId) return;
    
    try {
      await purchaseReward({
        userId,
        rewardId
      }).unwrap();
      
      toast.success("Reward unlocked successfully!");
    } catch (error) {
      toast.error("Failed to unlock reward");
    }
  };
  
  // Handle reward activation
  const handleActivateReward = async (userRewardId: string) => {
    if (!userId) return;
    
    try {
      await activateReward({
        userId,
        userRewardId
      }).unwrap();
      
      toast.success("Reward activated successfully!");
    } catch (error) {
      toast.error("Failed to activate reward");
    }
  };
  
  // Helper function to get icon component from icon name
  const getIconComponent = (iconName: string): React.ReactNode => {
    switch (iconName) {
      case "sparkles":
        return <Sparkles size={24} />;
      case "zap":
        return <Zap size={24} />;
      case "award":
        return <Award size={24} />;
      case "book":
        return <BookOpen size={24} />;
      default:
        return <Sparkles size={24} />;
    }
  };
  
  // Loading state
  if (statsLoading || transactionsLoading || rewardsLoading || userRewardsLoading) {
    return (
      <div className="container space-y-6 pb-8">
        <Header title="Learning Coins" subtitle="Loading coin data..." />
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container space-y-6 pb-8">
      <Header
        title="Learning Coins"
        subtitle="Earn coins by completing learning activities and unlock rewards"
      />
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-customgreys-secondarybg border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-primary-700/20 p-2 rounded-full mr-4">
                <Wallet className="h-8 w-8 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Available Coins</p>
                <h3 className="text-2xl font-bold">{coinStats.totalCoins}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-700/20 p-2 rounded-full mr-4">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Earned</p>
                <h3 className="text-2xl font-bold">{coinStats.coinsEarned}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-amber-700/20 p-2 rounded-full mr-4">
                <Zap className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Streak</p>
                <h3 className="text-2xl font-bold">{coinStats.streakDays} days</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-customgreys-secondarybg border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-700/20 p-2 rounded-full mr-4">
                <Trophy className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <h3 className="text-2xl font-bold">{coinStats.level}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-customgreys-secondarybg grid grid-cols-3 w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">History</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Progress */}
            <Card className="bg-customgreys-secondarybg border-none shadow-md md:col-span-2">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">Level {coinStats.level}</h4>
                    <p className="text-sm text-gray-400">{coinStats.nextLevelProgress}% to Level {coinStats.level + 1}</p>
                  </div>
                  <Progress value={coinStats.nextLevelProgress} 
                    className="h-2" 
                    indicatorClassName="bg-primary-500" 
                  />
                </div>
                
                {/* Recent Achievements */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Recent Achievements</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center p-3 bg-customgreys-primarybg rounded-md">
                      <Zap className="h-8 w-8 text-amber-500 mb-2" />
                      <p className="text-xs text-center">7-Day Streak</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-customgreys-primarybg rounded-md">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-xs text-center">5 Assignments</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-customgreys-primarybg rounded-md">
                      <Trophy className="h-8 w-8 text-blue-500 mb-2" />
                      <p className="text-xs text-center">Quiz Master</p>
                    </div>
                  </div>
                </div>
                
                {/* Weekly Activity */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Weekly Activity</h4>
                  <div className="grid grid-cols-7 gap-1 h-20">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const height = Math.random() * 100; // Random height for the demo
                      return (
                        <div key={i} className="flex flex-col items-center">
                          <div className="flex-grow w-full flex items-end">
                            <div 
                              className="bg-primary-500/80 w-full rounded-t-sm" 
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Featured Rewards */}
            <Card className="bg-customgreys-secondarybg border-none shadow-md">
              <CardHeader>
                <CardTitle>Featured Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredRewards.map((reward: CoinReward) => (
                  <div 
                    key={reward.id} 
                    className={`relative p-4 rounded-md border ${
                      reward.unlocked ? 'border-primary-500 bg-primary-500/10' : 
                      'border-gray-700 bg-customgreys-primarybg'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-4 p-2 rounded-full bg-customgreys-primarybg">
                        {reward.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{reward.name}</h4>
                        <p className="text-xs text-gray-400">{reward.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 mr-1 text-amber-500" />
                        <span className="text-sm">{reward.coinsRequired} coins</span>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={!reward.unlocked}
                        variant={reward.unlocked ? "default" : "outline"}
                      >
                        {reward.unlocked ? "Use" : "Lock"}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={() => setActiveTab("rewards")}
                >
                  View All Rewards
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Transactions */}
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button 
                variant="ghost" 
                className="text-sm"
                onClick={() => setActiveTab("transactions")}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedTransactions.slice(0, 3).map((transaction: CoinTransaction) => (
                  <div key={transaction.id} className="flex items-center p-3 rounded-md bg-customgreys-primarybg">
                    <div className="mr-3 p-2 rounded-full bg-customgreys-secondarybg">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-400">
                        {format(transaction.timestamp, "MMM d, yyyy • h:mm a")}
                      </p>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === 'earned' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                A record of all your coin earnings and spendings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {sortedTransactions.map((transaction: CoinTransaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center p-3 rounded-md hover:bg-customgreys-primarybg"
                  >
                    <div className="mr-3 p-2 rounded-full bg-customgreys-primarybg">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{transaction.description}</p>
                        <div className={`font-bold ${
                          transaction.type === 'earned' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                        </div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          {format(transaction.timestamp, "MMM d, yyyy • h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                Rewards Shop
                <Badge className="ml-2 bg-primary-500">
                  {coinStats.totalCoins} coins available
                </Badge>
              </CardTitle>
              <CardDescription>
                Unlock exclusive features and items with your learning coins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(rewardsByCategory).map(([category, categoryRewards]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold capitalize">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryRewards.map((reward: CoinReward) => (
                        <div 
                          key={reward.id} 
                          className={`p-4 rounded-md border ${
                            reward.unlocked ? 'border-primary-500 bg-primary-500/10' : 
                            coinStats.totalCoins >= reward.coinsRequired ? 'border-amber-500 bg-amber-500/10' :
                            'border-gray-700 bg-customgreys-primarybg'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="mr-3 p-2 rounded-full bg-customgreys-primarybg">
                              {reward.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{reward.name}</h4>
                              <p className="text-xs text-gray-400 mt-1">{reward.description}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center">
                              <Wallet className="h-4 w-4 mr-1 text-amber-500" />
                              <span className="text-sm">{reward.coinsRequired} coins</span>
                            </div>
                            {reward.unlocked ? (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  // Find the userReward to activate
                                  const userReward = userRewards?.find((ur: UserReward) => ur.rewardId === reward.id);
                                  if (userReward) {
                                    handleActivateReward(userReward.id);
                                  }
                                }}
                                disabled={isActivating}
                              >
                                Use
                              </Button>
                            ) : coinStats.totalCoins >= reward.coinsRequired ? (
                              <Button 
                                size="sm"
                                onClick={() => handlePurchaseReward(reward.id)}
                                disabled={isPurchasing}
                              >
                                Unlock
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningCoins;

// Helper component for Lock icon
function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
} 