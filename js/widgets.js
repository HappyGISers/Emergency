$(function () {
    // $.get("json/config.json", function (json) {
    //console.log(json.widgets)
    var json = {
        "widgets": [
            {
                "icon": "widgets/layer_control/images/icon.png",
                "name": "图层控制",
                "url": "widgets/layer_control/layer_control.html"
            },
            {
                "icon": "widgets/accident/images/icon.png",
                "name": "事故定位",
                "url": "widgets/accident/accident.html"
            },
            {
                "icon": "widgets/special_label/images/icon.png",
                "name": "专题标注",
                "url": "widgets/special_label/special_label.html"
            },
            {
                "icon": "widgets/situation_plotting/images/icon.png",
                "name": "态势标绘",
                "url": "widgets/situation_plotting/situation_plotting.html"
            },
            {
                "icon": "widgets/track_query/images/icon.png",
                "name": "轨迹查询",
                "url": "widgets/track_query/track_query.html"
            },
            {
                "icon": "widgets/path_analysis/images/icon.png",
                "name": "路径分析",
                "url": "widgets/path_analysis/path_analysis.html"
            },
            {
                "icon": "widgets/query/images/icon.png",
                "name": "简单查询",
                "url": "widgets/query/query.html"
            },
            {
                "icon": "widgets/buffer/images/icon.png",
                "name": "缓冲区分析",
                "url": "widgets/buffer/buffer.html"
            },
            {
                "icon": "widgets/bookmark/images/icon.png",
                "name": "地理书签",
                "url": "widgets/bookmark/bookmark.html"
            },
            {
                "icon": "widgets/scene_save/images/icon.png",
                "name": "场景保存",
                "url": "widgets/scene_save/scene_save.html"
            },
            {
                "icon": "widgets/print/images/icon.png",
                "name": "打印",
                "url": "widgets/print/print.html"
            }
        ]
    };

    //添加各种工具的按钮
    $('body').append('<ul class="widgets" id="widgets"></ul>');
    for (var i = 0; i < json.widgets.length; i++) {
        var li = '<li class="widgets' + i + '" title="' + json.widgets[i].name + '"><span><img src="' + json.widgets[i].icon + '"/></span></li>';
        $('#widgets').append(li);
    }

    //各种工具的点击事件
    $('#widgets li').click(function () {
        var index = $(this).index();
        var thisclass = $(this).attr('class');
        var newclass = $('.' + thisclass + '-main');
        if (newclass.length > 0 && newclass.is(":hidden")) {
            //显示当前选择
            $('.widgets-select .widgets-close').click();
            //$('.widgets-main').removeClass('widgets-select').hide();
            newclass.addClass('widgets-select').show();
            $(this).find('span').addClass('select').parent('li').siblings('li').find('span').removeClass('select');
        } else if (newclass.length > 0 && newclass.is(":visible")) {
            //隐藏所有
            $('.widgets-select .widgets-close').click();
            //$('#widgets li span').removeClass('select');
            //newclass.removeClass('widgets-select').hide();
        } else {
            $('.widgets-select .widgets-close').click();
            $(this).find('span').addClass('select').parent('li').siblings('li').find('span').removeClass('select');
            //$('.widgets-main').removeClass('widgets-select').hide();
            //向页面新加弹框内容
            var divhtml = '<div class="widgets-main ' + thisclass + '-main widgets-select"><div class="widgets-main-title"><p><img src="' + json.widgets[index].icon + '"/>' + json.widgets[index].name + '</p><div class="widgets-close"></div></div><div class="widgets-content"><iframe frameborder="0" src="' + json.widgets[index].url + '"></iframe><div class="widgets-layer"></div></div></div>';
            $('body').append(divhtml);
            //拖拽
            $('.' + thisclass + '-main').myDrag({
                direction: 'all',
                randomPosition: false,
                handler: '.widgets-main-title p',
                dragStart: function (x, y) {
                    $('.widgets-layer').show();
                },
                dragEnd: function (x, y) {
                    $('.widgets-layer').hide();
                }
            });

        }
        //弹框中的关闭事件
        $('.widgets-close').click(function () {
            $('#widgets li span').removeClass('select');
            $('.widgets-main').removeClass('widgets-select').hide();
        })
    })
    // })
});
(function ($, window, document, undefined) {
    //定义的构造函数
    var Drag = function (ele, opt) {
        this.$ele = ele,
            this.x = 0,
            this.y = 0,
            this.defaults = {
                parent: 'parent',
                randomPosition: true,
                direction: 'all',
                x: 0,
                y: 0,
                handler: false,
                dragStart: function (x, y) {
                },
                dragEnd: function (x, y) {
                },
                dragMove: function (x, y) {
                }
            },
            this.options = $.extend({}, this.defaults, opt)
    };
    //定义方法
    Drag.prototype = {
        run: function () {
            var $this = this;
            var element = this.$ele;
            var randomPosition = this.options.randomPosition; //位置
            var direction = this.options.direction; //方向
            var handler = this.options.handler;
            var parent = this.options.parent;
            var isDown = false; //记录鼠标是否按下
            var fun = this.options; //使用外部函数
            var X = 0,
                Y = 0,
                moveX,
                moveY;
            // 阻止冒泡
            element.find('*').not('img').mousedown(function (e) {
                e.stopPropagation();
            });
            //初始化判断
            if (parent == 'parent') {
                parent = element.parent();
            } else {
                parent = element.parents(parent);
            }
            if (!handler) {
                handler = element;
            } else {
                handler = element.find(handler);
            }
            //初始化
            parent.css({position: 'relative'});
            element.css({position: 'absolute'});
            var boxWidth = 0, boxHeight = 0, sonWidth = 0, sonHeight = 0;
            //盒子 和 元素大小初始化
            initSize();
            if (randomPosition) {
                randomPlace();
            }
            $(window).resize(function () {
                initSize();
                if (randomPosition) {
                    randomPlace();
                }
            });

            //盒子 和 元素大小初始化函数
            function initSize() {
                boxWidth = parent.outerWidth();
                boxHeight = parent.outerHeight();
                sonWidth = element.outerWidth();
                sonHeight = element.outerHeight();
            }

            //位置随机函数
            function randomPlace() {
                if (randomPosition) {
                    var randX = parseInt(Math.random() * (boxWidth - sonWidth));
                    var randY = parseInt(Math.random() * (boxHeight - sonHeight));
                    if (direction.toLowerCase() == 'x') {
                        element.css({left: randX});
                    } else if (direction.toLowerCase() == 'y') {
                        element.css({top: randY});
                    } else {
                        element.css({left: randX, top: randY});
                    }
                }
            }

            handler.css({cursor: 'move'}).mousedown(function (e) {
                isDown = true;
                X = e.pageX;
                Y = e.pageY;
                $this.x = element.position().left;
                $this.y = element.position().top;
                element.addClass('on');
                fun.dragStart(parseInt(element.css('left')), parseInt(element.css('top')));
                return false;
            });
            $(document).mouseup(function (e) {
                fun.dragEnd(parseInt(element.css('left')), parseInt(element.css('top')));
                element.removeClass('on');
                isDown = false;
            });
            $(document).mousemove(function (e) {
                moveX = $this.x + e.pageX - X;
                moveY = $this.y + e.pageY - Y;

                function thisXMove() { //x轴移动
                    if (isDown == true) {
                        element.css({left: moveX});
                    } else {
                        return;
                    }
                    if (moveX < 0) {
                        element.css({left: 0});
                    }
                    if (moveX > (boxWidth - sonWidth)) {
                        element.css({left: boxWidth - sonWidth});
                    }
                    return moveX;
                }

                function thisYMove() { //y轴移动
                    if (isDown == true) {
                        element.css({top: moveY});
                    } else {
                        return;
                    }
                    if (moveY < 0) {
                        element.css({top: 0});
                    }
                    if (moveY > (boxHeight - sonHeight)) {
                        element.css({top: boxHeight - sonHeight});
                    }
                    return moveY;
                }

                function thisAllMove() { //全部移动
                    if (isDown == true) {
                        element.css({left: moveX, top: moveY});
                    } else {
                        return;
                    }
                    if (moveX < 0) {
                        element.css({left: 0});
                    }
                    if (moveX > (boxWidth - sonWidth)) {
                        element.css({left: boxWidth - sonWidth});
                    }
                    if (moveY < 0) {
                        element.css({top: 0});
                    }
                    if (moveY > (boxHeight - sonHeight)) {
                        element.css({top: boxHeight - sonHeight});
                    }
                }

                if (isDown) {
                    fun.dragMove(parseInt(element.css('left')), parseInt(element.css('top')));
                } else {
                    return false;
                }
                if (direction.toLowerCase() == "x") {
                    thisXMove();
                } else if (direction.toLowerCase() == "y") {
                    thisYMove();
                } else {
                    thisAllMove();
                }
            });
        }
    };

    //插件
    $.fn.myDrag = function (options) {
        //创建实体
        var drag = new Drag(this, options);
        //调用方法
        drag.run();
        return this;
    }
})(jQuery, window, document);