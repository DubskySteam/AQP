document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function () {
        alert("This is a reaction: head_navigation is loaded.");
    }, "head_navigation");
});