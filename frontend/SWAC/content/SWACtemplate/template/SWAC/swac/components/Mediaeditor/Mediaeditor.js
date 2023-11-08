var MediaeditorFactory = {};
MediaeditorFactory.create = function (config) {
    return new Mediaeditor(config);
};

/**
 * Component for editing media
 */
class Mediaeditor extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'Mediaeditor';
        this.desc.text = 'Creates an editor for media files. Allows to create annotations on images.';
        this.desc.templates[0] = {
            name: 'mediaeditor',
            style: 'mediaeditor',
            desc: 'Shows a media and contains areas for plugins.'
        };
        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'The attribute id is required for the component to work properly.'
        };
        this.desc.reqPerSet[1] = {
            name: 'mimetype',
            desc: 'Mimetype of the media.'
        };
        this.desc.reqPerSet[2] = {
            name: 'path',
            desc: 'URL to media file or base64 encoded dataurl media content.'
        };

        this.options.showWhenNoData = true;



        this.plugins.set('mediatags', {
            active: false
        });
        this.plugins.set('mediaanalysis', {
            active: false
        });
//        this.plugins.set('mediareference', {
//            active: true
//        });
//        this.plugins.set('objectreference', {
//            active: true
//        });

    }

    init() {
        return new Promise((resolve, reject) => {
            for (let curSource in this.data) {
                for (let curSet of this.data[curSource]) {
                    if (curSet)
                        this.createMediaEditor(curSource, curSet);
                }
            }

            // Open first media
            let switcherElem = this.requestor.querySelector('[uk-switcher]');
            if (switcherElem) {
                UIkit.switcher(switcherElem).show(1);
            }

            resolve();
        });
    }

    /**
     * Function for createing media code
     * 
     * @param {String} fromName Name of the medias source
     * @param {Object} set Set with media information
     * @returns {undefined}
     */
    createMediaEditor(fromName, set) {
        let editorPromise;
        // Call type depending preview insertion methods
        if (set.mimetype.indexOf('image/') !== -1) {
            editorPromise = this.createImageEditor(fromName, set);
        } else if (set.mimetype.indexOf('video/') !== -1) {
            editorPromise = this.createVideoEditor(fromName, set);
        } else {
            Msg.error('Mediaeditor', "Mimetype >" + set.mimetype + "< is not supported.");
            editorPromise = this.createUnsupportedEditor(fromName, set);
        }

        let thisRef = this;
        editorPromise.then(function (editorElem) {
            let mediaeditorElems = thisRef.requestor.querySelectorAll('.swac_repeatedForSet[swac_setname="' + fromName + '"][swac_setid="' + set.id + '"]');
            let mediaContentAreaFound = false;
            for (let curMediaeditorElem of mediaeditorElems) {

                let mediaContentArea = curMediaeditorElem.querySelector('.swac_mediacontent');
                if (mediaContentArea) {
                    mediaContentArea.appendChild(editorElem);
                    mediaContentAreaFound = true;
                }
            }
            if (!mediaContentAreaFound) {
                Msg.error('Mediaeditor', 'Could not find element with class >swac_mediacontent<');
            }
        }).catch(function (error) {
            Msg.error('Mediaeditor', 'Could not create editor for >' + fromName + '/' + set.id + '<: ' + error);
        });
    }

    /**
     * Generates html code for image display
     * 
     * @param {String} fromName Name of the medias source
     * @param {Object} set Set with media information
     * @returns {undefined}
     */
    createImageEditor(fromName, set) {
        return new Promise((resolve, reject) => {
            Msg.warn('Mediaeditor', 'Create imageEditor for >' + set.id + '<');
            let img = new Image();
            img.onload = function () {
                // Create canvas element
                let mediaCanvas = document.createElement('canvas');
                mediaCanvas.setAttribute('class', 'swac_medialayer');
                mediaCanvas.setAttribute('style', 'border: 1px solid black;');

                // Get size of the window
                let winWidth = window.innerWidth - 2; // -2 accounts for the border
                let winHeight = window.innerHeight - 2;
                let widthScale = 1;
                let heightScale = 1;
                let imgWidth = img.width;
                let imgHeight = img.height;

                // If picture is widher than screen
                if (winWidth < imgWidth) {
                    widthScale = winWidth / imgWidth;
                    imgWidth = imgWidth * widthScale;
                    imgHeight = imgHeight * widthScale;
                }
                if (winHeight < imgHeight) {
                    heightScale = winHeight / imgHeight;
                    imgWidth = imgWidth * heightScale;
                    imgHeight = imgHeight * heightScale;
                }

                let scale = imgWidth / img.width;

                mediaCanvas.setAttribute('height', imgHeight);
                mediaCanvas.setAttribute('width', imgWidth);
                mediaCanvas.setAttribute('scale', scale);
                mediaCanvas.setAttribute('swac_setname', fromName);
                mediaCanvas.setAttribute('swac_setid', set.id);

                var ctx = mediaCanvas.getContext("2d");
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);

                resolve(mediaCanvas);
            };
            img.src = set.path;
        });
    }

    /**
     * Generates html code for video display
     * 
     * @param {String} fromName     Name of the medias source
     * @param {Object} set          Objet with video data
     * @returns {undefined}
     */
    createVideoEditor(fromName, set) {
        return new Promise((resolve, reject) => {
            let videoElem = document.createElement('video');
            videoElem.setAttribute('class', 'swac_medialayer');
            let videoSourceElem = document.createElement('source');
            videoSourceElem.src = set.path;
            videoSourceElem.type = set.mimetype;
            videoSourceElem.setAttribute('swac_setname', fromName);
            videoSourceElem.setAttribute('swac_setid', set.id);
            videoElem.appendChild(videoSourceElem);

            resolve(videoElem);
        });
    }

    /**
     * Generates html code for display a not supported media type message
     * 
     * @param {String} fromName     Name of the medias source
     * @param {Object} set          Objet with video data
     * @returns {undefined}
     */
    createUnsupportedEditor(fromName, set) {
        return new Promise((resolve, reject) => {
            let supportMsgArea = document.createElement('div');
            let supportMsg = document.createElement('h1');
            let errorMsg = SWAC_language.Mediaeditor.mediatype_unsupported;
            errorMsg = SWAC_language.replacePlaceholders(errorMsg, 'mimetype', set.mimetype);
            supportMsg.innerHTML = errorMsg;
            supportMsgArea.appendChild(supportMsg);
            resolve(supportMsgArea);
        });
    }

    /**
     * Function for adding an media set after initilizing
     * 
     * @param {String} fromName Name of the datasource
     * @param {Object} set Set with media information
     * @returns {undefined}
     */
    afterAddSet(fromName, set) {
        console.log("AfterAddSet!");
//        this.createMediaEditor(fromName, set);

//        // Add set to buffer if it contains an full resolution
//        if (typeof set.media !== 'undefined') {
//            this.mediaBuffer[set.id] = set;
//        }
//
//        //TODO make reference to mediaeditorElem dynamic
//        let mediaeditorElem = document.getElementById('swac_mediaeditor');
//
//        // Get requestor
//        let requestor = document.querySelector('div [swa="swac_mediaeditor"]');
//
//        // Remove old canvas layers
//        //TODO move clear functions to clear method
//        let canvasLayers = mediaeditorElem.querySelectorAll('canvas');
//        for (let canvasLayer of canvasLayers) {
//            canvasLayer.parentNode.removeChild(canvasLayer);
//        }
//
//        // Clear shown plugins
//        this.plugins.unload(requestor);
//
//        // Create an modal dialog from mediaeditor
//        if (this.options.usemodal) {
//            UIkit.modal(mediaeditorElem).show();
//            //TODO remove this Workaround for UIkit bug that moves the modal alement to end of page
//            requestor.appendChild(mediaeditorElem);
//        }
//
//        //TODO move the functionallity of adding an set after bind from data time
//        // into core
//
//        //TODO replace bindPoint with data
//        for (let curDataName in set) {
//            // Search bindPoint for data
//            if (typeof requestor.swac_notBindedPoints[curDataName] !== 'undefined') {
//                let curBindPoints = requestor.swac_notBindedPoints[curDataName];
//                for (let i in curBindPoints) {
//                    let curBindPoint = curBindPoints[i];
//                    curBindPoint.dataset = set;
//                    curBindPoint.attrmetadata = {
//                        fromName: 'mediaeditor',
//                        setNo: set.id,
//                        attrName: curBindPoint.name
//                    };
//                    SWAC_bind.addBinding(curBindPoint);
//                }
//            }
//        }
//        //TODO in core: use bindPoints instead of replaceing
//        //TODO in core: handle bindPoints in attributes aswell
//
//        this.currentMedia = set;
//        this.currentImage = new Image();
//        this.currentImage.onload = function () {
//            // Expecting only one mediacontent area

//
//            // Get mediaeditor plugins
//            //TODO resolve this workaround
//            let editorElem = document.getElementById('swac_mediaeditor');
//            editorElem.swac_comp = requestor.swac_comp;
//            let plugins = this.plugins.loadPlugins(set, editorElem);
//        };
//        this.currentImage.src = set.media;
//        this.mediaidShownInEditor = set.id;
    }

