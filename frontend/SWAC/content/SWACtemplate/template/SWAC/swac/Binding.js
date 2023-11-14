/**
 * Binding mechanism for binding view and data together.
 * 
 * @type type
 */
class Binding {

    constructor(requestor) {
        this.requestor = requestor;
        this.component = requestor.swac_comp;
        requestor.swac_binding = this;
    }

    bind() {
        return new Promise((resolve, reject) => {
            // Check if component has no data
            let nodata = false;
            if (!this.component.data || (Object.entries(this.component.data).length === 0 && this.component.data.constructor === Object)) {
                nodata = true;
                if (this.component.options !== 'undefined'
                        && this.component.options.showWhenNoData === true) {
                    // If set show component even if there is no data
                } else {
                    // Defaults to hide component if there is no data
                    this.requestor.classList.add('swac_dontdisplay');
                    // Do not remove node, because component can be reactivated
                    // if there is data a a later time
                    Msg.warn('Binding', 'There is no data so this '
                            + 'component is not shown. If you want this component to '
                            + 'show up on no data add the option showWhenNoData=true '
                            + 'to the global variable >' + this.requestor.id
                            + '_options<', this.requestor);
                }
                if (this.requestor.fromName) {
                    Msg.warn('Binding', "There is no data with name >"
                            + this.requestor.fromName + "< for requestor >"
                            + this.requestor.id + "<", this.requestor);
                }
            }

            if (!nodata) {
                // Get repeatableForAttributes
                let repeatablesForAttributes = this.requestor.swac_view.findChildsRepeatableForAttribute(this.requestor);
                if (repeatablesForAttributes.length > 0) {
                    // Get attributes
                    let attributes = this.getAttributes();
                    for (let curAttribute of attributes) {
                        for (let curRepeatableForAttributes of repeatablesForAttributes) {
                            this.requestor.swac_view.createRepeatedForAttribute(curAttribute, curRepeatableForAttributes);
                        }
                    }
                }
                // Bind datasets
                this.bindData(this.component.data);
            }

            // Inform about finished bind
            let completeEvent = new CustomEvent('swac_' + this.requestor.id + '_bound', {
                detail: {
                    requestor_id: this.requestor.id
                }
            });
            document.dispatchEvent(completeEvent);

            resolve();
        });
    }

    /**
     * Creates binds for data
     * 
     * @param {Object} data Object with sourcenames and datasetlists (source1[datasets])
     * @returns {undefined}
     */
    bindData(data) {
        let setNo = -1;
        let lastSource;
        for (let source in data) {
            lastSource = source;
            for (let curSet of data[source]) {
                // Exclude missing entries in array
                if (curSet) {
                    setNo++;
                    curSet.swac_fromName = source;
                    curSet.swac_setNo = setNo;
                    this.bindSet(curSet);
                }
            }
        }
        // Handle parent and child elements
        this.requestor.swac_view.orderChildElements();
        // Handle uiKit specific slide machanism and the template slide
        this.requestor.swac_view.handleUIkitSlides();

        // Bind standalone placeholders with first dataset from last source
        if (data[lastSource]) {
            for (let curSet of data[lastSource]) {
                if (!curSet)
                    continue;
                let bindPoints = this.requestor.swac_view.findBindPoints(
                        this.requestor, ['swac_repeatForSet', 'swac_repeatForValue']);
                for (let curAttr in bindPoints) {
                    for (let curBindPoint of bindPoints[curAttr]) {
                        if (curAttr === 'requestor.data') {
                            let tSet = {
                                'requestor.data': this.requestor.swac_comp.getJson(lastSource, 2)
                            };
                            curBindPoint.dataset = tSet;
                        } else {
                            curBindPoint.dataset = curSet;
                        }
                    }
                }
                // Only use first dataset
                break;
            }
        }

    }

    /**
     * Creates databinding for the given dataset. Uses the swac_repeatForSet
     * elements.
     * 
     * @param {Object} set Dataset including metadata swac_fromName, swac_setNo
     * @returns {WatchableSet} A set whose changes can be watched by observer pattern
     */
    bindSet(set) {
        // Check conditions
        if (this.component.conditions) {
            for (let condOn in this.component.conditions) {
                // Check if data for condition check exists
                if (!set[condOn]) {
                    Msg.error('Binding', 'Dataset >' + set.swac_fromName + "["
                            + set.swac_setNo + "]< does not contain the expected attribute >"
                            + condOn + "<. Condition check failed.");
                }
                // If condition is not meet continue with next dataset
                if (!this.component.conditions[condOn](set[condOn])) {
                    // return because of foreach construct
                    return;
                }
            }
        }

        // ViewContainers applicable only for current set
        let repeatableForSets = this.requestor.swac_view.findChildsRepeatableForSet(this.requestor);
        for (let curRepeatableForSet of repeatableForSets) {
            let newNode = this.requestor.swac_view.createRepeatedForSet(set, curRepeatableForSet);
            set = newNode.swac_dataset;
        }
        return set;
    }

    /**
     * Gets the available attributes from data
     * 
     * @returns {undefined}
     */
    getAttributes() {
        //TODO search attributes over all sets
        let attributes = [];
        let firstSource;
        let firstSet;
        for (let curSource in this.component.data) {
            firstSource = curSource;
            for (let curSet of this.component.data[curSource]) {
                firstSet = curSet;
                break;
            }
            break;
        }

        for (let curAttr in firstSet) {
            let attr = {
                setName: firstSource,
                setNo: 0,
                attrName: curAttr
            };
            attributes.push(attr);
        }

        return attributes;
    }
}