// Options for label editor
window['labeleditor_options'] = {
    showWhenNoData: true,
    fetchDefinitions: true,
    allowAdd: true,
    mainSource: 'label_labels',
    inputsVisibility: [
        {
            hide: ['id']
        }
    ],
    customAfterSave: function() {
        UIkit.notification(window.swac.lang.dict.app.adm_labels_saved);
    }
};