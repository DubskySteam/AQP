var UserFactory = {};
UserFactory.create = function (config) {
    return new User(config);
};

/* 
 * This component offers user login and site protection
 */
class User extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'User';
        this.desc.text = 'This component offers user login and site protection';

        this.desc.templates[0] = {
            name: 'user',
            style: 'user',
            desc: 'Shows a user symbol when logged in or a login form with blanked out page.'
        };
        this.desc.reqPerTpl[0] = {
            selc: '.swac_user_loginform',
            desc: 'Form element which contains the login dialog.'
        };
        this.desc.reqPerTpl[1] = {
            selc: '.swac_user_form_username',
            desc: 'Input element which provides the username from the loginform.'
        };
        this.desc.reqPerTpl[2] = {
            selc: '.swac_user_form_password',
            desc: 'Input element which provides the password from the loginform.'
        };
        this.desc.reqPerTpl[3] = {
            selc: '.swac_user_logining',
            desc: 'Area to display, when the login is in progress.'
        };
        this.desc.reqPerTpl[4] = {
            selc: '.swac_user_loginmodal',
            desc: 'Area that should be displayed as dialog in modal login mode.'
        };
        this.desc.reqPerTpl[5] = {
            selc: '.swac_user_modal_username',
            desc: 'Input element which provides the username from the login modal.'
        };
        this.desc.reqPerTpl[6] = {
            selc: '.swac_user_modal_password',
            desc: 'Input element which provides the password from the login modal.'
        };
        this.desc.reqPerTpl[7] = {
            selc: '.swac_user_loginButtons',
            desc: 'Button that starts the login process.'
        };
        this.desc.reqPerTpl[8] = {
            selc: '.swac_user_userarea',
            desc: 'Element that should be displayed for a logged in user.'
        };
        this.desc.reqPerTpl[9] = {
            selc: '.swac_user_logout',
            desc: 'Element that loggs the user out, if clicked on.'
        };


        this.options.showWhenNoData = true;
        this.desc.opts[0] = {
            name: "mode",
            desc: "modal = covers the whole page; form = show login form in requestor"
        };
        if (!options.mode)
            this.options.mode = 'overlay';
        this.desc.opts[1] = {
            name: "allowannonym",
            desc: "allow annonym useage of the page."
        };
        if (!options.allowannonym)
            this.options.allowannonym = false;
        this.desc.opts[2] = {
            name: "loginurl",
            desc: "URL on which the login should be performed."
        };
        if (!options.loginurl)
            this.options.loginurl = null;
        this.desc.opts[3] = {
            name: "loginurlUsernameAttribute",
            desc: "Name of the attribute where the username should be send in."
        };
        if (!options.loginurlUsernameAttribute)
            this.options.loginurlUsernameAttribute = 'username';
        this.desc.opts[4] = {
            name: "loginurlPasswordAttribute",
            desc: "Name of the attribute where the password should be send in."
        };
        if (!options.loginurlPasswordAttribute)
            this.options.loginurlPasswordAttribute = 'password';
        this.desc.opts[5] = {
            name: "afterloginfunc",
            desc: "A function that should be executed after login."
        };
        if (!options.afterloginfunc)
            this.options.afterloginfunc = null;
        this.desc.opts[6] = {
            name: "afterLoginLoc",
            desc: "URL to which the user should be redirected after login."
        };
        if (!options.afterLoginLoc)
            this.options.afterLoginLoc = null;
        this.desc.opts[7] = {
            name: "logouturl",
            desc: "URL on which the logout should be performed. If not given only the local login information will be deleted."
        };
        if (!options.logouturl)
            this.options.logouturl = null;
        this.desc.opts[8] = {
            name: "afterLogoutLoc",
            desc: "URL to which the user should be redirected after logout."
        };
        if (!options.afterLogoutLoc)
            this.options.afterLogoutLoc = null;
        this.desc.opts[9] = {
            name: "loggedinRedirects",
            desc: "Map of sites (key) and urls (value). If a site is called"
                    + " when the user is logged in, he will be redirected to the given url."
        };
        if (!options.loggedinRedirects)
            this.options.loggedinRedirects = new Map();
        this.desc.opts[10] = {
            name: "registrationLink",
            desc: "Link to the page where new users can register."
        };
        if (!options.registrationLink)
            this.options.registrationLink = null;

        // Internal values
        this.userData = {};
    }

    init() {
        return new Promise((resolve, reject) => {
            // Get current user
            let user = this.getCurrentUser();

            if (!user) {
                this.showLogin();
            } else {
                if (this.options.loggedinRedirects
                        && this.options.loggedinRedirects.size > 0) {
                    let urlparts = window.location.pathname.split('/');
                    let filename = urlparts[urlparts.length - 1];
                    let redirectTarget = this.options.loggedinRedirects.get(filename);
                    if (redirectTarget) {
                        window.location = redirectTarget;
                    }
                }
                this.showUser();
            }

            // Check if login is possible
            if (!this.options.loginurl) {
                this.showLoginMessage(SWAC_language.User.nologinpossible);
                Msg.warn('User',
                        'You must set the loginurl option to allow login.',
                        this.requestor);
                resolve();
                return;
            }

            // Add action for login buttons
            let loginButtons = document.querySelectorAll('.swac_user_loginButtons');
            for (let curLoginButton of loginButtons) {
                curLoginButton.addEventListener('click', this.performLogin.bind(this));
            }
            
            let regElem = this.requestor.querySelector('.swac_user_register');
            console.log('reglink: ' + this.options.registrationLink);
            // Check if registration is open
            if(this.options.registrationLink) {
                regElem.setAttribute('href',this.options.registrationLink);
            } else {
                regElem.classList.add('swac_dontdisplay');
            }
            
            resolve();
        });
    }

    /**
     * Gets the current active user. If there is no user it returns null.
     * If annonymus access is allowed and there is no user logged in, it returns
     * the annonymous user.
     * 
     * @returns {Object} Object with userdata or null
     */
    getCurrentUser() {
        // Check if there is no userdata, than create annonymus information
        let userDataStr = localStorage.getItem("swac_currentUser");

        let userData = null;
        if (userDataStr !== null) {
            userData = JSON.parse(userDataStr);
        } else if (this.options.allowannonym) {
            userData = {};
            userData.username = 'annonymus';
            localStorage.setItem("swac_currentUser", JSON.stringify(userData));
        }

        return userData;
    }

    /**
     * Shows up the login form or modal
     * 
     * @returns {undefined}
     */
    showLogin() {
        if (this.options.mode === 'form') {
            document.getElementById('swac_user_loginform').classList.remove('swac_dontdisplay');
        } else {
            // Show login
            let modalElem = document.getElementById('swac_user_loginmodal');
            UIkit.modal(modalElem).show();
        }
    }

    /**
     * Loggt den Benutzer mit den eingegebenen Daten ein.
     * 
     * @param {Event} evt Event that calles the login function
     * @returns {undefined}
     */
    performLogin(evt) {
        // Get applicable form
        let formElem;
        if (this.options.mode === 'form') {
            formElem = document.querySelector('#swac_user_loginform form');
        } else {
            formElem = document.querySelector('#swac_user_loginmodal form');
        }
        // Check if form was filled
        let datathere = formElem.reportValidity();
        if (!datathere) {
            return;
        }

        // Hide login dialog
        this.hideLogin();
        this.showLoginProgress();

        // Get logindata
        let logindata = this.getLogindata();

        // Perform login with post
        let thisRef = this;
        remoteHandler.fetchPost(this.options.loginurl, logindata, true).then(function (userdata) {
            try {
                localStorage.setItem('swac_currentUser', JSON.stringify(userdata));
                // Hide login loading info
                thisRef.hideLoginProgress();
                // Run user defined afterlogin function
                if (thisRef.options.afterloginfunc) {
                    thisRef.options.afterloginfunc(userdata);
                }
                if (thisRef.options.afterLoginLoc) {
                    window.location = thisRef.options.afterLoginLoc;
                } else {
                    thisRef.showUser();
                }
            } catch (error) {
                thisRef.showUser();
                Msg.error('User', 'Error occured after login: ' + error, thisRef.requestor);
            }
        }).catch(function (response) {
            thisRef.hideLoginProgress();
            thisRef.showLogin();
            response.json().then(function (erg) {
                let messageplaceholders = document.querySelectorAll('.message-placeholder');
                for (let placeholder of messageplaceholders) {
                    placeholder.innerHTML = erg.errors[0];
                }
            });
        });
    }

    /**
     * Gets the logindata from the activated form.
     * 
     * @returns {Object} Object with username and password attribute
     */
    getLogindata() {
        let logindata = {};
        if (this.options.mode === 'form') {
            logindata[this.options.loginurlUsernameAttribute] =
                    document.getElementById('swac_user_form_username').value;
            logindata[this.options.loginurlPasswordAttribute] =
                    document.getElementById('swac_user_form_password').value;
        } else {
            logindata[this.options.loginurlUsernameAttribute] =
                    document.getElementById('swac_user_modal_username').value;
            logindata[this.options.loginurlPasswordAttribute] =
                    document.getElementById('swac_user_modal_password').value;
        }
        return logindata;
    }

    /**
     * Hides the login form or modal
     * 
     * @returns {undefined}
     */
    hideLogin() {
        if (this.options.mode === 'form') {
            document.getElementById('swac_user_loginform').classList.add('swac_dontdisplay');
        } else {
            let modalElem = document.getElementById('swac_user_loginmodal');
            console.log(modalElem);
            UIkit.modal(modalElem).hide();
        }
    }

    /**
     * Shows the information about performing login.
     * 
     * @returns {undefined}
     */
    showLoginProgress() {
        let loginElem = document.querySelector('#swac_user_logining');
        loginElem.classList.remove('swac_dontdisplay');
    }

    /**
     * Hides the information about performing login.
     * 
     * @returns {undefined}
     */
    hideLoginProgress() {
        let loginElem = document.querySelector('#swac_user_logining');
        loginElem.classList.add('swac_dontdisplay');
    }

    /**
     * Shows an message on the login place
     * 
     * @param {String} msg message to show
     * @returns {undefined}
     */
    showLoginMessage(msg) {
        let msgElems = document.querySelectorAll('.message-placeholder');
        for (let curMsgElem of msgElems) {
            curMsgElem.innerHTML = msg;
        }
    }

    /**
     * Shows the user area and its menue
     * 
     * @returns {undefined}
     */
    showUser() {
        // Make userarea visible
        let userarea = document.getElementById('swac_user_userarea');
        userarea.classList.remove('swac_dontdisplay');

        let user = this.getCurrentUser();
        // Get users attributes
        for (let curUserAttr in user) {
            let usernameElems = document.querySelectorAll(".user_" + curUserAttr);
            for (let elem of usernameElems) {
                elem.innerHTML = user.username;
            }
        }

        // Register logout function
        let logoutElems = document.querySelectorAll('.swac_user_logout');
        for (let curLogoutElem of logoutElems) {
            curLogoutElem.addEventListener('click', this.performLogout.bind(this));
            // Make logout elements
            let curElem = curLogoutElem;
            while(curElem.parentElement !== null) {
                if(curElem.classList.contains('swac_dontdisplay'))
                    curElem.classList.remove('swac_dontdisplay');
                curElem = curElem.parentElement;
            }
        }
    }

    /**
     * Hides the users menue and informations
     * 
     * @returns {undefined}
     */
    hideUser() {
        // Make userarea visible
        let userarea = document.getElementById('swac_user_userarea');
        userarea.classList.add('swac_dontdisplay');
    }

    /**
     * Checks if someone is logged in
     * 
     * @returns {boolean} true if there is someone logged in
     */
    isLoggedIn() {
        if (this.userData.data.username !== 'annonymus')
            return true;
        return false;
    }

    /**
     * Loggout the currently active user
     * 
     * @param {DOMEvent} evt Event that requests the logout
     * @returns {undefined}
     */
    performLogout(evt) {
        // Get user
        let user = this.getCurrentUser();
        if (user) {
            // Build up logout data
            let logoutdata = {};
            logoutdata.id = user.id;
            logoutdata[this.options.loginurlUsernameAttribute] = user[this.options.loginurlUsernameAttribute];

            if (this.options.logouturl) {
                let thisRef = this;
                remoteHandler.fetchGet(this.options.logouturl, logoutdata).then(function (response) {
                    this.localLogout();
                }).catch(function (error) {
                    Msg.error('User', 'Could not logout user on backend: ' + error, thisRef.requestor);
                    this.localLogout();
                });
            } else {
                this.localLogout();
            }
        }
    }

    /**
     * Removes the local users data
     * 
     * @returns {undefined}
     */
    localLogout() {
        localStorage.removeItem("swac_currentUser");
        if (this.options.afterLogoutLoc)
            window.location.href = this.options.afterLogoutLoc;
        else {
            this.hideUser();
            this.showLogin();
        }
    }
}