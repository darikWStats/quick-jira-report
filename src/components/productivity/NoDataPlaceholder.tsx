import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export function NoDataPlaceholder() {
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
