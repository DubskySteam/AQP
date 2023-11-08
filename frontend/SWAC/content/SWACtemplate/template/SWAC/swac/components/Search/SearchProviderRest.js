/* 
 * Specialized SearchProvider for searching REST interfaces.
 */

class SearchProviderRest extends SearchProvider {
    constructor(searchsource) {
        super(searchsource);
        this.delay = 1000;
    }

    /**
     * @override
     */
    search(searchExpr, searchurl, searchcomp) {
        Msg.warn('SearchProviderRest', 'Now searching on >' + searchurl + '<', searchcomp.requestor);
        let providerRef = this;
        let minchars = 4;
        if (this.searchsource.options) {
            minchars = this.searchsource.options.minchars;
        }
        return new Promise((resolve, reject) => {
            if (searchExpr.length < minchars) {
                Msg.warn('SearchProviderRest', 'Do not perform search, because there are less than ' + minchars + ' chars', searchcomp.requestor);
                // Show error message to user
                let infoElem = searchcomp.requestor.querySelector('.swac_search_info');
                let lessMsg = SWAC_language.Search.searchtoless;
                lessMsg = SWAC_language.replacePlaceholders(lessMsg, 'd', 4);
                infoElem.innerHTML = lessMsg;
                resolve();
                return;
            }

            // Do not search for model if something else is searched in meantime
            if (searchcomp.searchFor !== searchExpr) {
                Msg.warn('SearchProviderRest', '>' + searchExpr + '< is no longer searched.');
                resolve();
                return;
            }

            // Set searchExpr into apipath
            let searchpath = searchurl.replace('{expression}', searchExpr);
            // Call rest api
            fetch(searchpath).then(function (response) {
                if (response.ok) {
                    response.json().then(function (responsejson) {
                        let searchresults = [];
                        for (let i in responsejson.list) {
                            let result = responsejson.list[i];
                            let searchresult = {
                                name: searchExpr,
                                status: 200,
                                url: searchpath,
                                provider: providerRef,
                                result: result
                            };
                            searchresults.push(searchresult);
                        }

                        resolve(searchresults);
                    })
                } else if (response.status === 404) {
                    Msg.warn('SearchProviderRest', 'Nothing found on ' + searchpath);
                    resolve([]);
                } else {
                    Msg.error('SearchProviderRest', 'Error getting json response: ' + error);
                    reject(error);
                }
            }).catch(function (error) {
                Msg.error('SearchProviderRest', 'Error getting json response: ' + error);
                reject(error);
            });
        });
    }
}
