import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { AppConfig } from '../services/api';

interface ConfigurationStatusProps {
  appConfig: AppConfig | null;
}

export function ConfigurationStatus({ appConfig }: ConfigurationStatusProps) {
  if (!appConfig) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ padding: '1rem', marginBottom: '2rem', bgcolor: 'grey.50' }}>
      <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
        🔧 Environment Configuration
      </Typography>
      <Box sx={{ display: 'grid', gap: 1, fontSize: '0.875rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Status:
          </Typography>
          <Chip 
            label={appConfig.configurationStatus.fullyConfigured ? 'Fully Configured' : 'Partial Configuration'}
            color={appConfig.configurationStatus.fullyConfigured ? 'success' : 'warning'}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              JIRA_HOST:
            </Typography>
            <Chip 
              label={appConfig.hasJiraHost ? '✓ Set' : '✗ Missing'}
              color={appConfig.hasJiraHost ? 'success' : 'error'}
              size="small"
              sx={{ fontSize: '0.7rem', height: '20px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              JIRA_EMAIL:
            </Typography>
            <Chip 
              label={appConfig.hasJiraEmail ? '✓ Set' : '✗ Missing'}
              color={appConfig.hasJiraEmail ? 'success' : 'error'}
              size="small"
              sx={{ fontSize: '0.7rem', height: '20px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              JIRA_TOKEN:
            </Typography>
            <Chip 
              label={appConfig.hasJiraToken ? '✓ Set' : '✗ Missing'}
              color={appConfig.hasJiraToken ? 'success' : 'error'}
              size="small"
              sx={{ fontSize: '0.7rem', height: '20px' }}
            />
          </Box>
        </Box>
        {!appConfig.configurationStatus.fullyConfigured && (
          <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
            <Typography variant="caption">
              Server environment variables can be set to pre-populate login fields. Missing: {appConfig.configurationStatus.missingCredentials.join(', ')}
            </Typography>
          </Alert>
        )}
      </Box>
    </Paper>
  );
}
