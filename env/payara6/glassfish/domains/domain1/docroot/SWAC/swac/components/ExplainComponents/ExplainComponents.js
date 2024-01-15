import SWAC from '../../swac.js';
import View from '../../View.js';
import Msg from '../../Msg.js';

export default class ExplainComponents extends View {
    constructor(options) {
        super(options);
        this.name = 'ExplainComponents';
        this.desc.text = 'Generates explanations of SWAC components.';
        this.desc.developers = 'Florian Fehring (FH Bielefeld)';
        this.desc.license = 'GNU Lesser General Public License';

        this.desc.depends[0] = {
            name: 'he.js',
            path: SWAC.config.swac_root + 'libs/he/he.min.js',
            desc: 'Library for HTML entity decoding / encodeing'
        };
        this.desc.depends[1] = {
            name: 'highlight.js',
            path: SWAC.config.swac_root + 'libs/highlight/highlight.min.js',
            desc: 'Syntax hightlighting'
        };
        this.desc.depends[2] = {
            name: 'highlight.js style',
            path: SWAC.config.swac_root + 'libs/highlight/styles/default.min.css',
            desc: 'Syntax hightlighting'
        };

        this.desc.templates[0] = {
            name: 'accordion',
            style: false,
            desc: 'Shows the explanations in an accordion.'
        };

        this.options.showWhenNoData = true;

        this.desc.opts[0] = {
            name: 'componentName',
            desc: 'Name of the component that should be explained.'
        };
        if (!this.options.componentName)
            this.options.componentName = null;
    }

    init() {
        return new Promise((resolve, reject) => {

            let componentName = this.options.componentName;
            if (!componentName) {
                let msgElem = document.createTextNode(SWAC.lang.dict.ExplainComponents.noComponentSelected);
                this.requestor.appendChild(msgElem);
                resolve();
                return;
            }

            let thisRef = this;
            // Load component script
            import(SWAC.config.swac_root + 'components/' + componentName + '/' + componentName + '.js?vers=' + SWAC.desc.version)
                    .then(module => {
                        // Check if object is available
                        if (module.default) {
                            // Construct the component with default options
                            let explObj = Reflect.construct(module.default, []);
                            let allDiv = thisRef.explainAll(explObj);
                            thisRef.requestor.appendChild(allDiv);
                            resolve();
                        }
                    });
        });
    }

