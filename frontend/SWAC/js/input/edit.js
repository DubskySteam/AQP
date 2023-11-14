var explaincomponent_options = {
    componentName: 'Edit'
};
var testcomponent_options = {
    componentName: 'Edit'
};

var edit_example2_options = {
    showWhenNoData: true,
    allowAdd: true
};

let nShowAttrProject = {
    ['../../data/exampledata_list.json']: ['id', 'dateval']
};
var edit_example3_options = {
    showWhenNoData: true,
    allowAdd: true,
    notShownAttrs: nShowAttrProject
};

var edit_example4_options = {
    showWhenNoData: true,
    allowAdd: true,
    fetchDefinitions: false
};

// Example 5: Editor useing a target outside the requestor for displaying the edit form
var edit_example5_options = {};
edit_example5_options.showWhenNoData = true;
edit_example5_options.allowAdd = true;
edit_example5_options.fetchDefinitions = true;
edit_example5_options.editorTargetElement = '#example5_editortarget';

// Example 6: Editor with table layout
var edit_example6_options = {};
edit_example6_options.showWhenNoData = true;
edit_example6_options.allowAdd = true;
edit_example6_options.fetchDefinitions = false;

// Example 7: Create new datasets from definitions
var edit_example7_options = {
    mainSource: 'observedobject/list',
    showWhenNoData: true,
    allowAdd: true,
    directOpenNew: true,
    definitions: new Map()
};
edit_example7_options.definitions.set("observedobject/list", [
    {
        name: 'id',
        type: 'int8',
        isNullable: false,
        isIdentity: true,
        isAutoIncrement: true,
        defaultvalue: 'nextval()'
    }, {
        name: 'name',
        type: 'varchar',
        isNullable: false
    },
    {
        name: 'doubleval',
        type: 'float8'
    },
    {
        name: 'intval',
        type: 'int8'
    },
    {
        name: 'boolval',
        type: 'bool'
    },
    {
        name: 'stringval',
        type: 'varchar'
    },
    {
        name: 'ts',
        type: 'timestamp'
    },
    {
        name: 'dateval',
        type: 'date'
    },
    {
        name: 'timeval',
        type: 'time'
    },
    {
        name: 'refval',
        type: 'reference'
    },
    {
        name: 'mimetype',
        type: 'varchar'
    },
    {
        name: 'colval',
        type: 'color'
    },
    {
        name: 'urlval',
        type: 'url'
    },
    {
        name: 'emailval',
        type: 'email'
    },
    {
        name: 'passwordval',
        type: 'password'
    }
]);

// Example 8: Editor with table layout and use of definitions
var edit_example8_options = {
    showWhenNoData: true,
    allowAdd: false,
    fetchDefinitions: true
};

// Example 9: Editor with custom definition useing password field
var edit_example9_options = {
    showWhenNoData: true,
    allowAdd: true,
    definitions: new Map()
};
edit_example9_options.definitions.set("../smartuser/user", [
    {
        name: 'username',
        type: 'string',
        required: true
    }, {
        name: 'firstname',
        type: 'string'
    },
    {
        name: 'lastname',
        type: 'string'
    },
    {
        name: 'email',
        type: 'email'
    },
    {
        name: 'password',
        type: 'password'
    },
    {
        name: 'street',
        type: 'string'
    },
    {
        name: 'houseno',
        type: 'string'
    },
    {
        name: 'zipcode',
        type: 'string'
    },
    {
        name: 'city',
        type: 'string'
    },
    {
        name: 'country',
        type: 'string',
        defaultvalue: 'Germany'
    }
]);

// Example 10: Give a set of possible values
var edit_example10_options = {
    showWhenNoData: true,
    allowAdd: true,
    definitions: new Map()
};
edit_example10_options.definitions.set("../../data/exampledata_list.json", [
    {
        name: 'name',
        type: 'string'
    },
    {
        name: 'doubleval',
        type: 'float8',
        min: -12,
        max: 49.7
    },
    {
        name: 'intval',
        type: 'int4',
        min: 18,
        max: 99
    },
    {
        name: 'stringval',
        possibleValues: ['Deutschland', 'Östereich', 'Schweiz']
    },
    {
        name: 'dateval',
        type: 'date',
        min: '2020-10-01',
        max: '2021-12-31'
    },
    {
        name: 'mimetype',
        possibleValues: 'audio/mp3,audio/avif,audio/ogg,video/mpeg'
    }
]);

