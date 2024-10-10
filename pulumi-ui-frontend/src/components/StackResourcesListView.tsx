import React from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableSortLabel,
    Paper,
    Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Resource } from '../types';

interface StackResourcesListViewProps {
    resources: Resource[];
    orderBy: keyof Resource;
    order: 'asc' | 'desc';
    onRequestSort: (property: keyof Resource) => void;
    projectName: string | undefined;
    stackName: string | undefined;
}

const StackResourcesListView: React.FC<StackResourcesListViewProps> = ({
    resources,
    orderBy,
    order,
    onRequestSort,
    projectName,
    stackName
}) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'type'}
                                direction={orderBy === 'type' ? order : 'asc'}
                                onClick={() => onRequestSort('type')}
                            >
                                Type
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'urn'}
                                direction={orderBy === 'urn' ? order : 'asc'}
                                onClick={() => onRequestSort('urn')}
                            >
                                Name
                            </TableSortLabel>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {resources.map((resource) => (
                        <TableRow key={resource.urn}>
                            <TableCell>
                                <Link
                                    component={RouterLink}
                                    to={`/projects/${projectName}/stacks/${stackName}/resources/${encodeURIComponent(resource.urn.split('::').pop() || '')}`}
                                >
                                    {resource.type}
                                </Link>
                            </TableCell>
                            <TableCell>{resource.urn.split('::').pop()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StackResourcesListView;