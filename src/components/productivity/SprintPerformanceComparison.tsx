import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

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
  );
}
