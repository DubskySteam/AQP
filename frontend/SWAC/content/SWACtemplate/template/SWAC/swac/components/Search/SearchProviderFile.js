/* 
 * Specialized SearchProvider for searching SEGLTF files.
 */

class SearchProviderFile extends SearchProvider {
    constructor(searchsource) {
        super(searchsource);
        this.delay = 0;
    }

    /**
     * @override
     */
    search(searchExpr, searchurl, searchcomp) {
        Msg.warn('SearchProviderFile','Now searching on >' + searchurl + '<',searchcomp);
        let providerRef = this;
        return new Promise((resolve, reject) => {
            // Do not search for model if something else is searched in meantime
            if (searchcomp.searchFor !== searchExpr) {
                Msg.warn('SearchProviderFile', 'SearchProviderFile: >' + searchExpr + '< is no longer searched.');
                resolve();
                return;
            }
            // Embed search expression into url
            if (typeof searchurl !== 'undefined') {
                searchurl = searchurl.replace('{expression}', searchExpr);
            } else {
                reject('There is no searchurl given.');
                return;
            }

            // Check if model was searched before
            if (typeof SWAC_storage.files[searchurl] === 'undefined') {
                // Create entry in models list
                SWAC_storage.files[searchurl] = {};
                // Check if file exists
                fetch(searchurl, {method: 'HEAD'}).then(
                        function (response) {
                            if (typeof SWAC_storage.files[searchurl].filestatus === 'undefined'
                                    || SWAC_storage.files[searchurl].filestatus >= 400) {
                                // Set found status to filestorage on every found file
                                SWAC_storage.files[searchurl].filestatus = response.status;
                                SWAC_storage.files[searchurl].url = searchurl;
                            }
                            if (response.status < 400 || response.status === 405) {
                                let searchresult = {
                                    name: searchExpr,
                                    url: searchurl,
                                    status: response.status,
                                    provider: providerRef
                                };
                                resolve(searchresult);
                            } else {
                                resolve();
                            }
                        }).catch(function (error) {
                    Msg.error('SearchProviderFile', 'A error occured searching: ' + error);
                    reject(error);
                });
            }
        });
    }
}
