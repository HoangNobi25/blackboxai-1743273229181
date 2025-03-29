// Google Sheets API configuration
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-IV3FKrK2Eqx_CtyacTJ0D6BVgqBDVKOIHbPajng99MubO1Y7kbsp3H9vykkVqjcD/exec'; // You'll need to replace this with your Google Apps Script Web App URL

async function saveToGoogleSheets(data) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        throw error;
    }
}