    /**
     * Creates a explanation in html about all areas.
     * 
     * @param {SWACComponent} component Component to explain
     * @returns {HTMLElement}
     */
    explainAll(component) {
        let explainArticle = document.createElement('article');
        explainArticle.classList.add('uk-article');
        let explainHeadline = document.createElement('h1');
        explainHeadline.classList.add("uk-article-title");
        explainHeadline.appendChild(document.createTextNode(component.name));
        explainArticle.appendChild(explainHeadline);
        if (component.desc.developers) {
            let devBadge = document.createElement('div');
            devBadge.innerHTML = component.desc.developers;
            devBadge.classList.add('uk-badge');
            explainArticle.appendChild(document.createTextNode('by '));
            explainArticle.appendChild(devBadge);
        }
        
        let explainHeadtext = document.createElement('p');
        explainHeadtext.classList.add("uk-article-meta");
        explainHeadtext.appendChild(document.createTextNode(component.desc.text));
        explainArticle.appendChild(explainHeadtext);
        
        if (component.desc.license) {
            let licBadge = document.createElement('span');
            licBadge.innerHTML = component.desc.license;
            licBadge.classList.add('uk-badge');
            explainArticle.appendChild(document.createTextNode('license: '));
            explainArticle.appendChild(licBadge);
        }

        let explainAccordion = document.createElement('ul');
        explainAccordion.setAttribute('uk-accordion', 'uk-accordion');
        let dataReqLi = document.createElement('li');
        let dataReqTitle = document.createElement('a');
        dataReqTitle.classList.add('uk-accordion-title');
        dataReqTitle.classList.add('uk-background-primary');
        dataReqTitle.setAttribute('href', '#');
        dataReqTitle.innerHTML = SWAC.lang.dict.ExplainComponents.datasets;
        dataReqLi.appendChild(dataReqTitle);
        let dataReqDiv = this.explainDataRequirements(component);
        dataReqDiv.classList.add('uk-accordion-content');
        dataReqLi.appendChild(dataReqDiv);
        explainAccordion.appendChild(dataReqLi);

        let optionsLi = document.createElement('li');
        let optionsTitle = document.createElement('a');
        optionsTitle.classList.add('uk-accordion-title');
        optionsTitle.classList.add('uk-background-primary');
        optionsTitle.setAttribute('href', '#');
        optionsTitle.innerHTML = SWAC.lang.dict.ExplainComponents.options;
        optionsLi.appendChild(optionsTitle);
        let optionsDiv = this.explainOptions(component);
        optionsDiv.classList.add('uk-accordion-content');
        optionsLi.appendChild(optionsDiv);
        explainAccordion.appendChild(optionsLi);

        let templateReqLi = document.createElement('li');
        let templateReqTitle = document.createElement('a');
        templateReqTitle.classList.add('uk-accordion-title');
        templateReqTitle.classList.add('uk-background-primary');
        templateReqTitle.setAttribute('href', '#');
        templateReqTitle.innerHTML = SWAC.lang.dict.ExplainComponents.template;
        templateReqLi.appendChild(templateReqTitle);
        let tmplReqDiv = this.explainTplRequirements(component);
        tmplReqDiv.classList.add('uk-accordion-content');
        templateReqLi.appendChild(tmplReqDiv);
        explainAccordion.appendChild(templateReqLi);

        let templatesLi = document.createElement('li');
        let templatesTitle = document.createElement('a');
        templatesTitle.classList.add('uk-accordion-title');
        templatesTitle.classList.add('uk-background-primary');
        templatesTitle.setAttribute('href', '#');
        templatesTitle.innerHTML = SWAC.lang.dict.ExplainComponents.templates;
        templatesLi.appendChild(templatesTitle);
        let tmplsDiv = this.explainAllTemplates(component);
        tmplsDiv.classList.add('uk-accordion-content');
        templatesLi.appendChild(tmplsDiv);
        explainAccordion.appendChild(templatesLi);

        let stylesLi = document.createElement('li');
        let stylesTitle = document.createElement('a');
        stylesTitle.classList.add('uk-accordion-title');
        stylesTitle.classList.add('uk-background-primary');
        stylesTitle.setAttribute('href', '#');
        stylesTitle.innerHTML = SWAC.lang.dict.ExplainComponents.styles;
        stylesLi.appendChild(stylesTitle);
        let stylesDiv = this.explainStyles(component);
        stylesDiv.classList.add('uk-accordion-content');
        stylesLi.appendChild(stylesDiv);
        explainAccordion.appendChild(stylesLi);

        let functionsLi = document.createElement('li');
        let functionsTitle = document.createElement('a');
        functionsTitle.classList.add('uk-accordion-title');
        functionsTitle.classList.add('uk-background-primary');
        functionsTitle.setAttribute('href', '#');
        functionsTitle.innerHTML = SWAC.lang.dict.ExplainComponents.functions;
        functionsLi.appendChild(functionsTitle);
        let functionsDiv = this.explainFunctions(component);
        functionsDiv.classList.add('uk-accordion-content');
        functionsLi.appendChild(functionsDiv);
        explainAccordion.appendChild(functionsLi);

        let dependenciesLi = document.createElement('li');
        let dependenciesTitle = document.createElement('a');
        dependenciesTitle.classList.add('uk-accordion-title');
        dependenciesTitle.classList.add('uk-background-primary');
        dependenciesTitle.setAttribute('href', '#');
        dependenciesTitle.innerHTML = SWAC.lang.dict.ExplainComponents.dependencies;
        dependenciesLi.appendChild(dependenciesTitle);
        let dependenciesDiv = this.explainDependencies(component);
        dependenciesDiv.classList.add('uk-accordion-content');
        dataReqTitle.classList.add('uk-background-primary');
        dependenciesLi.appendChild(dependenciesDiv);
        explainAccordion.appendChild(dependenciesLi);

        // Explain plugins but only if component isnt a plugin itself
        if (!component.name.includes('/plugins/')) {
            let pluginsLi = document.createElement('li');
            let pluginsTitle = document.createElement('a');
            pluginsTitle.classList.add('uk-accordion-title');
            pluginsTitle.classList.add('uk-background-primary');
            pluginsTitle.setAttribute('href', '#');
            pluginsTitle.innerHTML = SWAC.lang.dict.ExplainComponents.plugins;
            pluginsLi.appendChild(pluginsTitle);
            let pluginsDiv = this.explainPlugins(component);
            pluginsDiv.classList.add('uk-accordion-content');
            pluginsLi.appendChild(pluginsDiv);
            explainAccordion.appendChild(pluginsLi);
        }

        explainArticle.appendChild(explainAccordion);

        return explainArticle;
    }

