/**
 * Sample data for useing the guide component
 */
var exampleguide = [];
exampleguide[0] = {
    onevt: "click", 
    onelement: "document", 
    type: "message",
    title: "SWAC guide component", 
    message: 'Welcome to the SWAC_guide component!<br/>\n\
With this component you can create nice demonstrations of your web application, or\n\
a guide to assist first time users.<br>\n\
This guide will show you how to create a presentation.'
    };
exampleguide[1] = {
    onevt: "step",
    type: "message",
    title: 'Simple slide',
    message: 'You can create a simple slide by defining a dataset with the attributes:<dl>\n\
<dt>onevt</dt>\n\
<dd>Set onevt to "step" so it will be shown as a slide</dd>\n\
<dt>type</dt>\n\
<dd>Set type to "message" to display a message centered on the screen</dd>\n\
<dt>title</dt>\n\
<dd>You can give your slide a title</dd>\n\
<dt>message</dt>\n\
<dd>The message to display. It supports full html formating.</dd>\n\
</dl>'
};  
exampleguide[2] = {
    onevt: "step",
    type: "message",
    onelement: "#guidebutton",
    tooltip: "Tooltip from the presentation.",
    title: 'Point to the elements you mean',
    message: 'With the attribute <b>"onelement"</b> you can define a css-selector\n\
pointing to an element you refering to with your slide. It will then be marked\n\
with a step number. The same number as your slide has.<br>\n\
Additionaly you can use the <b>"tooltip"</b> attribute. The text in this attribute is\n\
displayed at the onelement, even if the slideshow is not active. So you can\n\
assist the users even after the show.'};

exampleguide[3] = {
    onevt: "step",
    type: "message",
    startfunc: function() { alert('Some litte custom code executed.'); },
    title: 'Starting custom functions',
    message: 'You can call your own functions when a slides come up. Simply\n\
put your function call into the <b>"startfunc"</b> attribute.'};

exampleguide[4] = {
    onevt: "step",
    type: "message",
    title: 'Show the page free',
    message: 'If you want to show the whole page for just one slide you can use\n\
the type <b>display</b>. It will hide the messsage area.'};

exampleguide[5] = {
    onevt: "step",
    type: "display",
    title: "Show the page"
};

exampleguide[6] = {
    onevt: "step",
    type: "message",
    title: 'Only go on when clicking on special element',
    message: 'The next step only shows up, when you click the "more" button. Search it now.'};

exampleguide[7] = {
    onevt: "click", 
    onelement: "#morebutton", 
    type: "message",
    title: "Congratulations!", 
    message: 'Wonderfull you found the "more" button. To archive this, simply define\n\
onevt: "click" and onelement: "your-css-selector" in the step.'
    };

exampleguide[8] = {
    onevt: "step",
    type: "message",
    title: 'Thats it for now',
    message: 'That are the possibilities for now. More to come in future releases.\n\
<br>Some last thing: There is a default ending slide...'};