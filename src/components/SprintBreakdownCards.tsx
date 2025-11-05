import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  Tooltip,
  IconButton,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface IssueDetail {
  key: string;
  storyPoints: number;
  isAddedDuringSprint?: boolean;
  type: 'completed' | 'incomplete' | 'punted';
}

interface Sprint {
  sprintId: string;
  sprint?: { 
    name: string;
    state: string;
  };
  completedStoryPoints: number;
  totalStoryPoints: number;
  overallCompletionRate: number;
  initialWorkCompletionRate: number;
  completedIssues: number;
  totalIssues: number;
  storyPointsAddedDuringSprint: number;
  issuesAddedDuringSprint: number;
  puntedIssues: number;
  incompleteIssues: number;
  devDaysAvailable?: number;
  completedStoryPointsFromInitialIssues?: number;
  initialSprintStoryPoints?: number;
  devDaysSource?: 'sprint-goal' | 'sprint-goal-api' | 'manual' | 'empty' | 'active-sprint';
  sprintGoalTicketKey?: string;
  issueDetails?: {
    completed: IssueDetail[];
    incomplete: IssueDetail[];
    punted: IssueDetail[];
  };
}

interface SprintBreakdownCardsProps {
  sprints: Sprint[];
  onDevDaysChange: (sprintId: string, devDays: number) => void;
}

