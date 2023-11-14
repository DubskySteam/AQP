// all example datas for the cards example

var cards_energyconsumption = [{
        ts: "28.10.2019 7:46:59",
        energyout: 35
    },
    {
        ts: "29.10.2019 7:47:59",
        energyout: 30
    },
    {
        ts: "30.10.2019 7:47:59",
        energyout: 25
    }
];

var cards_temperatur = [{
        temp: 22.3,
        ts: "2020-09-30T00:00:00"
}];

var thermometer_legend_data = {
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

var cards_states = [{
        states: 'on,on,on,off,off,on,off,on,on,on',
        ts: "2020-09-30T00:00:00"
}];

window['states_legend_data'] = {
    states: {
        txt_title: 'States of decive',
        txt_desc: 'Some states',
        txt_uknw: 'Unkown value',
        calcmode: '=',
        values: {
            'on': {
                txt: 'device is on',
                col: 'green'
            },
            'off': {
                txt: 'device is off',
                col: 'red'
            }
        }
    }
};

var cards_progress = [{
        progress: 45.5,
        ts: "2020-09-30T00:00:00"
}];

window['progress_legend_data'] = {
    progress: {
        txt_title: 'States of supply',
        txt_desc: 'Some states',
        txt_uknw: 'Unkown value',
        calcmode: '<',
        values: {
            '50': {
                txt: 'energy running low',
                col: 'red'
            },
            '100': {
                txt: 'enough energy',
                col: 'green'
            }
        }
    }
};