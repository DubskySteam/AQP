/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class SphereCloud extends Model {
    constructor(filepath) {
        super(filepath);
    }

    draw(viewer) {
        for (let pointno in data.points) {
            let cart3Point = new Cesium.Cartesian3(
                    data.points[pointno].x,
                    data.points[pointno].y,
                    data.points[pointno].z);
            var redSphere = SAFE_globe.viewer.entities.add({
                name: 'Red sphere with black outline',
                position: cart3Point,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                ellipsoid: {
                    radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                    material: Cesium.Color.RED.withAlpha(0.5),
                    outline: true,
                    outlineColor: Cesium.Color.BLACK
                }
            });
        }
    }
}
