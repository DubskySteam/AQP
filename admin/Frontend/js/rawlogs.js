const fetchLogData = async () => {
    try {
        const response = await fetch('http://localhost:4848/management/domain/view-log',
            {
                method: 'GET',
                mode: 'no-cors',  // Set mode to 'no-cors'
            });
        const logData = await response;

        console.log('Raw Log Data:', logData);
    } catch (error) {
        console.error('Error fetching log data:', error);
    }
};

// Call fetchLogData on window load
window.onload = fetchLogData;
