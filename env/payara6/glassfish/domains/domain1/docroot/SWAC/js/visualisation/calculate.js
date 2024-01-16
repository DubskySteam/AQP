window['explaincomponent_options'] = {
    componentName: 'Calculate'
};

window['calculate_example1_options'] = {
    calculations: [
        {
            formular: "u * i",  // Any JS formular
            target: "p"         // Name of the target attribute
        }
    ]
};

window['calculate_example2_options'] = {
    sourceattr: 'source', // Name of the attribute that contains an URL to the datasets
    calculations: [
        {
            formular: "voltage * current",
            target: "yield"
        }
    ]
};
