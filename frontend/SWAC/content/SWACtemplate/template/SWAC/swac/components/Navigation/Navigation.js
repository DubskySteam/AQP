var NavigationFactory = {};
NavigationFactory.create = function (config) {
    return new Navigation(config);
};
// Variable for static access
let navInstance = null;
/* 
 * This component realises an navigation and it's navigation layout elements
 */
class Navigation extends Component {
    /*
     * Constructs a new component object and transfers the config to the
     * object
     */
    constructor(config) {
        super(config);
        navInstance = this;
        this.name = 'Navigation';
        this.desc.text = 'The nav component gives you the possibility to simply create a navigation toolbar from data. But not only a toolbar is provied, it also gives methods for building links and navigation calls that can carry parameters and are only displayed on matching conditions.';

        this.desc.templates[0] = {
            name: 'nav',
            style: 'nav',
            desc: 'Responsive navigation menue for big and small screens. Awaits a logo.png/webp/afiv in ../contents'
        };
        this.desc.templates[1] = {
            name: 'nav_nologo',
            style: 'nav_nologo',
            desc: 'Responsive navigation menue with logo for big and small screens. Without logo.'
        };
        this.desc.templates[2] = {
            name: 'sitemap',
            style: 'sitemap',
            desc: 'Simple sitemap generated from the navigation data.'
        };
        this.desc.styles[0] = {
            selc: ".swac_navigation_head",
            desc: "Makes the navigation a head navigation that stays sticky in its position on scrolling."
        };
        this.desc.styles[1] = {
            selc: ".swac_navigation_foot",
            desc: "Makes the navigation a foot navigation, that is displayed below the pages content, at least at the end of the page."
        };

        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'Id of the navigation dataset used for building hierarchies'
        };
        this.desc.reqPerSet[1] = {
            name: 'rfrom',
            desc: 'Regular expression from which sites this navigation rule shold apply. (* = from all; -m not from menue)'
        };
        this.desc.reqPerSet[2] = {
            name: 'rto',
            desc: 'Path to the target'
        };
        this.desc.reqPerSet[3] = {
            name: 'name',
            desc: 'Name of the navigation entry when shown in menue'
        };

        this.desc.optPerSet[0] = {
            name: 'parent',
            desc: 'Reference path ref:// to the parent navigation entry.'
        };

        this.desc.funcs[0] = {
            name: 'routeTo',
            desc: 'Routes the user to the page with the given name or file',
            params: [
                {
                    name: 'fileOrName',
                    desc: 'File or name of the target'
                },
                {
                    name: 'param_value',
                    desc: 'Value of the parameter to send with the call'
                },
                {
                    name: 'param_name',
                    desc: 'Name of the parameter to send with the call, "id" per default'
                }
            ]
        };

