class Engine {
    constructor(blockRegistry) {
        this.blockRegistry = blockRegistry;
    }

    validate(workflow) {
        if (typeof workflow !== 'object' || workflow === null) {
            throw new Error("Workflow must be an object");
        }
        if (!Array.isArray(workflow.edges) || !Array.isArray(workflow.nodes)) {
            throw new Error("Workflow must have edges and nodes arrays");
        }

        const set = new Set();
        workflow.nodes.forEach(node => {
            if (!node.id || !node.type) {
            throw new Error("Each node must have an id and type");
             }
            if (set.has(node.id)) {
                throw new Error(`Duplicate node id found: ${node.id}`);
            }
            if (!this.blockRegistry[node.type]) {
                throw new Error(`Unknown block type: ${node.type}`);
            }
            set.add(node.id);
});

        workflow.edges.forEach(edge =>{
            if(!edge.id || !edge.source || !edge.target){
                throw new Error("Each edge must have an id, source and target");
            }
            if(!set.has(edge.source)){
                throw new Error(`Edge source ${edge.source} does not exist`);
            }
            if(!set.has(edge.target)){
                throw new Error(`Edge target ${edge.target} does not exist`);
            }
            if(edge.source === edge.target){
                throw new Error(`Edge cannot have the same source and target: ${edge.source}`);
            }

        })
    }

    buildGraph(workflow) {
        const graph = {};
        const inDegree = {};
        workflow.nodes.forEach(node => {
            graph[node.id] = [];
            inDegree[node.id] = 0;
        });
        workflow.edges.forEach(edge => {
            graph[edge.source].push(edge.target);
            inDegree[edge.target]++;
        });
        return { graph, inDegree };
    }


    buildLevels(graph, inDegree) {
    const levels = [];
    let queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);

    while (queue.length > 0) {
        const currentLevel = [...queue];
        levels.push(currentLevel);

        const nextQueue = [];

        currentLevel.forEach(node => {
            graph[node].forEach(neighbor => {
                inDegree[neighbor]--;
                if (inDegree[neighbor] === 0) {
                    nextQueue.push(neighbor);
                }
            });
        });

        queue = nextQueue;
    }

    return levels;
}
    

    async run(workflow) {
        this.validate(workflow);
        const { graph, inDegree } = this.buildGraph(workflow);
        const levels = this.buildLevels(graph, inDegree);
        const outputs = {};
        const startedAt = new Date();
        const finalOutputs = {
            startedAt,
            finishedAt: null,
            results: [],
        };

        const nodeMap = new Map();
        const incomingEdges = new Map();

        workflow.nodes.forEach(node => nodeMap.set(node.id,node));

        workflow.edges.forEach(edge => {
            if (!incomingEdges.has(edge.target)) {
                incomingEdges.set(edge.target, []);
            }
            incomingEdges.get(edge.target).push(edge.source);
        });
        
        for (const level of levels) {
    await Promise.all(level.map(async (nodeId) => {
        const node = nodeMap.get(nodeId);

        if (!node) {
            throw new Error(`Node with id ${nodeId} not found`);
        }

        const block = this.blockRegistry[node.type];

        let input = {};

        if (incomingEdges.has(nodeId)) {
            incomingEdges.get(nodeId).forEach(sourceId => {
                input = { ...input, ...outputs[sourceId] };
            });
        }

        try {
            const currentOutput = await block.execute(input, node.data);
            outputs[node.id] = currentOutput;
            finalOutputs.results.push({
                nodeId: node.id,
                type: node.type,
                status: "success",
                output: currentOutput,
                error: null,
            });
        } catch (error) {
            finalOutputs.results.push({
                nodeId: node.id,
                type: node.type,
                status: "failed",
                output: null,
                error: error.message,
            });
            finalOutputs.finishedAt = new Date();
            const err = new Error(`Error executing node ${node.id} of type ${node.type}: ${error.message}`);
            err.execution = finalOutputs;
            throw err;
        }
    }));
        }

        finalOutputs.finishedAt = new Date();
        return finalOutputs;
    }
}
    
export default Engine;