//*************************************
// Canvas layer functions
//*************************************

    /**
     * Gets the area for the given sourcename and set where the media is displayed in
     * 
     * @param {String} fromName
     * @param {Long} setid
     * @returns {DOMElement}
     */
    getMediaContArea(fromName, setid) {
        // Get base media
        let mediaAreas = this.requestor.querySelectorAll(
                '[swac_setname="' + fromName + '"][swac_setid="' + setid + '"]');
        if (mediaAreas.length < 1) {
            Msg.error('Mediaeditor', 'Could not find mediaArea for >setname=' + fromName + ', setid=' + setid + '<');
            return null;
        }
        // Search the area containing the media
        let mediaContArea = null;
        for (let curMediaArea of mediaAreas) {
            mediaContArea = curMediaArea.querySelector('.swac_mediacontent');
            if (mediaContArea) {
                break;
            }
        }

        return mediaContArea;
    }

    /**
     * Creates a new layer for drawing
     * 
     * @param {String} fromName Name of the media sets source
     * @param {Long} setid Media datasets id
     * @returns {Element|Mediaeditor.createDrawingLayer.canvasLayer}
     */
    createDrawingLayer(fromName, setid) {
        // Search the area containing the media
        let mediaContArea = this.getMediaContArea(fromName, setid);

        //Create layer
        let canvasLayer = document.createElement('canvas');
        canvasLayer.classList.add('swac_drawlayer');

        // Get height and widht of media
        let mediaHeight;
        let mediaWidth;
        let imgCanvas = mediaContArea.querySelector('canvas');
        if (imgCanvas) {
            mediaHeight = imgCanvas.height;
            mediaWidth = imgCanvas.width;
        }
        let vidElem = mediaContArea.querySelector('video');
        if (vidElem) {
            mediaHeight = vidElem.videoHeight;
            mediaWidth = vidElem.videoWidth;
        }

        // Set size of the layer
        canvasLayer.setAttribute('height', mediaHeight);
        canvasLayer.setAttribute('width', mediaWidth);
        // Set identifiing attributes
        canvasLayer.setAttribute('swac_setname', fromName);
        canvasLayer.setAttribute('swac_setid', setid);

        // Add layer to mediacontent area
        mediaContArea.appendChild(canvasLayer);

        return canvasLayer;
    }

    /**
     * Creates an new layer with image. The given image will be stretched over 
     * the main image.
     * 
     * @param {object} mediaObj Object with media information
     */
    createImageLayer(mediaObj) {
        return new Promise((resolve, reject) => {
            // Check if canvas layer for media exists
            let oldLayer = this.getCanvasLayerForMedia(mediaObj);
            if (oldLayer !== null) {
                resolve(oldLayer);
                return;
            }

            //Create image
            let image = new Image();
            image.onload = function () {
                // Calculate scale values so that the given mediaObj matches the currentMedia
                let scaleFactorHeight = this.currentImage.height / image.height;
                let scaleFactorWidth = this.currentImage.width / image.width;

                //Create layer
                let canvasLayer = document.createElement('canvas');
                canvasLayer.classList.add('swac_medialayer_' + mediaObj.id);
                canvasLayer.classList.add('swac_medialayer');
                canvasLayer.setAttribute('height', this.currentImage.height);
                canvasLayer.setAttribute('width', this.currentImage.width);
                let ctx = canvasLayer.getContext("2d");
                ctx.scale(scaleFactorHeight, scaleFactorWidth);
                ctx.drawImage(image, 0, 0);
                // Add layer to available layers
                canvasLayer.media = mediaObj;
                resolve(canvasLayer);
            };
            image.src = mediaObj.media;
        });
    }