    /**
     * Creates a explanation in html about the data requirements.
     * 
     * @param {SWACComponent} component Component to explain
     * @returns {Element|this.explainDataRequirements.reqDiv}
     */
    explainDataRequirements(component) {
        let reqDiv = document.createElement('div');

        // Create table
        let table = document.createElement('table');
        table.setAttribute('class', 'uk-table');
        let th = document.createElement('tr');
        let th1 = document.createElement('th');
        th1.innerHTML = SWAC.lang.dict.ExplainComponents.attributeName;
        th.appendChild(th1);
        let th2 = document.createElement('th');
        th2.innerHTML = SWAC.lang.dict.ExplainComponents.attributeDesc;
        th.appendChild(th2);
        let th3 = document.createElement('th');
        th3.innerHTML = SWAC.lang.dict.ExplainComponents.attributeReq;
        th.appendChild(th3);
        table.appendChild(th);

        if (typeof component.desc === 'undefined') {
            let tr = document.createElement("tr");
            let td = document.creeateElement("td");
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.noDescription;
            tr.appendChild(td);
            table.appendChild(tr);
            reqDiv.appendChild(table);
            return reqDiv;
        }

        if (typeof component.desc.reqPerSet === 'undefined' || component.desc.reqPerSet.length === 0) {
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.attributesNone;
            tr.appendChild(td);
            table.appendChild(tr);
        }

        if (component.desc.reqPerSet) {
            // Create tablerow for each required attribute
            for (let curReq of component.desc.reqPerSet) {
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                td1.innerHTML = curReq.name;
                tr.appendChild(td1);
                let td2 = document.createElement("td");
                td2.innerHTML = curReq.desc;
                tr.appendChild(td2);
                let td3 = document.createElement("td");
                let checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.setAttribute('checked', 'checked');
                checkbox.setAttribute('disabled', 'disabled');
                checkbox.classList.add('uk-checkbox');
                td3.appendChild(checkbox);
                tr.appendChild(td3);
                table.appendChild(tr);
            }
        }

        if (component.desc.optPerSet) {
            // Create tablerow for each optional attribute
            for (let curOpt of component.desc.optPerSet) {
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                td1.innerHTML = curOpt.name;
                tr.appendChild(td1);
                let td2 = document.createElement("td");
                td2.innerHTML = curOpt.desc;
                tr.appendChild(td2);
                let td3 = document.createElement("td");
                let checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.setAttribute('disabled', 'disabled');
                checkbox.classList.add('uk-checkbox');
                td3.appendChild(checkbox);
                tr.appendChild(td3);
                table.appendChild(tr);
            }
        }
        reqDiv.appendChild(table);
        return reqDiv;
    }

