var Worldmap2d_Help_en = {
  title: 'Hilfe',
  plugin_title: 'Plugins',
  plugin_text: 'If a plugin has a popup window, you can close it by clicking on the X in the upper right corner of the window or by clicking outside the window.',
  search_title: 'Search',
  search_text: 'Click on the magnifying glass to open a text field in which the name of a place can be entered. For searching, click the magnifying glass to the right of the text field or hit the enter button.',
  filtermeasurementpoints_title: 'Filter Measurement Point Types',
  filtermeasurementpoints_text: 'By clicking the filter button, a drop-down menu of measurement point types opens. After selecting a measurement point type, only measurement points of that type will be displayed on the map.',
  click_map_title: 'Clicking on the map',
  click_map_on_text: 'Clicking on the map is enabled. By clicking on the button, clicking on the map will be disabled.',
  click_map_off_text: 'Clicking on the map is disabled. By clicking on the button, clicking on the map will be enabled.',
  location_title: 'Track my location',
  location_on_text: 'If the user\'s location is updated, the map will be centered on this location. By clicking on the button, this function will be turned off.',
  location_off_text: 'If the user\'s location is updated, the map will not be centered on this location. By clicking on the button, the centering of the map on user location updates will be activated.',
  magicmapper_title: 'Magic Mapper',
  magicmapper_wand_off_text: 'By clicking the button, you need to enter the ip address of the Raspberry-Pi. After that you have to accept the SSL-Certificate. Then you can click the connect button to establish a connection to the Raspberry-Pi.',
  magicmapper_wand_on_text: 'You are connected to the MagicMapper and data is received. By clicking on the button, the connection will be terminated.',
  magicmapper_skull_text: 'Successfully connected to the Raspberry-Pi, but the Raspberry-Pi is currently not connected to the MagicMapper.',
  magicmapper_hourglass_text: 'The connection to the Raspberry-Pi is currently being established.',
  magicmapper_instructions_title: 'MagicMapper-Instructions',
  magicmapper_instructions_step1: 'First, turn on the MagicMapper. After that, turn on the Raspberry-Pi. The Raspberry-Pi will automatically connect to the MagicMapper and receive the data.',
  magicmapper_instructions_step2: 'Pay attention! The MagicMapper needs to calibrate itself after it has been started. During this time, the received data only contains zeros as coordinates. The calibration can take up to 30 seconds.',
  magicmapper_instructions_step3: 'If the MagicMapper and the Raspberry-Pi are running, you can try to establish a connection between the Raspberry-Pi and the application.',
  magicmapper_instructions_step4: ' Therefore, you have to enter the ip address of the Raspberry-Pi in the MagicMapperInterface. If the MagicMapper is used for the first time, you need to accecpt a security certificate. The button "Accept certificate" opens the page to accept the certificate in a new tab.',
  magicmapper_instructions_step5: 'After accecpting the certificate, you can connect to the Raspberry-Pi. If the connection is successful, the application will regularly receive positing updates until the connection is terminated.',
  magicmapper_instructions_step6: 'If the connection failed, you should try to check if the ip address is correct or if the Raspberry-Pi is ready to start a connection. A restart of the Raspberry-Pi might solve the problem.',
};

export default Worldmap2d_Help_en;
