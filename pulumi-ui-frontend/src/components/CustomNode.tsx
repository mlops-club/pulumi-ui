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
            padding: '10px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            width: '280px', // Increased width from 220px to 280px
            height: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        }}>
            <Handle type="target" position={Position.Left} />
            <div style={{
                fontWeight: 'bold',
                marginBottom: '4px',
                fontSize: '0.85em', // Decreased font size for the name
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {truncateText(data.name, 35)}
            </div>
            <div style={{
                fontSize: '0.75em', // Decreased font size for the type
                color: '#666',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {truncateText(data.type, 35)}
            </div>
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