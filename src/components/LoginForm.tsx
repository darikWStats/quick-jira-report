import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FormData as FormDataType } from '../utils/validation';
import { AppConfig } from '../services/api';

interface LoginFormProps {
  formData: FormDataType;
  appConfig: AppConfig | null;
  loadingLogin: boolean;
  onInputChange: (field: keyof FormDataType) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLogin: () => Promise<void>;
  canLogin: () => boolean;
}

export function LoginForm({
  formData,
  appConfig,
  loadingLogin,
  onInputChange,
  onLogin,
  canLogin
}: LoginFormProps) {
  return (
    <Paper elevation={3} sx={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LoginIcon color="primary" />
        Access Jira
      </Typography>
      
      <TextField
        label="Jira Host"
        placeholder={appConfig?.hasJiraHost ? "Host provided by backend" : "https://yourcompany.atlassian.net"}
        value={formData.jiraHost}
        onChange={onInputChange('jiraHost')}
        type="url"
        fullWidth
        margin="normal"
        helperText={
          appConfig?.hasJiraHost ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <CheckCircleIcon sx={{ fontSize: '1rem' }} />
              Host automatically provided by backend environment
            </Box>
          ) : (
            "Your Jira instance URL"
          )
        }
        InputProps={{
          ...(appConfig?.hasJiraHost && {
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <Chip 
                  label="Backend" 
                  color="success" 
                  size="small" 
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              </Box>
            ),
          })
        }}
      />
      
      <TextField
        label="Email"
        placeholder={appConfig?.hasJiraEmail ? "Email provided by backend" : "Enter your email"}
        value={formData.email}
        onChange={onInputChange('email')}
        type="email"
        fullWidth
        margin="normal"
        helperText={
          appConfig?.hasJiraEmail ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <CheckCircleIcon sx={{ fontSize: '1rem' }} />
              Email automatically provided by backend environment
            </Box>
          ) : (
            "Your Jira account email"
          )
        }
        InputProps={{
          ...(appConfig?.hasJiraEmail && {
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <Chip 
                  label="Backend" 
                  color="success" 
                  size="small" 
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              </Box>
            ),
          })
        }}
      />
      
      <TextField
        label="Jira Token"
        placeholder={appConfig?.hasJiraToken ? "Token provided by backend" : "Enter your Jira token"}
        value={formData.jiraToken}
        onChange={onInputChange('jiraToken')}
        type="password"
        fullWidth
        margin="normal"
        disabled={appConfig?.hasJiraToken}
        helperText={
          appConfig?.hasJiraToken ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <CheckCircleIcon sx={{ fontSize: '1rem' }} />
              Token automatically provided by backend environment
            </Box>
          ) : (
            "Your API token from Jira settings"
          )
        }
        InputProps={{
          ...(appConfig?.hasJiraToken && {
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <Chip 
                  label="Backend" 
                  color="success" 
                  size="small" 
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              </Box>
            ),
          })
        }}
      />
      
      {appConfig?.configurationStatus.fullyConfigured && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">
            🎉 All credentials are provided by backend environment! You can connect directly.
          </Typography>
        </Alert>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.rememberMe}
            onChange={onInputChange('rememberMe')}
          />
        }
        label="Remember me"
        sx={{ mt: 2, mb: 2 }}
      />
      
      <Button
        variant="contained"
        onClick={onLogin}
        disabled={loadingLogin || !canLogin()}
        startIcon={loadingLogin ? <CircularProgress size={20} /> : <LoginIcon />}
        fullWidth
        size="large"
      >
        {loadingLogin ? 'Connecting...' : 'Connect to Jira'}
      </Button>
    </Paper>
  );
}
