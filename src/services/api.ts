// API service for communicating with the backend
export interface AuthData {
  jiraHost: string;
  email: string;
  jiraToken: string;
}

export interface FormData extends AuthData {
  projectKey: string;
  boardId: string;
  sprintId: string;
  rememberMe: boolean;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

export interface Board {
  id: string;
  name: string;
  type: string;
}

export interface Sprint {
  id: string;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface BoardsResponse {
  boards: Board[];
}

export interface SprintsResponse {
  sprints: Sprint[];
}

export interface AppConfig {
  hasJiraHost: boolean;
  hasJiraEmail: boolean;
  hasJiraToken: boolean;
  jiraHost: string | null;
  jiraEmail: string | null;
  configurationStatus: {
    fullyConfigured: boolean;
    missingCredentials: string[];
  };
}

export class ApiService {
  // Get server configuration
  static async getConfig(): Promise<AppConfig> {
    try {
      const response = await fetch('/api/config');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching configuration:', error);
      throw error;
    }
  }

  static async generateReport(formData: FormData): Promise<any> {
    try {
      // Only send non-empty values to allow server-side defaults
      const payload: any = {
        boardId: formData.boardId,
        sprintId: formData.sprintId
      };

      // Only include auth data if provided (server will use env vars as fallback)
      if (formData.jiraHost) payload.jiraHost = formData.jiraHost;
      if (formData.email) payload.email = formData.email;
      if (formData.jiraToken) payload.jiraToken = formData.jiraToken;

      const response = await fetch('/api/sprint-report', {
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
      console.error('API Error:', error);
      throw error;
    }
  }

  static async healthCheck(): Promise<any> {
    try {
      const response = await fetch('/api/health');
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  static async getProjects(authData: Partial<AuthData>): Promise<ProjectsResponse> {
    try {
      // Only send non-empty values to allow server-side defaults
      const payload: any = {};
      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;

      const response = await fetch('/api/projects', {
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
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  static async getBoards(authData: Partial<AuthData>, projectKey?: string): Promise<BoardsResponse> {
    try {
      // Only send non-empty values to allow server-side defaults
      const payload: any = {};
      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;
      if (projectKey) payload.projectKey = projectKey;

      const response = await fetch('/api/boards', {
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
      console.error('API Error fetching boards:', error);
      throw error;
    }
  }

  static async getSprints(authData: Partial<AuthData>, boardId: string): Promise<SprintsResponse> {
    try {
      // Only send non-empty values to allow server-side defaults
      const payload: any = { boardId };
      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;

      const response = await fetch('/api/sprints', {
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
      console.error('API Error fetching sprints:', error);
      throw error;
    }
  }

  static async calculateVelocity(authData: Partial<AuthData>, boardId: string, sprintIds: string[]): Promise<any> {
    try {
      // Only send non-empty values to allow server-side defaults
      const payload: any = {
        boardId,
        sprintIds
      };

      // Only include auth data if provided (server will use env vars as fallback)
      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;

      const response = await fetch('/api/velocity-report-detailed', {
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

  // New method for individual sprint reports
  static async getSprintReport(authData: Partial<AuthData>, boardId: string, sprintId: string): Promise<any> {
    try {
      const payload: any = {
        boardId,
        sprintId
      };

      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;

      const response = await fetch('/api/sprint-report', {
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
      console.error('API Error fetching sprint report:', error);
      throw error;
    }
  }

  // Method to fetch a specific issue
  static async getIssue(authData: Partial<AuthData>, issueKey: string): Promise<any> {
    try {
      const payload: any = {
        issueKey
      };

      if (authData.jiraHost) payload.jiraHost = authData.jiraHost;
      if (authData.email) payload.email = authData.email;
      if (authData.jiraToken) payload.jiraToken = authData.jiraToken;

      const response = await fetch('/api/issue', {
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
      console.error('API Error fetching issue:', error);
      throw error;
    }
  }
}
