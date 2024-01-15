var screenboard_options = {};
screenboard_options.specialButtons = [];
screenboard_options.specialButtons[0] = {
    key: 'icon: sign-in',
    func: function(evt) {
        alert('Special button pressed = custom function executed!');
    }
};