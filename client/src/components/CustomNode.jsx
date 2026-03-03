import { Handle, Position } from '@xyflow/react';

const typeColors = {
    trigger: '#4CAF50',
    sentiment: '#2196F3',
    email: '#FF9800',
};

function CustomNode({ data, type }) {
    const color = typeColors[type] || '#888';
    
    return (
        <div style={{
            background: '#1e1e2f',
            border: `2px solid ${color}`,
            borderRadius: '8px',
            padding: '12px 20px',
            minWidth: '150px',
            color: 'white',
            textAlign: 'center',
        }}>
            <Handle type="target" position={Position.Top} />
            
            <div style={{ 
                fontSize: '12px', 
                color: color, 
                textTransform: 'uppercase',
                marginBottom: '4px'
            }}>
                {type}
            </div>
            
            <div style={{ fontSize: '14px' }}>
                {data.label || type}
            </div>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export default CustomNode;