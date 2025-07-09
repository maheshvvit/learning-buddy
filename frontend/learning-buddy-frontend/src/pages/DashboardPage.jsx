import { useState, useEffect } from 'react';
import LinkWrapper from '../components/ui/LinkWrapper';
import { 
  Target, 
  BookOpen, 
  Trophy, 
  Zap, 
  TrendingUp, 
  Calendar,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useAuthStore } from '../stores/authStore';

const DashboardPage = ({ searchQuery }) => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use onSearchChange in the input field in the header or pass it down to the header component
  // Since this file does not render the header, ensure the parent component passes onSearchChange properly

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setIsLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setDashboardData({
          todayProgress: {
            challengesCompleted: 3,
            timeSpent: 45, // minutes
            xpEarned: 150,
            dailyGoal: 60 // minutes
          },
          weeklyStats: {
            challengesCompleted: 12,
            averageScore: 85,
            streak: 5,
            totalXp: 750
          },
          recentChallenges: [
            { id: 1, title: 'JavaScript Fundamentals', score: 92, category: 'Programming' },
            { id: 2, title: 'React Hooks Deep Dive', score: 88, category: 'Frontend' },
            { id: 3, title: 'Algorithm Basics', score: 95, category: 'Computer Science' }
          ],
          recommendations: [
            { id: 1, title: 'Advanced React Patterns', type: 'challenge', difficulty: 'Hard' },
            { id: 2, title: 'Full-Stack Development Path', type: 'path', duration: '6 weeks' }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progressPercentage = dashboardData ? 
    (dashboardData.todayProgress.timeSpent / dashboardData.todayProgress.dailyGoal) * 100 : 0;

  // Filter recentChallenges and recommendations based on searchQuery
  const filteredRecentChallenges = dashboardData?.recentChallenges.filter(challenge =>
    (challenge.title?.toLowerCase().includes(searchQuery?.toLowerCase() || '')) ||
    (challenge.category?.toLowerCase().includes(searchQuery?.toLowerCase() || ''))
  ) || [];

  const filteredRecommendations = dashboardData?.recommendations.filter(item =>
    item.title?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  ) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.profile?.firstName || user?.username}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to continue your learning journey?
          </p>
        </div>
        <Button asChild className="relative z-10 bg-primary">
          <LinkWrapper to="/app/challenges">Start Challenge</LinkWrapper>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.gamification?.level || 1}</div>
            <p className="text-xs text-muted-foreground">
              {user?.gamification?.xp || 0} / {user?.gamification?.xpToNextLevel || 100} XP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.weeklyStats.streak || 0}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenges</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.weeklyStats.challengesCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.gamification?.badges?.length || 0}</div>
            <p className="text-xs text-muted-foreground">earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Today's Progress</span>
          </CardTitle>
          <CardDescription>
            Keep up the great work! You're {Math.round(progressPercentage)}% towards your daily goal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Study Time</span>
              <span>{dashboardData?.todayProgress.timeSpent || 0} / {dashboardData?.todayProgress.dailyGoal || 60} min</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dashboardData?.todayProgress.challengesCompleted || 0}</div>
              <div className="text-xs text-muted-foreground">Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dashboardData?.todayProgress.xpEarned || 0}</div>
              <div className="text-xs text-muted-foreground">XP Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dashboardData?.weeklyStats.averageScore || 0}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
            {filteredRecentChallenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{challenge.title}</div>
                    <div className="text-sm text-muted-foreground">{challenge.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{challenge.score}%</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <LinkWrapper to="/app/progress">View All Progress</LinkWrapper>
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Recommended for You</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
            {filteredRecommendations.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.type === 'challenge' ? `Difficulty: ${item.difficulty}` : `Duration: ${item.duration}`}
                    </div>
                  </div>
                  <Button size="sm">
                    {item.type === 'challenge' ? 'Start' : 'Explore'}
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <LinkWrapper to="/app/learning-paths">Browse All Paths</LinkWrapper>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

