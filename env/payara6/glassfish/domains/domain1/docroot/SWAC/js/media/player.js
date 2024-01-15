var explaincomponent_options = {
    componentName: 'Mediaplayer'
};

var example2_options = {
    commentRequestor: {
        fromName: '../../data/media/player/comments.json'
    }
};

// Example 5: Editable playlist
var player_example5_options = {
    allowDel: true,
    customAfterRemoveSet: function (requestor) {
        // Code to directly execute after playlist entry was removed
        // e.g. remove connection from database
    }
};