        /**
         * Conditon function for checking if link should be displayed on current site
         * 
         * @param {type} value
         * @returns {Boolean}
         */
        this.conditions['rfrom'] = function (value) {
            // Allowed from all or from all but not menue
            if (value === '*') {
                return true;
            }

            // Calculate absolute url
            var a = document.createElement('a');
            a.href = value;
            var sitepos = a.href.indexOf("/sites/");
            var fromfile = a.href.substring(sitepos + 7, a.href.length);

            // Get own location
            var a = document.createElement('a');
            a.href = document.location;
            var sitepos = a.href.indexOf("/sites/");
            var requestfile = a.href.substring(sitepos + 7, a.href.length);

            if (fromfile === requestfile) {
                return true;
            }

            return false;
        };
        /**
         * Condition function for checking if destination link is reachable
         * 
         * @param {String} value Value to check
         * 
         * @returns {boolean} True if the destination is reachable
         */
        this.conditions['rto'] = function (value) {
            return true;
        };
    }

    /**
     * Creates an new navigation instance
     * 
     */
    init() {
        return new Promise((resolve, reject) => {
            // Create routings for tags
            this.registerRouteToElems();
            // Register sitemap export function
            let exportBtn = this.requestor.querySelector('.swac_navigation_sitemapsave');
            if (exportBtn) {
                exportBtn.addEventListener('click', this.exportSitemapCode.bind(this));
            }
            // Remove empty swac_forChilds
            let forChilds = this.requestor.querySelectorAll('.swac_forChilds');
            for(let curForChilds of forChilds) {
                // Get number of childs
                if(curForChilds.children.length===1) {
                    curForChilds.parentNode.removeChild(curForChilds);
                }
            }
            resolve();
        });
    }

    /**
     * Finds all HTML Elements with routeTo class and activates routing functionallity
     * on them
     * 
     * @returns {undefined}
     */
    registerRouteToElems() {
        let routeElems = document.querySelectorAll('[routeTo]');
        for (let routeElem of routeElems) {
            routeElem.addEventListener("click", this.routeToFromElem);
        }
    }

    /**
     * Function for handling events and transform them into an routing action.
     * 
     * @param {type} evt Event where the action occured
     * @returns {undefined}
     */
    routeToFromElem(evt) {
        let attrStr = evt.target.getAttribute('routeTo');
        if (attrStr !== null) {
            let attrParts = attrStr.split(',');
            console.log(attrParts);
            this.routeTo(attrParts[0], attrParts[1], attrParts[2]);
        }
        console.log(evt.target.getAttribute('routeTo'));
    }

    static routeTo(fileOrName, params = null) {
        let found = false;
        for (let curSource in navInstance.data) {
            for (let curSet of navInstance.data[curSource]) {
                // Check if matching
                if (curSet.rto.indexOf(fileOrName) > -1 || curSet.name.indexOf(fileOrName) > -1) {
                    // Build target url
                    let url = curSet.rto;
                    if (params !== null) {
                        url += '?';
                        let i = 0;
                        for (let curParamName in params) {
                            if (i > 0)
                                url += '&';
                            url += curParamName + '=' + params[curParamName];
                            // save used param as last used param
                            if (typeof (Storage) !== "undefined") {
                                localStorage.setItem(curParamName, params[curParamName]);
                            }
                            i++;
                        }
                    }
                    window.location.href = url;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // If this code is reached, there is no route to the given fileOrName
            // Create notification popup
            UIkit.notification({
                message: SWAC_language.Navigation.noroute,
                status: 'error',
                timeout: SWAC_config.notifyDuration,
                pos: 'top-center'
            });
            Msg.error('nav', 'There was no route to page or file >' + fileOrName + '< found.');
    }
    }

    /**
     * Gets an navigation param that is requested useing an route.
     * If local storage is available uses the last requested param even if there
     * is no param given in the current route call.
     * 
     * @param {String} param_name Name of the id wantet (default is id)
     * 
     * @returns {undefined}
     */
    getRequestedParam(param_name = "id") {
        let id = undefined;
        // Load last used id
        if (typeof (Storage) !== "undefined") {
            id = localStorage.getItem(param_name);
        }
        // Get current requested id
        id = SWAC.getParameterFromURL(param_name, window.location);
        return parseInt(id);
    }

    exportSitemapCode() {
        let sitemapElem = this.requestor.querySelector('.swac_navigation_sitemap');
        let sitemapCode = sitemapElem.outerHTML;
        // Remove not needed code fragments
        sitemapCode = sitemapCode.replace(new RegExp('<swac-bp attrname="name">', 'g'), '');
        sitemapCode = sitemapCode.replace(new RegExp('</swac-bp>', 'g'), '');
        sitemapCode = sitemapCode.replace(new RegExp(' <div class="swac_forChilds"> </div>', 'g'), '');
        // Create display element
        let sitemapCodeElem = document.createElement('div');
        sitemapCodeElem.innerHTML = this.encode(sitemapCode);
        this.requestor.appendChild(sitemapCodeElem);
    }

    /**
     * Converts a string to its html characters completely.
     *
     * @param {String} str String with unescaped HTML characters
     **/
    encode(str) {
        var buf = [];

        for (var i = str.length - 1; i >= 0; i--) {
            buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
        }

        return buf.join('');
    }
    /**
     * Converts an html characterSet into its original character.
     *
     * @param {String} str htmlSet entities
     **/
    decode(str) {
        return str.replace(/&#(\d+);/g, function (match, dec) {
            return String.fromCharCode(dec);
        });
    }
}