var create_user_options = {
    mainSource: '../smartuser/user',
    showWhenNoData: true,
    allowedToAddNew: true,
    directOpenNew: true,
    definitions: new Map(),
    inputsVisibility: [
        {
            hide: ['id']
        }
    ]
};
create_user_options.definitions.set("../smartuser/user", [
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
    },
    {
        name: 'language',
        type: 'string'
    }
]);