    /**
     * Creates a explanation about dependencies of this component.
     * 
     * @param {SWACComponent} component Component to explain
     * @returns {Element|this.explainDependencies.depDiv}
     */
    explainDependencies(component) {
        let depDiv = document.createElement('div');

        // Create table
        let table = document.createElement('table');
        table.setAttribute('class', 'uk-table');
        let th = document.createElement('tr');
        let th1 = document.createElement('th');
        th1.innerHTML = SWAC.lang.dict.ExplainComponents.dependenciesName;
        th.appendChild(th1);
        let th2 = document.createElement('th');
        th2.innerHTML = SWAC.lang.dict.ExplainComponents.dependenciesDesc;
        th.appendChild(th2);
        let th3 = document.createElement('th');
        th3.innerHTML = SWAC.lang.dict.ExplainComponents.dependenciesPath;
        th.appendChild(th3);
        table.appendChild(th);

        if (typeof component.desc === 'undefined') {
            let tr = document.createElement("tr");
            let td = document.creeateElement("td");
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.noDescription;
            tr.appendChild(td);
            table.appendChild(tr);
            depDiv.appendChild(table);
            return depDiv;
        }

        if (typeof component.desc.depends === 'undefined' || component.desc.depends.length === 0) {
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.dependenciesNone;
            tr.appendChild(td);
            table.appendChild(tr);
        }
        if (typeof component.desc.depends !== 'undefined') {
            // Create tablerow for each required attribute
            let i=0;
            for (let curDependency of component.desc.depends) {
                if(!curDependency) {
                    this.addDocumentationError('Error in dependency declaration dependency ' + i + ' is missing.');
                    i++;
                    continue;
                }
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                td1.innerHTML = curDependency.name;
                tr.appendChild(td1);
                let td2 = document.createElement("td");
                td2.innerHTML = curDependency.desc;
                tr.appendChild(td2);
                let td3 = document.createElement("td");
                td3.innerHTML = curDependency.path;
                tr.appendChild(td3);
                table.appendChild(tr);
                i++;
            }
        }

        depDiv.appendChild(table);
        return depDiv;
    }

    /**
     * Explains the requirements on the template.
     * 
     * @param {SWACComponent} component Component to explain
     * @returns {Element|this.explainTplRequirements.reqDiv}
     */
    explainTplRequirements(component) {
        let reqDiv = document.createElement('div');

        // Create table
        let table = document.createElement('table');
        table.setAttribute('class', 'uk-table');
        let th = document.createElement('tr');
        let th1 = document.createElement('th');
        th1.innerHTML = SWAC.lang.dict.ExplainComponents.tmplelemSelector;
        th.appendChild(th1);
        let th2 = document.createElement('th');
        th2.innerHTML = SWAC.lang.dict.ExplainComponents.tmplelemDesc;
        th.appendChild(th2);
        let th3 = document.createElement('th');
        th3.innerHTML = SWAC.lang.dict.ExplainComponents.tmplelemReq;
        th.appendChild(th3);
        table.appendChild(th);

        if (typeof component.desc === 'undefined') {
            let tr = document.createElement("tr");
            let td = document.creeateElement("td");
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.noDescription;
            tr.appendChild(td);
            table.appendChild(tr);
            reqDiv.appendChild(table);
            return reqDiv;
        }

        if (typeof component.desc.reqPerTpl === 'undefined' || component.desc.reqPerTpl.length === 0) {
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.tmplelemsNone;
            tr.appendChild(td);
            table.appendChild(tr);
        }

        if (typeof component.desc.reqPerTpl !== 'undefined') {
            // Create tablerow for each required attribute
            for (let curReq of component.desc.reqPerTpl) {
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                td1.innerHTML = curReq.selc;
                tr.appendChild(td1);
                let td2 = document.createElement("td");
                td2.innerHTML = curReq.desc;
                tr.appendChild(td2);
                let td3 = document.createElement("td");
                let checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.setAttribute('checked', 'checked');
                checkbox.setAttribute('disabled', 'disabled');
                checkbox.classList.add('uk-checkbox');
                td3.appendChild(checkbox);
                tr.appendChild(td3);
                table.appendChild(tr);
            }
        }

        if (typeof component.desc.optPerTpl !== 'undefined') {
            // Create tablerow for each optional attribute
            for (let curOpt of component.desc.optPerTpl) {
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                td1.innerHTML = curOpt.selc;
                tr.appendChild(td1);
                let td2 = document.createElement("td");
                td2.innerHTML = curOpt.desc;
                tr.appendChild(td2);
                let td3 = document.createElement("td");
                let checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.setAttribute('disabled', 'disabled');
                checkbox.classList.add('uk-checkbox');
                td3.appendChild(checkbox);
                tr.appendChild(td3);
                table.appendChild(tr);
            }
        }
        reqDiv.appendChild(table);

        return reqDiv;
    }

