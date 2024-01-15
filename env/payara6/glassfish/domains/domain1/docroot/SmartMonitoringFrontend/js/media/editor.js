// var explaincomponent_options = {
//     componentName: 'Mediaeditor'
// };
var mediaeditor_options = {};
mediaeditor_options.docroot = '../../../';
// mediaeditor_options.usemodal = true;
mediaeditor_options.plugins = new Map();
// mediaeditor_options.plugins.set('mediatags', {
//     active: true,
//     options: {
//         tagsrequestor: {
//             fromName: 'tagmedia/listForMedia',
//             fromWheres: {
//                 media_id: '{media.id}'
//             }
//         },
//         tagtypesrequestor: {
//             fromName: 'tagtype/listByTargetUseage',
//             fromWheres: {
//                 useage: 'mediaTag'
//             }
//         }
//     }
// });
// mediaeditor_options.plugins.set('mediaanalysis', {
//     active: true,
//     options: {
//         analysisrequestor: {
//             fromName: 'media/getThermalBridges?id={media.id}'
//         }
//     }
// });
mediaeditor_options.plugins.set('SamplePlugin', {
  id: 'sampleplugin',
  active: true
});
mediaeditor_options.plugins.set('Mediatags', {
  id: "mediatags",
  active: true,
});

mediatags_mediaeditor_options = {
  tagtypesrequestor: {
    fromName: "label_labels",
    fromWheres: {
      filter: 'isavailformediasets,eq,true'
    }
  }
};