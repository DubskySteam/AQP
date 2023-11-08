var UploadFactory = {};
UploadFactory.create = function (config) {
    return new Upload(config);
};

/**
 * Component for giving upload possibilities
 */
class Upload extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'Upload';

        this.desc.text = 'Creates a dialog for uploads including drag and drop possibility, file selection and upload status view.';

        this.desc.depends[0] = {
            name: 'Icon component',
            component: 'Icon',
            desc: 'SWAC Icon component'
        };
        this.desc.depends[1] = {
            name: 'FileUploader',
            path: SWAC_config.swac_root + '/swac/components/Upload/FileUploader.js',
            desc: 'Class containing algorithms for uploading files to a REST interface'
        };
        this.desc.depends[2] = {
            name: 'UploadOnReact',
            path: SWAC_config.swac_root + '/swac/components/Upload/UploadOnReact.js',
            desc: 'Class for handling online / offline status changes.'
        };
        this.desc.depends[3] = {
            name: 'LocalFilesDB',
            path: SWAC_config.swac_root + '/swac/storage/LocalFilesDB.js',
            desc: 'Class for handling offline storeage of files to upload.'
        };
        this.desc.depends[4] = {
            name: 'LocalFile',
            path: SWAC_config.swac_root + '/swac/storage/LocalFile.js',
            desc: 'Class for representing local files.'
        };
        this.desc.templates[0] = {
            name: 'upload',
            style: 'upload',
            desc: 'Creates an drag and drop able area where you can choose the file to upload and displays the status of upload above.'
        };
        this.desc.reqPerTpl[0] = {
            selc: '.swac_upload',
            desc: 'Container where users can drop their files for upload.'
        };
        this.desc.reqPerTpl[1] = {
            selc: '.swac_fileselect',
            desc: 'Input element which allows selecting a file.'
        };
        this.desc.reqPerTpl[2] = {
            selc: '.swac_uploadresult',
            desc: 'Table element where the results can be displayed'
        };
        this.desc.reqPerTpl[3] = {
            selc: '.swac_uploadprogressbar',
            desc: 'Progressbar element where to display the upload progress'
        };
        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'The id of the upload, maybe positive (for allready uploaded files) or negative (for only local available files)'
        };
        this.desc.reqPerSet[1] = {
            name: 'type',
            desc: 'Mimetype of the file.'
        };
        this.desc.reqPerSet[2] = {
            name: 'state',
            desc: 'State of the file. Either one of local or uploaded.'
        };

        if (!options.showWhenNoData)
            this.options.showWhenNoData = true;
        this.desc.opts[0] = {
            name: 'multiple',
            desc: 'If true more than one file can be selected at once'
        };
        if (!options.multiple)
            this.options.multiple = true;
        this.desc.opts[1] = {
            name: "uploadTargetURL",
            desc: "Address of the REST-Interface accepting file uploads"
        };
        if (!options.uploadTargetURL)
            this.options.uploadTargetURL = null;
        this.desc.opts[2] = {
            name: "uploadTargetVar",
            desc: "Name of the variable the file content should be send to"
        };
        if (!options.uploadTargetVar)
            this.options.uploadTargetVar = 'file';
        this.desc.opts[3] = {
            name: "dataComponents",
            desc: "Datacomponents are components (swac components) wich data should be send along with the file upload. To add datacomponents specify objects with selector = a css selector required = true or false if required or not requiredMessage = Message to show when required data is not given requiredGt = Value should be grather then (gt)"
        };
        if (!options.dataComponents)
            this.options.dataComponents = [];
        this.desc.opts[4] = {
            name: "processingHandlersApi",
            desc: "Address of the REST-Interface where to find the handlers for files"
        };
        if (!options.processingHandlersApi)
            this.options.processingHandlersApi = 'fileprocessing/getHandlersForFile';
        this.desc.opts[5] = {
            name: "processingExecutionApi",
            desc: "Address of the REST-Interface where to send files for processing"
        };
        if (!options.processingExecutionApi)
            this.options.processingExecutionApi = 'fileprocessing/process';

        // Internal values
        this.preconditionsGiven = false;
        this.processId = null;
        this.uploadURL = null;
        this.files = [];     // Storage for file informations
        this.uploadFile = 0; // Number fo the file currently uploaded
        this.selectedFile = null;   // Storage for selected files selected with select dialog

        this.filesdb = null; //Storage for all uploadfiles
        this.fileuploader = null;   // Object used for file uploading
    }

    init() {
        return new Promise((resolve, reject) => {
            if (!this.options.uploadTargetURL) {
                Msg.error('upload',
                        'There is no uploadTargetURL specified in options. Upload will not work.',
                        this.requestor);
                resolve();
                return;
            }
            let thisRef = this;
            // Initilize filesDB
            this.filesdb = new LocalFilesDB('upload');
            this.fileuploader = new FileUploader(thisRef);

            // Activate multiple mode if wanted
            if (this.options.multiple) {
                let inputElem = this.requestor.querySelector('.swac_fileselect');
                inputElem.setAttribute('multiple', '');
            }

            // Note new files
            let newFiles = [];
            UIkit.upload('#' + this.requestor.id + ' .swac_upload', {
                allow: "*.*", // Note: Limitations are not working here (user becomes no message)
                url: '',
                multiple: this.options.multiple,

                beforeAll: function (p) {
                    for (let curFile of arguments[1]) {
                        let curLocalFile = new LocalFile(curFile);
                        try {
                            let sendAlongData = thisRef.getSendAlongData();
                            if (sendAlongData) {
                                thisRef.filesdb.addFile(curLocalFile, sendAlongData).then(
                                        function (fileObj) {
                                            newFiles.push(fileObj);
                                            fileObj.id = fileObj.localdb_key * -1;
                                            thisRef.addSet('LocalFilesDB', fileObj);
                                            thisRef.uploadFiles();
                                        });
                            }
                        } catch (error) {
                            Msg.error('Upload', 'Error before uploading: ' + error);
                            UIkit.notification({
                                message: SWAC_language.Upload.preuploaderror,
                                status: 'danger',
                                pos: 'top-center',
                                timeout: SWAC_config.notifyDuration
                            });
                        }
                    }

//                    // Reset upload file counter
//                    this.uploadFile = 0;
//                    // Reset data to send along
//                    let sendAlongData = thisRef.getSendAlongData(thisRef.requestor);
//                    this.uploadURL = null;
//                    // Build up url
//                    this.uploadURL = SWAC_config.datasources[0].replace('[fromName]', thisRef.options.uploadtarget);
//                    // add aditional date to request
//                    if (typeof sendAlongData !== 'undefined') {
//                        let i = 0;
//                        for (let alongData of sendAlongData) {
//                            if (i === 0) {
//                                thisRef.uploadURL += "?";
//                            } else {
//                                thisRef.uploadURL += "&";
//                            }
//                            i++;
//                            thisRef.uploadURL += alongData.name + "=" + alongData.value;
//                        }
//                    }
//
//                    thisRef.preconditionsGiven = true;
//                    // If a file was selected by select dialog
//                    if (thisRef.selectedFile !== null) {
//                        thisRef.files.push(thisRef.selectedFile);
//                        thisRef.selectedFile = null;
//                    } else {
//                        thisRef.files = arguments[1];
//                    }

//                    if (!thisRef.options.uploadURL.includes('create?ooid=')) {
//                        return;
//                    }

                    // Create status entry for each file
//                    let uploadid = Date.now();
//                    for (let file of thisRef.files) {
//                        file.uploadid = uploadid++;
//                        thisRef.generateStatusTR(file);
//                    }
                }
                ,
                beforeSend: function (p) {
//                    console.log('beforeSend');
//                    console.log(p);
                },
                loadStart: function (p) {
//                    console.log('loadStart:');
//                    console.log(p);
                },
                load: function (p) {
//                    console.log('load');
//                    console.log(p);
//                    // Add uploadId to uploadURL
//                    let uploadURL;
//                    // Create formdata to send
//                    let fileData = new FormData();
//                    if (this.preconditionsGiven && this.files !== null) {
//                        let uploadFile = this.files[this.uploadFile];
//                        fileData.append('file', uploadFile);
//                        this.uploadFile++;
//
//
//                        if (!this.uploadURL.includes('?')) {
//                            uploadURL = this.uploadURL + "?uploadid=" + uploadFile.uploadid;
//                        } else {
//                            uploadURL = this.uploadURL + "&uploadid=" + uploadFile.uploadid;
//                        }
//                    }
//
//
//
//
//                    if (!this.uploadURL.includes('create?ooid=')) {
//                        return;
//                    }


                },
                complete: function (p) {
//                    console.log('complete:');
//                    console.log(p);
                },

                progress: function (p) {
//                    console.log('progress');
//                    console.log(p);
                },
                loadEnd: function (p) {
//                    console.log('loadEnd');
//                    console.log(p);
                },
                completeAll: function (p) {
//                    console.log('completeAll');
//                    console.log(p);
                    // Empty newFiles
                    newFiles = [];
                },
                error: function (error) {
                    Msg.error('Upload', 'Error while uploading: ' + error, thisRef.requestor);
                }
            });

            // Get files in localDB
            this.filesdb.listFiles().then(function (files) {
                // Create status info for each file
                let i = 0;
                for (let curFileObj of files) {
                    i++;
                    curFileObj.swac_setNo = i;
                    curFileObj.id = curFileObj.localdb_key * -1;
                    thisRef.addSet('LocalFilesDB', curFileObj);
                }
                // Upload stored local files if there is no OnlineReaction
                if (typeof UploadOnReact !== 'function') {
                    thisRef.uploadFiles();
                }
            });

            resolve();
        });
    }

    /**
     * Uploads all files from locale database
     * 
     * @returns {undefined}
     */
    uploadFiles() {
        let thisRef = this;
        // Get files in localDB
        this.filesdb.searchFiles('state', 'local').then(function (files) {
            // Start uploading files that are in database
            thisRef.fileuploader.uploadFiles(files).then(
                    function (allFiles) {
                        // Updates every local files state
                        thisRef.filesdb.updateFiles(allFiles);
                        // Update view
                        let i = 0;
                        for (let curFileObj of files) {
                            if (!curFileObj.id || curFileObj.id === 0) {
                                i++;
                                curFileObj.swac_setNo = i;
                                curFileObj.id = curFileObj.localdb_key * -1;
                            }
                            thisRef.addSet('LocalFilesDB', curFileObj);
                        }
                    }
            );
        });
    }

    /**
     * Executed after ading a set. Resets the chartjs data
     * 
     * @param {type} fromName
     * @param {type} set
     * @returns {undefined}
     */
    afterAddSet(fromName, set) {
        // Get repeated for set created for set
        let setRows = this.requestor.querySelectorAll(
                '[swac_setname="' + fromName + '"][swac_setid="' + set.id + '"]');
        for (let curSetRow of setRows) {
            // Get name bindpoint
            let nameElem = curSetRow.querySelector('[attrname="name"]');
            // Create icon for type
            let icon = new Icon();
            let upFileIco = icon.getIconElement(set.type);
            nameElem.parentNode.insertBefore(upFileIco, nameElem);
        }
    }

    /**
     * Generates an status table row for the given uploaded file information
     * 
     * @param {String} upFile File informations about uploaded file
     * @returns {undefined}
     */
    generateStatusTR(upFile) {
        Msg.warn('upload', 'Generate statusTR for uploadid: ' + upFile.uploadid);
        let resulttableElem = document.querySelector('.swac_uploadstatus');
        // Check if a old status exists
        let oldResultTR = resulttableElem.querySelector('#status_' + upFile.uploadid);
        if (oldResultTR !== null) {
            oldResultTR.parentNode.removeChild(oldResultTR);
        }

        // Create new row
        let statusTR = document.createElement("tr");
        statusTR.setAttribute("id", "status_" + upFile.uploadid);
        statusTR.upFile = upFile;
        resulttableElem.appendChild(statusTR);

        // file icon and name
        let upFileTD = document.createElement("td");
        // get mime type
        let mimetype = upFile.mimetype;
        if (typeof mimetype === 'undefined') {
            mimetype = upFile.type;
        }
        // get file icon
        let upFileIco = SWAC_icon.getIconElement(mimetype);
        upFileTD.appendChild(upFileIco);
        // File name
        let filename = upFile.filename;
        if (typeof filename === 'undefined') {
            filename = upFile.name;
        }

        let filenameElem = document.createTextNode(' ' + filename);
        // Add download link if was saved
        if (upFile.saved && typeof upFile.savePath !== 'undefined') {
            let fileLink = document.createElement('a');
            let outFilePath = upFile.savePath.replace('..\\docroot', '') + '\\' + upFile.filename;
            fileLink.setAttribute('href', outFilePath);
            fileLink.appendChild(filenameElem);
            upFileTD.appendChild(fileLink);
        } else {
            upFileTD.appendChild(filenameElem);
        }
        statusTR.appendChild(upFileTD);
        // Get upload status
        let fileUploaded = false;
        if (typeof upFile.filename !== 'undefined') {
            fileUploaded = true;
        }

        // Status cell
        let statusTD = document.createElement('td');
        statusTD.classList.add('statustd');
        // Uploaded icon
        let uploadedIcon = document.createElement("span");
        uploadedIcon.setAttribute("uk-icon", 'cloud-upload');
        if (fileUploaded) {
            uploadedIcon.setAttribute("uk-tooltip", 'title: ' + SWAC_language.upload.toupload);
            uploadedIcon.setAttribute('style', 'color: green');
        } else {
            uploadedIcon.setAttribute("uk-tooltip", 'title: ' + SWAC_language.upload.uploaded);
        }
        statusTD.appendChild(uploadedIcon);
        // Saved icon
        if (fileUploaded && upFile.saved) {
            let uploadedIcon = document.createElement("span");
            uploadedIcon.setAttribute("uk-icon", 'download');
            uploadedIcon.setAttribute("uk-tooltip", 'title: ' + SWAC_language.upload.saved);
            uploadedIcon.setAttribute('style', 'color: green');
            statusTD.appendChild(uploadedIcon);
        } else if (fileUploaded) {
            let uploadedIcon = document.createElement("span");
            uploadedIcon.setAttribute("uk-icon", 'download');
            uploadedIcon.setAttribute("uk-tooltip", 'title: ' + SWAC_language.upload.notsaved);
            uploadedIcon.setAttribute('style', 'color: red');
            statusTD.appendChild(uploadedIcon);
        }
        statusTR.appendChild(statusTD);

        // Add processing information
        let processingTD = document.createElement('td');
        processingTD.classList.add('processingtd');
        statusTR.appendChild(processingTD);

        if (fileUploaded && upFile.processed) {
            this.generateProcessingResultView(upFile);
        } else if (fileUploaded && upFile.fileHandlers !== null && typeof upFile.error === 'undefined') {
            if (upFile.fileHandlers.length === 0) {
                processingTD.innerHTML = SWAC_language.upload.noprocessoravailable;
            } else {
                // Create selection for processors
                let newProcessingTD = this.generateProcessingSelection(upFile.fileHandlers);
                processingTD.parentNode.replaceChild(newProcessingTD, processingTD);
            }
        } else if (fileUploaded && upFile.fileHandlers === null && typeof upFile.error === 'undefined') {
            // Request processing possibilities
            let posRequestor = {
                fromName: this.options.processingHandlersApi,
                fromWheres: {
                    savepath: upFile.savePath,
                    filename: upFile.filename
                }
            };
            SWAC_model.load(posRequestor).then(function (processors) {
                newProcessingTD = this.generateProcessingSelection(processors);
                processingTD.parentNode.replaceChild(newProcessingTD, processingTD);
            }).catch(function (error) {
                console.log('catched error: ' + error);
            });
        } else if (typeof upFile.error !== 'undefined') {
            // Create error symbol
            // Create error text
            let errTxt = document.createTextNode(SWAC_language.upload.notprocessed);
            processingTD.appendChild(errTxt);
            processingTD.appendChild(document.createElement('br'));
            let errMsg = document.createTextNode(upFile.error);
            processingTD.appendChild(errMsg);
        } else {
            if (!navigator.onLine)
            {
                let errTxt = document.createTextNode("Die Datei wurde erfolgreich gespeichert und wird automatisch hochgeladen, sobald wieder eine Netzwerkverbindung zur Verfügung steht.");
                processingTD.appendChild(errTxt);
            }

        }

        // Get old status row
        let statusId = 'status_' + upFile.uploadid;
        let oldStatusTR = document.getElementById(statusId);
        if (typeof oldStatusTR !== 'undefined' && oldStatusTR !== null) {
            // Update status
            oldStatusTR.parentElement.replaceChild(statusTR, oldStatusTR);
        }

        // List files got from output of file processor
        if (typeof upFile.outputFiles !== 'undefined') {
            for (let i = 0; i < upFile.outputFiles.length; i++) {
                let outputfile = upFile.outputFiles[i];
                outputfile.uploadid = upFile.uploadid + '_' + i;
                let subStatusTR = this.generateStatusTR(outputfile);
                // Add ident
                let firstTD = subStatusTR.querySelector('td');
                let firstChildOfTD = firstTD.firstChild;
                let identSpan = document.createElement('div');
                identSpan.classList.add('swac_upload_ident');
                firstTD.insertBefore(identSpan, firstChildOfTD);
                statusTR.parentNode.insertBefore(subStatusTR, statusTR.nextSibling);
            }
        }
        return statusTR;
    }

    /**
     * Creates a select box with all possible processors.
     * 
     * @param {type} processors Array of Objects with name and description attribute
     * @returns {Element|this.generateProcessingSelection.processingTD}
     */
    generateProcessingSelection(processors) {
        let processingTD = document.createElement('td');
        processingTD.classList.add('processingtd');
        let selectProcessorInfoElem = document.createTextNode(
                SWAC_language.upload.canbeprocessedby + " ");
        processingTD.appendChild(selectProcessorInfoElem);
        let selectProcessorElem = document.createElement('select');
        selectProcessorElem.classList.add('uk-select');
        selectProcessorElem.classList.add('uk-form-small');
        selectProcessorElem.classList.add('uk-form-width-small');
        for (let processor of processors) {
            let processorElem = document.createElement('option');
            processorElem.setAttribute('value', processor.name);
            processorElem.innerHTML = processor.name;
            processorElem.setAttribute('uk-tooltip', processor.description);
            selectProcessorElem.appendChild(processorElem);
        }
        processingTD.appendChild(selectProcessorElem);

        // Start processing button
        let startProcessingButton = document.createElement('button');
        startProcessingButton.classList.add('uk-button');
        startProcessingButton.classList.add('uk-button-default');
        startProcessingButton.classList.add('uk-form-small');
        startProcessingButton.setAttribute('uk-tooltip',
                SWAC_language.upload.startprocessing);
        let startProcessingIco = document.createElement('span');
        startProcessingIco.setAttribute('uk-icon', 'icon: cog');
        startProcessingButton.appendChild(startProcessingIco);
        startProcessingButton.addEventListener('click', this.onStartProcessing);
        processingTD.appendChild(startProcessingButton);
        return processingTD;
    }

    /**
     * Gets the actual data to send along with every request
     * 
     * @returns {Array} Array of dataobject to send with
     */
    getSendAlongData() {
        let sendAlongData = {};
        // Add information about target
        sendAlongData['targetURL'] = this.options.uploadTargetURL;
        sendAlongData['targetVar'] = this.options.uploadTargetVar;

        // Get values of bound SWAC components
        for (let curComp of this.options.dataComponents) {
            Msg.warn('Upload','Getting sendAlongData from >' + curComp.selector + '<');
            let curCompElem = document.querySelector(curComp.selector);
            // Check if comp is available
            if (!curCompElem) {
                let msg = 'Could not find component with sendAlongData >'
                        + curComp.selector + '<';
                Msg.error('Upload',
                        msg, this.requestor);
                throw msg;
            }
            // If it is a SWAC component get value
            if (curCompElem.hasAttribute("swa")) {
                let inputs = curCompElem.swac_comp.getInputs();
                if (inputs.length > 0) {
                    // Check if data to send with allowed
                    for (let valueObj in inputs) {
                        if (typeof curComp.requiredGt !== 'undefined'
                                && inputs[valueObj].value <= curComp.requiredGt) {
                            UIkit.modal.alert(curComp.requiredGtMessage);
                            return;
                        } else {
                            // Get name for sending
                            let attrName = curComp.sendAttribute;
                            if (!attrName) {
                                attrName = inputs[valueObj].name;
                            }
                            sendAlongData[attrName] = inputs[valueObj].value;
                        }
                    }
                } else if (curComp.required) {
                    UIkit.modal.alert(curComp.requiredMessage);
                    return;
                }
            } else {
                // Reading data from simple form fields
                let value = curCompElem.value;
                if(curCompElem.required && 
                        (value === "" || value === null)) {
                    let reqMsg = curComp.requiredMessage;
                    if(!reqMsg) {
                        reqMsg = SWAC_language.Upload.addatamissing;
                    }
                    UIkit.modal.alert(reqMsg);
                    return;
                }
                if(curCompElem.name === 'name') {
                    Msg.warn('Upload','You used an imput field >name< for sendAlongData. This will override the filename.');
                }
                sendAlongData[curCompElem.name] = value;
            }
        }
        return sendAlongData;
    }

    /**
     * Starts the processing of one file.
     * 
     * @param {DOMEvent} evt Event that starts the processing
     * @returns {undefined}
     */
    onStartProcessing(evt) {
        evt.preventDefault();

        // Search td element
        let selectParentElem = evt.target.parentElement;
        while (typeof selectParentElem.parentElement !== 'undefined'
                && selectParentElem.tagName.toLowerCase() !== 'td') {
            selectParentElem = selectParentElem.parentElement;
        }

        // Get status TR Element that stores file information
        let statusTRElem = selectParentElem.parentElement;
        let uploadid = statusTRElem.id;
        uploadid = uploadid.replace('status_', '');
        // Show processing icon
        this.generateProessingIcon(uploadid);

        // Get select elemet for processor
        let selectProcessorElem = selectParentElem.querySelector('select');
        let processor = selectProcessorElem.options[selectProcessorElem.selectedIndex].value;
        let sendalongData = this.getSendAlongData(this.requestor);

        // Build up datarequestor
        let dataRequestor = {
            fromName: this.options.processingExecutionApi,
            fromWheres: {
                savepath: statusTRElem.upFile.savePath,
                filename: statusTRElem.upFile.filename,
                filehandler: processor,
                uploadid: uploadid
            }
        };
        for (let sendalongobj of sendalongData) {
            dataRequestor.fromWheres[sendalongobj.name] = sendalongobj.value;
        }

        SWAC_model.load(dataRequestor).then(function (json) {
            this.generateProcessingResultView(json.data[0]);
        }).catch(function (error) {
            console.log('error:');
            console.log(error);
        });
    }

    /**
     * Generates a view out of a processing result
     * @param {Object} processedfile Object with fileinformation and processinformation
     * @returns {undefined}
     */
    generateProcessingResultView(processedfile) {
        let uploadid = processedfile.uploadid;
        Msg.warn('upload', 'Create processingResultView for uploadid: ' + uploadid);
        // Insert processed icon
        if (processedfile.processed) {
            this.generateProcessedIcon(uploadid);
        }
        let statusTR = document.getElementById('status_' + uploadid);
        let processingTD = statusTR.querySelector('.processingtd');
        let resultsAcord = document.createElement('ul');
        resultsAcord.setAttribute('uk-accordion', 'true');
        // Add information about each fileHandler and its status
        let i = 0;
        for (let curFileHandler of processedfile.fileHandlers) {
            let resLi = document.createElement('li');
            let headA = document.createElement('a');
            headA.classList.add('uk-accordion-title');
            headA.href = '#';
            let sucIco = 'close';
            let sucTxt = SWAC_language.upload.processingFailed;
            let sucCol = 'red';
            if (curFileHandler.processingSuccseed === true) {
                sucIco = 'check';
                sucTxt = SWAC_language.upload.processingSuccseed;
                sucCol = 'green';
            }
            let headsymb = document.createElement('span');
            headsymb.setAttribute('uk-icon', sucIco);
            headsymb.setAttribute('uk-tooltip', sucTxt);
            headsymb.setAttribute('style', 'color: ' + sucCol);
            headA.appendChild(headsymb);
            let headline = document.createTextNode(curFileHandler.name);
            headA.appendChild(headline);
            resLi.appendChild(headA);
            let contDiv = document.createElement('div');
            contDiv.classList.add('uk-accordion-content');
            if (i === 1) {
                resLi.classList.add('uk-open');
                i++;
            }
            resLi.appendChild(contDiv);
            let table = document.createElement('table');
            table.classList.add('uk-table');
            for (let j in curFileHandler.processingInformations) {
                let curProcInfo = curFileHandler.processingInformations[j];
                let curProcInfoAttrs = Object.keys(curProcInfo);
                let resultTR = document.createElement('tr');
                let resultNameTD = document.createElement('td');
                resultNameTD.innerHTML = curProcInfoAttrs[0];
                resultTR.appendChild(resultNameTD);
                let resultValTD = document.createElement('td');
                resultValTD.innerHTML = curProcInfo[curProcInfoAttrs[0]];
                resultTR.appendChild(resultValTD);
                table.appendChild(resultTR);
            }
            contDiv.appendChild(table);
            resultsAcord.appendChild(resLi);
        }
        processingTD.appendChild(resultsAcord);
        // Add error message
        if (typeof processedfile.error !== 'undefined') {
            let errImg = document.createElement('img');
            errImg.setAttribute('alt', SWAC_language.upload.erroroccured);
            errImg.setAttribute('src', '/SWAC/swac/components/icon/error.svg');
            errImg.setAttribute('width', '25');
            errImg.setAttribute('height', '25');
            processingTD.appendChild(errImg);
            let errMsg = document.createTextNode(processedfile.error);
            processingTD.appendChild(errMsg);
        }
    }

    /**
     * Creates a icon to show the user that the processing is going on
     * 
     * @param {String} uploadid ID of the processed file
     * @returns {undefined}
     */
    generateProessingIcon(uploadid) {
        Msg.warn('upload', 'Generate processingIcon for uploadid: ' + uploadid);
        let statusTR = document.getElementById('status_' + uploadid);
        let statusTD = statusTR.querySelector('.statustd');
        // Create icon
        let processingIcon = document.createElement("span");
        processingIcon.classList.add('swac_processing');
        processingIcon.setAttribute("uk-icon", 'cog');
        processingIcon.setAttribute("uk-tooltip", 'title: ' + SWAC_language.upload.processing);
        statusTD.appendChild(processingIcon);
    }

    /**
     * Generates a icon to show the user that the processing is done
     * 
     * @param {String} uploadid ID of the processed file
     * @returns {undefined}
     */
    generateProcessedIcon(uploadid) {
        Msg.warn('upload', 'Generate processedIcon for uploadid: ' + uploadid);
        let statusTR = document.getElementById('status_' + uploadid);
        let statusTD = statusTR.querySelector('.statustd');
        // Check if there is a processing icon
        let processingIco = statusTD.querySelector('.swac_processing');
        if (processingIco !== null) {
            processingIco.parentNode.removeChild(processingIco);
        }

        let processedIcon = document.createElement("span");
        processedIcon.setAttribute("uk-icon", 'cog');
        processedIcon.setAttribute("uk-tooltip", 'title: ' + SWAC_language.upload.processed);
        processedIcon.setAttribute('style', 'color: green');
        statusTD.appendChild(processedIcon);
    }

    showErrorMessage(msg) {
        UIkit.notification({
            message: msg,
            status: 'warning',
            pos: 'top-right',
            timeout: SWAC_config.notifyDuration
        });
    }
}