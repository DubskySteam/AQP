import SWAC from '../../swac.js';
import View from '../../View.js';
import Msg from '../../Msg.js';

export default class Geolocation extends View {

    constructor(options) {
        super(options);
        this.name = 'Geolocation';
        this.desc.text = 'The geolocation component, allows the user to choose between not showing his location, or do it once or tracking his position. He can decide to remember a decition for following site calls.';
        this.desc.developers = 'Florian Fehring (FH Bielefeld)';
        this.desc.license = 'GNU Lesser General Public License';

        this.desc.templates[0] = {
            name: 'geolocation',
            style: 'geolocation',
            desc: 'Shows dialog for accepting, stopping and restarting geolocation.'
        };

        this.desc.templates[1] = {
            name: 'geolocation_worldmap2d',
            style: 'geolocation_worldmap2d',
            desc: 'Same functionality as default template, modified to be responsive and display nicely on Worldmap2d component.'
        };

        this.desc.reqPerTpl = [];
        this.desc.reqPerTpl[0] = {
            selc: '.swac_geolocation_ask',
            desc: 'Container that holds the user privacy information and the buttons for allow and deny geolocation'
        };
        this.desc.reqPerTpl[1] = {
            selc: '.swac_geolocation_oncelocate',
            desc: 'Button that if clicked executes a one time geolocation'
        };
        this.desc.reqPerTpl[2] = {
            selc: '.swac_geolocation_watchlocate',
            desc: 'Button that if clicked activates the permanent geolocation'
        };
        this.desc.reqPerTpl[3] = {
            selc: '.swac_geolocation_nolocate',
            desc: 'Button that if clicked deactivates geolocation functions on the page'
        };
        this.desc.reqPerTpl[4] = {
            selc: '.swac_geolocation_nav',
            desc: 'Container holding the tools for the geolocation'
        };
        this.desc.reqPerTpl[5] = {
            selc: '.swac_geolocation_icon',
            desc: 'Uikit icon element or svg displaying the status of the geolocation (blue = stopped, yellow = once, red = permanent)'
        };
        this.desc.reqPerTpl[6] = {
            selc: '.swac_geolocation_stop',
            desc: 'With this button the user can stop a permanent geolocation'
        };
        this.desc.reqPerTpl[7] = {
            selc: '.swac_geolocation_start',
            desc: 'With this button the user can start a geolocation (shows up the ask dialog)'
        };
        this.desc.reqPerTpl[8] = {
            selc: '.swac_geolocation_address',
            desc: 'Container which shows the actual adress of the user'
        };
        this.desc.reqPerTpl[9] = {
            selc: '.swac_geolocation_geoprovider',
            desc: 'Container which shows the name of the used geolocation provider (google, bingmaps or openstreetmap)'
        };
        this.desc.reqPerTpl[10] = {
            selc: '.swac_geolocation',
            desc: 'Container contianting ui elements for geolocation.'
        };
        this.desc.reqPerTpl[11] = {
            selc: '.swac_geolocation_remember',
            desc: 'Checkbox to select if the kind of allow should be remembered.'
        };
        this.desc.reqPerTpl[12] = {
            selc: '.swac_geolocation_unavailable',
            desc: 'Element to show when geolocation is unavailable.'
        };
        this.desc.reqPerTpl[13] = {
            selc: '.swac_geolocation_info',
            desc: 'Element containing info text about availability of geolocation.'
        };
        this.desc.reqPerTpl[14] = {
            selc: '.swac_geolocation_close_unavailable',
            desc: 'Button to close unavailable info.'
        };

        this.desc.optPerPage[0] = {
            selc: '.swac_geolocation',
            desc: 'Elements with this class are hidden by the component, if there is no geolocation support or the user disallows all geolocation useage'
        };

        this.options.showWhenNoData = true;
        this.desc.opts[0] = {
            name: 'locateOnStart',
            desc: 'If true the user is located as soon as the component loads'
        };
        this.options.locateOnStart = false;
        this.desc.opts[1] = {
            name: 'watchlocation',
            desc: 'If true the position of the user is watched. Has no effect if locateOnStart is false'
        };
        this.options.watchlocation = true;
        this.desc.opts[2] = {
            name: 'onLocateFunctions',
            desc: 'Array of functions that should be executed on each location event',
            example: [
                function (position) {
                    alert("position recived. See javascript console for more information");
                    console.log(position);
                }
            ]
        };
        // this.options.onLocateFunctions = []; // this would override the options given from the configuration!
        if (!this.options.hasOwnProperty('onLocateFunctions') || !Array.isArray(this.options.onLocateFunctions)) {
            this.options.onLocateFunctions = []; // only add the default option if there isn't one already present
        }

        this.desc.opts[3] = {
            name: 'googleApiKey',
            desc: 'Apikey for geocoding with google service.',
            example: 'exampleGoogleAPIkey'
        };
        this.options.googleApiKey = null;
        this.desc.opts[4] = {
            name: 'bingApiKey',
            desc: 'Apkey for geocoding with bing service',
            example: 'exampleBingAPIkey'
        };
        this.options.bingApiKey = null;

        // Internal values from here
        this.watchid = null;
        this.lastLocation = null;
    }

