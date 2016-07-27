function Swiper (options) {
  this.version = '1.0.1'
  this._default = {
    container: '.swiper',
    item: '.item',
    direction: 'vertical',
    activeClass: 'active',
    threshold: 50,
    duration: 800,
    auto: false,
    interval: 3000,
    height: 'auto',
    minMovingDistance: 0
  }
  this._options = extend(this._default, options)
  this._options.height = this._options.height.replace('px', '')
  this._start = {}
  this._move = {}
  this._end = {}
  this._next = 1
  this._current = 0
  this._offset = 0
  this._goto = -1
  this._eventHandlers = {}
  this._animating = false;

  this.$box = this._options.container
  this.$container = this._options.container.querySelector('.swiper')
  this.$items = this.$container.querySelectorAll(this._options.item)

  this.count = this.$items.length
  this._prev = this.$items.length - 1
  if (!this.count) {
    return
  }

  this.timer = null

  this.updateItemWidth()
  this._init()
  this._auto()
  this._bind()
  this._onResize()
  return this
}

Swiper.prototype._auto = function () {
  var me = this
  me.stop()
  if (false) { //this._options.auto
    me.timer = setTimeout(function () {
      me.next()
    }, me._options.interval)
  }
}

Swiper.prototype.updateItemWidth = function () {
  this._width = this.$box.offsetWidth;
}

Swiper.prototype.setStyle = function () {
  const me = this
  this._height = this._options.height === 'auto' ? this.$container.offsetWidth * 350 / 720 : this._options.height

  var width = me._width
  var height = me._height

  var w = width
  var h = height * me.count

  if (me._options.direction === 'horizontal') {
    w = width
    h = height
  }

  if (me._options.direction === 'vertical') {
    h = height * me.count
    me.$box.style.height = height + 'px'
  }

  me.$container.style.width = w + 'px'
  if (h > 0) {
    me.$container.style.height = h + 'px'
  }

  Array.prototype.forEach.call(me.$items, function ($item, key) {
    $item.style.width = width + 'px';
    if (height > 0) {
      $item.style.height = height + 'px'
    }

    if(key == me._current) {
      $item.classList.add(me._options.activeClass);
    }
  })
}

Swiper.prototype._onResize = function () {
  const _this = this
  this.resizeHandler = function () {
    setTimeout(function () {
      _this.updateItemWidth()
      _this.setStyle()
      _this.next()
    }, 100)
  }
  window.addEventListener('orientationchange', this.resizeHandler, false)
}

Swiper.prototype.stop = function () {
  this.timer && clearTimeout(this.timer)
}

Swiper.prototype._init = function () {
  const me = this
  me.setStyle()
  me._activate(this._current)
}

