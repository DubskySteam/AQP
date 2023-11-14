var explaincomponent_options = {
    componentName: 'Select'
};

var select_example1_options = {showWhenNoData: true};

// Example 6
let onChangeFunc = function (evt) {
    // You are inside the component here
    let inputs = this.getInputs();
    let msg = 'You selected:';
    for (let curInput of inputs) {
        msg += ' ' + curInput.name + ' = ' + curInput.value;
    }
    alert(msg);
};

var select_example6_select_options = {onChange: onChangeFunc};
var select_example6_multiselect_options = {onChange: onChangeFunc};
var select_example6_checkboxes_options = {onChange: onChangeFunc};
var select_example6_datalist_options = {onChange: onChangeFunc};

// Example 7
let selectedsDataRequestor = {
    fromName: '../../data/input/select/exampleSelecteds.json'
};

var select_example7_select_options = {selectedsSource: selectedsDataRequestor};
var select_example7_multiselect_options = {selectedsSource: selectedsDataRequestor};
var select_example7_checkboxes_options = {selectedsSource: selectedsDataRequestor};
var select_example7_datalist_options = {selectedsSource: selectedsDataRequestor};

// Example 9
let expandSourcesMap = new Map();
expandSourcesMap.set('../../data/input/select/exampleHierarchical.json', {
    sizeRequestor: {
        fromName: '../../data/input/select/exampleExpandsize.json',
        fromWheres: {
            id: '{swac_setid}',
            no: '{swac_setno}'
        }
    },
    dataRequestor: {
        fromName: '../../data/input/select/exampleExpands.json'
    }
});

var select_example9_checkboxes_options = {
    expandSources: expandSourcesMap,
    onChange: onChangeFunc
};

// Example 10
let expandSourcesMap10 = new Map();
expandSourcesMap10.set('../../data/input/select/exampleHierarchical.json', {
    sizeRequestor: {
        fromName: '../../data/input/select/exampleExpandsize.json',
        fromWheres: {
            id: '{swac_setid}',
            no: '{swac_setno}'
        }
    },
    clusterMinimum: 10,
    clusterPercentage: 10,
    dataRequestor: {
        fromName: '../../data/input/select/exampleExpands.json'
    }
});

var select_example10_checkboxes_options = {
    expandSources: expandSourcesMap10,
    onChange: onChangeFunc
};