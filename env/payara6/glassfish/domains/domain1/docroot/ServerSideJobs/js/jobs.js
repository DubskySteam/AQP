var jobeditor_options = {
    allowedToAddNew: true
};


// TODO: Replace this with the endpoint from the configuration.js file.
const endpoint = "/ServerSideJobsBackend/serversidejobs/";

/**
 * Build the form when page was loaded
 * 
 * @returns {undefined}
 */
window.onload = function () {
    const jobForm = document.querySelector('#job-form');

    fetch(`${endpoint}actions`)
            .then(response => response.json())
            .then(data => mapClasses(data));

    jobForm.onsubmit = async (e) => {
        e.preventDefault();

        const formdata = new FormData(jobForm);
        const bodyData = Object.fromEntries(formdata.entries());

        bodyData["repeatDay"] = Number(bodyData["repeatDay"]);
        bodyData["repeatHour"] = Number(bodyData["repeatHour"]);
        bodyData["repeatMinute"] = Number(bodyData["repeatMinute"]);
        bodyData["repeatSecond"] = Number(bodyData["repeatSecond"]);
        bodyData["personId"] = Number(bodyData["personId"]);

        // Get job params
        bodyData.params = [];
        let jobParamInputs = document.querySelectorAll('.job_param');
        for(let curInput of jobParamInputs) {
            bodyData.params.push({
                name: curInput.name,
                value: curInput.value,
                cls: curInput.getAttribute('cls')
            });
        }

        fetch(`${endpoint}jobs`, {
            body: JSON.stringify(bodyData),
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (res.ok) {
                // Redirect to dashboard
                window.location = window.location + "/../index.html";
            }
        }).catch(err => {
            UIkit.modal.alert('Es ist ein Fehler beim Speichern aufgetreten: ' + err);
        });
    };
};

function mapClasses(classes) {
    const jobFormClasses = document.querySelector("#job-form-class-select");
    let state = {};

    while (jobFormClasses.firstChild) {
        jobFormClasses.removeChild(jobFormClasses.firstChild);
    }

    const defaultSelection = document.createElement("option");

    defaultSelection.disabled = true;
    defaultSelection.selected = true;
    defaultSelection.value = true;
    defaultSelection.innerHTML = "--- Bitte wählen ---";

    jobFormClasses.appendChild(defaultSelection);

    classes.list.forEach(strategy => {
        const selectOption = document.createElement("option");

        selectOption.value = strategy.name;
        selectOption.innerHTML = strategy.name;
        jobFormClasses.appendChild(selectOption);
        state[strategy.name] = strategy.params;
    });

    jobFormClasses.addEventListener('change', (event) => {
        const jobClass = event.target.value;
        mapParams(state[jobClass]);
    });
}

function mapParams(params) {
    const jobFormControls = document.querySelector("#job-form");
    const test = document.createElement("p");

    while (jobFormControls.lastChild && jobFormControls.lastChild.id !== "csel") {
        jobFormControls.removeChild(jobFormControls.lastChild);
    }

    if (!Array.isArray(params)) {
        return;
    }
    params.forEach(param => {
        const paramSegment = document.createElement("div");
        const formControls = document.createElement("div");
        const label = document.createElement("label");
        const control = buildControl(param);

        paramSegment.classList.add("uk-padding-small");
        paramSegment.classList.add("uk-padding-remove-horizontal");
        formControls.classList.add("uk-form-controls");

        label.for = control.id;
        label.innerHTML = param.name;
        label.classList.add("uk-form-label");

        if (param.required) {
            const reqSpan = document.createElement("span");

            reqSpan.classList.add("uk-text-warning");
            reqSpan.classList.add("uk-text-bold");
            reqSpan.innerHTML = " *";

            label.appendChild(reqSpan);
        }

        formControls.appendChild(control);
        paramSegment.appendChild(label);
        paramSegment.appendChild(formControls);
        jobFormControls.appendChild(paramSegment);
    });

    const submit = document.createElement("input");

    submit.type = "submit";
    submit.value = "Hinzufügen";
    submit.classList.add("uk-button");
    submit.classList.add("uk-button-primary");

    jobFormControls.appendChild(submit);
}

function buildControl(param) {
    let control;

    switch (param.type) {
        default:
            control = document.createElement('input');
            control.classList.add('uk-input');
            control.classList.add('job_param');
            control.type = 'text';
            control.placeholder = param.description || "Undefiniert";
    }

    control.required = param.required;
    control.name = param.name;
    control.setAttribute('cls',param.cls);
    
    control.id = `control-${param.name}`;

    return control;
}
