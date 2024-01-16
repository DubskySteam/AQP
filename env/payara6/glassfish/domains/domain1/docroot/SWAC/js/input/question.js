var explaincomponent_options = {
    componentName: 'Question'
};

var example1_options = {};
example1_options.showWhenNoData = false;
example1_options.timeToReanswer = null;
example1_options.afterSaveTxt = 'Thank you for your request. We will answer as soon as possible.';
example1_options.afterSaveLoc = 'http://vielendankseite';

var example2_options = {};
example2_options.timeToReanswer = 1;
example2_options.afterSaveTxt = 'Thank you for your input!';
// Immediately call the save function
example2_options.afterInputFunction = function(evt) {
    // Get requestor
    let requestor = document.querySelector('#question_example2');
    requestor.swac_comp.onSend(evt);
};