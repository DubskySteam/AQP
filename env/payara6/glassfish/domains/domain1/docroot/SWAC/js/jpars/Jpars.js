
var jsontopars = [];
var uniqueKeys = [];
var collections = [];
var mappingdatakeys = [];
var jsonkeys = [];
var selectedkeys = [];
var jsite = false;
//var host = "http://localhost:8080/";
var host = "http://epigraf01.ad.fh-bielefeld.de:8080/";
var configurations = [];

/**
 * Puts the name of all the saved configurations in the selectbox
 */
async function selectbox() {
    var stringselect = " <option value=" + 0 + ">Bitte wählen</option>";
    fetch('../../../SmartDataGewaesser/smartdata/records/configfiles?storage=smartmonitoring&includes=file_name')
        .then((response) => response.json())
        .then((data) => {
            for (let j = 0; j < data["records"].length; j++) {
                stringselect = stringselect + "<option  value='" + data["records"][j]["id"] + "'>" + data["records"][j]["file_name"] + "</option>";
            }
            document.getElementById("datenbankc").innerHTML = stringselect;
        });

}

/**
 * loads the configuartion file from the database
 * 
 */
async function loadconfig() {
    id = document.getElementById("datenbankc").value
    if (id != 0) {
        fetch('../../../SmartDataGewaesser/smartdata/records/configfiles/' + id + '?storage=smartmonitoring')
            .then((response) => response.json())
            .then((data) => {
                document.getElementById("Configtext").value = data["records"][0]["content"];
            });
    }

}



/**
 * checks wiche page is active and activate the next page 
 * @example page0 is active and the button next is clicked 
 * then page1 is set to active and will be shown
 * @param {*} evt 
 * @param {*} TabsName 
 * @param {*} tj 
 * @param {*} page 
 * @param {*} forward 
 */
function pageselector(evt, TabsName, tj, page, forward, skip) {
    var checkstringcollection = document.getElementById("collection").value;
    var jsonstring = document.getElementById("Jsontext").value;
    var checkstringconfig = document.getElementById("Configname").value;
    if (page == 0) {
        if (jsonstring != "") {
            openTabs(evt, TabsName, tj);
        } else { alert("Please select a json file"); }
    }
    else if (page == 2 && forward == true && skip == true) {
        document.getElementById("Jsontextausgabe").value = document.getElementById("Jsontext").value;
        openTabs(evt, TabsName, tj);
    } else if (page == 1 && forward == true) {
        if (checkstringcollection != "") {
            if (checkstringconfig != "") {
                Keyoutput();
                openTabs(evt, TabsName, tj);
            }
            else {
                alert("Please select a  configname");
            }
        }
        else {
            alert("Please select a collection");
        }
    }
    else if (page == 2 && forward == true) {

        checkboxenchecken();
        if (mappingdatakeys.length > 0) {
            document.getElementById("Jsontextausgabe").value = document.getElementById("Jsontext").value;
            openTabs(evt, TabsName, tj);
        } else { alert("Please select at least one key"); }
    } else if (forward == false) {
        openTabs(evt, TabsName, tj);
    }
}


/**
 * checks wiche tab is active and activate the next tab 
 * @example no tab is active and the button uplaod is clicked 
 * then the tab upload is set to active and will be shown
 * @param evt = event
 * @param TabsName = name of the tab to open
 * @param tj = wiche tab should be worked on 
 * @param tj = 0; settings tab
 * @param tj = 1; json tab
 * @param tj = anithing else; Tabelle tab
 * 
 */
function openTabs(evt, TabsName, tj) {
    if (tj == 0) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontentc");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinksc");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(TabsName).style.display = "block";
        evt.currentTarget.className += " active";

    } else if (tj == 1) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(TabsName).style.display = "block";
        evt.currentTarget.className += " active";
        if (TabsName == "ADDJ") {
            jsite = false;

        } else {
            jsite = true;

        }
    } else if (tj == 2) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontentt");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinkst");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(TabsName).style.display = "block";
        evt.currentTarget.className += " active";
        if (TabsName == "ADDJ") {
            jsite = false;

        } else {
            jsite = true;

        }
    } else {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontentzero");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinkszero");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(TabsName).style.display = "block";
        evt.currentTarget.className += " active";
    }
}


