var _ = require('lodash');

var http_verbs = ['get', 'options', 'head', 'post', 'put', 'delete'];

module.exports = function (sails) {

  /**
   * Expose blueprint hook definition
   */
  return {
    defaults: {
      controllerDrivenRoutes: {
        prefix: '',
        routes: {},
      }
    },

    initialize: function (cb) {

      var eventsToWaitFor = [];
      eventsToWaitFor.push('router:after');
      if (sails.hooks.policies) {
        eventsToWaitFor.push('hook:policies:bound');
      }
      if (sails.hooks.controllers) {
        eventsToWaitFor.push('hook:controllers:loaded');
      }
      sails.after(eventsToWaitFor, this.bindShadowRoutes);
      return cb();
    },

    bindShadowRoutes: function () {

      _.each(sails.middleware.controllers, function eachController(controller, controllerId) {
        if (!_.isObject(controller) || _.isArray(controller)) return;

        // Get globalId for use in errors/warnings
        var globalId = sails.controllers[controllerId].globalId;

        // Determine blueprint configuration for this controller
        var config = _.merge(
          sails.config.controllerDrivenRoutes,
          controller._config || {});

        // Validate blueprint config for this controller
        if (config.prefix && !config.prefix.match(/^\//)) {
          var originalPrefix = config.prefix;
          config.prefix = '/' + config.prefix;
        }

        // Determine base route
        var baseRoute = config.prefix + '/' + controllerId;

        if (config.pluralize) {
          baseRoute = pluralize(baseRoute);
        }

        // map any specfic routes that are in the controller
        _.map(config.explicitRoutes, function (action, route) {
          sails.log.silly('Binding action (' + action.toLowerCase() + ') blueprint/shadow route for controller:', controllerId);
          var opts = {
            controller: controllerId
          }
          if (_.isString(action)) {
            opts.action = action;
          }
          else {
            opts = _.merge(opts, action);
          }
          sails.router.bind(route, action);
        });

        // map the exposed methods of the controller
        _.each(config.exposedMethods, function (method) {
          var endpoint = method != 'index' ? method : '';         
          //handle the verbs
          _.each(http_verbs, function (verb) {
            var candidateMethod = method + verb;
            // handle special case for index
            if (controller[candidateMethod] !== undefined) {
              sails.log.silly('Binding ' + verb.toUpperCase() + " " + baseRoute + "/" + endpoint + ' to ' + controllerId + '.' + candidateMethod);
              sails.router.bind(verb.toUpperCase() + " " + baseRoute + "/" + endpoint, {
                controller: controllerId,
                action: candidateMethod
              });
            }
          });
          if (controller[method] !== undefined) {
            sails.log.silly('Binding ' + baseRoute + "/" + endpoint + ' to ' + controllerId + '.' + method);
            sails.router.bind(baseRoute + "/" + endpoint, {
              controller: controllerId,
              action: method
            });
          }
        });
      });
    }
  };
};

