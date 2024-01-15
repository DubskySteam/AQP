var newoo_options = {
    mainSource: 'observedobject/create',
    notShownAttrs: {['observedobject/create']: ['id']},
    showWhenNoData: true,
    allowAdd: false,
    directOpenNew: true,
    definitions: new Map(),
    customAfterSave: function(data) {
        window.location.href = "view.html?id=" + data[0].id;
    }
};
newoo_options.definitions.set("observedobject/create", [
    {
        name: 'name',
        type: 'varchar',
        isNullable: false
    },
    {
        name: 'description',
        type: 'varchar'
    },
    {
        name: 'collection',
        type: 'varchar'
    },
    {
        name: 'type',
        possibleValues: 'ref://tbl_observedobject_type'
    },
    {
        name: 'parent',
        possibleValues: 'ref://tbl_observedobject'
    }
]);