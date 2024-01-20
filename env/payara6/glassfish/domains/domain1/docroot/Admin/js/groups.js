/**
 * Author: Clemens Maas
 */

document.addEventListener('DOMContentLoaded', function() {
    const openDialogButton = document.getElementById('open-dialog-btn');
    openDialogButton.addEventListener('click', function() {
        const dialog = document.getElementById('dialog');
        toggleDialog(dialog, openDialogButton);
    });
});

function toggleDialog(dialog, button) {
    const isVisible = dialog.style.display === 'block';
    dialog.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        // Position the dialog below the button
        const buttonRect = button.getBoundingClientRect();
        dialog.style.left = `${buttonRect.left}px`;
        dialog.style.top = `${buttonRect.bottom}px`;
    }
}

document.getElementById('group-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        creationDate: document.getElementById('creationDate').value,
        adminUser: {
            id: parseInt(document.getElementById('adminUserId').value, 10),
            username: document.getElementById('adminUsername').value
        },
        description: document.getElementById('description').value
    };

    fetch('http://localhost:8080/SmartSocial/api/group/createGroup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('dialog').style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
});

function loadGroups() {
    console.log('loadGroups() called');
    fetch('http://localhost:8080/SmartSocial/api/group/getAll')
        .then(response => response.json())
        .then(data => {
            createGroupTable(data);
        })
        .catch(error => {
            console.error('Error fetching quest data:', error);
        });
}

function createGroupTable(data) {
    console.log('createGroupTable() called');
    const tableContainer = document.getElementById('groups-table');
    let tableHTML = '<table class="responsetable"><thead><tr><th>Name</th><th>Description</th><th>A_ID</th><th>A_USER</th><th>Creation</th></tr></thead><tbody>';

    data.forEach(item => {
        tableHTML += `<tr>
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>${item.adminUser.id}</td>
            <td>${item.adminUser.username}</td>
            <td>${item.creationDate}</td>
                      </tr>`;
    });

    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}


window.onload = loadGroups;