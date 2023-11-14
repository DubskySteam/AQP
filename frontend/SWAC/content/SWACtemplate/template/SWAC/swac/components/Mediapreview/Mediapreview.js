var MediapreviewFactory = {};
MediapreviewFactory.create = function (config) {
    return new Mediapreview(config);
};

/**
 * Component for present audio data
 */
class Mediapreview extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'Mediapreview';
        this.desc.text = 'Creates a preview for media files.';
        this.desc.depends[0] = {
            name: 'Mediacode.js',
            path: SWAC_config.swac_root + '/swac/components/Mediaplayer/Mediacode.js',
            desc: 'Class that creates DOM elements for media.'
        };
        this.desc.templates[0] = {
            name: 'mediapreview',
            style: 'mediapreview',
            desc: 'Shows a board with cards for each media and sorting and filtering options.'
        };
        this.desc.reqPerTpl[0] = {
            selc: '.swac_mediapreview_mediaarea',
            desc: 'Area where the media preview should be inserted.'
        };
        this.desc.reqPerTpl[1] = {
            selc: '.swac_mediapreview_filterarea',
            desc: 'Area where the filter options are placed.'
        };
        this.desc.reqPerTpl[2] = {
            selc: '.swac_mediapreview_filterattr',
            desc: 'Area that displays a filter attribute and there in the values where filtering for is possible.'
        };


        this.desc.optPerTpl[0] = {
            selc: 'swac_mediapreview_editbutton',
            desc: 'Button that opens the media editor. Automatically is hidden, when the option.mediaeditor is not set.'
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
            name: 'preview',
            desc: 'URL to preview file or base64 encoded dataurl preview content.'
        };
        this.desc.optPerSet[0] = {
            name: 'preview_mimetype',
            desc: 'Mimetype of the preview media. Only needed if it is other than the main mimetype.'
        };

        this.options.showWhenNoData = true;
        this.desc.opts[0] = {
            name: "mediaeditor",
            desc: "Id of the element where the mediaeditor should be displayed."
        };
        if (!options.onClickMediaEdit)
            this.options.onClickMediaEdit = null;
        this.desc.opts[1] = {
            name: "filteractive",
            desc: "Sets if the filter function should be active or not."
        };
        if (!options.filteractive)
            this.options.filteractive = true;

        // Load language file for mediacode
        SWAC_language.loadTranslationFile('../swac/components/Mediaplayer/langs/mediacode', 'Mediacode');

        // internal avalues
        this.mediafiles = 0;
        this.filters = {};
        this.size = 0;
        this.objscenes = [];
        this.objcameras = [];
        this.objrenderers = [];
        this.lastMtlData = null;
        this.lastMtlTitle = '';
        this.lastobjData = null;
        this.lastobjTitle = '';
        this.lastGlbData = null;
        this.lastGlbFile = null;
        this.lastBinFile = null;
        this.lastGlTFFile = null;
        this.lastGlTFFileContent = '';
    }

    init() {
        return new Promise((resolve, reject) => {


            // Create mediaview for each set
            for (let curSource in this.data) {
                for (let curSet of this.data[curSource]) {
                    if (curSet) {
                        this.mediafiles++;
                        this.createPreview(curSet);
                    }
                }
            }

            this.toggleMediaEditorButtons();
            this.buildFilter();

            resolve();

        });
    }

    /**
     *  Activate or deactivates mediaeditor button depending on the mediaeditor option.
     *  
     * @returns {undefined}
     */
    toggleMediaEditorButtons() {
        let mediaeditorButtons = this.requestor.querySelectorAll('.swac_mediapreview_editbutton');
        if (this.options.onClickMediaEdit) {
            Msg.warn('Mediapreview', 'Mediaeditor is set. Activateing edit buttons.');
            for (let curMeButton of mediaeditorButtons) {
                curMeButton.classList.remove('swac_dontdisplay');
                curMeButton.addEventListener('click', this.options.onClickMediaEdit.bind(this), false);
            }
        } else {
            Msg.warn('Mediapreview', 'Mediaeditor is not set. Deactivateing edit buttons.');
            for (let curMeButton of mediaeditorButtons) {
                curMeButton.classList.add('swac_dontdisplay');
            }
        }
    }

    /**
     * Function for createing media code
     * 
     * @param {Object} set Set with media information
     * @returns {undefined}
     */
    createPreview(set) {
        // Find area where to insert the mediacode
        let mediaarea = this.requestor.querySelector('[swac_setid="' + set.id + '"]');
        if (mediaarea === null) {
            Msg.error('Mediapreview', 'Repeated element for set >' + set.id + '< not found.', this.requestor);
            return null;
        }

        let mediaprearea = mediaarea.querySelector('.swac_mediapreview_mediaarea');

        // Use preview mediatype if available
        let mimetype = 'mimetype';
        if (set.preview_mimetype) {
            mimetype = 'preview_mimetype';
        }

        let mediacode = new Mediacode(this.data, set, 'preview', mimetype);

        console.log('mediacode:');
        console.log(mediacode);
//        
//        let mediacode;
//        // Call type depending preview insertion methods
//        if (mimetype.indexOf('image/') !== -1) {
//            mediacode = this.createImageCode(set);
//        } else if (set.mimetype.indexOf('video/') !== -1) {
//            mediacode = this.createVideoCode(set);
//        } else if(mimetype.indexOf('text/html')) {
//        } else if (mimetype.indexOf('application/wavefront-obj') !== -1) {
//            mediacode = this.createObjCode(set);
//        } else if (mimetype.indexOf('application/wavefront-mtl') !== -1) {
//            mediacode = this.createMtlCode(set);
//            // Support for gltf binary format (glb)
//        } else if (mimetype.indexOf('model/gltf+json') !== -1) {
//            mediacode = this.showGltfSingleFile(set);
//        } else if (mimetype.indexOf('model/gltf+json') !== -1) {
//            // Support for gltf format (only in combination with bin)
//            mediacode = this.loadGlTF(set);
//        } else if (mimetype.indexOf('model/gltf+binary') !== -1) {
//            mediacode = this.loadBin(set);
//        } else {
//            Msg.error('Mediapreview',
//                    'Mimetype >' + set.mimetype + '< is not supported.');
//        }
        mediaprearea.appendChild(mediacode.getMediaElement());

        // Add informations for filter if filter active
        if (this.options.filteractive) {
            // Add as data attributes for filter and searching
            for (let curAttr in set) {
                // Do not allow filtering after preview or id (its for each set different)
                if (curAttr !== 'preview' && curAttr !== 'id'
                        && !curAttr.startsWith('swac_')
                        && typeof set[curAttr] !== 'function') {
                    let curValue = set[curAttr];
                    mediaarea.setAttribute(curAttr, curValue);
                    // Creater filter attribute
                    if (!this.filters[curAttr]) {
                        this.filters[curAttr] = new Map();
                    }
                    // Create filter value
                    let count = this.filters[curAttr].get(curValue);
                    if (!count) {
                        count = 0;
                    }
                    count++;
                    this.filters[curAttr].set(curValue, count);
                }
            }
        }
    }

    /**
     * Creates code for display obj files
     * DEVNOTE: Not completed yet
     * 
     * @param {type} data
     * @param {type} title
     * @returns {undefined}
     */
    showObj(data, title) {

        $('#mediapreview li:last div').attr('id', title);

//	var obj2gltf = require('obj2gltf');
//obj2gltf('model.obj')
//    .then(function(gltf) {
//       console.log(gltf.asset);
//    });

        this.lastObjFile = data;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(200, 200);

        var container = document.createElement('div');
        container.id = title;
        container.className = 'mediapreview';
        $('#mediapreview li:last div').append(container);
        container.appendChild(renderer.domElement);

        camera.position.z = 15;

        // Load obj file
        var loader = new THREE.OBJLoader();
        loader.load(
                data,
                function (object) {
                    scene.add(object);
                }
        );

        // Add direct light
        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(100, 100, 50);
        scene.add(dirLight);

        var render = function () {
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        };

        render();
    }

    showObjWithMtl(objFile, mtlFile) {
        alert('Sorry no support for obj with mtl file until now.');
    }

    /**
     * Shows an glTF File in preview
     * DEV NOTE: Not up to date code
     */
    loadGlTF(data, title) {
        // Decode glTFFileContent from base64 encoding
        this.lastGlTFFileContent = data;
        this.lastGlTFFileContent = atob(this.lastGlTFFileContent.replace("data:application/octet-stream;base64,", ""));

        // Show uploaded glTF if bin data is embedded
        if (this.lastGlTFFileContent.indexOf('"uri": "data:application/octet-stream;base64,') !== -1) {
            this.showGltfSingleFile(data, title);
        } else {
            this.lastGlTFFile = glTFFile;

            // Create upload placeholder
            $('#mediapreview li:last div').attr('id', mediapreview.lastGlTFFile.name.replace('.', '_'));
            $('#mediapreview li:last div').css('font-size', '250%');
            $('#mediapreview li:last div').html('.gltf');
        }

        // Show uploaded glTF if bin is allready uploaded
        if (this.lastBinFile !== null) {
            this.showGlTFWithBin();
        }
    }

    urltoFile(url, filename, mimeType) {
        return (fetch(url)
                .then(function (res) {
                    return res.arrayBuffer();
                })
                .then(function (buf) {
                    return new File([buf], filename, {type: mimeType});
                })
                );
    }

    /**
     * Creates an preview for an glb (gltf binary format) and embedded gltf file
     * 
     * DEV NOTE: Not up to date code
     */
    showGltfSingleFile(data, title) {
        $('#mediapreview li:last div').attr('id', 'cesium_' + title.replace('.', '_') + '_Container');
        $('#mediapreview li:last div').addClass('mediapreview');

        // Create viewer instance
        var viewer = new Cesium.Viewer('cesium_' + title.replace('.', '_') + '_Container', {
            imageryProvider: Cesium.createOpenStreetMapImageryProvider({
                url: 'https://a.tile.openstreetmap.org/'
            }),
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: true
        });

        // Enable lighting otherwise some models contain dark
        viewer.scene.globe.enableLighting = true;

        var position = Cesium.Cartesian3.fromDegrees(8.904158, 52.296365, 0.0);
        var heading = Cesium.Math.toRadians(135);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        var entity = viewer.entities.add({
            name: title.replace('.', '_'),
            position: position,
            orientation: orientation,
            model: {
                uri: data,
                minimumPixelSize: 128,
                maximumScale: 20000
            }
        });
        viewer.trackedEntity = entity;

        $('.cesium-viewer-animationContainer').css('display', 'none');
    }

    /**
     * Creates an placeholder for uploaded bin file
     * DEV NOTE: Not up to date code
     */
    loadBin(binFile) {
        this.lastBinFile = binFile;
        $('#mediapreview li:last div').attr('id', mediapreview.lastBinFile.name.replace('.', '_'));
        $('#mediapreview li:last div').css('font-size', '250%');
        $('#mediapreview li:last div').html('.bin');

        // Show uploaded binFile if glTF is allready uploaded
        if (this.lastGlTFFile !== null) {
            this.showGlTFWithBin();
        }
    }

    /**
     * Show gltf with extra bin file.
     * DEV NOTE: Not up to date code
     */
    showGlTFWithBin() {
        // Remove placeholder for uploaded single files
        $('#' + this.lastGlTFFile.name.replace('.', '_')).parent().remove();
        $('#' + this.lastBinFile.name.replace('.', '_')).parent().remove();

        var htmlGrid = "<li class=\"uk-grid-margin\"><div class=\"uk-panel uk-panel-box\">";
        htmlGrid += '<div class="uk-card uk-card-default uk-card-body">';
        htmlGrid += '<div id="cesium_' + this.lastGlTFFile.name.replace('.', '_') + '_Container"></div>';
        htmlGrid += "</div>";
        htmlGrid += "</li>";
        $('#mediapreview').append(htmlGrid);

        var viewer = new Cesium.Viewer('cesium_' + mediapreview.lastGlTFFile.name.replace('.', '_') + '_Container', {
            imageryProvider: Cesium.createOpenStreetMapImageryProvider({
                url: 'https://a.tile.openstreetmap.org/'
            }),
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: true
        });

        // Enable lighting otherwise some models contain dark
        viewer.scene.globe.enableLighting = true;

        var position = Cesium.Cartesian3.fromDegrees(8.904158, 52.296365, 0.0);
        var heading = Cesium.Math.toRadians(135);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        var gltf_bloburl = window.URL.createObjectURL(this.lastGlTFFile);
        //console.log("gltf_bloburl: " + gltf_bloburl);

        var entity = viewer.entities.add({
            name: this.lastGlTFFile.name.replace('.', '_'),
            position: position,
            orientation: orientation,
            model: {
                uri: this.lastGlTFFileContent,
                minimumPixelSize: 128,
                maximumScale: 20000
            }
        });
        viewer.trackedEntity = entity;

        $('.cesium-viewer-animationContainer').css('display', 'none');

        this.lastGlTFFile = null;
        this.lastGlTFFileContent = '';
        this.lastBinFile = null;
    }

    /**
     * Build the filter controls
     * 
     * @returns {undefined}
     */
    buildFilter() {
        // Do not show filters to user, where the data is equal on every set
        for (let filter in this.filters) {
            if (this.filters[filter].size === 1) {
                delete this.filters[filter];
                Msg.warn('Mediapreview', 'No filter option for >' + filter + '< because every set has the same value');
            }
        }

        this.filterrefers = {};

        let filterarea = this.requestor.querySelector('.swac_mediapreview_filterarea');
        let filterattrElem = filterarea.querySelector('.swac_mediapreview_filterattr');
        // Build filter for every filterable value
        for (let curFilterAttr in this.filters) {
            let curFilterAttrElem = filterattrElem.cloneNode(true);
            curFilterAttrElem.classList.remove('swac_dontdisplay');
            let curFilterNameElem = curFilterAttrElem.querySelector('.swac_mediapreview_filterattrname');
            curFilterNameElem.innerHTML = curFilterAttr;
            let filterValueElem = curFilterAttrElem.querySelector('[uk-filter-control]');
            // Create option for each fitlervalue
            for (let filtervalue of this.filters[curFilterAttr].keys()) {
                if (!filtervalue)
                    continue;
                if (typeof filtervalue === 'string' && filtervalue.indexOf('ref://') === 0) {
                    if (typeof this.filterrefers[filtervalue] === 'undefined') {
                        let refObjPromise = SWAC_model.getFromReference(filtervalue);
                        this.filterrefers[filtervalue] = refObjPromise;
                        refObjPromise.then(function (data) {
                            let refLink = document.querySelector('[filterval="' + data.referencedBy + '"]');
                            refLink.innerHTML = data.name;
                        });
                    }
                }
                let curFilterValueElem = filterValueElem.cloneNode(true);
                curFilterValueElem.setAttribute('uk-filter-control', "filter: [" + curFilterAttr + "='" + filtervalue + "']; group: " + curFilterAttr);
                let filterDivUlLiA = curFilterValueElem.querySelector('a');
                filterDivUlLiA.setAttribute('filterval', filtervalue);
                filterDivUlLiA.innerHTML = filtervalue;
                filterValueElem.parentNode.insertBefore(curFilterValueElem, filterValueElem);
            }
            // Add filter control for elements with this attribute missing
            let misFilterValueElem = filterValueElem.cloneNode(true);
            misFilterValueElem.setAttribute('uk-filter-control', "filter: :not([" + curFilterAttr + "]); group: " + curFilterAttr);
            let filterDivUlLiA = misFilterValueElem.querySelector('a');
            filterDivUlLiA.innerHTML = SWAC_language.Mediapreview.filterwithout;
            filterValueElem.parentNode.insertBefore(misFilterValueElem, filterValueElem);

            // Remove template
            filterValueElem.parentNode.removeChild(filterValueElem);
            filterattrElem.parentNode.appendChild(curFilterAttrElem);
        }
    }
}