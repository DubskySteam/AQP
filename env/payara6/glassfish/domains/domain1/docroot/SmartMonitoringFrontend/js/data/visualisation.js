var visualise_temperatur = {
    visus: [
        {
            attr: 'temperature',
            type: 'Thermometer',
            datadescription: '#visualise_legend'
        }
    ]
};

// Options defining WHAT is visualised
visualise_legend_options = {
    visuAttribute: 'temperature'
};
// Data defining HOW is visualised
visualise_legend_data = {
    temperature: {
        txt_title: 'Temperatur',
        txt_desc: 'Some value as double',
        txt_uknw: 'Wert unbekannt',
        minValue: -10,
        maxValue: 40,
        calcmode: '<',
        '10': {
            txt: 'kalt',
            col: 'blue'
        },
        '25': {
            txt: 'warm',
            col: 'green'
        },
        '45': {
            txt: 'heiß',
            col: 'red'
        }
    }
};