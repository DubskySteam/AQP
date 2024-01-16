var explaincomponent_options = {
    componentName: 'Mediaeditor'
};
var mediaeditor_options = {};
mediaeditor_options.showWhenNoData = true;
mediaeditor_options.usemodal = true;
mediaeditor_options.plugins = new Map();
mediaeditor_options.plugins.set('mediatags', {
    id: 'mediatags',
    active: true,
    //TODO move options to plugin
    options: {
        tagsrequestor: {
            fromName: '../data/mediaeditor/tags_{media.id}.json', // 'tagmedia/listForMedia',
            fromWheres: {
                media_id: '{media.id}'
            }
        },
        tagtypesrequestor: {
            fromName: '../data/mediaeditor/tagtypes.json', // 'tagtype/listByTargetUseage',
            fromWheres: {
                useage: 'mediaTag'
            }
        }
    }
});
mediaeditor_options.plugins.set('mediaanalysis', {
    id: 'mediaanalysis',
    active: true,
    options: {
        analysisrequestor: {
            fromName: '../data/mediaeditor/analysistags_{media.id}.json' // 'media/getThermalBridges?id={media.id}'
        }
    }
});