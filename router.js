/** @module router */

module.exports = Router;

var url = Require('url');

function Router() {
  this._getRoutes = [];
  this._postRoutes = [];
}

function pathToRegularExpression(path){
  var tokens = path.split('/');
  var keys = [];
  var parts = tokens.map(function(token) {
    if(token.charAt(0) == ":"){
      keys.push(token.slice(1));
      return "(\w+)";
    } else{
      return token;
    }
  });
  var regexp = new RexExp('^' + parts.join('/') + '/?$');
  return {
    regexp: regexp,
    keys: keys
  }
}

Router.prototype.get = function (path, handler) {
  var path = pathToRegularExpression(path);
  route.handler = handler;
  this._getRoutes.push(route);
}

Router.prototype.post = function (path, handler) {
  var path = pathToRegularExpression(path);

  this._postRoutes[path] = handler;
}

Router.prototype.route(req, res) {
  var urlParts = url.parse(req.url);

  switch(req.method){
    case 'get':
      for(var i = 0; i < this._getRoutes.length; i++){
        var route = this._getRoutes[i];
        var match = route.regexp.exec(urlParts.pathname);
        if(match){
          req.params = {};
          for (var j = 1; j < matches.length; j++) {
            req.params[route.keys[j-1]] = match[j];
          }

          return routes.handler(req, res);
        }
      }
      res.statusCode = 400;
      res.statusMessage = "Resource not found";
      res.end();
      break;
    case 'post':
      for(var i = 0; i < this._postRoutes.length; i++){
        var match = this._postRoutes.exec(urlParts.pathname);
        if(match){
          return this._postActions[i](req, res);
        }
      }
      res.statusCode = 400;
      res.statusMessage = "Resource not found";
      res.end();
      break;
    default:
      var msg = "Unknown method " + req.method;
      res.statusCode = 400;
      res.statusMessage = msg;
      console.error(msg);
      res.end(msg);
  }
}