    /**
     * Explains all available templates for the given component
     * 
     * @param {SWACComponent} component SWAC component to explain fragment with
     * @returns {undefined}
     */
    explainAllTemplates(component) {
        let explDiv = document.createElement('div');

        // Get available templates
        let templates = [];
        if (typeof component.desc !== 'undefined'
                && typeof component.desc.templates !== 'undefined') {
            templates = component.desc.templates;
        } else {
            templates[0] = {
                name: component.name,
                desc: 'Default template for ' + component.name
            };
        }

        let notemplates = 0;
        for (let curTemplate of templates) {
            notemplates++;
            let explDivHead = document.createElement('h3');
            explDivHead.innerHTML = 'Template "' + curTemplate.name + '"';
            explDiv.appendChild(explDivHead);
            let explDivP = document.createElement('p');
            explDivP.innerHTML = curTemplate.desc;
            explDiv.appendChild(explDivP);
            let explDivTmpl = document.createElement('div');
            explDiv.appendChild(explDivTmpl);

            let htmlfragment_url = SWAC.config.swac_root + 'components/' + component.name + '/' + curTemplate.name + '.html';
            let thisObj = this;
            // Get component sourcecode
            fetch(htmlfragment_url, {
                // Data in url params not here
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *omit
                headers: {
                    'user-agent': 'SWAC/1.0 fetch',
                    'content-type': 'application/json'
                },
                method: 'GET', // *GET, DELETE
                mode: 'cors', // no-cors, *same-origin
                redirect: 'follow', // *manual, error
                referrer: 'no-referrer' // *client
            }).then(function (response) {
                response.text().then(function (htmlfragment) {
                    thisObj.explainHTMLFragment(htmlfragment, component, explDivTmpl);
                });
            });
        }

        if (notemplates === 0) {
            explDiv.appendChild(document.createTextNode(SWAC.lang.dict.ExplainComponents.tplsNone));
        }

        return explDiv;
    }

