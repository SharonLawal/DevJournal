// backend/routes/aiRoutes.js

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Ensure GEMINI_API_KEY is loaded from environment variables (e.g., via dotenv in server.js)
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    console.error('SERVER ERROR: GEMINI_API_KEY is not set in environment variables! AI features will not work.');
    // In a production app, you might want to return an error here or disable AI routes
    // For now, we'll let it proceed but log the error.
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
// Using gemini-1.5-flash for general chat and contextual insights
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- General AI Chat Endpoint ---
// POST /api/ai/chat
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text(); // Get the text from the AI's response

        res.json({ reply: text });

    } catch (error) {
        console.error('Error calling Gemini API for general chat:', error);
        res.status(500).json({ error: 'Failed to get a response from the AI assistant.', details: error.message });
    }
});

// --- Journal Insights AI Endpoint ---
// POST /api/ai/journal-insights
router.post('/journal-insights', async (req, res) => {
    const { journalEntryContent } = req.body; // Expect the journal content here

    if (!journalEntryContent) {
        return res.status(400).json({ error: 'Journal entry content is required for insights.' });
    }

    try {
        // --- PROMPT ENGINEERING: Crucial for tailored AI responses! ---
        const prompt = `You are an insightful and helpful AI assistant specializing in personal development, well-being, and learning. Your task is to provide constructive analysis and recommendations based on user journal entries.

Based on the following journal entry, please provide:
1.  **Suggested Solutions/Actionable Steps:** Offer practical ideas or steps the user could take to address challenges, achieve goals, or improve aspects mentioned in their entry.
2.  **Reading/Resource Recommendations:** Suggest specific topics, types of resources (e.g., books, articles, online courses), or areas of study related to the themes or challenges in the journal entry.

Format your response clearly with two main headings: "### Suggested Solutions" and "### Reading Recommendations". Use bullet points or numbered lists within each section for clarity. If the entry is generally positive, focus on reinforcing good habits or suggesting ways to further build on successes. If the entry is short or lacks specific challenges, offer general encouragement or broad well-being tips.

Journal Entry:
---
${journalEntryContent}
---

Your Response:
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text(); // Get the text from the AI's response

        res.json({ insights: text });

    } catch (error) {
        console.error('Error calling Gemini API for journal insights:', error);
        res.status(500).json({ error: 'Failed to generate insights from the AI.', details: error.message });
    }
});

module.exports = router;