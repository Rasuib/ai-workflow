import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Engine from '../engine/engine.js';
import blocks from '../engine/blockRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS_PATH = join(__dirname, '../data/workflows.json');

const router = Router();
const engine = new Engine(blocks);

router.post('/save/',(req,res) =>{
    const workflowData = req.body;
    const fileData = readFileSync(WORKFLOWS_PATH, 'utf-8');
    const workflows = JSON.parse(fileData);
    const workflowId = `workflow-${Date.now()}`;
    workflows[workflowId] = workflowData;
    writeFileSync(WORKFLOWS_PATH, JSON.stringify(workflows, null, 2));
    res.json({ id: workflowId, webhookUrl: `http://localhost:3000/webhook/${workflowId}` });

})

router.post('/:id',async(req,res,next)=>{
    const workFlowId = req.params.id;
    const injectionText = req.body.text;

    const fileData = readFileSync(WORKFLOWS_PATH, 'utf-8');
    const workflows = JSON.parse(fileData);
    
    const workflow = workflows[workFlowId];
    if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
    }

    
    const triggerNode = workflow.nodes.find(node => node.type === 'trigger');
    if (triggerNode) {
        triggerNode.data = triggerNode.data || {};
        triggerNode.data.text = injectionText;
    }

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

export default router;



    