/**
 * Saves config into database.
 * 
 * Builds a request for saving the config into the database. It is required to write the file name and content of the config file
 * into the request body as json. The content inside the json body must be encrypted via Base64.
 */
async function configspeicher() {

    // Setting up the json body
    var settings = {};
    settings.server = host;
    settings.smartdata = "SmartDataGewaesser";
    settings.storage = "smartmonitoring";
    settings.collection = "configfiles";
    settings.importer = "RequestImporter";
    settings.parser = "ConfigSaver";
    settings.file_name = document.getElementById("Configname").value;

    var configToSave = document.getElementById("Configtext").value;

    // Encrypting content to Base64
    settings.content = btoa(configToSave);
    settings = JSON.stringify(settings);
    try {
        const response = await fetch("../../../SmartDataPorter/smartdataporter/import", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: settings
        })
            .then(response => {
                if (response.ok) {
                    alert("Config saved");
                } else {
                    throw new Error('Something went wrong')
                }
            });

    }
    catch (error) {
        alert("Error while saving config");
    }

}



/**
 * shows the json wiche is loaded in via the input in the json textbox
 */
function change() {
    let input = document.getElementById("Jsontextinput");
    let files = input.files;
    var textarea = document.getElementById('Jsontext');

    if (files.length == 0) return;
    const file = files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target.result;
        const lines = file.split(/\r\n|\n/);
        textarea.value = lines.join('\n');
        output(textarea.value);
    };
    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(file);
};

/**
 * shows the config wiche is loaded in via the input in the config textbox
 */
function changec() {
    let input = document.getElementById("Configtextinput");
    let files = input.files;
    var textarea = document.getElementById('Configtext');

    if (files.length == 0) return;
    const file = files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target.result;
        const lines = file.split(/\r\n|\n/);
        textarea.value = lines.join('\n');
        output(textarea.value);
    };

    reader.onerror = (e) => alert(e.target.error.name);

    reader.readAsText(file);
};



/**
 * sends Json-Data using sendData() after calling createTable() function to creat the table required 
 */
async function senddata() {
    var datenbankname = document.getElementById("collection").value;
    datenbankname = datenbankname.split(",");
    for (let index = 0; index < datenbankname.length; index++) {
        const element = datenbankname[index];
        await createTable(element);
    }
   
        await sendData();
   
}

/**
 * sends JSON-Data to backend with POST
 */
async function sendData() {
    var configsend = document.getElementById("Configtext").value;
    try {
        const response = await fetch(host + "SmartDataPorter/smartdataporter/import", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: configsend
        }).then(response => {
            if (response.ok) {
                alert("Data saved");
            } else {
                throw new Error('Something went wrong')
            }
        });

    } catch (error) {
        alert("Data could not be saved")
    }

}

/**
 * creats table in database to save JSON-Data using Configtext to generate the information needed
 */
