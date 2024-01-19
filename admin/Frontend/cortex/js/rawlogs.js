/**
 * Author: Clemens Maas
 */

document.addEventListener('DOMContentLoaded', async function() {
    const logText = await fetchLog();
    const logContainer = document.getElementById('log-container');
    logContainer.innerHTML = formatLogEntry(logText);
    logContainer.scrollTop = logContainer.scrollHeight;

    const searchButton = document.getElementById('log-search-button');
    searchButton.addEventListener('click', function() {
        const searchTerm = document.getElementById('log-search-input').value;
        const filteredLog = filterLogEntries(logText, searchTerm);
        logContainer.innerHTML = formatLogEntry(filteredLog);
    });
});

function filterLogEntries(logText, searchTerm) {
    const logEntries = logText.split('\n');
    const filteredEntries = logEntries.filter(entry => entry.toLowerCase().includes(searchTerm.toLowerCase()));
    return filteredEntries.join('\n');
}

async function fetchLog() {
    const response = await fetch('http://localhost:8080/admin/api/log/getLog');
    return await response.text();
}

function formatLogEntry(logText) {
    const logEntries = logText.split('\n');
    const formattedEntries = logEntries.map(entry => {
        return entry.replace(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}\+\d{4})\]/, '<span class="timestamp">[$1]</span>')
                    .replace(/\[Payara (.+?)\]/, '<span class="payara-version">[Payara $1]</span>');
    });
    return formattedEntries.join('\n');
}