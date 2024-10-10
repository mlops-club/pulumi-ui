import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Link
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Resource, Stack } from '../types';

interface ResourceViewProps {
    resource: Resource;
    stack: Stack;
}

const ResourceView: React.FC<ResourceViewProps> = ({ resource, stack }) => {
    console.log('ResourceView rendering');
    console.log('Resource:', resource);
    console.log('Stack:', stack);

    const { projectName, stackName } = useParams<{ projectName?: string; stackName?: string }>();

    const isUrl = (str: string) => {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    };

    const isArnOrUrn = (str: string) => {
        return str.startsWith('arn:') || str.includes('::');
    };

    const renderValue = (value: any) => {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        if (typeof value === 'string') {
            if (isUrl(value) && !isArnOrUrn(value)) {
                return (
                    <Link href={value} target="_blank" rel="noopener noreferrer">
                        {value}
                        <OpenInNewIcon sx={{ fontSize: 'small', ml: 0.5, verticalAlign: 'middle' }} />
                    </Link>
                );
            }
            return value;
        }
        return JSON.stringify(value);
    };

    const parseStackUrn = (urn: string) => {
        const parts = urn.split(':');
        if (parts.length >= 5) {
            const stackName = parts[2];
            const projectName = parts[4];
            return { projectName, stackName };
        }
        return null;
    };

    const renderDependencyLink = (dependency: Resource) => {
        if (dependency.type === 'pulumi:pulumi:Stack') {
            const parsed = parseStackUrn(dependency.urn);
            if (parsed) {
                console.log('Parsed stack URN:', parsed);
                return (
                    <Link component={RouterLink} to={`/projects/${parsed.projectName}/stacks/${parsed.stackName}/overview`}>
                        {dependency.type}
                    </Link>
                );
            }
        }
        return (
            <Link component={RouterLink} to={`/projects/${projectName}/stacks/${stackName}/resources/${encodeURIComponent(dependency.urn.split('::').pop() || '')}`}>
                {dependency.type}
            </Link>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Resource Details</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">Type</TableCell>
                            <TableCell>{resource.type}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">URN</TableCell>
                            <TableCell>{resource.urn}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row">Stack Version</TableCell>
                            <TableCell>{stack.version || 'N/A'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Outputs</Typography>
            {resource.outputs && Object.keys(resource.outputs).length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Key</TableCell>
                                <TableCell>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(resource.outputs).map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>{renderValue(value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon sx={{ mr: 1 }} />
                    <Typography>No Outputs</Typography>
                </Box>
            )}

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Dependencies</Typography>
            {resource.parent ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Name</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    {renderDependencyLink(stack.resources.find(r => r.urn === resource.parent) || { type: 'Unknown', urn: resource.parent })}
                                </TableCell>
                                <TableCell>{resource.parent.split('::').pop()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>No Dependencies</Typography>
            )}

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Children</Typography>
            {resource.children && resource.children.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Name</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {resource.children.map((child) => (
                                <TableRow key={child.urn}>
                                    <TableCell>
                                        {renderDependencyLink(child)}
                                    </TableCell>
                                    <TableCell>{child.urn.split('::').pop()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>No Children</Typography>
            )}
        </Box>
    );
};

export default ResourceView;