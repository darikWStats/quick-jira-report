class JiraService {
  /**
   * Get sprint report data from Jira API
   * @param {Object} params - Request parameters
   * @param {string} params.jiraHost - Jira host URL
   * @param {string} params.email - User email
   * @param {string} params.jiraToken - Jira API token
   * @param {string} params.boardId - Board ID
   * @param {string} params.sprintId - Sprint ID
   * @returns {Promise<Object>} Sprint report data
   */
  async getSprintReport({ jiraHost, email, jiraToken, boardId, sprintId }) {
    const url = `${jiraHost}/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=${boardId}&sprintId=${sprintId}`;
    
    const credentials = Buffer.from(`${email}:${jiraToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get a specific issue from Jira
   * @param {Object} params - Request parameters
   * @param {string} params.jiraHost - Jira host URL
   * @param {string} params.email - User email
   * @param {string} params.jiraToken - Jira API token
   * @param {string} params.issueKey - Issue key (e.g., 'PROJ-123')
   * @returns {Promise<Object>} Issue data
   */
  async getIssue({ jiraHost, email, jiraToken, issueKey }) {
    const url = `${jiraHost}/rest/api/3/issue/${issueKey}`;
    
    const credentials = Buffer.from(`${email}:${jiraToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get available boards from Jira
   * @param {Object} params - Request parameters
   * @param {string} params.jiraHost - Jira host URL
   * @param {string} params.email - User email
   * @param {string} params.jiraToken - Jira API token
   * @param {string} [params.projectKey] - Optional project key to filter boards
   * @returns {Promise<Object>} Boards data
   */
  async getBoards({ jiraHost, email, jiraToken, projectKey }) {
    // Build URL with optional project key filter
    let url = `${jiraHost}/rest/agile/1.0/board?type=scrum`;
    if (projectKey) {
      url += `&projectKeyOrId=${projectKey}`;
    }
    
    const credentials = Buffer.from(`${email}:${jiraToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`Fetched ${data.values.length} boards${projectKey ? ` for project ${projectKey}` : ''}`);
    
    return {
      boards: data.values.map(board => ({
        id: board.id,
        name: board.name,
        type: board.type
      }))
    };
  }

  /**
   * Get sprints for a specific board
   * @param {Object} params - Request parameters
   * @param {string} params.jiraHost - Jira host URL
   * @param {string} params.email - User email
   * @param {string} params.jiraToken - Jira API token
   * @param {string} params.boardId - Board ID
   * @returns {Promise<Object>} Sprints data
   */
  async getSprints({ jiraHost, email, jiraToken, boardId }) {
    const credentials = Buffer.from(`${email}:${jiraToken}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    let allSprints = [];
    let startAt = 0;
    const maxResults = 50; // Jira's default page size
    let isLastPage = false;
    
    // Calculate date 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    while (!isLastPage) {
      const url = `${jiraHost}/rest/agile/1.0/board/${boardId}/sprint?state=active,closed&startAt=${startAt}&maxResults=${maxResults}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process and filter sprints from this page
      const pageSprints = data.values
        .map(sprint => ({
          id: sprint.id,
          name: sprint.name,
          state: sprint.state,
          startDate: sprint.startDate,
          endDate: sprint.endDate
        }))
        .filter(sprint => {
          // Always include active sprints
          if (sprint.state === 'active') {
            return true;
          }
          
          // For closed sprints, only include those closed in the last 12 months
          if (sprint.state === 'closed' && sprint.endDate) {
            const endDate = new Date(sprint.endDate);
            return endDate >= twelveMonthsAgo;
          }
          
          // Include sprints without end date (shouldn't happen for closed sprints, but just in case)
          return true;
        });
      
      allSprints = allSprints.concat(pageSprints);

      // Check if we've reached the last page
      isLastPage = data.isLast || data.values.length < maxResults || startAt + data.values.length >= data.total;
      startAt += maxResults;

      // Safety check to prevent infinite loops
      if (startAt > 5000) {
        console.warn('Stopped fetching sprints at 5000 to prevent infinite loop');
        break;
      }
    }

    // Sort sprints: active first, then by end date (most recent first)
    allSprints.sort((a, b) => {
      // Active sprints first
      if (a.state === 'active' && b.state !== 'active') return -1;
      if (a.state !== 'active' && b.state === 'active') return 1;
      
      // Among same state, sort by end date (most recent first)
      if (a.endDate && b.endDate) {
        return new Date(b.endDate) - new Date(a.endDate);
      }
      
      // If one has no end date, put it first
      if (!a.endDate) return -1;
      if (!b.endDate) return 1;
      
      return 0;
    });

    const activeCount = allSprints.filter(s => s.state === 'active').length;
    const closedCount = allSprints.filter(s => s.state === 'closed').length;
    
    console.log(`Fetched ${allSprints.length} sprints for board ${boardId} (${activeCount} active, ${closedCount} closed from last 12 months)`);
    
    return {
      sprints: allSprints
    };
  }

  /**
   * Get projects from Jira
   * @param {Object} params - Request parameters
   * @param {string} params.jiraHost - Jira host URL
   * @param {string} params.email - User email
   * @param {string} params.jiraToken - Jira API token
   * @returns {Promise<Object>} Projects data
   */
  async getProjects({ jiraHost, email, jiraToken }) {
    const credentials = Buffer.from(`${email}:${jiraToken}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    let allProjects = [];
    let startAt = 0;
    const maxResults = 50; // Jira's default page size
    let isLastPage = false;

    while (!isLastPage) {
      const url = `${jiraHost}/rest/api/3/project/search?expand=description,lead,issueTypes,url&startAt=${startAt}&maxResults=${maxResults}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add projects from this page
      const pageProjects = data.values.map(project => ({
        id: project.id,
        key: project.key,
        name: project.name,
        projectTypeKey: project.projectTypeKey
      }));
      
      allProjects = allProjects.concat(pageProjects);

      // Check if we've reached the last page
      isLastPage = data.isLast || data.values.length < maxResults || startAt + data.values.length >= data.total;
      startAt += maxResults;

      // Safety check to prevent infinite loops
      if (startAt > 10000) {
        console.warn('Stopped fetching projects at 10000 to prevent infinite loop');
        break;
      }
    }

    console.log(`Fetched ${allProjects.length} projects total`);
    
    return {
      projects: allProjects
    };
  }

  /**
   * Format sprint report data for display
   * @param {Object} reportData - Raw report data from Jira
   * @returns {Object} Formatted report data
   */
  formatSprintReport(reportData) {
    const contents = reportData.contents || {};
    
    return {
      completedIssuesInitialEstimate: contents.completedIssuesInitialEstimateSum?.value || 'N/A',
      completedIssuesFinalEstimate: contents.completedIssuesEstimateSum?.value || 'N/A',
      notCompletedIssuesInitialEstimate: contents.issuesNotCompletedInitialEstimateSum?.value || 'N/A',
      notCompletedIssuesFinalEstimate: contents.issuesNotCompletedEstimateSum?.value || 'N/A',
      allIssuesTotalEstimate: contents.allIssuesEstimateSum?.value || 'N/A',
      completedIssues: contents.completedIssues || [],
      issuesNotCompleted: contents.issuesNotCompleted || [],
      puntedIssues: contents.puntedIssues || []
    };
  }
}

module.exports = new JiraService();