    /**
     * Creates a description of the options available in the component.
     * 
     * @param {SWAC component} component
     * @returns {undefined}
     */
    explainOptions(component) {
        let explDiv = document.createElement('div');

        // Create table
        let table = document.createElement('table');
        table.setAttribute('class', 'uk-table');
        let th = document.createElement('tr');
        let th1 = document.createElement('th');
        th1.innerHTML = SWAC.lang.dict.ExplainComponents.optionsName;
        th.appendChild(th1);
        let th2 = document.createElement('th');
        th2.innerHTML = SWAC.lang.dict.ExplainComponents.optionsDesc;
        th.appendChild(th2);
        table.appendChild(th);

        if (typeof component.options === 'undefined') {
            let tr = document.createElement('tr');
            let td = document.createElement('td');
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.optionsNone;
            tr.appendChild(td);
            table.appendChild(tr);
        }
        // Build up description map
        let descmap = new Map();
        if (component.desc && component.desc.opts) {
            for (let curOptDesc of component.desc.opts) {
                if (!curOptDesc)
                    continue;
                descmap.set(curOptDesc.name, curOptDesc);
            }
        }

        // Create description table
        for (let curOption in component.options) {
            let tr = document.createElement('tr');
            // Add name
            let tdname = document.createElement('td');
            tdname.innerHTML = curOption;
            tr.appendChild(tdname);
            // Add description
            let tddesc = document.createElement('td');
            let desc = descmap.get(curOption);
            if (typeof desc !== 'undefined') {
                tddesc.innerHTML = desc.desc;
            } else {
                tddesc.innerHTML = SWAC.lang.dict.ExplainComponents.optionsNodesc;
            }
            tr.appendChild(tddesc);
            table.appendChild(tr);

            // Add second row for example and default value
            let tr2 = document.createElement('tr');
            // Add example value
            let tdexample = document.createElement('td');
            let tdexamplecap = document.createElement('strong');
            tdexamplecap.innerHTML = SWAC.lang.dict.ExplainComponents.optionsExample;
            tdexample.appendChild(tdexamplecap);
            let tdexamplepre = document.createElement('pre');
            let tdexamplecod = document.createElement('code');
            tdexamplecod.classList.add('lang-javascript');
            if (typeof desc !== 'undefined' && desc.example) {
                tdexamplecod.innerHTML = this.convertToText(desc.example);
            } else {
                tdexamplecod.innerHTML = SWAC.lang.dict.ExplainComponents.optionsNoExample;
            }
            tdexamplepre.appendChild(tdexamplecod);
            tdexample.appendChild(tdexamplepre);
            tr2.appendChild(tdexample);

            // Add default value
            let tddefault = document.createElement('td');
            let tddefaultcap = document.createElement('strong');
            tddefaultcap.innerHTML = SWAC.lang.dict.ExplainComponents.optionsDefault;
            tddefault.appendChild(tddefaultcap);
            let tddefaultpre = document.createElement('pre');
            let tddefaultcod = document.createElement('code');
            tddefaultcod.classList.add('lang-javascript');
            tddefaultcod.innerHTML = this.convertToText(component.options[curOption]);
            tddefaultpre.appendChild(tddefaultcod);
            tddefault.appendChild(tddefaultpre);
            tr2.appendChild(tddefault);
            table.appendChild(tr2);
        }

        explDiv.appendChild(table);

        return explDiv;
    }

    /**
     * Creates a description of the functions that the component has.
     * 
     * @param {SWACcomponent} component component to describe
     * @returns {HTMLElement} HTML Element with the description
     */
    explainFunctions(component) {
        let explDiv = document.createElement('div');

        if (typeof component.desc.funcs === 'undefined' || component.desc.funcs.length === 0) {
            explDiv.appendChild(document.createTextNode(SWAC.lang.dict.ExplainComponents.noFunctions));
            return explDiv;
        }

        for (let curFunc of component.desc.funcs) {
            // Exclude holes in array
            if (!curFunc)
                continue;
            let funcArea = document.createElement('div');
            let funcExplHead = document.createElement('h3');
            funcExplHead.appendChild(document.createTextNode(curFunc.name));
            funcArea.appendChild(funcExplHead);
            let funcExplText = document.createTextNode(curFunc.desc);
            funcArea.appendChild(funcExplText);
            // Table for params
            let paramTable = document.createElement('table');
            paramTable.classList.add('uk-table');
            let paramTableHead = document.createElement('tr');
            let paramNameCaption = document.createElement('th');
            paramNameCaption.appendChild(document.createTextNode(SWAC.lang.dict.ExplainComponents.paramName));
            paramTableHead.appendChild(paramNameCaption);
            let paramDescCaption = document.createElement('th');
            paramDescCaption.appendChild(document.createTextNode(SWAC.lang.dict.ExplainComponents.paramDescription));
            paramTableHead.appendChild(paramDescCaption);
            paramTable.appendChild(paramTableHead);

            if (curFunc.params && curFunc.params.length > 0) {
                // List params
                for (let param of curFunc.params) {
                    let paramTableRow = document.createElement('tr');
                    let paramName = document.createElement('td');
                    paramName.appendChild(document.createTextNode(param.name));
                    paramTableRow.appendChild(paramName);
                    let paramDesc = document.createElement('td');
                    paramDesc.appendChild(document.createTextNode(param.desc));
                    paramTableRow.appendChild(paramDesc);
                    paramTable.appendChild(paramTableRow);
                }
            } else {
                // Message about no params
                let paramTableRow = document.createElement('tr');
                let paramMsg = document.createElement('td');
                paramMsg.setAttribute('rowspan', '2');
                paramMsg.appendChild(document.createTextNode(SWAC.lang.dict.ExplainComponents.noParams));
                paramTableRow.appendChild(paramMsg);
                paramTable.appendChild(paramTableRow);
            }
            funcArea.appendChild(paramTable);

            explDiv.appendChild(funcArea);
        }

        return explDiv;
    }

