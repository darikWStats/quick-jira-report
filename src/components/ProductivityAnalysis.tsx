import React from 'react';
import { Box, Typography } from '@mui/material';
import { useProductivityMetrics } from '../hooks/useProductivityMetrics';
import { NoDataPlaceholder } from './productivity/NoDataPlaceholder';
import { ProductivityMetricsGrid } from './productivity/ProductivityMetricsGrid';
import { SprintPerformanceComparison } from './productivity/SprintPerformanceComparison';
import { SprintProductivityList } from './productivity/SprintProductivityList';
import { NextSprintEstimation } from './productivity/NextSprintEstimation';

interface Sprint {
  sprintId: string;
  sprint?: { name: string };
  completedStoryPoints: number;
  devDaysAvailable: number;
}

interface VelocityData {
  sprints: Sprint[];
}

interface ProductivityAnalysisProps {
  velocityData: VelocityData;
  nextSprintDevDays: number;
  onNextSprintDevDaysChange: (value: number) => void;
}

export function ProductivityAnalysis({ 
  velocityData, 
  nextSprintDevDays, 
  onNextSprintDevDaysChange 
}: ProductivityAnalysisProps) {
  const metrics = useProductivityMetrics(velocityData.sprints);
  
  if (!metrics) {
    return <NoDataPlaceholder />;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        ⚡ Productivity Analysis
      </Typography>
      
      <ProductivityMetricsGrid
        averageStoryPointsPerDevDay={metrics.averageStoryPointsPerDevDay}
        sprintsAnalyzed={metrics.sprintsWithDevDays.length}
        totalStoryPoints={metrics.totalStoryPoints}
        totalDevDays={metrics.totalDevDays}
      />

      <SprintPerformanceComparison
        bestSprint={metrics.bestSprint}
        worstSprint={metrics.worstSprint}
      />

      <SprintProductivityList
        sprintProductivity={metrics.sprintProductivity}
        averageStoryPointsPerDevDay={metrics.averageStoryPointsPerDevDay}
      />

      <NextSprintEstimation
        nextSprintDevDays={nextSprintDevDays}
        averageStoryPointsPerDevDay={metrics.averageStoryPointsPerDevDay}
        onNextSprintDevDaysChange={onNextSprintDevDaysChange}
      />
    </Box>
  );
}
