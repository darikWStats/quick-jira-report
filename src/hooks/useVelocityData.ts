import { useState } from 'react';
import { ApiService, AuthData } from '../services/api';
import { FormData as FormDataType } from '../utils/validation';

interface UseVelocityDataProps {
  formData: FormDataType;
  selectedSprintIds: string[];
  showError: (message: string) => void;
}

interface UseVelocityDataReturn {
  velocityData: any;
  reportData: any;
  nextSprintDevDays: number;
  loadingVelocity: boolean;
  isLoading: boolean;
  calculateVelocity: () => Promise<void>;
  generateReport: () => Promise<void>;
  canGenerateReport: () => boolean;
  handleDevDaysChange: (sprintId: string, devDays: number) => void;
  setNextSprintDevDays: React.Dispatch<React.SetStateAction<number>>;
  setVelocityData: React.Dispatch<React.SetStateAction<any>>;
  setReportData: React.Dispatch<React.SetStateAction<any>>;
}

export function useVelocityData({ 
  formData, 
  selectedSprintIds, 
  showError 
}: UseVelocityDataProps): UseVelocityDataReturn {
  const [velocityData, setVelocityData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [nextSprintDevDays, setNextSprintDevDays] = useState<number>(0);
  const [loadingVelocity, setLoadingVelocity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canGenerateReport = (): boolean => {
    return Boolean(formData.boardId && formData.sprintId);
  };

  const generateReport = async () => {
    if (!canGenerateReport()) {
      showError('Please select a board and sprint');
      return;
    }

    setIsLoading(true);
    try {
      const reportDataResult = await ApiService.generateReport(formData);
      setReportData(reportDataResult);
    } catch (error) {
      showError(`Error generating report: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateVelocity = async () => {
    if (selectedSprintIds.length === 0) {
      showError('Please select at least one sprint');
      return;
    }

    setLoadingVelocity(true);
    try {
      const authData: AuthData = {
        jiraHost: formData.jiraHost,
        email: formData.email,
        jiraToken: formData.jiraToken
      };

      console.log('🔄 Fetching detailed sprint reports for velocity calculation...');
      const sprintReports = await Promise.all(
        selectedSprintIds.map(async (sprintId) => {
          console.log(`📊 Fetching sprint report for sprint ${sprintId}...`);
          const sprintReport = await ApiService.getSprintReport(authData, formData.boardId, sprintId);
          
          // Calculate enhanced metrics for each sprint
          const completedIssues = sprintReport.contents?.completedIssues || [];
          const issueKeysAddedDuringSprint = sprintReport.contents?.issueKeysAddedDuringSprint || {};
          const puntedIssues = sprintReport.contents?.puntedIssues || [];
          const incompleteIssues = sprintReport.contents?.issuesNotCompletedInCurrentSprint || [];
          
          const completedStoryPoints = sprintReport.contents?.completedIssuesEstimateSum?.value || 0;
          
          // Count issues added during sprint (excluding punted issues)
          const issuesAddedCount = [...completedIssues, ...incompleteIssues]
            .filter((issue: any) => !!issueKeysAddedDuringSprint[issue.key])
            .length;
          
          let actualSprintTotalPoints = 0;
          let storyPointsAddedDuringSprint = 0;
          let completedStoryPointsFromInitialIssues = 0;
          
          console.log(`\n📊 ============ Sprint ${sprintId} Detailed Breakdown ============`);
          console.log(`Sprint Name: ${sprintReport.sprint?.name}`);
          console.log(`Sprint State: ${sprintReport.sprint?.state}`);
          
          // Count completed issues
          console.log(`\n✅ COMPLETED ISSUES (${completedIssues.length}):`);
          completedIssues.forEach((issue: any) => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            const isAddedDuringSprint = !!issueKeysAddedDuringSprint[issue.key];
            actualSprintTotalPoints += storyPoints;
            
            console.log(`  ${issue.key}: ${storyPoints} SP ${isAddedDuringSprint ? '🆕 (Added mid-sprint)' : '📋 (Initial)'}`);
            
            if (isAddedDuringSprint) {
              storyPointsAddedDuringSprint += storyPoints;
            } else {
              completedStoryPointsFromInitialIssues += storyPoints;
            }
          });
          
          // Count incomplete issues
          console.log(`\n⏳ INCOMPLETE ISSUES (${incompleteIssues.length}):`);
          incompleteIssues.forEach((issue: any) => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            const isAddedDuringSprint = !!issueKeysAddedDuringSprint[issue.key];
            actualSprintTotalPoints += storyPoints;
            
            console.log(`  ${issue.key}: ${storyPoints} SP ${isAddedDuringSprint ? '🆕 (Added mid-sprint)' : '📋 (Initial)'}`);
            
            if (isAddedDuringSprint) {
              storyPointsAddedDuringSprint += storyPoints;
            }
          });
          
          // Punted issues
          console.log(`\n🚫 PUNTED/REMOVED ISSUES (${puntedIssues.length}) - EXCLUDED FROM TOTAL:`);
          puntedIssues.forEach((issue: any) => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            console.log(`  ${issue.key}: ${storyPoints} SP (not counted in total)`);
          });
          
          const totalStoryPoints = actualSprintTotalPoints;
          const initialSprintStoryPoints = actualSprintTotalPoints - storyPointsAddedDuringSprint;
          const overallCompletionRate = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0;
          const initialWorkCompletionRate = initialSprintStoryPoints > 0 ? 
            (completedStoryPointsFromInitialIssues / initialSprintStoryPoints) * 100 : 0;

          console.log(`\n📈 CALCULATION SUMMARY:`);
          console.log(`  Total Story Points: ${totalStoryPoints} SP`);
          console.log(`  Scope Creep: ${storyPointsAddedDuringSprint} SP`);
          console.log(`  Initial Planned Points: ${initialSprintStoryPoints} SP`);
          console.log(`  Completed from Initial: ${completedStoryPointsFromInitialIssues} SP`);
          console.log(`  Overall Completion: ${overallCompletionRate.toFixed(1)}%`);
          console.log(`  Initial Work Completion: ${initialWorkCompletionRate.toFixed(1)}%`);

          // Extract Sprint Goal ticket's original estimate
          let sprintGoalDevDays = undefined;
          let devDaysSource = 'empty';
          let sprintGoalTicketKey = undefined;
          
          const sprintState = sprintReport.sprint?.state?.toLowerCase();
          const isActiveSprint = sprintState === 'active';
          
          if (isActiveSprint) {
            devDaysSource = 'active-sprint';
            console.log(`⏭️ Skipping dev days extraction for active sprint ${sprintId}`);
          } else {
            const allIssues = [...completedIssues, ...incompleteIssues, ...puntedIssues];
            const sprintGoal = sprintReport.sprint?.goal;
            
            const sprintGoalTicket = allIssues.find((issue: any) => {
              const issueTypeName = issue.typeName?.toLowerCase() || '';
              const isSprintGoalType = issueTypeName.includes('sprint goal') || issueTypeName === 'goal';
              const summary = issue.summary?.toLowerCase() || '';
              const matchesGoal = sprintGoal && summary.includes(sprintGoal.toLowerCase());
              return isSprintGoalType || matchesGoal;
            });
            
            if (sprintGoalTicket) {
              sprintGoalTicketKey = sprintGoalTicket.key;
              let originalEstimateSeconds = sprintGoalTicket.estimateStatistic?.statFieldValue?.value || 
                                             sprintGoalTicket.trackingStatistic?.statFieldValue?.value || 0;
              
              if (originalEstimateSeconds > 0 && originalEstimateSeconds > 1000) {
                devDaysSource = 'sprint-goal';
              } else {
                try {
                  console.log(`⚠️ No estimate found in sprint report for ${sprintGoalTicket.key}, fetching from Jira API...`);
                  const issueData = await ApiService.getIssue(authData, sprintGoalTicket.key);
                  originalEstimateSeconds = issueData.fields?.timetracking?.originalEstimateSeconds || 0;
                  if (originalEstimateSeconds > 0) {
                    devDaysSource = 'sprint-goal-api';
                  }
                  console.log(`✅ Fetched original estimate from Jira API: ${originalEstimateSeconds} seconds`);
                } catch (error) {
                  console.error(`❌ Failed to fetch issue ${sprintGoalTicket.key}:`, (error as Error).message);
                }
              }
              
              if (originalEstimateSeconds > 0) {
                sprintGoalDevDays = originalEstimateSeconds / 28800;
              }
              
              console.log(`✅ Sprint Goal ticket found:`, {
                key: sprintGoalTicket.key,
                devDays: sprintGoalDevDays,
                source: devDaysSource
              });
            }
          }

          console.log(`✅ Sprint ${sprintId} analysis complete!\n`);

          return {
            sprintId,
            sprint: sprintReport.sprint,
            completedStoryPoints,
            totalStoryPoints,
            completedIssues: completedIssues.length,
            totalIssues: completedIssues.length + incompleteIssues.length, // Exclude punted issues
            issuesAddedDuringSprint: issuesAddedCount,
            puntedIssues: puntedIssues.length,
            incompleteIssues: incompleteIssues.length,
            storyPointsAddedDuringSprint,
            completedStoryPointsFromInitialIssues,
            initialSprintStoryPoints,
            overallCompletionRate,
            initialWorkCompletionRate,
            devDaysAvailable: sprintGoalDevDays,
            devDaysSource: devDaysSource,
            sprintGoalTicketKey: sprintGoalTicketKey
          };
        })
      );

      // Sort sprints by start date
      const sortedSprintReports = sprintReports.sort((a, b) => {
        const dateA = a.sprint?.startDate ? new Date(a.sprint.startDate).getTime() : 0;
        const dateB = b.sprint?.startDate ? new Date(b.sprint.startDate).getTime() : 0;
        return dateA - dateB;
      });

      // Calculate aggregate metrics
      const totalStoryPoints = sortedSprintReports.reduce((sum, sprint) => sum + sprint.completedStoryPoints, 0);
      const totalSprints = sortedSprintReports.length;
      const averageVelocity = totalSprints > 0 ? totalStoryPoints / totalSprints : 0;
      const averageCompletionRate = sortedSprintReports.reduce((sum, sprint) => sum + sprint.overallCompletionRate, 0) / totalSprints;

      const calculatedVelocityData = {
        totalSprints,
        totalStoryPoints,
        averageVelocity,
        averageCompletionRate,
        sprints: sortedSprintReports,
        insights: {
          scopeCreepTotal: sortedSprintReports.reduce((sum, sprint) => sum + sprint.storyPointsAddedDuringSprint, 0),
          averageScopeCreep: sortedSprintReports.reduce((sum, sprint) => sum + sprint.storyPointsAddedDuringSprint, 0) / totalSprints,
          averageInitialWorkCompletion: sortedSprintReports.reduce((sum, sprint) => sum + sprint.initialWorkCompletionRate, 0) / totalSprints,
          totalPuntedIssues: sortedSprintReports.reduce((sum, sprint) => sum + sprint.puntedIssues, 0),
          totalIncompleteIssues: sortedSprintReports.reduce((sum, sprint) => sum + sprint.incompleteIssues, 0)
        }
      };

      console.log('🎯 Velocity calculation complete:', {
        sprints: totalSprints,
        averageVelocity: averageVelocity.toFixed(1),
        averageCompletionRate: averageCompletionRate.toFixed(1) + '%'
      });

      setVelocityData(calculatedVelocityData);
    } catch (error) {
      console.error('❌ Velocity calculation failed:', error);
      showError(`Error calculating velocity: ${(error as Error).message}`);
    } finally {
      setLoadingVelocity(false);
    }
  };

  const handleDevDaysChange = (sprintId: string, devDays: number) => {
    if (!velocityData) return;
    
    const updatedVelocityData = {
      ...velocityData,
      sprints: velocityData.sprints.map((sprint: any) => 
        sprint.sprintId === sprintId 
          ? { 
              ...sprint, 
              devDaysAvailable: devDays,
              devDaysSource: 'manual'
            }
          : sprint
      )
    };
    
    setVelocityData(updatedVelocityData);
  };

  return {
    velocityData,
    reportData,
    nextSprintDevDays,
    loadingVelocity,
    isLoading,
    calculateVelocity,
    generateReport,
    canGenerateReport,
    handleDevDaysChange,
    setNextSprintDevDays,
    setVelocityData,
    setReportData
  };
}
