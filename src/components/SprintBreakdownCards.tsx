import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField
} from '@mui/material';

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
}

interface SprintBreakdownCardsProps {
  sprints: Sprint[];
  onDevDaysChange: (sprintId: string, devDays: number) => void;
}

export function SprintBreakdownCards({ sprints, onDevDaysChange }: SprintBreakdownCardsProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        📊 Sprint-by-Sprint Breakdown
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        {sprints.map((sprint: Sprint, index: number) => (
          <Card key={sprint.sprintId} variant="outlined" sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {sprint.sprint?.name || `Sprint ${index + 1}`}
                </Typography>
                <Chip 
                  label={sprint.sprint?.state || 'Unknown'} 
                  color={sprint.sprint?.state === 'closed' ? 'success' : 'default'}
                  size="small"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 1.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Story Points
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
                    {sprint.completedStoryPoints}/{sprint.totalStoryPoints}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Overall Rate
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', lineHeight: 1.2 }}>
                    {sprint.overallCompletionRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Planned Rate
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.main', lineHeight: 1.2 }}>
                    {sprint.initialWorkCompletionRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Issues Done
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                    {sprint.completedIssues}/{sprint.totalIssues}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Scope Creep
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: sprint.storyPointsAddedDuringSprint > 0 ? 'warning.main' : 'success.main', lineHeight: 1.2 }}>
                    {sprint.storyPointsAddedDuringSprint}SP
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Added
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: sprint.issuesAddedDuringSprint > 0 ? 'warning.main' : 'success.main', lineHeight: 1.2 }}>
                    {sprint.issuesAddedDuringSprint}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Punted
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: sprint.puntedIssues > 0 ? 'error.main' : 'success.main', lineHeight: 1.2 }}>
                    {sprint.puntedIssues}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Incomplete
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: sprint.incompleteIssues > 0 ? 'error.main' : 'success.main', lineHeight: 1.2 }}>
                    {sprint.incompleteIssues}
                  </Typography>
                </Box>
              </Box>
              
              {/* Dev Days Input Section */}
              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', minWidth: '70px' }}>
                    Dev Days:
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={sprint.devDaysAvailable || ''}
                    onChange={(e) => onDevDaysChange(sprint.sprintId, parseFloat(e.target.value) || 0)}
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
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
