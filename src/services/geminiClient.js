import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

class GeminiClient {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set in the environment variables');
        }
        this.client = new GoogleGenAI({
            apiKey: apiKey
        });
    }

    async generateContent(prompt) {
        const response = await this.client.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        return response.text;
    }
}

export default new GeminiClient();

