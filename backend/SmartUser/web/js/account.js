var edit_userdata_options = {};
edit_userdata_options.showWhenNoData = true;
edit_userdata_options.allowedToAddNew = false;
edit_userdata_options.definitions = new Map();
edit_userdata_options.definitions.set("../smartuser/user", [
    {
        name: 'username',
        type: 'string',
        required: true
    },{
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
        type: 'string'
    }
]);