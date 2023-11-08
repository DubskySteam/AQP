var DatauploaderFactory = {};
DatauploaderFactory.create = function (config) {
    return new Datauploader(config);
};

/**
 * Sample component for development of own components
 */

class Datauploader extends Component {

    /*
     * Constructs a new component object and transfers the config to the
     * object
     */
    constructor(options = {}) {
        super(options);
        this.name = 'Datauploader';

        this.desc.text = 'Description of this component for documentation.';
        this.desc.depends[0] = {
            name: 'jquery.js',
            path: SWAC_config.swac_root + '/swac/libs/jquery.min.js',
            desc: 'JQuery function library'
        };
         this.desc.depends[1] = {
            name: 'jquery.fancytree-all-deps.js',
            path: SWAC_config.swac_root + '/swac/components/Datauploader/libs/jquery.fancytree-all-deps.js',
            desc: 'Description for what the file is required.'
        };
        this.desc.depends[2] = {
            name: 'ui.fancytree.css',
            path: SWAC_config.swac_root + '/swac/components/Datauploader/libs/skin-win8/ui.fancytree.css',
            desc: 'Description for what the file is required.'
        };
        this.desc.depends[3] = {
            name: 'jquery.contextMenu.min.js',
            path: SWAC_config.swac_root + '/swac/components/Datauploader/libs/jquery.contextMenu.min.js',
            desc: 'Description for what the file is required.'
        };
        this.desc.depends[4] = {
            name: 'jquery.contextMenu.min.css',
            path: SWAC_config.swac_root + '/swac/components/Datauploader/libs/jquery.contextMenu.min.css',
            desc: 'Description for what the file is required.'
        };
        this.desc.templates[0] = {
            name: 'tree',
            style: 'stylefilename',
            desc: 'Description of the template.'
        };
        this.desc.styles[0] = {
            selc: 'cssSelectorForTheStyle',
            desc: 'Description of the provided style.'
        };
        this.desc.reqPerTpl[0] = {
            selc: 'cssSelectorForRequiredElement',
            desc: 'Description why the element is expected in the template'
        };
        this.desc.optPerTpl[0] = {
            selc: 'cssSelectorForOptionalElement',
            desc: 'Description what is the expected effect, when this element is in the template.'
        };
        this.desc.optPerPage[0] = {
            selc: 'cssSelectorForOptionalElement',
            desc: 'Description what the component does with the element if its there.'
        };
        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'The attribute id is required for the component to work properly.'
        };
        this.desc.optPerSet[0] = {
            name: 'nameOfTheAttributeOptionalInEachSet',
            desc: 'Description what is the expected effect, when this attribute is in the set.'
        };
        // opts ids over 1000 are reserved for Component independend options
        this.desc.opts[0] = {
            name: "OptionsName",
            desc: "This is the description of an option"
        };
        // Setting a default value, only applying when the options parameter does not contain this option
        if (!options.OptionsName)
            this.options.OptionsName = 'defaultvalue';
        // Sample for useing the general option showWhenNoData
        if (!options.showWhenNoData)
            this.options.showWhenNoData = true;
        // function ids over 1000 are reserved for Component independend functions
        this.desc.funcs[0] = {
            name: 'name of the function',
            desc: 'Functions description',
            params: [
                {
                    name: 'name of the parameter',
                    desc: 'Description of the parameter'
                }
            ]
        };
    }


    init() {
        return new Promise((resolve, reject) => {

            let tree = new FancyTree();
            tree.init();
          
            document.getElementById('getFile').onchange = function(evt){
                var json_input;
                try {
                    let files = evt.target.files;
                    if (!files.length) {
                        return;
                    }
                    let file = files[0];
                    let reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            json_input = JSON.parse(event.target.result);
                            var json_array = [];
                            tree.traverse(json_input, json_array); 
                            tree.newTreeSource(json_array);
                        }
                        catch (error){
                            UIkit.modal.alert("Die ausgewählte Datei wurde nicht identifiziert. Bitte überprüfen Sie das es sich um eine valide JSON-Datei handelt.");
                        }
                    }
                    reader.readAsText(file);              
                } catch (error) {
                    UIkit.modal.alert("Unerwarteter Fehler beim einlesen der Datei!");
                }    
            }        
            resolve();
        });
    }
    
    beforeAddSet(fromName, set) {
        return set;
    }
    
    afterAddSet(fromName, set) {
        return;
    }
       
}

class FancyTree {
        id = 0;
        leaf_icon = "../swac/components/Datauploader/libs/skin-win8/arrow.png";
        node_icon = "../swac/components/Datauploader/libs/skin-win8/loading.gif";
         