    init() {

        // If no geolocation is available hide area
        if (!navigator.geolocation) {
            Msg.warn('geolocation', 'The browser does not support geolocation. Hiding all elements with class .swac_geolocation');
            this.nolocate();
        }

        return new Promise((resolve, reject) => {
            // Get memo from cookie
            if (document.cookie === 'swac_geolocation_memo=nolocate') {
                this.nolocate();
                resolve();
                return;
            } else if (document.cookie === 'swac_geolocation_memo=watchlocate') {
                this.watchlocate();
                resolve();
                return;
            } else if (document.cookie === 'swac_geolocation_memo=oncelocate') {
                this.oncelocate();
                resolve();
                return;
            }

            // Bind event handler
            let yesonceElem = this.requestor.querySelector('.swac_geolocation_oncelocate');
            yesonceElem.addEventListener('click', this.oncelocate.bind(this));
            let yeswatchElem = this.requestor.querySelector('.swac_geolocation_watchlocate');
            yeswatchElem.addEventListener('click', this.watchlocate.bind(this));
            let nolocElem = this.requestor.querySelector('.swac_geolocation_nolocate');
            nolocElem.addEventListener('click', this.nolocate.bind(this));
            let closeUnavailableElem = this.requestor.querySelector('.swac_geolocation_close_unavailable');
            closeUnavailableElem.addEventListener('click', this.closeUnavailableModal.bind(this));

            // Hide start element
            let startElem = this.requestor.querySelector('.swac_geolocation_start');
            startElem.addEventListener('click', this.showAsk.bind(this));
            startElem.style.display = 'none';
            let stopElem = this.requestor.querySelector('.swac_geolocation_stop');
            stopElem.addEventListener('click', this.stoplocate.bind(this));

            // Automatic locate on start
            if (this.requestor.swac_comp.options.locateOnStart === true
                    && this.requestor.swac_comp.options.watchlocation === false) {
                // Hide stop element
                let stopElem = requestor.querySelector('.swac_geolocation_stop');
                stopElem.style.display = 'none';
                requestor.swac_comp.oncelocate();
            } else if (this.requestor.swac_comp.options.locateOnStart === true
                    && this.requestor.swac_comp.options.watchlocation === true) {
                this.requestor.swac_comp.watchlocate();
            } else {
                // Show dialog
                this.showAsk();
                // Hide stop button
                stopElem.style.display = 'none';
            }
            resolve();
        });
    }

    /**
     * checks if the browser supports geolocation and if the page is served in a secure context,  
     * secure contexts are https pages or localhost
     * 
     * @returns {Boolean} true if geolocation is supported and the page is served in a secure context
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
     * @see https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
     */
    canUseGeolocation() {
        return navigator.geolocation && (window.isSecureContext === true);
    }

    /**
     * closes the dialog that shows that geolocation is not available
     * 
     * @returns {undefined}
     */
    closeUnavailableModal() {
        let unavailableElem = document.querySelector('.swac_geolocation_unavailable');
        unavailableElem.style.display = 'none';
    }

    /**
     * Shows the dialog for starting or deniing the geolocation
     * 
     * @returns {undefined}
     */
    showAsk() {
        if (!this.canUseGeolocation()) {
            // Hide all elements with class .swac_geolocation
            let geoElems = document.querySelectorAll(".swac_geolocation");
            for (let geoElem of geoElems) {
                geoElem.style.display = "none";
            }
            // Show unavailable message
            let unavailableElem = document.querySelector('.swac_geolocation_unavailable');
            unavailableElem.style.display = 'block';
            return;
        }
        // Get actual geoprovider
        let geoprovider = '';
        if (this.options.googleApiKey) {
            geoprovider = 'Google';
        } else if (this.options.bingApiKey) {
            geoprovider = 'BingMaps';
        } else {
            geoprovider = 'OpenStreetMap';
        }
        let askElem = document.querySelector('.swac_geolocation_ask');
        let descElem = askElem.querySelector('p');
        descElem.innerHTML = descElem.innerHTML.replace('%geoprovider%', geoprovider);
        askElem.style.display = 'block';
    }

