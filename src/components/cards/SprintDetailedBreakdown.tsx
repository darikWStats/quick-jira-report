import React from 'react';
import { Box, Typography, Paper, Tooltip, IconButton, List, ListItem, ListItemText, Chip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface IssueDetail {
  key: string;
  storyPoints: number;
  isAddedDuringSprint?: boolean;
}

interface IssueDetails {
  completed: IssueDetail[];
  incomplete: IssueDetail[];
  punted: IssueDetail[];
}

interface SprintDetailedBreakdownProps {
  sprint: {
    completedStoryPoints: number;
    totalStoryPoints: number;
    storyPointsAddedDuringSprint: number;
    initialSprintStoryPoints?: number;
    completedStoryPointsFromInitialIssues?: number;
    overallCompletionRate: number;
    initialWorkCompletionRate: number;
    issuesAddedDuringSprint: number;
    incompleteIssues: number;
    puntedIssues: number;
    completedIssues: number;
    totalIssues: number;
    issueDetails?: IssueDetails;
  };
}

export function SprintDetailedBreakdown({ sprint }: SprintDetailedBreakdownProps) {
  const handleCopySummary = () => {
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
  };

  return (
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
            <IconButton size="small" onClick={handleCopySummary} sx={{ p: 0.5 }}>
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
  );
}
