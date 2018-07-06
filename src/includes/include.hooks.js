/**
 * DRUPALGAP 8 HOOKS
 */

function dg_d7_deviceready() {

  // Set the path to Drupal 7.
  d7.config('sitePath', jDrupal.config('sitePath'));

  // Take over the start of the application.
  return new Promise(function(ok, err) {

    system_connect({
      success: function(data) {

        // Tell DrupalGap to continue and resolve.
        dg.continue();
        ok();

      },
      error: function(xhr, status, msg) {
        console.log(arguments);

        // If no one implemented deviceready_offline to handle this situation, just call dg.error() to handle it.
        var hookName = 'deviceready_offline';
        if (!jDrupal.moduleImplements(hookName)) {
          ok();
          setTimeout(function() { dg.error(xhr, status, msg); }, 1);
        }
        else { jDrupal.moduleInvokeAll(hookName, xhr, status, msg); }

      }
    });

  });
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
