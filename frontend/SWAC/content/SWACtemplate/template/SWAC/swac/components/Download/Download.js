var DownloadFactory = {};
DownloadFactory.create = function (config) {
    return new Download(config);
};

/**
 * Sample component for development of own components
 */

class Download extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'Download';
        this.desc.text = 'Creates download areas for files';
        this.desc.depends[0] = {
            name: 'Icon component',
            path: SWAC_config.swac_root + '/swac/components/Icon/Icon.js',
            desc: 'SWAC Icon component'
        };
        this.desc.templates[0] = {
            name: 'block',
            style: 'block',
            desc: 'Shows a block with files title and download icon.'
        };
        this.desc.templates[1] = {
            name: 'table',
            style: false,
            desc: 'Shows a table that lists all downloads.'
        };
        this.desc.reqPerTpl[0] = {
            selc: '.swac_downloadIco',
            desc: 'img element where to show the icon.'
        };
        this.desc.reqPerSet[0] = {
            name: 'path',
            desc: 'Path to the downloadable file.'
        };
        this.desc.reqPerSet[0] = {
            name: 'mimetype',
            desc: 'Downloadable files mimetype.'
        };
        this.desc.optPerSet[0] = {
            name: 'title',
            desc: 'Title of the file'
        };
        this.desc.optPerSet[1] = {
            name: 'description',
            desc: 'Description for the file'
        };
        this.desc.optPerSet[2] = {
            name: 'ico',
            desc: 'Path or base64 coded binary for the icon of the file. If not set a default ico depending on the filetype will be used.'
        };
    }

    init() {
        return new Promise((resolve, reject) => {
            // Find ico placeholder without icon
            let withoutIcoElems = this.requestor.querySelectorAll('.swac_downloadIco:not([src])');
            for (let withoutIcoElem of withoutIcoElems) {
                // Find repeatedForSet for this with missing ico
                let setElem = this.requestor.swac_view.findReapeatedForSet(withoutIcoElem);
                // Dont do anything for the template
                if (setElem !== null) {
                    // Get icon filename from mime-type
                    let iconComp = new Icon();
                    let iconfilepath = iconComp.getIconFilePath(setElem.swac_dataset.mimetype);
                    if (iconfilepath === 'unkown.svg') {
                        withoutIcoElem.parentNode.removeChild(withoutIcoElem);
                    } else {
                        withoutIcoElem.setAttribute("src", iconfilepath);
                    }
                }
            }
            resolve();

        });
    }
}