import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomNodeProps {
    data: {
        name: string;
        type: string;
        hasChildren: boolean;
        isExpanded: boolean;
        onToggle: () => void;
    };
}

const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
    return (
        <div style={{
            background: '#fff',
            padding: '4px 6px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            width: '180px',
            height: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        }}>
            <Handle type="target" position={Position.Left} />
            <div style={{
                fontWeight: 'bold',
                marginBottom: '1px',
                fontSize: '0.7em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {truncateText(data.name, 25)}
            </div>
            <div style={{
                fontSize: '0.6em', // Slightly reduced font size
                color: '#666',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {truncateText(data.type, 25)}
            </div>
            <Handle type="source" position={Position.Right} />
            {data.hasChildren && (
                <div
                    style={{
                        position: 'absolute',
                        right: '-16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        width: '16px',
                        height: '16px',
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
