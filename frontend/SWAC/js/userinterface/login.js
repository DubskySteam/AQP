/*
 * Script for login page
 */
var swac_login_options = {
    mode: 'form',
    loginURL: 'http://localhost:8080/SmartUser/smartuser/user/performLogin',
    afterLoginLoc: '/SWAC/sites/userinterface/login.html',
    afterLogoutLoc: '/SWAC/sites/userinterface/login.html',
    registrationLink: '/SWAC/sites/register/register.html'
};
swac_login_options.loggedinRedirects = new Map();

var swac_screenboard_options = {};
swac_screenboard_options.for = ["swac_user_username", "swac_user_password"];

document.addEventListener('swac_components_complete', function () {
    let target_url = window.swac.getParameterFromURL('target_url', window.location);
    if (target_url)
        swac_login_options.afterLoginLoc = target_url;
    // Redirect to account page if allready logged in
    swac_login_options.loggedinRedirects.set('login.html', target_url);

    window.swac.reactions.addReaction(function (requestors) {
        alert("This is a reaction: head_navigation is loaded.");
        requestors['swac_screenbaord'].specialKeys[0] = {
            contains: 'icon: sign-in;',
            func: requestors['swac_user'].performLogin
        };
    }, 'swac_user', 'swac_screenboard');
});