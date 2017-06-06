# Floating Carousel jQuery plugin

Current version: 3.0

The Floating Carousel plugin creates a carousel without controls, where the movemeont of the carousel is controlled by cursor or touch movement across the carousel element. Moving the cursor further to the left causes the content to scroll faster to the right and vice versa, or up and down for the horizontally scrolling version.

## Usage

To call the carousel on an Ordered or Unordered list, wrap the list in a parent element and call the carousel on that:

```html
<div id="carousel">
	<ul class="clearfix">
		<li>Carousel Item One</li>
		<li>Carousel Item Two</li>
		<li>Carousel Item Three</li>
	</ul>
</div>
<script type="text/javascript">
  $('#carousel').floatingCarousel();
</script>
```
...Or you can use DIV elements:

```html
<div id="carousel">
  <div>Carousel Item One</div>
  <div>Carousel Item Two</div>
  <div>Carousel Item Three</div>
</div>
<script type="text/javascript">
  $('#carousel').floatingCarousel();
</script>
```
See the demo file for more detailed examples of usage.

## Options

### autoScroll
Boolean - If set to 'true' the scroller will scroll automatically at set speed in a set direction when the mouse cursor is not over it.
Default : `false`

### autoScrollDirection
String telling the carousel which direction to scroll if `autoScroll` is on. Can be 'left' or 'right,' for the horizontal scroller, or 'up' or 'down' for the vertical scroller.
Default : `'left'/'down'`

### autoScrollSpeed
Integer representing the approximate time, in milliseconds, it takes for each pixel to scroll from one end of the scroller to the other while the scroller is autoscrolling. A setting of 10000 (the default) means that one pixel will scroll from one end of the scroller element to the other in approximately 10 seconds, thus the higher the number, the slower the speed. Obviously the speed will vary according to the width of the scroller element so some experimentation may be required.
Default: `10000`

### looped
Boolean - If set to 'false' the content will stop scrolling when its edge reaches the edge of the container, otherwise it will loop infinitely.
Default: `true`

### scrollerAlignment
String - Set to 'vertical' to create a vertically aligned scroller, which scrolls up and down according to the vertical position of the mouse cursor over it.
Default: `'horizontal'`

### scrollerOffset
Integer representing the percentage the scroller content should be offset when the scroller first loads. A value of '0' will align the left-most element of the scroller content to the left of the container, a value of '100' will align the right-most element to the right.
Default: `0`

### scrollSpeed
String representing the relative speed at which the content will scroll when the user mouses over it. Can be 'slow', 'medium' or 'fast'.
Default: `'medium'`

### beforeCreateFunction
A function to call before the scroller functionality is executed.
Default: `NULL`

### afterCreateFunction
A function to call after the scroller functionality has been executed.
Default: `NULL`

### enableTouchEvents
If set to `true` the carousel will respond to touch events, with similar behaviour to the way in which it responds to mouseover events.
Default: `true`
