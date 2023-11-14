var explaincomponent_options = {
    componentName: 'Mapselect'
};
// Example 2
var mapselect_example2_options = {
    multiple: true
};

// Example 4
var mapselect_example4_options = {
    dataRequestor: {
        fromName: "../data/mapselect/examplegeodata.json",
        fromWheres: {
            schema: 'smartmonitoring',
            filter: 'column_name,sib,{min_x},{min_y},{max_x},{max_y},3857,3035'
        }
    }
};

// Event handler for showing data from examples
window.onload = function (evt) {
//    let ex1btn = document.querySelector('#mapselect_example1_btn');
//    ex1btn.addEventListener('click', function (evt) {
//        evt.preventDefault();
//        let ex1cmp = document.querySelector('#mapselect_example1');
//        UIkit.modal.dialog('<pre><code class="lang-json">' + JSON.stringify(ex1cmp.swac_comp.getInputs(),  null, 2) + '</code></pre>');
//    });
//    
//    let ex2btn = document.querySelector('#mapselect_example2_btn');
//    ex2btn.addEventListener('click', function (evt) {
//        evt.preventDefault();
//        let ex2cmp = document.querySelector('#mapselect_example2');
//        UIkit.modal.dialog('<pre><code class="lang-json">' + JSON.stringify(ex2cmp.swac_comp.getInputs(),  null, 2) + '</code></pre>');
//    });

//    let ex3btn = document.querySelector('#mapselect_example3_btn');
//    ex3btn.addEventListener('click', function (evt) {
//        evt.preventDefault();
//        let ex3cmp = document.querySelector('#mapselect_example3');
//        UIkit.modal.dialog('<pre><code class="lang-json">' + JSON.stringify(ex3cmp.swac_comp.getInputs(),  null, 2) + '</code></pre>');
//    });
};

// Example 5
var mapselect_example5_options = {
    // Function to use as long the user has no table choosen
    onSelectMethod : function (evt) {
        let tablesel = document.querySelector('#selectTableNames');
        let inputs = tablesel.swac_comp.getInputs();

        if (inputs.length < 1) {
            UIkit.modal.alert("Please select a table.");
            return;
        }
        let table_name = inputs[0].name;
        this.options.dataRequestor = {
            fromName: "/SmartData/smartdata/data/" + table_name + "/",
            fromWheres: {
                schema: 'smartmonitoring',
                filter: 'column_name,sib,{min_x},{min_y},{max_x},{max_y},3857,3035'
            }
        };
        
        this.onSelectFetch(evt);
    }
};
// Options for the table selection Select component
var selectTableNames_options = {};
selectTableNames_options.showWhenNoData = true;