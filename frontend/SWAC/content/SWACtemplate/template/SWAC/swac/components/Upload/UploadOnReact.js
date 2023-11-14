/* 
 * Class with reactions on online / offline change for Upload component
 */
var UploadOnReactFactory = {};
UploadOnReactFactory.create = function (config) {
    return new UploadOnReact(config);
};

class UploadOnReact extends OnlineReaction {
    constructor(config) {
        super(config);
    }

    loadDependencies() {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            // Load needed class files
            let corecomp = {};
            corecomp.name = 'UploadReact';

            let dependencyStack = [];
            dependencyStack.push({path: SWAC_config.swac_root + '/swac/components/Upload/FileUploader.js'});
            dependencyStack.push({path: SWAC_config.swac_root + '/swac/storage/LocalFilesDB.js'});
            dependencyStack.push({path: SWAC_config.swac_root + '/swac/storage/LocalFile.js'});
            SWAC.loadDependenciesStack(dependencyStack, corecomp).then(
                    function () {
                        // Initilize filesDB
                        thisRef.filesdb = new LocalFilesDB('upload');
                        thisRef.fileuploader = new FileUploader(thisRef);
                        resolve();
                    }
            );
        });
    }

    onOnline(evt) {
        Msg.warn('UploadOnReact', 'Starting file uploads.');
        let thisRef = this;
        this.loadDependencies().then(
                function () {
                    // Get files in localDB
                    thisRef.filesdb.searchFiles('state','local').then(function (files) {
                        // Start uploading files that are in database
                        thisRef.fileuploader.uploadFiles(files).then(
                                function(allFiles) {
                                    // Updates every local files state
                                    thisRef.filesdb.updateFiles(allFiles);
                                });
                    });
                }
        );
    }

    onOffline(evt) {
        console.log('Upload onOffline reaction');
    }

    onUnreachable(evt) {
        console.log('Upload onUnreachable action');
    }
}