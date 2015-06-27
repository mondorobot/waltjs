# WaltJS
## Composable CSS3 Animation Manager

JavaScript wrapper for CSS3 animation events. Allows for composing/forking animations on the fly. Combine with Animate.css for tons of fun!

### Dependencies
Requires jQuery and caolan/async


### Usage

```
// define a precomposed animation
// note - no target is applied yet
var intro = new Walt().name('fadeIn').duration(2500);

// you can 'fork' animations to create variations of existing compositions,
// and use `.target` to set the element(s) to animate
var intro2 = intro.fork().target(document.body);

// apply an existing animation to multiple elements
// each element gets its own animation instance so we can play with the delay etc
$('.stuff').each(function(i, v) {
  intro.fork().target(v).delay(i * 50).animate();
});

// if we didn't want any per-instance property changes,
// e.g. to animate a set of things at once,
// we can just change the target to collect multiples
//   (still forking as we want to extend an existing composition,
//    if we didn't fork then we'd be altering the 'master' copy)
intro.fork().target('.stuff').animate();


// chain animations via `then` / `after`
intro.then(intro2.animate.bind(intro2)).animate();


// available commands:
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