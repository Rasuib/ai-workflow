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

    topoSort(workflow) {
        const { graph, inDegree } = this.buildGraph(workflow);
        const queue = [];
        for (const node in inDegree) {
            if (inDegree[node] === 0) {
                queue.push(node);
            }
        }
        const sorted = [];
        while (queue.length > 0) {
            const node = queue.shift();
            sorted.push(node);
            graph[node].forEach(neighbor => {
                inDegree[neighbor]--;
                if (inDegree[neighbor] === 0) {
                    queue.push(neighbor);
                }
            });
        }
        if (sorted.length !== workflow.nodes.length) {
            throw new Error("Workflow contains a cycle");
        }
        return sorted;
    }

    async run(workflow) {
        this.validate(workflow);
        const executionOrder = this.topoSort(workflow);
        const outputs = {};
        const startedAt = new Date();
        const finalOutputs = {
            startedAt,
            finishedAt: null,
            results: [],
        };

        for (const nodeId of executionOrder) {
            const node = workflow.nodes.find(n => n.id === nodeId);
            if (!node) {
                throw new Error(`Node with id ${nodeId} not found`);
            }
            const block = this.blockRegistry[node.type];
            if (!block) {
                throw new Error(`Unknown Block Type: ${node.type}`);
            }

            let input = {};
            workflow.edges.forEach(edge => {
                if (edge.target === nodeId) {
                    input = { ...input, ...outputs[edge.source] };
                }
            });

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
                outputs[node.id] = { error: error.message };
                finalOutputs.results.push({
                    nodeId: node.id,
                    type: node.type,
                    status: "failed",
                    output: outputs[node.id],
                    error: error.message,
                });
                finalOutputs.finishedAt = new Date();
                throw {
                    message: `Error executing node ${node.id} of type ${node.type}: ${error.message}`,
                    execution: finalOutputs,
                };
            }
        } 

        finalOutputs.finishedAt = new Date(); 
        return finalOutputs;
    }
}

export default Engine;