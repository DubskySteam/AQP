var explaincomponent_options = {
    componentName: 'Geolocation'
};

var geolocation_options = {
    onLocateFunctions: [
      function(position){
          alert("position recived. See javascript console for more information");
          console.log(position);
      }  
    ]
};
