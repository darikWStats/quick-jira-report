import React from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { SprintBreakdownCards } from './SprintBreakdownCards';
import { useProductivityMetrics } from '../hooks/useProductivityMetrics';

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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          📈 Core Velocity Metrics
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.5 }}>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              {velocityData.averageVelocity.toFixed(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Average Velocity (SP/Sprint)
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
              {velocityData.averageCompletionRate.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Average Completion Rate
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
              {velocityData.insights?.averageInitialWorkCompletion?.toFixed(1) || 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Planned Work Completion
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
              {velocityData.totalSprints}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sprints Analyzed
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Team Health Metrics */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          🎯 Team Health & Discipline
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.5 }}>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
              {velocityData.insights?.averageScopeCreep?.toFixed(1) || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Scope Creep (SP)
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
              {velocityData.insights?.totalPuntedIssues || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Punted Issues
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
              {velocityData.insights?.totalIncompleteIssues || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Incomplete Issues
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              {velocityData.insights?.scopeCreepTotal || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Scope Creep (SP)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Combined Productivity & Sprint Analysis */}
      {(() => {
        const metrics = useProductivityMetrics(velocityData.sprints);
        
        if (!metrics) {
          return (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                ⚡ Productivity & Sprint Analysis
              </Typography>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffe0b2' }}>
                <Typography variant="body2" color="text.secondary">
                  📝 Enter dev days for each sprint to see productivity analysis
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Add the number of development days available in each sprint above to calculate story points per dev day
                </Typography>
              </Box>
            </Box>
          );
        }

        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              ⚡ Productivity & Sprint Analysis
            </Typography>
            
            {/* Overall Productivity Metrics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.5, mb: 2 }}>
              <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {metrics.averageStoryPointsPerDevDay.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg SP per Dev Day
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {metrics.sprintsWithDevDays.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sprints Analyzed
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                  {metrics.totalStoryPoints}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Story Points
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                  {metrics.totalDevDays.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Dev Days
                </Typography>
              </Box>
            </Box>

            {/* Individual Sprint Productivity */}
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                📊 Individual Sprint Productivity
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {metrics.sprintProductivity.map((sprint) => (
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
                          color: sprint.storyPointsPerDevDay >= metrics.averageStoryPointsPerDevDay ? 'success.main' : 'warning.main'
                        }}
                      >
                        {sprint.storyPointsPerDevDay.toFixed(1)} SP/day
                      </Typography>
                      {sprint.storyPointsPerDevDay >= metrics.averageStoryPointsPerDevDay ? (
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

            {/* Next Sprint Estimation */}
            <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'primary.main' }}>
                🔮 Next Sprint Estimation
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Enter dev days available for next sprint:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={nextSprintDevDays || ''}
                      onChange={(e) => onNextSprintDevDaysChange(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      inputProps={{ 
                        min: 0, 
                        step: 0.5,
                        style: { textAlign: 'center', padding: '6px 10px' }
                      }}
                      sx={{ 
                        width: '100px',
                        bgcolor: '#ffffff',
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      dev days
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  {nextSprintDevDays > 0 ? (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Estimated Story Points:
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: 'primary.main',
                          mb: 0.5
                        }}
                      >
                        {(metrics.averageStoryPointsPerDevDay * nextSprintDevDays).toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Based on {metrics.averageStoryPointsPerDevDay.toFixed(1)} SP/day average
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main', display: 'block' }}>
                        Conservative: {(metrics.averageStoryPointsPerDevDay * nextSprintDevDays * 0.8).toFixed(1)} SP
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'warning.main', display: 'block' }}>
                        Optimistic: {(metrics.averageStoryPointsPerDevDay * nextSprintDevDays * 1.2).toFixed(1)} SP
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Enter dev days to see estimation
                    </Typography>
                  )}
                </Box>
              </Box>
              {nextSprintDevDays > 0 && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                    💡 Planning Recommendations:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    <Typography component="li" variant="caption" color="text.secondary" sx={{ mb: 0.25 }}>
                      Plan for <strong>{(metrics.averageStoryPointsPerDevDay * nextSprintDevDays * 0.8).toFixed(1)}-{(metrics.averageStoryPointsPerDevDay * nextSprintDevDays).toFixed(1)} SP</strong> to account for uncertainties
                    </Typography>
                    <Typography component="li" variant="caption" color="text.secondary" sx={{ mb: 0.25 }}>
                      Consider team velocity trends and sprint-specific factors
                    </Typography>
                    <Typography component="li" variant="caption" color="text.secondary">
                      Reserve <strong>{Math.ceil(nextSprintDevDays * 0.1)} day(s)</strong> for unexpected issues or scope changes
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        );
      })()}

      {/* Sprint Breakdown */}
      <SprintBreakdownCards
        sprints={velocityData.sprints}
        onDevDaysChange={onDevDaysChange}
      />
    </Paper>
  );
}
