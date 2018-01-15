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
