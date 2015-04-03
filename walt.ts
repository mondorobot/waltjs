export interface WaltOptions {
    el:any;
    animation:string;
    delay?:string;
    duration?:string;
    direction?:string;
    timing?:string;
    fill?:string;
    count?:string;
    onComplete?:any;
    onBefore?:any;
    fallback?:any;
    useTimeout?:boolean;
}


//----
//

module WaltUtils {
    // Module for conversions from real numbers to CSS numbers, etc
    export module Math {
        /**
         * Converts CSS time (e.g. '0.2s') into milliseconds,
         * and returns total time animation would require
         * @param  {string} duration Animation duration (e.g. '0.2s')
         * @param  {string} delay    Animation delay (e.g. '100ms')
         * @param  {string} count    Times animation will loop (e.g. 1)
         * @return {number}          Total time length of animation
         */
        export function realAnimTime(duration:string, delay:string, count:string):number{
            var countNum:number = parseFloat(count);
            if(countNum === Infinity || countNum <= -1 || isNaN(countNum)){
                return -1;
            }

            var durationTime:any = parseFloat(duration);
            if(duration.indexOf('ms') > 0 || (duration.indexOf('ms') < 0 && duration.indexOf('s') < 0)){
                // durationTime *= 100;
            }else if(duration.indexOf('s') > 0){
                durationTime *= 1000;
            }

            var delayTime:any = parseFloat(delay);
            if(delay.indexOf('ms') > 0 || (delay.indexOf('ms') < 0 && delay.indexOf('s') < 0)){
                // delayTime *= 100;
            }else if(delay.indexOf('s') > 0){
                delayTime *= 1000;
            }

            return parseInt(durationTime,10) + parseInt(delayTime,10);
        }
    }

     // Module for creating the css applied to objects through Walt
    export module CSS {

            /**
             * Utility function to determine if browser
             * supports CSS3 animations. Check moz, webkit, ms
             */
            export function supportsAnimations() {
                var b:any = document.body || document.documentElement,
                    s:any = b.style,
                    p:string = 'animation';
                if(typeof s[p] === 'string') {return true; }

                // Tests for vendor specific prop
                var v = ['moz', 'Moz', 'webkit', 'Webkit', 'ms', 'Ms'];
                p = p.charAt(0).toUpperCase() + p.substr(1);
                for(var i=0; i<v.length; i++) {
                  if(typeof s[v[i] + p] === 'string') { return true; }
                }
                return false;
            }

            /**
             * Parses all animation options and produces a CSS object to apply to element
             * @param  {WaltOptions} options  Animation options
             * @param  {WaltOptions} DEFAULTS Fallback/default animation options
             * @return {Object}               Object with all necessary CSS values to init animation
             */
            export function createCSS(options:WaltOptions, DEFAULTS:WaltOptions):Object {
                var delayCSS = handleProp('delay', options.delay ? options.delay : DEFAULTS.delay),
                    durationCSS = handleProp('duration', options.duration ? options.duration : DEFAULTS.duration),
                    directionCSS = handleProp('direction', options.direction ? options.direction : DEFAULTS.direction),
                    countCSS = handleProp('iteration-count', options.count ? options.count : DEFAULTS.count),
                    fillCSS = handleProp('fill-mode', options.fill ? options.fill : DEFAULTS.fill),
                    timingCSS = handleProp('timing-function', options.timing ? options.timing : DEFAULTS.timing);
                return mergeObjects(delayCSS, durationCSS, directionCSS, countCSS, fillCSS, timingCSS);
            }


            /**
             * Utility function which generates an object containing prefixed CSS values
             * for whatever property/value pair is passed in.
             * Used in Walt.createCSS to compile all of the different properties
             * @param {string} prop  Animation property ('delay', 'timing-function', etc)
             * @param {string} value Property value ('2s', '500ms', etc)
             */
            function handleProp(prop:string, value:string):{ [key:string]:string }{
                if( !(prop === 'fill-mode' || prop === 'direction' || prop === 'timing-function')
                    && (value.indexOf && value.indexOf('s') < 0 && value.indexOf('ms') < 0)){
                    value += 'ms';
                }
                var compiledCSS:{ [key:string]:string } = {},
                    supportedBrowsers:Array<string> = ['moz', 'webkit', 'ms'];

                // no prefix
                compiledCSS['animation-' + prop] = value;
                // browser prefix
                for(var i:number = 0; i < supportedBrowsers.length; i++){
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
            function mergeObjects(...args:any[]):{ [key:string]:string } {
                var mergedObject:{ [key:string]:string } = {},
                    curObject:{ [key:string]:string };

                for(var i:number = 0; i < args.length; i++){
                    curObject = args[i];
                    var prop:string;
                    for(prop in curObject){
                        if(curObject.hasOwnProperty(prop) && !mergedObject.hasOwnProperty(prop)){
                            mergedObject[prop] = curObject[prop];
                        }
                    }
                }
                return mergedObject;
            }
        }
}
//
//----



export module Walt {
    var log:any = Logger.log,
        Utils:any = WaltUtils,
        supportsCss:boolean = Utils.CSS.supportsAnimations(),
        $body:JQuery = $(document.body);

