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


window['dashboard_counts'] = {
    id:1,
    modules_count: 76,
    modules_yield: 4589.75
};

window['object_dashboard_count_legend'] = {
    modules_count: {
        txt_title: 'object_dashboard_count',
        txt_desc: 'object_dashboard_count_desc',
        txt_uknw: 'Unkown value',
        minValue: 0,
        maxValue: 132,
        calcmode: '<',
        values: {
            '50': {
                txt: 'ein niedriger Wert',
                col: 'green'
            },
            '75': {
                txt: 'ein mittelniedriger Wert',
                col: 'blue'
            },
            '100': {
                txt: 'ein mittelhoher Wert',
                col: 'yellow'
            },
            '132': {
                txt: 'ein hoher Wert',
                col: 'red'
            }
        }
    },
    modules_yield: {
        txt_title: 'object_dashboard_yield',
        txt_desc: 'object_dashboard_yield_desc',
        txt_uknw: 'Unkown value',
        minValue: 0,
        maxValue: 34170,
        calcmode: '<',
        values: {
            '5000': {
                txt: 'ein niedriger Wert',
                col: 'green'
            },
            '15000': {
                txt: 'ein mittelniedriger Wert',
                col: 'blue'
            },
            '25000': {
                txt: 'ein mittelhoher Wert',
                col: 'yellow'
            },
            '35000': {
                txt: 'ein hoher Wert',
                col: 'red'
            }
        }
    }
};
