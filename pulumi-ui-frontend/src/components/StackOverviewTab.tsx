import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Tooltip,
    ToggleButton,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WrapTextIcon from '@mui/icons-material/WrapText';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Stack } from '../types';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('json', json);

interface StackOverviewTabProps {
    stack: Stack;
}

const StackOverviewTab: React.FC<StackOverviewTabProps> = ({ stack }) => {
    const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [wrapText, setWrapText] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

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

    const handleCopyClick = () => {
        navigator.clipboard.writeText(JSON.stringify(stack, null, 2)).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const renderJsonDialog = () => {
        return (
            <Dialog
                open={jsonDialogOpen}
                onClose={() => setJsonDialogOpen(false)}
                maxWidth={isFullScreen ? false : "md"}
                fullWidth
                fullScreen={isFullScreen}
            >
                <DialogTitle>
                    Stack JSON
                    <Tooltip title={isFullScreen ? "Exit full screen" : "Enter full screen"}>
                        <IconButton
                            aria-label="toggle fullscreen"
                            onClick={toggleFullScreen}
                            sx={{
                                position: 'absolute',
                                right: 48,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Close">
                        <IconButton
                            aria-label="close"
                            onClick={() => setJsonDialogOpen(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                        <Tooltip title={copySuccess ? "Copied!" : "Copy to clipboard"} placement="left">
                            <IconButton
                                onClick={handleCopyClick}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    zIndex: 1,
                                }}
                            >
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={wrapText ? "Unwrap text" : "Wrap text"} placement="left">
                            <ToggleButton
                                value="wrap"
                                selected={wrapText}
                                onChange={() => setWrapText(!wrapText)}
                                sx={{
                                    position: 'absolute',
                                    right: 48,
                                    top: 8,
                                    zIndex: 1,
                                }}
                            >
                                <WrapTextIcon />
                            </ToggleButton>
                        </Tooltip>
                        <SyntaxHighlighter
                            language="json"
                            style={docco}
                            customStyle={{
                                margin: 0,
                                padding: '16px',
                                maxHeight: isFullScreen ? 'none' : '60vh',
                                height: isFullScreen ? 'calc(100vh - 100px)' : 'auto',
                                overflow: 'auto',
                            }}
                            wrapLongLines={wrapText}
                        >
                            {JSON.stringify(stack, null, 2)}
                        </SyntaxHighlighter>
                    </Box>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <Box sx={{ height: '100%', overflowY: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>Overview</Typography>

            <Button
                variant="contained"
                onClick={() => setJsonDialogOpen(true)}
                sx={{ mb: 3 }}
            >
                View JSON
            </Button>

            <Typography variant="h6" gutterBottom>Configuration</Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Key</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(stack.config || {}).map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                <TableCell>{renderValue(value)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" gutterBottom>Outputs</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(stack.outputs || {}).map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                <TableCell>{renderValue(value)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {renderJsonDialog()}
        </Box>
    );
};

export default StackOverviewTab;