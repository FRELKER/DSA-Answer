require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Router
const apiRouter = express.Router();

apiRouter.post('/chat', async (req, res) => {
    try {
        const { userMessage, systemInstruction } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            console.error("Server configuration error: API Key not found.");
            return res.status(500).json({ error: "Server configuration error: API Key not found." });
        }
        
        const MODEL_NAME = "gemini-1.5-flash-latest";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        const requestPayload = {
            "contents": [{ "parts": [{ "text": userMessage }] }],
            "systemInstruction": { "parts": [{ "text": systemInstruction }] },
            "generationConfig": { "temperature": 0.7, "maxOutputTokens": 2048 }
        };
        
        const googleApiResponse = await axios.post(API_URL, requestPayload, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(googleApiResponse.data);

    } catch (error) {
        const errorMessage = error.response ? error.response.data.error.message : "An internal server error occurred.";
        console.error("Error in /api/chat:", errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});

// Tell the main app to use our new router for all routes starting with /api
app.use('/api', apiRouter);

// The app.get('*', ...) route has been REMOVED to prevent the crash.

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});