    /**
     * Converts a object to its text representation
     * 
     * @param {Object} obj Object
     * @returns {String} Text representation
     */
    convertToText(obj) {
        if (obj === null)
            return 'null';

        //create an array that will later be joined into a string.
        var string = [];

        //is object
        //    Both arrays and objects seem to return "object"
        //    when typeof(obj) is applied to them. So instead
        //    I am checking to see if they have the property
        //    join, which normal objects don't have but
        //    arrays do.
        if (typeof (obj) == "object" && (obj.join == undefined)) {
            string.push("{\n");
            for (let prop in obj) {
                string.push(prop, ": ", this.convertToText(obj[prop]), ",\n");
            }
            string.push("}");

            //is array
        } else if (typeof (obj) == "object" && !(obj.join == undefined)) {
            string.push("[")
            for (let prop in obj) {
                string.push(this.convertToText(obj[prop]), ",\n");
            }
            string.push("]")

            //is function
        } else if (typeof (obj) == "function") {
            string.push(obj.toString())

            //all other values can be done with JSON.stringify
        } else {
            string.push(JSON.stringify(obj))
        }

        return string.join("")
    }

    /**
     * Creates a description of the given HTMlfragment acordingly
     * 
     * @param {String} htmlfragment HTMLfragment to explain
     * @param {SWACComponent} component SWAC component to explain fragment with
     * @param {DOMElement} reqDiv DOM element where to add the explanation
     * @returns {undefined}
     */
    explainHTMLFragment(htmlfragment, component, reqDiv) {
        this.encodeHTML(htmlfragment).then(function (codeElem) {
            let preElem = document.createElement('pre');
            preElem.appendChild(codeElem);
            reqDiv.appendChild(preElem);

            //TODO insert highlights with popup that descripes the highlighted element
        });
    }

