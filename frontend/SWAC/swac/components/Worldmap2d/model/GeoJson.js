import Msg from '../../../Msg.js';
import MapModel from './MapModel.js';
/*
 * Class for representing geo json
 */
export default class GeoJson extends MapModel {
    /**
     * Creates a new geojson model
     *
     * @param {HTMLElement} requestor Presentation requestion element
     * @param {Object} options Visualisation options. Supported options are:
     * - extrudeHeightProperty Name of the value in the geojson object, that should be
     * used to calculate the extrusion height.
     * - fillColor Default color (css string or rgba hex code) of models (white if no setting is given)
     * - outlineColor Default color of models border (black if no setting is given)
     * - outlineWidth Width of the outline (1 if no setting is given)
     * - fillColorProperty Property from data that should be used as color for the model
     * - outlineColorProperty Property from data that should be used as color for the models outline
     * - datacaptionProperty Name of the property that's value should be used for the caption
     * - datadescription SWAC_datadescription component with descdata describing the data
     * If the datadescription is set all property names are evaluated against the
     * datadescription data, if this failes the fallback is to use the data from the model.
     * 
     * @returns {Model}
     */
    constructor(requestor, options) {
        super(requestor, options);
        this._drawnref = {
            subs: []  // List of entities drawn by the last called draw()
        };
    }

    /**
     * Gets the name of the model as it is defined inside the model data
     * Calculates the name out of the location data given.
     *
     * @return {String} Name of the model, or null if the data does not contains one
     */
    get modelname() {
        return null;
    }

    /**
     * Extended json loading for datalist and dataset oriented json data.
     *
     * @param {String} filepath Path to the file to load
     * @returns {Promise} Resolves when the model is loaded
     */
    load(filepath) {
        this._filepath = filepath;
        let thisRef = this;
        return new Promise((resolve, reject) => {
            super.loadJson(filepath).then(function () {
                let lastSlashPos = filepath.lastIndexOf("/");
                let startGeoPos = filepath.indexOf('.geojson');
                let fileName = filepath.substring(lastSlashPos + 1, startGeoPos);
                thisRef._locations = [];

                for (let featureNo in thisRef.file.data.features) {
                    let feature = thisRef.file.data.features[featureNo];
                    // Check if the feature have locations
                    if (feature.properties && feature.properties.locations) {
                        for (let locationId in feature.properties.locations) {
                            let location = feature.properties.locations[locationId];
                            // Check if feature has a title
                            if (!location.title && feature.properties && feature.properties.title) {
                                location.title = feature.properties.title;
                            } else if (!location.title) {
                                location.title = fileName + '[' + featureNo + ']';
                            }

                            // Check if feature has a description
                            if (!location.description && feature.properties && feature.properties.description) {
                                location.description = feature.properties.description;
                            }
                            thisRef._locations.push(location);
                        }
                    }
                }

                resolve();
            }).catch(function (error) {
                Msg.error('GeoJson', 'Error occured while loading >'
                        + filepath + '< ' + error);
                reject();
            });
        });
    }

    /**
     * Draws the model to the cesium globe
     *
     * @param {CesiumViewer} viewer Viewer instance of cesium
     * @returns {Promise} Resolves with the cesium model reference when the model is drawn
     */
    draw(viewer) {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            // Check if model was drawn before
            if (thisRef._drawnref.subs.length > 0) {
                resolve(thisRef._drawnref);
                return;
            }
            let layerParts = [];
            for (let curFeature of thisRef.file.data.features) {
                // Get styles
                let datadescComp = null;
                let style = null;
                if (thisRef.options.datadescription) {
                    datadescComp = thisRef.options.datadescription.swac_comp;
                } else {
                    Msg.warn('GeoJson', 'There is no description component bound and no visoptions set. Model will be colored with default values.');
                    style = {
                        color: thisRef.options.outlineColor,
                        weight: thisRef.options.outlineWidth,
                        fillColor: thisRef.options.fillColor
                    };
                }
                // Check if property for color is defined and existing
                if (thisRef.options.fillColorProperty
                        && curFeature._properties[thisRef.options.fillColorProperty]) {
                    if (datadescComp) {
                        style.fillColor = datadescComp.getValueColor(curFeature._properties, null, thisRef.options.fillColorProperty);
                    } else {
                        // Use value as coloring value
                        style.fillColor = curFeature._properties[thisRef.options.fillColorProperty];
                    }
                } else if (datadescComp) {
                    style.fillColor = datadescComp.getValueColor(curFeature._properties, null, null);
                }
                // Check if property for color is defined and existing
                if (thisRef.options.outlineColorProperty
                        && curFeature._properties[thisRef.options.outlineColorProperty]) {
                    style.color = curFeature._properties[thisRef.options.outlineColorProperty];
                    if (datadescComp) {
                        let outlinedd = datadescComp.getValueColor(curFeature._properties, null, thisRef.options.outlineColorProperty);
                        if (outlinedd !== null) {
                            style.color = outlinedd;
                        }
                    }
                } else if (datadescComp) {
                    style.color = datadescComp.getValueColor(curFeature._properties, null, null);
                }
                // Set name of the model
                let modelName = null;
                if (thisRef.options.datacaptionProperty
                        && thisRef.options.datacaptionProperty !== null
                        && curFeature._properties[thisRef.options.datacaptionProperty]) {
                    modelName = curFeature._properties[thisRef.options.datacaptionProperty];
                    if (datadescComp) {
                        let modelNamedd = datadescComp.getValueVisData(curFeature._properties, 'desc', null, thisRef.options.extrudeHeightProperty);
                        if (modelNamedd !== null) {
                            modelName = modelNamedd;
                        }
                    }
                }
                let onEachFeature = function () {};
                if (modelName) {
                    onEachFeature = function (feature, layer) {
//                    if (feature.properties && feature.properties.popupContent) {
                        layer.bindPopup(modelName);
//                    }
                    };
                }

                // Add to map
                layerParts.push(L.geoJSON(curFeature, {
                    style: style,
                    onEachFeature: onEachFeature
                }));
            }
            let layergroup = L.layerGroup(layerParts);
            this._requestor.swac_comp.layerControl.addOverlay(layergroup, this.options.name ? this.options.name : this.options.url);
            layergroup.addTo(viewer);

            // Zoom into view
            if (thisRef.options.zoomTo) {
                viewer.fitBounds(layerParts[layerParts.length - 1].getBounds());
            }
        });
    }

    /**
     * Removes an ground object from the map
     *
     * @param {CesiumViewer} viewer Viewer from which to remove
     * @returns {undefined}
     */
    erase(viewer) {
        for (let curEntityref of this._drawnref.subs) {
            viewer.entities.remove(curEntityref);
        }
        this._drawnref.subs = [];
    }
}

