var charts_options = {
    showWhenNoData: true,
    datadescription: '#charts_legend',
    yAxis1AttrName: 'pm10_0',
    plugins: new Map()
};
//charts_options.plugins.set('Barchart', {
//    id: 'Barchart',
//    active: true
//});
charts_options.plugins.set('Linechart', {
    id: 'Linechart',
    active: true
});

var selectobject_options = {
    onSelect: function (evt) {
        evt.preventDefault();
        // Get observed object information
        let ooid = evt.target.value;

        // Get the model
        let Model = window.swac.Model;
        let ooProm = Model.load({
            fromName: 'observedobject/get',
            fromWheres: {
                id: ooid
            },
            idAttr: 'id',
            reloadInterval: 10000
        });
        ooProm.then(function (oos) {
            for (let curSet of oos) {
                if(!curSet)
                    continue;
                let req = document.getElementById('charts');
                req.swac_comp.addDataFromReference('ref://' + curSet.collection);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
};