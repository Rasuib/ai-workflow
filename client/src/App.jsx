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
    summarize: CustomNode,
};
function AppContent() {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const onNodeClick = (event, node) => {
    setSelectedNodeId(node.id);
  };

  const handleSaveWorkflow = async () => {
    const workflow = serializeWorkflow(nodes, edges);
    try {
      const response = await axios.post('http://localhost:3000/webhook/save', workflow);
      setWebhookUrl(response.data.webhookUrl);
      
    } catch (error) {
      console.error('Error saving workflow:', error.response ? error.response.data : error.message);
      
    }
  };
  const handleExecute = async () => {
    const workflow = serializeWorkflow(nodes, edges);
    setLoading(true);
    try{
      
      const response = await axios.post('http://localhost:3000/workflow/execute', workflow);
      console.log('Execution results:', response.data);
      setResults(response.data);


      const resultMap = {};
      response.data.outputs.results.forEach(result => {
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
    }finally{
      setLoading(false);
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
  <div style={{
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px',
}}>
    <button 
    onClick={handleExecute}
    disabled={loading}
    style={{
        padding: '12px 32px',
        background: loading ? '#4338ca' : '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '16px',
    }}
>
    {loading ? 'Running...' : 'Execute Workflow'}
</button>
<button
  onClick={handleSaveWorkflow}
  style={{
        padding: '12px 32px',
        background: loading ? '#4338ca' : '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '16px',
    }}
>
  Save WorkFlow
</button>

</div>
{webhookUrl && (
    <div style={{
        background: '#1e1e2f',
        color: '#22c55e',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        wordBreak: 'break-all',
        maxWidth: '300px',
        textAlign: 'center'
    }}>
        Webhook URL: {webhookUrl}
    </div>
)}
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