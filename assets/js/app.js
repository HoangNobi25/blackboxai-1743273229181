// Local Storage key
const STORAGE_KEY = 'salary_calculations';

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Function to get calculations from local storage
function getCalculations() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
        console.error('Error reading from local storage:', error);
        return [];
    }
}

// Function to clear history
function clearHistory() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        renderHistory();
    } catch (error) {
        console.error('Error clearing history:', error);
    }
}

// Function to render history
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const calculations = getCalculations();
    
    if (calculations.length === 0) {
        historyList.innerHTML = '<p class="text-gray-500 text-center py-4">No calculations yet</p>';
        return;
    }

    historyList.innerHTML = calculations.reverse().map(calc => `
        <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-semibold">${calc.employeeName} (ID: ${calc.employeeId})</h3>
                    <p class="text-sm text-gray-500">${formatDate(calc.timestamp)}</p>
                </div>
                <span class="font-bold text-blue-600">$${calc.totalSalary}</span>
            </div>
            <div class="text-sm text-gray-600">
                <p>Method: ${calc.calculationMethod}</p>
                <p>Hours: ${calc.hoursWorked} @ $${calc.hourlyRate}/hour</p>
            </div>
        </div>
    `).join('');
}

// Function to save to local storage
function saveToLocalStorage(data) {
    try {
        // Get existing calculations
        let calculations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Add new calculation
        calculations.push(data);
        // Save back to local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
    } catch (error) {
        console.error('Error saving to local storage:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Render initial history
    renderHistory();

    // Add clear history button handler
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all calculation history?')) {
            clearHistory();
        }
    });

    // Get form elements
    const loadingSpinner = document.getElementById('loadingSpinner');
    const salaryForm = document.getElementById('salaryForm');
    const calculationMethodInputs = document.getElementsByName('calculationMethod');
    const directHoursSection = document.getElementById('directHoursSection');
    const timeRangeSection = document.getElementById('timeRangeSection');
    const resultSection = document.getElementById('resultSection');

    // Add event listeners for calculation method radio buttons
    calculationMethodInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.value === 'direct') {
                directHoursSection.classList.remove('hidden');
                timeRangeSection.classList.add('hidden');
                // Reset time range inputs
                document.getElementById('startTime').value = '';
                document.getElementById('endTime').value = '';
            } else {
                directHoursSection.classList.add('hidden');
                timeRangeSection.classList.remove('hidden');
                // Reset direct hours input
                document.getElementById('hoursWorked').value = '';
            }
        });
    });

    // Handle form submission
    salaryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const employeeName = document.getElementById('employeeName').value;
        const employeeId = document.getElementById('employeeId').value;
        const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
        const calculationMethod = document.querySelector('input[name="calculationMethod"]:checked').value;

        let hoursWorked = 0;

        // Calculate hours based on selected method
        if (calculationMethod === 'direct') {
            hoursWorked = parseFloat(document.getElementById('hoursWorked').value);
            if (isNaN(hoursWorked) || hoursWorked < 0) {
                alert('Please enter valid hours worked');
                return;
            }
        } else {
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;

            if (!startTime || !endTime) {
                alert('Please enter both start and end time');
                return;
            }

            // Calculate hours from time range
            const start = new Date(`2000/01/01 ${startTime}`);
            const end = new Date(`2000/01/01 ${endTime}`);

            if (end <= start) {
                // If end time is on the next day, add 24 hours
                end.setDate(end.getDate() + 1);
            }

            const timeDiff = end - start;
            hoursWorked = timeDiff / (1000 * 60 * 60); // Convert milliseconds to hours
        }

        // Calculate total salary
        const totalSalary = hourlyRate * hoursWorked;

        try {
            // Show loading spinner
            loadingSpinner.classList.remove('hidden');

            // Display results
            document.getElementById('resultEmployee').textContent = `${employeeName} (ID: ${employeeId})`;
            document.getElementById('resultHours').textContent = `${hoursWorked.toFixed(2)} hours`;
            document.getElementById('resultRate').textContent = `$${hourlyRate.toFixed(2)}/hour`;
            document.getElementById('resultTotal').textContent = `$${totalSalary.toFixed(2)}`;

            // Prepare calculation data
            const timestamp = new Date().toISOString();
            const calculationData = {
                id: Date.now().toString(), // Unique ID for each calculation
                timestamp,
                employeeName,
                employeeId,
                calculationMethod,
                hourlyRate: hourlyRate.toFixed(2),
                hoursWorked: hoursWorked.toFixed(2),
                totalSalary: totalSalary.toFixed(2)
            };

            // Save to both Google Sheets and Local Storage
            await saveToGoogleSheets(calculationData);
            saveToLocalStorage(calculationData);
            renderHistory(); // Update history display

            // Show result section with animation
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth' });

            // Add highlight animation to total salary
            const resultTotal = document.getElementById('resultTotal');
            resultTotal.classList.add('highlight');
            setTimeout(() => resultTotal.classList.remove('highlight'), 1000);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save data. Please try again.');
        } finally {
            // Hide loading spinner
            loadingSpinner.classList.add('hidden');
        }
    });

    // Form validation
    const validateForm = () => {
        const employeeName = document.getElementById('employeeName').value;
        const employeeId = document.getElementById('employeeId').value;
        const hourlyRate = document.getElementById('hourlyRate').value;
        
        if (!employeeName || !employeeId || !hourlyRate) {
            return false;
        }

        const calculationMethod = document.querySelector('input[name="calculationMethod"]:checked').value;
        
        if (calculationMethod === 'direct') {
            const hoursWorked = document.getElementById('hoursWorked').value;
            return !!hoursWorked;
        } else {
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;
            return !!startTime && !!endTime;
        }
    };

    // Add input validation listeners
    const inputs = salaryForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const isValid = validateForm();
            const submitButton = salaryForm.querySelector('button[type="submit"]');
            submitButton.disabled = !isValid;
            submitButton.classList.toggle('opacity-50', !isValid);
        });
    });
});