const { getGeminiModel } = require('../config/gemini');

// Helper to validate the Gemini API Key
const isApiKeyInvalid = (key) => {
  return !key || key.trim() === '' || key.startsWith('YOUR_') || key.includes('placeholder') || key.length < 10;
};

// Helper to call Gemini with automatic retry AND model fallback for robustness
const callWithRetry = async (prompt, retries = 3, initialDelay = 1200) => {
  // Priority fallback list of models available under your API key
  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];
  let delay = initialDelay;

  for (let attempt = 0; attempt < retries; attempt++) {
    const modelName = modelsToTry[attempt % modelsToTry.length];
    try {
      console.log(`[Gemini API] Querying model: "${modelName}" (Attempt ${attempt + 1}/${retries})`);
      const model = getGeminiModel(modelName);
      return await model.generateContent(prompt);
    } catch (error) {
      const msg = error.message || '';
      const isRateLimit = msg.includes('429') || 
                          msg.includes('ResourceExhausted') || 
                          msg.includes('Quota exceeded') || 
                          msg.includes('Too Many Requests');
      
      if (isRateLimit && attempt < retries - 1) {
        const nextModel = modelsToTry[(attempt + 1) % modelsToTry.length];
        console.warn(`[Gemini API] Rate limit (429) hit on model "${modelName}". Automatically switching fallback to "${nextModel}" in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff factor
        continue;
      }
      throw error;
    }
  }
};

// Helper to get user-friendly Gemini errors
const getFriendlyErrorMessage = (error) => {
  const msg = error.message || '';
  if (msg.includes('429') || msg.includes('ResourceExhausted') || msg.includes('Quota exceeded') || msg.includes('Too Many Requests')) {
    return 'Rate limit exceeded (429) on all fallback models. The Gemini API free tier allows up to 15 requests per minute. Please wait a moment and try again, or check Google AI Studio to review your quota.';
  }
  if (msg.includes('404') || msg.includes('not found') || msg.includes('ModelService.ListModels')) {
    return 'Model not found (404). This usually indicates that the GEMINI_API_KEY in your backend/.env file is invalid, expired, or does not have access to the Gemini API (please check Google AI Studio).';
  }
  if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
    return 'The provided GEMINI_API_KEY is invalid. Please verify and update your backend/.env file with a correct key.';
  }
  return error.message;
};

// @desc    Generate product description using Google Gemini
// @route   POST /api/ai/generate-description
// @access  Private (Seller only)
const generateDescription = async (req, res) => {
  try {
    const { title, category, keywords } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Please provide a product title and category' });
    }

    if (isApiKeyInvalid(process.env.GEMINI_API_KEY)) {
      return res.status(400).json({ 
        message: 'Google Gemini API key is missing or invalid on the server. Please add a valid GEMINI_API_KEY in your backend/.env file.' 
      });
    }

    // Prompt construction
    const prompt = `You are an expert marketing copywriter for 'Sakhi Bazaar', an online marketplace that empowers women entrepreneurs. 
Write a highly compelling, professional, and warm product description for a product with the following details:
- Title: ${title}
- Category: ${category}
${keywords ? `- Additional key details/features: ${keywords}` : ''}

Rules:
1. Write in a warm, professional, storytelling style that highlights quality and entrepreneurship.
2. Keep the description between 80 to 120 words.
3. Return ONLY the plain text description itself. Do NOT include any intro text (like "Here is your description:"), markdown styling, titles, bullet lists, or placeholder variables.`;

    const result = await callWithRetry(prompt);
    const response = await result.response;
    const text = response.text().trim();

    res.json({ description: text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ message: 'AI generation failed: ' + getFriendlyErrorMessage(error) });
  }
};

// @desc    Generate marketing captions using Google Gemini
// @route   POST /api/ai/generate-caption
// @access  Private (Seller only)
const generateCaption = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide both title and description' });
    }

    if (isApiKeyInvalid(process.env.GEMINI_API_KEY)) {
      return res.status(400).json({ 
        message: 'Google Gemini API key is missing or invalid on the server. Please add a valid GEMINI_API_KEY in your backend/.env file.' 
      });
    }

    // Prompt construction
    const prompt = `You are a social media marketing expert for 'Sakhi Bazaar', an online platform showcasing women-owned businesses. 
Create one catchy, highly engaging social media caption (suitable for Instagram, WhatsApp, or Facebook) to promote this product:
- Product Title: ${title}
- Product Description: ${description}

Rules:
1. Include warm emojis and relevant hashtags (always include #SakhiBazaar and #WomenEntrepreneurs).
2. Keep the copy short, hook-driven, and persuasive.
3. Keep it under 50 words.
4. Return ONLY the caption text itself. Do NOT wrap it in quotation marks, and do NOT include headers or introductory labels.`;

    const result = await callWithRetry(prompt);
    const response = await result.response;
    const text = response.text().trim();

    res.json({ caption: text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ message: 'AI generation failed: ' + getFriendlyErrorMessage(error) });
  }
};

module.exports = {
  generateDescription,
  generateCaption,
};