    export var DEFAULTS:WaltOptions = {
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
    export function supportsAnimations():boolean {
        return supportsCss;
    }

    /**
     * Base animation function.
     * Compiles animation CSS via options and applies to target,
     * triggering the callback on animation completion
     * @param {WaltOptions} options Animation settings
     */
    export function animate(options:WaltOptions):void {
        var $el;
        // Need an el
        if (options.hasOwnProperty('el')) {
            $el = (options.el instanceof $) ? options.el : $(options.el);
        } else {
            // console.warn('Walt - no El provided in animate');
            return;
        }

        // No animation provided
        if(!options.hasOwnProperty('animation') || options.animation === ''){
            // console.warn('Walt - no Animation provided in animate');
            return;
        }

        // Create the entire CSS object based on animation options
        var objectCSS = Utils.CSS.createCSS(options, DEFAULTS);


        // Detect if the window is in focus or not
        // (preventing from running without focus helps performance and prevents bugs)
        var bodyIsBlurred = $body.hasClass('no-focus');
        // safari-only bug
        if(navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1){
            bodyIsBlurred = false;
        }


        // Fires onBefore if it exists
        options.onBefore && options.onBefore($el);

        if(!supportsCss || bodyIsBlurred) {
            // Technically, a fallback option is provided, but isn't used anywhere
            if(options.hasOwnProperty('fallback')){
                options.fallback($el, ()=>onAnimateEnd($el, options));
            }else{
                if(!bodyIsBlurred){
                    $el.addClass('walt-animate');
                }else{
                    $el.addClass('walt-animate ' + options.animation);
                }
                onAnimateEnd($el, options);
            }
        // if we're given a selector or something that doesn't actually have any kids,
        // just jump to the callback
        }else if(!$el || !$el.length){
            // console.warn('Walt - no $el.length in animate');
            onAnimateEnd($el, options);
        }else{
            $el.on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', <any>((e)=>onAnimateEnd($el,options)) )
                .css(objectCSS)
                .addClass('walt-animate ' + options.animation);
        }


        // use setTimeout in case something comes up with the animation callback
        if(options.hasOwnProperty('useTimeout') && options.useTimeout === true){
            // something here is weird
            // Just in case
            var animTime = Utils.Math.realAnimTime( (options.duration || DEFAULTS.duration),
                                                    (options.delay || DEFAULTS.delay),
                                                    (options.count || DEFAULTS.count) );

            if(animTime >= 0){
                window.setTimeout(()=>onAnimateEnd($el, options), animTime * 1.15);
            }
        }
    }


    /**
     * Fires on completion of a Walt-controlled animation
     * @param {JQuery}      $el     Target element
     * @param {WaltOptions} options Options used to construct animation
     */
    function onAnimateEnd($el:JQuery, options:WaltOptions):void {

        // unbind
        $el.off('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd');
        if(!$el.hasClass('walt-animate')){
            return;
        }

        // remove walt and animation classes
        $el.removeClass('walt-animate').removeClass(options.animation);

        // remove the 'animation' style we put on at the beginning
        $el.attr('style', ($el.attr('style') || '').replace(/animation:.*?;|-webkit-animation:.*?;|-moz-animation:.*?;/g, ''));

        // fire callback if there is one
        if(options.hasOwnProperty('onComplete')){
            options.onComplete($el);
        }

    }


    /**
     * Utility function to append .no-focus or .in-focus to body based on blur/focus
     */
    function listenForFocus(){
        if('ontouchstart' in window){
            return;
        }
        var $body = $(document.body);
        var hidden = 'hidden';
        // Standards:
        if (hidden in document){
            document.addEventListener('visibilitychange', onchange);
        }else if ((hidden = 'mozHidden') in document){
            document.addEventListener('mozvisibilitychange', onchange);
        }else if ((hidden = 'webkitHidden') in document){
            document.addEventListener('webkitvisibilitychange', onchange);
        }else if ((hidden = 'msHidden') in document){
            document.addEventListener('msvisibilitychange', onchange);
        // IE 9 and lower:
        }else if ('onfocusin' in document){
            document.onfocusin = document.onfocusout = onchange;
        // All others:
        }else{
            window.onpageshow = window.onpagehide
                = window.onfocus = window.onblur = onchange;
        }

        function onchange (evt) {
            var v = 'no-focus', h = 'in-focus',
                evtMap = {'focus':v, 'focusin':v, 'pageshow':v, 'blur':h, 'focusout':h, 'pagehide':h};

            evt = evt || window.event;
            if (evt.type in evtMap){
                $body.removeClass(v + ' ' + h);
                $body.addClass(evtMap[evt.type]);
            } else {
                $body.removeClass(v + ' ' + h);
                if(this[hidden]){
                    $body.addClass(v);
                }else{
                    $body.addClass(h);
                }
            }
        }
    }

    listenForFocus();
    log('Walt : Constructor');
}
