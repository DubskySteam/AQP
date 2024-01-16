var tables = [];
for (let i = 10; i < 1085; i++) {
    let tabledata = {
        id: i,
        collection_1: 'data_' + i,
        smartdataurl_1: 'http%3A%2F%2Fepigraf01%2Ead%2Efh-bielefeld%2Ede%3A8080%2FSmartDataEnvironOld',
        storage_1: 'smartmonitoring',
        collection_2: 'data_' + i,
        smartdataurl_2: 'http%3A%2F%2Fepigraf01%2Ead%2Efh-bielefeld%2Ede%3A8080%2FSmartDataEnviron',
        storage_2: 'smartmonitoring'
    };
    tables[i] = tabledata;
}

document.addEventListener('swac_components_complete', function () {
    let runbtn = document.querySelector('.runcompare');
    runbtn.addEventListener('click', function (evt) {
        evt.preventDefault();
        doCompare(tables.findIndex(findNotUndefined));
    });
});

function findNotUndefined(set) {
    if (set)
        return true;
    else
        return false;
}

function doCompare(compareNo) {
    let curTbl = tables[compareNo];
    if (curTbl) {
        requestCompare(curTbl).then(function () {
            let nextNo = compareNo + 1;
            doCompare(nextNo);
        });
    }
}

function requestCompare(curTbl) {
    return new Promise((resolve, reject) => {
        // Fetch compare
        fetch('/SmartDataLyser/smartdatalyser/compare/count?smartdataurl_1='
                + curTbl.smartdataurl_1
                + '&collection_1=' + curTbl.collection_1
                + '&storage_1=' + curTbl.storage_1
                + '&smartdataurl_2=' + curTbl.smartdataurl_2
                + '&collection_2=' + curTbl.collection_2
                + '&storage_2=' + curTbl.storage_2).then(function (res) {

            res.json().then(function (json) {
                let resElem = document.querySelector('[id="' + curTbl.id + '"');

                if (res.ok) {
                    resElem.innerHTML = json.result;
                } else if (res.status === 404 && json.result.includes('equal')) {
                    resElem.innerHTML = json.result;
                } else if (res.status === 404) {
                    resElem.innerHTML = 'not found';
                } else if (json.exceptions) {
                    resElem.innerHTML = json.exceptions[0];
                }
                resolve();
            });
        }).catch(function (err) {
            console.log('error while compare:');
            console.log(err);
            resolve();
        });
    });
}