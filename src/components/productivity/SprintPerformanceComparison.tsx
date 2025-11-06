import React from 'react';
import { Box, Typography } from '@mui/material';

interface Sprint {
  sprintId: string;
  sprint?: { name: string };
  storyPointsPerDevDay: number;
}

interface SprintPerformanceComparisonProps {
  bestSprint: Sprint;
  worstSprint: Sprint;
}

export function SprintPerformanceComparison({ bestSprint, worstSprint }: SprintPerformanceComparisonProps) {
  return (
    <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
        🏆 Sprint Performance Comparison
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Box sx={{ p: 1.5, bgcolor: '#e8f5e8', borderRadius: 1, border: '1px solid #c8e6c9' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            🥇 Best Performance
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
            {bestSprint.sprint?.name || 'Unknown Sprint'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {bestSprint.storyPointsPerDevDay.toFixed(1)} SP per dev day
          </Typography>
        </Box>
        <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ffcdd2' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'error.main' }}>
            📈 Needs Improvement
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
            {worstSprint.sprint?.name || 'Unknown Sprint'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {worstSprint.storyPointsPerDevDay.toFixed(1)} SP per dev day
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
