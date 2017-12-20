var d7 = new dg.Module(); // Create the module.
dg.modules.d7 = d7; // Attach it to DrupalGap.

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

/**
 * CONFIG
 */
d7.config = function(name) {
  var value = typeof arguments[1] !== 'undefined' ? arguments[1] : null;
  if (value) {
    d7.settings[name] = value;
    return;
  }
  return d7.settings[name];
};

d7.sitePath = function() {
  return d7.settings.sitePath;
};
d7.basePath = function() {
  return d7.settings.basePath;
};
d7.restPath = function() {
  return this.sitePath() + this.basePath();
};
d7.path = function() {
  return this.restPath().substr(this.restPath().indexOf('://')+3).replace('localhost', '');
};

/**
 * DRUPALGAP 7 HOOKS
 */

/**
 * Implements hook_services_request_pre_postprocess_alter().
 */
function d7_services_request_pre_postprocess_alter(options, result) {
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

/**
 * DRUPALGAP 8 HOOKS
 */

function d7_deviceready() {

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
        ok(msg);
      }
    });

  });
}

/**
 * Implements hook_form_alter().
 */
function d7_form_alter(form, form_state, form_id) {
  return new Promise(function(ok, err) {

    if (form_id == 'UserLoginForm') {

      // Take over the login form's submit handler.
      form._submit = ['d7.user_login_form_submit'];

    }

    ok();

  });
}

d7.user_login_form_submit = function(form, formState) {
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


/**
 * VIEWS
 */

/**
 * The Views constructor.
 * @param {String} path The path to the Views REST Export in Drupal.
 * @constructor
 */
d7.Views = function(path) {
  this.path = path;
  this.results = null;
  this._count = null;
  this._page = null;
  this._pages = null;
  this._limit = null;
  this._pagerReady = false;
};

/**
 * Returns the path to the rest export.
 * @returns {String}
 */
d7.Views.prototype.getPath = function() {
  return this.path;
};

/**
 * Returns the results, if any.
 * @returns {*}
 */
d7.Views.prototype.getResults = function() {
  return this.results;
};

d7.Views.prototype.getCount = function() { return this._count; };
d7.Views.prototype.setCount = function(count) { this._count = count; };

d7.Views.prototype.getPage = function() { return this._page; };
d7.Views.prototype.setPage = function(page) { this._page = page; };


d7.Views.prototype.getPages = function() { return this._pages; };
d7.Views.prototype.setPages = function(pages) { this._pages = pages; };

d7.Views.prototype.getLimit = function() { return this._limit; };
d7.Views.prototype.setLimit = function(limit) { this._limit = limit; };

d7.Views.prototype.hasPages = function() { return !!this.getPages(); };

d7.Views.prototype.setPager = function(pager) { this._pager = pager; };
d7.Views.prototype.getPager = function() { return this._pager; };
d7.Views.prototype.pagerReady = function() { return !!this.getPager(); };

/**
 * Retrieves the Views' results from the Drupal site's rest export.
 */
d7.Views.prototype.getView = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.dg = {
      service: 'views',
      resource: null
    };
    var viewUrl = d7.restPath() + self.getPath();
    var page = self.getPage() !== null ? self.getPage() : dg._GET('page');
    if (page) { viewUrl += (viewUrl.indexOf('?') == -1 ? '?' : '&') + 'page=' + page; }
    req.open('GET', viewUrl);
    var loaded = function() {
      self.results = [];
      var results = JSON.parse(req.response);
      var view = results.view;
      self.setCount(view.count);
      self.setPage(view.page);
      self.setPages(view.pages);
      self.setLimit(view.limit);
      if (results.view.count) {
        for (var i in results[results.view.root]) {
          if (!results[results.view.root].hasOwnProperty(i)) { continue; }
          self.results.push(results[results.view.root][i][results.view.child]);
        }
      }
      resolve();
    };
    req.onload = function() {
      if (req.status == 200) {
        var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
        if (!invoke) { loaded(); }
        else { invoke.then(loaded); }
      }
      else { reject(Error(req.statusText)); }
    };
    req.onerror = function() { reject(Error("Network Error")); };
    req.send();
  });
};

