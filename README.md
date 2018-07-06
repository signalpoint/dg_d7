# dg_d7

A DrupalGap 8 module that provides a bridge to a Drupal 7 site via Services and Views Datasource.

## Hooks

To handle an offline scenario when the app first starts up, try something this:

```
/**
 * Implements hook_deviceready_offline().
 */
function example_deviceready_offline(xhr, status, msg) {

  // Tell dg8 to continue rendering the page.
  dg.continue();

  // Give dg8 a chance to render the page, then show them a modal about the connection problem.
  setTimeout(function() {
    var modalContent = {};

    modalContent.error = {
      _theme: 'message',
      _type: 'error',
      _message: status + ' | ' + msg
    };
    modalContent.info = {
      _markup: '<p>' + dg.t('Please check your Internet connection.') + '</p>'
    };
    modalContent.try_again = {
      _markup: dg.b(dg.t('Try again'), {
        _attributes: {
          class: ['btn-cw'],
          onclick: "dg.reload()"
        }
      })
    };

    dg.modal(modalContent, { id: 'modal-offline', title: dg.t('Network Issue') });
  }, 1);

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