Swiper.prototype._bind = function () {
  if(this._animating) {
    return;
  }

  this._animating = true;
  var me = this
  this.touchstartHandler = function (e) {
    //alert('aaa');
    me.stop()
    me._start.x = e.changedTouches[0].pageX
    me._start.y = e.changedTouches[0].pageY

    me.$items[me._prev].style.display = 'block';
    me.$items[me._next].style.display = 'block';
  }

  this.touchmoveHandler = function (e) {
    if(this._animating) {
      return;
    }

    me._move.x = e.changedTouches[0].pageX
    me._move.y = e.changedTouches[0].pageY

    var distance = me._move.y - me._start.y
    //var transform = 'translate3d(0, ' + (distance - me._offset) + 'px, 0)'

    if (me._options.direction === 'horizontal') {
      distance = me._move.x - me._start.x
    }

    if(distance >= me._width || distance <= - me._width) {
      return;
    }

    me.$items[me._current].style['-webkit-transform'] = 'translate3d('+ distance +'px, 0, 0)';
    me.$items[me._prev].style['-webkit-transform'] = 'translate3d('+ (distance - me._width) +'px, 0 , 0)';
    me.$items[me._next].style['-webkit-transform'] = 'translate3d('+ (me._width + distance) +'px, 0 , 0)';

    e.preventDefault()
  }

  this.touchendHandler = function (e) {
    if(this._animating) {
      return;
    }

    me._end.x = e.changedTouches[0].pageX
    me._end.y = e.changedTouches[0].pageY

    var distance = me._end.y - me._start.y
    if (me._options.direction === 'horizontal') {
      distance = me._end.x - me._start.x
    }

    if(distance <= me._options.threshold  && distance > - me._options.threshold) { //less than half
      me.$items[me._current].style.transition = me._options.duration + 'ms';
      me.$items[me._current].style['-webkit-transform'] = 'translate3d(0px, 0 ,0)';

      me.$items[me._prev].style.transition = me._options.duration + 'ms';
      me.$items[me._prev].style['-webkit-transform'] = 'translate3d(-100%, 0, 0)';

      me.$items[me._next].style.transition = me._options.duration + 'ms';
      me.$items[me._next].style['-webkit-transform'] = 'translate3d(100%, 0, 0)';
      return;
    } else if(distance > 0){
      me.$items[me._current].style.transition = me._options.duration + 'ms';
      me.$items[me._current].style['-webkit-transform'] = 'translate3d(100%, 0, 0)';

      me.$items[me._prev].style.transition = me._options.duration + 'ms';
      me.$items[me._prev].style['-webkit-transform'] = 'translate3d(0, 0 ,0)';

      me._current = me._prev

      //me.$items[me._next].style.transition = me.duration + 'ms';
      //me.$items[me._next].style.transform = 'translateX(100%)';
    } else {
      me.$items[me._current].style.transition = me._options.duration + 'ms';
      me.$items[me._current].style['-webkit-transform'] = 'translate3d(-100%, 0, 0)';

      //me.$items[me._prev].style.transition = me.duration + 'ms';
      //me.$items[me._prev].style.transform = 'translateX(-100%)';

      me.$items[me._next].style.transition = me._options.duration + 'ms';
      me.$items[me._next].style['-webkit-transform'] = 'translate3d(0, 0, 0)';
      me._current = me._next;
    }

  }

  this.$container.addEventListener('touchstart', this.touchstartHandler, false)

  this.$container.addEventListener('touchmove', this.touchmoveHandler, false)

  this.$container.addEventListener('touchend', this.touchendHandler, false)

  this.$container.addEventListener('transitionEnd', function (e) {}, false)

  this.$container.addEventListener('webkitTransitionEnd', function (e) {
    me._prev = me._current - 1;
    me._next = me._current + 1;

    if(me._current == 0) {
      me._prev = me.count - 1;
    } else if(me._current == me.count - 1) {
      me._next = 0;
    }

    var cb = me._eventHandlers.swiped || noop
    cb.apply(me, [me._prev, me._current])
    me._activate(me._current);

    Array.prototype.forEach.call(me.$items, function ($item, key) {
      if(key == me._current) {
        $item.classList.add(me._options.activeClass);
      }
      $item.style.transition = 'none';

    })
    this._animating = false;
    e.preventDefault()
  }, false)
}

Swiper.prototype._show = function () {
  var me = this;

  me.$items[me._prev].style.display = 'block';
  me.$items[me._next].style.display = 'block';

  me.$items[me._current].style['-webkit-transform'] = 'translate3d(-100%, 0, 0)';
  me.$items[me._current].style.transition = '800ms';

  me.$items[me._next].style['-webkit-transform'] = 'translate3d(0, 0, 0)';
  me.$items[me._next].style.transition = '800ms';

  //me._prev = me._current
  //me._current = me._next;
  //me._next = me._next ==  me.count ? 0 : me._next + 1
  //me._activate(me._current);

}

Swiper.prototype._activate = function (index) {
  var clazz = this._options.activeClass
  Array.prototype.forEach.call(this.$items, function ($item, key) {
    $item.classList.remove(clazz)
    if (index === key) {
      $item.classList.add(clazz)
    }
  })
}

Swiper.prototype.go = function (index) {
  if (index < 0 || index > this.count - 1 || index === this._current) {
    return
  }

  if (index === 0) {
    this._current = 0
  } else {
    this._current = index
  }

  this._goto = index
  this._show(this._current)

  return this
}

Swiper.prototype.next = function () {
  if (this._current >= this.count - 1) {
    this._current = 0
    this._show(0)
    return this
  }
  this._show(++this._current)
  return this
}

Swiper.prototype.on = function (event, callback) {
  if (this._eventHandlers[event]) {
    console.error('event ' + event + ' is already register')
  }
  if (typeof callback !== 'function') {
    console.error('parameter callback must be a function')
  }

  this._eventHandlers[event] = callback

  return this
}

Swiper.prototype.destroy = function () {
  if (this.timer) {
    clearTimeout(this.timer)
  }
  window.removeEventListener('orientationchange', this.resizeHandler, false)
  this.$container.removeEventListener('touchstart', this.touchstartHandler, false)
  this.$container.removeEventListener('touchmove', this.touchmoveHandler, false)
  this.$container.removeEventListener('touchend', this.touchendHandler, false)
}

function extend (target, source) {
  for (var key in source) {
    target[key] = source[key]
  }

  return target
}

function noop () {

}

export default Swiper
