var explaincomponent_options = {
    componentName: 'Upload'
};

window['upload_example1_options'] = {
    uploadTargetURL: '../data/upload/exampletarget.json' // This is the url where files should be send to
};

window['upload_example2_options'] = {
    uploadTargetURL: '../data/upload/exampletarget.json',
    dataComponents: [
        {
            selector: '#example2_select',
            sendAttribute: 'selection',
            required: true,
            requiredMessage: 'Please choose a target',
            requiredGt: 0,
            requiredGtMessage: 'The target must be greater than 0.'
        },
        {
            selector: '#example2_name'
        },
        {
            selector: '#example2_email'
        },
        {
            selector: '#example2_message'
        }
    ]
};