/**
 * Loads a view and fetches its results from the Drupal site.
 * @param {String} path
 */
d7.viewsLoad = function(path) {
  return new Promise(function(resolve, reject) {
    var view = new d7.Views(path);
    view.getView().then(function() {
      resolve(view);
    });
  });
};

d7.showFormErrors = function(msg) {
  var messages = [];
  var data = JSON.parse(msg);
  if (data.form_errors) {
    for (var name in data.form_errors) {
      if (!data.form_errors.hasOwnProperty(name)) { continue; }
      messages.push(data.form_errors[name]);
    }
  }
  else { messages.push(msg); }
  if (messages.length) { dg.alert(messages.join('<br />')); }
};

d7.entityViewController = function(entityId) {
  var content = {};
  content.entity = {
    _theme: 'bucket',
    _grab: function() {
      return new Promise(function (fill, dump) {
        var route = dg.router.getActiveRoute();
        entity_load(route.defaults._dgEntityType, entityId, {
          success: function(entity) {
            fill(route.defaults._dgController(entity));
          },
          error: function(xhr, status, msg) {
            fill(route.defaults._dgController(null, xhr, status, msg));
          }
        });
      });
    }
  };
  return content;
};

/**
 * BEGIN: Verbatim copy of jDrupal 7's field has/get helpers.
 */

/**
 * Checks if an entity has at least one item for a given field name. Optionally pass in a
 * language code and/or delta value, otherwise they default to 'und' and 0 respectively.
 * @param {Object} entity
 * @param {String} fieldName
 * @param {String} language
 * @param {Number} delta
 * @returns {Boolean}
 */
d7.fieldHasItem = function(entity, fieldName, language, delta) {
  if (!language) { language = language_default(); }
  if (typeof delta === 'undefined') { delta = 0; }
  return entity[fieldName] &&
      entity[fieldName][language] &&
      entity[fieldName][language].length &&
      entity[fieldName][language][delta];
};

/**
 * Gets an item from an entity given field name. Optionally pass in a language code and/or
 * delta value, otherwise they default to 'und' and 0 respectively.
 * @param {Object} entity
 * @param {String} fieldName
 * @param {String} language
 * @param {Number} delta
 * @returns {*}
 */
d7.fieldGetItem = function(entity, fieldName, language, delta) {
  if (!language) { language = language_default(); }
  if (typeof delta === 'undefined') { delta = 0; }
  return entity[fieldName][language][delta];
};

/**
 * Given an entity and field name, this will return how many items are on the field. Optionally
 * pass in a language code otherwise it defaults to 'und'.
 * @param {Object} entity
 * @param {String} fieldName
 * @param {String} language
 * @returns {Number}
 */
d7.fieldGetItemCount = function(entity, fieldName, language) {
  return !language ?
      d7.fieldGetItems(entity, fieldName).length :
      d7.fieldGetItems(entity, fieldName, language).length;
};

/**
 * Gets items from an entity given a field name. Optionally pass in a language code otherwise
 * it defaults to 'und'.
 * @param {Object} entity
 * @param {String} fieldName
 * @param {String} language
 * @returns {*}
 */
d7.fieldGetItems = function(entity, fieldName, language) {
  if (!language) { language = language_default(); }
  return entity[fieldName][language];
};

/**
 * @see jDrupal.fieldSetItem().
 */
d7.fieldSetItem = function(entity, fieldName, propertyName, value, language, delta) {
  if (!language) { language = language_default(); }
  if (typeof delta === 'undefined') { delta = 0; }
  if (!entity[fieldName]) { entity[fieldName] = {}; }
  if (propertyName) {
    if (!entity[fieldName][language]) { entity[fieldName][language] = []; }
    if (!entity[fieldName][language][delta]) { entity[fieldName][language][delta] = {}; }
    entity[fieldName][language][delta][propertyName] = value;
  }
  else { entity[fieldName][language][delta] = value; }
};

/**
 * END
 */
