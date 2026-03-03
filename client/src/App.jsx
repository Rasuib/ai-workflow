import { useNodesState, useEdgesState, ReactFlow, useReactFlow, ReactFlowProvider,addEdge , Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import BlockPanel from './components/BlockPanel';
import { useCallback } from 'react';
import CustomNode from './components/CustomNode.jsx';

const nodeTypes = {
    trigger: CustomNode,
    sentiment: CustomNode,
    email: CustomNode,
};
function AppContent() {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
      data: { label: type },
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
          onEdgesChange={onEdgesChange}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Background />
        </ReactFlow>
      </div>
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