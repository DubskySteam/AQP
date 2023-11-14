var create_user_options = {
    showWhenNoData: true,
    allowAdd: true,
    directOpenNew: true,
    aterSave: function(fromName, set) {
        UIkit.modal.alert(window.swac.lang.dict.RoNeKo.savedredirect);
        window.location = 'regconfirm.html';
    }
};