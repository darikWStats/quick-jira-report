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
          return {
            sprintId,
            sprint: sprintReport.sprint,
            completedStoryPoints: sprintReport.contents?.completedIssuesEstimateSum?.value || 0,
            totalStoryPoints: sprintReport.contents?.allIssuesEstimateSum?.value || 0,
            completedIssues: sprintReport.contents?.completedIssues?.length || 0,
            totalIssues: (sprintReport.contents?.completedIssues?.length || 0) + 
                        (sprintReport.contents?.issuesNotCompletedInCurrentSprint?.length || 0)
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
