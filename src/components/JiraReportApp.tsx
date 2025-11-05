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
import { TabNavigation } from './TabNavigation';
import { VelocityAnalysisDisplay } from './VelocityAnalysisDisplay';
import { SprintReportDisplay } from './SprintReportDisplay';

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

  const handleSprintChange = (event: any, newValue: Sprint | null) => {
    setFormData(prev => ({ ...prev, sprintId: newValue ? String(newValue.id) : '' }));
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
          const issuesAddedCount = Object.keys(issueKeysAddedDuringSprint).length;
          
          // Calculate story points for issues that were actually part of this sprint
          let actualSprintTotalPoints = 0;
          let storyPointsAddedDuringSprint = 0;
          let completedStoryPointsFromInitialIssues = 0;
          
          // Count completed issues that were part of this sprint
          completedIssues.forEach((issue: any) => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            actualSprintTotalPoints += storyPoints;
            
            if (issueKeysAddedDuringSprint[issue.key]) {
              storyPointsAddedDuringSprint += storyPoints;
            } else {
              completedStoryPointsFromInitialIssues += storyPoints;
            }
          });
          
          // Count incomplete issues that were part of this sprint
          incompleteIssues.forEach((issue: any) => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            actualSprintTotalPoints += storyPoints;
          });
          
          // Count punted issues that were part of this sprint
          puntedIssues.forEach((issue: any) => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            actualSprintTotalPoints += storyPoints;
          });
          
          // Use actual sprint scope instead of Jira's allIssuesEstimateSum
          const totalStoryPoints = actualSprintTotalPoints;
          const initialSprintStoryPoints = actualSprintTotalPoints - storyPointsAddedDuringSprint;
          const overallCompletionRate = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0;
          const initialWorkCompletionRate = initialSprintStoryPoints > 0 ? 
            (completedStoryPointsFromInitialIssues / initialSprintStoryPoints) * 100 : 0;

          // Extract Sprint Goal ticket's original estimate (if exists)
          let sprintGoalDevDays = undefined;
          let devDaysSource = 'empty';
          let sprintGoalTicketKey = undefined;
          
          const sprintState = sprintReport.sprint?.state?.toLowerCase();
          const isActiveSprint = sprintState === 'active';
          
          // Skip dev days extraction for active sprints
          if (isActiveSprint) {
            devDaysSource = 'active-sprint';
            console.log(`⏭️ Skipping dev days extraction for active sprint ${sprintId}`);
          } else {
            const allIssues = [...completedIssues, ...incompleteIssues, ...puntedIssues];
            const sprintGoal = sprintReport.sprint?.goal;
            
            // Find Sprint Goal ticket by matching sprint goal text in issue summary or checking issue type
            const sprintGoalTicket = allIssues.find((issue: any) => {
              // Check if issue type is "Sprint Goal" or similar
              const issueTypeName = issue.typeName?.toLowerCase() || '';
              const isSprintGoalType = issueTypeName.includes('sprint goal') || issueTypeName === 'goal';
              
              // Also check if issue summary matches the sprint goal
              const summary = issue.summary?.toLowerCase() || '';
              const matchesGoal = sprintGoal && summary.includes(sprintGoal.toLowerCase());
              
              return isSprintGoalType || matchesGoal;
            });
            
            if (sprintGoalTicket) {
              sprintGoalTicketKey = sprintGoalTicket.key;
              
              // Extract original estimate in seconds and convert to days (8 hours = 1 day)
              let originalEstimateSeconds = sprintGoalTicket.estimateStatistic?.statFieldValue?.value || 
                                             sprintGoalTicket.trackingStatistic?.statFieldValue?.value || 0;
              
              // Check if we got a valid value from sprint report (should be in seconds, not story points)
              if (originalEstimateSeconds > 0 && originalEstimateSeconds > 1000) {
                devDaysSource = 'sprint-goal';
              } else {
                // Fallback: If estimation is zero or empty, fetch the issue directly from Jira API
                try {
                  console.log(`⚠️ No estimate found in sprint report for ${sprintGoalTicket.key}, fetching directly from Jira API...`);
                  const issueData = await ApiService.getIssue(authData, sprintGoalTicket.key);
                  
                  // Extract original estimate from the issue fields
                  originalEstimateSeconds = issueData.fields?.timetracking?.originalEstimateSeconds || 0;
                  if (originalEstimateSeconds > 0) {
                    devDaysSource = 'sprint-goal-api';
                  }
                  console.log(`✅ Fetched original estimate from Jira API: ${originalEstimateSeconds} seconds`);
                } catch (error) {
                  console.error(`❌ Failed to fetch issue ${sprintGoalTicket.key} from Jira API:`, (error as Error).message);
                }
              }
              
              // Convert seconds to days (assuming 8-hour workday = 28800 seconds)
              if (originalEstimateSeconds > 0) {
                sprintGoalDevDays = originalEstimateSeconds / 28800; // 8 hours * 60 min * 60 sec = 28800
              }
              
              console.log(`✅ Sprint Goal ticket found for sprint ${sprintId}:`, {
                key: sprintGoalTicket.key,
                originalEstimateSeconds,
                devDays: sprintGoalDevDays,
                source: devDaysSource
              });
            }
          }

          console.log(`✅ Sprint ${sprintId} analysis complete:`, {
            completedStoryPoints,
            totalStoryPoints,
            overallCompletionRate: overallCompletionRate.toFixed(1) + '%',
            devDaysAvailable: sprintGoalDevDays
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
            devDaysAvailable: sprintGoalDevDays,
            devDaysSource: devDaysSource,
            sprintGoalTicketKey: sprintGoalTicketKey,
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
          ? { 
              ...sprint, 
              devDaysAvailable: devDays,
              devDaysSource: 'manual' // Mark as manually changed
            }
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

              {/* Tab Navigation */}
              <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

              {/* Sprint Report Tab */}
              {activeTab === 0 && (
                <SprintReportDisplay
                  formData={formData}
                  sprints={sprints}
                  loadingSprints={loadingSprints}
                  isLoading={isLoading}
                  reportData={reportData}
                  onInputChange={handleInputChange}
                  onSprintChange={handleSprintChange}
                  onGenerateReport={generateReport}
                  canGenerateReport={canGenerateReport}
                />
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
                  <VelocityAnalysisDisplay
                    velocityData={velocityData}
                    nextSprintDevDays={nextSprintDevDays}
                    onNextSprintDevDaysChange={setNextSprintDevDays}
                    onDevDaysChange={handleDevDaysChange}
                  />
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
