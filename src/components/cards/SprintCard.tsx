import React from 'react';
import { Box, Typography, Card, CardContent, Chip, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { SprintMetricsGrid } from './SprintMetricsGrid';
import { DevDaysInput } from './DevDaysInput';
import { SprintDetailedBreakdown } from './SprintDetailedBreakdown';

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

interface SprintCardProps {
  sprint: Sprint;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (sprintId: string) => void;
  onDevDaysChange: (sprintId: string, devDays: number) => void;
}

export function SprintCard({ sprint, index, isExpanded, onToggleExpand, onDevDaysChange }: SprintCardProps) {
  return (
    <Card key={sprint.sprintId} variant="outlined" sx={{ border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {sprint.sprint?.name || `Sprint ${index + 1}`}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => onToggleExpand(sprint.sprintId)}
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

        {/* Metrics Grid */}
        <SprintMetricsGrid 
          metrics={{
            completedStoryPoints: sprint.completedStoryPoints,
            totalStoryPoints: sprint.totalStoryPoints,
            overallCompletionRate: sprint.overallCompletionRate,
            initialWorkCompletionRate: sprint.initialWorkCompletionRate,
            completedStoryPointsFromInitialIssues: sprint.completedStoryPointsFromInitialIssues,
            initialSprintStoryPoints: sprint.initialSprintStoryPoints,
            completedIssues: sprint.completedIssues,
            totalIssues: sprint.totalIssues,
            storyPointsAddedDuringSprint: sprint.storyPointsAddedDuringSprint,
            issuesAddedDuringSprint: sprint.issuesAddedDuringSprint,
            puntedIssues: sprint.puntedIssues,
            incompleteIssues: sprint.incompleteIssues
          }}
        />

        {/* Dev Days Input */}
        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
          <DevDaysInput
            devDaysAvailable={sprint.devDaysAvailable}
            devDaysSource={sprint.devDaysSource}
            sprintGoalTicketKey={sprint.sprintGoalTicketKey}
            onDevDaysChange={(value: number) => onDevDaysChange(sprint.sprintId, value)}
          />
        </Box>

        {/* Expandable Detailed Breakdown */}
        <Collapse in={isExpanded}>
          <SprintDetailedBreakdown sprint={sprint} />
        </Collapse>
      </CardContent>
    </Card>
  );
}
