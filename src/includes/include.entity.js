d7._menuObjectType = null; // Holds the entity type used by the view controller.
d7._menuObject = null; // Holds the entity loaded by the view controller.

d7.getMenuObjectType = function() {
  return d7._menuObjectType;
};
d7.getMenuObject = function() {
  return d7._menuObject;
};
d7.setMenuObjectType = function(entityType) {
  d7._menuObjectType = entityType;
};
d7.setMenuObject = function(entity) {
  d7._menuObject = entity;
};
d7.clearMenuObjectType = function() {
  d7._menuObjectType = null;
};
d7.clearMenuObject = function() {
  d7._menuObject = null;
};

d7.entityViewController = function(entityId) {

  var route = dg.router.load(dg.getPath());
  var entityType = route.defaults._dgEntityType;
  var attrPrefix = entityType.replaceAll('_', '-');
  var id = attrPrefix + '-' + entityId;

  return {

    entity: {
      _theme: 'bucket',
      _attributes: {
        id: id,
        class: [attrPrefix]
      },
      _fill: function(ok) {
        entity_load(entityType, entityId, {
          success: function(entity) {
            d7.setMenuObjectType(entityType);
            d7.setMenuObject(entity);
            if (entityType === 'node') {
              dg.qs('#' + id).classList.add(attrPrefix + '-' + entity.type.replaceAll('_', '-'));
            }
            ok(route.defaults._dgController(entity));
          },
          error: function(xhr, status, msg) {
            ok(route.defaults._dgController(null, xhr, status, msg));
          }
        });
      }
    }

  };

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
