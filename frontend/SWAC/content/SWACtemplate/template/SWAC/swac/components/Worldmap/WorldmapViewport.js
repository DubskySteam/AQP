/* 
 * Class with functions for easy access of viewport parameters
 */

class WorldmapViewport {

    constructor(worldmap) {
        this.worldmap = worldmap;
    }

    /**
     * Gets the distance to the ground from the current camera position
     * 
     * @returns {Double} Distance to the ground in meters
     */
    getDistanceToGround() {
        let cameraPosition = this.worldmap.viewer.scene.camera.positionWC;
        let ellipsoidPosition = this.worldmap.viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
        return Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(cameraPosition, ellipsoidPosition, new Cesium.Cartesian3()));
    }

    /**
     * Gets current cams viewport. The viewport has following attributes:
     * - north North end line in WGS84 latitude
     * - south Sourch end line in WGS84 latitude
     * - west West end line in WGS84 longitude
     * - east East end line in WGS84 longitude
     * - height Hight above ground in meter
     * - center_lat Latitude of the center point
     * - center_lon Longitude of the center point
     *
     * @returns {Worldmap.getViewport.viewport}
     */
    getViewport() {
        var result = {};
        var rect = this.worldmap.viewer.camera.computeViewRectangle(this.worldmap.viewer.scene.globe.ellipsoid, result);
        var viewport = {};
        viewport.north = Cesium.Math.toDegrees(rect.north).toFixed(4);
        viewport.south = Cesium.Math.toDegrees(rect.south).toFixed(4);
        viewport.west = Cesium.Math.toDegrees(rect.west).toFixed(4);
        viewport.east = Cesium.Math.toDegrees(rect.east).toFixed(4);
        viewport.height = this.worldmap.viewer.camera.positionCartographic.height;
        viewport.center_lat = Cesium.Math.toDegrees(this.worldmap.viewer.camera.positionCartographic.latitude);
        viewport.center_lon = Cesium.Math.toDegrees(this.worldmap.viewer.camera.positionCartographic.longitude);
        return viewport;
    }
}
