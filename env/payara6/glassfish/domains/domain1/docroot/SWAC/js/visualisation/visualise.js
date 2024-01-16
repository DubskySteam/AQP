window['explaincomponent_options'] = {
    componentName: 'Visualise'
};

window['example_thermometer_options'] = {
    visus: [
        {
            attr: 'temp',
            type: 'Thermometer',
            datadescription: '#visualise_legend'
        }
    ]
};

// Data defining HOW is visualised
window['weatherdata_legend'] = {
    temp: {
        txt_title: 'Temperature',
        txt_desc: 'The air temperature',
        txt_uknw: 'Unkown value',
        minValue: -10,
        maxValue: 40,
        calcmode: '<',
        values: {
            '0': {
                txt: 'ice cold',
                col: 'blue'
            },
            '10': {
                txt: 'cold',
                col: 'green'
            },
            '20': {
                txt: 'middle',
                col: 'yellow'
            },
            '30': {
                txt: 'hot',
                col: 'orange'
            },
            '40': {
                txt: 'extreme hot',
                col: 'red'
            }
        }
    },
    wind: {
        txt_title: 'Windspeed',
        txt_desc: 'The wind speed',
        txt_uknw: 'Unkown value',
        minValue: -10,
        maxValue: 40,
        calcmode: '<',
        values: {
            '1': {
                txt: 'Windstille',
                col: '#F0F8FF'
            },
            '9': {
                txt: 'leiser Zug',
                col: '#F0FFFF'
            },
            '19': {
                txt: 'leichte Brise',
                col: '#F0FFFF'
            },
            '28': {
                txt: 'schwache Brise',
                col: '#0000FF'
            },
            '37': {
                txt: 'Mäßige Brise',
                col: '#00008B'
            },
            '46': {
                txt: 'Frische Brise',
                col: '#8A2BE2'
            },
            '56': {
                txt: 'Starker Wind',
                col: '#FAFAD2'
            },
            '65': {
                txt: 'Starker bis stürmischer Wind',
                col: '#FFFF00'
            },
            '74': {
                txt: 'Stürmischer Wind',
                col: '#FFA500'
            },
            '83': {
                txt: 'Sturm',
                col: '#FF8C00'
            },
            '93': {
                txt: 'Sturm bis schwerer Sturm',
                col: '#CD5C5C'
            },
            '102': {
                txt: 'Schwerer Sturm',
                col: '#B22222'
            },
            '111': {
                txt: 'Orkanartiger Sturm',
                col: '#FF4500'
            },
            '200': {
                txt: 'Orkan',
                col: '#8B0000'
            }
        }
    }
};

// Exampel 2: Hygrometer
window['example_hygrometer_options'] = {
    visus: [{
            attr: 'doubleval',
            type: 'Hygrometer',
            datadescription: '#example_hygrometer_legend'
        }]
};

window['hygrometer_legend'] = {
    doubleval: {
        txt_title: 'A double value',
        txt_desc: 'Some value as double',
        txt_uknw: 'Unkown value',
        minValue: -10,
        maxValue: 40,
        calcmode: '<',
        values: {
            '15': {
                txt: 'ein niedriger Wert',
                col: 'green'
            },
            '25': {
                txt: 'ein mittelniedriger Wert',
                col: 'blue'
            },
            '35': {
                txt: 'ein mittelhoher Wert',
                col: 'yellow'
            },
            '45': {
                txt: 'ein hoher Wert',
                col: 'red'
            }
        }
    }
};


window['example_weathermeter_options'] = {
    visus: [{
            attr: '*',
            type: 'Iconized',
            icons: [
                {
                    path: '/SWAC/swac/components/Icon/imgs/weather/cloudy-light.png',
                    conditions: [
                        'clouds > 50'
                    ]
                },
                {
                    path: '/SWAC/swac/components/Icon/imgs/weather/rain-heavy.png',
                    conditions: [
                        'clouds > 50',
                        'rain > 50'
                    ]
                },
                {
                    path: '/SWAC/swac/components/Icon/imgs/weather/snow-storm.png',
                    conditions: [
                        'wind > 75',
                        'wind < 125',
                        'snow >= 50'
                    ]
                },
                {
                    path: '/SWAC/swac/components/Icon/imgs/weather/sun.png'
                }
            ]
        }]
};

window.onload = function () {
    let clrBtn = document.querySelector('.example_weathermeter_clear');
    // Avoid error on outcomented example
    if (clrBtn) {
        clrBtn.addEventListener('click', function (evt) {
            evt.preventDefault();
            let req = document.querySelector('#example_weathermeter');
            req.swac_comp.removeData('weatherdata');
        });
    }

    let addBtn = document.querySelector('.example_weathermeter_add');
    if (addBtn) {
        addBtn.addEventListener('click', function (evt) {
            evt.preventDefault();
            let req = document.querySelector('#example_weathermeter');
            req.swac_comp.addSet('weatherdata', {
                id: 1,
                clouds: 0,
                wind: 0,
                rain: 0,
                ts: '29.10.2019T7:46:59'
            });
        });
    }

    let addSetBtn = document.querySelector('.example4_addset');
    if (addSetBtn) {
        addSetBtn.addEventListener('click', function (evt) {
            evt.preventDefault();
            let req = document.querySelector('#example4_repeatvisualise');
            req.swac_comp.addSet('../../data/visualise/visualsets.json', {
                id: 9
            });
        });
    }
};

// Example 5: CircleProgress
window['visualise_example5_options'] = {
    visus: [{
            attr: 'wind',
            type: 'CircleProgress',
            datadescription: '#visualise_legend'
        }]
};

// Example 6: StatusDisplay
window['visualise_example6_options'] = {
    visus: [{
            attr: 'states',
            type: 'StatusDisplay',
            datadescription: '#visualise_example6_legend'
        }]
};

window['statusdata_legend'] = {
    states: {
        txt_title: 'A double value',
        txt_desc: 'Some value as double',
        txt_uknw: 'Unkown value',
        minValue: -10,
        maxValue: 40,
        calcmode: '<',
        values: {
            '10': {
                txt: 'ein niedriger Wert',
                col: 'green'
            },
            '20': {
                txt: 'ein mittelniedriger Wert',
                col: 'blue'
            },
            '30': {
                txt: 'ein mittelhoher Wert',
                col: 'yellow'
            },
            '50': {
                txt: 'ein hoher Wert',
                col: 'red'
            }
        }
    }
};