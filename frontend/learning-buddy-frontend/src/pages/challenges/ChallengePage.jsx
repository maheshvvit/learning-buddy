import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Target, 
  Clock, 
  Star, 
  Trophy,
  Code,
  Brain,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { challengeService } from '../../services/challengeService';

const ChallengePage = () => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data for demonstration
  useEffect(() => {
    const loadChallenges = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setChallenges([
          {
            id: 1,
            title: 'JavaScript Fundamentals',
            description: 'Master the basics of JavaScript programming with interactive exercises.',
            category: 'Programming',
            difficulty: 'Beginner',
            estimatedTime: 30,
            rating: 4.8,
            completions: 1250,
            xpReward: 100,
            userProgress: { completed: true, score: 92 },
            tags: ['JavaScript', 'Fundamentals', 'Variables']
          },
          {
            id: 2,
            title: 'React Hooks Deep Dive',
            description: 'Advanced concepts in React Hooks including custom hooks and optimization.',
            category: 'Frontend',
            difficulty: 'Advanced',
            estimatedTime: 45,
            rating: 4.9,
            completions: 890,
            xpReward: 200,
            userProgress: { completed: false, attempts: 2 },
            tags: ['React', 'Hooks', 'Advanced']
          },
          {
            id: 3,
            title: 'Algorithm Complexity',
            description: 'Understanding Big O notation and analyzing algorithm performance.',
            category: 'Computer Science',
            difficulty: 'Intermediate',
            estimatedTime: 60,
            rating: 4.7,
            completions: 650,
            xpReward: 150,
            userProgress: null,
            tags: ['Algorithms', 'Big O', 'Performance']
          },
          {
            id: 4,
            title: 'Database Design Principles',
            description: 'Learn to design efficient and scalable database schemas.',
            category: 'Backend',
            difficulty: 'Intermediate',
            estimatedTime: 40,
            rating: 4.6,
            completions: 420,
            xpReward: 120,
            userProgress: { completed: true, score: 88 },
            tags: ['Database', 'SQL', 'Design']
          },
          {
            id: 5,
            title: 'Machine Learning Basics',
            description: 'Introduction to machine learning concepts and algorithms.',
            category: 'AI/ML',
            difficulty: 'Beginner',
            estimatedTime: 50,
            rating: 4.5,
            completions: 780,
            xpReward: 180,
            userProgress: null,
            tags: ['Machine Learning', 'AI', 'Algorithms']
          },
          {
            id: 6,
            title: 'Advanced CSS Layouts',
            description: 'Master CSS Grid, Flexbox, and modern layout techniques.',
            category: 'Frontend',
            difficulty: 'Intermediate',
            estimatedTime: 35,
            rating: 4.8,
            completions: 950,
            xpReward: 110,
            userProgress: { completed: false, attempts: 1 },
            tags: ['CSS', 'Layout', 'Grid', 'Flexbox']
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    loadChallenges();
  }, []);

  const categories = ['all', 'Programming', 'Frontend', 'Backend', 'Computer Science', 'AI/ML'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Programming': return Code;
      case 'Frontend': return Target;
      case 'Backend': return Brain;
      case 'Computer Science': return Brain;
      case 'AI/ML': return Zap;
      default: return Target;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Challenges</h1>
            <p className="text-muted-foreground">Explore and solve interactive challenges to improve your skills.</p>
          </div>
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
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">Explore and solve interactive challenges to improve your skills.</p>
        </div>
        <Button asChild>
          <Link to="/app/learning-paths">Browse Learning Paths</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredChallenges.length} of {challenges.length} challenges
        </p>
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => {
          const CategoryIcon = getCategoryIcon(challenge.category);
          
          return (
            <Card key={challenge.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CategoryIcon className="w-4 h-4 text-primary" />
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  {challenge.userProgress?.completed && (
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {challenge.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {challenge.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{challenge.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{challenge.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{challenge.xpReward} XP</span>
                  </div>
                </div>

                {/* Progress */}
                {challenge.userProgress && (
                  <div className="text-sm">
                    {challenge.userProgress.completed ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Trophy className="w-4 h-4" />
                        <span>Completed - {challenge.userProgress.score}%</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        {challenge.userProgress.attempts} attempt{challenge.userProgress.attempts !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {challenge.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {challenge.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{challenge.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Action */}
                <Button asChild className="w-full group">
                  <Link to={`/app/challenges/${challenge.id}`} className="flex items-center justify-center">
                    {challenge.userProgress?.completed ? 'Review' : 'Start Challenge'}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No challenges found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default ChallengePage;

