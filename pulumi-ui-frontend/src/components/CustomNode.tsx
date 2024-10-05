import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomNodeProps {
    data: {
        label: string;
        hasChildren: boolean;
        isExpanded: boolean;
        onToggle: () => void;
    };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
    return (
        <div style={{ background: '#fff', padding: '10px', borderRadius: '3px', border: '1px solid #ccc' }}>
            <Handle type="target" position={Position.Left} />
            <div>{data.label}</div>
            <Handle type="source" position={Position.Right} />
            {data.hasChildren && (
                <div
                    style={{
                        position: 'absolute',
                        right: '-20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        fontSize: '20px',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#f0f0f0',
                        borderRadius: '50%',
                    }}
                    onClick={data.onToggle}
                >
                    {data.isExpanded ? '−' : '+'}
                </div>
            )}
        </div>
    );
};

export default CustomNode;