document.addEventListener('uiComplete',function() {
// Get save button
let saveBtn = document.querySelector('.adm_wlan_save');
// Execute script
saveBtn.addEventListener('click', function (evt) {
    evt.preventDefault();
    // Check input
    let form = document.querySelector('#adm_wlan_form');
    if(!form.reportValidity()) {
        return;
    }

    // Execute script
    let scriptURL = '../docroot'+location.pathname.replace('/sites/','/js/').replace('wlan.html','') + 'wlan.py';
    let bridgeURL = '/SmartBridge/smartbridge/bridge/execute?command=python&file='+scriptURL +'&parameter=';
    bridgeURL += "-s," + document.getElementById('adm_wlan_ssid').value + "";
    bridgeURL += ",-p," + document.getElementById('adm_wlan_psk').value + "";

    fetch(bridgeURL).then(function (res) {
        if (res.status >= 400)
            UIkit.modal.alert(window.swac.lang.dict.app.adm_wlan_err);
    });
});
});