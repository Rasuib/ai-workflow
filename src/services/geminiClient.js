import { GoogleGenAI } from "@google/genai";

class GeminiClient {
    constructor() {
        this.client = new GoogleGenAI({});
    }

    async generateContent(prompt) {
        const response = await this.client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        return response.text;
    }
}

export default new GeminiClient();

