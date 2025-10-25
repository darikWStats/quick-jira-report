import React from 'react';
import {
  Box,
  Tabs,
  Tab
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SpeedIcon from '@mui/icons-material/Speed';

interface TabNavigationProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={activeTab} onChange={onTabChange} aria-label="jira analytics tabs">
        <Tab 
          icon={<AssessmentIcon />} 
          label="Sprint Report" 
          sx={{ minHeight: '64px' }}
        />
        <Tab 
          icon={<SpeedIcon />} 
          label="Team Velocity" 
          sx={{ minHeight: '64px' }}
        />
      </Tabs>
    </Box>
  );
}
