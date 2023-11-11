upload_options = {
    uploadTargetURL: '../../smartfile/file/filespace'
};

document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function () {
//        alert("This is a reaction: upload is loaded.");
    }, "upload");
});