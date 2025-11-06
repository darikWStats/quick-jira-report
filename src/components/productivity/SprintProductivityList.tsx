import React from 'react';
import { Box, Typography } from '@mui/material';

interface Sprint {
  sprintId: string;
  sprint?: { name: string };
  completedStoryPoints: number;
  devDaysAvailable?: number;
  storyPointsPerDevDay: number;
}

interface SprintProductivityListProps {
  sprintProductivity: Sprint[];
  averageStoryPointsPerDevDay: number;
}

export function SprintProductivityList({ sprintProductivity, averageStoryPointsPerDevDay }: SprintProductivityListProps) {
  return (
    <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
        📊 Individual Sprint Productivity
      </Typography>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {sprintProductivity.map((sprint: Sprint) => (
          <Box 
            key={sprint.sprintId} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 1,
              bgcolor: '#ffffff',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {sprint.sprint?.name || 'Unknown Sprint'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sprint.completedStoryPoints} SP / {sprint.devDaysAvailable} days
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'bold',
                  color: sprint.storyPointsPerDevDay >= averageStoryPointsPerDevDay ? 'success.main' : 'warning.main'
                }}
              >
                {sprint.storyPointsPerDevDay.toFixed(1)} SP/day
              </Typography>
              {sprint.storyPointsPerDevDay >= averageStoryPointsPerDevDay ? (
                <Typography variant="caption" sx={{ color: 'success.main' }}>
                  Above Average
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: 'warning.main' }}>
                  Below Average
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
