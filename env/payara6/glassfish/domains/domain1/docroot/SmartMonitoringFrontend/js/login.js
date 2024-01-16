/*
 * Script for login page
 */
var swac_login_options = {
    mode: 'form',
    loginURL: '/SmartUser/smartuser/user/performLogin',
    afterLoginLoc: '../sites/object/dashboard.html',
    afterLogoutLoc: './login.html',
    loggedinRedirects: new Map(),
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_userlogin&filter=active,eq,true'
        }
    }
};
swac_login_options.loggedinRedirects.set('login.html','object/dashboard.html');

var screenboard_options = {
    for: ['[name="swac_user_username"]', '[name="swac_user_password"]'],
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_userlogin&filter=active,eq,true'
        }
    }
};

// Wait for swac reaction system to be ready
document.addEventListener('swac_ready', function () {
    // Register reaction to the compoenents "selectobject" and "chart"
    window.swac.reactions.addReaction(function (requestors) {
        let user = requestors['loginform'];
        let screenboard = requestors['screenboard'];
        screenboard.swac_comp.options.specialButtons[0] = {
            key: 'icon: sign-in',
            func: user.swac_comp.performLogin
        };
    }, "loginform", "screenboard");
});

document.addEventListener('swac_loginform_inactive', function () {
    // Redirect to dashboard
    window.location.href = '../sites/object/dashboard.html';
})