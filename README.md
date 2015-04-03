# WaltJS
## CSS3 Animation Manager

JavaScript wrapper for CSS3 animation events. Combine with Animate.css for tons of fun!

### Usage

```
Mondo.animate({
'el': $('#yourelement'),
'animation': 'fadeInUp'
});
```

Available options:

```
interface WaltOptions {
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
```
