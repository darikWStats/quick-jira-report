import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Autocomplete,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Link,
  Badge,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';

import { StorageUtil } from '../utils/storage';
import { FormValidator, FormData as FormDataType } from '../utils/validation';
import { ApiService, AuthData, Project, Board, Sprint, AppConfig } from '../services/api';
import { theme } from '../theme/theme';
import { ProjectBoardSelection } from './ProjectBoardSelection';
import { LoginForm } from './LoginForm';
import { ConfigurationStatus } from './ConfigurationStatus';

// Material-UI Icons
import LoginIcon from '@mui/icons-material/Login';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SprintIcon from '@mui/icons-material/DirectionsRun';
import FolderIcon from '@mui/icons-material/Folder';
import TimelineIcon from '@mui/icons-material/Timeline';
import TaskIcon from '@mui/icons-material/Task';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export function JiraReportApp() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<FormDataType>({
    jiraHost: '',
    email: '',
    jiraToken: '',
    projectKey: '',
    boardId: '',
    sprintId: '',
    rememberMe: false
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedSprintIds, setSelectedSprintIds] = useState<string[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [velocityData, setVelocityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingVelocity, setLoadingVelocity] = useState(false);
  const [error, setError] = useState<string>('');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [nextSprintDevDays, setNextSprintDevDays] = useState<number>(0);

  // Load configuration and saved data on component mount
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        setLoadingConfig(true);
        const config = await ApiService.getConfig();
        setAppConfig(config);
        console.log('🔧 App Configuration Loaded:', config);
        console.log('📊 Environment Status:', {
          fullyConfigured: config.configurationStatus.fullyConfigured,
          hasJiraHost: config.hasJiraHost,
          hasJiraEmail: config.hasJiraEmail,
          hasJiraToken: config.hasJiraToken,
          missingCredentials: config.configurationStatus.missingCredentials
        });
        
        // If server has environment variables, auto-fill them
        if (config.hasJiraHost && config.jiraHost) {
          setFormData(prev => ({ ...prev, jiraHost: config.jiraHost || '' }));
          console.log('🔗 Auto-filled Jira Host from environment:', config.jiraHost);
        }
        if (config.hasJiraEmail && config.jiraEmail) {
          setFormData(prev => ({ ...prev, email: config.jiraEmail || '' }));
          console.log('📧 Auto-filled Jira Email from environment:', config.jiraEmail);
        }
        if (config.hasJiraToken) {
          // Don't set the actual token value for security, but indicate it's available
          console.log('🔐 Jira Token available from backend environment (not displayed for security)');
        }
        
        // Log what will be auto-filled vs needs manual entry
        const autoFilled: string[] = [];
        const needsManual: string[] = [];
        
        if (config.hasJiraHost) autoFilled.push('JIRA_HOST');
        else needsManual.push('JIRA_HOST');
        
        if (config.hasJiraEmail) autoFilled.push('JIRA_EMAIL');
        else needsManual.push('JIRA_EMAIL');
        
        if (config.hasJiraToken) autoFilled.push('JIRA_TOKEN');
        else needsManual.push('JIRA_TOKEN');
        
        console.log('✅ Auto-filled from environment:', autoFilled.length > 0 ? autoFilled.join(', ') : 'None');
        console.log('⚠️  Requires manual entry:', needsManual.length > 0 ? needsManual.join(', ') : 'None');
      } catch (error) {
        console.error('Failed to load app configuration:', error);
        showError('Failed to load app configuration');
      } finally {
        setLoadingConfig(false);
      }
    };

    const loadSavedData = () => {
      const savedJiraHost = StorageUtil.get('jiraHost');
      const savedEmail = StorageUtil.get('email');
      
      if (savedJiraHost) setFormData(prev => ({ ...prev, jiraHost: savedJiraHost }));
      if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail }));
      
      if (savedJiraHost || savedEmail) {
        setFormData(prev => ({ ...prev, rememberMe: true }));
      }
    };

    loadAppConfig();
    loadSavedData();
  }, []);

  const handleInputChange = (field: keyof FormDataType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof FormDataType) => (event: any) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const canLogin = (): boolean => {
    const hasHost = formData.jiraHost || appConfig?.hasJiraHost;
    const hasEmail = formData.email || appConfig?.hasJiraEmail;
    const hasToken = formData.jiraToken || appConfig?.hasJiraToken;
    return Boolean(hasHost && hasEmail && hasToken);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLogin = async () => {
    // Check if required fields are available (either from form or backend)
    const hasHost = formData.jiraHost || appConfig?.hasJiraHost;
    const hasEmail = formData.email || appConfig?.hasJiraEmail;
    const hasToken = formData.jiraToken || appConfig?.hasJiraToken;
    
    if (!hasHost || !hasEmail || !hasToken) {
      showError('Please fill in all required authentication fields or ensure they are configured in backend environment');
      return;
    }

    setLoadingLogin(true);
    try {
      const authData: AuthData = {
        jiraHost: formData.jiraHost,
        email: formData.email,
        jiraToken: formData.jiraToken
      };

      // Test the connection by fetching projects
      const projectsData = await ApiService.getProjects(authData);
      setProjects(projectsData.projects || []);
      setIsLoggedIn(true);

      // Save auth data if "Remember me" is checked
      if (formData.rememberMe) {
        StorageUtil.save('jiraHost', formData.jiraHost);
        StorageUtil.save('email', formData.email);
      }
    } catch (error) {
      showError(`Authentication failed: ${(error as Error).message}`);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setProjects([]);
    setBoards([]);
    setSprints([]);
    setSelectedProjectId('');
    setReportData(null);
    setVelocityData(null);
    setFormData(prev => ({ ...prev, boardId: '', sprintId: '' }));
  };

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setBoards([]);
    setSprints([]);
    setFormData(prev => ({ ...prev, boardId: '', sprintId: '' }));
    setReportData(null);
    setVelocityData(null);

    if (projectId) {
      setLoadingBoards(true);
      try {
        const selectedProject = projects.find(p => p.id === projectId);
        const authData: AuthData = {
          jiraHost: formData.jiraHost,
          email: formData.email,
          jiraToken: formData.jiraToken
        };
        const boardsData = await ApiService.getBoards(authData, selectedProject?.key);
        setBoards(boardsData.boards || []);
      } catch (error) {
        showError(`Error fetching boards: ${(error as Error).message}`);
      } finally {
        setLoadingBoards(false);
      }
    }
  };

  const handleBoardChange = async (boardId: string) => {
    setFormData(prev => ({ ...prev, boardId, sprintId: '' }));
    setSprints([]);
    setSelectedSprintIds([]);
    setReportData(null);
    setVelocityData(null);
    
    if (boardId) {
      setLoadingSprints(true);
      try {
        const authData: AuthData = {
          jiraHost: formData.jiraHost,
          email: formData.email,
          jiraToken: formData.jiraToken
        };
        const sprintsData = await ApiService.getSprints(authData, boardId);
        setSprints(sprintsData.sprints || []);
      } catch (error) {
        showError(`Error fetching sprints: ${(error as Error).message}`);
      } finally {
        setLoadingSprints(false);
      }
    }
  };

  const handleSprintSelection = (sprintIds: string[]) => {
    setSelectedSprintIds(sprintIds);
  };

  const canGenerateReport = (): boolean => {
    return Boolean(formData.boardId && formData.sprintId);
  };

  const generateReport = async () => {
    if (!canGenerateReport()) {
      showError('Please select a board and sprint');
      return;
    }

    setIsLoading(true);
    try {
      const reportDataResult = await ApiService.generateReport(formData);
      setReportData(reportDataResult);
    } catch (error) {
      showError(`Error generating report: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateVelocity = async () => {
    if (selectedSprintIds.length === 0) {
      showError('Please select at least one sprint');
      return;
    }

    setLoadingVelocity(true);
    try {
      const authData: AuthData = {
        jiraHost: formData.jiraHost,
        email: formData.email,
        jiraToken: formData.jiraToken
      };

      // Fetch individual sprint reports for detailed analysis
      console.log('🔄 Fetching detailed sprint reports for velocity calculation...');
      const sprintReports = await Promise.all(
        selectedSprintIds.map(async (sprintId) => {
          console.log(`📊 Fetching sprint report for sprint ${sprintId}...`);
          const sprintReport = await ApiService.getSprintReport(authData, formData.boardId, sprintId);
          
          // Calculate enhanced metrics for each sprint (similar to postman script)
          const completedIssues = sprintReport.contents?.completedIssues || [];
          const issueKeysAddedDuringSprint = sprintReport.contents?.issueKeysAddedDuringSprint || {};
          const puntedIssues = sprintReport.contents?.puntedIssues || [];
          const incompleteIssues = sprintReport.contents?.issuesNotCompletedInCurrentSprint || [];
          
          const completedStoryPoints = sprintReport.contents?.completedIssuesEstimateSum?.value || 0;
          const totalStoryPoints = sprintReport.contents?.allIssuesEstimateSum?.value || 0;
          const issuesAddedCount = Object.keys(issueKeysAddedDuringSprint).length;
          
          // Calculate story points added during sprint
          let storyPointsAddedDuringSprint = 0;
          completedIssues.forEach((issue: any) => {
            if (issueKeysAddedDuringSprint[issue.key]) {
              const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                                 issue.estimateStatistic?.statFieldValue?.value || 0;
              storyPointsAddedDuringSprint += storyPoints;
            }
          });
          
          // Calculate completed story points from initial issues
          let completedStoryPointsFromInitialIssues = 0;
          completedIssues.forEach((issue: any) => {
            if (!issueKeysAddedDuringSprint[issue.key]) {
              const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                                 issue.estimateStatistic?.statFieldValue?.value || 0;
              completedStoryPointsFromInitialIssues += storyPoints;
            }
          });
          
          const initialSprintStoryPoints = totalStoryPoints - storyPointsAddedDuringSprint;
          const overallCompletionRate = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0;
          const initialWorkCompletionRate = initialSprintStoryPoints > 0 ? 
            (completedStoryPointsFromInitialIssues / initialSprintStoryPoints) * 100 : 0;

          console.log(`✅ Sprint ${sprintId} analysis complete:`, {
            completedStoryPoints,
            totalStoryPoints,
            overallCompletionRate: overallCompletionRate.toFixed(1) + '%'
          });

          return {
            sprintId,
            sprint: sprintReport.sprint,
            completedStoryPoints,
            totalStoryPoints,
            completedIssues: completedIssues.length,
            totalIssues: completedIssues.length + incompleteIssues.length + puntedIssues.length,
            issuesAddedDuringSprint: issuesAddedCount,
            puntedIssues: puntedIssues.length,
            incompleteIssues: incompleteIssues.length,
            storyPointsAddedDuringSprint,
            completedStoryPointsFromInitialIssues,
            initialSprintStoryPoints,
            overallCompletionRate,
            initialWorkCompletionRate,
            // Store raw data for detailed analysis
            rawSprintReport: sprintReport
          };
        })
      );

      // Sort sprints by start date (oldest first)
      const sortedSprintReports = sprintReports.sort((a, b) => {
        const dateA = a.sprint?.startDate ? new Date(a.sprint.startDate).getTime() : 0;
        const dateB = b.sprint?.startDate ? new Date(b.sprint.startDate).getTime() : 0;
        return dateA - dateB;
      });

      // Calculate aggregate metrics
      const totalStoryPoints = sortedSprintReports.reduce((sum, sprint) => sum + sprint.completedStoryPoints, 0);
      const totalSprints = sortedSprintReports.length;
      const averageVelocity = totalSprints > 0 ? totalStoryPoints / totalSprints : 0;
      const averageCompletionRate = sortedSprintReports.reduce((sum, sprint) => sum + sprint.overallCompletionRate, 0) / totalSprints;

      const velocityData = {
        totalSprints,
        totalStoryPoints,
        averageVelocity,
        averageCompletionRate,
        sprints: sortedSprintReports,
        // Additional insights
        insights: {
          scopeCreepTotal: sortedSprintReports.reduce((sum, sprint) => sum + sprint.storyPointsAddedDuringSprint, 0),
          averageScopeCreep: sortedSprintReports.reduce((sum, sprint) => sum + sprint.storyPointsAddedDuringSprint, 0) / totalSprints,
          averageInitialWorkCompletion: sortedSprintReports.reduce((sum, sprint) => sum + sprint.initialWorkCompletionRate, 0) / totalSprints,
          totalPuntedIssues: sortedSprintReports.reduce((sum, sprint) => sum + sprint.puntedIssues, 0),
          totalIncompleteIssues: sortedSprintReports.reduce((sum, sprint) => sum + sprint.incompleteIssues, 0)
        }
      };

      console.log('🎯 Velocity calculation complete:', {
        sprints: totalSprints,
        averageVelocity: averageVelocity.toFixed(1),
        averageCompletionRate: averageCompletionRate.toFixed(1) + '%'
      });

      setVelocityData(velocityData);
    } catch (error) {
      console.error('❌ Velocity calculation failed:', error);
      showError(`Error calculating velocity: ${(error as Error).message}`);
    } finally {
      setLoadingVelocity(false);
    }
  };

  // Handler for updating dev days for a specific sprint
  const handleDevDaysChange = (sprintId: string, devDays: number) => {
    if (!velocityData) return;
    
    const updatedVelocityData = {
      ...velocityData,
      sprints: velocityData.sprints.map((sprint: any) => 
        sprint.sprintId === sprintId 
          ? { ...sprint, devDaysAvailable: devDays }
          : sprint
      )
    };
    
    setVelocityData(updatedVelocityData);
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
                  Connected to Jira
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

              {/* Tab Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="jira analytics tabs">
                  <Tab 
                    icon={<AssessmentIcon />} 
                    label="Sprint Report" 
                    sx={{ minHeight: '64px' }}
                  />
                  <Tab 
                    icon={<SpeedIcon />} 
                    label="Team Velocity" 
                    sx={{ minHeight: '64px' }}
                  />
                </Tabs>
              </Box>

              {/* Sprint Report Tab */}
              {activeTab === 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon color="primary" />
                    Generate Sprint Report
                  </Typography>
                  
                  <Autocomplete
                    fullWidth
                    options={sprints}
                    getOptionLabel={(option) => `${option.name} (${option.state})`}
                    value={sprints.find(sprint => 
                      String(sprint.id) === String(formData.sprintId)
                    ) || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, sprintId: newValue ? String(newValue.id) : '' }));
                    }}
                    disabled={!formData.boardId || loadingSprints}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Sprint"
                        placeholder="Search by sprint name or state"
                        margin="normal"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mr: 1 }}>
                              <TimelineIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
                            </Box>
                          ),
                        }}
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
                      onClick={generateReport}
                      disabled={!canGenerateReport() || isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                      fullWidth
                    >
                      {isLoading ? 'Generating Report...' : 'Generate Sprint Report'}
                    </Button>
                  </Box>

                  {/* Sprint Report Results - Within Sprint Report Tab */}
                  {reportData && (
                    <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <AssessmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
                        <Typography variant="h4" component="h2">
                          Sprint Report: {reportData.sprint?.name || 'Unknown Sprint'}
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                        Status: {reportData.sprint?.state || 'Unknown'} | 
                        Sprint ID: {reportData.sprint?.id || 'N/A'}
                      </Typography>

                      {(() => {
                        // Calculate enhanced metrics based on postman-test-script.js
                        const completedIssues = reportData.contents?.completedIssues || [];
                        const issueKeysAddedDuringSprint = reportData.contents?.issueKeysAddedDuringSprint || {};
                        const puntedIssues = reportData.contents?.puntedIssues || [];
                        const incompleteIssues = reportData.contents?.issuesNotCompletedInCurrentSprint || [];
                        
                        const completedEstimateSum = reportData.contents?.completedIssuesEstimateSum?.value || 0;
                        const allIssuesEstimateSum = reportData.contents?.allIssuesEstimateSum?.value || 0;
                        const issuesAddedCount = Object.keys(issueKeysAddedDuringSprint).length;
                        
                        // Calculate story points added during sprint
                        let storyPointsAddedDuringSprint = 0;
                        completedIssues.forEach(issue => {
                          if (issueKeysAddedDuringSprint[issue.key]) {
                            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                                               issue.estimateStatistic?.statFieldValue?.value || 0;
                            storyPointsAddedDuringSprint += storyPoints;
                          }
                        });
                        
                        // Calculate completed story points from initial issues
                        let completedStoryPointsFromInitialIssues = 0;
                        completedIssues.forEach(issue => {
                          if (!issueKeysAddedDuringSprint[issue.key]) {
                            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                                               issue.estimateStatistic?.statFieldValue?.value || 0;
                            completedStoryPointsFromInitialIssues += storyPoints;
                          }
                        });
                        
                        // Calculate initial sprint story points
                        const initialSprintStoryPoints = allIssuesEstimateSum - storyPointsAddedDuringSprint;
                        
                        // Calculate completion percentages
                        const overallCompletionPercentage = allIssuesEstimateSum > 0 ? 
                          ((completedEstimateSum / allIssuesEstimateSum) * 100) : 0;
                        const initialWorkCompletionPercentage = initialSprintStoryPoints > 0 ? 
                          ((completedStoryPointsFromInitialIssues / initialSprintStoryPoints) * 100) : 0;

                        return (
                          <>
                            {/* Story Points Overview */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                📊 Story Points Overview
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                      {completedEstimateSum}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Completed Points
                                    </Typography>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                      {allIssuesEstimateSum}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Total Points
                                    </Typography>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                                      {overallCompletionPercentage.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Overall Completion
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Box>
                            </Box>

                            {/* Sprint Scope Analysis */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                🎯 Sprint Scope Analysis
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                      {initialSprintStoryPoints}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Initial Planned Points
                                    </Typography>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                      {completedStoryPointsFromInitialIssues}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Completed from Initial
                                    </Typography>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                                      {initialWorkCompletionPercentage.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Initial Work Completion
                                    </Typography>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                      {storyPointsAddedDuringSprint}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Points Added Mid-Sprint
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Box>
                            </Box>

                            {/* Issue Tracking */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                📋 Issue Tracking
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                      {completedIssues.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Completed Issues
                                    </Typography>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                      {issuesAddedCount}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Issues Added Mid-Sprint
                                    </Typography>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                      {incompleteIssues.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Incomplete Issues
                                    </Typography>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                                      {puntedIssues.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#80868b' }}>
                                      Punted Issues
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Box>
                            </Box>

                            {/* Sprint Health Insights */}
                            <Box sx={{ mb: 4 }}>
                              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                                💡 Sprint Health Insights
                              </Typography>
                              <Card sx={{ bgcolor: '#f8f9fa' }}>
                                <CardContent>
                                  <Box sx={{ display: 'grid', gap: 2 }}>
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        🎯 Scope Discipline:
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {issuesAddedCount === 0 ? 
                                          "✅ Excellent! No scope creep - all work was planned at sprint start." :
                                          `⚠️ ${issuesAddedCount} issue${issuesAddedCount > 1 ? 's' : ''} added mid-sprint (${storyPointsAddedDuringSprint} points). Consider improving sprint planning.`
                                        }
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        📈 Completion Quality:
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {initialWorkCompletionPercentage >= 90 ?
                                          "🔥 Outstanding! Team completed almost all initially planned work." :
                                          initialWorkCompletionPercentage >= 70 ?
                                          "👍 Good completion rate of initially planned work." :
                                          "📉 Low completion rate of planned work. Review sprint capacity and planning accuracy."
                                        }
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        🔄 Sprint Management:
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {puntedIssues.length === 0 ?
                                          "✨ No issues were punted - great sprint execution!" :
                                          `${puntedIssues.length} issue${puntedIssues.length > 1 ? 's' : ''} punted to future sprints. Review capacity planning.`
                                        }
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Box>
                          </>
                        );
                      })()}

                      {/* Technical Details */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                          🔍 Technical Details
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Raw API Response Preview
                            </Typography>
                            <Tooltip title="Copy raw data">
                              <IconButton 
                                size="small" 
                                onClick={() => navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography variant="caption" component="pre" sx={{ 
                            whiteSpace: 'pre-wrap', 
                            maxHeight: '200px', 
                            overflow: 'auto',
                            display: 'block',
                            bgcolor: 'white',
                            p: 1,
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                          }}>
                            {JSON.stringify(reportData, null, 2).substring(0, 1000)}...
                          </Typography>
                        </Paper>
                      </Box>
                    </Paper>
                  )}

                  {!reportData && (
                    <Paper elevation={1} sx={{ padding: '2rem', marginTop: '2rem', textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h6" color="text.secondary">
                        Select a board and sprint above to generate your report
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Choose your project board and the sprint you want to analyze
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}

              {/* Team Velocity Tab */}
              {activeTab === 1 && (
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

                  {/* Velocity Results - Within Team Velocity Tab */}
                  {velocityData && (
                    <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <SpeedIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
                        <Typography variant="h4" component="h2">
                          Team Velocity Analysis
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                        Based on {velocityData.totalSprints} sprint{velocityData.totalSprints !== 1 ? 's' : ''} | 
                        Total Story Points Completed: {velocityData.totalStoryPoints}
                      </Typography>

                      {/* Velocity Metrics */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                          📈 Core Velocity Metrics
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                          <Card>
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                {velocityData.averageVelocity.toFixed(1)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#80868b' }}>
                                Average Velocity (SP/Sprint)
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                {velocityData.averageCompletionRate.toFixed(1)}%
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#80868b' }}>
                                Average Completion Rate
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                                {velocityData.insights?.averageInitialWorkCompletion?.toFixed(1) || 0}%
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#80868b' }}>
                                Planned Work Completion
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                                {velocityData.totalSprints}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#80868b' }}>
                                Sprints Analyzed
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>

                      {/* Team Health Metrics */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                          🎯 Team Health & Discipline
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
                          <Card>
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                {velocityData.insights?.averageScopeCreep?.toFixed(1) || 0}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#80868b' }}>
                                Avg Scope Creep (SP)
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                                {velocityData.insights?.totalPuntedIssues || 0}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#80868b' }}>
                                Total Punted Issues
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                {velocityData.insights?.totalIncompleteIssues || 0}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#80868b' }}>
                                Total Incomplete Issues
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                {velocityData.insights?.scopeCreepTotal || 0}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#80868b' }}>
                                Total Scope Creep (SP)
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>

                      {/* Sprint Breakdown */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                          📊 Sprint-by-Sprint Breakdown
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1.5 }}>
                          {velocityData.sprints.map((sprint: any, index: number) => (
                            <Card key={sprint.sprintId} variant="outlined" sx={{ border: '1px solid #e0e0e0' }}>
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    {sprint.sprint?.name || `Sprint ${index + 1}`}
                                  </Typography>
                                  <Chip 
                                    label={sprint.sprint?.state || 'Unknown'} 
                                    color={sprint.sprint?.state === 'closed' ? 'success' : 'default'}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.75rem' }}
                                  />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 1.5 }}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Story Points
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
                                      {sprint.completedStoryPoints}/{sprint.totalStoryPoints}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Overall Rate
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', lineHeight: 1.2 }}>
                                      {sprint.overallCompletionRate.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Planned Rate
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.main', lineHeight: 1.2 }}>
                                      {sprint.initialWorkCompletionRate.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Issues Done
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                      {sprint.completedIssues}/{sprint.totalIssues}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Scope Creep
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: sprint.storyPointsAddedDuringSprint > 0 ? 'warning.main' : 'success.main', lineHeight: 1.2 }}>
                                      {sprint.storyPointsAddedDuringSprint}SP
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Added
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: sprint.issuesAddedDuringSprint > 0 ? 'warning.main' : 'success.main', lineHeight: 1.2 }}>
                                      {sprint.issuesAddedDuringSprint}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Punted
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: sprint.puntedIssues > 0 ? 'error.main' : 'success.main', lineHeight: 1.2 }}>
                                      {sprint.puntedIssues}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      Incomplete
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: sprint.incompleteIssues > 0 ? 'error.main' : 'success.main', lineHeight: 1.2 }}>
                                      {sprint.incompleteIssues}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {/* Dev Days Input Section */}
                                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', minWidth: '70px' }}>
                                      Dev Days:
                                    </Typography>
                                    <TextField
                                      type="number"
                                      size="small"
                                      value={sprint.devDaysAvailable || ''}
                                      onChange={(e) => handleDevDaysChange(sprint.sprintId, parseFloat(e.target.value) || 0)}
                                      placeholder="0"
                                      inputProps={{ 
                                        min: 0, 
                                        step: 0.5,
                                        style: { textAlign: 'center', padding: '4px 8px' }
                                      }}
                                      sx={{ 
                                        width: '80px',
                                        '& .MuiOutlinedInput-root': {
                                          height: '28px',
                                          fontSize: '0.8rem'
                                        }
                                      }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                      days
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      </Box>

                      {/* Story Points per Dev Day Analysis */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                          ⚡ Productivity Analysis
                        </Typography>
                        {(() => {
                          // Calculate productivity metrics for sprints with dev days data
                          const sprintsWithDevDays = velocityData.sprints.filter((sprint: any) => 
                            sprint.devDaysAvailable && sprint.devDaysAvailable > 0
                          );
                          
                          if (sprintsWithDevDays.length === 0) {
                            return (
                              <Card sx={{ bgcolor: '#fff3e0' }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                  <Typography variant="body1" color="text.secondary">
                                    📝 Enter dev days for each sprint to see productivity analysis
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Add the number of development days available in each sprint above to calculate story points per dev day
                                  </Typography>
                                </CardContent>
                              </Card>
                            );
                          }

                          // Calculate metrics
                          const totalStoryPoints = sprintsWithDevDays.reduce((sum: number, sprint: any) => 
                            sum + sprint.completedStoryPoints, 0
                          );
                          const totalDevDays = sprintsWithDevDays.reduce((sum: number, sprint: any) => 
                            sum + sprint.devDaysAvailable, 0
                          );
                          const averageStoryPointsPerDevDay = totalDevDays > 0 ? totalStoryPoints / totalDevDays : 0;
                          
                          // Calculate individual sprint productivity
                          const sprintProductivity = sprintsWithDevDays.map((sprint: any) => ({
                            ...sprint,
                            storyPointsPerDevDay: sprint.devDaysAvailable > 0 ? 
                              sprint.completedStoryPoints / sprint.devDaysAvailable : 0
                          }));

                          // Find best and worst performing sprints
                          const bestSprint = sprintProductivity.reduce((best: any, sprint: any) => 
                            sprint.storyPointsPerDevDay > best.storyPointsPerDevDay ? sprint : best
                          );
                          const worstSprint = sprintProductivity.reduce((worst: any, sprint: any) => 
                            sprint.storyPointsPerDevDay < worst.storyPointsPerDevDay ? sprint : worst
                          );

                          return (
                            <>
                              {/* Overall Productivity Metrics */}
                              <Card sx={{ mb: 2 }}>
                                <CardContent>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        {averageStoryPointsPerDevDay.toFixed(1)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Avg SP per Dev Day
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                        {sprintsWithDevDays.length}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Sprints Analyzed
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                                        {totalStoryPoints}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Total Story Points
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                        {totalDevDays.toFixed(1)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Total Dev Days
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>

                              {/* Performance Comparison */}
                              <Card sx={{ mb: 2 }}>
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                                    🏆 Sprint Performance Comparison
                                  </Typography>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Box sx={{ p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                                        🥇 Best Performance
                                      </Typography>
                                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {bestSprint.sprint?.name || 'Unknown Sprint'}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {bestSprint.storyPointsPerDevDay.toFixed(1)} SP per dev day
                                      </Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                                        📈 Needs Improvement
                                      </Typography>
                                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {worstSprint.sprint?.name || 'Unknown Sprint'}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {worstSprint.storyPointsPerDevDay.toFixed(1)} SP per dev day
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>

                              {/* Individual Sprint Productivity */}
                              <Card>
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                                    📊 Individual Sprint Productivity
                                  </Typography>
                                  <Box sx={{ display: 'grid', gap: 1 }}>
                                    {sprintProductivity.map((sprint: any) => (
                                      <Box 
                                        key={sprint.sprintId} 
                                        sx={{ 
                                          display: 'flex', 
                                          justifyContent: 'space-between', 
                                          alignItems: 'center',
                                          p: 1.5,
                                          bgcolor: '#f8f9fa',
                                          borderRadius: 1,
                                          border: '1px solid #e0e0e0'
                                        }}
                                      >
                                        <Box>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {sprint.sprint?.name || 'Unknown Sprint'}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {sprint.completedStoryPoints} SP / {sprint.devDaysAvailable} days
                                          </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                          <Typography 
                                            variant="body1" 
                                            sx={{ 
                                              fontWeight: 'bold',
                                              color: sprint.storyPointsPerDevDay >= averageStoryPointsPerDevDay ? 'success.main' : 'warning.main'
                                            }}
                                          >
                                            {sprint.storyPointsPerDevDay.toFixed(1)} SP/day
                                          </Typography>
                                          {sprint.storyPointsPerDevDay >= averageStoryPointsPerDevDay ? (
                                            <Typography variant="caption" sx={{ color: 'success.main' }}>
                                              Above Average
                                            </Typography>
                                          ) : (
                                            <Typography variant="caption" sx={{ color: 'warning.main' }}>
                                              Below Average
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </CardContent>
                              </Card>

                              {/* Next Sprint Estimation */}
                              <Card sx={{ mt: 2, bgcolor: '#f0f7ff', border: '1px solid #2196f3' }}>
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: 'primary.main' }}>
                                    🔮 Next Sprint Estimation
                                  </Typography>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Enter dev days available for next sprint:
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TextField
                                          type="number"
                                          size="small"
                                          value={nextSprintDevDays || ''}
                                          onChange={(e) => setNextSprintDevDays(parseFloat(e.target.value) || 0)}
                                          placeholder="0"
                                          inputProps={{ 
                                            min: 0, 
                                            step: 0.5,
                                            style: { textAlign: 'center', padding: '8px 12px' }
                                          }}
                                          sx={{ 
                                            width: '120px',
                                            '& .MuiOutlinedInput-root': {
                                              fontSize: '0.9rem'
                                            }
                                          }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                          dev days
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                      {nextSprintDevDays > 0 ? (
                                        <Box>
                                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Estimated Story Points:
                                          </Typography>
                                          <Typography 
                                            variant="h4" 
                                            sx={{ 
                                              fontWeight: 'bold', 
                                              color: 'primary.main',
                                              mb: 0.5
                                            }}
                                          >
                                            {(averageStoryPointsPerDevDay * nextSprintDevDays).toFixed(1)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Based on {averageStoryPointsPerDevDay.toFixed(1)} SP/day average
                                          </Typography>
                                          <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" sx={{ 
                                              color: 'success.main',
                                              display: 'block'
                                            }}>
                                              Conservative: {(averageStoryPointsPerDevDay * nextSprintDevDays * 0.8).toFixed(1)} SP
                                            </Typography>
                                            <Typography variant="caption" sx={{ 
                                              color: 'warning.main',
                                              display: 'block'
                                            }}>
                                              Optimistic: {(averageStoryPointsPerDevDay * nextSprintDevDays * 1.2).toFixed(1)} SP
                                            </Typography>
                                          </Box>
                                        </Box>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                          Enter dev days to see estimation
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                  {nextSprintDevDays > 0 && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                        💡 Planning Recommendations:
                                      </Typography>
                                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                          Plan for <strong>{(averageStoryPointsPerDevDay * nextSprintDevDays * 0.8).toFixed(1)}-{(averageStoryPointsPerDevDay * nextSprintDevDays).toFixed(1)} SP</strong> to account for uncertainties
                                        </Typography>
                                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                          Consider team velocity trends and sprint-specific factors
                                        </Typography>
                                        <Typography component="li" variant="body2" color="text.secondary">
                                          Reserve <strong>{Math.ceil(nextSprintDevDays * 0.1)} day(s)</strong> for unexpected issues or scope changes
                                        </Typography>
                                      </Box>
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            </>
                          );
                        })()}
                      </Box>

                      {/* Velocity Insights */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                          💡 Velocity Insights
                        </Typography>
                        <Card sx={{ bgcolor: '#f8f9fa' }}>
                          <CardContent>
                            <Box sx={{ display: 'grid', gap: 2 }}>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  🎯 Planning Recommendation:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Based on your average velocity of {velocityData.averageVelocity.toFixed(1)} story points per sprint, 
                                  plan for {Math.floor(velocityData.averageVelocity * 0.8)}-{Math.ceil(velocityData.averageVelocity * 1.2)} 
                                  story points in upcoming sprints.
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  📈 Performance Trend:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {velocityData.sprints.length >= 2 ? (
                                    velocityData.sprints[velocityData.sprints.length - 1].completedStoryPoints > 
                                    velocityData.sprints[velocityData.sprints.length - 2].completedStoryPoints ?
                                    "🔥 Your velocity is trending upward! Great job maintaining momentum." :
                                    velocityData.sprints[velocityData.sprints.length - 1].completedStoryPoints < 
                                    velocityData.sprints[velocityData.sprints.length - 2].completedStoryPoints ?
                                    "📉 Velocity has decreased in recent sprints. Consider reviewing capacity and impediments." :
                                    "📊 Velocity is stable. Consistent performance across sprints."
                                  ) : "📋 Add more sprints to see velocity trends."}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  🎯 Predictive Planning:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  At current velocity, your team can complete approximately {Math.round(velocityData.averageVelocity * 4)} 
                                  story points per month or {Math.round(velocityData.averageVelocity * 12)} story points per quarter.
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    </Paper>
                  )}

                  {!velocityData && (
                    <Paper elevation={1} sx={{ padding: '2rem', marginTop: '2rem', textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h6" color="text.secondary">
                        Select multiple sprints above to calculate team velocity
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Choose your project, board, and multiple sprints to analyze velocity trends
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