export function SprintBreakdownCards({ sprints, onDevDaysChange }: SprintBreakdownCardsProps) {
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());

  const toggleExpand = (sprintId: string) => {
    setExpandedSprints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sprintId)) {
        newSet.delete(sprintId);
      } else {
        newSet.add(sprintId);
      }
      return newSet;
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        📊 Sprint-by-Sprint Breakdown
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        {sprints.map((sprint: Sprint, index: number) => {
          const isExpanded = expandedSprints.has(sprint.sprintId);
          
          return (
            <Card key={sprint.sprintId} variant="outlined" sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {sprint.sprint?.name || `Sprint ${index + 1}`}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => toggleExpand(sprint.sprintId)}
                      sx={{ padding: '2px' }}
                    >
                      {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>
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
                    Initial SP
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main', lineHeight: 1.2 }}>
                    {sprint.completedStoryPointsFromInitialIssues || 0}/{sprint.initialSprintStoryPoints || 0}
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
                    onChange={(e) => onDevDaysChange(sprint.sprintId, parseFloat(e.target.value) || 0)}
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
                  <Tooltip 
                    title={
                      sprint.devDaysSource === 'active-sprint'
                        ? 'Active sprint - dev days not auto-filled. Please enter manually if needed.'
                        : sprint.devDaysSource === 'sprint-goal' 
                        ? `Auto-filled from Sprint Goal ticket (${sprint.sprintGoalTicketKey || 'unknown'}) original estimate in sprint report`
                        : sprint.devDaysSource === 'sprint-goal-api'
                        ? `Auto-filled from Sprint Goal ticket (${sprint.sprintGoalTicketKey || 'unknown'}) via Jira API (fallback - not found in sprint report)`
                        : sprint.devDaysSource === 'manual'
                        ? 'Manually entered value'
                        : 'No Sprint Goal ticket found. Please enter manually.'
                    }
                    arrow
                    placement="top"
                  >
                    <IconButton 
                      size="small" 
                      sx={{ 
                        padding: '2px',
                        color: sprint.devDaysSource === 'sprint-goal' || sprint.devDaysSource === 'sprint-goal-api' 
                          ? 'info.main' 
                          : 'text.secondary'
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Expandable Detailed Breakdown */}
              <Collapse in={isExpanded}>
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: 'primary.main' }}>
                    📋 Detailed Breakdown
                  </Typography>

                  {/* Calculation Summary */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                      📈 Calculation Summary
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 0.5, fontSize: '0.75rem' }}>
                      <Typography variant="caption">
                        • Total Story Points: <strong>{sprint.totalStoryPoints} SP</strong> (Completed: {sprint.completedStoryPoints} SP, Incomplete: {sprint.totalStoryPoints - sprint.completedStoryPoints} SP)
                      </Typography>
                      <Typography variant="caption">
                        • Scope Creep: <strong>{sprint.storyPointsAddedDuringSprint} SP</strong> added mid-sprint
                      </Typography>
                      <Typography variant="caption">
                        • Initial Planned Points: <strong>{sprint.initialSprintStoryPoints || 0} SP</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        Formula: {sprint.totalStoryPoints} (total) - {sprint.storyPointsAddedDuringSprint} (added) = {sprint.initialSprintStoryPoints || 0}
                      </Typography>
                      <Typography variant="caption">
                        • Completed from Initial: <strong>{sprint.completedStoryPointsFromInitialIssues || 0} SP</strong>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Completion Rates */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                      📊 Completion Rates
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 0.5, fontSize: '0.75rem' }}>
                      <Typography variant="caption">
                        • Overall: <strong>{sprint.overallCompletionRate.toFixed(1)}%</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', pl: 2 }}>
                        ({sprint.completedStoryPoints} completed / {sprint.totalStoryPoints} total) × 100
                      </Typography>
                      <Typography variant="caption">
                        • Initial Work: <strong>{sprint.initialWorkCompletionRate.toFixed(1)}%</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', pl: 2 }}>
                        ({sprint.completedStoryPointsFromInitialIssues || 0} from initial / {sprint.initialSprintStoryPoints || 0} planned) × 100
                      </Typography>
                    </Box>
                  </Box>

                  {/* Sprint Summary for Presentation */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        📋 Sprint Summary (Copy & Paste)
                      </Typography>
                      <Tooltip title="Copy presentation summary to clipboard">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            const issueKeysAdded = sprint.issueDetails?.completed
                              .filter(issue => issue.isAddedDuringSprint)
                              .map(issue => issue.key)
                              .concat(
                                sprint.issueDetails?.incomplete
                                  .filter(issue => issue.isAddedDuringSprint)
                                  .map(issue => issue.key) || []
                              ) || [];
                            
                            const summaryText = `Story Points - Completed: ${sprint.completedStoryPoints}
Story Points - Total: ${sprint.totalStoryPoints}
Story Points - Added During Sprint: ${sprint.storyPointsAddedDuringSprint}
Story Points - Initial (Planned): ${sprint.initialSprintStoryPoints || 0}
Story Points - Completed from Initial: ${sprint.completedStoryPointsFromInitialIssues || 0}
─────────────────────────────────
Overall Story Points Completion: ${sprint.overallCompletionRate.toFixed(2)}%
Initial Work Completion: ${sprint.initialWorkCompletionRate.toFixed(2)}%
─────────────────────────────────
Issues Added During Sprint: ${sprint.issuesAddedDuringSprint}
Issues Not Completed: ${sprint.incompleteIssues}
Issues Punted: ${sprint.puntedIssues}
Issues Added Keys: ${issueKeysAdded.join(', ')}`;
                            navigator.clipboard.writeText(summaryText);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <ContentCopyIcon sx={{ fontSize: '14px' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Paper variant="outlined" sx={{ p: 1, bgcolor: '#ffffff', borderRadius: 1, border: '1px solid #e3f2fd' }}>
                      <Typography variant="caption" component="pre" sx={{ 
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.65rem',
                        lineHeight: 1.3,
                        color: '#1976d2',
                        margin: 0
                      }}>
{`Story Points - Completed: ${sprint.completedStoryPoints}
Story Points - Total: ${sprint.totalStoryPoints}
Story Points - Added During Sprint: ${sprint.storyPointsAddedDuringSprint}
Story Points - Initial (Planned): ${sprint.initialSprintStoryPoints || 0}
Story Points - Completed from Initial: ${sprint.completedStoryPointsFromInitialIssues || 0}

Overall Story Points Completion: ${sprint.overallCompletionRate.toFixed(2)}%
Initial Work Completion: ${sprint.initialWorkCompletionRate.toFixed(2)}%

Issues Added During Sprint: ${sprint.issuesAddedDuringSprint}
Issues Not Completed: ${sprint.incompleteIssues}
Issues Punted: ${sprint.puntedIssues}`}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Issue Details */}
                  {sprint.issueDetails && (
                    <>
                      {sprint.issueDetails.completed.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'success.main' }}>
                            ✅ Completed Issues ({sprint.issueDetails.completed.length})
                          </Typography>
                          <List dense sx={{ py: 0 }}>
                            {sprint.issueDetails.completed.map((issue) => (
                              <ListItem key={issue.key} sx={{ py: 0.25, px: 1 }}>
                                <ListItemText
                                  primary={
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                      {issue.key}: {issue.storyPoints} SP 
                                      {issue.isAddedDuringSprint && (
                                        <Chip label="Added" size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.65rem' }} color="warning" />
                                      )}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {sprint.issueDetails.incomplete.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'warning.main' }}>
                            ⏳ Incomplete Issues ({sprint.issueDetails.incomplete.length})
                          </Typography>
                          <List dense sx={{ py: 0 }}>
                            {sprint.issueDetails.incomplete.map((issue) => (
                              <ListItem key={issue.key} sx={{ py: 0.25, px: 1 }}>
                                <ListItemText
                                  primary={
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                      {issue.key}: {issue.storyPoints} SP
                                      {issue.isAddedDuringSprint && (
                                        <Chip label="Added" size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.65rem' }} color="warning" />
                                      )}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {sprint.issueDetails.punted.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'error.main' }}>
                            🚫 Punted Issues ({sprint.issueDetails.punted.length}) - Excluded from Total
                          </Typography>
                          <List dense sx={{ py: 0 }}>
                            {sprint.issueDetails.punted.map((issue) => (
                              <ListItem key={issue.key} sx={{ py: 0.25, px: 1 }}>
                                <ListItemText
                                  primary={
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                      {issue.key}: {issue.storyPoints} SP (not counted)
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </>
                  )}

                  {/* Issues Summary */}
                  <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                      🎯 Issues Summary
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 0.5, fontSize: '0.75rem' }}>
                      <Typography variant="caption">
                        • Total Issues: <strong>{sprint.totalIssues + sprint.puntedIssues}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ pl: 2 }}>
                        - Completed: {sprint.completedIssues}
                      </Typography>
                      <Typography variant="caption" sx={{ pl: 2 }}>
                        - Incomplete: {sprint.incompleteIssues}
                      </Typography>
                      <Typography variant="caption" sx={{ pl: 2 }}>
                        - Punted: {sprint.puntedIssues}
                      </Typography>
                      <Typography variant="caption" sx={{ pl: 2 }}>
                        - Added During Sprint: {sprint.issuesAddedDuringSprint}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Collapse>

            </CardContent>
          </Card>
          );
        })}
      </Box>
    </Box>
  );
}
