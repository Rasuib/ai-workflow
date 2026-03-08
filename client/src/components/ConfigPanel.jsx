const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: '#2c2c44',
  border: '1px solid #3f3f5a',
  borderRadius: '6px',
  color: 'white',
  fontSize: '13px',
  boxSizing: 'border-box',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: '#a0a0b8',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const fieldStyle = {
  marginBottom: '14px',
};

const typeColors = {
  trigger: '#4CAF50',
  sentiment: '#2196F3',
  email: '#FF9800',
  summarize: '#9C27B0',
};

const ConfigPanel = ({ selectedNode, setNodes }) => {
  const handleChange = (field, value) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, [field]: value } }
          : n
      )
    );
  };

  if (!selectedNode) {
    return (
      <div style={{
        width: '250px',
        background: '#1e1e2f',
        borderLeft: '1px solid #2c2c44',
        color: '#a0a0b8',
        padding: '20px 16px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        Click a node to configure it
      </div>
    );
  }

  const accentColor = typeColors[selectedNode.type] || '#6366f1';

  return (
    <div style={{
      width: '250px',
      background: '#1e1e2f',
      borderLeft: '1px solid #2c2c44',
      color: 'white',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '10px',
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '4px',
        }}>
          {selectedNode.type}
        </div>
        <div style={{ fontSize: '15px', fontWeight: '600' }}>
          Configure Node
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2c2c44', paddingTop: '16px' }}>
        {selectedNode.type === 'trigger' && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Input Text</label>
            <input
              type="text"
              value={selectedNode.data.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Enter trigger text..."
              style={inputStyle}
            />
          </div>
        )}

        {selectedNode.type === 'email' && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Recipient Email</label>
              <input
                type="email"
                value={selectedNode.data.to || ''}
                onChange={(e) => handleChange('to', e.target.value)}
                placeholder="recipient@example.com"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Subject</label>
              <input
                type="text"
                value={selectedNode.data.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Email subject..."
                style={inputStyle}
              />
            </div>
          </>
        )}

        {(selectedNode.type === 'sentiment' || selectedNode.type === 'summarize') && (
          <div style={{ color: '#a0a0b8', fontSize: '12px', lineHeight: '1.5' }}>
            This block has no configuration. It automatically processes the text passed from the previous node.
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;
