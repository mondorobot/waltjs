/*!
 * WaltJS
 * @author Andy Mikulski <andy@mondorobot.com>
 */
;
(function(window, document, $, async, undefined) {


  // object to track existing animation
  // behaves an animation stream basically
  window.Walt = (function(Walt) {
    function Walt(options) {
      var anim = this;

      anim.settings = anim.defaults;

      // for grouped animations
      anim.onBefores = [];
      anim.onAfters = [];

      // for animation items
      anim.onBeforeEaches = [];
      anim.onAfterEaches = [];

      return anim;
    }

    function convertToCSSTime(value) {
      if (value.indexOf && (value.indexOf('ms') > -1 || value.indexOf('s') > -1)) {
        // sall good
      } else {
        value = value + 'ms';
      }
      return value;
    }

    Walt.prototype = {
      'defaults': {
        'element': $(document.body || document.documentElement),
        'animation': 'fadeIn',
        'delay': '0s',
        'duration': '1s',
        'count': 1,
        'fill': 'both',
        'direction': 'normal',
        'timing': 'ease',
        'state': 'paused'
      },

      'fork': function() {
        var anim = this;

        var newGuy = new Walt();
        for (var prop in anim) {
          newGuy[prop] = anim[prop];
        }

        return newGuy;
      },


      // mutation functions
      'target': function($el) {
        var anim = this;

        $el = !($el instanceof $) ? $($el) : $el;

        anim.settings.element = $el;

        return anim;
      },

      'children': function(selector) {
        var anim = this;

        if (selector) {
          anim.settings.element = anim.settings.element.find(selector);
        } else {
          anim.settings.element = anim.settings.element.children();
        }

        return anim;
      },

      'name': function(name) {
        var anim = this;

        anim.animation = name;

        return anim;
      },

      'fill': function(value) {
        var anim = this;

        anim.fill = value;

        return anim;
      },

      'direction': function(value) {
        var anim = this;

        anim.direction = value;

        return anim;
      },

      'timing': function(value) {
        var anim = this;

        anim.timing = value;

        return anim;
      },

      'duration': function(value) {
        var anim = this;

        value = convertToCSSTime(value);
        anim.settings.duration = value;

        return anim;
      },
      'delay': function(value) {
        var anim = this;

        value = convertToCSSTime(value);
        anim.settings.delay = value;

        return anim;
      },
      'count': function(value) {
        var anim = this;

        anim.settings.count = value;

        return anim;
      },
      'before': function(onBeforeFnc) {
        var anim = this;

        anim.onBefores.push(function(callback) {
          onBeforeFnc && onBeforeFnc(anim.settings.element, anim.settings);
          callback && callback(null, null);
        });

        return anim;
      },
      'beforeEach': function(onBeforeEachFnc) {
        var anim = this;

        anim.onBeforeEaches.push(function(callback) {
          onBeforeEachFnc && onBeforeEachFnc(anim.settings.element, anim.settings);
          callback && callback(null, null);
        });

        return anim;
      },


      'after': function(onAfterFnc) {
        var anim = this;

        anim.onAfters.push(function(callback) {
          onAfterFnc && onAfterFnc(anim.settings.element, anim.settings);
          callback && callback(null, null);
        });

        return anim;
      },
      'then': function(thenFnc) {
        var anim = this;

        return anim.after(thenFnc);
      },
      'afterEach': function(onAfterEachFnc) {
        var anim = this;

        anim.onAfterEaches.push(function(callback) {
          onAfterEachFnc && onAfterEachFnc(anim.settings.element, anim.settings);
          callback && callback(null, null);
        });

        return anim;
      },


      'done': function(doneFnc) {
        var anim = this;

        return anim.after(doneFnc);
      },

      'pause': function() {
        var anim = this;

        anim.settings.state = 'paused';

        return anim;
      },

      'play': function() {
        var anim = this;

        anim.settings.state = 'running';

        return anim;
      },

      'resume': function() {
        var anim = this;

        anim.settings.state = 'running';

        return anim;
      },



      // functional methods

      'animate': function() {
        var anim = this;

        async.parallel(anim.onBefores, anim._executeAnim.bind(anim));

        return anim;
      },

      '_createCssObj': function(cssString) {
        var anim = this;

        return {
          '-webkit-animation': cssString || '',
          'animation': cssString || ''
        };
      },


      '_executeAnim': function() {
        var anim = this;
        // modify the animation before we build the CSS string
        anim.resume();

        var settings = anim.settings,
          cssString = settings.animation + ' ' + settings.duration + ' ' + settings.timing + ' ' + settings.delay + ' ' + settings.count + ' ' + settings.direction + ' ' + settings.fill + ' ' + settings.state;

        // execution = we're playing

        anim.animCount = 0;
        anim.animMax = anim.settings.element.length;

        anim.settings.element.on('animationend.walt', anim._onAnimEndEvent.bind(anim));
        anim.settings.element.css(anim._createCssObj(cssString));
      },

      '_onAnimEndEvent': function(event) {
        var anim = this,
          $target = $(event.currentTarget);

        $target.unbind('animationend.walt');
        // reset the css by just passing in null values for the properties
        $target.css(anim._createCssObj());

        anim.animCount += 1;

        // fire afterEach for each one

        async.parallel(anim.onAfterEaches, function() {
          // if we're done then we can fire the onAfters
          if (anim.animCount > anim.animMax) {
            anim._onAnimComplete();
          }
        });
      },

      '_onAnimComplete': function() {
        var anim = this;

        async.parallel(anim.onAfters, function() {
          delete anim.animCount;
          delete anim.animMax;


          // reset the css by just passing in null values for the properties
          anim.settings.element.css(anim._createCssObj());
        });
      },


      'easings': {
        'linear': 'cubic-bezier(0.250, 0.250, 0.750, 0.750)',
        'ease': 'cubic-bezier(0.250, 0.100, 0.250, 1.000)',
        'easeIn': 'cubic-bezier(0.420, 0.000, 1.000, 1.000)',
        'easeOut': 'cubic-bezier(0.000, 0.000, 0.580, 1.000)',
        'easeInOut': 'cubic-bezier(0.420, 0.000, 0.580, 1.000)',

        'easeInQuad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        'easeInCubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
        'easeInQuart': 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
        'easeInQuint': 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
        'easeInSine': 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
        'easeInExpo': 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
        'easeInCirc': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
        'easeInBack': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',

        'easeOutQuad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        'easeOutCubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
        'easeOutQuart': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        'easeOutQuint': 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
        'easeOutSine': 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
        'easeOutExpo': 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        'easeOutCirc': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
        'easeOutBack': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',

        'easeInOutQuad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        'easeInOutCubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
        'easeInOutQuart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        'easeInOutQuint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
        'easeInOutSine': 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
        'easeInOutExpo': 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
        'easeInOutCirc': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
        'easeInOutBack': 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
      }
    };

    return Walt;
  })(window.Walt || {});


})(window, document, jQuery, async);