import Engine from "./src/engine/engine.js";
import blocks from "./src/engine/blockRegistry.js";

const myEngine = new Engine(blocks);
const mockWorkflow = {
    nodes: [
        { id: 'node-3', type: 'email', data: { to: 'manager@company.com' } },
        { id: 'node-1', type: 'trigger', data: { source: 'webhook' } },
        { id: 'node-2', type: 'sentiment', data: { model: 'gemini' } }
    ],
    edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' }, 
        { id: 'edge-2', source: 'node-2', target: 'node-3' }  
    ]
};


console.log("Running Workflow...");
myEngine.run(mockWorkflow).then(outputs => {
    console.log("Workflow Outputs:", outputs);
});

export default myEngine;










