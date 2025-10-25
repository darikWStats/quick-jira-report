import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Paper,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Link
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import { Sprint } from '../services/api';
import { FormData as FormDataType } from '../utils/validation';

// Sprint Report Display interfaces
interface SprintReportIssue {
  key: string;
  summary?: string;
  typeName?: string;
  statusName?: string;
  assigneeName?: string;
  priorityName?: string;
  currentEstimateStatistic?: {
    statFieldValue?: {
      value: number;
    };
  };
  estimateStatistic?: {
    statFieldValue?: {
      value: number;
    };
  };
}

interface SprintReportContents {
  completedIssues?: SprintReportIssue[];
  issueKeysAddedDuringSprint?: Record<string, any>;
  puntedIssues?: any[];
  issuesNotCompletedInCurrentSprint?: any[];
  completedIssuesEstimateSum?: {
    value: number;
  };
  allIssuesEstimateSum?: {
    value: number;
  };
}

interface SprintReportData {
  sprint?: {
    id: string | number;
    name: string;
    state: string;
  };
  contents?: SprintReportContents;
}

interface SprintReportDisplayProps {
  formData: FormDataType;
  sprints: Sprint[];
  loadingSprints: boolean;
  isLoading: boolean;
  reportData: SprintReportData | null;
  onInputChange: (field: keyof FormDataType) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSprintChange: (event: any, newValue: Sprint | null) => void;
  onGenerateReport: () => void;
  canGenerateReport: () => boolean;
}

// Ticket List Component
interface TicketListProps {
  title: string;
  tickets: SprintReportIssue[];
  icon: React.ReactNode;
  color: string;
  emptyMessage: string;
  showStoryPoints?: boolean;
  issueKeysAddedDuringSprint?: Record<string, any>;
}

function TicketList({ title, tickets, icon, color, emptyMessage, showStoryPoints = true, issueKeysAddedDuringSprint = {} }: TicketListProps) {
  const totalStoryPoints = showStoryPoints ? tickets.reduce((sum, ticket) => {
    const storyPoints = ticket.currentEstimateStatistic?.statFieldValue?.value || 
                       ticket.estimateStatistic?.statFieldValue?.value || 0;
    return sum + storyPoints;
  }, 0) : 0;

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          {icon}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Badge 
            badgeContent={tickets.length} 
            color="primary" 
            sx={{ 
              '& .MuiBadge-badge': { 
                backgroundColor: color,
                color: 'white'
              }
            }}
          >
            <Box sx={{ mr: 2 }} />
          </Badge>
          {showStoryPoints && totalStoryPoints > 0 && (
            <Chip 
              label={`${totalStoryPoints} SP`} 
              size="small" 
              sx={{ backgroundColor: color + '20', color: color }}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {tickets.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            {emptyMessage}
          </Typography>
        ) : (
          <List dense>
            {tickets.map((ticket, index) => {
              const storyPoints = showStoryPoints ? 
                (ticket.currentEstimateStatistic?.statFieldValue?.value || 
                 ticket.estimateStatistic?.statFieldValue?.value || 0) : 0;
              
              return (
                <React.Fragment key={ticket.key}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Link 
                            href={`#`} 
                            sx={{ fontWeight: 'medium', textDecoration: 'none' }}
                            color="primary"
                          >
                            {ticket.key}
                          </Link>
                          {showStoryPoints && storyPoints > 0 && (
                            <Chip 
                              label={`${storyPoints} SP`} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                          )}
                          {ticket.priorityName && (
                            <Chip 
                              label={ticket.priorityName} 
                              size="small" 
                              color={
                                ticket.priorityName.toLowerCase().includes('high') ? 'error' :
                                ticket.priorityName.toLowerCase().includes('medium') ? 'warning' :
                                'default'
                              }
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                          )}
                          {ticket.typeName && (
                            <Chip 
                              label={ticket.typeName} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                          )}
                          {issueKeysAddedDuringSprint[ticket.key] && (
                            <Chip 
                              label="Added Mid-Sprint" 
                              size="small" 
                              sx={{ 
                                fontSize: '0.7rem', 
                                height: '20px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                fontWeight: 'bold',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {ticket.summary || 'No summary available'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {ticket.statusName && (
                              <Chip 
                                label={ticket.statusName} 
                                size="small" 
                                color={
                                  ticket.statusName.toLowerCase().includes('done') ? 'success' :
                                  ticket.statusName.toLowerCase().includes('progress') ? 'info' :
                                  'default'
                                }
                                sx={{ fontSize: '0.65rem', height: '18px' }}
                              />
                            )}
                            {ticket.assigneeName && (
                              <Chip 
                                label={`👤 ${ticket.assigneeName}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.65rem', height: '18px' }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < tickets.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export function SprintReportDisplay({
  formData,
  sprints,
  loadingSprints,
  isLoading,
  reportData,
  onInputChange,
  onSprintChange,
  onGenerateReport,
  canGenerateReport
}: SprintReportDisplayProps) {
  return (
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
        onChange={onSprintChange}
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
          onClick={onGenerateReport}
          disabled={!canGenerateReport() || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <AssessmentIcon />}
          fullWidth
        >
          {isLoading ? 'Generating Report...' : 'Generate Sprint Report'}
        </Button>
      </Box>

      {/* Sprint Report Results */}
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

                {/* Detailed Ticket Information */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    🎫 Ticket Details
                  </Typography>
                  
                  {/* Completed Tickets */}
                  <Box sx={{ mb: 2 }}>
                    <TicketList
                      title="Completed Tickets"
                      tickets={completedIssues}
                      icon={<CheckCircleIcon sx={{ color: '#2e7d32' }} />}
                      color="#2e7d32"
                      emptyMessage="No tickets were completed in this sprint."
                      showStoryPoints={true}
                      issueKeysAddedDuringSprint={issueKeysAddedDuringSprint}
                    />
                  </Box>

                  {/* Unfinished Tickets */}
                  <Box sx={{ mb: 2 }}>
                    <TicketList
                      title="Unfinished Tickets"
                      tickets={[...incompleteIssues, ...puntedIssues]}
                      icon={<CancelIcon sx={{ color: '#d32f2f' }} />}
                      color="#d32f2f"
                      emptyMessage="All tickets were completed - excellent work!"
                      showStoryPoints={true}
                      issueKeysAddedDuringSprint={issueKeysAddedDuringSprint}
                    />
                  </Box>

                  {/* Tickets Added During Sprint */}
                  <Box sx={{ mb: 2 }}>
                    <TicketList
                      title="Tickets Added During Sprint"
                      tickets={completedIssues.filter(issue => issueKeysAddedDuringSprint[issue.key])}
                      icon={<AddIcon sx={{ color: '#f57c00' }} />}
                      color="#f57c00"
                      emptyMessage="No tickets were added during the sprint - great planning discipline!"
                      showStoryPoints={true}
                    />
                  </Box>
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
  );
}
