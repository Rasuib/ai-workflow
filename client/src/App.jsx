import { useNodesState, useEdgesState, ReactFlow, useReactFlow, ReactFlowProvider, addEdge, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState } from 'react';
import axios from 'axios';
import BlockPanel from './components/BlockPanel';
import CustomNode from './components/CustomNode.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';

const nodeTypes = {
  trigger: CustomNode,
  sentiment: CustomNode,
  email: CustomNode,
  summarize: CustomNode,
};

const buttonStyle = {
  padding: '12px 32px',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer',
};

function AppContent() {
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const [webhookUrl, setWebhookUrl] = useState(null);

  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const serializeWorkflow = (nodes, edges) => ({
    nodes: nodes.map(({ id, type, data }) => ({ id, type, data })),
    edges: edges.map(({ id, source, target }) => ({ id, source, target })),
  });

  const onNodeClick = (_event, node) => setSelectedNodeId(node.id);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = (event) => event.preventDefault();

  const onDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('type');
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setNodes((prev) => [
      ...prev,
      { id: `node-${Date.now()}`, type, position, data: { text: type } },
    ]);
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setGenerateError('Description cannot be empty');
      return;
    }
    setGenerating(true);
    setGenerateError('');
    try {
      const response = await axios.post('http://localhost:3000/workflow/generate', { description });
      const { workflow } = response.data;
      setNodes(
        workflow.nodes.map((node, index) => ({
          id: node.id,
          type: node.type,
          position: { x: 250, y: index * 150 },
          data: node.data || { text: node.type },
        }))
      );
      setEdges(
        workflow.edges.map(({ id, source, target }) => ({ id, source, target }))
      );
    } catch (error) {
      console.error('Error generating workflow:', error.response?.data || error.message);
      setGenerateError('Failed to generate workflow. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/workflow/execute', serializeWorkflow(nodes, edges));
      setResults(response.data);
      const resultMap = {};
      response.data.outputs.results.forEach((result) => {
        resultMap[result.nodeId] = result;
      });
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, executionResult: resultMap[n.id] || null },
        }))
      );
    } catch (error) {
      console.error('Execution error:', error.response?.data || error.message);
      setResults({ error: error.response?.data || error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      const response = await axios.post('http://localhost:3000/webhook/save', serializeWorkflow(nodes, edges));
      setWebhookUrl(response.data.webhookUrl);
    } catch (error) {
      console.error('Error saving workflow:', error.response?.data || error.message);
    }
  };



  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <BlockPanel />

      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
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
            gap: '8px',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Describe your workflow..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2c2c44',
                  color: 'white',
                  fontSize: '14px',
                  width: '300px',
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  ...buttonStyle,
                  background: generating ? '#4338ca' : '#6366f1',
                  cursor: generating ? 'not-allowed' : 'pointer',
                }}
              >
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>

            {generateError && (
              <div style={{ color: '#ef4444', fontSize: '12px' }}>{generateError}</div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleExecute}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  background: loading ? '#4338ca' : '#6366f1',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Running...' : 'Execute Workflow'}
              </button>

              <button
                onClick={handleSaveWorkflow}
                style={{ ...buttonStyle, background: '#6366f1' }}
              >
                Save Workflow
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
                maxWidth: '400px',
                textAlign: 'center',
              }}>
                Webhook URL: {webhookUrl}
              </div>
            )}
          </div>
        </ReactFlow>
      </div>

      <ConfigPanel
        selectedNode={nodes.find((n) => n.id === selectedNodeId)}
        setNodes={setNodes}
      />
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
