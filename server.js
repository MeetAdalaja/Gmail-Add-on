const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Generate Email Endpoint (Supports Compose and Reply)
app.post("/generate-email", async (req, res) => {
    const {
        mode,
        scenario,
        replyEmail,
        recipientDetails,
        additionalInfo,
        style,
        tone,
        creativityLevel,
        language,
        useEmojis,
    } = req.body;

    try {
        let prompt = "";
        if (mode === "compose") {
            prompt = `Write an email in ${language} with a ${tone} tone and ${style} style. Scenario: ${scenario}. Recipient: ${recipientDetails}. Creativity level: ${creativityLevel}. ${
                useEmojis ? "Use emojis where appropriate." : "Do not use emojis."
            } Additional instructions: ${additionalInfo || "None"}.`;
        } else if (mode === "reply") {
            prompt = `Write a reply to this email in ${language}: "${replyEmail}". Use a ${tone} tone and ${style} style. Creativity level: ${creativityLevel}. ${
                useEmojis ? "Use emojis where appropriate." : "Do not use emojis."
            } Additional instructions: ${additionalInfo || "None"}.`;
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.CHATGPT_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const generatedContent = response.data.choices[0].message.content;
        res.json({ content: generatedContent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate content" });
    }
});

// Improve Email Endpoint
app.post("/improve-content", async (req, res) => {
    const { content, instructions } = req.body;

    try {
        const prompt = `Improve this email content: "${content}". Instructions: ${instructions}.`;
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.CHATGPT_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const improvedContent = response.data.choices[0].message.content;
        res.json({ content: improvedContent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to improve content" });
    }
});

// Feedback Endpoint
app.post("/feedback", (req, res) => {
    const { content, feedback } = req.body;
    console.log(`Feedback for content "${content}": ${feedback}`);
    res.json({ message: "Feedback received" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});