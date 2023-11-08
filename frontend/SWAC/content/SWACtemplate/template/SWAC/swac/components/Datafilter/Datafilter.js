var DatafilterFactory = {};
DatafilterFactory.create = function (config) {
    return new Datafilter(config);
};

/**
 * Component to make filter settings
 */
class Datafilter extends Component {

    constructor(options) {
        super(options);
        this.name = 'Datafilter';

        this.desc.text = 'Creates a filter configuration to make certain filter settings.';
        this.desc.depends[0] = {
            name: 'Select',
            path: SWAC_config.swac_root + '/swac/components/Select/Select.js',
            desc: 'SWAC Select component'
        };
        this.desc.templates[0] = {
            name: 'datafilter',
            style: false,
            desc: 'Shows input elements for all display configuration options.'
        };
        this.desc.optPerTpl[0] = {
            selc: '.swac_datafilter_apply',
            desc: 'Marks the button to apply the filters'
        };
        this.desc.optPerTpl[1] = {
            selc: '.swac_datafilter_set',
            desc: 'Marks the button to build the set area'
        };
        this.desc.optPerTpl[2] = {
            selc: '.swac_datafilter_filter',
            desc: 'Marks the button to build the filter area'
        };
        this.desc.optPerTpl[3] = {
            selc: '.active_filter_configuration',
            desc: 'Adds an onchange function to the selected selection field.'
        };
        this.desc.optPerTpl[4] = {
            selc: '.swac_datafilter_save',
            desc: 'Marks the button to save the filters'
        };
        this.desc.optPerTpl[5] = {
            selc: '.swac_datafilter_edit',
            desc: 'Marks the button to edit the filters'
        };
        this.options.showWhenNoData = true;
        this.desc.opts[0] = {
            name: 'filterablecomp',
            desc: 'Requestor of the component that can be filtered.'
        };
        this.options.filterablecomp = null;

        // Internal attributes
        this.filters = [];
        this.sets = [];
        this.possibleValue = {};
        this.data = {};
    }

    init() {
        return new Promise((resolve, reject) => {
            let swac_datafilter_applyList = document.querySelectorAll(".swac_datafilter_apply");
            for (let button of swac_datafilter_applyList) {
                button.addEventListener("click", this.applyCurrentSettings.bind(this));
            }

            let setButtonList = document.querySelectorAll(".swac_datafilter_set");
            for (let button of setButtonList) {
                button.addEventListener("click", this.buildSet.bind(this));
            }

            let filterButtonList = document.querySelectorAll(".swac_datafilter_filter");
            for (let button of filterButtonList) {
                button.addEventListener("click", this.buildFilterLine.bind(this));
            }

            let filterSelectList = document.querySelectorAll(".active_filter_configuration");
            for (let button of filterSelectList) {
                button.onchange = this.syncFilterSelection.bind(this);
            }

            let saveButtonList = document.querySelectorAll(".swac_datafilter_save");
            for (let button of saveButtonList) {
                button.addEventListener("click", this.checkFilterName.bind(this));
            }

            let sumCheckbox = document.querySelector(".swac_datafilter_yaxis_sumValue");
            let stateSum = true;
            let requestor = this.requestor;
            sumCheckbox.onchange = function () {
                if (stateSum) {
                    requestor.swac_comp.hideYAxisOptions(this);
                    stateSum = false;
                } else {
                    requestor.swac_comp.showYAxisOptions();
                    stateSum = true;
                }
            };

            let countCheckbox = document.querySelector(".swac_datafilter_yaxis_countValue");
            let stateCount = true;
            countCheckbox.onchange = function () {
                if (stateCount) {
                    requestor.swac_comp.hideYAxisOptions(this);
                    stateCount = false;
                } else {
                    requestor.swac_comp.showYAxisOptions();
                    stateCount = true;
                }
            };

            let x_axis_select = document.getElementById("swac_chart_xaxis");
            x_axis_select.onchange = this.checkXAxis.bind(this);
            resolve();
        });
    }

    /**
     * Adds a newly created filter to the selection.
     * 
     * @param {Number}  id
     * @param {String} filtername
     */
    addNewFilterToSelect(id, filtername) {
        var filterNameList = document.querySelectorAll("select.active_filter_configuration");
        for (let i = 0; i < filterNameList.length; i++) {
            let option = document.createElement("option");
            option.id = "filter_" + id;
            option.innerHTML = filtername;
            filterNameList[i].add(option);
            filterNameList[i].value = filtername;
        }
    }

    /**
     * Checks whether the filter name is already present in the databases and calls Update or Save depending on the type.
     */
    checkFilterName() {
        let req = this;
        var filterNameList = document.querySelectorAll(".active_filter_configuration");
        var name = document.getElementById("filtername").value;
        var counter = 0;
        if (name.length) {
            for (let i = 0; i < filterNameList.length; i++) {
                if (filterNameList[i].value === name) {
                    UIkit.modal.confirm(SWAC_language.datafilter.confirmupdate).then(function () {
                        req.updateFilterConfiguration();
                    }, function () {
                        var modal = document.getElementById("filterconfig");
                        UIkit.modal(modal).show();
                    });
                    counter++;
                }
            }
            if (counter === 0)
                req.saveFilterConfiguration();
        } else {
            alert("Filtername muss angegeben sein!");
        }
    }

    checkXAxis(select) {
        let req = this;
        let sumOption = document.querySelector(".swac_datafilter_yaxis_sumValue");
        let countOption = document.querySelector(".swac_datafilter_yaxis_countValue");
        for (let objects in req.data) {
            if (typeof req.data[objects][0][select.value] === "number") {
                if (!countOption.checked)
                    sumOption.parentNode.hidden = false;

            } else {
                if (sumOption.checked) {
                    sumOption.checked = false;
                    sumOption.onchange();
                }
                sumOption.parentNode.hidden = true;
            }
        }
    }

    /**
     * Retrieves the filter id from the filter selection and passes it to the loadFilter() function.
     */
    loadFilterData() {
        let req = this;
        var selection = document.querySelectorAll("select.active_filter_configuration");
        var idString;
        req.createLoadingScreen(document.getElementById("mainPanel"));
        for (let i = 0; i < selection[0].children.length; i++) {
            if (selection[0].children[i].value === selection[0].value) {
                idString = selection[0].children[i].id;
            }
        }

        var idSplit = idString.split("_");

        req.loadFilter(idSplit[1]);
    }

