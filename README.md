# WaltJS
## Composable CSS3 Animation Manager

JavaScript wrapper for CSS3 animation events. Allows for composing/forking animations on the fly. Combine with Animate.css for tons of fun!

### Dependencies
Requires jQuery and caolan/async


### Usage

First step is to create an animation composition. There are default animation options, but those can be overridden. 
Here, we're defining a precomposed animation to `fadeIn` for `2500ms` (along with the remaining default settings).
Calling `animate` triggers the animation to begin.

```
var fadeInYourDiv = new Walt().target('#your-div').name('fadeIn').duration(2500);

fadeInYourDiv.animate();
```

Composing animations allows you to create one 'definition' and vary or apply as necessary to other elements.
You can 'fork' animations to create variations of existing compositions, and use `target` to set the element(s) 

```
var superCoolFade = new Walt()
  .name('yourAwesomeCSSAnimation')
  .duration(250)
  .timing('cubic-bezier(0.86, 0, 0.07, 1)');

// we now have a composition definition, but no target
// forking allows us to take the existing definition and alter it a little,
// without messing with our main definition

var evenCoolerFade = superCoolFade.fork().duration(2500);
```

Going even further, we can use this ^ forked comp as basis for _another_ animation.
Say you want to stagger animations across a group of elements:

```
$('.stuff').each(function(i, v) {
  // we fork and re-target/re-delay to create variation in our base anim composition
  evenCoolerFade.fork().target(v).delay(i * 50).animate();
});
```

Animating multiple elements, as in the example above? If you're using the same animation definition
across all elements, you can simply target a collection:
```
evenCoolerFade.fork().target('.stuff').animate();
```

A huge benefit of Walt is managing callbacks and chaining animations.
Using `before` and `after` (or `then` if you're into that), you can attach handlers to animation events.


```
yourAnimation.then(yourOtherAnimation.animate.bind(yourOtherAnimation)).animate();
```


Total list of functions available:
```
new Walt()
  // animations have default settings, but can be overridden
  // in the following fashion:

  .target(element) // element to run animation on
  .name('animationName') // name of the CSS animation to apply
  .duration(1000) // animation speed (in ms)
  .delay(1000) // animation delay (in ms)
  .count(3) // how many anims to play (default 1)
  .fill('forwards') // fill mode 
  .timing('cubic-bezier(0.86, 0, 0.07, 1)')
  // walt also provides timing easings
  .timing(Walt.prototype.easings.easeInOutQuint)

  // there are some control functions
  .pause() // pauses animation
  .resume() // resumes/plays an animation
  .play() // resumes/plays an animation

  // some functions are great for extending base compositions
  .children() // select the current target's children
  .fork() // ** clone animation definition with current settings **

  // you can also add before/after functions to fire before/after the animation
  .before(function($el, settings){ console.log('before anim starts'); })
  .after(function($el, settings){ console.log('after anim ends'); })
  // you can specify 'each' commands if you're animating a collection of elements
  // and want a handler per-item
  .beforeEach(function($el, settings){ console.log('before each individual anim starts'); })
  .afterEach(function($el, settings){ console.log('after each individual anim ends'); })
```


### Easings

Walt comes pre-packaged with the following easings, accessed via `Walt.prototype.easings`:

```
linear,
ease,
easeIn,
easeOut,
easeInOut,

easeInQuad,
easeInCubic,
easeInQuart,
easeInQuint,
easeInSine,
easeInExpo,
easeInCirc,
easeInBack,

easeOutQuad,
easeOutCubic,
easeOutQuart,
easeOutQuint,
easeOutSine,
easeOutExpo,
easeOutCirc,
easeOutBack,

easeInOutQuad,
easeInOutCubic,
easeInOutQuart,
easeInOutQuint,
easeInOutSine,
easeInOutExpo,
easeInOutCirc,
easeInOutBack
```