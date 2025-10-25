// Complete JIRA Velocity Chart API Implementation Guide

interface VelocityChartOptions {
  boardId: string;
  
  // Field Configuration
  estimateField?: string;        // Story points field ID
  trackingField?: string;        // Time tracking field ID
  
  // Filtering Options
  quickFilterIds?: number[];     // Board quick filters
  versionIds?: number[];         // Release versions
  sprintIds?: number[];          // Specific sprints
  
  // Date Range
  fromDate?: string;             // ISO date string
  toDate?: string;               // ISO date string
  
  // Pagination
  maxResults?: number;           // Default: 50
  startAt?: number;              // Default: 0
  
  // Additional Data
  includeSubtasks?: boolean;     // Include subtask story points
  includeWorklog?: boolean;      // Include time tracking data
  includeHistoric?: boolean;     // Include historical changes
}

interface VelocityChartResponse {
  // Basic Velocity Data
  velocityStatEntries: VelocitySprintEntry[];
  
  // Field Configuration
  trackingStatistic: {
    statFieldId: string;
    statFieldValue: {
      text: string;
    };
  };
  
  // Board Information
  rapidViewId: number;
  
  // Additional Metrics (if requested)
  averageVelocity?: number;
  velocityTrend?: 'increasing' | 'decreasing' | 'stable';
  forecastVelocity?: number;
}

interface VelocitySprintEntry {
  id: number;                    // Sprint ID
  estimated: number;             // Committed story points
  completed: number;             // Completed story points
  
  // Sprint Information
  icsVelocityStatistic: {
    text: string;                // Sprint name
  };
  
  // Additional Details (from sprint report)
  sprintDetails?: {
    name: string;
    state: string;
    startDate: string;
    endDate: string;
    goal?: string;
  };
  
  // Issue Breakdown
  issueBreakdown?: {
    totalIssues: number;
    completedIssues: number;
    addedIssues: number;
    removedIssues: number;
  };
}

// Backend Implementation Example
class JiraVelocityService {
  
  // Get velocity chart data
  async getVelocityChart(options: VelocityChartOptions): Promise<VelocityChartResponse> {
    const params = new URLSearchParams({
      rapidViewId: options.boardId.toString()
    });
    
    if (options.estimateField) params.append('estimateStatisticId', options.estimateField);
    if (options.quickFilterIds) params.append('quickFilterIds', options.quickFilterIds.join(','));
    if (options.versionIds) params.append('versionIds', options.versionIds.join(','));
    
    const response = await this.jiraRequest(
      `GET /rest/greenhopper/1.0/rapid/charts/velocity?${params}`
    );
    
    // Enhance with additional data if requested
    if (options.includeSubtasks || options.includeWorklog) {
      response.velocityStatEntries = await this.enhanceVelocityData(
        response.velocityStatEntries, 
        options
      );
    }
    
    return response;
  }
  
  // Get detailed sprint reports for velocity calculation
  async getDetailedVelocityReport(options: VelocityChartOptions): Promise<DetailedVelocityResponse> {
    // 1. Get basic velocity chart
    const velocityChart = await this.getVelocityChart(options);
    
    // 2. Get detailed sprint reports
    const detailedSprints = await Promise.all(
      velocityChart.velocityStatEntries.map(entry => 
        this.getSprintReport(options.boardId, entry.id)
      )
    );
    
    // 3. Calculate enhanced metrics
    const enhancedMetrics = this.calculateEnhancedMetrics(detailedSprints);
    
    return {
      ...velocityChart,
      detailedSprints,
      enhancedMetrics
    };
  }
  
  // Get sprint report with full details
  async getSprintReport(boardId: string, sprintId: number) {
    const response = await this.jiraRequest(
      `GET /rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=${boardId}&sprintId=${sprintId}`
    );
    
    return {
      sprintId,
      sprintInfo: response.sprint,
      completedIssues: response.contents.completedIssues || [],
      incompleteIssues: response.contents.issuesNotCompletedInCurrentSprint || [],
      puntedIssues: response.contents.puntedIssues || [],
      addedIssues: response.contents.issueKeysAddedDuringSprint || {},
      storyPointsCompleted: response.contents.completedIssuesEstimateSum?.value || 0,
      storyPointsTotal: response.contents.allIssuesEstimateSum?.value || 0
    };
  }
}

// Usage Examples
const velocityOptions: VelocityChartOptions = {
  boardId: "123",
  maxResults: 10,
  includeSubtasks: true,
  includeWorklog: true,
  fromDate: "2024-01-01",
  toDate: "2024-12-31"
};

// Basic velocity chart
const velocityChart = await jiraService.getVelocityChart(velocityOptions);

// Detailed velocity report with sprint breakdowns
const detailedReport = await jiraService.getDetailedVelocityReport(velocityOptions);
