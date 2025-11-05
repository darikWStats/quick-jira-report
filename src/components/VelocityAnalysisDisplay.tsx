import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { SprintBreakdownCards } from './SprintBreakdownCards';
import { ProductivityAnalysis } from './ProductivityAnalysis';

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
}

interface VelocityInsights {
  averageInitialWorkCompletion?: number;
  averageScopeCreep?: number;
  totalPuntedIssues?: number;
  totalIncompleteIssues?: number;
  scopeCreepTotal?: number;
}

interface VelocityData {
  totalSprints: number;
  totalStoryPoints: number;
  averageVelocity: number;
  averageCompletionRate: number;
  insights?: VelocityInsights;
  sprints: Sprint[];
}

interface VelocityAnalysisDisplayProps {
  velocityData: VelocityData | null;
  nextSprintDevDays: number;
  onNextSprintDevDaysChange: (value: number) => void;
  onDevDaysChange: (sprintId: string, devDays: number) => void;
}

export function VelocityAnalysisDisplay({ 
  velocityData, 
  nextSprintDevDays, 
  onNextSprintDevDaysChange, 
  onDevDaysChange 
}: VelocityAnalysisDisplayProps) {
  if (!velocityData) {
    return (
      <Paper elevation={1} sx={{ padding: '2rem', marginTop: '2rem', textAlign: 'center', bgcolor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Select multiple sprints above to calculate team velocity
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Choose your project, board, and multiple sprints to analyze velocity trends
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: '2rem', marginTop: '2rem' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SpeedIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
        <Typography variant="h4" component="h2">
          Team Velocity Analysis
        </Typography>
      </Box>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Based on {velocityData.totalSprints} sprint{velocityData.totalSprints !== 1 ? 's' : ''} | 
        Total Story Points Completed: {velocityData.totalStoryPoints}
      </Typography>

      {/* Velocity Metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          📈 Core Velocity Metrics
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {velocityData.averageVelocity.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                Average Velocity (SP/Sprint)
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {velocityData.averageCompletionRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                Average Completion Rate
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                {velocityData.insights?.averageInitialWorkCompletion?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                Planned Work Completion
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                {velocityData.totalSprints}
              </Typography>
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                Sprints Analyzed
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Team Health Metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          🎯 Team Health & Discipline
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                {velocityData.insights?.averageScopeCreep?.toFixed(1) || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                Avg Scope Creep (SP)
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                {velocityData.insights?.totalPuntedIssues || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                Total Punted Issues
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                {velocityData.insights?.totalIncompleteIssues || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                Total Incomplete Issues
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {velocityData.insights?.scopeCreepTotal || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                Total Scope Creep (SP)
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Sprint Breakdown */}
      <SprintBreakdownCards
        sprints={velocityData.sprints}
        onDevDaysChange={onDevDaysChange}
      />

      {/* Productivity Analysis */}
      <ProductivityAnalysis
        velocityData={velocityData as any}
        nextSprintDevDays={nextSprintDevDays}
        onNextSprintDevDaysChange={onNextSprintDevDaysChange}
      />

      {/* Velocity Insights */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          💡 Velocity Insights
        </Typography>
        <Card sx={{ bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  🎯 Planning Recommendation:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on your average velocity of {velocityData.averageVelocity.toFixed(1)} story points per sprint, 
                  plan for {Math.floor(velocityData.averageVelocity * 0.8)}-{Math.ceil(velocityData.averageVelocity * 1.2)} 
                  story points in upcoming sprints.
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  📈 Performance Trend:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {velocityData.sprints.length >= 2 ? (
                    velocityData.sprints[velocityData.sprints.length - 1].completedStoryPoints > 
                    velocityData.sprints[velocityData.sprints.length - 2].completedStoryPoints ?
                    "🔥 Your velocity is trending upward! Great job maintaining momentum." :
                    velocityData.sprints[velocityData.sprints.length - 1].completedStoryPoints < 
                    velocityData.sprints[velocityData.sprints.length - 2].completedStoryPoints ?
                    "📉 Velocity has decreased in recent sprints. Consider reviewing capacity and impediments." :
                    "📊 Velocity is stable. Consistent performance across sprints."
                  ) : "📋 Add more sprints to see velocity trends."}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  🎯 Predictive Planning:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  At current velocity, your team can complete approximately {Math.round(velocityData.averageVelocity * 4)} 
                  story points per month or {Math.round(velocityData.averageVelocity * 12)} story points per quarter.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
}
