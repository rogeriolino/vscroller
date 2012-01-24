/**
 * vScroller - Vertical Scroller jQuery Plugin
 * @author rogeriolino http://rogeriolino.com
 * @version 0.1.0
 */
(function($) {
    
    $.fn.vScroller = function(options) {
        
        var defaults = {
            width: '100%',
            height: 400, 
            delta: 5,
            barMinOpacity: .3, 
            barMaxOpacity: .8,
            barWidth: 6,
            barHeight: 40,
            barBackground: 'black',
            barRadius: 8,
            barPosition: 'right',
            onScroll: function(args) {}
        };
        
        var opts = $.extend({}, defaults, options);
        
        return this.each(function() {
            var self = this;
            this.release = false;
            this.over = false;
            this.opts = opts;
        
            self.target = $(this);
            self.target.width(opts.width);
            self.target.height(opts.height);
            self.target.css({
                position: 'relative',
                overflow: 'hidden'
            });
            
            self.paddingTop = pxToInt(self.target.css('paddingTop'));
            self.paddingBottom = pxToInt(self.target.css('paddingBottom'));

            self.inner = $(document.createElement('div'));
            self.inner.addClass('vscroller content');
            self.inner.css({
                position: 'relative',
                top: intToPx(self.paddingTop)
            });
            self.inner.append(self.target.html());
            
            self.target.text('');
            self.target.append(self.inner);
            
            self.bar = $(document.createElement('div'));
            self.bar.width(opts.barWidth);
            self.bar.height(opts.barHeight);
            self.bar.css({
                position: 'absolute',
                top: intToPx(self.paddingTop),
                borderRadius: opts.barRadius,
                MozBorderRadius: opts.barRadius,
                background: opts.barBackground
            });
            self.bar.css(opts.barPosition, '5px');
            self.bar.fadeTo(0, opts.barMinOpacity);
            
            self.innerHeight = self.inner.height() + opts.delta;
            self.maxHeight = (self.innerHeight - self.target.height() - self.paddingBottom) * -1;

            self.bar.hover(
                function() {
                    $(this).fadeTo('fast', opts.barMaxOpacity);
                },
                function() {
                    $(this).fadeTo('fast', opts.barMinOpacity);
                }
            );
            
            $(window).on('mousemove', function(event) {
                if (self.release) {
                    var y1 = (self.target.offset().top - $(window).scrollTop()) - self.paddingTop;
                    var y2 = (self.target.height() + y1) + self.paddingBottom;
                    if (event.clientY >= y1 && event.clientY <= y2) {
                        var y = event.clientY - y1;
                        y -= y / self.target.height() * self.bar.height();
                        self.scrollTo(y);
                    }
                }
                return false;
            });
            
            self.bar.on('mousedown', function(event) {
                self.release = true;
                return false;
            });
            
            $(window).on('mouseup', function(event) {
                self.release = false;
                return false;
            });
            
            $(window).keydown(function(event) {
                if (self.over && !self.release) {
//                    alert(event.which);
                    switch (event.which) {
                    case 33: // page up
                        self.scrollTo(self.top() + self.opts.delta * 10);
                        return false;
                    case 34: // page up
                        self.scrollTo(self.top() - self.opts.delta * 10);
                        return false;
                    case 35: // end
                        self.scrollTo(self.maxHeight);
                        return false;
                    case 36: // home
                        self.scrollTo(self.paddingTop);
                        return false;
                    case 38: // up
                        self.scrollTo(self.top() + self.opts.delta);
                        return false;
                    case 40: // down
                        self.scrollTo(self.top() - self.opts.delta);
                        return false;
                    }
                }
                return true;
            });
            
            self.target.append(self.bar);
            
            self.mouseWheel = function(evt) {
                evt = evt ? evt : window.event;
                var delta; // 1 | -1
                
                if (evt.wheelDelta) {
                    delta = evt.wheelDelta / 120; 
                    if (window.opera) {
                        delta = -delta;
                    }
                } else if (evt.detail) {
                    delta = -evt.detail / 3;
                }
                
                var y = self.top() + delta * opts.delta;
                self.scrollTo(y);
            	return false;
            }
            
            self.target.on('mousewheel', function(evt) { return self.mouseWheel(evt.originalEvent) });
            self.target.on('DOMMouseScroll', function(evt) { return self.mouseWheel(evt.originalEvent) });
            
            self.target.on('mouseover', function(event) { self.over = true; });
            self.target.on('mouseout', function(event) { self.over = false; });
            
            self.scrollTo = function(y) {
                var pct, innerY, barY;
                if (!self.release) {
                    pct = Math.floor(Math.round(y * 100 / self.maxHeight));
                    innerY = y;
                    barY = (self.target.height() - self.bar.height()) * pct / 100;
                } else {
                    pct = (y + y / self.target.height() * self.bar.height()) * 100 / self.target.height();
                    innerY = self.maxHeight * pct / 100;
                    barY = y;
                }
                if (pct < 0) {
                    pct = 0;
                } else if (pct > 100) {
                    pct = 100;
                }
                if (barY < self.paddingTop) {
                    barY = self.paddingTop;
                } else if (barY > self.target.height() - self.bar.height() - self.paddingBottom) {
                    barY = self.target.height() - self.bar.height();
                }
                if (innerY > self.paddingTop) {
                    innerY = self.paddingTop;
                } else if (innerY < self.maxHeight) {
                    innerY = self.maxHeight;
                }
                self.inner.css('top', intToPx(innerY));
                self.bar.css('top', intToPx(barY));
                if (typeof(self.opts.onScroll) == 'function') {
                    self.opts.onScroll({'pct': pct, 'y': barY});
                }
            }
            
            self.top = function() {
                return pxToInt(self.inner.css('top'));
            }
            
            self.append = function(arg) {
                self.inner.append(arg);
            }
            
        });
        
        function pxToInt(value) {
            return parseInt(value.replace('px', ''));
        }
        
        function intToPx(value) {
            return value + 'px';
        }
   
    }
    
    
})(jQuery);
