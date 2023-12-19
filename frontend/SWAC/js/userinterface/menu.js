const group_page = document.getElementById('group_page');
const quest_page = document.getElementById('quest_page');
const achievement_page = document.getElementById('achievement_page');
const ranking_page = document.getElementById('ranking_page');
const setting_page = document.getElementById('setting_page'); 
const acc_log_page = document.getElementById('acc_log_page');

var logged_in;

function change_link() {
    fetch('http://localhost:8080/SmartUser/smartuser/user', {
        method: 'GET'
    }).then(response => {
        // Is the response not ok is the user not logged in
        if(!response.ok) {
            acc_log_page.href = '/SWAC/sites/userinterface/login.html';
            group_page.href = '/SWAC/sites/userinterface/login.html';
            quest_page.href = '/SWAC/sites/userinterface/login.html';
            achievement_page.href = '/SWAC/sites/userinterface/login.html';
            ranking_page.href = '/SWAC/sites/userinterface/login.html';
            setting_page.href = '/SWAC/sites/userinterface/login.html';
        } else {
            acc_log_page.href = '/SWAC/sites/userinterface/account.html';
            group_page.href = '/SWAC/sites/userinterface/group.html';
            quest_page.href = '/SWAC/sites/quests/quests.html';
            achievement_page.href = '/SWAC/sites/rewards/rewards.html';
            ranking_page.href = '/SWAC/sites/leaderboard/leaderboard.html';
            setting_page.href = '/SWAC/sites/userinterface/settings.html';
        }
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
}

window.onload = change_link();