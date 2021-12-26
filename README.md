# dg_d7

A DrupalGap 8 module that provides a bridge to a Drupal 7 site via Services and Views Datasource.

## Hooks

To handle an offline scenario when the app first starts up, try something this:

```
/**
 * Implements hook_deviceready_offline().
 */
function example_deviceready_offline(xhr, status, msg) {

  // Do some stuff...

  // Go to my custom offline page.
  dg.goto('my/offline/page');

  // Do some other stuff...

  // Tell dg8 to continue rendering the page.
  dg.continue();

}
```

## Examples

Provide a route that delivers a node to a controller for rendering...

*The route*
```
routes["example.article"] = {
  "path": "/article\/(.*)",
  "defaults": {
    "_title": "Article",
    _controller: d7.entityViewController,
    _dgEntityType: 'node',
    _dgController: example.pageArticle
  }
};
```
*The controller*
```
example.pageArticle = function(node) {

  dg.setPageTitle(node.title);
  
  var content = {};
  content.title = {
    _markup: '<h1>' + node.title + '</h1>'
  };
  return content;
  
};
```

Later, we can use `dg_d7.getMenuObject()` elsewhere in our code to get the entity:

```
var node = dg_d7.getMenuObject();
console.log(node.title);
```
