import { Router } from "express"
import Engine from "../engine/engine.js";
import blocks from "../engine/blockRegistry.js";
import geminiClient from "../services/geminiClient.js";
const router = Router();

const engine = new Engine(blocks);
router.post('/execute',async(req,res,next)=>{
    const workflow = req.body;

    
    try{
        const outputs = await engine.run(workflow);
        res.json({outputs});
    }catch(err){
        if (err.execution) {
    err.status = 500;
    } else {
        err.status = 400;
    }

        next(err);
    }
});

router.post('/generate', async (req, res, next) => {
    const userDescription = req.body.description;

    try {
        const prompt = `You are a workflow generator. Generate a valid workflow JSON based on the user's description.

Available block types:
- trigger: Starting point of workflow. Has data.text field (will be overridden by webhook)
- sentiment: Analyzes text sentiment. Returns POSITIVE or NEGATIVE
- summarize: Summarizes text using AI
- email: Sends an email. Requires data.to and data.subject fields

The workflow JSON must follow this exact structure:
{
    "nodes": [
        { "id": "node-1", "type": "trigger", "data": { "text": "" } },
        { "id": "node-2", "type": "sentiment", "data": {} }
    ],
    "edges": [
        { "id": "edge-1", "source": "node-1", "target": "node-2" }
    ]
}

Rules:
- Always start with a trigger node
- Only use the block types listed above
- Every node must be connected
- Return ONLY the raw JSON, no explanation, no markdown, no backticks

User description: ${userDescription}`;
        const generatedWorkflow = await geminiClient.generateContent(prompt);
        const parsedWorkflow = JSON.parse(generatedWorkflow);
        res.json({ workflow: parsedWorkflow });
    } catch (err) {
        console.error('Error generating workflow:', err);
        res.status(500).json({ error: 'Failed to generate workflow' });
    }
});

export default router;
