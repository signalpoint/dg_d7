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
    req.open('GET', d7.restPath() + self.getPath());
    var loaded = function() {
      self.results = [];
      var results = JSON.parse(req.response);
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
 * END
 */
