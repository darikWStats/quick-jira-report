// Postman Test Script for JIRA Sprint Report API Response
// This script extracts key metrics from the sprint report response

pm.test("Response status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has required structure", function () {
    const responseJson = pm.response.json();
    
    pm.expect(responseJson).to.have.property('contents');
    pm.expect(responseJson.contents).to.have.property('completedIssuesEstimateSum');
    pm.expect(responseJson.contents).to.have.property('allIssuesEstimateSum');
    pm.expect(responseJson.contents).to.have.property('issueKeysAddedDuringSprint');
});

pm.test("Extract and validate sprint metrics", function () {
    const responseJson = pm.response.json();
    
    // Extract completedIssuesEstimateSum.value
    const completedEstimateSum = responseJson.contents.completedIssuesEstimateSum.value;
    pm.expect(completedEstimateSum).to.be.a('number');
    
    // Extract allIssuesEstimateSum.value
    const allIssuesEstimateSum = responseJson.contents.allIssuesEstimateSum.value;
    pm.expect(allIssuesEstimateSum).to.be.a('number');
    
    // Extract issueKeysAddedDuringSprint
    const issueKeysAddedDuringSprint = responseJson.contents.issueKeysAddedDuringSprint;
    pm.expect(issueKeysAddedDuringSprint).to.be.an('object');
    
    // Store values in environment variables for use in other requests
    pm.environment.set("completedIssuesEstimateSum", completedEstimateSum);
    pm.environment.set("allIssuesEstimateSum", allIssuesEstimateSum);
    pm.environment.set("issueKeysAddedDuringSprint", JSON.stringify(issueKeysAddedDuringSprint));
    
    // Calculate overall completion percentage of story points
    const overallStoryPointsCompletionPercentage = allIssuesEstimateSum > 0 ? 
        ((completedEstimateSum / allIssuesEstimateSum) * 100).toFixed(2) : 0;
    pm.environment.set("overallStoryPointsCompletionPercentage", overallStoryPointsCompletionPercentage);
    
    // Keep legacy variable for backward compatibility
    pm.environment.set("sprintCompletionPercentage", overallStoryPointsCompletionPercentage);
    
    // Count issues added during sprint
    const issuesAddedCount = Object.keys(issueKeysAddedDuringSprint).length;
    pm.environment.set("issuesAddedCount", issuesAddedCount);
    
    // Calculate story points added during sprint
    const completedIssues = responseJson.contents.completedIssues || [];
    let storyPointsAddedDuringSprint = 0;
    
    completedIssues.forEach(issue => {
        if (issueKeysAddedDuringSprint[issue.key]) {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            storyPointsAddedDuringSprint += storyPoints;
        }
    });
    
    pm.environment.set("storyPointsAddedDuringSprint", storyPointsAddedDuringSprint);
    
    // Calculate completed story points from issues initially in sprint
    let completedStoryPointsFromInitialIssues = 0;
    
    completedIssues.forEach(issue => {
        if (!issueKeysAddedDuringSprint[issue.key]) {
            const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value || 
                               issue.estimateStatistic?.statFieldValue?.value || 0;
            completedStoryPointsFromInitialIssues += storyPoints;
        }
    });
    
    pm.environment.set("completedStoryPointsFromInitialIssues", completedStoryPointsFromInitialIssues);
    
    // Calculate initial sprint story points (total planned at sprint start)
    const initialSprintStoryPoints = allIssuesEstimateSum - storyPointsAddedDuringSprint;
    pm.environment.set("initialSprintStoryPoints", initialSprintStoryPoints);
    
    // Calculate completion percentage of initially planned work
    const initialWorkCompletionPercentage = initialSprintStoryPoints > 0 ? 
        ((completedStoryPointsFromInitialIssues / initialSprintStoryPoints) * 100).toFixed(2) : 0;
    pm.environment.set("initialWorkCompletionPercentage", initialWorkCompletionPercentage);
});

pm.test("Display extracted data summary", function () {
    const responseJson = pm.response.json();
    
    console.log(`
=== SPRINT METRICS SUMMARY ===
Sprint Name: ${responseJson.sprint?.name || "N/A"}
Sprint State: ${responseJson.sprint?.state || "N/A"}
─────────────────────────────────
Story Points - Completed: ${pm.environment.get("completedIssuesEstimateSum")}
Story Points - Total: ${pm.environment.get("allIssuesEstimateSum")}
Story Points - Added During Sprint: ${pm.environment.get("storyPointsAddedDuringSprint")}
Story Points - Initial (Planned): ${pm.environment.get("initialSprintStoryPoints")}
Story Points - Completed from Initial: ${pm.environment.get("completedStoryPointsFromInitialIssues")}
─────────────────────────────────
Overall Story Points Completion: ${pm.environment.get("overallStoryPointsCompletionPercentage")}%
Initial Work Completion: ${pm.environment.get("initialWorkCompletionPercentage")}%
─────────────────────────────────
Issues Added During Sprint: ${pm.environment.get("issuesAddedCount")}
Issues Not Completed: ${pm.environment.get("incompleteIssuesCount")}
Issues Punted: ${pm.environment.get("puntedIssuesCount")}
Issues Added Keys: ${Object.keys(responseJson.contents.issueKeysAddedDuringSprint)}
===============================
`);
    
    // Excel-friendly copy-paste section
    // Generate sprint report link (assuming JIRA base URL pattern)
    const sprintId = responseJson.sprint?.id || "N/A";
    const sprintReportLink = sprintId !== "N/A" ? 
        `${pm.request.url.toString().split('/rest/')[0]}/secure/RapidBoard.jspa?rapidView=&view=reporting&chart=sprintRetrospective&sprint=${sprintId}` : 
        "N/A";
    
    console.log(`=== COPY TO EXCEL ===
Sprint Name;Sprint Report Link;Story Points Completed;Story Points Total;Overall Completion %;Story Points Added;Story Points Initial;Completed from Initial;Initial Work Completion %;Issues Added;Issues Incomplete;Issues Punted
${(responseJson.sprint?.name || "N/A")};${sprintReportLink};${pm.environment.get("completedIssuesEstimateSum")};${pm.environment.get("allIssuesEstimateSum")};${pm.environment.get("overallStoryPointsCompletionPercentage")}%;${pm.environment.get("storyPointsAddedDuringSprint")};${pm.environment.get("initialSprintStoryPoints")};${pm.environment.get("completedStoryPointsFromInitialIssues")};${pm.environment.get("initialWorkCompletionPercentage")}%;${pm.environment.get("issuesAddedCount")};${pm.environment.get("incompleteIssuesCount")};${pm.environment.get("puntedIssuesCount")}
=====================
`);
});

// Optional: Additional validations and extractions
pm.test("Additional sprint data validation", function () {
    const responseJson = pm.response.json();
    
    // Validate that completed estimate sum is not greater than all issues sum
    const completedSum = responseJson.contents.completedIssuesEstimateSum.value;
    const allSum = responseJson.contents.allIssuesEstimateSum.value;
    
    pm.expect(completedSum).to.be.at.most(allSum, "Completed estimate sum should not exceed all issues sum");
    
    // Store additional metrics for summary display
    const puntedIssues = responseJson.contents.puntedIssues || [];
    const incompleteIssues = responseJson.contents.issuesNotCompletedInCurrentSprint || [];
    pm.environment.set("puntedIssuesCount", puntedIssues.length);
    pm.environment.set("incompleteIssuesCount", incompleteIssues.length);
});
