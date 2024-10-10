import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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
    const handleToggle = (event: React.MouseEvent) => {
        event.stopPropagation();
        data.onToggle();
    };

    return (
        <Box
            sx={{
                background: '#fff',
                padding: '4px 6px',
                borderRadius: '3px',
                border: '1px solid #ccc',
                width: '180px',
                height: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            <Handle type="target" position={Position.Left} />
            <Box
                sx={{
                    fontWeight: 'bold',
                    marginBottom: '1px',
                    fontSize: '0.7em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {truncateText(data.name, 25)}
            </Box>
            <Box
                sx={{
                    fontSize: '0.6em',
                    color: '#666',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {truncateText(data.type, 25)}
            </Box>
            <Handle type="source" position={Position.Right} />
            {data.hasChildren && (
                <IconButton
                    onClick={handleToggle}
                    size="small"
                    sx={{
                        position: 'absolute',
                        right: '-18px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: '#f0f0f0',
                        width: '18px',
                        height: '18px',
                        '&:hover': {
                            backgroundColor: '#e0e0e0',
                        },
                    }}
                >
                    {data.isExpanded ? <RemoveIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                </IconButton>
            )}
        </Box>
    );
};

export default CustomNode;
