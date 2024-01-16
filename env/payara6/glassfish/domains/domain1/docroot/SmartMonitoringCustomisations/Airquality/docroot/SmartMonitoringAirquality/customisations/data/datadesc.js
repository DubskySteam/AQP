var datadesc = {
    pm2_5: {
        txt_title: 'pm2_5',
        txt_desc: 'pm2_5_desc',
        txt_uknw: 'unknown',
        col: '#7B7B7B',
        calcmode: '<',
        values: {
            '5': {
                txt: '< 5 (WHO 2021)',
                col: '#2AAD27'
            },
            '10': {
                txt: '< 10 (WHO 2005)',
                col: '#FFD326'
            },
            '25': {
                txt: '< 25 (EU 2010)',
                col: '#FFA500'
            },
            '100': {
                txt: '< 100',
                col: '#CB2B3E'
            }

        }
    },
    pm10_0: {
        txt_title: 'pm10_0',
        txt_desc: 'pm10_0_desc',
        txt_uknw: 'unknown',
        col: '#7B7B7B',
        calcmode: '<',
        values: {
            '15': {
                txt: '< 15 (WHO 2021)',
                col: '#2AAD27'
            },
            '20': {
                txt: '< 20 (WHO 2005)',
                col: '#FFD326'
            },
            '40': {
                txt: '< 40 (EU 2010)',
                col: '#FFA500'
            },
            '150': {
                txt: '< 150',
                col: '#CB2B3E'
            }

        }
    },
    temp: {
        txt_title: 'temp',
        txt_desc: 'temp_desc',
        txt_uknw: 'unknown',
        col: '#7B7B7B',
        calcmode: '<',
        values: {
            '0': {
                txt: 'kalt',
                col: '#2A81CB'
            },
            '15': {
                txt: 'kühl',
                col: '#2AAD27'
            },
            '28': {
                txt: 'mittel',
                col: '#FFD326'
            },
            '40': {
                txt: 'hoch',
                col: '#CB2B3E'
            },
            '50': {
                txt: 'sehr hoch',
                col: '#B22222'
            }
        }
    }
};