        init (){                
            $(function(){
                $("#tree").fancytree({
                    extensions: ["filter"],
                    quicksearch: true,
                    checkbox: true,
                    selectMode: 3,
                    source: null,
                    icon: true,

                    filter: {
                        autoApply: true, // Re-apply last filter if lazy data is loaded
                        autoExpand: false, // Expand all branches that contain matches while filtered
                        counter: true, // Show a badge with number of matching child nodes near parent icons
                        fuzzy: false, // Match single characters in order, e.g. 'fb' will match 'FooBar'
                        hideExpandedCounter: true, // Hide counter badge if parent is expanded
                        hideExpanders: false, // Hide expanders if all child nodes are hidden by filter
                        highlight: true, // Highlight matches by wrapping inside <mark> tags
                        leavesOnly: false, // Match end nodes only
                        nodata: true, // Display a 'no data' status node if result is empty
                        mode: "dimm"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
                    }
                });
            });                       
        
            $("input[name=search]").on("keyup", function(e){
                var tree = $.ui.fancytree.getTree("#tree");
                var n,
                args = "autoApply autoExpand fuzzy hideExpanders highlight leavesOnly nodata".split(" "),
                opts = {},
                filterFunc = $("#branchMode").is(":checked") ? tree.filterBranches : tree.filterNodes,
                match = $(this).val();
                $.each(args, function(i, o) {
                    opts[o] = $("#" + o).is(":checked");
                });
                opts.mode = $("#hideMode").is(":checked") ? "hide" : "dimm";
                if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === ""){
                    $("button#btnResetSearch").click();
                    return;
                }
                if ($("#regex").is(":checked")) {
                    n = filterFunc.call(tree, function(node) {
                        return new RegExp(match, "i").test(node.title);
                    }, opts);
                } else {
                    n = filterFunc.call(tree, match, opts);
                }
                $("button#btnResetSearch").attr("disabled", false);
                $("span#matches").text("(" + n + " matches)"); 
            }).focus();
            
            $("button#btnResetSearch").click(function(e){  
                var tree = $.ui.fancytree.getTree("#tree");
                $("input[name=search]").val("");
                $("span#matches").text("");
                tree.clearFilter();            
            }).attr("disabled", true);
            
            $("button#btnSelectFiltered").click(function(e){  
                var tree = $.ui.fancytree.getTree("#tree");
                tree.visit(function(node){
                    if(node.isMatched()) {
                        node.setSelected(true);
                    }
                });
            });  
                     
            $("button#btnSaveSelected").click(function(e){
                var tree = $.ui.fancytree.getTree("#tree");
                var bar = document.getElementById('progressbar');
                
                var childs = tree.rootNode.getChildren();
                var child_values = [];
                bar.max = childs.length;

                for (var entry of childs){
                    if (findDatasets(entry) == true){
                        child_values.push(entry.getFirstChild());
                    } 
                    bar.value += 1;
                } 
                if (child_values.length > 0){
                    createDatasetWithArrayOfNodes(child_values);
                }
                
            });
            
            $("button#btnModalClose").click(function(e){
                var modal = UIkit.modal('#progressbar_modal');
                modal.hide();
            });
                      
    }
    
    newTreeSource(src){
        $('#tree').fancytree('option', 'source', src);
    }
    
    traverse(o, array = [], parent_name) {
        if (typeof o == "object") {
            for (var key_json in o) {
                if (o[key_json] != null){
                    var child_array = [];
                    this.traverse(o[key_json], child_array, key_json.toString());
                    this.id += 1;
                    var node_name;
                    var column = "";
                    if (column_names.includes(key_json.toString())){
                        node_name = key_json.toString() + " (DB-Spaltenname)";
                        column = key_json.toString();
                    }
                    else {
                        node_name = key_json.toString();
                    }
                    array.push({title: node_name, key: this.id, folder: true, isColumn: column, children: child_array});
                }
            }
        } 
        else {
            this.id += 1;
            if (parent_name === undefined){
                parent_name = "";
            }
            array.push({title: o.toString(), key: this.id, icon: this.leaf_icon, dbname: parent_name, value: o});
        }
        return array;
    }
    
}

var column_names = [];

function changeNameOfNode(new_name, clicked_node) {
    var tree = $.ui.fancytree.getTree("#tree");
    var title = clicked_node.title;

    if (tree.visit(function(node){
        if (node.title == title && node.getLevel() == clicked_node.getLevel()){         
            if (node.hasChildren() == false){
                UIkit.modal.alert ("Werte dürfen nicht umbennant werden!");
                return false;
            }
            else if (node.getFirstChild().hasChildren()) {
                UIkit.modal.alert ("Dieses Element kann nicht umbennant werden");
                return false;
            } 

            else if (node.visitSiblings(function(e){ if(e.data.isColumn == new_name){return false}}) == false){
                UIkit.modal.alert ("Der ausgewählte Name besteht in dieser Ebene schon!");
                return false;
            }
            else if (node.hasChildren() == true && node.getFirstChild().hasChildren() == false && node.isSelected()) {
                node.setTitle(new_name + " (DB-Spaltenname)");
                node.data.isColumn = new_name;
                node.getFirstChild().data.dbname = new_name;
            }

        }

    }) !== false);
    
}

