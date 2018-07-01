//控制中心
var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}

var Footer = {
    //初始化
    init: function () {
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$box = this.$footer.find('.box')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.isToEnd = false
        this.isToStart = true
        this.isAnimate = false
        this.bind()
        this.render()
    },

    //绑定事件
    bind: function () {
        var _this = this

        //向左滚动
        this.$rightBtn.on('click', function () {
            if(_this.isAnimate) teturn
            var itemWidth = _this.$box.find('li').outerWidth(true)
            var rowCount = Math.floor(_this.$box.width() / itemWidth)
            if (!_this.isToEnd) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '-=' + rowCount * itemWidth
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToStart = false
                    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
                        _this.isToEnd = true
                    }
                })
            }

        })

            //向右滚动
        this.$leftBtn.on('click', function(){
            if(_this.isAnimate) teturn
            var itemWidth = _this.$box.find('li').outerWidth(true)
            var rowCount = Math.floor(_this.$box.width() / itemWidth)
            if(!_this.isToStart) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '+=' + rowCount * itemWidth
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToEnd = false
                    if (parseFloat(_this.$ul.css('left')) >= 0) {
                        _this.isToStart = true
                    }
                })
            }
        })
        this.$footer.on('click', 'li', function(){
            //点击 footer > li 播放按钮切换状态
            $('.btn-play').removeClass('icon-play').addClass('icon-pause')
            $(this).addClass('active')
            .siblings().removeClass('active')

            EventCenter.fire('select-albumn', {
                channelId: $(this).attr('data-channel-id'),
                channelName:  $(this).attr('data-channel-name')
            })
        })
    },


            //获取数据、渲染HTML
    render() {
        var _this = this
        $.getJSON('https://jirenguapi.applinzi.com/fm/getChannels.php')
            .done(function (ret) {
                console.log(ret)
                _this.renderFooter(ret.channels)
            }).fail(function () {
                console.log('error')
            })
    },

    renderFooter: function (channels) {
        console.log(channels)
        var html = ''
        channels.forEach(function (channel) {
            html += '<li data-channel-id=' + channel.channel_id + ' data-channel-name=' + channel.name + '>'
                + '  <div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>'
                + '  <h3>' + channel.name + '</h3>'
                + '</li>'
        })
        this.$ul.html(html)
        this.setStyle()
    },
    setStyle: function () {
        var count = this.$footer.find('li').length
        var width = this.$footer.find('li').outerWidth(true)
        this.$ul.css({
            width: count * width + 'px'
        })
    }
}

//播放区
var Fm = {
    //初始化
    init: function(){
        this.$container = $('#page-music')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.bind()
    },
    //绑定
    bind: function(){
        var _this = this
        EventCenter.on('select-albumn', function(e, channelObj){
            _this.channelId = channelObj.channelId
            _this.channelName = channelObj.channelName
            _this.loadMusic(function(){
                _this.setMusic()
            })
        })

        //点击播放/暂停
        this.$container.find('.btn-play').on('click', function(){
            var $btn = $(this)
            if($btn.hasClass('icon-play')){
                $btn.removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            } else {
                $btn.removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()
            }
        })

        //下一首
        this.$container.find('.btn-next').on('click', function(){
            $('.btn-play').removeClass('icon-play').addClass('icon-pause')
            _this.loadMusic(function(){
                _this.setMusic()
            })
        })

        this.audio.addEventListener('play', function(){
            clearInterval(_this.statusClock)
            _this.statusClock = setInterval(function(){
                _this.updateStatus()
            },1000)
        })
        this.audio.addEventListener('pause', function(){
            clearInterval(_this.statusClock)
            console.log('pause')
        })
    },
    //获取数据
    loadMusic(callback){
        var _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php', {channel:this.channelId})
        .done(function(ret){
            _this.song = ret['song'][0]
          callback()
        })
    },
    //渲染页面
    setMusic(){
        this.audio.src = this.song.url
        $('.bg').css('background-image', 'url('+this.song.picture+')')
        this.$container.find('.aside figure').css('background-image', 'url('+this.song.picture+')')
        this.$container.find('.detail h1').text(this.song.title)
        this.$container.find('.detail .author').text(this.song.artist)
        this.$container.find('.tag' ).text(this.channelName)
    },
    //时间&进度条
    updateStatus(){
        var min = Math.floor(this.audio.currentTime/60)
        var second = Math.floor(Fm.audio.currentTime%60)+''
        second = second.length === 2?second:'0'+second
        this.$container.find('.current-time').text(min+':'+second)
        this.$container.find('.bar-progress').css('width', 
    this.audio.currentTime/this.audio.duration*100+'%')
        console.log('update...')
    }
}

Footer.init()
Fm.init()