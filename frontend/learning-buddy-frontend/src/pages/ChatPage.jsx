import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  BookOpen, 
  Target,
  Sparkles,
  MessageCircle,
  Plus,
  MoreVertical
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useAuthStore } from '../stores/authStore';

const ChatPage = () => {
  const { sessionId } = useParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock data for demonstration
  useEffect(() => {
    const loadChatData = () => {
      // Mock chat sessions
      setChatSessions([
        {
          id: '1',
          title: 'JavaScript Learning Help',
          lastMessage: 'Great! You\'re making good progress with functions.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          messageCount: 12
        },
        {
          id: '2',
          title: 'React Components Question',
          lastMessage: 'Let me explain the difference between props and state...',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          messageCount: 8
        },
        {
          id: '3',
          title: 'Algorithm Help',
          lastMessage: 'Here\'s a step-by-step approach to solving this problem.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          messageCount: 15
        }
      ]);

      // Mock current session
      if (sessionId) {
        setCurrentSession(sessionId);
        setMessages([
          {
            id: 1,
            type: 'ai',
            content: 'Hello! I\'m your AI Learning Buddy. I\'m here to help you with any questions about programming, concepts, or challenges. What would you like to learn about today?',
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            suggestions: [
              'Explain JavaScript closures',
              'Help with React hooks',
              'Algorithm practice problems',
              'Code review assistance'
            ]
          },
          {
            id: 2,
            type: 'user',
            content: 'Can you help me understand how JavaScript closures work?',
            timestamp: new Date(Date.now() - 1000 * 60 * 8)
          },
          {
            id: 3,
            type: 'ai',
            content: 'Absolutely! Closures are a fundamental concept in JavaScript. A closure is created when a function is defined inside another function and has access to the outer function\'s variables.\n\nHere\'s a simple example:\n\n```javascript\nfunction outerFunction(x) {\n  // This is the outer function\'s scope\n  \n  function innerFunction(y) {\n    // This inner function has access to \'x\'\n    return x + y;\n  }\n  \n  return innerFunction;\n}\n\nconst addFive = outerFunction(5);\nconsole.log(addFive(3)); // Output: 8\n```\n\nThe inner function "closes over" the variable `x` from the outer function, even after the outer function has finished executing. This is what makes it a closure!',
            timestamp: new Date(Date.now() - 1000 * 60 * 7),
            codeExample: true
          },
          {
            id: 4,
            type: 'user',
            content: 'That makes sense! Can you show me a practical use case?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5)
          },
          {
            id: 5,
            type: 'ai',
            content: 'Great question! Here\'s a practical example using closures to create a counter:\n\n```javascript\nfunction createCounter() {\n  let count = 0;\n  \n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getCount: () => count\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter.increment()); // 1\nconsole.log(counter.increment()); // 2\nconsole.log(counter.getCount());  // 2\n```\n\nThe `count` variable is private and can only be accessed through the returned methods. This is a common pattern for data encapsulation in JavaScript!',
            timestamp: new Date(Date.now() - 1000 * 60 * 3),
            codeExample: true,
            suggestions: [
              'Show me more closure examples',
              'Explain scope chain',
              'What are common closure pitfalls?'
            ]
          }
        ]);
      } else {
        // New chat session
        setMessages([
          {
            id: 1,
            type: 'ai',
            content: 'Hello! I\'m your AI Learning Buddy. I\'m here to help you with any questions about programming, concepts, or challenges. What would you like to learn about today?',
            timestamp: new Date(),
            suggestions: [
              'Explain JavaScript closures',
              'Help with React hooks',
              'Algorithm practice problems',
              'Code review assistance',
              'Debug my code',
              'Recommend learning path'
            ]
          }
        ]);
      }
    };

    loadChatData();
  }, [sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Open SSE connection to backend
      const response = await fetch(`/api/ai/chat/${currentSession}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: inputMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let aiContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;

        // Update AI message dynamically
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.type === 'ai' && lastMessage.id === 'streaming') {
            // Update existing streaming message
            const updated = [...prev];
            updated[updated.length - 1] = { ...lastMessage, content: aiContent };
            return updated;
          } else {
            // Add new streaming message
            return [...prev, { id: 'streaming', type: 'ai', content: aiContent, timestamp: new Date() }];
          }
        });
      }

      // Finalize AI message
      setMessages(prev => {
        const updated = [...prev];
        const index = updated.findIndex(m => m.id === 'streaming');
        if (index !== -1) {
          updated[index] = { ...updated[index], id: Date.now() };
        }
        return updated;
      });

    } catch (error) {
      console.error('Error receiving AI response:', error);
      setMessages(prev => [...prev, { id: Date.now(), type: 'ai', content: "Sorry, I couldn't process your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (message) => {
    // Simple mock AI responses based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('react')) {
      return 'React is a powerful JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM for efficient updates. What specific aspect of React would you like to explore?';
    } else if (lowerMessage.includes('javascript')) {
      return 'JavaScript is a versatile programming language that powers the web. It supports multiple programming paradigms and has many powerful features. What JavaScript concept would you like me to explain?';
    } else if (lowerMessage.includes('algorithm')) {
      return 'Algorithms are step-by-step procedures for solving problems. Understanding algorithms helps you write more efficient code and solve complex problems. Which type of algorithm are you interested in learning about?';
    } else {
      return 'That\'s an interesting question! I\'d be happy to help you understand this concept better. Could you provide more context or specify what particular aspect you\'d like me to focus on?';
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Chat Sessions Sidebar */}
      <div className="w-80 flex flex-col">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Chat Sessions</span>
              </CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 p-4">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSession === session.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{session.title}</h4>
                        <p className="text-sm opacity-70 truncate mt-1">
                          {session.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-60">
                            {formatTime(session.timestamp)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {session.messageCount}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Export</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Lightbulb className="w-4 h-4 mr-2" />
              Get Learning Tips
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Explain Concept
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Target className="w-4 h-4 mr-2" />
              Practice Problems
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">AI Learning Buddy</h2>
                <p className="text-sm text-muted-foreground">Always here to help you learn</p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Powered</span>
            </Badge>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  } rounded-lg p-4`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <Bot className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-5 h-5 text-primary-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`${message.codeExample ? 'space-y-2' : ''}`}>
                        {message.content.split('\n').map((line, index) => {
                          if (line.startsWith('```')) {
                            return null; // Skip code block markers
                          }
                          if (message.codeExample && line.trim() && !line.includes('```')) {
                            return (
                              <pre key={index} className="bg-black text-green-400 p-2 rounded text-sm overflow-x-auto">
                                <code>{line}</code>
                              </pre>
                            );
                          }
                          return line ? (
                            <p key={index} className="text-sm leading-relaxed">
                              {line}
                            </p>
                          ) : (
                            <br key={index} />
                          );
                        })}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-60">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs opacity-60 mb-2">Suggested follow-ups:</p>
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="mr-2 mb-1 text-xs h-7"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask me anything about programming, concepts, or challenges..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AI responses are generated for demonstration. In a real app, this would connect to OpenAI's API.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;

