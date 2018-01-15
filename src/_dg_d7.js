dg.createModule('dg_d7');
var d7 = dg_d7;

/**
 * Initializes the jDrupal JSON object.
 */
d7.init = function() {
  // General properties.
  //d7.csrf_token = false;
  //d7.sessid = null;
  //d7.connected = false; // Will be equal to true after the system connect.
  d7.settings = {
    sitePath: null,
    basePath: '/'
  };
};

// Init d7.
d7.init();