async function createTable(datenbankname) {

    const tableData = JSON.parse(document.getElementById("Configtext").value);

    for (let j = 0; j < tableData["json_mapping"].length; j++) {
        const j_mapping = tableData["json_mapping"][j];

        let table = {
            "name": tableData["collection"],
            "attributes": [
                {
                    "isAutoIncrement": true,
                    "isNullable": false,
                    "name": "id",
                    "isIdentity": true,
                    "defaultvalue": "nextval('smartmonitoring." + datenbankname + "_id_seq'::regclass)",
                    "type": "int8"
                }
            ],
            "storage": "smartmonitoring"
        };


        for (let i = 0; i < j_mapping["mappingdata"].length; i++) {
            const element = j_mapping["mappingdata"][i];
            table["attributes"].push(
                {
                    "isAutoIncrement": false,
                    "isNullable": true,
                    "name": element["dbcolumn"],
                    "isIdentity": false,
                    "type": "varchar"
                }
            );
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify(table);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        const URL = host + `SmartDataGewaesser/smartdata/collection/${j_mapping['collection']}?storage=smartmonitoring`;

        fetch(URL, requestOptions)
            .then(response => response.text());

    }


}

/**
 * Reads the Url for the Json and shows it in the Textfield for the json
 */
async function readurlj() {
    var url = document.getElementById("urlj").value;
    document.getElementById("Jsontextinput").value = "";
    if (url == "") {
        document.getElementById("Jsontext").value = "";
    }
    else {
        const response = await fetch(url, {
            method: 'GET'
        });
        const data = await response.json();
        document.getElementById("Jsontext").value = JSON.stringify(data);
    }
}



/**
 * Present JSON-Data from databse as a table
 */
function showdatenbank() {
    var container = document.getElementById("Datenbankinhalt");
    var datenbank = document.getElementById("Datenbankinhaltchoose").value;
    var newdatenbank = "<div id=\"livepresent_show\" swa=\"Present FROM " + datenbank + "\"><table class=\"uk-table\"><tr class=\"swac_repeatForSet\"><td class=\"swac_repeatForValue\" swac_id=\"{id}\"><span uk-tooltip=\"title: {attrName}\">{*}</span></td></tr></table></div>";
    container.innerHTML = newdatenbank;
}




/**
 * Generate a Table in wiche all selectet keys will be shown
 */
function vorschauerstellen() {
    var stringfull = "";
    var container = document.getElementById("tabbelvorschau");
    for (let j = 0; j < collections.length; j++) {
        var stringcol = "<h3>" + collections[j] + "</h3>";
        stringfull = stringfull + stringcol + "<table><tr>";

        for (let i = 0; i < jsonkeys[j].length; i++) {
            var stringkey = "<td>" + jsonkeys[j][i][1] + "</td>";
            stringfull = stringfull + stringkey;
        }
        stringfull = stringfull + "</tr><tr>";
        stringfull = stringfull + nestedLoop(jsontopars, 0, j);
        stringfull = stringfull + "</tr></table>";
    }
    container.innerHTML = stringfull;
}



/**
 * uses loops to dive in JSON-Data form with the help from function nestedLoop2()
 */
function nestedLoop(obj, checksplitt, j) {
    var stringfull = "";
    for (const key in obj) {
        for (let i = 0; i < jsonkeys[j].length; i++) {
            checksplitt = 0;
            var test = jsonkeys[j][i][0];
            test = test.replace("/", "");
            test = test.split("/");
            if (test[checksplitt] == key && Object.keys(obj[key]).length === 0) {

                stringfull = stringfull + "<td>" + obj[key] + "</td>";
            }
            else if (test[checksplitt] == key) {
                stringfull = stringfull + nestedLoop2(obj[key], checksplitt + 1, test);

            }
        }
    }
    return stringfull;
}

/**
 * uses loops to dive in JSON-Data form 
 */
function nestedLoop2(obj, checksplitt, test) {
    var stringfull = "";
    for (const key in obj) {
        if (test[checksplitt] == key && Object.keys(obj[key]).length === 0) {
            return stringfull = stringfull + "<td>" + obj[key] + "</td>";

        } else if (test[checksplitt] == key) {

            return stringfull = stringfull + nestedLoop2(obj[key], checksplitt + 1, test);

        }

    }

    return stringfull;
}


/**
 * Reads all keys that are in the JSON data file and filters out multiple instances of one key, so keys are only unique.
 * 
 * This function first reads the file from the textbox and then starts to go recursively into the branches of the JSON file to find all keys.
 * If a key is an object or an array, the function recursively calls itself again and goes deeper into the branch to look for keys.
 * The function only adds keys, that contain only premitive values. No Arrays or Objects are added, except for Arrays, which only contain values.
 */
function Keyoutput() {
    uniqueKeys = [];
    collections = [];
    var data = document.getElementById("Jsontext").value;
    data = JSON.parse(data);
    jsontopars = data;

    // Find ALL keys, even multiple instances
    const getNestedKeys = (data, resultKeys, path = "") => {

        if (!(data instanceof Array) && typeof data === 'object') {

            Object.keys(data).forEach(key => {
                if (!(data[key] instanceof Object)) {
                    // Don't push Objects and Arrays (Arrays are Objects)
                    resultKeys.push(path + key);
                } else if (data[key] instanceof Array) {
                    var arr = data[key];
                    if (!(arr[0] instanceof Object)) {
                        // Only push arrays that only contain values, no more nested attributes (Arrays or Objects)
                        resultKeys.push(path + key); // These arrays containing only values are pushed as a key
                    }
                }
                var value = data[key];

                if (typeof value === 'object' && value != null) {
                    getNestedKeys(value, resultKeys, path + key + "/");
                }

            });

        }
        else {
            Object.keys(data).forEach(key => {
                if (data instanceof Array) {
                    getNestedKeys(data[key], resultKeys, path + "/");
                }
            });
        }

        return resultKeys;
    };
    var keys = getNestedKeys(data, []);
    uniqueKeys = [...new Set(keys)]; // Filter out multiple instances of all keys, only unique keys remain



    let pattern = /\/\//g;
    for (let i = 0; i < uniqueKeys.length; i++) {
        uniqueKeys[i] = "/" + uniqueKeys[i]; // Add front slashes
        uniqueKeys[i] = uniqueKeys[i].replace(pattern, "/"); // Remove double slashes
    }



    // User input, reads all collections the user puts in
    var collectionc = document.getElementById("collection").value;
    collectionc.split(",").forEach(function (item) {
        collections.push(item);
    });
    generatecheckbox(uniqueKeys, collections);


}

/**
 * generate a list of alle the Keys times the count of Collection
 */
function generatecheckbox(uniqueKeys, collections) {

    var stringfull = "<div class=\"scroller2\">";

    for (let j = 0; j < collections.length; j++) {
        var stringcol = "<h3>" + collections[j] + "</h3>" + "<table><tr>";

        stringfull = stringfull + stringcol;
        for (let i = 0; i < uniqueKeys.length; i++) {

            var stringkey = "<tr><td><label for=\" vehicle1 \">" + uniqueKeys[i] + "</label></td><td><input id=\"" + collections[j] + uniqueKeys[i] + "\" placeholder=\"Spaltenname\"><br></tr>";
            stringfull = stringfull + stringkey;
        }
        stringfull = stringfull + "</tr></table>";
    }
    stringfull = stringfull + "</div>";
    document.getElementById("demo").innerHTML = stringfull;
}


/**
 * Checks which textfields have values and filters them out. These textfields are added to the config that determines which values are
 * saved into the database. Then the function builds the settings for the body of the request and puts in the config with attributes to save.
 */
function checkboxenchecken() {
    mappingdatakeys = new Array(collections.length);
    for (let j = 0; j < collections.length; j++) {
        var keys = [];

        for (let i = 0; i < uniqueKeys.length; i++) {
            var keyinput = new Array(2);
            if (document.getElementById(collections[j] + uniqueKeys[i]).value != "") {
                keyinput[0] = uniqueKeys[i];
                keyinput[1] = document.getElementById(collections[j] + uniqueKeys[i]).value;
                keys.push(keyinput);

            }
        }

        mappingdatakeys[j] = keys;
    }

    var mappingdatas = [];

    for (let i = 0; i < collections.length; i++) {
        mappingdatas.push([]); // Pushes arrays the amount of collections
    }

    for (let i = 0; i < mappingdatakeys.length; i++) {

        for (let j = 0; j < mappingdatakeys[i].length; j++) {

            var mappingObj = {};
            mappingObj.path = mappingdatakeys[i][j][0];
            mappingObj.dbcolumn = mappingdatakeys[i][j][1];
            mappingdatas[i].push(mappingObj);

        }
    }
    jsonkeys = [];
    jsonkeys = mappingdatakeys;

    // Set up the settings to send in the body, also the config which decides, which attributes are saved in the database
    var settings = {};
    settings.server = host;
    settings.smartdata = "SmartDataGewaesser";
    settings.storage = "smartmonitoring";
    var coll = document.getElementById("collection").value; // The first collections the user puts ins
    coll = coll.split(",");
    settings.collection = coll[0];
    settings.parser = "JSONParser";

    if (jsite) {
        // Import from an URL
        settings.importer = "HTTPImporter";
        settings.url = document.getElementById("urlj").value;
    } else {
        // Import from an uploaded file
        settings.importer = "RequestImporter";

        var file = document.getElementById("Jsontextinput").value;
        file = file.split("\\");
        var file_name = file[file.length - 1];
        settings.file_name = file_name;

        var data = document.getElementById('Jsontext').value;
        settings.content = btoa(data);
    }

    settings.json_mapping = [];

    for (let i = 0; i < collections.length; i++) {
        // Collections
        settings.json_mapping[i] = {};
        settings.json_mapping[i].collection = collections[i];
        settings.json_mapping[i].mappingdata = mappingdatas[i];
    }


    var writeObj = JSON.stringify(settings, null, 2);

    document.getElementById("Configtext").value = writeObj;
}
