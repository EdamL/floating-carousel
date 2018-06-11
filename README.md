# Floating Carousel

Current version: 4.0.1

Floating Carousel is a dependency-free Javascript carousel which is intended to be clean and intuitive without the need for controls. The carousel is navigated by relative movement of the cursor (or the user's finger in the case of touch devices) over the carousel element. Moving the cursor toward  either end of the carousel causes the content to scroll in the opposite direction - the scroll speed increasing the further the cursor is moved in either direction.

## Usage

### Vanilla JS

You can call the floatingCarousel constructor using a standard [querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) CSS string...
```js
  var myCarousel = new floatingCarousel.('#carousel-element');
```

...or on a DOM element (or collection of elements, if you're that way inclined):
```js
  var element = document.querySelectorAll('.carousel-element');
  var myCarousel = new floatingCarousel.(element);
```

### jQuery
You can also call floatingCarousel as a jQuery method, in the usual way:
```js
  $('#carousel-element').floatingCarousel();
```

### The markup
To apply the carousel to a `UL` or `OL`, you need to wrap the list node in a parent element to call the carousel on:

```html
<div id="carousel-element">
	<ul class="clearfix">
		<li>Carousel Item One</li>
		<li>Carousel Item Two</li>
		<li>Carousel Item Three</li>
	</ul>
</div>
<script type="text/javascript">
  var myCarousel = new floatingCarousel.('#carousel-element');
</script>
```
...Or you can use `DIV` elements:

```html
<div id="carousel-element">
  <div>Carousel Item One</div>
  <div>Carousel Item Two</div>
  <div>Carousel Item Three</div>
</div>
<script type="text/javascript">
  var myCarousel = new floatingCarousel.('#carousel-element');
</script>
```
See the [demos](https://github.com/EdamL/floating-carousel/tree/master/demo) for more detailed examples of usage.

## Options

Can be applied as an optional argument in the floatingCarousel constructor:

```js
  var myCarousel = new floatingCarousel.('#carousel-element', { 
	autoScroll : true, 
	scrollSpeed : 'fast'
   });
```

Or in the jQuery method:

```js
  $('#carousel-element').floatingCarousel({ 
	autoScroll : true, 
	scrollSpeed : 'fast'
   });
```

### autoScroll
Boolean - If set to 'true' the carousel will scroll automatically at set speed in a set direction when the mouse cursor is not over it.
Default : `false`

### autoScrollDirection
String telling the carousel which direction to scroll if `autoScroll` is on. Can be 'left' or 'right,' for the horizontal carousel, or 'up' or 'down' for the vertical carousel.
Default : `'left'/'down'`

### autoScrollSpeed
Integer representing the approximate time, in milliseconds, it takes for each pixel to scroll from one end of the carousel element to the other while the carousel is autoscrolling. A setting of 10000 (the default) means that one pixel will scroll from one end of the carousel element to the other in 10 seconds, thus the higher the number, the slower the speed. Obviously the speed will vary according to the width of the carousel element, so some experimentation may be required.

Default: `10000`

### initClass
A classname which the carousel assigns to the carousel container element upon initiation

Default: `'floatingCarouselContainer'`

### intervalRate
The interval rate at which the carousel animation runs in milliseconds.

Default: 16

### looped
Boolean - If set to 'false' the content will stop scrolling when its edge reaches the edge of the container, otherwise it will loop infinitely.

Default: `true`

### scrollerAlignment
String - Set to 'vertical' to create a vertically aligned carousel, which scrolls up and down according to the vertical position of the mouse cursor over it.

Default: `'horizontal'`

### scrollerOffset
Integer representing the percentage the carousel content should be offset when the scroller first loads. A value of '0' will align the left-most element of the carousel content to the left of the container, a value of '100' will align the right-most element to the right.

Default: `0`

### scrollSpeed
String representing the relative speed at which the content will scroll when the user mouses over it. Can be 'slow', 'medium' or 'fast'.

Default: `'medium'`

### beforeCreateFunction
A function to call before the carousel is initiated.

Default: `NULL`

### afterCreateFunction
A function to call after the carousel has finished initiating.

Default: `NULL`

### enableTouchEvents
If set to `true` the carousel will respond to touch events, with slightly different behaviour to the way in which it responds to mouseover events (see the `reverseOnTouch` option below).

Default: `true`

### touchOverflowHidden
In order to prevent unwanted page scrolling during touch events, a style of `body { overflow : hidden }` is applied when touch is activated on the carousel element. Set this value to `false` if you want to disable this functionality.

Default: `true`

### reverseOnTouch
When using the mouse, the carousel scrolls in the opposite direction from the direction the mouse pointer is moved. However, I found that when using touch, users expect the carousel to move in the direction they move their finger. I have decided to implement this - in my opinion - much more intuitive behaviour on touch. If you would rather <em>not</em> reverse the scrolling on touch, and instead have the carousel behave more like it does on mouse-enabled devices, set this option to `false`.

Default: `true`

## Exposed methods

Usage:

```js
var myCarousel = new floatingCarousel.('#carousel-element');
		
$('#clickable-element').click(function() {
	myCarousel.destroy();
});
```

### destroy()
Removes the Floating Carousel functionality and returns the carousel element to its previous state.

### update(\[options\])
Updates the carousel

Argument: `options` - The options to pass into the updated carousel instance

### pause()
Temporarily disables all UI functionality associated with the carousel (will also stop autoscrolling).

### play()
Used to reinstate UI functionality after the `pause()` method has been called (also re-starts autoscrolling if it has been set to `true`).
