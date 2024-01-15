document.addEventListener('swac_components_complete', function (evt) {
    let elem = document.querySelector('.swac_version');
    elem.innerHTML = window.swac.desc.version;

    const d = new Date();
    // format to YYYY-MM-DDTHH:mm:ss.sssZ
    let dstr = d.getFullYear() + '-';
    let month = (d.getMonth() + 1);
    if (month < 10)
        dstr += '0';
    dstr += month + '-';
    let day = d.getDate();
    if (day < 10)
        dstr += '0';
    dstr += day + 'T';
    let hour = d.getHours();
    if (hour <= 10)
        dstr += '0';
    dstr += hour + ':';
    let minute = d.getMinutes();
    if (minute < 10)
        dstr += '0';
    dstr += minute + ':';
    let seconds = d.getSeconds();
    if (seconds < 10)
        dstr += '0';
    dstr += seconds + ':' + d.getMilliseconds();
    let telem = document.querySelector('.local_time');
    telem.innerHTML = dstr;
});

