import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  Zap, 
  Play, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Code,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  // Mock challenge data
  useEffect(() => {
    const loadChallenge = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setChallenge({
          id: parseInt(challengeId),
          title: 'JavaScript Fundamentals',
          description: 'Master the basics of JavaScript programming with interactive exercises covering variables, functions, and control structures.',
          category: 'Programming',
          difficulty: 'Beginner',
          estimatedTime: 30,
          rating: 4.8,
          xpReward: 100,
          prerequisites: ['Basic programming concepts'],
          learningObjectives: [
            'Understand JavaScript variables and data types',
            'Work with functions and scope',
            'Use conditional statements and loops',
            'Handle arrays and objects'
          ],
          type: 'quiz',
          questions: [
            {
              id: 1,
              type: 'multiple-choice',
              question: 'Which of the following is the correct way to declare a variable in JavaScript?',
              options: [
                'var myVariable = 5;',
                'variable myVariable = 5;',
                'v myVariable = 5;',
                'declare myVariable = 5;'
              ],
              correctAnswer: 0,
              explanation: 'In JavaScript, variables are declared using var, let, or const keywords.',
              points: 10
            },
            {
              id: 2,
              type: 'multiple-choice',
              question: 'What will be the output of: console.log(typeof null)?',
              options: [
                'null',
                'undefined',
                'object',
                'boolean'
              ],
              correctAnswer: 2,
              explanation: 'This is a known quirk in JavaScript. typeof null returns "object" due to a legacy bug.',
              points: 15
            },
            {
              id: 3,
              type: 'code',
              question: 'Write a function that takes two numbers and returns their sum:',
              placeholder: 'function addNumbers(a, b) {\n  // Your code here\n}',
              expectedOutput: '5',
              testCases: [
                { input: 'addNumbers(2, 3)', expected: '5' },
                { input: 'addNumbers(10, -5)', expected: '5' },
                { input: 'addNumbers(0, 0)', expected: '0' }
              ],
              points: 20
            },
            {
              id: 4,
              type: 'multiple-choice',
              question: 'Which method is used to add an element to the end of an array?',
              options: [
                'append()',
                'push()',
                'add()',
                'insert()'
              ],
              correctAnswer: 1,
              explanation: 'The push() method adds one or more elements to the end of an array.',
              points: 10
            }
          ],
          maxScore: 55,
          passingScore: 70
        });
        setIsLoading(false);
      }, 1000);
    };

    loadChallenge();
  }, [challengeId]);

  // Timer effect
  useEffect(() => {
    if (!isLoading && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoading, isSubmitted]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    // Calculate results
    let score = 0;
    const questionResults = challenge.questions.map(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      
      if (question.type === 'multiple-choice') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'code') {
        // Simple check for code questions (in real app, this would be more sophisticated)
        isCorrect = userAnswer && userAnswer.includes('return a + b');
      }
      
      if (isCorrect) {
        score += question.points;
      }
      
      return {
        questionId: question.id,
        userAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0
      };
    });

    const percentage = Math.round((score / challenge.maxScore) * 100);
    const passed = percentage >= challenge.passingScore;

    setResults({
      score,
      maxScore: challenge.maxScore,
      percentage,
      passed,
      questionResults,
      timeSpent,
      xpEarned: passed ? challenge.xpReward : Math.floor(challenge.xpReward * 0.5)
    });
    
    setIsSubmitted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isSubmitted && results) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/app/challenges')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </div>

        {/* Results */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              {results.passed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {results.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </CardTitle>
            <CardDescription>
              {results.passed 
                ? 'You successfully completed this challenge!' 
                : 'You can retake this challenge to improve your score.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {results.percentage}%
              </div>
              <p className="text-muted-foreground">
                {results.score} out of {results.maxScore} points
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(results.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.questionResults.filter(r => r.isCorrect).length}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.questionResults.filter(r => !r.isCorrect).length}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  +{results.xpEarned}
                </div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                Retake Challenge
              </Button>
              <Button variant="outline" onClick={() => navigate('/app/challenges')}>
                Browse More Challenges
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Review Your Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenge.questions.map((question, index) => {
              const result = results.questionResults.find(r => r.questionId === question.id);
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      {result.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {result.points}/{question.points} pts
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{question.question}</p>
                  {question.explanation && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = challenge.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / challenge.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/app/challenges')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{challenge.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeSpent)}
              </span>
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                {challenge.xpReward} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestion + 1} of {challenge.questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestion + 1}</span>
            <Badge variant="secondary">{currentQ.points} points</Badge>
          </CardTitle>
          <CardDescription>{currentQ.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQ.type === 'multiple-choice' && (
            <RadioGroup
              value={answers[currentQ.id]?.toString()}
              onValueChange={(value) => handleAnswerChange(currentQ.id, parseInt(value))}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQ.type === 'code' && (
            <div className="space-y-4">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList>
                  <TabsTrigger value="editor">Code Editor</TabsTrigger>
                  <TabsTrigger value="tests">Test Cases</TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <Textarea
                    placeholder={currentQ.placeholder}
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="font-mono text-sm min-h-[200px]"
                  />
                </TabsContent>
                <TabsContent value="tests">
                  <div className="space-y-2">
                    {currentQ.testCases.map((testCase, index) => (
                      <div key={index} className="bg-muted p-3 rounded text-sm">
                        <div className="font-mono">
                          <strong>Input:</strong> {testCase.input}
                        </div>
                        <div className="font-mono">
                          <strong>Expected:</strong> {testCase.expected}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button variant="outline" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          {currentQuestion < challenge.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={!answers[currentQ.id] && answers[currentQ.id] !== 0}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < challenge.questions.length}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Challenge
            </Button>
          )}
        </div>
      </div>

      {/* Hint */}
      {currentQ.explanation && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Hint</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Click "Submit Challenge" to see explanations for all questions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChallengeDetailPage;

