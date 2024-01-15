/**
 * Options for scheme visualisation
 */
var scheme_options = {
  showMenue: true,
  showScenegraph: false,
  initialZoom: 1.0,
  defaults: new Map(),
  plugins: new Map()
};
//scheme_options.plugins.set('Data', {
//    id: 'Data',
//    active: true
//});
//scheme_options.plugins.set('Visucreator', {
//    id: 'Visucreator',
//    active: true
//});
//scheme_options.plugins.set('Propertieseditor', {
//    id: 'Propertieseditor',
//    active: true
//});
scheme_options.defaults.set('visualmodel', {
  fillColor: '#000',
  borderColor: '#000',
  conColor: '#000'
});

window['Data_scheme_options'] = {
    datasouceattr: 'datasource',
//    attrsShown: ['pm2_5','pm10_0','temp'],
//    datareload: 5, // Time in seconds to auto update data
    datadescription: '#datadesc'
};

/**
 * Options for temperature visualisation
 */
var irradiation_options = {
    visus: [
        {
            attr: 'value',
            type: 'Thermometer',
            datadescription: '#irradiation_legend'
        }
    ]
};

// Options defining WHAT is visualised
var irradiation_legend_options = {
    visuAttribute: 'value',
    showLegend: false
};
// Data defining HOW is visualised
var irradiation_legend_data = {
    temp: {
        txt_title: 'irradiation',
        txt_desc: 'irradiation_desc',
        txt_uknw: 'irradiation_unkwn',
        minValue: 0,
        maxValue: 200,
        calcmode: '<',
        values: {
            '50': {
                txt: 'cold',
                col: 'blue'
            },
            '100': {
                txt: 'coldy',
                col: 'green'
            },
            '150': {
                txt: 'normal',
                col: 'yellow'
            },
            '200': {
                txt: 'warm',
                col: 'red'
            }
        }
    }
};

/**
 * Options for temperature visualisation
 */
var temp_options = {
    visus: [
        {
            attr: 'temp',
            type: 'Thermometer',
            datadescription: '#temp_legend'
        }
    ]
};

// Options defining WHAT is visualised
var temp_legend_options = {
    visuAttribute: 'temp',
    showLegend: false
};
// Data defining HOW is visualised
var temp_legend_data = {
    temp: {
        txt_title: 'Temperatur',
        txt_desc: 'A temperature',
        txt_uknw: 'Unkown value',
        minValue: -10,
        maxValue: 40,
        calcmode: '<',
        values: {
            '5': {
                txt: 'cold',
                col: 'blue'
            },
            '17': {
                txt: 'coldy',
                col: 'green'
            },
            '25': {
                txt: 'normal',
                col: 'yellow'
            },
            '45': {
                txt: 'warm',
                col: 'red'
            }
        }
    }
};




/**
 * Options for current wind visualisation
 */
let wind_visus = [{
  attr: '*',
  type: 'Iconized',
  icons: [
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/sun.png',
      conditions: ['clouds >= 0', 'clouds <= 10', 'rain_1h = 0', 'snow_1h = 0']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/windy-weather.png',
      conditions: ['clouds > 10', 'clouds <= 25', 'rain_1h = 0', 'snow_1h = 0']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/cloudy-light.png',
      conditions: ['clouds > 25', 'clouds <= 50', 'rain_1h = 0', 'snow_1h = 0']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/cloud.png',
      conditions: ['clouds > 50', 'clouds <= 75', 'rain_1h = 0', 'snow_1h = 0']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/cloudy-heavy.png',
      conditions: ['clouds > 75', 'rain_1h = 0', 'snow_1h = 0']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/rain-heavy.png',
      conditions: ['clouds >= 0', 'rain_1h > 0', 'snow_1h = 0']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/snow-light.png',
      conditions: [
        'clouds >= 0',
        'rain_1h >= 0',
        'snow_1h > 0',
        'snow_1h <= 5'
      ]
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/snow.png',
      conditions: ['clouds >= 0', 'rain_1h >= 0', 'snow_1h > 5']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/sun.png',
      conditions: ['clouds >= 0', 'clouds <= 10']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/windy-weather.png',
      conditions: ['clouds > 10', 'clouds <= 25']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/cloudy-light.png',
      conditions: ['clouds > 25', 'clouds <= 50']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/cloud.png',
      conditions: ['clouds > 50', 'clouds <= 75']
    },
    {
      path: '/SWAC/swac/components/Icon/imgs/weather/cloudy-heavy.png',
      conditions: ['clouds > 75', 'clouds <= 100']
    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/weather/windsock-light.png',
//      conditions: ['wind_speed <= 2']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/weather/windsock-moderate.png',
//      conditions: ['wind_speed > 2', 'wind_speed <= 3.60']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/weather/windsock-heavy.png',
//      conditions: ['wind_speed > 3.60', 'wind_speed <= 11.3']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/weather/windsock-strong.png',
//      conditions: ['wind_speed > 11.3', 'wind_speed <= 17.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/weather/tornado.png',
//      conditions: ['wind_speed > 17.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/north.png',
//      conditions: ['wind_dir > 337.5', 'wind_dir <= 360']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/north.png',
//      conditions: ['wind_dir >= 0', 'wind_dir <= 22.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/north-east.png',
//      conditions: ['wind_dir > 22.5', 'wind_dir <= 67.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/east.png',
//      conditions: ['wind_dir > 67.5', 'wind_dir <= 112.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/south-east.png',
//      conditions: ['wind_dir > 112.5', 'wind_dir <= 157.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/south.png',
//      conditions: ['wind_dir > 157.5', 'wind_dir <= 202.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/south-west.png',
//      conditions: ['wind_dir > 202.5', 'wind_dir <= 247.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/west.png',
//      conditions: ['wind_dir > 247.5', 'wind_dir <= 292.5']
//    },
//    {
//      path: '/SWAC/swac/components/Icon/imgs/directions/north-west.png',
//      conditions: ['wind_dir > 292.5', 'wind_dir <= 337.5']
//    },
    {
      path: '/SWAC/swac/components/Icon/imgs/data/database_warning.svg'
    }
  ]
}];

var weather_cur_options = {
    visus: wind_visus,
    showAttributions: false
};

var weather_past_options = {
    visus: wind_visus
};
