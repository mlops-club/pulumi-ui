import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const WelcomePage: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
            }}
        >
            <Typography variant="h4" gutterBottom>
                Welcome to
            </Typography>
            <img src="/logo.png" alt="Pulumi UI Logo" style={{ maxWidth: '300px', marginBottom: '20px' }} />
            <Typography variant="subtitle1">
                by{' '}
                <Link href="https://mlops-club.org" target="_blank" rel="noopener noreferrer">
                    MLOps Club
                </Link>
            </Typography>
        </Box>
    );
};

export default WelcomePage;