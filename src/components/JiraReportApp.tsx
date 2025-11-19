import React from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Autocomplete
} from '@mui/material';

import { theme } from '../theme/theme';
import { ProjectBoardSelection } from './ProjectBoardSelection';
import { LoginForm } from './LoginForm';
import { ConfigurationStatus } from './ConfigurationStatus';
import { VelocityAnalysisDisplay } from './VelocityAnalysisDisplay';
import { useJiraAuth } from '../hooks/useJiraAuth';
import { useProjectData } from '../hooks/useProjectData';
import { useVelocityData } from '../hooks/useVelocityData';

// Material-UI Icons
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SpeedIcon from '@mui/icons-material/Speed';

export function JiraReportApp() {
  // Custom hooks for state management
  const {
    formData,
    appConfig,
    isLoggedIn,
    loadingLogin,
    loadingConfig,
    projects,
    error,
    handleInputChange,
    handleLogin,
    handleLogout: authLogout,
    canLogin,
    showError,
    setFormData,
    setProjects,
    setIsLoggedIn
  } = useJiraAuth();

  const {
    boards,
    sprints,
    selectedProjectId,
    selectedSprintIds,
    loadingBoards,
    loadingSprints,
    handleProjectChange,
    handleBoardChange,
    handleSprintSelection,
    setBoards,
    setSprints,
    setSelectedSprintIds
  } = useProjectData({ formData, setFormData, showError, projects });

  const {
    velocityData,
    nextSprintDevDays,
    loadingVelocity,
    calculateVelocity,
    handleDevDaysChange,
    setNextSprintDevDays,
    setVelocityData
  } = useVelocityData({ formData, selectedSprintIds, showError });

  // Enhanced logout that clears all data
  const handleLogout = () => {
    authLogout();
    setBoards([]);
    setSprints([]);
    setSelectedSprintIds([]);
    setVelocityData(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Jira Analytics Dashboard
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Configuration Status Display */}
          <ConfigurationStatus appConfig={appConfig} />

          {loadingConfig && (
            <Paper elevation={1} sx={{ padding: '2rem', textAlign: 'center', bgcolor: 'grey.50', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Loading configuration...
                </Typography>
              </Box>
            </Paper>
          )}
          
          {!isLoggedIn ? (
            <LoginForm
              formData={formData}
              appConfig={appConfig}
              loadingLogin={loadingLogin}
              onInputChange={handleInputChange}
              onLogin={handleLogin}
              canLogin={canLogin}
            />
          ) : (
            <Paper elevation={3} sx={{ padding: '2rem' }}>
              {/* Logout Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DashboardIcon color="primary" />
                  Jira Explorer
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                >
                  Logout
                </Button>
              </Box>

              {/* Project & Board Selection */}
              <ProjectBoardSelection
                projects={projects}
                boards={boards}
                selectedProjectId={selectedProjectId}
                boardId={formData.boardId}
                loadingBoards={loadingBoards}
                onProjectChange={handleProjectChange}
                onBoardChange={handleBoardChange}
              />

              {/* Team Velocity Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon color="primary" />
                  Calculate Team Velocity
                </Typography>

                {/* Multiple Sprint Selection */}
                <Autocomplete
                  multiple
                  fullWidth
                  options={sprints}
                  getOptionLabel={(option) => `${option.name} (${option.state})`}
                  value={sprints.filter(sprint => 
                    selectedSprintIds.includes(String(sprint.id))
                  )}
                  onChange={(event, newValue) => {
                    handleSprintSelection(newValue.map(sprint => String(sprint.id)));
                  }}
                  disabled={!formData.boardId || loadingSprints}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Multiple Sprints"
                      placeholder="Choose multiple sprints to calculate team velocity"
                      margin="normal"
                    />
                  )}
                />

                {loadingSprints && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="caption">Loading sprints...</Typography>
                  </Box>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={calculateVelocity}
                    disabled={selectedSprintIds.length === 0 || loadingVelocity}
                    startIcon={loadingVelocity ? <CircularProgress size={20} /> : <SpeedIcon />}
                    fullWidth
                  >
                    {loadingVelocity ? 'Calculating Velocity...' : `Calculate Velocity (${selectedSprintIds.length} sprint${selectedSprintIds.length !== 1 ? 's' : ''} selected)`}
                  </Button>
                </Box>

                {/* Velocity Results */}
                <VelocityAnalysisDisplay
                  velocityData={velocityData}
                  nextSprintDevDays={nextSprintDevDays}
                  jiraHost={formData.jiraHost}
                  onNextSprintDevDaysChange={setNextSprintDevDays}
                  onDevDaysChange={handleDevDaysChange}
                />
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
