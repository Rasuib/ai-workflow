import geminiClient from "../services/geminiClient.js";   
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const BLOCKS = {
    trigger : {
        type : 'trigger',
        execute : async(input,data) => {
            return { text: data.text };
        }
    },
    sentiment : {
        type : 'sentiment',
        execute : async(input,data) => {
        if (!input.text) {
                throw new Error("Sentiment block requires 'text' input");
        }
        const prompt = `Analyze the sentiment of the following text and return whether the sentiment is POSITIVE or NEGATIVE: ${input.text}. Respond with only one word, POSITIVE or NEGATIVE.Do not include any additional text or explanation. Do not include the original text in your response. Do not use any punctuation in your response.`;
        const sentiment = await geminiClient.generateContent(prompt);
        const validSentiment = sentiment.trim().toUpperCase();
        if (validSentiment !== "POSITIVE" && validSentiment !== "NEGATIVE") {
            throw new Error(`Invalid sentiment analysis result: ${sentiment}`);
        }

        return {sentiment : validSentiment};
        }
      
    },
    email : {
        type : 'email',
        execute : async(input,data) => {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: data.to,
                subject: data.subject,
                text: `Workflow sentiment result: ${input.sentiment}`,
            });

            return { emailSent: true, to: data.to };
        }
    }
}
export default BLOCKS;
