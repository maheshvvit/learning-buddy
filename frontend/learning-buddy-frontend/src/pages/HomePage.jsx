import { Link } from 'react-router-dom';
import { Brain, Target, Trophy, MessageCircle, BarChart3, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';

const HomePage = () => {
  const features = [
    {
      icon: Target,
      title: 'Interactive Challenges',
      description: 'Solve coding problems, quizzes, and interactive exercises tailored to your skill level.'
    },
    {
      icon: Brain,
      title: 'AI Learning Buddy',
      description: 'Get personalized guidance and recommendations from our AI-powered learning assistant.'
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Earn XP, unlock badges, and compete on leaderboards to stay motivated.'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track your learning journey with detailed analytics and performance insights.'
    },
    {
      icon: MessageCircle,
      title: '24/7 Support',
      description: 'Chat with our AI assistant anytime for help, explanations, and learning tips.'
    },
    {
      icon: Zap,
      title: 'Adaptive Learning',
      description: 'Our system adapts to your pace and learning style for optimal results.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Learning Buddy</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Your <span className="text-primary">24/7 Learning Partner</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Master new skills with personalized challenges, AI-powered guidance, 
            and gamified learning experiences designed to accelerate your growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth/register">Start Learning Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to learn effectively
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform combines the best of AI, gamification, 
              and personalized learning to help you achieve your goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to accelerate your learning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of learners who are already achieving their goals with Learning Buddy.
          </p>
          
          <Button size="lg" asChild>
            <Link to="/auth/register">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Learning Buddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

