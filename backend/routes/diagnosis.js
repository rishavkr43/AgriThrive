const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_DIAGNOSIS_MODEL = process.env.GEMINI_DIAGNOSIS_MODEL || 'gemini-3.1-flash-lite';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify authentication
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST analyze crop image for disease
router.post('/analyze', verifyAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Convert image buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');

    // Prepare prompt for Gemini Vision
    const prompt = `You are an expert agricultural pathologist specializing in crop disease diagnosis. Analyze this crop/plant image and provide a detailed diagnosis.

**Task:**
Carefully examine the image and return a JSON response with this exact structure:

{
  "is_plant_image": true/false,
  "crop_identified": "crop name or 'Unknown'",
  "diagnosis": {
    "disease_detected": true/false,
    "disease_name": "specific disease name or 'Healthy' or 'Unknown'",
    "confidence": "high/medium/low",
    "severity": "mild/moderate/severe/none",
    "affected_parts": ["leaf", "stem", "fruit", etc.]
  },
  "symptoms_observed": [
    "symptom 1",
    "symptom 2"
  ],
  "possible_causes": [
    "cause 1",
    "cause 2"
  ],
  "treatment_recommendations": {
    "immediate_actions": [
      "action 1",
      "action 2"
    ],
    "chemical_treatments": [
      {
        "name": "pesticide/fungicide name",
        "application": "how to apply",
        "dosage": "recommended dosage"
      }
    ],
    "organic_treatments": [
      {
        "name": "organic remedy name",
        "preparation": "how to prepare",
        "application": "how to apply"
      }
    ],
    "preventive_measures": [
      "prevention tip 1",
      "prevention tip 2"
    ]
  },
  "additional_notes": "Any other important information or warnings"
}

**Important Guidelines:**
- If image is not a plant/crop, set "is_plant_image" to false and provide appropriate message
- Be specific about disease identification
- Provide practical, India-focused treatment options
- Include both chemical and organic solutions
- Mention preventive measures
- If unsure, set confidence to "low" and suggest consulting local agricultural expert
- Consider common Indian crop diseases`;

    // Call Gemini multimodal API
    const model = genAI.getGenerativeModel({
      model: GEMINI_DIAGNOSIS_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageBase64
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      return res.status(500).json({
        error: 'Failed to parse AI response',
        raw_response: text
      });
    }

    // Return diagnosis
    res.json({
      image_info: {
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      },
      analysis: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Diagnosis error:', error);

    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(500).json({
        error: 'Gemini API key is invalid. Create a valid Gemini API key in Google AI Studio and set GEMINI_API_KEY in the backend environment.',
        model: GEMINI_DIAGNOSIS_MODEL
      });
    }

    res.status(500).json({ error: error.message, model: GEMINI_DIAGNOSIS_MODEL });
  }
});

module.exports = router;
