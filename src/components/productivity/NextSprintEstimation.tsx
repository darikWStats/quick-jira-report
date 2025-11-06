import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

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
                {estimatedStoryPoints.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Based on {averageStoryPointsPerDevDay.toFixed(1)} SP/day average
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', display: 'block' }}>
                Conservative: {conservativeEstimate.toFixed(1)} SP
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.main', display: 'block' }}>
                Optimistic: {optimisticEstimate.toFixed(1)} SP
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
              Plan for <strong>{conservativeEstimate.toFixed(1)}-{estimatedStoryPoints.toFixed(1)} SP</strong> to account for uncertainties
            </Typography>
            <Typography component="li" variant="caption" color="text.secondary" sx={{ mb: 0.25 }}>
              Consider team velocity trends and sprint-specific factors
            </Typography>
            <Typography component="li" variant="caption" color="text.secondary">
              Reserve <strong>{reserveDays} day(s)</strong> for unexpected issues or scope changes
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
