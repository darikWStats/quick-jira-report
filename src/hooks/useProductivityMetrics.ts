import { useMemo } from 'react';

interface Sprint {
  sprintId: string;
  sprint?: { name: string };
  completedStoryPoints: number;
  devDaysAvailable?: number;
}

interface SprintWithProductivity extends Sprint {
  storyPointsPerDevDay: number;
}

interface ProductivityMetrics {
  sprintsWithDevDays: Sprint[];
  totalStoryPoints: number;
  totalDevDays: number;
  averageStoryPointsPerDevDay: number;
  sprintProductivity: SprintWithProductivity[];
  bestSprint: SprintWithProductivity;
  worstSprint: SprintWithProductivity;
}

export function useProductivityMetrics(sprints: Sprint[]): ProductivityMetrics | null {
  return useMemo(() => {
    // Filter sprints with dev days data
    const sprintsWithDevDays = sprints.filter((sprint: Sprint) => 
      sprint.devDaysAvailable && sprint.devDaysAvailable > 0
    );
    
    if (sprintsWithDevDays.length === 0) {
      return null;
    }

    // Calculate metrics
    const totalStoryPoints = sprintsWithDevDays.reduce((sum: number, sprint: Sprint) => 
      sum + sprint.completedStoryPoints, 0
    );
    const totalDevDays = sprintsWithDevDays.reduce((sum: number, sprint: Sprint) => 
      sum + (sprint.devDaysAvailable || 0), 0
    );
    const averageStoryPointsPerDevDay = totalDevDays > 0 ? totalStoryPoints / totalDevDays : 0;
    
    // Calculate individual sprint productivity
    const sprintProductivity: SprintWithProductivity[] = sprintsWithDevDays.map((sprint: Sprint) => ({
      ...sprint,
      storyPointsPerDevDay: (sprint.devDaysAvailable && sprint.devDaysAvailable > 0) ? 
        sprint.completedStoryPoints / sprint.devDaysAvailable : 0
    }));

    // Find best and worst performing sprints
    const bestSprint = sprintProductivity.reduce((best: SprintWithProductivity, sprint: SprintWithProductivity) => 
      sprint.storyPointsPerDevDay > best.storyPointsPerDevDay ? sprint : best
    );
    const worstSprint = sprintProductivity.reduce((worst: SprintWithProductivity, sprint: SprintWithProductivity) => 
      sprint.storyPointsPerDevDay < worst.storyPointsPerDevDay ? sprint : worst
    );

    return {
      sprintsWithDevDays,
      totalStoryPoints,
      totalDevDays,
      averageStoryPointsPerDevDay,
      sprintProductivity,
      bestSprint,
      worstSprint
    };
  }, [sprints]);
}
