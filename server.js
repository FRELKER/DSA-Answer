// This MUST be the first line to ensure environment variables are loaded
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Route
app.post('/api/chat', async (req, res) => {
    console.log("Received a request for /api/chat"); // <-- DEBUGGING LINE 1

    try {
        const { userMessage, systemInstruction } = req.body;

        // This is where we check for the key.
        const API_KEY = process.env.GEMINI_API_KEY;

        // Let's see what the server thinks the key is.
        console.log("Attempting to use API Key:", API_KEY ? `Key of length ${API_KEY.length}` : "Key is UNDEFINED"); // <-- DEBUGGING LINE 2

        if (!API_KEY) {
            // This is the error you are getting.
            console.error("Error: GEMINI_API_KEY is not defined in the environment."); // <-- DEBUGGING LINE 3
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
        console.error("Full error object:", error); // <-- DEBUGGING LINE 4
        const errorMessage = error.response ? error.response.data.error.message : "An internal server error occurred.";
        res.status(500).json({ error: errorMessage });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("Current working directory:", process.cwd());
    if (process.env.GEMINI_API_KEY) {
        console.log("SUCCESS: GEMINI_API_KEY was found on startup.");
    } else {
        console.log("FAILURE: GEMINI_API_KEY was NOT found on startup.");
    }
});