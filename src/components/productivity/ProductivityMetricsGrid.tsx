import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

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
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {averageStoryPointsPerDevDay.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg SP per Dev Day
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              {sprintsAnalyzed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sprints Analyzed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
              {totalStoryPoints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Story Points
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
              {totalDevDays.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Dev Days
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