function create_Menu(column_array){
    var tree = $.ui.fancytree.getTree("#tree");
    $.contextMenu("destroy");
    column_names = [];
    var menu_names = {};
    for (var entry of column_array){
        menu_names[entry.name] = {name: entry.name + " {" +entry.type +"}"};       
        column_names.push(entry.name);
    } 

    $.contextMenu({
        selector: "#tree span.fancytree-title",
        build: function($btnChange, e){
            return {
                callback: function(key, opt) {
                    var node = $.ui.fancytree.getNode(opt.$trigger);
                    switch (key){
                        case "select_all":
                            tree.visit(function(node){
                                node.setSelected(true);
                            });
                            break;
                        case "unselect_all":
                            tree.visit(function(node){
                                node.setSelected(false);
                            });
                            break;
                        case "collapse":
                            node.setExpanded(false);
                            break;                     
                        case "expand":
                            node.setExpanded(true);
                            break;
                        default:
                            changeNameOfNode(key, node);     
                    }       
                },
                items: {
                    select_all: {name: "Alles auswählen"},
                    unselect_all: {name: "Alles abwählen"},
                    collapse: {name: "Element einklappen"},
                    expand: {name: "Element ausklapprn"},
                    sub_menu:{
                        name: "Element umbennenen",
                        items: menu_names  
                    }
                }    
            };
        }
    });

} 

function getLeafDephts(root_node){
    var lowest_level;
    var highest_level = 0;
    
    root_node.visit(function(node){
        if (node.getLevel() > highest_level && node.hasChildren() == false){
            highest_level = node.getLevel();
        }
    });
    
    lowest_level = highest_level;
    
    root_node.visit(function(node){
        if(node.getLevel() < lowest_level && node.hasChildren() == false){
            lowest_level = node.getLevel();
        }    
    });
        return [lowest_level, highest_level];    
}

function findDatasets(root_node){   
    var leaf_dephts = getLeafDephts(root_node);
    var is_direct_Value = false;
    root_node.visit(function(node){
        if(node.isChildOf(root_node) && node.hasChildren() == false && node.partsel == true && column_names.includes(node.data.dbname)){
            is_direct_Value = true;
        }
        else if(node.getLevel() == leaf_dephts[0]-2 && node.partsel == true){
            createDatasetWithNode(node);
        }
    }, includeSelf = true);
    return is_direct_Value; 
}

function createDatasetWithNode(node){
    var modal = UIkit.modal('#progressbar_modal');
    let dataCapsle = { 
    }; 
    
    dataCapsle.metadata = {fromSource: "records/" +selected_Table.name +"?schema=smartmonitoring"};
    dataCapsle.data = [];
    dataCapsle.data[0] = {};
    var empty = true;
    
    for (var entry of column_names){
        node.findAll(function(node){
            if(node.data.dbname == entry && node.isSelected()){
                empty = false;
                dataCapsle.data[0][node.data.dbname] = node.data.value;      
            }
        });
    }
    if (empty == true){
        modal.hide();
        UIkit.modal.alert("Es wurden keine Elemente für den Import gefunden! \n\
                           Stellen Sie sicher das die Elemente den gleichen Namen der gewünschten Datenbankspalte besitzen und selektiert wurden.");
    }
    else {     
        modal.hide();
        let thisRef = [];
        let savePromise = SWAC_model.save(dataCapsle);
        savePromise.then(function (results) {
            for (let curResult of results) {
                thisRef.push(dataCapsle.metadata, curResult)
            }
        }).catch(function (error) {
            console.log(error)
            UIkit.modal.alert("Fehler beim speichern der Daten. Statuscode: " +error.status);
        });
    }   
}

function createDatasetWithArrayOfNodes(node_array){
    var modal = UIkit.modal('#progressbar_modal');
    let dataCapsle = { 
    }; 
    
    dataCapsle.metadata = {fromSource: "records/" +selected_Table.name +"?schema=smartmonitoring"};
    dataCapsle.data = [];
    dataCapsle.data[0] = {};
    var empty = true;
    
    for (var node of node_array){
            if(column_names.includes(node.data.dbname) && node.isSelected()){
                empty = false;
                dataCapsle.data[0][node.data.dbname] = node.data.value;      
            }
    }
    if (empty){    
        
        UIkit.modal.alert("Es wurden keine Elemente für den Import gefunden! \n\
                           Stellen Sie sicher das die Elemente den gleichen Namen der gewünschten Datenbankspalte besitzen und selektiert wurden.");
    }
    else {
        let thisRef = [];
        let savePromise = SWAC_model.save(dataCapsle);
        savePromise.then(function (results) {
            for (let curResult of results) {
                thisRef.push(dataCapsle.metadata, curResult)
            }
        }).catch(function (error) {
            modal.hide();
            UIkit.modal.alert("Fehler beim speichern der Daten. Statuscode: " +error.status);
        });
    }       
}



