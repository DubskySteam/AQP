document.addEventListener('DOMContentLoaded', function() {
    var delay = 300;

    setTimeout(function() {
        var group_title = document.getElementById('participant_sum').innerHTML;
        var participant_arr = group_title.split('tr class="swac_repeatedForValue"');
        document.getElementById('participant_sum').innerHTML = "";
        document.getElementById('participant_sum').innerHTML = ((participant_arr.length - 1) / 2); 
    }, delay);

});

document.addEventListener('DOMContentLoaded', function() {
    var delay = 300;

    setTimeout(function() {
        var group_image = document.getElementById('group_image').innerHTML;
        console.log("Ausgabe Gruppen Bild: " + group_image);
    }, delay);

});