    /**
     * Synchronizes the two filter selections.
     */
    syncFilterSelection(select) {
        let req = this;
        let selection = document.querySelectorAll("select.active_filter_configuration");
        let tempFilterName;
        let startFilterName;

        for (let i = 0; i < selection.length; i++) {
            if (selection[i].value != select.value) {
                startFilterName = selection[i].value;
            }
        }

        for (let i = 0; i < selection.length; i++) {
            if (selection[i].value != startFilterName) {
                tempFilterName = selection[i].value;
            }
        }

        for (let i = 0; i < selection.length; i++) {
            if (selection[i].value != tempFilterName)
                selection[i].value = tempFilterName;
        }

        startFilterName = tempFilterName;
        req.loadFilterData();
    }

    /**
     * Synchronizes the ObservedObject display with the selection of ObservedObjects.
     * 
     * @param {Number} observedObject_id
     */
    syncObservedObjectSelection(id) {
        let req = this;
        if (id !== undefined) {
            var observedObject_element = document.getElementById("observedobject_list");
            fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'observedobjecttype/get?id=' + id)
                    .then((response) => {
                        return response.json();
                    }).then((observedObject) => {
                observedObject_element.innerHTML = observedObject.name;
                req.fillFilterSelection();
            }).catch((error) => {
                console.log(error);
            });
        }
    }

    /**
     * Creates the set selection elements.
     */
    buildSet() {
        let setrow = document.getElementById("setrow");
        var newSet = document.getElementById("sets_template").cloneNode(true);
        newSet.id = "swac_set_multiselect" + setrow.children.length;
        newSet.className = "uk-width-1-5@m";
        let req = this;
        var splitSelect = document.getElementById("swac_split_select");

        var map = new Map();

        var accordionTitle = newSet.children[1].children[0].children[0];
        accordionTitle.id = "setrowTitle" + setrow.children.length;

        var accordion_content = newSet.children[1].children[0].children[1];
        accordion_content.id = "setrowContent";

        let possibleValues = this.possibleValue;

        let acc_cont;
        if (splitSelect.value !== SWAC_language.datafilter.pleaseChoose) {
            for (let value of possibleValues[splitSelect.value]) {
                let label = document.createElement("label");
                let content = document.createElement("input");
                let container = document.createElement("div");
                content.className = "uk-checkbox";
                content.type = "checkbox";
                content.value = value;
                content.onclick = function () {
                    req.changeTitle(this);
                };
                label.innerHTML = "  " + value;
                container.appendChild(content);
                container.appendChild(label);
                container.appendChild(document.createElement("br"));
                accordion_content.appendChild(container);
            }
            let refSelAll = document.createElement("a");
            refSelAll.innerHTML = SWAC_language.datafilter.selectall;
            refSelAll.addEventListener("click", function () {
                req.accordionSelectAll(this);
            });
            accordion_content.insertBefore(refSelAll, accordion_content.firstChild);
        }

        splitSelect.onchange = function () {
            var temp_content = accordion_content.cloneNode(true);
            $(temp_content).empty();

            if (splitSelect.value !== SWAC_language.datafilter.pleaseChoose) {
                for (let value of possibleValues[splitSelect.value]) {
                    let label = document.createElement("label");
                    let content = document.createElement("input");
                    let container = document.createElement("div");
                    content.className = "uk-checkbox";
                    content.type = "checkbox";
                    content.value = value;
                    label.innerHTML = "  " + value;
                    container.appendChild(content);
                    container.appendChild(label);
                    container.appendChild(document.createElement("br"));
                    temp_content.appendChild(container);
                }
            }
            let accordion_cont = document.querySelectorAll("div#setrowContent");
            for (let i = 0; i < accordion_cont.length; i++) {
                let parent = accordion_cont[i].parentNode;
                parent.children[0].innerHTML = SWAC_language.datafilter.data;
                parent.removeChild(accordion_cont[i]);
                parent.appendChild(temp_content.cloneNode(true));

                let refSelAll = document.createElement("a");
                refSelAll.innerHTML = SWAC_language.datafilter.selectall;
                refSelAll.addEventListener("click", function () {
                    req.accordionSelectAll(this);
                });
                parent.lastChild.insertBefore(refSelAll, parent.lastChild.firstChild);

                for (let i = 1; i < parent.children[1].children.length; i++) {
                    let child = parent.children[1].children[i];
                    child.children[0].onclick = function () {
                        req.changeTitle(this);
                    };
                }
            }

        };

        //add delete button in html
        var btnDeleteSet = newSet.children[2];
        btnDeleteSet.addEventListener("click", function () {
            setrow.removeChild(newSet);
        });

        setrow.appendChild(newSet);

        //adjust height of content drawer
        var content = setrow.parentElement;
        content.style.maxHeight = content.scrollHeight + "px";

        //splitSelect.onchange();
    }

    /**
     * Creates the filter selection elements.
     */
    buildFilterLine() {
        let req = this;
        var filterrows = document.getElementById("filterrows");
        var newFilterDiv = document.getElementById("filter_template").cloneNode(true);

        newFilterDiv.className = "";
        newFilterDiv.id = "";
        //create first select for table attr
        var firstSelect = newFilterDiv.children[1];
        var map = new Map();
        //create second select for relations
        var relationSelect = newFilterDiv.children[4];
        relationSelect.value = "=";
        //create possible relation options

        //create the dynamic select
        var dynamicSelect = newFilterDiv.children[7];
        dynamicSelect.hidden = true;
        var accordion = newFilterDiv.children[8];

        var accordionTitle = accordion.children[0].children[0];
        accordionTitle.id = "filterrowTitle" + filterrows.children.length;


        var accordion_content = accordion.children[0].children[1];
        accordion_content.id = "filterrowContent" + filterrows.children.length;
        var filterId = accordion_content.id;

        relationSelect.onchange = function () {
            //create UI dependant on relation selection
            switch (relationSelect.selectedIndex) {
                //Case < and >
                case 1:
                case 2:
                    //no multiselect needed
                    accordion.hidden = true;
                    dynamicSelect.hidden = false;
                    break;
                case 0:
                    //Case =
                    //show the multiselectline and hide the singleselect
                    accordion.hidden = false;
                    dynamicSelect.hidden = true;
                    break;
            }
            var content = filterrows.parentElement;
            content.style.maxHeight = content.scrollHeight + "px";
        };

        // Creates a template
        let label = document.createElement("label");
        let content = document.createElement("input");
        let template = document.createElement("div");
        content.className = "uk-checkbox";
        content.type = "checkbox";
        template.appendChild(content);
        template.appendChild(label);
        template.appendChild(document.createElement("br"));

        for (let valueName in this.possibleValue) {
            let option = document.createElement("option");
            option.value = valueName;
            option.innerHTML = valueName;
            firstSelect.appendChild(option);
        }

        let possibleValues = this.possibleValue;

        firstSelect.onchange = function () {
            $(accordion_content).empty();
            $(dynamicSelect).empty();

            let temp_accordion_content = accordion_content.cloneNode(true);

            for (let value of possibleValues[firstSelect.value]) {
                let container = template.cloneNode(true);
                container.children[0].value = value;
                container.children[0].onclick = function () {
                    req.changeTitle(this);
                };
                container.children[1].innerHTML = "  " + value;
                temp_accordion_content.appendChild(container);
            }

            for (let value of possibleValues[firstSelect.value]) {
                console.log(value);
                var newOption = document.createElement("option");
                newOption.value = value;
                newOption.innerHTML = value;
                dynamicSelect.appendChild(newOption);
            }

            let acc_cont = document.getElementById(filterId);
            let parent = acc_cont.parentNode;
            parent.removeChild(acc_cont);

            let refSelAll = document.createElement("a");
            refSelAll.innerHTML = SWAC_language.datafilter.selectall;
            refSelAll.addEventListener("click", function () {
                req.accordionSelectAll(this);
            });

            temp_accordion_content.insertBefore(refSelAll, temp_accordion_content.firstChild);
            parent.appendChild(temp_accordion_content);

        };

        // deleteButton added
        var btnDeleteFilter = newFilterDiv.children[9];
        btnDeleteFilter.addEventListener("click", function () {
            filterrows.removeChild(newFilterDiv);
        });


        if (filterrows.hasChildNodes()) {
            //copy attributes
            var firstRowAttrField = filterrows.children[0].children[1];
            for (var i = 0; i < firstRowAttrField.children.length; i++) {
                var copyNode = firstRowAttrField.children.item(i).cloneNode();
                copyNode.appendChild(firstRowAttrField.children.item(i).childNodes[0].cloneNode());
                firstSelect.appendChild(copyNode);
            }

            filterrows.appendChild(newFilterDiv);

            //adjust height of content drawer
            var filterContent = filterrows.parentElement;
            filterContent.style.maxHeight = filterContent.scrollHeight + "px";
        } else {
            //create nodes since nowhere to copy from
            var x_axis_dd = document.querySelector("#swac_chart_xaxis");
            for (var node of x_axis_dd.children) {
                var tempNode = node.cloneNode();
                var tempText = node.childNodes[0].cloneNode();
                tempNode.appendChild(tempText);
                firstSelect.appendChild(tempNode);
            }

            filterrows.appendChild(newFilterDiv);
        }
        firstSelect.onchange();
    }

    /**
     * Loads a filter with an ID and creates the filters and sets for the filter.
     * 
     * @param {Number} filter_id
     */
    loadFilter(filter_id) {
        let req = this;
        if (filter_id === undefined)
            return;
        if (filter_id === "-1") {
            req.clearFilter();
            req.deleteLoadingScreen(document.getElementById("mainPanel"));
            return;
        }
        fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'datavisualisation/get?id=' + filter_id)
                .then((response) => {
                    return response.json();
                }).then((filter) => {
            console.log(filter);
            req.setChartList(filter.filterJSON.diagramTypes);
            var jsonObj = filter.filterJSON;
            req.filters = jsonObj.filters;
            req.sets = jsonObj.sets;

            let chart_list = document.getElementById("chart_list");
            for (let child of chart_list.children) {
                if (child.tagName === "INPUT") {
                    if (jsonObj.diagramTypes.includes(child.value)) {
                        child.checked = true;
                    } else {
                        child.checked = false;
                    }
                }
            }

            var x_axis_dd = document.querySelector('#swac_chart_xaxis');
            var y_axis_dd = document.querySelector('#swac_chart_yaxis');

            $(x_axis_dd).val(jsonObj.axis[0].x_attr).change();
            $(y_axis_dd).val(jsonObj.axis[0].y_attr).change();

            var y_axis_sum = document.querySelector(".swac_datafilter_yaxis_sumValue");
            var y_axis_count = document.querySelector(".swac_datafilter_yaxis_countValue");

            if (jsonObj.axis[0].sum_y_attr) {
                if (!y_axis_sum.checked) {
                    y_axis_sum.checked = true;
                    y_axis_sum.onchange();
                }
            } else {
                if (y_axis_sum.checked) {
                    y_axis_sum.checked = false;
                    y_axis_sum.onchange();
                }
            }
            if (jsonObj.axis[0].count_y_attr) {
                if (!y_axis_count.checked) {
                    y_axis_count.checked = true;
                    y_axis_count.onchange();
                }
            } else {
                if (y_axis_count.checked) {
                    y_axis_count.checked = false;
                    y_axis_count.onchange();
                }
            }

            var filtername = document.getElementById("filtername");
            filtername.value = filter.name;
            var filterrows = document.getElementById("filterrows");
            //Removes all Children
            var filterLength = filterrows.children.length;
            for (let i = 1; i < filterLength; i++) {
                filterrows.removeChild(filterrows.lastChild);
            }
            for (let x = 0; x < jsonObj.filters.length; x++) {
                req.buildFilterLine();
                var filterDiv = filterrows.children[x + 1];
                var firstSelect = filterDiv.children[1];
                if (firstSelect.value !== jsonObj.filters[x].attr)
                    $(firstSelect).val(jsonObj.filters[x].attr).change();
                else
                    $(firstSelect).val(jsonObj.filters[x].attr);
                var relSel = filterDiv.children[4];
                $(relSel).val(jsonObj.filters[x].relation).change();
                var dynSel = filterDiv.children[7];
                $(dynSel).val(jsonObj.filters[x].value).change();
                var accordion = filterDiv.children[8];
                var accordionContent = accordion.children[0].children[1];
                if (jsonObj.filters[x].value.length >= 1) {
                    for (let  z = 1; z < accordionContent.children.length; z++) {
                        for (let y = 0; y < jsonObj.filters[x].value.length; y++) {
                            if (accordionContent.children[z].children[0].value === jsonObj.filters[x].value[y]) {
                                accordionContent.children[z].children[0].checked = true;
                                if (y === 0)
                                    accordion.children[0].children[0].innerHTML = jsonObj.filters[x].value[y];
                                else if (y <= 2)
                                    accordion.children[0].children[0].innerHTML += ", " + jsonObj.filters[x].value[y];
                                else if (y === 3)
                                    accordion.children[0].children[0].innerHTML += ", ...";
                            }
                        }
                    }
                }
            }
            var setrow = document.getElementById("setrow");
            //Removes all Children
            let setlength = setrow.children.length;
            for (let i = 1; i < setlength; i++) {
                setrow.removeChild(setrow.lastChild);
            }
            var splitSelect = document.getElementById("swac_split_select");
            if (jsonObj.sets.length !== 0)
                $(splitSelect).val(jsonObj.sets[0].split).change();
            for (let x = 0; x < jsonObj.sets.length; x++) {
                req.buildSet();
                var nameField = setrow.children[x + 1].children[0];
                $(nameField).val(jsonObj.sets[x].setname).change();
                var setAccordion = setrow.children[x + 1].children[1];
                var setAccordionContent = setAccordion.children[0].children[1];
                for (let  z = 1; z < setAccordionContent.children.length; z++) {
                    for (let y = 0; y < jsonObj.sets[x].values.length; y++) {
                        if (setAccordionContent.children[z].children[0].value === jsonObj.sets[x].values[y]) {
                            setAccordionContent.children[z].children[0].checked = true;
                            if (y === 0)
                                setAccordion.children[0].children[0].innerHTML = jsonObj.sets[x].values[y];
                            else if (y <= 2)
                                setAccordion.children[0].children[0].innerHTML += ", " + jsonObj.sets[x].values[y];
                            else if (y === 3)
                                setAccordion.children[0].children[0].innerHTML += ", ...";

                        }
                    }
                }
            }
        }).then(() => {
            req.deleteLoadingScreen(document.getElementById("mainPanel"));
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
     * Saves the filter configuration
     */
    saveFilterConfiguration() {
        let req = this;
        var filterJson = {};
        filterJson.filters = [];
        filterJson.sets = [];
        filterJson.axis = [];
        filterJson.diagramTypes = [];
        filterJson.diagramTypes = req.getChartList();

        var x_axis = document.querySelector('#swac_chart_xaxis');
        var y_axis = document.querySelector('#swac_chart_yaxis');

        var y_axis_sum = document.querySelector(".swac_datafilter_yaxis_sumValue").checked;
        var y_axis_count = document.querySelector(".swac_datafilter_yaxis_countValue").checked;

        filterJson.axis.push({x_attr: x_axis.options[x_axis.selectedIndex].value, y_attr: y_axis.options[y_axis.selectedIndex].value, sum_y_attr: y_axis_sum, count_y_attr: y_axis_count});

        var filterrows = document.getElementById("filterrows");
        for (var i = 0; i < filterrows.children.length - 1; i++) {
            var filterDiv = filterrows.children[i + 1];
            var firstSelect = filterDiv.children[1];
            var attribute = firstSelect.value;
            var relSel = filterDiv.children[4];
            var rel = relSel.options[relSel.selectedIndex].value;
            var dynSel = filterDiv.children[7];
            var accordion = filterDiv.children[8];
            var accordionContent = accordion.children[0].children[1];

            var values = [];
            if (rel === '=') {
                for (var x = 1; x < accordionContent.children.length; x++) {
                    if (accordionContent.children[x].children[0].checked === true) {
                        values.push(accordionContent.children[x].children[0].value);
                    }
                }
            } else {
                values.push($(dynSel).val());
            }
            filterJson.filters.push({attr: attribute, relation: rel, value: values});
        }

        var setrow = document.getElementById("setrow");

        //get each set and push to array
        for (var i = 0; i < setrow.children.length - 1; i++) {
            var nameField = setrow.children[i + 1].children[0];
            var name = nameField.value;

            var values = [];
            var splitSelect = document.getElementById("swac_split_select");
            var split = $(splitSelect).val();
            var accordionContent = setrow.children[i + 1].children[1].children[0].children[1];
            for (var x = 1; x < accordionContent.children.length; x++) {
                if (accordionContent.children[x].children[0].checked === true) {
                    values.push(accordionContent.children[x].children[0].value);
                }
            }
            filterJson.sets.push({setname: name, values: values, split: split});
        }
        var datavis = {};
        datavis.name = document.getElementById("filtername").value;
        datavis.filterJSON = JSON.stringify(filterJson);

        var observedObject = document.getElementById("observedobject_list").innerHTML;

        fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'observedobjecttype/getByName?name=' + observedObject)
                .then((response) => {
                    return response.json();
                }).then((observedObject) => {
            datavis.observedObjectType = "ref://" + parseInt(observedObject.id);
            fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'datavisualisation/create', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;"
                },
                body: JSON.stringify(datavis)
            }).then((response) => {
                return response.json();
            }).then((answer) => {
                req.addNewFilterToSelect(answer.id, answer.name);
            }).catch((error) => {
                console.log(error);
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
     * Updates the current filter configuration.
     */
    updateFilterConfiguration() {
        let req = this;
        var filterJson = {};
        filterJson.filters = [];
        filterJson.sets = [];
        filterJson.axis = [];

        filterJson.diagramTypes = [];
        filterJson.diagramTypes = req.getChartList();

        var x_axis = document.querySelector('#swac_chart_xaxis');
        var y_axis = document.querySelector('#swac_chart_yaxis');

        var y_axis_sum = document.querySelector(".swac_datafilter_yaxis_sumValue").checked;
        var y_axis_count = document.querySelector(".swac_datafilter_yaxis_countValue").checked;

        filterJson.axis.push({x_attr: x_axis.options[x_axis.selectedIndex].value, y_attr: y_axis.options[y_axis.selectedIndex].value, sum_y_attr: y_axis_sum, count_y_attr: y_axis_count});

        var filterrows = document.getElementById("filterrows");
        for (var i = 0; i < filterrows.children.length - 1; i++) {
            var filterDiv = filterrows.children[i + 1];
            var firstSelect = filterDiv.children[1];
            var attribute = firstSelect.value;
            var relSel = filterDiv.children[4];
            var rel = relSel.options[relSel.selectedIndex].value;
            var dynSel = filterDiv.children[7];
            var accordion = filterDiv.children[8];
            var accordionContent = accordion.children[0].children[1];

            var values = [];
            if (rel === '=') {
                for (var x = 1; x < accordionContent.children.length; x++) {
                    if (accordionContent.children[x].children[0].checked === true) {
                        values.push(accordionContent.children[x].children[0].value);
                    }
                }
            } else {
                values.push($(dynSel).val());
            }
            filterJson.filters.push({attr: attribute, relation: rel, value: values});
        }

        var setrow = document.getElementById("setrow");

        //get each set and push to array
        for (var i = 0; i < setrow.children.length - 1; i++) {
            var nameField = setrow.children[i + 1].children[0];
            var name = nameField.value;

            var values = [];
            var splitSelect = document.getElementById("swac_split_select");
            var split = $(splitSelect).val();
            var accordionContent = setrow.children[i + 1].children[1].children[0].children[1];
            for (var x = 1; x < accordionContent.children.length; x++) {
                if (accordionContent.children[x].children[0].checked === true) {
                    values.push(accordionContent.children[x].children[0].value);
                }
            }
            filterJson.sets.push({setname: name, values: values, split: split});
        }
        var datavis = {};
        datavis.name = document.getElementById("filtername").value;
        datavis.filterJSON = JSON.stringify(filterJson);

        var selection = document.querySelectorAll("select.active_filter_configuration");
        var idString;
        for (let i = 0; i < selection[0].children.length; i++) {
            if (selection[0].children[i].value === selection[0].value) {
                idString = selection[0].children[i].id;
            }
        }

        var idSplit = idString.split("_");
        datavis.id = idSplit[1];
        var observedObject = document.getElementById("observedobject_list").innerHTML;

        fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'observedobjecttype/getByName?name=' + observedObject)
                .then((response) => {
                    return response.json();
                }).then((observedObject) => {
            datavis.observedObjectType = "ref://" + parseInt(observedObject.id);
            fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'datavisualisation/update', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;"
                },
                body: JSON.stringify(datavis)
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
     * Applies the current filter configurations to the charts.
     */
    applyCurrentSettings() {
        //clear currents 
        this.filters = [];
        this.sets = [];
        this.createLoadingScreen(document.getElementById("mainPanel"));

        //find the filterrow html element
        var filterrows = document.getElementById("filterrows");
        //get each filter and push filter to array
        for (var i = 0; i < filterrows.children.length - 1; i++) {
            var filterDiv = filterrows.children[i + 1];
            var firstSelect = filterDiv.children[1];
            var attribute = firstSelect.value;
            var relSel = filterDiv.children[4];
            var rel = relSel.options[relSel.selectedIndex].value;
            var dynSel = filterDiv.children[7];
            var accordion = filterDiv.children[8];
            var accordionContent = accordion.children[0].children[1];

            var values = [];
            if (rel === '=') {
                for (var x = 1; x < accordionContent.children.length; x++) {
                    if (accordionContent.children[x].children[0].checked === true) {
                        values.push(accordionContent.children[x].children[0].value);
                    }
                }
            } else {
                values.push($(dynSel).val());
            }
            this.filters.push({attr: attribute, relation: rel, value: values});
        }

        //find setrow html element
        var setrow = document.getElementById("setrow");

        //get each set and push to array
        for (var i = 0; i < setrow.children.length - 1; i++) {

            var nameField = setrow.children[i + 1].children[0];
            var name = nameField.value;

            var values = [];
            var splitSelect = document.getElementById("swac_split_select");
            var split = $(splitSelect).val();
            var accordionContent = setrow.children[i + 1].children[1].children[0].children[1];
            for (var x = 1; x < accordionContent.children.length; x++) {
                if (accordionContent.children[x].children[0].checked === true) {
                    values.push(accordionContent.children[x].children[0].value);
                }
            }
            this.sets.push({setname: name, values: values, split: split});
        }

        //find axis-filter html element
        var x_axis_dd = document.querySelector('#swac_chart_xaxis');
        var y_axis_dd = document.querySelector('#swac_chart_yaxis');
        var chart = this.options.filterablecomp;

        var timeStampIndex = -1;
        //set axis for each chart type
        if (x_axis_dd.options[x_axis_dd.selectedIndex].value === SWAC_language.datafilter.pleaseChoose) {
            for (let x = 0; x < x_axis_dd.options.length; x++) {
                if (x_axis_dd.options[x].value === "ts")
                    timeStampIndex = x;
            }
            if (timeStampIndex !== -1) {
                chart.swac_comp.options.xAxisAttrName = x_axis_dd.options[timeStampIndex].value;
                x_axis_dd.selectedIndex = timeStampIndex;
            } else {
                if (x_axis_dd.options[1].value !== "id") {
                    chart.swac_comp.options.xAxisAttrName = x_axis_dd.options[1].value;
                    x_axis_dd.selectedIndex = 1;
                } else {
                    chart.swac_comp.options.xAxisAttrName = x_axis_dd.options[2].value;
                    x_axis_dd.selectedIndex = 2;
                }
            }
        } else {
            chart.swac_comp.options.xAxisAttrName = x_axis_dd.options[x_axis_dd.selectedIndex].value;
        }

        let sumCheckbox = document.querySelector(".swac_datafilter_yaxis_sumValue");
        let countCheckbox = document.querySelector(".swac_datafilter_yaxis_countValue");

        if (!y_axis_dd.hidden) {
            if (y_axis_dd.options[y_axis_dd.selectedIndex].value !== SWAC_language.datafilter.pleaseChoose) {
                chart.swac_comp.options.yAxis1AttrName = y_axis_dd.options[y_axis_dd.selectedIndex].value;
            }
        } else {
            if (sumCheckbox.checked)
                chart.swac_comp.options.yAxis1AttrName = "Summe";
            else if (countCheckbox.checked)
                chart.swac_comp.options.yAxis1AttrName = "Anzahl";
        }
        // checks witch diagram is choosen
        let chart_arr = this.getChartList();
        let barchart = document.getElementById("chart_barchart_nav");
        let piechart = document.getElementById("chart_piechart_nav");
        let linechart = document.getElementById("chart_linechart_nav");
        let table = document.getElementById("chart_table_nav");

        if (barchart !== null) {
            if (chart_arr.indexOf("barchart") !== -1) {
                barchart.hidden = false;
            } else {
                barchart.hidden = true;
            }
        }

        if (piechart !== null) {
            if (chart_arr.indexOf("piechart") !== -1) {
                piechart.hidden = false;
            } else {
                piechart.hidden = true;
            }
        }

        if (linechart !== null) {
            if (chart_arr.indexOf("linechart") !== -1) {
                linechart.hidden = false;
            } else {
                linechart.hidden = true;
            }
        }

        if (table !== null) {
            if (chart_arr.indexOf("table") !== -1) {
                table.hidden = false;
            } else {
                table.hidden = true;
            }
        }

        try {
            let curData = this.data;
            if (this.filters.length !== 0 || this.sets.length !== 0) {
                let tempArray = this.filterData(curData);
                if (countCheckbox.checked || sumCheckbox.checked) {
                    tempArray = this.addSumOrCount(tempArray);
                }
                chart.swac_comp.removeAllData();
                for (let name in tempArray) {
                    chart.swac_comp.addData(name, tempArray[name]);
                }
            } else if (countCheckbox.checked || sumCheckbox.checked) {
                let dataArray = this.addSumOrCount(curData);
                chart.swac_comp.removeAllData();
                for (let name in dataArray) {
                    chart.swac_comp.addData(name, dataArray[name]);
                }
            } else {
                let count = 0;
                for (let fromName in SWAC_chart.data) {
                    for (let objectNr in SWAC_chart.data[fromName]) {
                        if (SWAC_chart.data[fromName][objectNr] !== null || SWAC_chart.data[fromName][objectNr] !== undefined)
                            count++;
                    }
                }

                for (let fromName in curData) {
                    if (SWAC_chart.data[fromName] !== undefined) {
                        let rest = curData[fromName].length - count;
                        if (rest !== 0) {
                            chart.swac_comp.addData(fromName, curData[fromName]);
                        }
                    } else {
                        chart.swac_comp.removeAllData();
                        chart.swac_comp.addData(fromName, curData[fromName]);
                    }
                }
            }

            let chart_arr = this.getChartList();
            chart.swac_comp.drawCharts(chart_arr);

            this.deleteLoadingScreen(document.getElementById("mainPanel"));
        } catch (e) {
            this.deleteLoadingScreen(document.getElementById("mainPanel"));
            if (e instanceof TypeError)
                console.log("Kein Eintrag mit dem vorhandenen Filter: " + e);
            else
                console.log(e);
        }
    }

    /**
     * Filters and outputs the data
     * 
     * @param {array} data Data to be filtered
     * @returns {array} newData filtered data 
     */
    filterData(data) {
        let dataArray = {};

        for (let objects in data) {
            let newData = [];
            for (let objectNr in data[objects]) {
                let filterCount = 0;
                let filterMaximum = 0;
                for (let filter of this.filters) {
                    filterMaximum += filter.value.length;
                    for (let value of filter.value) {
                        switch (filter.relation) {
                            case '<':
                                if (data[objects][objectNr][filter.attr] < value) {
                                    filterCount++;
                                }
                                break;
                            case '>':
                                if (data[objects][objectNr][filter.attr] > value) {
                                    filterCount++;
                                }
                                break;
                            case '=':
                                if (data[objects][objectNr][filter.attr] === value) {
                                    filterCount += filter.value.length;
                                }
                                break;
                        }
                    }
                }
                if (filterCount >= filterMaximum) {
                    newData.push(data[objects][objectNr]);
                }
                dataArray[objects] = newData;
            }
        }

        let tempArray = {};
        let tempData = [];
        if (this.sets.length > 0) {
            for (let set of this.sets) {
                tempData = [];
                for (let objects in dataArray) {
                    for (let objectNr in dataArray[objects]) {
                        let setCount = 0;
                        for (let value of set.values) {
                            if (dataArray[objects][objectNr][set.split] === value)
                                setCount++;
                        }
                        if (setCount !== 0)
                            tempData.push(dataArray[objects][objectNr]);
                    }
                }
                tempArray[set.setname] = tempData;
            }
        } else {
            tempArray = dataArray;
        }
        return tempArray;
    }

    addSumOrCount(data) {
        let sumCheckbox = document.querySelector(".swac_datafilter_yaxis_sumValue");
        let countCheckbox = document.querySelector(".swac_datafilter_yaxis_countValue");
        var x_axis_dd = document.querySelector('#swac_chart_xaxis');
        let x_name = x_axis_dd.options[x_axis_dd.selectedIndex].value;
        let newData = [];
        let dataArray = {};
        let req = this;
        if (sumCheckbox.checked) {
            // Summe
            let summe = "Summe";
            for (let objects in data) {
                let sumCounter = 1;
                for (let objectNr in data[objects]) {
                    let unique = true;
                    for (let dataNr in newData) {
                        if (newData[dataNr][x_name] === data[objects][objectNr][x_name]) {
                            newData[dataNr][summe] = parseFloat(newData[dataNr][summe]) + parseFloat(data[objects][objectNr][x_name]);
                            unique = false;
                            break;
                        }
                    }
                    if (unique) {
                        newData.push(JSON.parse('{"' + x_name + '":' + data[objects][objectNr][x_name] +
                                ', "' + summe + '":' + data[objects][objectNr][x_name] + '}'));
                    }
                }
                for (let data of newData) {
                    data["id"] = sumCounter;
                    sumCounter++;
                }
                if (req.sets.length === 0) {
                    dataArray[summe] = newData;
                } else {
                    dataArray[objects] = newData;
                    newData = [];
                }
            }
        } else if (countCheckbox.checked) {
            // Summe
            let count = "Anzahl";
            for (let objects in data) {
                let countCounter = 1;
                for (let objectNr in data[objects]) {
                    let unique = true;
                    for (let dataNr in newData) {
                        if (newData[dataNr][x_name] === data[objects][objectNr][x_name]) {
                            newData[dataNr][count] = parseInt(newData[dataNr][count]) + 1;
                            unique = false;
                            break;
                        }
                    }
                    if (unique) {
                        if (typeof data[objects][objectNr][x_name] === "number")
                            newData.push(JSON.parse('{"' + x_name + '":' + data[objects][objectNr][x_name] +
                                    ', "' + count + '":1}'));
                        else
                            newData.push(JSON.parse('{"' + x_name + '":"' + data[objects][objectNr][x_name] +
                                    '", "' + count + '":1}'));
                    }
                }
                for (let data of newData) {
                    data["id"] = countCounter;
                    countCounter++;
                }
                if (req.sets.length === 0) {
                    dataArray[count] = newData;
                } else {
                    dataArray[objects] = newData;
                    newData = [];
                }
            }
        }
        return dataArray;
    }

    /**
     * Creates the entries in the X-axis, Y-axis and split attribute selection.
     */
    initFilterEntries() {
        //init axis-dropdowns here
        var x_axis_dd = document.querySelector('#swac_chart_xaxis');
        var y_axis_dd = document.querySelector('#swac_chart_yaxis');
        var splitSelect = document.getElementById("swac_split_select");

        // Creates the default option
        var defaultOption = document.createElement("option");
        defaultOption.selected = true;
        defaultOption.hidden = true;
        defaultOption.innerHTML = SWAC_language.datafilter.pleaseChoose;

        // clears the selections
        $(x_axis_dd).empty();
        $(y_axis_dd).empty();
        $(splitSelect).empty();

        // add the default to the selections
        x_axis_dd.appendChild(defaultOption.cloneNode(true));
        y_axis_dd.appendChild(defaultOption.cloneNode(true));
        splitSelect.appendChild(defaultOption.cloneNode(true));

        // add every possible value name to the selection
        for (let valueName in this.possibleValue) {
            let tempNode = document.createElement("option");
            let tempText = document.createTextNode(valueName + "");
            tempNode.appendChild(tempText);
            x_axis_dd.appendChild(tempNode.cloneNode(true));
            y_axis_dd.appendChild(tempNode.cloneNode(true));
            splitSelect.appendChild(tempNode);
        }
        x_axis_dd.onchange();
    }

    /**
     * Creates a LoadingScreen in the filter configuration.
     * 
     * @param {DOM-Element} target
     */
    createLoadingScreen(target) {
        var div = document.createElement("div");
        div.id = "loadingBackground";
        div.style = "height: 150px; width: 250px; background-color: rgb(221,221,221); opacity: 0.8; position:absolute; top: 20%; left: 40%;";
        this.requestor.swac_view.insertLoadingElem(div);
        target.appendChild(div);
    }

    /**
     * Deletes all loadingScreens in the filter configuration.
     * 
     * @param {DOM-Element} target
     */
    deleteLoadingScreen(target) {
        var loadingBackground = document.querySelectorAll("#loadingBackground");
        for (let i = 0; i < loadingBackground.length; i++) {
            target.removeChild(loadingBackground[i]);
        }
        this.requestor_swac_view.removeLoadingElem(target);
    }

    /**
     * Checks whether Select all or Unselect all is selected in the Accordion and calls the appropriate function.
     * 
     * @param {DOM-Element} elem
     */
    accordionSelectAll(elem) {
        let req = this;
        var parent = elem.parentNode;
        if (elem.innerHTML === SWAC_language.dataflter.selectall) {
            req.selectAllElements(parent);
            elem.innerHTML = SWAC_language.datafilter.unselectall;
        } else if (elem.innerHTML === SWAC_language.datafilter.unselectall) {
            req.unselectAllElements(parent);
            elem.innerHTML = SWAC_language.datafilter.selectall;
        }
    }

    /**
     * Selects all options in the accordion.
     * 
     * @param {DOM-Element} elem 
     */
    selectAllElements(elem) {
        var titel = elem.parentNode.children[0];
        titel.innerHTML = "";
        for (let i = 1; i < elem.children.length; i++) {
            elem.children[i].children[0].checked = true;
            if (i === 1)
                titel.innerHTML = elem.children[i].children[0].value;
            else if (i <= 3)
                titel.innerHTML += ", " + elem.children[i].children[0].value;
            else if (i === 4)
                titel.innerHTML += ", ...";
        }
    }

    /**
     * deselects all options in the accordion.
     * 
     * @param {DOM-Element} elem
     */
    unselectAllElements(elem) {
        var titel = elem.parentNode.children[0];
        titel.innerHTML = SWAC_language.datafilter.data;
        for (let i = 1; i < elem.children.length; i++) {
            elem.children[i].children[0].checked = false;
        }
    }

    /**
     * Fills the filter selection fields with the filter names.
     */
    fillFilterSelection() {
        var observedObject = document.getElementById("observedobject_list").innerHTML;
        fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'observedobjecttype/getByName?name=' + observedObject)
                .then((response) => {
                    return response.json();
                }).then((observedObject) => {
            fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'datavisualisation/findByObservedObjectType?oo_type_id=' + observedObject.id)
                    .then((response) => {
                        return response.json();
                    }).then((filterList) => {
                var selectList = document.querySelectorAll("select.active_filter_configuration");
                for (let x = 0; x < selectList.length; x++) {
                    $(selectList[x]).empty();
                    let defaultOption = document.createElement("option");
                    defaultOption.selected = true;
                    defaultOption.innerHTML = SWAC_language.datafilter.filterselect;
                    defaultOption.id = "filter_-1";
                    selectList[x].appendChild(defaultOption);
                    for (let i = 0; i < filterList.list.length; i++) {
                        var option = document.createElement("option");
                        option.id = "filter_" + filterList.list[i].id;
                        option.value = filterList.list[i].name;
                        option.innerHTML = filterList.list[i].name;
                        selectList[x].appendChild(option);
                    }
                }
            }).catch((error) => {
                console.log(error);
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
     * Changes the title of the accordion when a checkbox is selected.
     * 
     * @param {DOM-Element} checkbox
     */
    changeTitle(checkbox) {
        let req = this;
        if (checkbox.checked === true) {
            req.addTitle(checkbox);
        } else {
            req.subTitle(checkbox);
        }
    }

    /**
     * Adds further entries to the accordion title.
     * 
     * @param {DOM-Element} checkbox
     */
    addTitle(checkbox) {
        var title = checkbox.parentNode.parentNode.parentNode.children[0];
        var content = title.innerHTML;
        if (content !== SWAC_language.datafilter.data && !content.includes("...")) {
            var content_len = (content.split(", ").length - 1)
            switch (content_len) {
                case 0:
                case 1:
                    title.innerHTML += ", " + checkbox.value;
                    break;
                case 2:
                    title.innerHTML += ", ...";
                    break;
            }
        } else if (content === SWAC_language.datafilter.data) {
            title.innerHTML = checkbox.value;
        }
    }

    /**
     * Removes entries from the accordion title.
     * 
     * @param {DOM-Element} checkbox
     */
    subTitle(checkbox) {
        var title = checkbox.parentNode.parentNode.parentNode.children[0];
        var content = title.innerHTML;
        var content_split = content.split(", ");
        if (!content.includes("...")) {
            if ((content_split.length - 1) === 0) {
                title.innerHTML = SWAC_language.datafilter.data;
            } else {
                var index = content_split.indexOf(checkbox.value);
                content_split.splice(index, 1);
                for (let x = 0; x < content_split.length; x++) {
                    if (x === 0)
                        title.innerHTML = content_split[x];
                    else
                        title.innerHTML += ", " + content_split[x];
                }
            }
        } else {
            var accordion_content = checkbox.parentNode.parentNode.parentNode.children[1];
            var counter = 0;
            var value_list = [];
            for (let i = 1; i < accordion_content.children.length; i++) {
                if (accordion_content.children[i].children[0].checked === true) {
                    counter++;
                    value_list.push(accordion_content.children[i].children[0].value);
                }
            }
            if (counter <= 3) {
                for (let x = 0; x < value_list.length; x++) {
                    if (x === 0)
                        title.innerHTML = value_list[x];
                    else
                        title.innerHTML += ", " + value_list[x];
                }
            } else {
                for (let x = 0; x < 4; x++) {
                    if (x === 0)
                        title.innerHTML = value_list[x];
                    else if (x === 3)
                        title.innerHTML += ", ...";
                    else
                        title.innerHTML += ", " + value_list[x];
                }
            }
        }
    }

    hideYAxisOptions(hideException) {
        let YaxisOptionArea = document.querySelector(".yAxisOptions");

        for (let i = 0; i < YaxisOptionArea.children.length; i++) {
            YaxisOptionArea.children[i].hidden = true;
        }

        hideException.parentNode.hidden = false;
    }

    showYAxisOptions() {
        let YaxisOptionArea = document.querySelector(".yAxisOptions");

        for (let i = 0; i < YaxisOptionArea.children.length; i++) {
            YaxisOptionArea.children[i].hidden = false;
        }

        // Der folgene Codeabschnitt wird nur gemacht weil sonst die UI rum buggt
        let tempChild = YaxisOptionArea.lastChild.cloneNode(true);
        YaxisOptionArea.removeChild(YaxisOptionArea.lastChild);
        YaxisOptionArea.appendChild(tempChild);
    }

    /**
     * Deletes all entries of a filter.
     */
    clearFilter() {
        let req = this;
        req.clearChartList();
        req.filters = [];
        req.sets = [];

        req.showYAxisOptions();
        let sumCheck = document.querySelector(".swac_datafilter_yaxis_sumValue");
        let countCheck = document.querySelector(".swac_datafilter_yaxis_countValue");
        sumCheck.checked = false;
        countCheck.checked = false;

        var filter_template = document.getElementById("filter_template").cloneNode(true);
        var filterrows = document.getElementById("filterrows");
        $(filterrows).empty();
        filterrows.appendChild(filter_template);

        var set_template = document.getElementById("sets_template").cloneNode(true);
        var setrow = document.getElementById("setrow");
        $(setrow).empty();
        setrow.appendChild(set_template);

        var filter = document.getElementById("filtername");
        filter.value = "";

        var filtername = document.getElementById("swac_split_select");
        filtername.selectedIndex = 0;

        var x_axis_dd = document.querySelector('#swac_chart_xaxis');
        x_axis_dd.selectedIndex = 0;

        var y_axis_dd = document.querySelector('#swac_chart_yaxis');
        y_axis_dd.selectedIndex = 0;
    }

    getChartList() {
        var chart_array = [];
        let chart_elem = document.getElementById("chart_list");
        let chart_input = chart_elem.querySelectorAll("input");
        for (let elem of chart_input) {
            if (elem.checked === true) {
                chart_array.push(elem.value);
            }
        }
        return chart_array;
    }

    setChartList(chart_array) {
        let chart_list_elem = document.getElementById("chart_list");
        for (let chartType of chart_array) {
            let chart_elem = chart_list_elem.querySelector("[value='" + chartType + "']");
            chart_elem.checked = true;
        }
    }

    clearChartList() {
        let chart_list = document.getElementById("chart_list").querySelectorAll("input");
        chart_list[1].checked = true;   // default
        chart_list[2].checked = true;   // default
        for (let i = 2; i < chart_list.length; i++) {
            chart_list[i].checked = false;
        }
    }

    setPossibleValues(oo_id, oo_type_id, limit, startset) {
        let thisComp = this;
        return new Promise((resolve, reject) => {
            fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'measurementtype/listForOoType?ootype_id=' + oo_type_id)
                    .then((response) => {
                        return response.json();
                    }).then((measurementList) => {
                let measurementNames = measurementList.list[0].name;
                for (let i = 1; i < measurementList.list.length; i++) {
                    measurementNames += "," + measurementList.list[i].name;
                }

                let requestor = {};
                requestor.fromName = 'data/getUniqueSets';
                if (startset !== null && limit !== null) {
                    requestor.fromWheres = {
                        ooid: oo_id,
                        measurementnames: measurementNames,
                        startset: startset,
                        limit: limit,
                        distinct: true
                    };
                } else {
                    requestor.fromWheres = {
                        ooid: oo_id,
                        measurementnames: measurementNames,
                        distinct: true
                    };
                }
                // Request data
                SWAC_model.load(requestor).then(function (response) {
                    if (Object.entries(thisComp.possibleValue).length === 0) {
                        thisComp.possibleValue = response.data[0];
                    } else {
                        for (let dataType in response.data[0]) {
                            if (thisComp.possibleValue[dataType] === undefined) {
                                thisComp.possibleValue[dataType] = response.data[0][dataType];
                            } else {
                                for (let data of response.data[0][dataType]) {
                                    if (!thisComp.possibleValue[dataType].includes(data))
                                        thisComp.possibleValue[dataType].push(data);
                                }
                            }
                        }
                    }
                    resolve();
                }).catch(function (error) {
                    console.error('SmartMonitoring (datavisualisation): Daten konnten nicht geladen werden: ' + error);
                    UIkit.modal.alert('Die Daten konnten nicht geladen werden.');
                    reject();
                });
            }).catch((error) => {
                console.log(error);
                reject();
            });
        });
    }
}