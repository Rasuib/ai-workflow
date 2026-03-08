import { Handle, Position } from '@xyflow/react';

const typeColors = {
    trigger: '#4CAF50',
    sentiment: '#2196F3',
    email: '#FF9800',
    summarize: '#9C27B0',
};

function CustomNode({ data, type }) {
    const color = typeColors[type] || '#888';
    
    const borderColor = data.executionResult === 'success' 
        ? '#22c55e'
        : data.status === 'failed'
        ? '#ef4444'
        : color;

    return (
        <div style={{
            background: '#1e1e2f',
            border: `2px solid ${borderColor}`,
            borderRadius: '8px',
            padding: '12px 20px',
            minWidth: '150px',
            color: 'white',
            textAlign: 'center',
        }}>
            <Handle type="target" position={Position.Top} />
            
            <div style={{ 
                fontSize: '12px', 
                color: borderColor, 
                textTransform: 'uppercase',
                marginBottom: '4px'
            }}>
                {type}
            </div>
            
            <div style={{ fontSize: '14px' }}>
                {data.text || type}
            </div>

            {data.executionResult && (
                <div style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    color: borderColor,
                }}>
                    {data.status}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export default CustomNode;