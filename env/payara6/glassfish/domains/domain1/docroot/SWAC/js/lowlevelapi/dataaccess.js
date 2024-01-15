window.onload = function () {
    let btn = document.getElementById('getdata');
    btn.addEventListener('click', function (evt) {
        evt.preventDefault();
        let req = document.getElementById('datapresent');
        req.swac_comp.addDataFromReference("ref://../../data/exampledata_list.json?filter=id,gt,3&filter=id,lt,7&storage=smartmonitoring");
    });
};