    /**
     * Locates the users position once.
     * 
     * @returns {undefined}
     */
    oncelocate() {
        navigator.geolocation.getCurrentPosition(this.located.bind(this), this.onError.bind(this));
        // Hide ask dialog
        let askElem = document.querySelector('.swac_geolocation_ask');
        askElem.style.display = 'none';
        // Set icon color and info text
        let icoElem = document.querySelector('.swac_geolocation_icon');
        icoElem.style.color = 'orange';
        icoElem.setAttribute('uk-tooltip', SWAC.lang.dict.Geolocation.oncelocated);
        // Show the relocate button
        let startElem = document.querySelector('.swac_geolocation_start');
        startElem.style.display = 'inline';
        // Prevent from asking again
        if (document.querySelector('.swac_geolocation_remember').checked) {
            document.cookie = 'swac_geolocation_memo=oncelocate';
        }
    }

    /**
     * Watches the users position.
     * 
     * @returns {undefined}
     */
    watchlocate() {
        this.watchid = navigator.geolocation.watchPosition(this.located.bind(this), this.onError.bind(this));
        // Hide ask dialog
        let askElem = document.querySelector('.swac_geolocation_ask');
        askElem.style.display = 'none';
        // Hide start button
        let startElem = document.querySelector('.swac_geolocation_start');
        startElem.style.display = 'none';
        // Show stop button
        let stopElem = document.querySelector('.swac_geolocation_stop');
        stopElem.style.display = 'inline';
        // Set icon color and info text
        let icoElem = document.querySelector('.swac_geolocation_icon');
        icoElem.style.color = 'red';
        icoElem.setAttribute('uk-tooltip', SWAC.lang.dict.Geolocation.watchlocated);
        // Prevent from asking again
        if (document.querySelector('.swac_geolocation_remember').checked) {
            document.cookie = 'swac_geolocation_memo=watchlocate';
        }
    }

    /**
     * Prevents the geolocation and hides the location areas
     * 
     * @returns {undefined}
     */
    nolocate() {
        // Stop watching
        if (this.watchid !== null) {
            navigator.geolocation.clearWatch(this.watchid);
            this.watchid = null;
        }
        let geoElems = document.querySelectorAll(".swac_geolocation");
        for (let geoElem of geoElems) {
            geoElem.style.display = "none";
        }
        // Prevent from asking again
        if (document.querySelector('.swac_geolocation_remember').checked) {
            document.cookie = 'swac_geolocation_memo=nolocate';
        }
    }

    /**
     * Stops the geolocation
     * 
     * @returns {undefined}
     */
    stoplocate() {
        // Stop watching
        if (this.watchid !== null) {
            navigator.geolocation.clearWatch(this.watchid);
            this.watchid = null;
        }
        // Set icon color and info text
        let icoElem = document.querySelector('.swac_geolocation_icon');
        icoElem.style.color = 'blue';
        icoElem.setAttribute('uk-tooltip', SWAC.lang.dict.Geolocation.notlocated);
        // Hide stop button
        let stopElem = document.querySelector('.swac_geolocation_stop');
        stopElem.style.display = 'none';
        // Show start element
        let startElem = document.querySelector('.swac_geolocation_start');
        startElem.style.display = 'inline';
    }

    /**
     * Function executed when the user is located
     * This executes the registred onLocateFunctions
     * 
     * @param {HTML5geoposition} position
     * @returns {undefined}
     */
    located(position) {
        this.lastLocation = position;
        // Execute registred functions
        for (let func of this.options.onLocateFunctions) {
            func(position);
        }
        // get adress from google if api key exists
        let geoprovider = '';
        let thisRef = this;
        if (this.options.googleApiKey) {
            this.reverseGeocodeGoogle(position.coords.latitude, position.coords.longitude).then(
                    function (address) {
                        thisRef.showAddress(address, thisRef.options.googleApiKey);
                    }
            ).catch(console.error);
            geoprovider = 'Google';
        } else if (this.options.bingApiKey) {
            this.reverseGeocodeBingMaps(position.coords.latitude, position.coords.longitude).then(
                    function (address) {
                        thisRef.showAddress(address, thisRef.options.bingApiKey);
                    }
            ).catch(console.error);
            geoprovider = 'BingMaps';
        } else {
            this.reverseGeocodeNominatim(position.coords.latitude, position.coords.longitude).then(
                    function (address) {
                        thisRef.showAddress(address, position);
                    }
            ).catch(console.error);
            geoprovider = 'OpenStreetMap';
        }

        let serviceElem = document.querySelector('.swac_geolocation_geoprovider');
        serviceElem.innerHTML = geoprovider;
    }

