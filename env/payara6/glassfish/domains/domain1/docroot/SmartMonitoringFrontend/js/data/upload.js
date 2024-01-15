/**
 * Class for controling dataupload view. With definitions and options for
 * page components.
 * 
 */

// Options for the file upload dialog (SWAC_upload component)
var fileupload_options = {};
fileupload_options.uploadtarget = "file/create";
fileupload_options.dataComponents = [];
fileupload_options.dataComponents[0] = {};
fileupload_options.dataComponents[0].selector = '#observedobject_select';
fileupload_options.dataComponents[0].required = true;
fileupload_options.dataComponents[0].requiredMessage = 'Bitte wählen Sie zuerst ein Observedobject zu dem hochgeladen werden soll.';
fileupload_options.dataComponents[0].requiredGt = 0;
fileupload_options.dataComponents[0].requiredGtMessage = 'Bitte wählen Sie zuerst ein Observedobject zu dem hochgeladen werden soll.';


var dataupload = {};

// Correct displayed height when finished loading page
$(document).on("uiComplete", function () {
    document.querySelector("#gotoobservedobject").addEventListener('click', dataupload.gotoobservedobject);
});

// Check if there are observedobjects when not display warning
dataupload.onObservedObjectSelectCompleted = function (requestors) {
    // If there are no observedobjects to upload to
    if (requestors.observedobject_select.swac_comp.countOptions() < 1) {
        // Hide upload area
        let datauploadarea = document.getElementById('datauploadarea');
        datauploadarea.style.display = "none";
        let warning = document.getElementById("noobservedobjectswarning");
        warning.classList.remove('swac_dontdisplay');
    } else {
        // Select observedobject when id was given in url
        let ooid = SWAC.getParameterFromURL('id');
        if (typeof ooid !== 'undefined' && ooid !== null) {
            let selected = {};
            selected[ooid] = true;
            requestors.observedobject_select.swac_comp.setInputs(selected);
        }
    }
};
SWAC_reactions.addReaction(dataupload.onObservedObjectSelectCompleted, "observedobject_select");

// Goto the selected observedobject
dataupload.gotoobservedobject = function (evt) {
    evt.preventDefault();
    let ooselectElem = document.getElementById("observedobject_select");
    let inputs = ooselectElem.swac_comp.getInputs();
    let ooid = inputs[0].value;
    if (ooid === '0') {
        UIkit.notification({
            message: 'Es wurde kein ObservedObject ausgewählt',
            status: 'error',
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center'
        });
    } else {
        SWAC_nav.routeTo('objectview.html', ooid);
    }
};