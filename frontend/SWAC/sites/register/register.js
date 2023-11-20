var create_user_options = {
    showWhenNoData: true,
    allowAdd: true,
    directOpenNew: true,
    mainSource: 'http://localhost:8080/SmartUser/smartuser/user',
    afterSave: function(fromName, set) {
        UIkit.modal.alert(window.swac.lang.dict.RoNeKo.savedredirect);
        window.location = 'regconfirm.html';
    }
}; 