/**
 * vScroller - Vertical Scroller jQuery Plugin
 * @author rogeriolino http://rogeriolino.com
 */
(function($) {
    
    $.fn.vScroller = function(options) {
        
        var defaults = {
            width: '100%',
            height: 400, 
            delta: 5,
            barMinOpacity: .3, 
            barMaxOpacity: .8,
            barWidth: 5,
            barHeight: 40,
            barBackground: 'black',
            barRadius: 8,
            onScroll: undefined
        };
        
        var opts = $.extend({}, defaults, options);
        
        return this.each(function() {
            var self = this;
            this.target, this.inner, this.bar;
            this.release = false;
            this.opts = opts;
        
            self.target = $(this);
            self.target.width(opts.width);
            self.target.height(opts.height);
            self.target.css({
                position: 'relative',
                overflow: 'hidden'
            });

            self.inner = $(document.createElement('div'));
            self.inner.addClass('vscroller content');
            self.inner.css({
                position: 'relative',
                top: '0px'
            });
            self.inner.append(self.target.html());
            
            self.target.text('');
            self.target.append(self.inner);
            
            self.bar = $(document.createElement('div'));
            self.bar.width(opts.barWidth);
            self.bar.height(opts.barHeight);
            self.bar.css({
                position: 'absolute',
                top: '0px',
                right: '2px',
                borderRadius: opts.barRadius,
                MozBorderRadius: opts.barRadius,
                background: opts.barBackground
            });
            self.bar.fadeTo(0, opts.barMinOpacity);
            
            self.innerHeight = self.inner.height() + opts.delta + 5;
            self.maxHeight = (self.innerHeight - self.target.height()) * -1;

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
                    var y1 = self.target.offset().top;
                    var y2 = self.target.height() + y1;
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
            
            self.target.append(self.bar);
            
            var mouseWheel = function(src, evt) {
                var evt = evt ? evt : window.event;
                var delta;
                
                if (evt.wheelDelta) {
                    delta = evt.wheelDelta / 120; 
                    if (window.opera) {
                        delta = -delta;
                    }
                } else if (evt.detail) {
                    delta = -evt.detail / 3;
                }
                
                var y = pxToInt(src.inner.css('top'));
                if (!(delta > 0 && y >= 0) && !(delta < 0 && y <= src.maxHeight)) {
                    y += delta * opts.delta;
    	            src.scrollTo(y);
                }
            	return false;
            }
            
            self.target.on('mousewheel', function(evt) { mouseWheel(self, evt.originalEvent) });
            self.target.on('DOMMouseScroll', function(evt) { mouseWheel(self, evt.originalEvent) });
            
            self.scrollTo = function(y) {
                var pct, innerY, barY;
                if (!self.release) {
                    pct = Math.floor(Math.round(y * 100 / self.maxHeight));
                    innerY = intToPx(y);
                    barY = intToPx((self.target.height() - self.bar.height()) * pct / 100);
                } else {
                    pct = (y + y / self.target.height() * self.bar.height()) * 100 / self.target.height();
                    innerY = intToPx(self.maxHeight * pct / 100);
                    barY = intToPx(y);
                }
                if (pct < 0) {
                    pct = 0;
                } else if (pct > 100) {
                    pct = 100;
                }
                if (barY < 0) {
                    barY = 0;
                } else if (barY > self.target.height() - self.bar.height()) {
                    barY = self.target.height() - self.bar.height();
                }
                self.inner.css('top', innerY);
                self.bar.css('top', barY);
                if (typeof(self.opts.onScroll) == 'function') {
                    self.opts.onScroll({'pct': pct, 'y': barY});
                }
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
