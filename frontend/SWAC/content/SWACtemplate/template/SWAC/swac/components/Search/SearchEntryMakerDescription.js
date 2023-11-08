/* 
 * A search entry maker for data responses with configurable title, description
 * and link field.
 */

class SearchEntryMakerDescription extends SearchEntryMaker {
    constructor() {
        super();
        this.titleattr = 'title';
        this.descattr = 'desc';
        this.linkattr = 'link';
        this.linknameattr = null;
    }

    /**
     * Checks if this SearchEntryMaker is applicable to build a entry from the 
     * given result.
     * 
     * @param {Object} searchResult Result of search that should be checked if this SearchEntryMaker is applicable
     * @returns {boolean} true if this maker can be used
     */
    isApplicable(searchResult) {
        if (typeof searchResult.result[this.titleattr] !== 'undefined') {
            return true;
        } else {
            Msg.warn('SearchEntryMakerDescription', 'Result >' + searchResult.name + '< is not renderable with this maker.');
            return false;
        }
    }

    /**
     * Creates a search result entry html element.
     * 
     * @param {Object} searchResults Array of objects with search results
     * @param {Integer} resultNo No of the result to show
     * @param {DOMElement} placeElement Element where to place the result entry
     * 
     * @returns {DOMElement} HTML Element that presents the search result
     */
    make(searchResults, resultNo, placeElement) {
        // Get current searchResult
        let result = searchResults[resultNo];
        let newentry = document.createElement('div');
        // Create title
        let newtitle = document.createElement('div');
        newtitle.classList.add('search_resulttitle');
        newtitle.innerHTML = result.result[this.titleattr];
        newentry.appendChild(newtitle);
        // Create desc
        let newdesc = document.createElement('div');
        newdesc.innerHTML = result.result[this.descattr];
        newentry.appendChild(newdesc);
        // Create link
        if (result.result[this.linktitleattr]) {
            let newlink = document.createElement('a');
            newlink.setAttribute('href', result[this.linkattr]);
            let newlinktitle;
            if (this.linktitleattr) {
                newlinktitle = result.result[this.linktitleattr];
            } else {
                newlinktitle = SWAC_language.Search.gotoresult;
            }
            newlink.innerHTML = newlinktitle;
            newentry.appendChild(newlink);
        }

        // Add to resultlist
        placeElement.appendChild(newentry);
    }
}