# d7
A DrupalGap 8 module that provides a bridge to a Drupal 7 site via Services and Views Datasource.

# Examples

Provide a route that to deliver a node to a controller for rendering...

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
