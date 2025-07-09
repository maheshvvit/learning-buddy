import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ProgressPage = () => {
  const [timeframe, setTimeframe] = useState('30');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = () => {
      setIsLoading(true);
      // Mock analytics data
      setTimeout(() => {
        setAnalyticsData({
          overview: {
            totalXp: 2450,
            level: 8,
            challengesCompleted: 47,
            averageScore: 87,
            timeSpent: 1240, // minutes
            streak: 12,
            rank: 156,
            totalUsers: 5420
          },
          dailyProgress: [
            { date: '2024-01-01', xp: 120, timeSpent: 45, challenges: 2 },
            { date: '2024-01-02', xp: 180, timeSpent: 60, challenges: 3 },
            { date: '2024-01-03', xp: 90, timeSpent: 30, challenges: 1 },
            { date: '2024-01-04', xp: 200, timeSpent: 75, challenges: 4 },
            { date: '2024-01-05', xp: 150, timeSpent: 50, challenges: 2 },
            { date: '2024-01-06', xp: 220, timeSpent: 80, challenges: 3 },
            { date: '2024-01-07', xp: 170, timeSpent: 55, challenges: 2 }
          ],
          categoryProgress: [
            { category: 'JavaScript', completed: 15, total: 20, xp: 850 },
            { category: 'React', completed: 8, total: 12, xp: 480 },
            { category: 'Algorithms', completed: 12, total: 18, xp: 720 },
            { category: 'CSS', completed: 6, total: 8, xp: 240 },
            { category: 'Node.js', completed: 4, total: 10, xp: 200 }
          ],
          skillDistribution: [
            { name: 'Frontend', value: 35, color: '#8884d8' },
            { name: 'Backend', value: 25, color: '#82ca9d' },
            { name: 'Algorithms', value: 20, color: '#ffc658' },
            { name: 'Database', value: 12, color: '#ff7300' },
            { name: 'DevOps', value: 8, color: '#00ff88' }
          ],
          weeklyComparison: [
            { week: 'Week 1', you: 450, average: 320 },
            { week: 'Week 2', you: 520, average: 340 },
            { week: 'Week 3', you: 480, average: 360 },
            { week: 'Week 4', you: 600, average: 380 }
          ],
          recentAchievements: [
            {
              id: 1,
              title: 'JavaScript Master',
              description: 'Completed 15 JavaScript challenges',
              icon: '🏆',
              earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
              rarity: 'Epic'
            },
            {
              id: 2,
              title: 'Speed Demon',
              description: 'Completed a challenge in under 10 minutes',
              icon: '⚡',
              earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
              rarity: 'Rare'
            },
            {
              id: 3,
              title: 'Consistent Learner',
              description: 'Maintained a 7-day learning streak',
              icon: '🔥',
              earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
              rarity: 'Common'
            }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    loadAnalytics();
  }, [timeframe]);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Common': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Progress & Analytics</h1>
          <p className="text-muted-foreground">Track your learning journey and performance insights.</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress & Analytics</h1>
          <p className="text-muted-foreground">Track your learning journey and performance insights.</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalXp.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Level {analyticsData.overview.level}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenges</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.challengesCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.averageScore}% avg score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analyticsData.overview.timeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.streak} day streak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
            <Trophy className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{analyticsData.overview.rank}</div>
            <p className="text-xs text-muted-foreground">
              of {analyticsData.overview.totalUsers.toLocaleString()} users
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          {/* Daily Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Daily Progress</span>
              </CardTitle>
              <CardDescription>Your XP and time spent over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [
                      name === 'xp' ? `${value} XP` : name === 'timeSpent' ? `${value} min` : value,
                      name === 'xp' ? 'XP Earned' : name === 'timeSpent' ? 'Time Spent' : 'Challenges'
                    ]}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="xp" stroke="#8884d8" strokeWidth={2} name="xp" />
                  <Line yAxisId="right" type="monotone" dataKey="timeSpent" stroke="#82ca9d" strokeWidth={2} name="timeSpent" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Heatmap Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Activity Overview</span>
              </CardTitle>
              <CardDescription>Your learning activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 49 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${
                      Math.random() > 0.7 ? 'bg-primary' :
                      Math.random() > 0.4 ? 'bg-primary/60' :
                      Math.random() > 0.2 ? 'bg-primary/30' : 'bg-muted'
                    }`}
                    title={`Day ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Less</span>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-muted rounded-sm"></div>
                  <div className="w-3 h-3 bg-primary/30 rounded-sm"></div>
                  <div className="w-3 h-3 bg-primary/60 rounded-sm"></div>
                  <div className="w-3 h-3 bg-primary rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Category Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.categoryProgress.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.completed}/{category.total}
                      </span>
                    </div>
                    <Progress value={(category.completed / category.total) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{Math.round((category.completed / category.total) * 100)}% complete</span>
                      <span>{category.xp} XP</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skill Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Skill Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.skillDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.skillDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Performance Comparison</span>
              </CardTitle>
              <CardDescription>How you compare to other learners</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.weeklyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} XP`, '']} />
                  <Legend />
                  <Bar dataKey="you" fill="#8884d8" name="Your XP" />
                  <Bar dataKey="average" fill="#82ca9d" name="Average XP" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Recent Achievements</span>
              </CardTitle>
              <CardDescription>Badges and milestones you've unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned {achievement.earnedAt.toLocaleDateString()}
                      </p>
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

export default ProgressPage;

