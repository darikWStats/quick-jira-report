import React from 'react';
import { Box, Typography } from '@mui/material';

interface SprintMetrics {
  completedStoryPoints: number;
  totalStoryPoints: number;
  overallCompletionRate: number;
  initialWorkCompletionRate: number;
  completedStoryPointsFromInitialIssues?: number;
  initialSprintStoryPoints?: number;
  completedIssues: number;
  totalIssues: number;
  storyPointsAddedDuringSprint: number;
  issuesAddedDuringSprint: number;
  puntedIssues: number;
  incompleteIssues: number;
}

interface SprintMetricsGridProps {
  metrics: SprintMetrics;
}

export function SprintMetricsGrid({ metrics }: SprintMetricsGridProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 1.5 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Story Points
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
          {metrics.completedStoryPoints}/{metrics.totalStoryPoints}
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Overall Rate
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', lineHeight: 1.2 }}>
          {metrics.overallCompletionRate.toFixed(1)}%
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Planned Rate
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.main', lineHeight: 1.2 }}>
          {metrics.initialWorkCompletionRate.toFixed(1)}%
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Initial SP
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main', lineHeight: 1.2 }}>
          {metrics.completedStoryPointsFromInitialIssues || 0}/{metrics.initialSprintStoryPoints || 0}
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Issues Done
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
          {metrics.completedIssues}/{metrics.totalIssues}
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Scope Creep
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: metrics.storyPointsAddedDuringSprint > 0 ? 'warning.main' : 'success.main', lineHeight: 1.2 }}>
          {metrics.storyPointsAddedDuringSprint}SP
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Added
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: metrics.issuesAddedDuringSprint > 0 ? 'warning.main' : 'success.main', lineHeight: 1.2 }}>
          {metrics.issuesAddedDuringSprint}
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Punted
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: metrics.puntedIssues > 0 ? 'error.main' : 'success.main', lineHeight: 1.2 }}>
          {metrics.puntedIssues}
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Incomplete
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: metrics.incompleteIssues > 0 ? 'error.main' : 'success.main', lineHeight: 1.2 }}>
          {metrics.incompleteIssues}
        </Typography>
      </Box>
    </Box>
  );
}
