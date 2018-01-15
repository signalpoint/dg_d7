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
