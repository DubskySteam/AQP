var joblist_options = {
    showWhenNoData: false,
    sortable: true
};
document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function () {
        let joblistElem = document.querySelector('#joblist');
        let repeatedForSets = joblistElem.querySelectorAll('tr.swac_repeatedForSet');
        for(let curRepForSet of repeatedForSets) {
            // Add job execution handler
            let changeJobExecElem = curRepForSet.querySelector('.changeJobExecBtn');
            changeJobExecElem.addEventListener('click', onChangeJobExecution);
            // Change jobOperation desc and icon
            if (curRepForSet.swac_dataset.status === 'scheduled' || curRepForSet.swac_dataset.status === 'running') {
                changeJobExecElem.setAttribute('uk-tooltip','Job anhalten');
                let changeJobExecIcon = changeJobExecElem.querySelector('[uk-icon]');
                changeJobExecIcon.setAttribute('uk-icon', 'ban');
            }
        }
    }, "joblist");
});

/**
 * When glicking the changeJobExecution button start job or stop job
 * 
 * @param {DOMEvent} evt Click event
 * @returns {undefined}
 */
function onChangeJobExecution(evt) {
    evt.preventDefault();
    // Find repeated for set
    let rep = findReapeatedForSet(evt.target);
    let jobid = rep.getAttribute('swac_setid');
    let jobstatusImgElem = rep.querySelector('.statusimg');
    let jobactiveImgElem = rep.querySelector('.activeimg');
    let jobchangeElem = rep.querySelector('.changeJobExecBtn');

    // If not started try start otherwise stop
    let url;
    if (jobchangeElem.innerHTML.includes('play-circle')) {
        url = window.swac.config.datasources[0].url.replace('[fromName]', 'jobscontroll/start/' + jobid);
    } else {
        url = window.swac.config.datasources[0].url.replace('[fromName]', 'jobscontroll/abort/' + jobid);
    }
    
    fetch(url).then(response => {
        if (response.ok) {
            response.json().then(function (jsonresp) {
                let status = jsonresp.status.toLowerCase();
                rep.swac_dataset.status = status;
                //Update action image
                let newbtnicon;
                let newbtntitle;
                if (status === 'running' || status === 'scheduled') {
                    newbtntitle = 'Job anhalten';
                    newbtnicon = 'ban';
                    jobactiveImgElem.setAttribute('src', "/SWAC/swac/components/Icon/imgs/true.svg");
                } else {
                    newbtntitle = 'Job starten';
                    newbtnicon = 'play-circle';
                    jobactiveImgElem.setAttribute('src', "/SWAC/swac/components/Icon/imgs/false.svg");
                }
                // Update 
                jobchangeElem.setAttribute('uk-tooltip', newbtntitle);
                jobchangeElem.innerHTML = '<span uk-icon="' + newbtnicon + '"></span>';
                //Update status image
                jobstatusImgElem.setAttribute('src', '../content/stateimgs/' + status + '.svg');
            }).catch(function (err) {
                console.error('Could not read status from run job: ' + err);
                rep.swac_dataset.status = 'unknown';
                //Update status image
                jobstatusImgElem.setAttribute('src', '../content/stateimgs/failed.svg');
            });
        } else {
            let msg;
            response.json().then(function (json) {
                msg = json.errors[0];
                // Replace doublepoints because ui-tooltip cant show texts with double point
                msg = msg.replace(new RegExp(':', 'g'), 'double point');
            }).catch(function (ex) {
                msg = response.text;
            }).finally(function () {
                //Update status image
                jobstatusImgElem.setAttribute('src', '../content/stateimgs/failed.svg');
                rep.swac_dataset.status = msg;
            });
        }
    }).catch((err) => {
        //Update status image
        jobstatusImgElem.setAttribute('srcset', '../content/stateimgs/failed.svg');
        rep.swac_dataset.status = 'failed';
    });
}

function findReapeatedForSet(element) {
    if (element.classList.contains("swac_repeatedForSet")) {
        return element;
    } else if (typeof element.parentElement !== 'undefined' && element.parentElement !== null) {
        return this.findReapeatedForSet(element.parentElement);
    }
    return null;
}