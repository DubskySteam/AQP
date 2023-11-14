/*
 * Class with functions for debugging
 */

class WorldmapDebug {
    constructor(worldmap) {
        this.worldmap = worldmap;
        this.worldmap.viewer.extend(Cesium.viewerCesiumInspectorMixin);

        // Debug coordinate cross
        this.worldmap.viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
            modelMatrix: Cesium.Matrix4.IDENTITY,
            length: 30000000.0,
            width: 5.0
        }));
    }

    /**
     * Toggles the position label funtion on or off
     *
     * @returns {undefined}
     */
    togglePositionLabel() {
        let handler = new Cesium.ScreenSpaceEventHandler(this.worldmap.viewer.scene.canvas);
        handler.setInputAction(this.showPositionLabel.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    /**
     * Shows an label with positioning information, that follows the mouse
     *
     * @param {type} movement
     * @returns {undefined}
     */
    showPositionLabel(movement) {
        // Get the tooltip box
        let tooltipbox = document.querySelector('.swac_worldmap_tooltip');

        let cartesian = this.worldmap.viewer.camera.pickEllipsoid(movement.endPosition, this.worldmap.viewer.scene.globe.ellipsoid);
        if (cartesian) {
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            let longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
            let latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
            let heightString = cartographic.height.toFixed(2);

            // Display tooltipbox
            tooltipbox.classList.remove('swac_dontdisplay');
            tooltipbox.style.bottom = this.worldmap.viewer.canvas.clientHeight - (movement.endPosition.y + 5) + 'px';
            tooltipbox.style.left = (movement.endPosition.x + 5) + 'px';

            // Pick a new feature
            let pickedFeature = this.worldmap.viewer.scene.pick(movement.endPosition);
            if (!pickedFeature) {
                let tooltipValElem = tooltipbox.querySelector('.swac_worldmap_tooltip_value');
                tooltipValElem.classList.add('swac_dontdisplay');
            }

            // Show position area
            let posElem = tooltipbox.querySelector('.swac_worldmap_tooltip_position');
            posElem.classList.remove('swac_dontdisplay');

            let lonoutElem = tooltipbox.querySelector('.swac_worldmap_lonout');
            let latoutElem = tooltipbox.querySelector('.swac_worldmap_latout');
            let heightoutElem = tooltipbox.querySelector('.swac_worldmap_heightout');
            if (lonoutElem) {
                lonoutElem.innerHTML = longitudeString;
            }
            if (latoutElem) {
                latoutElem.innerHTML = latitudeString;
            }
            if (heightoutElem) {
                heightoutElem.innerHTML = heightString;
            }
        } else {
            // Hide tooltip
            tooltipbox.classList.add('swac_dontdisplay');
        }
    }
}
