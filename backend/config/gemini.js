const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client with key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the default lightweight, fast model
const getGeminiModel = (modelName = 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = { getGeminiModel };
