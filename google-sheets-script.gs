// This is a Google Apps Script file that needs to be deployed as a Web App
// Follow these steps to set it up:
// 1. Go to script.google.com
// 2. Create a new project
// 3. Copy this code into the project
// 4. Deploy as a Web App (Deploy > New deployment > Web app)
// 5. Set access to "Anyone" and execute as "Me"
// 6. Copy the deployment URL and paste it in google-sheets.js SCRIPT_URL

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    // If sheet is empty, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Employee Name',
        'Employee ID',
        'Calculation Method',
        'Hourly Rate',
        'Hours Worked',
        'Total Salary'
      ]);
    }
    
    // Append the new row of data
    sheet.appendRow([
      data.timestamp,
      data.employeeName,
      data.employeeId,
      data.calculationMethod,
      data.hourlyRate,
      data.hoursWorked,
      data.totalSalary
    ]);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Service is running'
  })).setMimeType(ContentService.MimeType.JSON);
}