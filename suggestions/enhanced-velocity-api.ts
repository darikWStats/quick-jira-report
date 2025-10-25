// Enhanced API service method for better velocity reporting

export interface VelocityReportOptions {
  includeSubtasks?: boolean;
  includeTimeTracking?: boolean;
  includeIssueDetails?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export class ApiService {
  // Enhanced velocity calculation with more options
  static async calculateVelocity(
    authData: Partial<AuthData>, 
    boardId: string, 
    sprintIds: string[],
    options: VelocityReportOptions = {}
  ): Promise<DetailedVelocityResponse> {
    try {
      const payload: any = {
        boardId,
        sprintIds,
        ...options
      };

      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;

      const response = await fetch('/api/velocity-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error calculating velocity:', error);
      throw error;
    }
  }

  // Get JIRA's built-in velocity chart data
  static async getVelocityChart(authData: Partial<AuthData>, boardId: string): Promise<any> {
    try {
      const payload: any = { boardId };
      
      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;

      const response = await fetch('/api/velocity-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error fetching velocity chart:', error);
      throw error;
    }
  }

  // Get burndown chart data for additional insights
  static async getBurndownChart(authData: Partial<AuthData>, sprintId: string): Promise<any> {
    try {
      const payload: any = { sprintId };
      
      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;

      const response = await fetch('/api/burndown-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error fetching burndown chart:', error);
      throw error;
    }
  }
}
