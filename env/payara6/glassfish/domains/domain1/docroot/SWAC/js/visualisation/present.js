var explaincomponent_options = {
    componentName: 'Present'
};

var present_example5_options = {
    plugins: new Map()
};
present_example5_options.plugins.set('TableFilter', {
    id: 'TableFilter',
    active: true
});

var present_example6_options = {
    plugins: new Map()
};
present_example6_options.plugins.set('TableSort', {
    id: 'TableSort',
    active: true
});

var present_example7_options = {
    lazyLoading: 5
};

document.addEventListener('swac_present_example7_complete', function (evt) {
    let present_example7_btn = document.querySelector('.present_example7_btn');
    present_example7_btn.addEventListener('click', function (evt) {
        evt.preventDefault();
        let comp = document.querySelector('#present_example7').swac_comp;
        comp.addDataLazy();
    });
});

var present_example8_options = {
    lazyLoading: 5,
    lazyLoadMode: 'end'
};