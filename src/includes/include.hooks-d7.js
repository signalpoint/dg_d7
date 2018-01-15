/**
 * DRUPALGAP 7 HOOKS
 */

/**
 * Implements hook_services_request_pre_postprocess_alter().
 */
function dg_d7_services_request_pre_postprocess_alter(options, result) {
  if (options.service == 'system' && options.resource == 'connect') {

    // We borrow some code from jDrupal 8's resolve handler.
    jDrupal.connected = true;

    // Build a jDrupal 8 user object out of a jDrupal 7 user object.
    var account = result.user;
    if (!account.uid) { jDrupal.setCurrentUser(jDrupal.userDefaults()); }
    else {
      var accountObj = {
        uid: [ { value: account.uid } ],
        name: [ { value: account.name } ],
        mail: [ { value: account.mail } ],
        status: [ { value: account.status } ],
        created: [ { value: account.created } ],
        changed: [ { value: account.changed } ],
        access: [ { value: account.access } ],
        init: [ { value: account.init } ],
        roles: []
      };
      for (var rid in account.roles) {
        if (!account.roles.hasOwnProperty(rid)) { continue; }
        accountObj.roles.push({
          target_id: account.roles[rid],
          target_type: 'user_role'
        });
      }
      jDrupal.setCurrentUser(new jDrupal.User(accountObj));
    }

  }
  else if (options.service == 'user' && options.resource == 'logout') {
    jDrupal.setCurrentUser(jDrupal.userDefaults());
  }
}