    /**
     * Function executed when a error occures.
     * 
     * @param {HTML5GeolocationError} error
     * @returns {undefined}
     */
    onError(error) {
        let askElem = document.querySelector('.swac_geolocation_nav');
        let infoElem = askElem.querySelector('.swac_geolocation_info');

        switch (error.code) {
            case error.PERMISSION_DENIED:
                Msg.warn('geolocation', 'User denied the request for Geolocation.');
                let geoElems = document.querySelectorAll(".swac_geolocation");
                for (let geoElem of geoElems) {
                    geoElem.style.display = "none";
                }
                break;
            case error.POSITION_UNAVAILABLE:
                Msg.warn('geolocation', "Location information is unavailable.");
                infoElem.innerHTML = SWAC.lang.dict.Geolocation.unavailable;
                console.log(infoElem);
                break;
            case error.TIMEOUT:
                Msg.warn('geolocation', "The request to get user location timed out.");
                infoElem.innerHTML = SWAC.lang.dict.Geolocation.timeout;
                break;
            case error.UNKNOWN_ERROR:
                Msg.warn('geolocation', 'An unknown error occurred.');
                infoElem.innerHTML = SWAC.lang.dict.Geolocation.unkownerror;
                break;
        }
    }

    /**
     * Reverse geocoding useing the google places api.
     * DEV NOTE: untested!
     * 
     * @param {Double} latitude Latitude to geocode
     * @param {Double} longitude Longitude to geocode
     * @param {String} apiKey ApiKey for google
     * @returns {Promise} Promise that resolves with a adress string
     */
    reverseGeocodeGoogle(latitude, longitude, apiKey) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();

            var method = 'GET';
            var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=' + apiKey;
            var async = true;

            request.open(method, url, async);
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        var data = JSON.parse(request.responseText);
                        var address = data.results[0];
                        resolve(address);
                    } else {
                        reject(request.status);
                    }
                }
            };
            request.send();
        });
    }

    /**
     * Reverse geocoding useing the google places api.
     * DEV NOTE: untested!
     * 
     * @param {Double} latitude Latitude to geocode
     * @param {Double} longitude Longitude to geocode
     * @param {String} apiKey apiKey for bingMaps
     * @returns {Promise} Promise that resolves with a adress string
     */
    reverseGeocodeBingMaps(latitude, longitude, apiKey) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();

            var method = 'GET';
            var url = 'http://dev.virtualearth.net/REST/v1/Locations/' + latitude + ',' + longitude + '?o=json&key=' + apiKey;
            var async = true;

            request.open(method, url, async);
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        var data = JSON.parse(request.responseText);
                        var address = data.results[0];
                        resolve(address);
                    } else {
                        reject(request.status);
                    }
                }
            };
            request.send();
        });
    }

    /**
     * Reverse geocoding useing the google places api.
     * 
     * @param {Double} latitude Latitude to geocode
     * @param {Double} longitude Longitude to geocode
     * @returns {Promise} Promise that resolves with a json containing location information
     */
    reverseGeocodeNominatim(latitude, longitude) {
        return new Promise(function (resolve, reject) {
            fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + latitude + '&lon=' + longitude)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (nominatim_json) {
                        let address = {};
                        address.name = nominatim_json.name;
                        address.street = nominatim_json.address.road;
                        address.house_number = nominatim_json.address.house_number;
                        address.postcode = nominatim_json.address.postcode;
                        address.city = nominatim_json.address.city;
                        address.country = nominatim_json.address.country;
                        resolve(address);
                    });
        });
    }

    /**
     * Shows the address on the info bar.
     * 
     * @param {Object} address  Address information
     * @param {Object} position Position (geolocation) information
     * @returns {undefined}
     */
    showAddress(address, position) {
        let addressElem = document.querySelector('.swac_geolocation_address');
        console.log(address);
        let addressline = '';
        if (address.name) {
            addressline = address.name + ' (';
        }
        if (address.street) {
            addressline += address.street + ' ';
        }
        if (address.house_number) {
            addressline += address.house_number + ' ';
        }
        if (address.postcode) {
            addressline += address.postcode + ' ';
        }
        if (address.city) {
            addressline += address.city;
        }
        if (address.name) {
            addressline += ')';
        }
        // Display lat / lon if no address info found
        if (addressline === '') {
            addressline = 'Latitude: ' + position.coords.latitude + ' Longitude: ' + position.coords.longitude;
        }

        addressElem.innerHTML = addressline;
    }
}