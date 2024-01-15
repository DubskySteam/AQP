import SWAC from '../../swac.js';
import Msg from '../../Msg.js';
import SearchProvider from './SearchProvider.js';

/* 
 * Specialized SearchProvider for searching REST interfaces.
 */
export default class SearchProviderRest extends SearchProvider {
    constructor(searchsource) {
        super(searchsource);
        this.delay = 1000;
    }

    /**
     * @override
     */
    search(searchExpr, searchurl, searchcomp) {
        Msg.flow('SearchProviderRest', 'Now searching on >' + searchurl + '<', searchcomp.requestor);
        let providerRef = this;
        let minchars = 4;
        if (this.searchsource.options) {
            minchars = this.searchsource.options.minchars;
        }
        return new Promise((resolve, reject) => {
            if (searchExpr.length < minchars) {
                Msg.info('SearchProviderRest', 'Do not perform search, because there are less than ' + minchars + ' chars', searchcomp.requestor);
                // Show error message to user
                let infoElem = searchcomp.requestor.querySelector('.swac_search_info');
                let lessMsg = SWAC.lang.dict.Search.searchtoless;
                lessMsg = SWAC.lang.replacePlaceholders(lessMsg, 'd', 4);
                infoElem.innerHTML = lessMsg;
                resolve();
                return;
            }

            // Do not search for model if something else is searched in meantime
            if (searchcomp.searchFor !== searchExpr) {
                Msg.info('SearchProviderRest', '>' + searchExpr + '< is no longer searched.', searchcomp.requestor);
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
                        // Get results from list interface
                        if (responsejson.list) {
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
                        } else {
                            Msg.flow('SearchProviderRest','Try detect results from unknown json.', searchcomp.requestor);
                            searchresults = providerRef.detectResults(responsejson);
                        }
                        resolve(searchresults);
                    })
                } else if (response.status === 404) {
                    Msg.info('SearchProviderRest', 'Nothing found on ' + searchpath, searchcomp.requestor);
                    resolve([]);
                } else {
                    Msg.error('SearchProviderRest', 'Error getting json response: ' + error, searchcomp.requestor);
                    reject(error);
                }
            }).catch(function (error) {
                Msg.error('SearchProviderRest', 'Error getting json response: ' + error, searchcomp.requestor);
                reject(error);
            });
        });
    }
    
    /**
     * Tries to detect results from unknown json structurs
     */
    detectResults(resultjson) {
        let results = [];
        for(let curAttr in resultjson) {
            if(resultjson[curAttr] instanceof Array) {
                return resultjson[curAttr];
            } else if(resultjson[curAttr] instanceof Object) {
                results = this.detectResults(resultjson[curAttr]);
            }
        }
        return results;
    }
}
