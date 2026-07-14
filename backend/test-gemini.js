const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

console.log('=== Gemini Model-Specific Diagnostics ===');
if (!key) {
  console.log('[-] GEMINI_API_KEY is not defined in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(key);

async function testModel(modelName) {
  try {
    console.log(`\nTesting model "${modelName}"...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log(`[SUCCESS] "${modelName}" responded: "${response.text().trim()}"`);
    return true;
  } catch (error) {
    console.log(`[FAILURE] "${modelName}" failed:`, error.message);
    return false;
  }
}

async function run() {
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.5-flash'
  ];

  for (const model of modelsToTest) {
    await testModel(model);
  }
}

run();
