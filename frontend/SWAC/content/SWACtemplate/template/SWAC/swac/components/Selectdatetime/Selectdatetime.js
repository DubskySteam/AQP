var SelectdatetimeFactory = {};
SelectdatetimeFactory.create = function (config) {
    return new Selectdatetime(config);
};

/**
 * Component for display an input or date and time
 */
class Selectdatetime extends Component {

    constructor(options) {
        super(options);
        this.name = 'Selectdatetime';

        this.desc.text = 'Creates a selectbox for selection of date and / or time values.';
        this.desc.depends[0] = {
            name: 'DateTimePicker Lib',
            path: SWAC_config.swac_root + '/swac/components/Selectdatetime/libs/datetimepicker/js/datetimepicker.min.js',
            desc: 'Script with the DateTimePicker functionallity'
        };
        this.desc.depends[1] = {
            name: 'DateTimePicker style',
            path: SWAC_config.swac_root + '/swac/components/Selectdatetime/libs/datetimepicker/css/datetimepicker.css',
            desc: 'Style for formatting the DateTimePicker'
        };
        this.desc.templates[0] = {
            name: 'selectdatetime',
            style: false,
            desc: 'Shows a select element for date and time.'
        };
        this.desc.reqPerTpl[0] = {
            selc: '.swac_selectdatetime',
            desc: 'Input element that should be formatted as datetime selector.'
        };
        this.options.showWhenNoData = true;
        this.desc.opts[1] = {
            name: "timepicker",
            desc: "If set to true, time picking is allowed"
        };
        this.options.timepicker = true;
        this.desc.opts[2] = {
            name: "timeformat",
            desc: "Format to use for displaying and input datetime"
        };
        this.options.timeformat = 'd.m.Y H:i';
        this.desc.opts[3] = {
            name: "allowempty",
            desc: "If true also selecting no time is a valid selection"
        };
        this.options.allowempty = true;
    }

    init() {
        return new Promise((resolve, reject) => {
            //TODO implement reciveing of date / time
            var dtp = new DateTimePicker('.swac_selectdatetime', {
                timePicker: this.options.timepicker,
                timePickerFormat: 24,
                format: this.options.timeformat,
                allowEmpty: this.options.allowempty
            });
            resolve();
        });
    }
}