const express = require('express');
const router = express.Router();
const jiraService = require('../services/jiraService');

// Helper function to get Jira credentials
function getJiraCredentials(reqBody) {
  const credentials = {
    jiraHost: reqBody.jiraHost || process.env.JIRA_HOST,
    email: reqBody.email || process.env.JIRA_EMAIL,
    jiraToken: reqBody.jiraToken || process.env.JIRA_TOKEN
  };

  // Ensure all required credentials are present
  if (!credentials.jiraHost || !credentials.email || !credentials.jiraToken) {
    throw new Error('Missing required Jira credentials. Please provide them in the request or set environment variables.');
  }

  return credentials;
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get configuration endpoint (returns non-sensitive config)
router.get('/config', (req, res) => {
  try {
    const config = {
      hasJiraHost: !!process.env.JIRA_HOST,
      hasJiraEmail: !!process.env.JIRA_EMAIL,
      hasJiraToken: !!process.env.JIRA_TOKEN,
      jiraHost: process.env.JIRA_HOST || null,
      jiraEmail: process.env.JIRA_EMAIL || null,
      configurationStatus: {
        fullyConfigured: !!(process.env.JIRA_HOST && process.env.JIRA_EMAIL && process.env.JIRA_TOKEN),
        missingCredentials: []
      }
    };

    // Add missing credentials to the list
    if (!process.env.JIRA_HOST) config.configurationStatus.missingCredentials.push('JIRA_HOST');
    if (!process.env.JIRA_EMAIL) config.configurationStatus.missingCredentials.push('JIRA_EMAIL');
    if (!process.env.JIRA_TOKEN) config.configurationStatus.missingCredentials.push('JIRA_TOKEN');

    res.json(config);
  } catch (error) {
    console.error('Error getting configuration:', error);
    res.status(500).json({
      error: 'Failed to get configuration',
      message: error.message
    });
  }
});

// Generate sprint report endpoint
router.post('/sprint-report', async (req, res) => {
  try {
    const credentials = getJiraCredentials(req.body);
    const { boardId, sprintId } = req.body;

    // Validate required fields
    if (!boardId || !sprintId) {
      return res.status(400).json({
        error: 'Missing required fields: boardId, sprintId'
      });
    }

    const reportData = await jiraService.getSprintReport({
      ...credentials,
      boardId,
      sprintId
    });

    res.json(reportData);
  } catch (error) {
    console.error('Error generating sprint report:', error);
    res.status(500).json({
      error: 'Failed to generate sprint report',
      message: error.message
    });
  }
});

// Get boards endpoint
router.post('/boards', async (req, res) => {
  try {
    const credentials = getJiraCredentials(req.body);
    const { projectKey } = req.body;
    
    const boards = await jiraService.getBoards({
      ...credentials,
      projectKey
    });
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({
      error: 'Failed to fetch boards',
      message: error.message
    });
  }
});

// Get projects endpoint
router.post('/projects', async (req, res) => {
  try {
    const credentials = getJiraCredentials(req.body);
    const projects = await jiraService.getProjects(credentials);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

// Get sprints endpoint  
router.post('/sprints', async (req, res) => {
  try {
    const credentials = getJiraCredentials(req.body);
    const { boardId } = req.body;

    if (!boardId) {
      return res.status(400).json({
        error: 'Missing required field: boardId'
      });
    }

    const sprints = await jiraService.getSprints({
      ...credentials,
      boardId
    });

    res.json(sprints);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({
      error: 'Failed to fetch sprints',
      message: error.message
    });
  }
});

// Get single issue endpoint
router.post('/issue', async (req, res) => {
  try {
    const credentials = getJiraCredentials(req.body);
    const { issueKey } = req.body;

    if (!issueKey) {
      return res.status(400).json({
        error: 'Missing required field: issueKey'
      });
    }

    const issue = await jiraService.getIssue({
      ...credentials,
      issueKey
    });

    res.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      error: 'Failed to fetch issue',
      message: error.message
    });
  }
});

// Velocity calculation endpoint
router.post('/velocity-report', async (req, res) => {
  try {
    const credentials = getJiraCredentials(req.body);
    const { boardId, sprintIds } = req.body;

    if (!boardId) {
      return res.status(400).json({
        error: 'Board ID is required'
      });
    }

    if (!sprintIds || !Array.isArray(sprintIds) || sprintIds.length === 0) {
      return res.status(400).json({
        error: 'Sprint IDs array is required and must contain at least one sprint'
      });
    }

    console.log(`Calculating velocity for board ${boardId} with ${sprintIds.length} sprints`);

    // Fetch sprint reports for all selected sprints
    const sprintReports = await Promise.all(
      sprintIds.map(async (sprintId) => {
        try {
          const sprintReport = await jiraService.getSprintReport(credentials, boardId, sprintId);
          
          // Calculate actual sprint scope (only issues that were part of this sprint)
          // Exclude punted/removed issues from the total story points calculation
          const completedIssues = sprintReport.contents?.completedIssues || [];
          const incompleteIssues = sprintReport.contents?.issuesNotCompletedInCurrentSprint || [];
          const puntedIssues = sprintReport.contents?.puntedIssues || [];
          
          console.log(`\n📊 ============ Sprint ${sprintId} (Backend) ============`);
          console.log(`Sprint Name: ${sprintReport.sprint?.name}`);
          console.log(`Sprint State: ${sprintReport.sprint?.state}`);
          
          let actualSprintTotalPoints = 0;
          
          console.log(`\n✅ COMPLETED ISSUES (${completedIssues.length}):`);
          completedIssues.forEach(issue => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            actualSprintTotalPoints += storyPoints;
            console.log(`  ${issue.key}: ${storyPoints} SP`);
          });
          
          console.log(`\n⏳ INCOMPLETE ISSUES (${incompleteIssues.length}):`);
          incompleteIssues.forEach(issue => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            actualSprintTotalPoints += storyPoints;
            console.log(`  ${issue.key}: ${storyPoints} SP`);
          });
          
          console.log(`\n🚫 PUNTED/REMOVED ISSUES (${puntedIssues.length}) - EXCLUDED:`);
          puntedIssues.forEach(issue => {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            console.log(`  ${issue.key}: ${storyPoints} SP (not counted)`);
          });
          
          const completedStoryPoints = sprintReport.contents?.completedIssuesEstimateSum?.value || 0;
          console.log(`\n📈 TOTALS:`);
          console.log(`  Total Story Points: ${actualSprintTotalPoints} SP`);
          console.log(`  Completed: ${completedStoryPoints} SP`);
          console.log(`  Total Issues: ${completedIssues.length + incompleteIssues.length}`);
          console.log(`  Punted (excluded): ${puntedIssues.length}`);
          
          // Extract Sprint Goal ticket's original estimate (if exists)
          let sprintGoalDevDays = undefined;
          let devDaysSource = 'empty';
          let sprintGoalTicketKey = undefined;
          
          const sprintState = sprintReport.sprint?.state?.toLowerCase();
          const isActiveSprint = sprintState === 'active';
          
          // Skip dev days extraction for active sprints
          if (isActiveSprint) {
            devDaysSource = 'active-sprint';
            console.log(`⏭️ Skipping dev days extraction for active sprint ${sprintId}`);
          } else {
            const allIssues = [...completedIssues, ...incompleteIssues, ...puntedIssues];
            const sprintGoal = sprintReport.sprint?.goal;
            
            // Find Sprint Goal ticket by matching sprint goal text in issue summary or checking issue type
            const sprintGoalTicket = allIssues.find(issue => {
              // Check if issue type is "Sprint Goal" or similar
              const issueTypeName = issue.typeName?.toLowerCase() || '';
              const isSprintGoalType = issueTypeName.includes('sprint goal') || issueTypeName === 'goal';
              
              // Also check if issue summary matches the sprint goal
              const summary = issue.summary?.toLowerCase() || '';
              const matchesGoal = sprintGoal && summary.includes(sprintGoal.toLowerCase());
              
              return isSprintGoalType || matchesGoal;
            });
            
            if (sprintGoalTicket) {
              sprintGoalTicketKey = sprintGoalTicket.key;
              
              // Extract original estimate in seconds and convert to days (8 hours = 1 day)
              let originalEstimateSeconds = sprintGoalTicket.estimateStatistic?.statFieldValue?.value || 
                                             sprintGoalTicket.trackingStatistic?.statFieldValue?.value || 0;
              
              // Check if we got a valid value from sprint report (should be in seconds, not story points)
              if (originalEstimateSeconds > 0 && originalEstimateSeconds > 1000) {
                devDaysSource = 'sprint-goal';
              } else {
                // Fallback: If estimation is zero or empty, fetch the issue directly from Jira API
                try {
                  console.log(`⚠️ No estimate found in sprint report for ${sprintGoalTicket.key}, fetching directly from Jira API...`);
                  const issueData = await jiraService.getIssue({
                    ...credentials,
                    issueKey: sprintGoalTicket.key
                  });
                  
                  // Extract original estimate from the issue fields
                  originalEstimateSeconds = issueData.fields?.timetracking?.originalEstimateSeconds || 0;
                  if (originalEstimateSeconds > 0) {
                    devDaysSource = 'sprint-goal-api';
                  }
                  console.log(`✅ Fetched original estimate from Jira API: ${originalEstimateSeconds} seconds`);
                } catch (error) {
                  console.error(`❌ Failed to fetch issue ${sprintGoalTicket.key} from Jira API:`, error.message);
                }
              }
              
              // Convert seconds to days (assuming 8-hour workday = 28800 seconds)
              if (originalEstimateSeconds > 0) {
                sprintGoalDevDays = originalEstimateSeconds / 28800; // 8 hours * 60 min * 60 sec = 28800
              }
              
              console.log(`Sprint Goal ticket found for sprint ${sprintId}:`, {
                key: sprintGoalTicket.key,
                originalEstimateSeconds,
                devDays: sprintGoalDevDays,
                source: devDaysSource
              });
            }
          }
          
          // Prepare detailed issue breakdown for UI
          const issueDetails = {
            completed: completedIssues.map(issue => ({
              key: issue.key,
              storyPoints: parseFloat(issue.estimateStatistic?.statFieldValue?.value) || 0,
              isAddedDuringSprint: issue.added === true
            })),
            incomplete: incompleteIssues.map(issue => ({
              key: issue.key,
              storyPoints: parseFloat(issue.estimateStatistic?.statFieldValue?.value) || 0,
              isAddedDuringSprint: issue.added === true
            })),
            punted: puntedIssues.map(issue => ({
              key: issue.key,
              storyPoints: parseFloat(issue.estimateStatistic?.statFieldValue?.value) || 0,
              isAddedDuringSprint: false // punted issues are not tracked for "added during sprint"
            }))
          };
          
          return {
            sprintId,
            sprint: sprintReport.sprint,
            completedStoryPoints: sprintReport.contents?.completedIssuesEstimateSum?.value || 0,
            totalStoryPoints: actualSprintTotalPoints, // Use calculated actual sprint scope
            completedIssues: completedIssues.length,
            totalIssues: completedIssues.length + incompleteIssues.length, // Exclude punted issues
            devDaysAvailable: sprintGoalDevDays,
            devDaysSource: devDaysSource,
            sprintGoalTicketKey: sprintGoalTicketKey,
            issueDetails: issueDetails
          };
        } catch (error) {
          console.error(`Error fetching sprint ${sprintId}:`, error);
          return {
            sprintId,
            sprint: { name: `Sprint ${sprintId}`, state: 'unknown' },
            completedStoryPoints: 0,
            totalStoryPoints: 0,
            completedIssues: 0,
            totalIssues: 0,
            error: error.message
          };
        }
      })
    );

    // Calculate velocity metrics
    const validSprints = sprintReports.filter(sprint => !sprint.error);
    const totalStoryPoints = validSprints.reduce((sum, sprint) => sum + sprint.completedStoryPoints, 0);
    const averageVelocity = validSprints.length > 0 ? totalStoryPoints / validSprints.length : 0;
    const averageCompletionRate = validSprints.length > 0 ? 
      validSprints.reduce((sum, sprint) => 
        sum + (sprint.totalStoryPoints > 0 ? (sprint.completedStoryPoints / sprint.totalStoryPoints) * 100 : 0), 0
      ) / validSprints.length : 0;

    const velocityData = {
      sprints: sprintReports,
      averageVelocity,
      totalSprints: sprintReports.length,
      validSprints: validSprints.length,
      totalStoryPoints,
      averageCompletionRate,
      calculatedAt: new Date().toISOString()
    };

    res.json(velocityData);
  } catch (error) {
    console.error('Error calculating velocity:', error);
    res.status(500).json({
      error: 'Failed to calculate velocity',
      message: error.message
    });
  }
});

module.exports = router;
