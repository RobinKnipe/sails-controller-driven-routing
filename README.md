# sails-controller-driven-routing
A routing configuration similar to blueprint that reads the routes from the controller so everything is kept in one place

It relies on blueprints validating your configuration (because I didn't want to copy/paste), but you could maybe disable blueprints entirely in production if you're feeling courageous and don't need any of its helpers.

## Motivation
* I wanted to support have a controller that has `n` accessible points
* I wanted to export my private methods to allow for easy testing (I just discovered [Rewire](https://www.npmjs.com/package/rewire) so that's probably no longer true).
* I didn't want those private methods to be exposed to http
* I wanted to keep all the configuration in the controller rather than updating the `routing.js`
* I wanted to handle multiple HTTP verbs without having to have a `switch()` at the top of each exposed method.

## Usage

`$ npm instal sails-controller-driven-routing`
Your controller can now look like the following:

MyController.js
```javascript
module.exports = {
  _config: {
    actions: false, //disable built in blueprints
    shortcuts: false, //disable built in blueprints
    rest: false, //disable built in blueprints
    explicitRoutes: {
      'OPTIONS /hello/world': 'mycontroller.world'
    },
    exposedMethods: [
      'foobar'
    ]
  },
  world: function(res, req) {
    return res.ok("hello");
  },
  foobar: function(res, req) {
    return res.ok("bar");
  },
  foobarPost: function(res, req) {
    return res.ok("par");
  },
};
```

Now:
`OPTIONS /hello/world` will respond with `hello`

`GET/POST/DELETE/OPTIONS/PUT/etc /mycontroller/foobar` will respond with `bar`

`POST /mycontroller/foobar` will respond with `par`

You can also specify a `prefix` that'll work the same way as blueprints ones do which will override the 'mycontroller' segment of the url for the `exposedMethods` section.

# TODO:
- [ ] unit tests

Hopefully this will prove useful to someone else, pull requests welcome if you want to tidy it up a bit :)
