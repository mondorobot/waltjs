/// <reference path="reference/jquery.d.ts"/>
//----
//
var WaltUtils;
(function (WaltUtils) {
    // Module for conversions from real numbers to CSS numbers, etc
    var Math;
    (function (Math) {
        /**
         * Converts CSS time (e.g. '0.2s') into milliseconds,
         * and returns total time animation would require
         * @param  {string} duration Animation duration (e.g. '0.2s')
         * @param  {string} delay    Animation delay (e.g. '100ms')
         * @param  {string} count    Times animation will loop (e.g. 1)
         * @return {number}          Total time length of animation
         */
        function realAnimTime(duration, delay, count) {
            var countNum = parseFloat(count);
            if (countNum === Infinity || countNum <= -1 || isNaN(countNum)) {
                return -1;
            }
            var durationTime = parseFloat(duration);
            if (duration.indexOf('ms') > 0 || (duration.indexOf('ms') < 0 && duration.indexOf('s') < 0)) {
            }
            else if (duration.indexOf('s') > 0) {
                durationTime *= 1000;
            }
            var delayTime = parseFloat(delay);
            if (delay.indexOf('ms') > 0 || (delay.indexOf('ms') < 0 && delay.indexOf('s') < 0)) {
            }
            else if (delay.indexOf('s') > 0) {
                delayTime *= 1000;
            }
            return parseInt(durationTime, 10) + parseInt(delayTime, 10);
        }
        Math.realAnimTime = realAnimTime;
    })(Math = WaltUtils.Math || (WaltUtils.Math = {}));
    // Module for creating the css applied to objects through Walt
    var CSS;
    (function (CSS) {
        /**
         * Utility function to determine if browser
         * supports CSS3 animations. Check moz, webkit, ms
         */
        function supportsAnimations() {
            var b = document.body || document.documentElement, s = b.style, p = 'animation';
            if (typeof s[p] === 'string') {
                return true;
            }
            // Tests for vendor specific prop
            var v = ['moz', 'Moz', 'webkit', 'Webkit', 'ms', 'Ms'];
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (var i = 0; i < v.length; i++) {
                if (typeof s[v[i] + p] === 'string') {
                    return true;
                }
            }
            return false;
        }
        CSS.supportsAnimations = supportsAnimations;
        /**
         * Parses all animation options and produces a CSS object to apply to element
         * @param  {WaltOptions} options  Animation options
         * @param  {WaltOptions} DEFAULTS Fallback/default animation options
         * @return {Object}               Object with all necessary CSS values to init animation
         */
        function createCSS(options, DEFAULTS) {
            var delayCSS = handleProp('delay', options.delay ? options.delay : DEFAULTS.delay), durationCSS = handleProp('duration', options.duration ? options.duration : DEFAULTS.duration), directionCSS = handleProp('direction', options.direction ? options.direction : DEFAULTS.direction), countCSS = handleProp('iteration-count', options.count ? options.count : DEFAULTS.count), fillCSS = handleProp('fill-mode', options.fill ? options.fill : DEFAULTS.fill), timingCSS = handleProp('timing-function', options.timing ? options.timing : DEFAULTS.timing);
            return mergeObjects(delayCSS, durationCSS, directionCSS, countCSS, fillCSS, timingCSS);
        }
        CSS.createCSS = createCSS;
        /**
         * Utility function which generates an object containing prefixed CSS values
         * for whatever property/value pair is passed in.
         * Used in Walt.createCSS to compile all of the different properties
         * @param {string} prop  Animation property ('delay', 'timing-function', etc)
         * @param {string} value Property value ('2s', '500ms', etc)
         */
        function handleProp(prop, value) {
            if (!(prop === 'fill-mode' || prop === 'direction' || prop === 'timing-function')
                && (value.indexOf && value.indexOf('s') < 0 && value.indexOf('ms') < 0)) {
                value += 'ms';
            }
            var compiledCSS = {}, supportedBrowsers = ['moz', 'webkit', 'ms'];
            // no prefix
            compiledCSS['animation-' + prop] = value;
            // browser prefix
            for (var i = 0; i < supportedBrowsers.length; i++) {
                compiledCSS['-' + supportedBrowsers[i] + '-animation-' + prop] = value;
            }
            return compiledCSS;
        }
        /**
         * Utility function to combine multiple objects
         * This is used in createCSS to combine parsed duration/delay/etc options
         * @param  {any[]}                          ...args Array of objects to merge
         * @return { [key:string]:string }          Single merged object
         */
        function mergeObjects() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var mergedObject = {}, curObject;
            for (var i = 0; i < args.length; i++) {
                curObject = args[i];
                var prop;
                for (prop in curObject) {
                    if (curObject.hasOwnProperty(prop) && !mergedObject.hasOwnProperty(prop)) {
                        mergedObject[prop] = curObject[prop];
                    }
                }
            }
            return mergedObject;
        }
    })(CSS = WaltUtils.CSS || (WaltUtils.CSS = {}));
})(WaltUtils || (WaltUtils = {}));
//
//----
var Walt;
(function (Walt) {
    var Utils = WaltUtils, supportsCss = Utils.CSS.supportsAnimations(), $body = $(document.body);
    Walt.DEFAULTS = {
        'el': $(document.body || document.documentElement),
        'animation': '',
        'delay': '0s',
        'duration': '1s',
        'count': '0',
        'fill': 'both',
        'direction': 'normal',
        'timing': 'ease',
        'useTimeout': false
    };
    /**
     * Returns Utils.CSS.supportsAnimations()
     * @return {boolean} Animation is supported
     */
    function supportsAnimations() {
        return supportsCss;
    }
    Walt.supportsAnimations = supportsAnimations;
    /**
     * Base animation function.
     * Compiles animation CSS via options and applies to target,
     * triggering the callback on animation completion
     * @param {WaltOptions} options Animation settings
     */
    function animate(options) {
        var $el;
        // Need an el
        if (options.hasOwnProperty('el')) {
            $el = (options.el instanceof $) ? options.el : $(options.el);
        }
        else {
            // console.warn('Walt - no El provided in animate');
            return;
        }
        // No animation provided
        if (!options.hasOwnProperty('animation') || options.animation === '') {
            // console.warn('Walt - no Animation provided in animate');
            return;
        }
        // Create the entire CSS object based on animation options
        var objectCSS = Utils.CSS.createCSS(options, Walt.DEFAULTS);
        // Detect if the window is in focus or not
        // (preventing from running without focus helps performance and prevents bugs)
        var bodyIsBlurred = $body.hasClass('no-focus');
        // safari-only bug
        if (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1) {
            bodyIsBlurred = false;
        }
        // Fires onBefore if it exists
        options.onBefore && options.onBefore($el);
        if (!supportsCss || bodyIsBlurred) {
            // Technically, a fallback option is provided, but isn't used anywhere
            if (options.hasOwnProperty('fallback')) {
                options.fallback($el, function () { return onAnimateEnd($el, options); });
            }
            else {
                if (!bodyIsBlurred) {
                    $el.addClass('walt-animate');
                }
                else {
                    $el.addClass('walt-animate ' + options.animation);
                }
                onAnimateEnd($el, options);
            }
        }
        else if (!$el || !$el.length) {
            // console.warn('Walt - no $el.length in animate');
            onAnimateEnd($el, options);
        }
        else {
            $el.on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', (function (e) { return onAnimateEnd($el, options); }))
                .css(objectCSS)
                .addClass('walt-animate ' + options.animation);
        }
        // use setTimeout in case something comes up with the animation callback
        if (options.hasOwnProperty('useTimeout') && options.useTimeout === true) {
            // something here is weird
            // Just in case
            var animTime = Utils.Math.realAnimTime((options.duration || Walt.DEFAULTS.duration), (options.delay || Walt.DEFAULTS.delay), (options.count || Walt.DEFAULTS.count));
            if (animTime >= 0) {
                window.setTimeout(function () { return onAnimateEnd($el, options); }, animTime * 1.15);
            }
        }
    }
    Walt.animate = animate;
    /**
     * Fires on completion of a Walt-controlled animation
     * @param {JQuery}      $el     Target element
     * @param {WaltOptions} options Options used to construct animation
     */
    function onAnimateEnd($el, options) {
        // unbind
        $el.off('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd');
        if (!$el.hasClass('walt-animate')) {
            return;
        }
        // remove walt and animation classes
        $el.removeClass('walt-animate').removeClass(options.animation);
        // remove the 'animation' style we put on at the beginning
        $el.attr('style', ($el.attr('style') || '').replace(/animation:.*?;|-webkit-animation:.*?;|-moz-animation:.*?;/g, ''));
        // fire callback if there is one
        if (options.hasOwnProperty('onComplete')) {
            options.onComplete($el);
        }
    }
    /**
     * Utility function to append .no-focus or .in-focus to body based on blur/focus
     */
    function listenForFocus() {
        if ('ontouchstart' in window) {
            return;
        }
        var $body = $(document.body);
        var hidden = 'hidden';
        // Standards:
        if (hidden in document) {
            document.addEventListener('visibilitychange', onchange);
        }
        else if ((hidden = 'mozHidden') in document) {
            document.addEventListener('mozvisibilitychange', onchange);
        }
        else if ((hidden = 'webkitHidden') in document) {
            document.addEventListener('webkitvisibilitychange', onchange);
        }
        else if ((hidden = 'msHidden') in document) {
            document.addEventListener('msvisibilitychange', onchange);
        }
        else if ('onfocusin' in document) {
            document.onfocusin = document.onfocusout = onchange;
        }
        else {
            window.onpageshow = window.onpagehide
                = window.onfocus = window.onblur = onchange;
        }
        function onchange(evt) {
            var v = 'no-focus', h = 'in-focus', evtMap = { 'focus': v, 'focusin': v, 'pageshow': v, 'blur': h, 'focusout': h, 'pagehide': h };
            evt = evt || window.event;
            if (evt.type in evtMap) {
                $body.removeClass(v + ' ' + h);
                $body.addClass(evtMap[evt.type]);
            }
            else {
                $body.removeClass(v + ' ' + h);
                if (this[hidden]) {
                    $body.addClass(v);
                }
                else {
                    $body.addClass(h);
                }
            }
        }
    }
    listenForFocus();
})(Walt || (Walt = {}));
