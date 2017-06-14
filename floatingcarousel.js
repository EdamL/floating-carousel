/*
* floatingCarousel 3.0 - jQuery plugin
* Copyright (c) 2017 Adam Lafene
*
* Licensed under the terms of the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/
(function ($) {
	$.fn.floatingCarousel = function (options, i) {

		// Handle multiple elements
		if (this.length > 1) {
			var a = new Array();
			this.each(
				function (i) {
					a.push($(this).floatingCarousel(options, i));
				});
			return a;
		}
		var opts = $.extend({}, $().floatingCarousel.defaults, options);
 				var scrollerInterval;
 				var autoScrollInterval;
 				
		/* PUBLIC FUNCTIONS */
		
		this.destroy = function () {
			var obj = this;
			$(obj).removeData('floatingCarousel');
			
			obj.children(':eq(1)').remove();
		 			if ($(this).find('> div').length > 0) {
						 obj[0].innerHTML = $(this).find('> div')[0].innerHTML;
							obj.children().each(function() {
								$(this, obj)[0].style.cssText = '';
							});
						}
						else {
							obj.find('li').each(function() {
								$(this, obj)[0].style.cssText = '';
							});
						}
						obj.children()[0].style.cssText = '';
						obj[0].style.cssText = '';
		 			obj.unbind();
		};
 
		this.update = function (options) {
			opts = null;
			opts = $.extend({}, $().floatingCarousel.defaults, options);
			this.destroy(true);
			return this.create();
		};
		
		
 		/* CREATE FUNCTION */
		this.create = function (iteration, method) {
			if(!$(this).html()) {
				return false; 
			}
			var obj = this.addClass('floatingCarouselContainer');
			var objContent = obj.html();
			
			// stop double initialization
			if ($(obj).data('floatingCarousel') == true && method != 'pause') {
				return this;
 			}

			// beforeCreateFunction
			if (opts.beforeCreateFunction != null && $.isFunction(opts.beforeCreateFunction)) {
				opts.beforeCreateFunction.call(obj);
 			}
			
			//START MAIN CREATE FUNCTIONALITY
			
			var scrollerContent,
				scrollSwitch = 0,
				scrollerPosition,
				sMultiplier,
				scrollerChildren,
				offSetDistance,
				scrollDistance,
				centerPoint,
				touchEnabled = false,
				functions = new Object(),
				scrollContainer = obj[0];
			
			scrollContainer.style.paddingLeft = '0';
			scrollContainer.style.paddingRight = '0';
			
			var scrollContainerLength = scrollContainer.offsetWidth;
			
			var childType = obj.children()[0].nodeName.toLowerCase();
			
			switch(childType) {
			
				case 'div':
				if (!method) {
					scrollContainer.innerHTML = '<div>'+obj[0].innerHTML+'</div>';
					scrollContainer.innerHTML += scrollContainer.innerHTML;
				}
				scrollerContent = obj.children('div');
				scrollerChildren = scrollerContent.eq(0).children('div').css('float', 'left');
				break;
				
				case 'ul':
				if (!method) {
					scrollContainer.innerHTML += scrollContainer.innerHTML;
				}
				scrollerContent = obj.find('ul');
				scrollerChildren = obj.find('ul:first > li').css('float', 'left');
				break;
				
				case 'ol':
				if (!method) {
					scrollContainer.innerHTML += scrollContainer.innerHTML;
				}
				scrollerContent = obj.find('ol');
				scrollerChildren = obj.find('ol:first > li').css('float', 'left');
				break;
				
				default:
				console.log('unable to initialise scroller - please ensure contents are either in a UL, an OL or in DIVs');
				return false;
			}
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
			var scrollContentLength = 0;
			var scrollerHeight = 0;
			var scrollerWidth = 0;
			
			var itemPadding;
			var itemMargin;
			
			switch (opts.scrollerAlignment.toLowerCase()) {
				
				case 'vertical':
				$(scrollerChildren).each (function(i) {	
					var item = $(this, obj);			
					scrollContentLength += $(this, obj).outerHeight(true);
					if (item[0].offsetWidth>scrollerWidth) {
						scrollerWidth = item[0].offsetWidth;
					}
				});
				break;
				case 'horizontal':
				default:
				$(scrollerChildren).each (function(i) {
					var item = $(this, obj);	
					scrollContentLength += $(this, obj).outerWidth(true);
					if (item[0].offsetHeight>scrollerHeight) {
						scrollerHeight = item[0].offsetHeight;
					}
				});
				break;
			
			}
			
			if (!method) {
				if (opts.scrollerAlignment.toLowerCase()!='vertical') {
					scrollContainer.style.height = scrollerHeight+'px';
				}
				else {
					scrollContainer.style.width = scrollerWidth+'px';
					scrollContainer.style.height = ($(scrollContainer).height()>0) ? 
													$(scrollContainer).height()+'px' :
													$(scrollContainer).parent().height()+'px';
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
					$(scrollerContent[1]).remove();

					if (opts.afterCreateFunction != null && $.isFunction(opts.afterCreateFunction)) {
						opts.afterCreateFunction.call(obj);
		 			}
					return false;
				}
				scrollContainer.style.overflow = 'hidden';
				scrollContainer.style.position = 'relative';
				
				var itemPadding;
				
				scrollerContent.each(function() {
					var item = $(this, obj);

					item.css('position', 'absolute');
					if (opts.scrollerAlignment.toLowerCase()!='vertical') {	
						item.css({
							'top' : 0,
							'width' : scrollContentLength
						});
					}
					else {
						item.css({
							'left' : 0,
							'height' : scrollContentLength,
							'width' : scrollerWidth
						});
					}
					$(this).children().each(function(i) {
						var item = $(this, obj);	
						if (opts.scrollerAlignment.toLowerCase()!='vertical') {				
							item.css('float', 'left');
						}
						else {
							item.css('float', '');
						}
						item.css('position', 'static');
					});
				});
				
				if (opts.scrollerAlignment.toLowerCase()!='vertical') {
					scrollerContent[0].style.left = (offSetDistance>0) ? '-'+offSetDistance+'px' : '0';
					if (opts.looped==true) {
						scrollerContent[1].style.left = scrollerContent[0].offsetLeft-scrollContentLength+'px';
					}
					else {
						scrollerContent[1].style.display = 'none';
						scrollerContent[1].style.top = '-1000px';
					}
				}
				else {
					scrollerContent[0].style.top = (offSetDistance>0) ? '-'+offSetDistance+'px' : '0';
					if (opts.looped==true) {
						scrollerContent[1].style.top = scrollerContent[0].offsetTop-scrollContentLength+'px';
					}
					else {
						scrollerContent[1].style.display = 'none';
						scrollerContent[1].style.left = '-1000px';
					}
				}

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

				obj[0].addEventListener('touchstart', function() {
					touchEnabled = opts.enableTouchEvents || false;
					functions.startCarousel();
				});
				obj[0].addEventListener('touchend', function() {
					functions.stopCarousel(true);
					if (opts.autoScroll == true) {
						functions.autoScroll();
					}
				});
				obj[0].addEventListener('touchmove', function(e) {
					onMove(e);
				});

				obj.mouseenter(function() {
					if (!touchEnabled)
						functions.startCarousel();
				});
				obj.mouseleave(function() {
					if (!touchEnabled) {
						functions.stopCarousel(true);
						if (opts.autoScroll == true) {
							functions.autoScroll();
						}
					}
				});
				obj.mousemove(function(e) {
					if (!touchEnabled) {
						onMove(e);
					}			
				});
			}
			
			functions.autoScroll = function() {
				var ivlRate = 40;
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
			
			functions.startCarousel = function() {
				if (autoScrollInterval) {
					clearInterval(autoScrollInterval);
					autoScrollInterval = 0;
				}
				centerPoint = (opts.scrollerAlignment.toLowerCase()!='vertical') ? 
											Math.round($(scrollContainer).offset().left+(scrollContainer.offsetWidth/2)) :
											Math.round($(scrollContainer).offset().top+(scrollContainer.offsetHeight/2));
				
				scrollerPosition = scrollerPosition ? scrollerPosition : 
													 ((opts.scrollerAlignment.toLowerCase()!='vertical') ? 
													 parseInt(scrollerContent[0].style.left) :
													 parseInt(scrollerContent[0].style.top));
				
				scrollerInterval = setInterval(function() {
					try {
						cursorPosition = cursorPosition;
					} catch(e) {
						return;
					}
					var cursorDistance;
					var cursor = (opts.scrollerAlignment.toLowerCase()!='vertical') ? cursorPosition.x : cursorPosition.y;
					var halfContainer = scrollContainerLength/2;
					
					cursorDistance = (cursor<centerPoint) ? centerPoint-cursor : cursor-centerPoint;
					
					scrollDistance = (cursorDistance<(Math.ceil((halfContainer/100)*30))) ? 1 :
														 ((cursorDistance<(Math.ceil((halfContainer/100)*50))) ? 2*sMultiplier : 
														 ((cursorDistance<(Math.ceil((halfContainer/100)*70))) ? 3*sMultiplier :
														 ((cursorDistance<(Math.ceil((halfContainer/100)*90))) ? 4*sMultiplier :
														 6*sMultiplier)));
														 
					if (cursor<centerPoint) {
														 
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
					else if (cursor>centerPoint) { 
						
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
				}, 40);
			};
			
			functions.stopCarousel = function(easing) {
				
				if (!scrollerInterval) { 
					return;
				}
				clearInterval(scrollerInterval);
				scrollerInterval = 0;
				if (!easing || opts.looped==false || opts.autoScroll==true) {
					return;
				}
				if (scrollDistance>1) {
					var i;
					var brakingDistance = 0;
					for (i=scrollDistance;i>1;i--) {
						brakingDistance+=i;
					}
					var cursor = (opts.scrollerAlignment.toLowerCase()!='vertical') ? cursorPosition.x : cursorPosition.y;
					
					if (cursor<centerPoint) {
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
							if (cursor<centerPoint) {
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
					}, 50);
				}
				
			};
			
			if (method != 'pause') {
				if (opts.autoScroll == true) {
					functions.autoScroll();
				}
			}
			
			switch (method) {
	 			case 'pause':
	 			functions.stopCarousel();
				if (autoScrollInterval) {
					clearInterval(autoScrollInterval);
					autoScrollInterval = 0;
				}
	 			obj.unbind('mouseenter');
	 			obj.unbind('mouseleave');
	 			$(obj).data('floatingCarousel', false);
	 			return;
	 			break;
	 			case 'play':
	 			$('html').mousemove(function(e) {
					 	var cursor = {x:0, y:0};
					if (e.pageX || e.pageY) {
						cursor.x = e.pageX;
						cursor.y = e.pageY;
					} 
					else {
						var de = document.documentElement;
						var b = document.body;
						cursor.x = e.clientX + (de.scrollLeft || b.scrollLeft) - (de.clientLeft || 0);
						cursor.y = e.clientY + (de.scrollTop || b.scrollTop) - (de.clientTop || 0);
					}
					cursorPosition = cursor;
	 				
	 				if (cursorPosition.x>=obj.offset().left && cursorPosition.x<=(obj.offset().left+obj[0].offsetWidth) &&
						 cursorPosition.y>=obj.offset().top && cursorPosition.y<=(obj.offset().top+obj[0].offsetHeight)) {
						 		functions.startCarousel();
						}
					 	obj.mouseenter(function() {
							functions.startCarousel();
						});
						obj.mouseleave(function() {
							functions.stopCarousel(true);
							if (opts.autoScroll == true) {
								functions.autoScroll();
							}
						});
					$(this).unbind('mousemove');
					
					if (opts.autoScroll == true) {
						functions.autoScroll();
					}
				});
	 			break;
	 		}	
			
			//END MAIN CREATE FUNCTIONALITY
 
			// Set plugin flag
			$(obj).data('floatingCarousel', true);
 
			// afterCreateFunction
			if (opts.afterCreateFunction != null && $.isFunction(opts.afterCreateFunction)) {
				opts.afterCreateFunction.call(obj);
 			}
			return this;
		};
		
		this.pause = function () {
			this.create(i, 'pause');
		};
		this.play = function () {
			this.create(i, 'play');
		};
 				
 		// CREATE FUNCTION CALL
		return this.create(i);
	};
 
	jQuery.fn.floatingCarousel.defaults = {
		autoScroll : false,
		autoScrollDirection : 'left',
		autoScrollSpeed : 10000,
	 	looped : true,
	 	scrollerAlignment : 'horizontal',
		scrollerOffset : 0,
	 	scrollSpeed : 'medium',
		beforeCreateFunction : null,
		afterCreateFunction : null,
		enableTouchEvents : true
	};
})(jQuery);