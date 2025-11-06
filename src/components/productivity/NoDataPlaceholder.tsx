import React from 'react';
import { Box, Typography } from '@mui/material';

export function NoDataPlaceholder() {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        ⚡ Productivity Analysis
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
