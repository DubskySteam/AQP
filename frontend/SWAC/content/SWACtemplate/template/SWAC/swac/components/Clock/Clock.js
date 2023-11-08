var ClockFactory = {};
ClockFactory.create = function (config) {
    return new Clock(config);
};

/**
 * Component for display a clock
 */
class Clock extends Component {

    /*
     * Constructs a new component object and transfers the config to the
     * object
     */
    constructor(config) {
        super(config);
        this.name = 'Clock';
        this.desc.text = 'Shows a realtime clock.';

        this.desc.templates[0] = {
            name: 'clock',
            style: false,
            desc: 'Template with area to show the digital clock'
        };

        this.desc.reqPerTpl[0] = {
            selc: '.swac_clock',
            desc: 'Element where to insert the clock information'
        };

        this.options.showWhenNoData = true;

        // Attributes for internal useage
        this.interval = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            // Set clock update interval
            // .bind(this) keeps the context to this object
            this.interval = setInterval(this.updateDisplay.bind(this), 800);
            resolve();
        });
    }

    /**
     * Updates the clock
     * 
     * @returns {undefined}
     */
    updateDisplay() {
        let today = new Date();
        let h = today.getHours();
        let m = today.getMinutes();
        let s = today.getSeconds();
        m = this.addLeadingZero(m);
        s = this.addLeadingZero(s);
        document.querySelector('.swac_clock').innerHTML =
                h + ":" + m + ":" + s;
    }

    /**
     * Adds a leading zero to the given value
     * 
     * @param {Integer} i A integer
     * @returns {String} Integer with leading zero
     */
    addLeadingZero(i) {
        // add zero in front of numbers < 10
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
}