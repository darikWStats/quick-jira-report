import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { SprintCard } from './cards/SprintCard';

interface IssueDetail {
  key: string;
  storyPoints: number;
  isAddedDuringSprint?: boolean;
  type: 'completed' | 'incomplete' | 'punted';
}

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
  devDaysSource?: 'sprint-goal' | 'sprint-goal-api' | 'manual' | 'empty' | 'active-sprint';
  sprintGoalTicketKey?: string;
  issueDetails?: {
    completed: IssueDetail[];
    incomplete: IssueDetail[];
    punted: IssueDetail[];
  };
}

interface SprintBreakdownCardsProps {
  sprints: Sprint[];
  jiraHost: string;
  onDevDaysChange: (sprintId: string, devDays: number) => void;
}

export function SprintBreakdownCards({ sprints, jiraHost, onDevDaysChange }: SprintBreakdownCardsProps) {
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());

  const toggleExpand = (sprintId: string) => {
    setExpandedSprints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sprintId)) {
        newSet.delete(sprintId);
      } else {
        newSet.add(sprintId);
      }
      return newSet;
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        📊 Sprint-by-Sprint Breakdown
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        {sprints.map((sprint: Sprint, index: number) => (
          <SprintCard
            key={sprint.sprintId}
            sprint={sprint}
            index={index}
            isExpanded={expandedSprints.has(sprint.sprintId)}
            jiraHost={jiraHost}
            onToggleExpand={toggleExpand}
            onDevDaysChange={onDevDaysChange}
          />
        ))}
      </Box>
    </Box>
  );
}
