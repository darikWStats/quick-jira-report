import React, { useState } from 'react';
import { Box, Typography, Paper, Tooltip, IconButton, List, ListItem, ListItemText, Chip, LinearProgress, Collapse } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
  const [calculationOpen, setCalculationOpen] = useState(true);
  const [issuesOpen, setIssuesOpen] = useState(false);

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

  // Calculate commitment reliability score
  const commitmentReliability = sprint.initialSprintStoryPoints && sprint.initialSprintStoryPoints > 0
    ? ((sprint.completedStoryPointsFromInitialIssues || 0) / sprint.initialSprintStoryPoints) * 100
    : 0;
  
  // Calculate sprint stability index
  const sprintStabilityIndex = sprint.totalIssues > 0
    ? (1 - (sprint.issuesAddedDuringSprint / (sprint.totalIssues + sprint.issuesAddedDuringSprint))) * 100
    : 100;

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: 'primary.main' }}>
        📋 Detailed Breakdown
      </Typography>

      {/* Sprint Health Score */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1.5, color: 'primary.main' }}>
          🎯 Sprint Health Score
        </Typography>
        
        {/* Commitment Reliability */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
              Commitment Reliability
              <Tooltip title="How well the team delivers what they committed to at sprint start">
                <Box component="span" sx={{ ml: 0.5, cursor: 'help', color: 'text.secondary' }}>ⓘ</Box>
              </Tooltip>
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: commitmentReliability >= 80 ? 'success.main' : commitmentReliability >= 60 ? 'warning.main' : 'error.main' }}>
              {commitmentReliability.toFixed(1)}%
              {commitmentReliability >= 80 && ' 🌟'}
              {commitmentReliability >= 60 && commitmentReliability < 80 && ' 👍'}
              {commitmentReliability < 60 && ' 📉'}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(commitmentReliability, 100)} 
            sx={{ 
              height: 6, 
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.7)',
              '& .MuiLinearProgress-bar': {
                bgcolor: commitmentReliability >= 80 ? '#2e7d32' : commitmentReliability >= 60 ? '#ed6c02' : '#d32f2f'
              }
            }}
          />
        </Box>

        {/* Sprint Stability Index */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
              Sprint Stability Index
              <Tooltip title="Higher is better - indicates fewer scope changes during sprint">
                <Box component="span" sx={{ ml: 0.5, cursor: 'help', color: 'text.secondary' }}>ⓘ</Box>
              </Tooltip>
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: sprintStabilityIndex >= 80 ? 'success.main' : sprintStabilityIndex >= 60 ? 'warning.main' : 'error.main' }}>
              {sprintStabilityIndex.toFixed(1)}%
              {sprintStabilityIndex >= 80 && ' ✨'}
              {sprintStabilityIndex >= 60 && sprintStabilityIndex < 80 && ' ⚡'}
              {sprintStabilityIndex < 60 && ' ⚠️'}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(sprintStabilityIndex, 100)} 
            sx={{ 
              height: 6, 
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.7)',
              '& .MuiLinearProgress-bar': {
                bgcolor: sprintStabilityIndex >= 80 ? '#1976d2' : sprintStabilityIndex >= 60 ? '#0288d1' : '#ed6c02'
              }
            }}
          />
        </Box>
      </Box>

      {/* Calculation Summary with Health Indicators - Collapsible */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Box 
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', mb: calculationOpen ? 1 : 0 }}
          onClick={() => setCalculationOpen(!calculationOpen)}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            📈 Calculation Summary
          </Typography>
          <IconButton size="small" sx={{ padding: '2px' }}>
            {calculationOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
        <Collapse in={calculationOpen}>
        <Box sx={{ display: 'grid', gap: 0.5, fontSize: '0.75rem' }}>
          <Typography variant="caption">
            • Total Story Points: <strong>{sprint.totalStoryPoints} SP</strong> (
            <Box component="span" sx={{ color: 'success.main' }}>Completed: {sprint.completedStoryPoints} SP</Box>, 
            <Box component="span" sx={{ color: sprint.totalStoryPoints - sprint.completedStoryPoints > 0 ? 'warning.main' : 'text.secondary' }}> Incomplete: {sprint.totalStoryPoints - sprint.completedStoryPoints} SP</Box>)
          </Typography>
          <Typography variant="caption">
            • Scope Creep: <strong style={{ 
              color: sprint.storyPointsAddedDuringSprint === 0 ? '#2e7d32' : 
                     sprint.storyPointsAddedDuringSprint <= 5 ? '#ed6c02' : '#d32f2f' 
            }}>
              {sprint.storyPointsAddedDuringSprint} SP
            </strong> added mid-sprint
            {sprint.storyPointsAddedDuringSprint === 0 && ' ✅'}
            {sprint.storyPointsAddedDuringSprint > 0 && sprint.storyPointsAddedDuringSprint <= 5 && ' ⚠️'}
            {sprint.storyPointsAddedDuringSprint > 5 && ' 🚨'}
          </Typography>
          <Typography variant="caption">
            • Initial Planned Points: <strong>{sprint.initialSprintStoryPoints || 0} SP</strong>
          </Typography>
          <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            Formula: {sprint.totalStoryPoints} (total) - {sprint.storyPointsAddedDuringSprint} (added) = {sprint.initialSprintStoryPoints || 0}
          </Typography>
          <Typography variant="caption">
            • Completed from Initial: <strong style={{ 
              color: sprint.initialWorkCompletionRate >= 80 ? '#1976d2' : 
                     sprint.initialWorkCompletionRate >= 60 ? '#ed6c02' : '#d32f2f' 
            }}>
              {sprint.completedStoryPointsFromInitialIssues || 0} SP
            </strong> ({sprint.initialWorkCompletionRate.toFixed(0)}% of planned)
            {sprint.initialWorkCompletionRate >= 80 && ' 🎯'}
          </Typography>
        </Box>
        </Collapse>
      </Box>

      {/* Completion Rates with Progress Bars */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1.5 }}>
          📊 Completion Rates
        </Typography>
        
        {/* Overall Completion */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Overall Completion</Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {sprint.overallCompletionRate.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(sprint.overallCompletionRate, 100)} 
            sx={{ 
              height: 8, 
              borderRadius: 1,
              bgcolor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: sprint.overallCompletionRate >= 80 ? '#2e7d32' : 
                         sprint.overallCompletionRate >= 60 ? '#ed6c02' : '#d32f2f'
              }
            }}
          />
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {sprint.completedStoryPoints} completed / {sprint.totalStoryPoints} total SP
          </Typography>
        </Box>

        {/* Initial Work Completion */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">Initial Work Completion</Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {sprint.initialWorkCompletionRate.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(sprint.initialWorkCompletionRate, 100)} 
            sx={{ 
              height: 8, 
              borderRadius: 1,
              bgcolor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: sprint.initialWorkCompletionRate >= 80 ? '#1976d2' : 
                         sprint.initialWorkCompletionRate >= 60 ? '#0288d1' : '#ed6c02'
              }
            }}
          />
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {sprint.completedStoryPointsFromInitialIssues || 0} completed / {sprint.initialSprintStoryPoints || 0} planned SP
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

      {/* Issue Details - Collapsible */}
      {sprint.issueDetails && (
        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Box 
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', mb: issuesOpen ? 1 : 0 }}
            onClick={() => setIssuesOpen(!issuesOpen)}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              📝 Issue Details ({sprint.completedIssues + sprint.incompleteIssues + sprint.puntedIssues} total)
            </Typography>
            <IconButton size="small" sx={{ padding: '2px' }}>
              {issuesOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>
          <Collapse in={issuesOpen}>
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
          </Collapse>
        </Box>
      )}

      {/* Issues Summary */}
      <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
          🎯 Issues Summary
        </Typography>
        <Box sx={{ display: 'grid', gap: 0.5, fontSize: '0.75rem' }}>
          <Typography variant="caption">
            • Total Issues in Sprint: <strong>{sprint.totalIssues}</strong>
          </Typography>
          <Typography variant="caption" sx={{ pl: 2 }}>
            - Completed: {sprint.completedIssues}
          </Typography>
          <Typography variant="caption" sx={{ pl: 2 }}>
            - Incomplete: {sprint.incompleteIssues}
          </Typography>
          <Typography variant="caption" sx={{ pl: 2 }}>
            - Added During Sprint: {sprint.issuesAddedDuringSprint}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            • Punted/Removed Issues: <strong>{sprint.puntedIssues}</strong> (excluded from totals)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
