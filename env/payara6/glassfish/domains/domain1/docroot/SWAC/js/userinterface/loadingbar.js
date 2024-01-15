var explaincomponent_options = {
    componentName: 'Loadingbar'
};

var loadingbar_default_options = {};
loadingbar_default_options.max = 100;

var loadingbar_error_options = {};
loadingbar_error_options.max = 100;

document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function () {
        let loading_requestor = document.getElementById("loadingbar_default");
        loading_requestor.swac_comp.reset();

        let timer = setInterval(function () {
            if (loading_requestor.swac_comp.options.value >= loading_requestor.swac_comp.options.max)
                clearInterval(timer);
            loading_requestor.swac_comp.addValue(10);
        }, 1000);

    }, "loadingbar_default");


    window.swac.reactions.addReaction(function () {
        let loading_requestor = document.getElementById("loadingbar_error");
        loading_requestor.swac_comp.showAll();
        loading_requestor.swac_comp.errorState();
    }, "loadingbar_error");
});