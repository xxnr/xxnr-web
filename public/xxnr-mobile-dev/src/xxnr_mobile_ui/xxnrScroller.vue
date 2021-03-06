<template>
  <div :style="styles">
    <div class="xs-container" @touchmove="scrolling()">
      <slot></slot>
      <slot name="pulldown"></slot>
      <slot name="pullup"></slot>
    </div>
  </div>
</template>

<script>
  import XScroll from 'vux-xscroll/build/cmd/xscroll.js'
  import Pulldown from 'vux-xscroll/build/cmd/plugins/pulldown'
  import Pullup from 'vux-xscroll/build/cmd/plugins/pullup'

  const pulldownDefaultConfig = () => ({
    content: '下拉刷新...',
    height: 60,
    autoRefresh: false,
    downContent: '下拉刷新....',
    upContent: '<div class="xs-plugin-loader"><img src="../../static/assets/images/loader.png"></div>松开刷新',
    loadingContent: '<div class="xs-plugin-loader"><img src="../../static/assets/images/loader.png"></div>正在刷新',
    clsPrefix: 'xs-plugin-pulldown-'
  })

  const pullupDefaultConfig = () => ({
    content: '',//上拉刷新.
    pullUpHeight: 60,
    height: 40,
    autoRefresh: false,
    downContent: '',//<div class="xs-plugin-loader"><img src="../../static/assets/images/loader.png"></div>松开刷新
    upContent: '', //上拉刷新...
    loadingContent: '',//<div class="xs-plugin-loader"><img src="../../static/assets/images/loader.png"></div>正在刷新
    clsPrefix: 'xs-plugin-pullup-'
  })

  export default {
    props: {
      height: {
        type: String
      },
      lockX: Boolean,
      lockY: Boolean,
      scrollbarX: Boolean,
      scrollbarY: Boolean,
      bounce: {
        type: Boolean,
        default: true
      },
      useOriginScroll: {
        type: Boolean,
        default: false
      },
      useTransition: {
        type: Boolean,
        default: true
      },
      preventDefault: {
        type: Boolean,
        default: true
      },
      boundryCheck: {
        type: Boolean,
        default: true
      },
      gpuAcceleration: {
        type: Boolean,
        default: true
      },
      usePulldown: {
        type: Boolean,
        default: false
      },
      usePullup: {
        type: Boolean,
        default: false
      },
      /**
       * refer to: http://xscroll.github.io/node_modules/xscroll/doc/PullDown.html
       */
      pulldownConfig: {
        type: Object,
        default () {
          return {}
        }
      },
      pullupConfig: {
        type: Object,
        default () {
          return {}
        }
      },
      pulldownStatus: {
        type: String,
        default: 'default',
        twoWay: true
      },
      pullupStatus: {
        type: String,
        default: 'default',
        twoWay: true
      },
      enableHorizontalSwiping: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      reset: function() {
        this._xscroll && this._xscroll.render()
      },
      scrolling: function() {
        this.$dispatch('canBackToTop', this._xscroll.getScrollTop());
      }
    },
    compiled () {
      this.uuid = Math.random().toString(36).substring(3, 8)
    },
    computed: {
      styles () {
        if (!this.height && !this.$el.style.height && this.lockX) {
          this.height = `${document.documentElement.clientHeight-40}px`
          this.reset()
        }
        return {
          height: `${this.height}`
        }
      }
    },
    ready () {
      this.$el.setAttribute('id', `vux-scroller-${this.uuid}`)
      let content = null
      const slotChildren = this.$el.querySelector('.xs-container').childNodes
      for (let i = 0; i < slotChildren.length; i++) {
        if (slotChildren[i].nodeType === 1) {
          content = slotChildren[i]
          break
        }
      }
      if (!content) {
        throw new Error('no content is found')
      }

      this._xscroll = new XScroll({
        renderTo: `#vux-scroller-${this.uuid}`,
        lockX: this.lockX,
        lockY: this.lockY,
        scrollbarX: this.scrollbarX,
        scrollbarY: this.scrollbarY,
        content: content,
        bounce: this.bounce,
        useOriginScroll: this.useOriginScroll,
        useTransition: this.useTransition,
        preventDefault: this.preventDefault,
        boundryCheck: this.boundryCheck,
        gpuAcceleration: this.gpuAcceleration
      })

      if (this.usePulldown) {
        // if use slot=pulldown
        let container = this.$el.querySelector('div[slot="pulldown"]')
        let config = Object.assign(pulldownDefaultConfig(), this.pulldownConfig)
        if (container) {
          config.container = container
        }
        this.pulldown = new Pulldown(config)
        this._xscroll.plug(this.pulldown)
        this.pulldown.on('loading', (e) => {
          this.$dispatch('pulldown:loading', this.uuid)
      })
        this.pulldown.on('statuschange', (val) => {
          this.pulldownStatus = val.newVal
      })
      }

      if (this.usePullup) {
        // if use slot=pullup
        let container = this.$el.querySelector('div[slot="pullup"]')
        let config = Object.assign(pullupDefaultConfig(), this.pullupConfig)

        if (container) {
          config.container = container
        }
        this.pullup = new Pullup(config)
        this._xscroll.plug(this.pullup)
        this.pullup.on('loading', (e) => {
          this.$dispatch('pullup:loading', this.uuid)
      })
        this.pullup.on('statuschange', (val) => {
          this.pullupStatus = val.newVal
      })
      }

      if (this.enableHorizontalSwiping) {
        this._xscroll.on('panstart', (e) => {
          if (e.direction === 2 || e.direction === 4) {
          e.preventDefault()
          if (this.scrollbarY) {
            this._xscroll.userConfig.scrollbarY = false
          }
          this._xscroll.userConfig.lockY = true
        }
      })
        this._xscroll.on('panend', () => {
          if (this.scrollbarY) {
          this._xscroll.userConfig.scrollbarY = true
        }
        this._xscroll.userConfig.lockY = false
      })
      }

      this._xscroll.render()
    },
    events: {
      'pulldown:reset': function (uuid) {
        // set pulldown status to default
        this.pulldownStatus = 'default'
        if (uuid === this.uuid) {
          this.pulldown.reset(() => {
            // repaint
            this.reset()
        })
        }
      },
      'pullup:reset': function (uuid) {
        // set pulldown status to default
        this.pullupStatus = 'default'
        if (uuid === this.uuid) {
          this.pullup.complete()
          this.reset()
        }
      },
      'pullup:done': function (uuid) {
        if (uuid === this.uuid) {
          this._xscroll.unplug(this.pullup);
        }
      },
      'scroller:reset': function (uuid) {
        if (uuid === this.uuid) {
          this.reset()
        }
      },
      'resetHeightScrollTop': function (scrollTop) {
        this.$nextTick(() => {
          this.pullup.complete();
          this.reset();
          if(scrollTop){
            this._xscroll.scrollTop(0,100);
          }
        })
      },
      'backToTop': function() {
        this._xscroll.scrollTop(0,100);
      },
      'scrollTo': function(top) {
        this._xscroll.scrollTop(top,100);
      }
    },
    beforeDestroy () {
      if (this.pullup) {
        this._xscroll.unplug(this.pullup)
        this.pullup.pluginDestructor()
      }
      if (this.pulldown) {
        this._xscroll.unplug(this.pulldown)
        this.pulldown.pluginDestructor()
      }
      this._xscroll.destroy()
      this._xscroll = null
    }
  }
</script>

<style>
  .xs-plugin-pullup-container {
    text-align: center;
  }

  .xs-plugin-loader {
    width: 22px;
    height: 22px;
    margin: 0 auto;
    animation: loader 1s linear infinite;
  }

  .xs-plugin-loader img {
    width: 100%;
  }

  @-webkit-keyframes loader {
    from{
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
