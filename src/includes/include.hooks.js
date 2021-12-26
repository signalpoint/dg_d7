/**
 * DRUPALGAP 8 HOOKS
 */

function dg_d7_deviceready() {

  // Set the path to Drupal 7.
  d7.config('sitePath', jDrupal.config('sitePath'));

  // Take over the start of the application.
  return new Promise(function(ok, err) {

    // Set up a default handler that looks to see if anyone implemented hook_deviceready_offline() to handle the
    // situation, otherwise it'll forward along to dg.error().
    var errorHandler = function(xhr, status, msg) {
      console.log(arguments);
      var hookName = 'deviceready_offline';
      if (!jDrupal.moduleImplements(hookName)) {
        ok();
        setTimeout(function() { dg.error(xhr, status, msg); }, 1);
      }
      else { jDrupal.moduleInvokeAll(hookName, xhr, status, msg); }
    };

    // If the device has a connection, make the system connect call to d7, otherwise call the error handler.
    if (dg.hasConnection()) {
      system_connect({
        success: function(data) {
          dg.continue(); // Tell DrupalGap to continue and resolve.
          ok();
        },
        error: errorHandler
      });
    }
    else { errorHandler(null, null, dg.t('No network connection.')); }

  });
}

/**
 * Implements hook_pre_process_route_change
 */
function dg_d7_pre_process_route_change(newPath, oldPath) {

  // Clear any menu object entity info.
  d7.clearMenuObjectType();
  d7.clearMenuObject();

}

/**
 * Implements hook_form_alter().
 */
function dg_d7_form_alter(form, form_state, form_id) {
  return new Promise(function(ok, err) {

    if (form_id == 'UserLoginForm') {

      // Take over the login form's submit handler.
      form._submit = ['dg_d7.user_login_form_submit'];

    }

    ok();

  });
}

dg_d7.user_login_form_submit = function(form, formState) {
  return new Promise(function(ok, err) {
    //console.log(form_state);

    // Let's login to Drupal...
    user_login(formState.getValue('name'), formState.getValue('pass'), {
      success: function(result) {
        console.log(result);
        ok();
      },
      error: function(xhr, status, msg) {
        console.log(arguments);
        document.getElementById('edit-pass').value = '';
        dg.alert(JSON.parse(msg)[0]);
        err();
      }
    });

  });
};
