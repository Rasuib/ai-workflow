

const ConfigPanel = ({ selectedNode, setNodes }) => {
const handleChange = (field, value) => {
    setNodes((nodes) => nodes.map((n) => 
        n.id === selectedNode.id 
            ? { ...n, data: { ...n.data, [field]: value } }
            : n
    ));
};
    

    if (!selectedNode) {
        return (
            <div style={{ width: '250px', background: '#1e1e2f', color: 'white', padding: '16px' }}>
                Select a node to configure it
            </div>
        );
    } 

    return (
        <div style={{ width: '250px', background: '#1e1e2f', color: 'white', padding: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>Configure Node</h3>
           {selectedNode.type === 'trigger' && (
    <div>
        <label>Input Text:</label>
        <input
            type="text"
            value={selectedNode.data.text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
        />
    </div>
)}
        </div>
    );
};

export default ConfigPanel;