    /**
     * Explains the styles this component offers
     * 
     * @param {SWACComponent} component Component to explain
     * @returns {Element|this.explainTplRequirements.reqDiv}
     */
    explainStyles(component) {
        let stylesDiv = document.createElement('div');

        // Create table
        let table = document.createElement('table');
        table.setAttribute('class', 'uk-table');
        let th = document.createElement('tr');
        let th1 = document.createElement('th');
        th1.innerHTML = SWAC.lang.dict.ExplainComponents.styleSelector;
        th.appendChild(th1);
        let th2 = document.createElement('th');
        th2.innerHTML = SWAC.lang.dict.ExplainComponents.styleDesc;
        th.appendChild(th2);
        table.appendChild(th);

        if (!component.desc) {
            let tr = document.createElement("tr");
            let td = document.creeateElement("td");
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.noDescription;
            tr.appendChild(td);
            table.appendChild(tr);
            stylesDiv.appendChild(table);
            return stylesDiv;
        }

        if (!component.desc.styles || component.desc.styles.length === 0) {
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            td.setAttribute('colspan', '2');
            td.innerHTML = SWAC.lang.dict.ExplainComponents.stylesNone;
            tr.appendChild(td);
            table.appendChild(tr);
        } else {
            // Create tablerow for each optional attribute
            for (let curStyle of component.desc.styles) {
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                td1.innerHTML = curStyle.selc;
                tr.appendChild(td1);
                let td2 = document.createElement("td");
                td2.innerHTML = curStyle.desc;
                tr.appendChild(td2);
                table.appendChild(tr);
            }
        }
        stylesDiv.appendChild(table);

        return stylesDiv;
    }

    /**
     * Explains available plguins
     * 
     * @param {SWACComponent} component Component where plugins should be explained from
     * @returns {Element|this.explainTplRequirements.reqDiv}
     */
    explainPlugins(component) {
        let pluginsDiv = document.createElement('div');

        if (component.options && component.options.plugins) {
            let explainAccordion = document.createElement('ul');
            explainAccordion.setAttribute('uk-accordion', 'uk-accordion');
            for (let [pluginname, curPlugin] of component.options.plugins) {
                let pluginLi = document.createElement('li');
                let pluginTitle = document.createElement('a');
                pluginTitle.classList.add('uk-accordion-title');
                pluginTitle.setAttribute('href', '#');
                pluginTitle.innerHTML = pluginname;
                pluginLi.appendChild(pluginTitle);
                let dataReqDiv = document.createElement('div');
                dataReqDiv.classList.add('uk-accordion-content');
                dataReqDiv.classList.add('plugindoc_' + curPlugin.id);
                pluginLi.appendChild(dataReqDiv);
                explainAccordion.appendChild(pluginLi);
                let thisRef = this;
                // Load component script
                import(SWAC.config.swac_root + 'components/' + component.name + '/plugins/' + curPlugin.id + '/' + curPlugin.id + 'SPL.js?vers=' + SWAC.desc.version)
                        .then(module => {
                            // Check if object is available
                            if (module.default) {
                                // Construct the component with default options
                                let explObj = Reflect.construct(module.default, []);
                                let allDiv = thisRef.explainAll(explObj);
                                dataReqDiv.appendChild(allDiv);
                            }
                        });
            }
            pluginsDiv.appendChild(explainAccordion);
        } else {
            pluginsDiv.appendChild(document.createTextNode(SWAC.lang.dict.ExplainComponents.plugins));
        }
        return pluginsDiv;
    }

    /**
     * Encodes a htmlfragment string and highlights it.
     * 
     * @param {String} htmlfragment HTML code fragment
     * @returns {Promise} Promise that resolves to an DOMElement with htmlfragment as text
     */
    encodeHTML(htmlfragment) {
        return new Promise((resolve, reject) => {
            // Highlight code elements allready existing on page
            let codeElems = document.querySelectorAll('pre code');
            for (let codeElem of codeElems) {
                hljs.highlightBlock(codeElem);
            }
            // Insert code from template and highlight
            let encodedhtml = he.encode(htmlfragment);
            let codeElem = document.createElement('code');
            codeElem.innerHTML = encodedhtml;
            hljs.highlightBlock(codeElem);
            resolve(codeElem);
        });
    }
    
    /**
     * Adds an error message to the page
     */
    addDocumentationError(e) {
        let forErrElem = this.requestor.querySelector('.swac_explain_forError');
        let errElem = forErrElem.cloneNode(true);
        errElem.querySelector('.swac_explain_errorMsg').innerHTML = e;
        errElem.classList.remove('swac_dontdisplay');
        this.requestor.appendChild(errElem);
    }
}