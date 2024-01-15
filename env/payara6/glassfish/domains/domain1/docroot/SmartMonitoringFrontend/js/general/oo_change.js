/**
 * Change page call. Replace every url parameter that exists in observed object with
 * the value of the selected one and recall page.
 */
window['oo_change_options'] = {
    onChange: function (evt) {
        let selected;
        for (let curInput of this.getInputs()) {
            selected = curInput.value;
        }
        
        let comp = document.querySelector('#oo_change').swac_comp;
        let selectedSet = comp.getMainSourceData().getSet(parseInt(selected));
        
        // Get current url without search parameters
        let url =  new URL(window.location.href.split('?')[0]);

        // No set selected
        if(!selectedSet) {
            document.location = url;
            return;
        }
        
        for(let curParam of Object.keys(selectedSet)) {
            if(curParam.startsWith('swac_'))
                continue;
            url.searchParams.set(curParam, selectedSet[curParam]);
        }
        document.location = url;
    }
};

document.addEventListener('swac_oo_change_complete', function (evt) {
    // Set selected entry
    let inputs = {};
    inputs[window.swac.getParameterFromURL('id')] = true;
    let elem = document.querySelector('#oo_change');
    elem.swac_comp.setInputs(inputs);

    // -2 because of the no selection option and swac_repeatForSet
    if (elem.swac_comp.countOptions() - 2 <= 1) {
        elem.style.display = 'none';
    }
});