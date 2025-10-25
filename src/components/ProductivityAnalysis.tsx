import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField
} from '@mui/material';

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
  // Calculate productivity metrics for sprints with dev days data
  const sprintsWithDevDays = velocityData.sprints.filter((sprint: Sprint) => 
    sprint.devDaysAvailable && sprint.devDaysAvailable > 0
  );
  
  if (sprintsWithDevDays.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          ⚡ Productivity Analysis
        </Typography>
        <Card sx={{ bgcolor: '#fff3e0' }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              📝 Enter dev days for each sprint to see productivity analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add the number of development days available in each sprint above to calculate story points per dev day
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Calculate metrics
  const totalStoryPoints = sprintsWithDevDays.reduce((sum: number, sprint: Sprint) => 
    sum + sprint.completedStoryPoints, 0
  );
  const totalDevDays = sprintsWithDevDays.reduce((sum: number, sprint: Sprint) => 
    sum + sprint.devDaysAvailable, 0
  );
  const averageStoryPointsPerDevDay = totalDevDays > 0 ? totalStoryPoints / totalDevDays : 0;
  
  // Calculate individual sprint productivity
  const sprintProductivity = sprintsWithDevDays.map((sprint: Sprint) => ({
    ...sprint,
    storyPointsPerDevDay: sprint.devDaysAvailable > 0 ? 
      sprint.completedStoryPoints / sprint.devDaysAvailable : 0
  }));

  // Find best and worst performing sprints
  const bestSprint = sprintProductivity.reduce((best: any, sprint: any) => 
    sprint.storyPointsPerDevDay > best.storyPointsPerDevDay ? sprint : best
  );
  const worstSprint = sprintProductivity.reduce((worst: any, sprint: any) => 
    sprint.storyPointsPerDevDay < worst.storyPointsPerDevDay ? sprint : worst
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        ⚡ Productivity Analysis
      </Typography>
      
      {/* Overall Productivity Metrics */}
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
                {sprintsWithDevDays.length}
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

      {/* Performance Comparison */}
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

      {/* Individual Sprint Productivity */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
            📊 Individual Sprint Productivity
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {sprintProductivity.map((sprint: any) => (
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

      {/* Next Sprint Estimation */}
      <Card sx={{ mt: 2, bgcolor: '#f0f7ff', border: '1px solid #2196f3' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: 'primary.main' }}>
            🔮 Next Sprint Estimation
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                    style: { textAlign: 'center', padding: '8px 12px' }
                  }}
                  sx={{ 
                    width: '120px',
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.9rem'
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  dev days
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              {nextSprintDevDays > 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
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
                    {(averageStoryPointsPerDevDay * nextSprintDevDays).toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on {averageStoryPointsPerDevDay.toFixed(1)} SP/day average
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ 
                      color: 'success.main',
                      display: 'block'
                    }}>
                      Conservative: {(averageStoryPointsPerDevDay * nextSprintDevDays * 0.8).toFixed(1)} SP
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'warning.main',
                      display: 'block'
                    }}>
                      Optimistic: {(averageStoryPointsPerDevDay * nextSprintDevDays * 1.2).toFixed(1)} SP
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Enter dev days to see estimation
                </Typography>
              )}
            </Box>
          </Box>
          {nextSprintDevDays > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                💡 Planning Recommendations:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Plan for <strong>{(averageStoryPointsPerDevDay * nextSprintDevDays * 0.8).toFixed(1)}-{(averageStoryPointsPerDevDay * nextSprintDevDays).toFixed(1)} SP</strong> to account for uncertainties
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Consider team velocity trends and sprint-specific factors
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Reserve <strong>{Math.ceil(nextSprintDevDays * 0.1)} day(s)</strong> for unexpected issues or scope changes
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
