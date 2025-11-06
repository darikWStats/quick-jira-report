import React from 'react';
import { Box, Typography } from '@mui/material';

interface ProductivityMetricsGridProps {
  averageStoryPointsPerDevDay: number;
  sprintsAnalyzed: number;
  totalStoryPoints: number;
  totalDevDays: number;
}

export function ProductivityMetricsGrid({
  averageStoryPointsPerDevDay,
  sprintsAnalyzed,
  totalStoryPoints,
  totalDevDays
}: ProductivityMetricsGridProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.5, mb: 2 }}>
      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {averageStoryPointsPerDevDay.toFixed(1)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Avg SP per Dev Day
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          {sprintsAnalyzed}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Sprints Analyzed
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
          {totalStoryPoints}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Total Story Points
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
          {totalDevDays.toFixed(1)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Total Dev Days
        </Typography>
      </Box>
    </Box>
  );
}
