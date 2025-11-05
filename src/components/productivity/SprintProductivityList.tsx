import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

interface Sprint {
  sprintId: string;
  sprint?: { name: string };
  completedStoryPoints: number;
  devDaysAvailable: number;
  storyPointsPerDevDay: number;
}

interface SprintProductivityListProps {
  sprintProductivity: Sprint[];
  averageStoryPointsPerDevDay: number;
}

export function SprintProductivityList({ sprintProductivity, averageStoryPointsPerDevDay }: SprintProductivityListProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
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
                p: 1.5,
                bgcolor: '#f8f9fa',
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
      </CardContent>
    </Card>
  );
}