//***************************
// Drawing functions
//***************************

    /**
     * Clears the canvas layer
     * 
     * @param {DOMCanvas} canvas Canvas element to clear
     * @returns {undefined}
     */
    clearCanvasLayer(canvas) {
        // Get draw context from canvas
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

//***************************
// Positioning functions
//***************************

    /**
     * Returns the position of the mouse mapped to media coordinates.
     * 
     * @param {DOMEvent} evt a mousemove event
     * @returns {Object} Object with pos_x and pos_y, null if mouse is outside
     * the media.
     */
    getMousePositionOnMedia(evt) {
        // Check if the mouse is over a element that is a medialayer
        if (evt.target.classList.contains('swac_drawlayer')
                || evt.target.classList.contains('swac_medialayer')) {
            let box = evt.target.getBoundingClientRect();
            let posOnMediaX = Math.round(evt.clientX - box.left);
            let posOnMediaY = Math.round(evt.clientY - box.top);

            let mousepos = {
                pos_x: posOnMediaX,
                pos_y: posOnMediaY,
                target: evt.target
            };
            return mousepos;
        }
        return null;
    }

    /**
     * Calculates the position of a point on a draw layer into the positon of
     * that point of the original media.
     * 
     * @param {Object} point Point with x and y attribute
     * @param {DOMElement} layer Element where the swac_medialayer is in
     * @returns {Object} Object with transformed x and y
     */
    convertDrawPointToMediaPoint(point, layer) {
        // Get medialayer
        let mediaLayer = layer.parentElement.querySelector('.swac_medialayer');
        let scale = mediaLayer.getAttribute('scale');
        return {
            x: Math.round(point.x / scale),
            y: Math.round(point.y / scale)
        };
    }
}