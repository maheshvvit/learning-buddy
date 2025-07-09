const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateChatResponse = async (messages, options = {}) => {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      ...options
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

const generateLearningPath = async (userProfile, preferences) => {
  const prompt = `
    Based on the following user profile and preferences, generate a personalized learning path:
    
    User Profile: ${JSON.stringify(userProfile)}
    Preferences: ${JSON.stringify(preferences)}
    
    Please provide a structured learning path with:
    1. Recommended topics/subjects
    2. Difficulty progression
    3. Estimated timeline
    4. Learning objectives
    
    Format the response as JSON.
  `;

  try {
    const response = await generateChatResponse([
      { role: 'system', content: 'You are an expert learning advisor.' },
      { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating learning path:', error);
    throw error;
  }
};

const analyzeWeaknesses = async (performanceData) => {
  const prompt = `
    Analyze the following performance data and identify learning weaknesses:
    
    Performance Data: ${JSON.stringify(performanceData)}
    
    Please provide:
    1. Identified weak areas
    2. Recommended focus topics
    3. Suggested practice exercises
    4. Improvement strategies
    
    Format the response as JSON.
  `;

  try {
    const response = await generateChatResponse([
      { role: 'system', content: 'You are an expert learning analyst.' },
      { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing weaknesses:', error);
    throw error;
  }
};

module.exports = {
  openai,
  generateChatResponse,
  generateLearningPath,
  analyzeWeaknesses,
};

