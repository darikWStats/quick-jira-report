import React from 'react';
import { Box, Typography, TextField, Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface DevDaysInputProps {
  devDaysAvailable: number | undefined;
  devDaysSource?: 'sprint-goal' | 'sprint-goal-api' | 'manual' | 'empty' | 'active-sprint';
  sprintGoalTicketKey?: string;
  onDevDaysChange: (value: number) => void;
}

export function DevDaysInput({ 
  devDaysAvailable,
  devDaysSource, 
  sprintGoalTicketKey, 
  onDevDaysChange 
}: DevDaysInputProps) {
  const getTooltipText = () => {
    switch (devDaysSource) {
      case 'active-sprint':
        return 'Active sprint - dev days not auto-filled. Please enter manually if needed.';
      case 'sprint-goal':
        return `Auto-filled from Sprint Goal ticket (${sprintGoalTicketKey || 'unknown'}) original estimate in sprint report`;
      case 'sprint-goal-api':
        return `Auto-filled from Sprint Goal ticket (${sprintGoalTicketKey || 'unknown'}) via Jira API (fallback - not found in sprint report)`;
      case 'manual':
        return 'Manually entered value';
      default:
        return 'No Sprint Goal ticket found. Please enter manually.';
    }
  };

  const isAutoFilled = devDaysSource === 'sprint-goal' || devDaysSource === 'sprint-goal-api';

  return (
    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', minWidth: '70px' }}>
          Dev Days:
        </Typography>
        <TextField
          type="number"
          size="small"
          value={devDaysAvailable || ''}
          onChange={(e) => onDevDaysChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          inputProps={{ 
            min: 0, 
            step: 0.5,
            style: { textAlign: 'center', padding: '4px 8px' }
          }}
          sx={{ 
            width: '80px',
            '& .MuiOutlinedInput-root': {
              height: '28px',
              fontSize: '0.8rem'
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          days
        </Typography>
        <Tooltip title={getTooltipText()} arrow placement="top">
          <IconButton 
            size="small" 
            sx={{ 
              padding: '2px',
              color: isAutoFilled ? 'info.main' : 'text.secondary'
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: '16px' }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
