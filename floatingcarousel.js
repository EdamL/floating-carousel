/*
* floatingCarousel 4.0
* Copyright (c) 2017 Adam Lafene
*
* Licensed under the terms of the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/

(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define([], factory(root));
    } else if ( typeof exports === 'object' ) {
        module.exports = factory(root);
    } else {
        root.floatingCarousel = factory(root);
    }
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

    'use strict';
    //
    // Variables
    //

    var supports = !!document.querySelector && !!root.addEventListener; // Feature test
    var $ = window.jQuery; // Check for jQuery
    var opts, scrollerInterval; // Placeholder variables

    // Default options
    var defaults = {
		autoScroll : false,
		autoScrollDirection : 'left',
		autoScrollSpeed : 10000,
		initClass : 'floatingCarouselContainer',
		intervalRate : 16,
	 	looped : true,
	 	scrollerAlignment : 'horizontal',
		scrollerOffset : 0,
	 	scrollSpeed : 'medium',
		beforeCreateFunction : null,
		afterCreateFunction : null,
		enableTouchEvents : true,
		touchOverflowHidden : true,
		reverseOnTouch : true
    };

	//////////////////////////////////////
    // HELPER FUNCTIONS
    //////////////////////////////////////

    /**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};

    /**
     * Merge defaults with user options
     * @private
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     * @returns {Object} Merged values of defaults and options
     */
    var extend = function ( defaults, options ) {
        var extended = {};
        forEach(defaults, function (value, prop) {
            extended[prop] = defaults[prop];
        });
        forEach(options, function (value, prop) {
            extended[prop] = options[prop];
        });
        return extended;
    };

	/**
     * To set multiple style properties on either a single DOM object or multiple DOM objects:
     * (pass properties in as an object of property/value pairs)
     */
    var setProperties = function(objArray, properties) {

        var setProp = function(obj, prop, val) {
            obj.style[prop] = val;
        }

        if(objArray.length) {
            forEach(objArray, function (obj) {
                for (var property in properties)
                    setProp(obj, property, properties[property]);
            });
        }
        else {
            for (var property in properties)
                setProp(objArray, property, properties[property]);
        }
        return objArray;
    };

	/**
     * To check that a DOM object has a matching selector:
     * (courtesy of https://davidwalsh.name/element-matches-selector)
     */
    var matchSelector = function(obj, selector) {
		var proto = Element.prototype;
		var func = proto.matches || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || function(s) {
			return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
		};
		return func.call(obj, selector);
	};

    /**
     * To get children by selector:
     */
    var selectChildren = function (obj, selector) {
        var children = obj.children;

        return Array.prototype.filter.call(children, function(obj_l2) {
        	return matchSelector(obj_l2, selector);
        });
    };

    /**
     * To get offset values for a DOM object:
     */
    var getOffsets = function (obj) {
        var rect = obj.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

		return {
		  top : parseInt(rect.top) + scrollTop,
		  left : parseInt(rect.left) + scrollLeft
		}
    };

	//////////////////////////////////////
    // CREATE CONSTRUCTOR
    //////////////////////////////////////
    var floatingCarousel = function (selector, options) {


    	var floatingCarouselObj = {}; // Object for public APIs
    	var domObj = selector || [];

    	if ( typeof domObj == 'string' ) {
		    domObj = document.querySelectorAll(domObj);
		}

    	// handle multiple objects
    	if (domObj.length > 1) {
			var arr = new Array();
			forEach(domObj, function(obj) {
				if (obj.nodeType === 1)
					arr.push(floatingCarousel(obj, options));
			});
			return arr;
		}

		// extract the DOM object from the query selector
		domObj = domObj[0] || domObj;

		//
		// Vars
		//
		var scrollSwitch = 0;
		var touchEnabled = false;
		var scrollContentLength = 0;
		var scrollerHeight = 0;
		var scrollerWidth = 0;

		var ivlRate, scrollContainer, autoScrollInterval, carouselPlaying, cursorPosition, scrollContainerLength, scrollerContent, scrollerPosition, sMultiplier, scrollerChildren, offSetDistance, scrollDistance, centerPoint, itemPadding, itemMargin, opts;

		//
		// Private functions 
		//
		var cursorTest = function(direction, cursor) {
			var rVal;
			if(direction == 'left') {
				if (touchEnabled && opts.reverseOnTouch) 
					rVal = (cursor>centerPoint);
				else 
					rVal = (cursor<centerPoint);
			}
			else {
				if (touchEnabled && opts.reverseOnTouch) 
					rVal = (cursor<centerPoint);
				else 
					rVal = (cursor>centerPoint);
			}
			return rVal;
		}

		var autoScroll = function() {

			if (opts.looped==false) {
				return;
			}
			if (autoScrollInterval) {
				clearInterval(autoScrollInterval);
				autoScrollInterval = 0;
			}
			scrollerPosition = scrollerPosition ? scrollerPosition : 
								 ((opts.scrollerAlignment.toLowerCase()!='vertical') ? 
								 parseInt(scrollerContent[0].style.left) :
								 parseInt(scrollerContent[0].style.top));
			
			opts.autoScrollSpeed = (opts.autoScrollSpeed<1000) ? 1000 : opts.autoScrollSpeed;
			 
			if ((opts.autoScrollSpeed/ivlRate)<scrollContainerLength) {
				scrollDistance = Math.round(scrollContainerLength/(opts.autoScrollSpeed/ivlRate));
			}
			else {
				scrollDistance = 1;
				ivlRate = Math.round(opts.autoScrollSpeed/scrollContainerLength);
			}
			
			autoScrollInterval = setInterval(function() {
			
				switch (opts.autoScrollDirection.toLowerCase()) {
					
					case 'right':
					case 'down':
					if ((scrollerPosition+scrollDistance)>scrollContentLength) {
						scrollerPosition = 0;
						scrollSwitch = (scrollSwitch == 0) ? 1 : 0;
					}
					else {
						scrollerPosition = scrollerPosition+scrollDistance;
					}
					break;
					case 'left':
					case 'up':
					default:
					if ((scrollerPosition-scrollDistance)<(0-(scrollContentLength-scrollContainerLength))) {
						scrollerPosition = scrollContainerLength;
						scrollSwitch = (scrollSwitch == 0) ? 1 : 0;
					}
					else {
						scrollerPosition = scrollerPosition-scrollDistance;
					}
				}
				if (opts.scrollerAlignment.toLowerCase()!='vertical') {	
					scrollerContent[scrollSwitch].style.left = scrollerPosition+'px';
					scrollerContent[(scrollSwitch==0) ? 1 : 0].style.left = scrollerPosition-scrollContentLength+'px';
				}
				else {	
					scrollerContent[scrollSwitch].style.top = scrollerPosition+'px';
					scrollerContent[(scrollSwitch==0) ? 1 : 0].style.top = scrollerPosition-scrollContentLength+'px';
				}
			}, ivlRate);
		};

		var startCarousel = function() {

			if (autoScrollInterval) {
				clearInterval(autoScrollInterval);
				autoScrollInterval = 0;
			}

			centerPoint = (opts.scrollerAlignment.toLowerCase()!='vertical') ? 
							Math.round(getOffsets(scrollContainer).left+(scrollContainer.offsetWidth/2)) :
							Math.round(getOffsets(scrollContainer).top+(scrollContainer.offsetHeight/2));
			
			scrollerPosition = scrollerPosition ? scrollerPosition : 
												 ((opts.scrollerAlignment.toLowerCase()!='vertical') ? 
												 parseInt(scrollerContent[0].style.left) :
												 parseInt(scrollerContent[0].style.top));
			
			scrollerInterval = setInterval(function() {
				try {
					cursorPosition = cursorPosition;
					var cursor = (opts.scrollerAlignment.toLowerCase()!='vertical') ? cursorPosition.x : cursorPosition.y;
				} catch(e) {
					return;
				}
				var cursorDistance;
				var halfContainer = scrollContainerLength/2;
					
				cursorDistance = (cursor<centerPoint) ? centerPoint-cursor : cursor-centerPoint;
				
				scrollDistance = (cursorDistance<(Math.ceil((halfContainer/100)*30))) ? 1 :
								 ((cursorDistance<(Math.ceil((halfContainer/100)*50))) ? 2*sMultiplier : 
								 ((cursorDistance<(Math.ceil((halfContainer/100)*70))) ? 3*sMultiplier :
								 ((cursorDistance<(Math.ceil((halfContainer/100)*90))) ? 4*sMultiplier :
								 6*sMultiplier)));
													 
				if (cursorTest('left', cursor)) {
													 
					if ((scrollerPosition+scrollDistance)>0 && opts.looped==false) {
						scrollerPosition = 0;
					}
					else if ((scrollerPosition+scrollDistance)>scrollContentLength) {
						scrollerPosition = 0;
						scrollSwitch = (scrollSwitch == 0) ? 1 : 0;
					}
					else {
						scrollerPosition = scrollerPosition+scrollDistance;
					}
				}
				else if (cursorTest('right', cursor)) {
					
					if ((scrollerPosition-scrollDistance)<(0-(scrollContentLength-scrollContainerLength))) {
						
						if (opts.looped==false) {
							scrollerPosition = (0-(scrollContentLength-scrollContainerLength));
						}
						else {
							scrollerPosition = scrollContainerLength;
							scrollSwitch = (scrollSwitch == 0) ? 1 : 0;
						}
					}
					else {
						scrollerPosition = scrollerPosition-scrollDistance;
					}
				}
				if (opts.scrollerAlignment.toLowerCase()!='vertical') {	
					scrollerContent[scrollSwitch].style.left = scrollerPosition+'px';
					scrollerContent[(scrollSwitch==0) ? 1 : 0].style.left = scrollerPosition-scrollContentLength+'px';
				}
				else {
					scrollerContent[scrollSwitch].style.top = scrollerPosition+'px';
					scrollerContent[(scrollSwitch==0) ? 1 : 0].style.top = scrollerPosition-scrollContentLength+'px';
				}
			}, ivlRate);
		};

		var stopCarousel = function(ease) {
				
			if (!scrollerInterval) {
				return;
			}
			clearInterval(scrollerInterval);
			scrollerInterval = 0;
			if (!ease || opts.looped==false || opts.autoScroll==true) {
				return;
			}
			if (scrollDistance>1) {
				var brakingDistance = 0;
				for (var i=scrollDistance; i > 1 ; i--) {
					brakingDistance+=i;
				}
				var cursor = (opts.scrollerAlignment.toLowerCase()!='vertical') ? cursorPosition.x : cursorPosition.y;
				
				if (cursorTest('left', cursor)) {
					if ((scrollerPosition+brakingDistance)>scrollContentLength) {
						scrollerPosition = scrollerPosition-scrollContentLength;
						scrollSwitch = (scrollSwitch == 0) ? 1 : 0;
					}
				} 
				else {
					if ((scrollerPosition-brakingDistance)<(0-(scrollContentLength-scrollContainerLength))) {
						scrollerPosition = scrollerPosition+scrollContentLength;
						scrollSwitch = (scrollSwitch == 0) ? 1 : 0;
					}  
				}
				var ivl = setInterval(function() {
					if (scrollDistance>1) {
						if (cursorTest('left', cursor)) {
							scrollerPosition+=scrollDistance;
						}
						else {
							scrollerPosition-=scrollDistance;
						}
						if (opts.scrollerAlignment.toLowerCase()!='vertical') {
							scrollerContent[scrollSwitch].style.left = scrollerPosition+'px';
							scrollerContent[(scrollSwitch==0) ? 1 : 0].style.left = scrollerPosition-scrollContentLength+'px';
						}
						else {
							scrollerContent[scrollSwitch].style.top = scrollerPosition+'px';
							scrollerContent[(scrollSwitch==0) ? 1 : 0].style.top = scrollerPosition-scrollContentLength+'px';
						}
						scrollDistance--;
					}
					else {
						clearInterval(ivl);
					}
				}, ivlRate);
			}
			
		};

		var onMove = function(e) {
			var cursor = {x:0, y:0},
				touch;

			if (e.changedTouches) {
				touch = e.changedTouches[0];
				cursor.x = touch.pageX;
				cursor.y = touch.pageY;
			}
			else if (e.pageX || e.pageY) {
				cursor.x = e.pageX;
				cursor.y = e.pageY;
			} 
			else {
				var de = document.documentElement;
				var b = document.body;
				cursor.x = e.clientX + ((de.scrollLeft || b.scrollLeft) - (de.clientLeft || 0));
				cursor.y = e.clientY + ((de.scrollTop || b.scrollTop) - (de.clientTop || 0));
			}
			cursorPosition = cursor;
		}

		// Event handlers
		var touchstartHandler = function() {
			touchEnabled = true;
			if (opts.touchOverflowHidden)
				document.body.style.overflow = 'hidden';
			startCarousel();
		}
		var touchendHandler = function() {
			if (opts.touchOverflowHidden)
				document.body.style.overflow = '';
			stopCarousel(true);
			if (opts.autoScroll == true) 
				autoScroll();
		}
		var touchmoveHandler = function(e) {
			onMove(e);
		}
		var mouseenterHandler = function() {
			if (!touchEnabled)
				startCarousel();
		}
		var mouseleaveHandler = function() {
			if (!touchEnabled) {
				stopCarousel(true);
				if (opts.autoScroll == true)
					autoScroll();
			}
		}
		var mousemoveHandler = function(e) {
			if (!touchEnabled) 
				onMove(e);
		}

		//
		// Public functions 
    	/**
	     * destroy() public method
	     */
	    floatingCarouselObj.destroy = function () {

	        // Return if plugin isn't already initialized
	        if ( !opts ) return;

	        floatingCarouselObj.pause();

	        if(domObj.children.length > 1)
	        	scrollerContent[1].parentNode.removeChild(scrollerContent[1]);

			forEach(scrollerContent[0].children, function(obj) {
				obj.removeAttribute('style');
			});
 			if (matchSelector(scrollerContent[0], 'div')) {
				 domObj.innerHTML = scrollerContent[0].innerHTML;
			}
			else {
				scrollerContent[0].removeAttribute('style');
			}
			domObj.removeAttribute('style');


	        // Remove init class for conditional CSS
	        domObj.classList.remove( opts.initClass );

	        // Reset variables
	        opts = null;
	        scrollerPosition = null;
	        scrollContentLength = 0;
	    };

		/**
	     * update() public method
	     */
	    floatingCarouselObj.update = function (options) {

			floatingCarouselObj.destroy();
			
			floatingCarouselObj.init(options);
		};

		/**
	     * play() public method
	     */
	    floatingCarouselObj.play = function () {

	    	// Return if carousel is playing
	    	if (carouselPlaying) return;

			// Touch event listeners
	    	if (opts.enableTouchEvents) {
				domObj.addEventListener('touchstart', touchstartHandler);
				domObj.addEventListener('touchend', touchendHandler);
				domObj.addEventListener('touchmove', touchmoveHandler);
			}


			// Mouse event listeners
			domObj.addEventListener('mouseenter', mouseenterHandler);
			domObj.addEventListener('mouseleave', mouseleaveHandler);
			domObj.addEventListener('mousemove', mousemoveHandler);

			if (opts.autoScroll === true) {
				autoScroll();
			}

			carouselPlaying = true;
	    };

	    /**
	     * pause() public method
	     */
	    floatingCarouselObj.pause = function () {

			// Return if carousel is not playing
	    	if (!carouselPlaying) return;

			stopCarousel();
			if (autoScrollInterval) {
				clearInterval(autoScrollInterval);
				autoScrollInterval = 0;
			}
			if (scrollerInterval) {
				clearInterval(scrollerInterval);
				scrollerInterval = 0;
			}
			
			// Touch event listeners
	    	if (opts.enableTouchEvents) {
				domObj.removeEventListener('touchstart', touchstartHandler);
				domObj.removeEventListener('touchend', touchendHandler);
				domObj.removeEventListener('touchmove', touchmoveHandler);
			}


			// Remove mouse event listeners
			domObj.removeEventListener('mouseenter', mouseenterHandler);
			domObj.removeEventListener('mouseleave', mouseleaveHandler);
			domObj.removeEventListener('mousemove', mousemoveHandler);
 			
 			carouselPlaying = false;
		};

	    /**
	     * Initialise
	     */
	    floatingCarouselObj.init = function (options) {

	    	// return if no dom object
	    	if (domObj.length<1) {
	    		return false;
	    	}

	    	scrollContainer = domObj;

	        // feature test
	        if ( !supports ) return;

	        // Merge user options with defaults
	        opts = extend( defaults, options || {} );

	        // beforeCreateFunction
			if (opts.beforeCreateFunction != null && typeof opts.beforeCreateFunction === "function") {
				opts.beforeCreateFunction.call(domObj);
 			}

	        // Add class to HTML element to activate conditional CSS
	        domObj.classList.add(opts.initClass);

	        //main plugin functionality

	        ivlRate = opts.intervalRate;
			
			scrollContainer.style.paddingLeft = '0';
			scrollContainer.style.paddingRight = '0';

			scrollContainerLength = scrollContainer.offsetWidth;

			var childType = domObj.children[0].nodeName.toLowerCase();

			switch(childType) {
						
				case 'div':
				scrollContainer.innerHTML = '<div>'+scrollContainer.innerHTML+'</div>';
				scrollContainer.innerHTML += scrollContainer.innerHTML;
				scrollerContent = selectChildren(domObj, 'div');
				scrollerChildren = selectChildren(scrollerContent[0], 'div');
				break;
				
				case 'ul':

				scrollContainer.innerHTML += scrollContainer.innerHTML;
				scrollerContent = domObj.querySelectorAll('ul');
				scrollerChildren = selectChildren(scrollerContent[0], 'li');
				break;
				
				case 'ol':
				scrollContainer.innerHTML += scrollContainer.innerHTML;
				scrollerContent = domObj.querySelectorAll('ol');
				scrollerChildren = selectChildren(scrollerContent[0], 'li');
				break;
				
				default:
				console.log('unable to initialise scroller - please ensure contents are either in a UL, an OL or in DIVs');
				return false;
			}
			setProperties(scrollerChildren, { float : 'left' });

			switch(opts.scrollSpeed.toLowerCase()) {
				case 'slow':
				sMultiplier = 1;
				break;
				case 'fast':
				sMultiplier = 4;
				break;
				case 'medium':
				default:
				sMultiplier = 2;
			}

			forEach(scrollerChildren, function(obj) {
				var margins = {
					top : parseInt(window.getComputedStyle(obj).getPropertyValue('margin-top')),
					bottom : parseInt(window.getComputedStyle(obj).getPropertyValue('margin-bottom')),
					left : parseInt(window.getComputedStyle(obj).getPropertyValue('margin-left')),
					right : parseInt(window.getComputedStyle(obj).getPropertyValue('margin-right'))
				}
				var objHeight = (obj.offsetHeight + margins.top + margins.bottom);
				var objWidth = (obj.offsetWidth + margins.left + margins.right);

				if (opts.scrollerAlignment.toLowerCase()!='vertical') {
					scrollContentLength += objWidth;

					if (obj.offsetHeight>scrollerHeight)
						scrollerHeight = objHeight;
				}
				else {
					scrollContentLength += objHeight;
					if (obj.offsetWidth>scrollerWidth)
						scrollerWidth = objWidth;
				}
			});

			if (opts.scrollerAlignment.toLowerCase()!='vertical') {
				scrollContainer.style.height = scrollerHeight+'px';
			}
			else {
				scrollContainer.style.width = scrollerWidth+'px';
				scrollContainer.style.height = (scrollContainer.offsetHeight>0) ? 
												scrollContainer.offsetHeight+'px' :
												scrollContainer.parentNode.offsetHeight+'px';
				scrollContainerLength = scrollContainer.offsetHeight;
			}

			if (scrollContentLength>scrollContainerLength) {
				var offSetPoint = Math.round((scrollContentLength/100)*opts.scrollerOffset);
				offSetDistance = offSetPoint-(Math.round(scrollContainerLength/2));
				if (offSetDistance>(scrollContentLength-scrollContainerLength)) {
					offSetDistance = scrollContentLength-scrollContainerLength;
				}
			}
			else {
				scrollerContent[1].parentNode.removeChild(scrollerContent[1]);

				if (opts.afterCreateFunction != null && $.isFunction(opts.afterCreateFunction)) {
					opts.afterCreateFunction.call(domObj);
	 			}
				return;
			}

			scrollContainer.style.overflow = 'hidden';
			scrollContainer.style.position = 'relative';
			
			forEach(scrollerContent, function(obj) {

				obj.style.position = 'absolute';

				if (opts.scrollerAlignment.toLowerCase()!='vertical') {

					setProperties(obj, {
						top : 0,
						width : scrollContentLength +'px'
					});
				}
				else {
					setProperties(obj, {
						left : 0,
						height : scrollContentLength +'px',
						width : scrollerWidth +'px'
					});
				}

				forEach(obj.children, function(obj_l2) {
					obj_l2.style.float = 'left';
					obj_l2.style.position = 'static';
				});

			});
			
			if (opts.scrollerAlignment.toLowerCase()!='vertical') {
				scrollerContent[0].style.left = (offSetDistance>0) ? '-'+offSetDistance+'px' : '0';
				if (opts.looped==true) {
					scrollerContent[1].style.left = scrollerContent[0].offsetLeft-scrollContentLength+'px';
				}
				else {
					setProperties(scrollerContent[1], {
						display : 'none',
						top : '-1000px'
					});
				}
			}
			else {
				scrollerContent[0].style.top = (offSetDistance>0) ? '-'+offSetDistance+'px' : '0';
				if (opts.looped==true) {
					scrollerContent[1].style.top = scrollerContent[0].offsetTop-scrollContentLength+'px';
				}
				else {
					setProperties(scrollerContent[1], {
						display : 'none',
						top : '-1000px'
					});
				}
			}

			floatingCarouselObj.play();

			// afterCreateFunction
			if (opts.afterCreateFunction != null && typeof opts.afterCreateFunction === "function") {
				opts.afterCreateFunction.call(domObj);
 			}
			
	    };

	    floatingCarouselObj.init(options);

	    return floatingCarouselObj;

    }

    // -------------------------- jQuery -------------------------- //

	if ($) {
		$.fn.floatingCarousel = function(options) {
			return new floatingCarousel(this, options);
		};
	}

	// --------------------------------------------------------- //
    return floatingCarousel;
    
});