/*!
 * swan.timeline v1.0
 *
 * Copyright 2014 WistronITS
 * Author Rex Rao
 * Date: 2014.3.5
 */

$(function() {
    // the widget definition, where "custom" is the namespace,
    // "colorize" the widget name
    $.widget("swan.timeline", {
        // default options
        options: {
            startTime: '2016/12/1',
            endTime: '2016/12/31',
            showArrow: true,
            timeScalePosition: 'bottom',
            autoAdjustTime: 'none',
            smoothScroll: 'advanced',
            guides: 'both',
            showGuidesLabel: true,
            showSlider: true,
            zoom: 5,
            data: null
        },

        // elements
        _canvas: null,
        _arrowLeft: null,
        _arrowRight: null,
        _itemArea: null,
        _timeScale: null,
        _guidesLeft: null,
        _guidesRight: null,
        _slider: null,
        _ie8Hint: null,

        // item
        _timeScaleItems: [],
        _items: [],
        _itemRows: [],
        _currentItem: null,

        // scroll
        _arrowInited: false,
        _scrolling: false,
        _scrollX: null,
        _scrollDirection: null,
        _scrollStartX: null,
        _scrollStartTime: null,
        _scrollAcceleration: 0,
        _smoothScrollTime: 400,

        // offset and position
        _widthAdjust: 0,
        _dayWidth: 6, // 刻度图片宽度
        _rowHeigth: 0,
        _rowMargin: 15,
        _timeScaleHeigth: 0,
        _minHeight: 300,
        _canvasHeight: 0,

        // zoom
        _zoomLevel: 5,
        _sliderInited: false,

        // time
        _startTime: new Date(),
        _endTime: new Date(),

        // the constructor
        _create: function() {
            var self = this;

            this.element
                .addClass('swan-timeline-container ui-corner-all')
                .height(this._minHeight);

            this._canvas = $('<div class="swan-timeline-canvas swan-timeline-canvas-drag">')
                .draggable({
                    axis: 'x',
                    cursor: 'url(./images/cursor_drag_hand.png), w-resize',
                    refreshPositions: true,
                    start: function(event, ui) {
                        $(this)
                            .removeClass('swan-timeline-canvas-drag')
                            .stop();
                        self._scrollX = self._scrollStartX = event.pageX;
                        self._scrollStartTime = new Date();
                    },
                    drag: function(event, ui) {
                        self._scrollDirection = (event.pageX < self._scrollX) ? 'right' : 'left';
                        self._scrollX = event.pageX;
                    },
                    stop: function(event, ui) {
                        $(this).addClass('swan-timeline-canvas-drag');

                        var s = Math.abs(event.pageX - self._scrollStartX);
                        var t = new Date().getTime() - self._scrollStartTime.getTime();
                        self._scrollAcceleration = parseFloat(s) / (t * t);

                        // 惯性滑动
                        self._smoothScroll(function() {
                            self._adjustOffset(null, self, true);
                        });

                        self._scrollX = null;
                        self._scrollStartX = null;
                        self._scrollStartTime = null;
                    }
                })
                .on('mousewheel', function(event) {
                    // Require jquery.mousewheel plug-in
                    if (event.deltaY === 0) return;
                    if (event.deltaY > 0) {
                        self.zoom(self._zoomLevel + 1);
                        event.preventDefault();
                    } else {
                        self.zoom(self._zoomLevel - 1);
                        event.preventDefault();
                    }
                })
                .appendTo(this.element);

            this._itemArea = $('<div class="swan-timeline-item-container">')
                .appendTo(this._canvas);

            this._timeScale = $('<div class="swan-timeline-timescale">')
                .appendTo(this._canvas);

            this._guidesLeft = $('<div class="swan-timeline-guides"><div></div></div>')
                .appendTo(this._canvas);

            this._guidesRight = $('<div class="swan-timeline-guides"><div></div></div>')
                .appendTo(this._canvas);

            this._refresh();
        },

        // called when created, and later when changing options
        _refresh: function() {
            if (this.options.showArrow) {
                this._initScroller();
                this._arrowLeft.show();
                this._arrowRight.show();
            } else {
                if (this._arrowLeft) this._arrowLeft.hide();
                if (this._arrowRight) this._arrowRight.hide();
            }

            if (this.options.showSlider) {
                this._initSlider();
                this._slider.container.show();
            } else {
                if (this._slider) this._slider.container.hide();
            }

            this._itemArea.empty();
            this._timeScale.empty();
            this._guidesLeft.hide();
            this._guidesRight.hide();

            this._timeScaleItems = [];
            this._items = [];
            this._itemRows = [];
            this._currentItem = null;

            this._widthAdjust = 0;
            this._rowHeigth = 0;
            this._timeScaleHeigth = 0;

            this._zoomLevel = this.options.zoom;

            this._startTime = new Date(this.options.startTime);
            this._endTime = new Date(this.options.endTime);

            this._initData();
            this._initTimeScale();
            this._drawTimeScale(false);
            this._drawItems();
            this._adjustHeight();
            this._fixIE8Height();
        },

        // events bound via _on are removed automatically
        // revert other modifications here
        _destroy: function() {
            // remove generated elements
            this._canvas.remove();

            this.element.removeClass("swan-timeline-container");
        },

        // _setOptions is called with a hash of all options that are changing
        // always refresh when changing options
        _setOptions: function() {
            // _super and _superApply handle keeping the right this-context
            this._superApply(arguments);
            this._refresh();
        },

        // _setOption is called for each individual option that is changing
        _setOption: function(key, value) {
            this._super(key, value);
        },

        _initScroller: function() {
            var self = this;
            if (this._arrowInited) return;

            this._arrowLeft = $('<div class="swan-timeline-arrow swan-timeline-arrow-left"><div></div></div>')
                .css('opacity', 0.1)
                .on('mousedown', function(event) {
                    self._scrolling = true;
                    self._scrollDirection = 'left';
                    self._scrollAcceleration = 0.001;
                    self._scroll();
                })
                .on('mouseup', function(event) {
                    self._scrolling = false;
                })
                .on('mouseenter', function(event) {
                    $(this).stop().fadeTo(400, 0.5);
                })
                .on('mouseleave', function(event) {
                    $(this).stop().fadeTo(400, 0.1);
                })
                .appendTo(this.element);

            this._arrowRight = $('<div class="swan-timeline-arrow swan-timeline-arrow-right"><div></div></div>')
                .css('opacity', 0.1)
                .on('mousedown', function(event) {
                    self._scrolling = true;
                    self._scrollDirection = 'right';
                    self._scrollAcceleration = 0.001;
                    self._scroll();
                })
                .on('mouseup', function(event) {
                    self._scrolling = false;
                })
                .on('mouseenter', function(event) {
                    $(this).stop().fadeTo(400, 0.5);
                })
                .on('mouseleave', function(event) {
                    $(this).stop().fadeTo(400, 0.1);
                })
                .appendTo(this.element);

            this._arrowInited = true;
        },

        _initSlider: function() {
            var self = this;
            if (this._sliderInited) return;

            var s = {};
            s.container = $('<div class="swan-timeline-slider-container">')
                .css('opacity', 0.25)
                .on('mouseenter', function(event) {
                    $(this)
                        .stop()
                        .fadeTo(200, 0.75);
                })
                .on('mouseleave', function (event) {
                    $(this)
                        .stop()
                        .fadeTo(200, 0.25);
                });
            s.slider = $('<div class="swan-timeline-slider">').appendTo(s.container);
            s.block = $('<div class="swan-timeline-slider-handle">')
                .draggable({
                    axis: 'y',
                    cursor: 'pointer',
                    refreshPositions: true,
                    containment: "parent",
                    drag: function (event, ui) {
                        var zoomLevel = self._slider.getZoomLevel();
                        if (zoomLevel !== self._zoomLevel) {
                            self.zoom(zoomLevel, true);
                        }
                    }
                })
                .appendTo(s.slider);
            s.plus = $('<div class="swan-timeline-slider-plus">')
                .on('mousedown', function (event) {
                    self.zoom(self._zoomLevel + 1);
                })
                .appendTo(s.container);
            s.minus = $('<div class="swan-timeline-slider-minus">')
                .on('mousedown', function (event) {
                    self.zoom(self._zoomLevel - 1);
                })
                .appendTo(s.container);
            s.setZoomLevel = function() {
                var top = (10 - self._zoomLevel) * 8;
                this.block
                    .stop()
                    .animate({
                        'top': top
                    });
            };
            s.getZoomLevel = function() {
                var top = this.block.position().top;
                var zoomLevel = Math.min(10, Math.max(1, parseInt(10 - top / 8)));
                return zoomLevel;
            };

            s.setZoomLevel();
            s.container = s.container
                .appendTo(this.element);

            this._slider = s;
            this._sliderInited = true;
        },

        _initData: function() {
            if (!this.options.data || !$.isArray(this.options.data)) return;

            for (var i = 0; i < this.options.data.length; i++) {
                var data = this.options.data[i];

                var item = {
                    startTime: new Date(data.startTime),
                    endTime: new Date(data.endTime),
                    title: data.title,
                    content: data.content,
					id: data.id
                };

                if ((this.options.autoAdjustTime === 'both' || this.options.autoAdjustTime === 'start')
                    && (item.startTime < this._startTime || i === 0)) {
                    this._startTime = item.startTime;
                }

                if ((this.options.autoAdjustTime === 'both' || this.options.autoAdjustTime === 'end')
                    && (item.endTime > this._endTime || i === 0)) {
                    this._endTime = item.endTime;
                }

                this._items.push(item);
            }
        },

        _initTimeScale: function() {
            var startYear = this._startTime.getFullYear();
            var startMonth = this._startTime.getMonth();
            var endYear = this._endTime.getFullYear();
            var endMonth = this._endTime.getMonth();
            if (startYear === endYear) {
                for (var i = startMonth; i <= endMonth; i++) {
                    var timeScaleItem1 = {
                        date: new Date(startYear, i)
                    };
                    this._timeScaleItems.push(timeScaleItem1);
                }
            } else {
                for (var j = startMonth; j < 12; j++) {
                    var timeScaleItem2 = {
                        date: new Date(startYear, j)
                    };
                    this._timeScaleItems.push(timeScaleItem2);
                }
                for (var k = startYear + 1; k < endYear; k++) {
                    for (var l = 0; l < 12; l++) {
                        var timeScaleItem3 = {
                            date: new Date(k, l)
                        };
                        this._timeScaleItems.push(timeScaleItem3);
                    }
                }
                for (var m = 0; m <= endMonth; m++) {
                    var timeScaleItem4 = {
                        date: new Date(endYear, m)
                    };
                    this._timeScaleItems.push(timeScaleItem4);
                }
            }
        },

        _drawTimeScale: function(showAnimation) {
            this._dayWidth = this._zoomLevel;
            var fontSize = this._zoomLevel !== 1
                ? 18 + (this._zoomLevel - 5)
                : 12;

            var timeScaleWidth = 0;
            for (var n = 0; n < this._timeScaleItems.length; n++) {
                var timeScaleItem = this._timeScaleItems[n];
                timeScaleItem.monthWidth = this._getDaysOfMonth(timeScaleItem.date) * this._dayWidth;

                var dateText = '';
                var year = timeScaleItem.date.getFullYear();
                var month = timeScaleItem.date.getMonth() + 1;
                if (this._zoomLevel === 1) {
                    if (n === 0 || month === 1) {
                        dateText = '' + year;
                    }
                } else if (this._zoomLevel <= 3 && month !== 1 && n !== 0) {
                    dateText = '' + month;
                } else {
                    dateText = year + '.' + month;
                }

                var dateSpan = $('<span>').html(dateText);

                if (this._zoomLevel < 4) {
                    dateSpan.css('background-image', 'none');
                } else {
                    var url = 'url(./images/bgScale';
                    if (this.options.timeScalePosition === 'top') {
                        url += 'Top';
                    }
                    url += '_' + +this._zoomLevel + '.png)';
                    dateSpan.css('background-image', url);
                }

                timeScaleItem.element = $('<div class="swan-timeline-timescale-date">')
                    .width(timeScaleItem.monthWidth)
                    .css('font-size', fontSize)
                    .append(dateSpan)
                    .appendTo(this._timeScale);

                if (n === 0) {
                    this._widthAdjust = this._getHorizonMargin(timeScaleItem.element);
                }

                timeScaleWidth += timeScaleItem.monthWidth + this._widthAdjust;
            }
            timeScaleWidth += this._widthAdjust;

            if (this.options.timeScalePosition === 'top') {
                this._timeScaleHeigth = $('.swan-timeline-timescale-date > span')
                    .addClass('swan-timeline-timescale-top')
                    .height();
            } else {
                this._timeScaleHeigth = $('.swan-timeline-timescale-date > span')
                    .removeClass('swan-timeline-timescale-top')
                    .height();
            }

            this._adjustOffset(timeScaleWidth, this, showAnimation);
        },

        // 绘制Item
        _drawItems: function() {
            var self = this;

            for (var i = 0; i < this._items.length; i++) {
                var item = this._items[i];
                if (item.endTime < this._startTime
                    || item.startTime > this._endTime) {
                    continue;
                }

                item.element = $('<div class="swan-timeline-item"></div>')
                    .html($('<span>')
                        .attr('title', item.title)
                        .text(item.title))
                    .appendTo(this._itemArea);

                var leftAndWidth = this._getLeftAndWidth(item.startTime, item.endTime);
                item.left = leftAndWidth.left;
                item.width = leftAndWidth.width;
                item.right = item.left + item.width;

                var accepted = false;
                for (var j = 0; j < this._itemRows.length; j++) {
                    var row = this._itemRows[j];
                    var rowAccepted = true;
                    for (var k = 0; k < row.length; k++) {
                        var rowItem = row[k];
                        if (item.left >= rowItem.left && item.left <= rowItem.right
                            || item.right >= rowItem.left && item.right <= rowItem.right
                            || item.left <= rowItem.left && item.right >= rowItem.right) {
                            rowAccepted = false;
                            break;
                        }
                    }
                    if (rowAccepted) {
                        item.vertical = this._getVertical(j);
                        row.push(item);
                        accepted = true;
                        break;
                    }
                }
                if (!accepted) {
                    if (this._itemRows.length === 0) {
                        this._rowHeigth = item.element.height();
                    }
                    item.vertical = this._getVertical(this._itemRows.length);
                    this._itemRows.push([item]);
                }

                // Item就位动画
                var delay = Math.random() * 500;
                var drawGuides = this.options.guides !== 'none'
                    ? function() {
                        $(this)
                            .on('mouseenter', function(event) {
                                self._currentItem = self._findItem($(this));
                                self._drawGuides();
                            })
                            .on('mouseleave', function(event) {
                                self._currentItem = null;
                                self._guidesLeft.hide();
                                self._guidesRight.hide();
                            });
                    }
                    : null;
                item.element = item.element
                    .css(this.options.timeScalePosition, item.vertical)
                    .delay(delay)
                    .animate({
                        'width': item.width + 'px',
                        'left': item.left + 'px'
                    }, 1000, 'easeOutBounce', drawGuides);
            }
        },

        // 显示辅助线
        _drawGuides: function() {
            if (this.options.guides === 'none' || !this._currentItem) return;

            var leftVertical = this._canvasHeight - this._currentItem.vertical - this._rowHeigth;
            var rightVertical = leftVertical + this._rowHeigth / 2.0;
            var canvasWidth = this._canvas.width();

            if (this.options.guides === 'both' || this.options.guides === 'start') {
                if (this.options.timeScalePosition === 'top') {
                    this._guidesLeft
                        .css({
                            'left': this._currentItem.left,
                            'top': 'auto',
                            'bottom': leftVertical
                        });
                } else {
                    this._guidesLeft
                        .css({
                            'left': this._currentItem.left,
                            'top': leftVertical,
                            'bottom': 'auto'
                        });
                }
                this._guidesLeft.show();

                var labelLeft = this._guidesLeft.find('div');
                if (this.options.showGuidesLabel) {
                    var labelLeftTop = 0;
                    var labelLeftLeft = 0;
                    if (this.options.timeScalePosition === 'top') {
                        labelLeftTop = this._canvasHeight - this._timeScaleHeigth - this._rowHeigth + 20;
                    } else {
                        labelLeftTop = this._rowHeigth + 5;
                    }
                    if (this._currentItem.left + 60 >= canvasWidth) {
                        labelLeftLeft = -60;
                    }

                    labelLeft
                        .css({
                            'top': labelLeftTop,
                            'left': labelLeftLeft
                        })
                        .text(this._currentItem.startTime.getFullYear()
                            + '/' + (this._currentItem.startTime.getMonth() + 1)
                            + '/' + this._currentItem.startTime.getDate())
                        .show();
                } else {
                    labelLeft
                        .empty()
                        .hide();
                }
            }

            if (this.options.guides === 'both' || this.options.guides === 'end') {
                if (this.options.timeScalePosition === 'top') {
                    this._guidesRight
                        .css({
                            'left': Math.min(this._currentItem.right, canvasWidth),
                            'top': 'auto',
                            'bottom': rightVertical
                        });
                } else {
                    this._guidesRight
                        .css({
                            'left': Math.min(this._currentItem.right, canvasWidth),
                            'top': rightVertical,
                            'bottom': 'auto'
                        });
                }
                this._guidesRight.show();

                var labelRight = this._guidesRight.find('div');
                if (this.options.showGuidesLabel) {
                    var labelRightTop = 0;
                    var labelRightLeft = 0;
                    if (this.options.timeScalePosition === 'top') {
                        labelRightTop = this._canvasHeight - this._timeScaleHeigth - this._rowHeigth / 2.0 + 20;
                        if (this._currentItem.width <= 60) {
                            labelRightTop -= 20;
                        }
                    } else {
                        labelRightTop = this._rowHeigth / 2.0 + 5;
                        if (this._currentItem.width <= 60) {
                            labelRightTop += 20;
                        }
                    }
                    if (this._currentItem.right + 60 >= canvasWidth) {
                        labelRightLeft = -60;
                    }

                    labelRight
                        .css({
                            'top': labelRightTop,
                            'left': labelRightLeft
                        })
                        .text(this._currentItem.endTime.getFullYear()
                            + '/' + (this._currentItem.endTime.getMonth() + 1)
                            + '/' + this._currentItem.endTime.getDate())
                        .show();
                } else {
                    labelRight
                        .empty()
                        .hide();
                }
            }
        },

        // 修正画布宽度和滚动越界
        _adjustOffset: function(width, widget, showAnimation) {
            var self = widget || this;

            var canvasLeft = self._canvas.position().left;
            var canvasWidth = width || self._canvas.outerWidth();
            var containerWidth = self.element.innerWidth();
            if (canvasLeft > 0 || canvasWidth < containerWidth) {
                if (showAnimation) {
                    this._canvas.animate({
                        left: 0
                    }, 300, 'easeOutQuart');
                } else {
                    this._canvas.css('left', 0);
                }
            } else {
                var left = containerWidth - canvasWidth + self._widthAdjust;
                if (left > canvasLeft) {
                    // 右越界
                    if (showAnimation) {
                        self._canvas.animate({
                            left: left
                        }, 300, 'easeOutQuart');

                    } else {
                        this._canvas.css('left', left);
                    }
                }
            }

            self._canvas.outerWidth(width);
        },

        // 修正画布高度
        _adjustHeight: function() {
            var totalHeight = this._timeScaleHeigth + this._rowMargin + (this._rowHeigth + this._rowMargin) * this._itemRows.length;
            totalHeight = Math.max(totalHeight, this._minHeight);
            if (totalHeight !== this._canvasHeight) {
                this._canvasHeight = totalHeight;
                this.element.animate({
                    'height': this._canvasHeight
                }, 300, 'easeOutQuad');
            }
        },

        _fixIE8Height: function() {
            var ie8 = /msie\s8/.test(navigator.userAgent.toLowerCase());
            if (ie8) {
                if (!this._ie8Hint) {
                    this._ie8Hint = $('<div class="swan-timline-ie8">')
                        .text('Your browser is too old, please update it to enjoy more!  × ')
                        .on('click', function(event) {
                            $(this).hide();
                        })
                        .appendTo(this.element);
                }
                $('.swan-timeline-timescale-date').css('height', this._canvasHeight);
            }
        },

        // 惯性滑动
        _smoothScroll: function(callback) {
            var self = this;

            if (self.options.smoothScroll === 'off') {
                if ($.isFunction(callback)) {
                    callback();
                }
                return;
            }

            var needInertia = true;
            var symbol = '+';
            var distance = self._getDistance();
            var canvasLeft = self._canvas.position().left;
            if (self._scrollDirection === 'left') {
                if (canvasLeft >= 0) {
                    needInertia = false;
                } else {
                    if (canvasLeft > -distance) distance = -canvasLeft;
                    symbol = '+';
                }
            } else {
                var canvasWidth = self._canvas.outerWidth();
                var containerWidth = self.element.innerWidth();
                var remainder = canvasWidth + canvasLeft - containerWidth - self._widthAdjust;
                if (remainder <= 0) {
                    needInertia = false;
                } else {
                    if (remainder < distance) distance = remainder;
                    symbol = '-';
                }
            }

            self._scrollAcceleration = 0;

            if (needInertia) {
                self._canvas.animate({
                    left: symbol + '=' + distance
                }, self._smoothScrollTime, 'easeOutQuart', callback);
            } else {
                if (typeof (callback) === 'function') {
                    callback();
                }
            }
        },

        // 左右滚动
        _scroll: function(ui) {
            var self = this;
            if (!self._scrolling) {
                self._smoothScroll();
                return;
            }

            var symbol;
            var distance = (self.options.smoothScroll === 'advanced') ? (this._getDistance() / 20) : 20;
            var canvasLeft = self._canvas.position().left;
            if (self._scrollDirection === 'left') {
                if (canvasLeft >= 0) return;
                if (canvasLeft > -distance) distance = -canvasLeft;
                symbol = '+';
            } else {
                var canvasWidth = self._canvas.outerWidth();
                var containerWidth = self.element.innerWidth();
                var remainder = canvasWidth + canvasLeft - containerWidth - self._widthAdjust;
                if (remainder <= 0) return;
                if (remainder < distance) distance = remainder;
                symbol = '-';
            }

            ui = ui || self._canvas;
            ui.animate({
                left: symbol + '=' + distance
            }, 10, 'linear', function() {
                self._scrollAcceleration += 0.0005;
                self._scroll(ui);
            });
        },

        zoom: function(level, noSlide) {
            var self = this;

            level = Math.min(10, Math.max(1, level));
            if (this._zoomLevel === level) return;
            this._zoomLevel = level;
            this._timeScale.empty();
            this._drawTimeScale(false);
            this._guidesLeft.hide();
            this._guidesRight.hide();
            if (this.options.showSlider && !noSlide) {
                this._slider.setZoomLevel(level);
            }
            for (var i = 0; i < this._itemRows.length; i++) {
                var row = this._itemRows[i];
                for (var j = 0; j < row.length; j++) {
                    var rowItem = row[j];
                    var leftAndWidth = this._getLeftAndWidth(rowItem.startTime, rowItem.endTime);
                    rowItem.left = leftAndWidth.left;
                    rowItem.width = leftAndWidth.width;
                    rowItem.right = rowItem.left + rowItem.width;
                    if (this.options.guides !== 'none'
                        && i === this._itemRows.length - 1
                        && j === row.length - 1) {
                        rowItem.element
                            .stop()
                            .animate({
                                'width': rowItem.width + 'px',
                                'left': rowItem.left + 'px'
                            }, 100, 'linear', function() {
                                self._drawGuides();
                            });
                    } else {
                        rowItem.element
                            .stop()
                            .animate({
                                'width': rowItem.width + 'px',
                                'left': rowItem.left + 'px'
                            }, 100, 'linear');
                    }
                }
            }

            this._fixIE8Height();
        },

        // 获取item在item area中的左边界和宽度
        _getLeftAndWidth: function(startTime, endTime) {
            var startYear = startTime.getFullYear();
            var startMonth = startTime.getMonth();
            var startDay = startTime.getDate();
            var endYear = endTime.getFullYear();
            var endMonth = endTime.getMonth();
            var endDay = endTime.getDate();

            var left = 0;
            var width = 0;

            for (var i = 0; i < this._timeScaleItems.length; i++) {
                var timeScaleItem = this._timeScaleItems[i];
                var timeScaleYear = timeScaleItem.date.getFullYear();
                var timeScaleMonth = timeScaleItem.date.getMonth();
                var timeScaleDay = this._getDaysOfMonth(timeScaleItem.date);
                if (timeScaleYear < startYear
                    || (timeScaleYear === startYear && timeScaleMonth < startMonth)) {
                    // 时间轴未到item开始月份，left加本月，继续
                    left += timeScaleItem.monthWidth + this._widthAdjust;
                    continue;
                }
                if (timeScaleYear === startYear && timeScaleMonth === startMonth) {
                    // 时间轴到item开始月份，left加开始天数，left调整完毕
                    left += (startDay - 1) * this._dayWidth;
                }
                if ((endYear === startYear && endMonth === startMonth)) {
                    // item开始月份同结束月份，width加开始到结束天数，width调整完毕
                    width += (endDay - startDay) * this._dayWidth;
                    break;
                }
                if (timeScaleYear === startYear && timeScaleMonth === startMonth) {
                    // 时间轴到item开始月份，width加本月剩余天数加月间隔，继续
                    width += (timeScaleDay - (startDay - 1)) * this._dayWidth + this._widthAdjust;
                    continue;
                }
                if (timeScaleYear < endYear
                    || timeScaleYear === endYear && timeScaleMonth < endMonth) {
                    // 时间轴未到item结束月份，width加本月加月间隔，继续
                    width += timeScaleItem.monthWidth + this._widthAdjust;
                    continue;
                }
                if (timeScaleYear === endYear && timeScaleMonth === endMonth) {
                    // 时间轴到item结束月份，width加结束天数，width调整完毕
                    width += (endDay - 1) * this._dayWidth;
                    break;
                }
            }

            if (startTime < this._startTime) {
                // 开始时间在时间轴之外
                left = -1;
            }

            if (endTime > this._endTime) {
                // 结束时间在时间轴之外
                width += 5 * this._zoomLevel;
            }

            if (startTime >= endTime) {
                // 开始时间等于（或出现异常数据大于）结束时间
                width = 1;
            }

            return { left: left, width: width };
        },

        // 获取平滑滚动距离
        _getDistance: function() {
            if (this.options.smoothScroll === 'off') {
                return 0;
            }
            if (this.options.smoothScroll === 'basic') {
                return 50;
            }
            var factor = 0.2;
            var s = this._scrollAcceleration * this._smoothScrollTime * this._smoothScrollTime * factor;
            if (s <= 0) s = 50;
            return s;
        },

        // 获取垂直位置
        _getVertical: function(rowIndex) {
            return this._timeScaleHeigth + this._rowMargin + (this._rowHeigth + this._rowMargin) * rowIndex;
        },

        // 获取左右margin之和
        _getHorizonMargin: function(element) {
            if (!element || $(element).length === 0) return 0;
            var $element = $(element);
            var left = parseFloat($element.css('margin-left').match(/\d+(\.\d+)?/g)) || 0.0; // fix for ie8
            var right = parseFloat($element.css('margin-right').match(/\d+(\.\d+)?/g)) || 2.0; // fix for ie8
            return left + right;
        },

        // 获取当月天数
        _getDaysOfMonth: function(date) {
            var lastDayOfMonth = new Date(date.getFullYear(), (parseInt(date.getMonth()) + 1), 0);
            return lastDayOfMonth.getDate();
        },

        _findItem: function(element) {
            if (!element || element.length !== 1) return null;
            for (var i = 0; i < this._items.length; i++) {
                var item = this._items[i];
                if (item.element[0] === element[0]) return item;
            }
            return null;
        }
    });
});
