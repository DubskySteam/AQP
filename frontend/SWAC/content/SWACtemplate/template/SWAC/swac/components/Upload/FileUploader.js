/* 
 * Class for uploading files to a specific target
 */
class FileUploader {
    /**
     * Creates a fileUploader
     * 
     * @param {Component} component Component that uses the FileUploader
     * @param {String} targetURL URL where to send the data
     * @param {String} targetVar Name of the variable the file content should be send to
     * @returns {FileUploader}
     */
    constructor(component, targetURL, targetVar) {
        if(!component) {
            throw 'FileUploader called without giving a useing component.';
        }
        this.component = component;
        this.targetURL = targetURL;
        this.targetVar = targetVar;
    }

    /**
     * Uploads a list of files
     * 
     * @param {Object[]} files Array of file objects with at least name and content attributes
     * @param {String} targetURL URL where to send the data
     * @param {String} targetVar Name of the variable the file content should be send to
     * @returns {undefined}
     */
    uploadFiles(files, targetURL, targetVar) {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            let uploadPromises = [];
            Msg.warn('FileUploader', 'Uploading ' + files.length + ' files.', thisRef.component.requestor);
            for (let curFile of files) {
                if (curFile.state === 'local') {
                    uploadPromises.push(this.uploadFile(curFile, targetURL, targetVar));
                }
            }
            Promise.all(uploadPromises).then(
                    function (allData) {
                        Msg.warn('FileUploader', 'All files succsessfully uploaded.', thisRef.component.requestor);
                        resolve(allData);
                    }).catch(
                    function (error) {
                        Msg.error('FileUploader', 'Could not upload files: ' + error, thisRef.component.requestor);
                        reject(error);
                    }
            );
        });
    }

    /**
     * Uploads a single file to the configured target.
     * 
     * @param {Object} file File object with at least name and content attributes
     * @param {String} targetURL URL where to send the data
     * @param {String} targetVar Name of the variable the file content should be send to
     * @returns {undefined}
     */
    uploadFile(file, targetURL, targetVar) {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            if (file.state !== 'local') {
                resolve(file);
                return;
            }
            if (!targetURL)
                targetURL = thisRef.targetURL;
            if (file.targetURL)
                targetURL = file.targetURL;
            if (!targetVar)
                targetVar = thisRef.targetVar;
            if (file.targetVar)
                targetVar = file.targetVar;
            Msg.warn('FileUploader', 'Now uploading file >'
                    + file.name + '< to >' + targetURL + '<', thisRef.component.requestor);
            // Create form data
            let formData = new FormData();
            // Get file contents as blob           
            let tmpblob = this.dataURItoBlob(file.dataURL);
            // Create file object (to send metadata along)
            let tmpfile = new File([tmpblob], file.name, {
                type: file.type,
                lastModified: file.lastModified
            });
            file.uploadStart = Date.now();

            // Show tmpfile
            if (SWAC_config.debugmode) {
                let tmpfileElem = document.createElement('a');
                tmpfileElem.innerHTML = 'Download (dataURL fromDB)';
                tmpfileElem.setAttribute('href', file.dataURL);
                Msg.addDebugContent(thisRef.component.requestor, tmpfileElem);

                let reader1 = new FileReader();
                reader1.addEventListener("load", function () {
                    let tmpfileElem = document.createElement('a');
                    tmpfileElem.innerHTML = 'Download (converted to blob and back to dataurl)';
                    tmpfileElem.setAttribute('href', reader1.result);
                    Msg.addDebugContent(thisRef.component.requestor, tmpfileElem);
                }, false);

                reader1.readAsDataURL(tmpfile);
            }

            formData.append(targetVar, tmpfile);

            // Add sendalong data
            for (let curAttr in file) {
                // Exclude file content
                if (curAttr === 'dataURL')
                    continue;
                formData.append(curAttr, file[curAttr]);
            }

            fetch(targetURL, {
                method: 'POST',
                body: formData
            }).then(response => response.json())
                    .then(data => {
                        Msg.warn('FileUploader',
                                'File >' + file.name + '< upload succsessfull.', thisRef.component.requestor);
                        let resolveObj = Object.assign(file, data);
                        resolveObj.state = 'uploaded';
                        resolve(resolveObj);
                    })
                    .catch(error => {
                        Msg.error('FileUploader',
                                'Could not upload file >' + file.name + '>: ' + error, thisRef.component.requestor);
                        reject(error);
                    });
        });
    }

    /**
     * Converts a dataURL to a blob
     * 
     * @param {String} dataURI
     * @returns {Blob}
     */
    dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type: mimeString});
    }
}
