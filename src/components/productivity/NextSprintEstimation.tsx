import React from 'react';
import { Box, Typography, Card, CardContent, TextField } from '@mui/material';

interface NextSprintEstimationProps {
  nextSprintDevDays: number;
  averageStoryPointsPerDevDay: number;
  onNextSprintDevDaysChange: (value: number) => void;
}

export function NextSprintEstimation({ 
  nextSprintDevDays, 
  averageStoryPointsPerDevDay,
  onNextSprintDevDaysChange 
}: NextSprintEstimationProps) {
  const estimatedStoryPoints = averageStoryPointsPerDevDay * nextSprintDevDays;
  const conservativeEstimate = estimatedStoryPoints * 0.8;
  const optimisticEstimate = estimatedStoryPoints * 1.2;
  const reserveDays = Math.ceil(nextSprintDevDays * 0.1);

  return (
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
                  {estimatedStoryPoints.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on {averageStoryPointsPerDevDay.toFixed(1)} SP/day average
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ 
                    color: 'success.main',
                    display: 'block'
                  }}>
                    Conservative: {conservativeEstimate.toFixed(1)} SP
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'warning.main',
                    display: 'block'
                  }}>
                    Optimistic: {optimisticEstimate.toFixed(1)} SP
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
                Plan for <strong>{conservativeEstimate.toFixed(1)}-{estimatedStoryPoints.toFixed(1)} SP</strong> to account for uncertainties
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Consider team velocity trends and sprint-specific factors
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Reserve <strong>{reserveDays} day(s)</strong> for unexpected issues or scope changes
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
