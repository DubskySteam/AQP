/* 
 * Heatbridges plugin for SWAC_mediaeditor for detecting mediaanalysis.
 */
var exporterFactory = {};
exporterFactory.create = function (pluginconfig) {
    return new ExporterSPL(pluginconfig);
};

class ExporterSPL extends ComponentPlugin {

    constructor(pluginconf) {
        super(pluginconf);
        this.name = 'Visualmodel/plugins/exporter';
        this.desc.templates[0] = {
            name: 'exporter',
            desc: 'Default template for show export buttons'
        };

        // Internal attributes
        this.stage = null;
        this.layer = null;
    }

    init() {
        // Get stage from  requestors component
        this.stage = this.requestor.swac_comp.stage;
        this.layer = this.requestor.swac_comp.layer;
        // Register event handling
        let stage = this.stage;
        let export_asimageElem = this.requestor.querySelector('.swac_visualmodel_saveasimage');
        export_asimageElem.addEventListener('click', function () {
            let dataURL = stage.toDataURL({pixelRatio: 3});
            var link = document.createElement('a');
            link.download = 'stage.png';
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
}