// Example 11: Get possible values from database
var edit_example11_options = {
    showWhenNoData: true,
    allowAdd: true,
    definitions: new Map()
};
edit_example11_options.definitions.set("../../data/exampledata_list.json", [
    {
        name: 'name',
        type: 'string'
    },
    {
        name: 'doubleval',
        type: 'float8',
        min: -12,
        max: 49.7
    },
    {
        name: 'intval',
        type: 'int4',
        min: 18,
        max: 99
    },
    {
        name: 'stringval',
        possibleValues: 'ref://../../data/edit/possibleStringVals.json'
    },
    {
        name: 'dateval',
        type: 'date',
        min: '2020-10-01',
        max: '2021-12-31'
    },
    {
        name: 'mimetype',
        possibleValues: 'ref://../../data/edit/possibleMimeVals.json',
        possibleValueAttr: "no", // defaults to "id"
        possibleValueName: "mime" // defaults to "name"
    }
]);

// Example 12: Hide input fields
var edit_example12_options = {
    inputsVisibility: [
        {
            hide: ['id']
        }
    ]
};

// Example 13: Hide input fields on conditions
var edit_example13_options = {
    inputsVisibility: [
        {
            applyOnAttr: 'stringval',
            applyOnVal: 'string',
            hide: ['id']
        }
    ]
};

// Example 14: Create new datasets from definitions
var edit_example14_options = {
    mainSource: 'airquality_a3',
    showWhenNoData: true,
    allowAdd: true,
    directOpenNew: true,
    definitions: new Map(),
    inputsVisibility: [
        {
            hide: ['id']
        }
    ],
    customOnStartAutoData: function() {
        let compElem = document.querySelector('#edit_example14');
        let sessElem = compElem.querySelector('[name="session"]');
        const d = new Date();
        let dstr = d.toISOString();
        let dotpos = dstr.indexOf('.');
        dstr = dstr.substring(0,dotpos);
        dstr = dstr.replaceAll('.','_').replaceAll(':','_');
        sessElem.value = dstr;
    }
};
edit_example14_options.definitions.set("airquality_a3", [
    {
        name: 'id',
        type: 'int8',
        isNullable: false,
        isIdentity: true,
        isAutoIncrement: true,
        defaultvalue: 'nextval()'
    },
    {
        name: 'session',
        type: 'varchar'
    },
    {
        name: 'pm10',
        type: 'float8',
        auto: {
            requestor: {fromName: '../../data/edit/autovalue.json',
                fromWheres: {
                    filter: 'id,lt,10'
                }
            },
            update: 5
        }
    },
//    {
//        name: 'lat',
//        type: 'float8',
//        auto: {
//            script: function(inputElem) {
//                navigator.geolocation.getCurrentPosition(function(loc) {
//                    console.log('Loction: ', loc);
//                    inputElem.value = loc.latitude;
//                },function(err) {
//                    console.log('Error getting location: ', err);
//                });
//            },
//            update: 5
//        }
//    },
    {
        name: 'ts',
        type: 'timestamp',
        auto: {
            script: function(inputElem) {
                const d = new Date();
                let dstr = d.toISOString();
                let dotpos = dstr.indexOf('.');
                dstr = dstr.substring(0,dotpos);
                inputElem.value = dstr;
                
                // Find component level
                let compElem = inputElem;
                while(!compElem.hasAttribute('swa') && compElem.parentElement) {
                    compElem = compElem.parentElement;
                }
                if(compElem.swac_comp) {
                    compElem.swac_comp.saveAndNew();
                }
            },
            update: 5
        }
    }
]);


// Example 99: Editor with definitions and child datasets
var edit_example99_options = {
    showWhenNoData: true,
    allowAdd: false,
    definitions: new Map()
};
edit_example99_options.definitions.set("../deliveryaddresses", [
    {
        name: 'name',
        type: 'string'
    },
    {
        name: 'eyecolor',
        type: 'string'
    },
    {
        name: 'age',
        type: 'int4'
    },
    {
        name: 'country',
        type: 'string'
    }
]);