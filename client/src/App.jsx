import { useNodesState, useEdgesState, ReactFlow, useReactFlow, ReactFlowProvider,addEdge , Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import BlockPanel from './components/BlockPanel';
import { useCallback, useState } from 'react';
import CustomNode from './components/CustomNode.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';
import axios from 'axios';

const nodeTypes = {
    trigger: CustomNode,
    sentiment: CustomNode,
    email: CustomNode,
};
function AppContent() {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [results, setResults] = useState(null);

  const onNodeClick = (event, node) => {
    setSelectedNodeId(node.id);
  };

  const handleExecute = async () => {
    const workflow = serializeWorkflow(nodes, edges);
    try{
      const response = await axios.post('http://localhost:3000/workflow/execute', workflow);
      console.log('Execution results:', response.data);
      setResults(response.data);


      const resultMap = {};
      response.data.results.forEach(result => {
        resultMap[result.nodeId] = result;
      });
      
      setNodes((nds) => nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          executionResult: resultMap[n.id] || null,
        },
      })));

      
    }
    catch (error) { 
      console.error('Execution error:', error.response ? error.response.data : error.message);
      setResults({ error: error.response ? error.response.data : error.message });
    }
  }
  const onConfigClose = () => {
    setSelectedNodeId(null);
  }

  const onDragOver = (event) => {
    event.preventDefault();
  };
  
  const onDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('type');
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: { text : type },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const serializeWorkflow = (nodes, edges) => {
    return {
      nodes: nodes.map((node) => {
        const { id, type, data } = node;
        return { id, type, data };
      }),
      edges: edges.map((edge) => {
        const { id, source, target } = edge;
        return { id, source, target };
      }),
    };
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <BlockPanel />
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onEdgesChange={onEdgesChange}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Background />
          <div style={{ 
    position: 'absolute', 
    bottom: '20px', 
    left: '50%', 
    transform: 'translateX(-50%)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
}}>
    <button onClick={handleExecute} style={{
        padding: '12px 32px',
        background: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
    }}>
        Execute Workflow
    </button>
</div>
          
        </ReactFlow>
      </div>
      <ConfigPanel selectedNode={nodes.find(n => n.id === selectedNodeId)} setNodes={setNodes} />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;