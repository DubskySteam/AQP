/* 
 * Datasource for the datadescription component example
 */

var datadescription_data = {
    sourcename: "Name der Quelle",
    sourcelink: "http://www.beispiel.de",
    doubleval: {
        txt_title: 'DoubleWert',
        txt_desc: 'Ein Wert mit double Genauigkeit',
        txt_uknw: 'Es wurde kein Wert angegeben',
        col: 'blue',
        values: {
            '12.0123': {
                txt: 'ein niedriger Wert',
                col: 'green'
            },
            '19.0234': {
                txt: 'ein mittlerer Wert',
                col: 'yellow'
            },
            '42.0345': {
                txt: 'ein hoher Wert',
                col: 'red'
            }
        }
    },
    stringval: {
        txt_title: 'Strings',
        txt_desc: 'Ein Wert mit einem String.',
        col: 'red',
        values: {
            'string': {
                txt: 'erster string',
                col: 'green'
            },
            'string2': {
                txt: 'zweiter string',
                col: 'yellow'
            }
        }
    }
};
