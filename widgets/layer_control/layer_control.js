/**
 * Created by wangbing on 2018/6/29.
 */
$(function () {
    //查询图层的列表
    //$.ajax({
    //    type : "POST",
    //    url : parent.ctx+"/eventMap/queryTabulation.vm",
    //    data:{flag:"point"},
    //    dataType:'json',
    //    success : function(retMsg){//调用成功的话
    //        if (retMsg.success){
    //            initCheckbox(retMsg.data);
    //        }else{
    //        }
    //    }
    //});


    //组合列表dom
    var initCheckbox = function(data){
        var tableContent = "";
        function opacity(i){
            var opacity = '';
            opacity += '<div class="layer-alert-opacity">';
            opacity += '<div class="left"> <p>不透明</p> <div class="opacity-btn" id="opacity-minus'+i+'"></div> </div>';
            opacity += '<div class="right"> <p>透明</p> <div class="opacity-btn" id="opacity-add'+i+'"></div> </div>';
            opacity += '<div class="center"> <span>0%</span> <span>50%</span> <span>100%</span> </div>';
            opacity += '<div class="scale_panel"> <div class="scale" id="bar'+i+'"> <div class="silderbg"></div> <span id="silder'+i+'"></span> </div> </div>';
            opacity += '</div>';
            return opacity;
        }
        $.each(data,function(key, item){
            item.formIcon = item.formIcon||"../../images/monitor/defMark.png";
            tableContent += '<div class="list-layer" >';
            tableContent += '<div class="checkbox" id="'+item.type+'"><img src="'+item.formIcon+'">'+item.name+'</div>';
            tableContent += '<div class="layer-alert"><div class="btn"></div>';
            tableContent += '<div class="layer-alert-menu"> <div class="menu-item">透明度</div> </div>';
            tableContent += opacity(key);
            tableContent += '</div></div>';
        });
        $("#layersId").html(tableContent);
        addCheckClick();
    }

    //注册事件
    var addCheckClick = function(){
        //check点击事件和所对应的透明度事件注册
        $(".list-layer .checkbox").click(function () {
            var bool = $(this).hasClass('checked');
            if (bool) {
                $(this).removeClass('checked');
            } else {
                $(this).addClass('checked');
            }
            singleCheckClick(!bool,this.id);
        }).each(function(i){
            var id =this.id;
            new scale('silder'+id, 'bar'+id, 'opacity-add'+id, 'opacity-minus'+id,this.id);
        });

        //菜单点击事件
        $(".menu-item").click(function (e) {
            e.stopPropagation();
            $('.layer-alert-opacity').hide();
            if(this.id=="open"){
                $('.list-layer .checkbox').addClass('checked').each(function(){
                    singleCheckClick(true,this.id);
                });
            }else if(this.id=="close"){
                $('.list-layer .checkbox').removeClass('checked').each(function(){
                    singleCheckClick(false,this.id);
                });
            }else if($(this).html() == '透明度'){
                $(this).parents('.layer-alert').find('.layer-alert-opacity').show();
            }else{
                $('.layer-alert').removeClass('active');
            }
        });
        //弹框
        $('.layer-alert .btn').click(function (e) {
            e.stopPropagation();
            $('.list-layer').css({
                'z-index': '1'
            });
            $(this).parents('.list-layer').css({
                'z-index': '2'
            });
            $('.layer-alert-opacity').hide();
            if ($(this).parents('.layer-alert').hasClass('active')) {
                $(this).parents('.layer-alert').removeClass('active');
            } else {
                $('.layer-alert').removeClass('active');
                $(this).parents('.layer-alert').addClass('active');
            }
        });


        $('.layer-alert-opacity').click(function (e) {
            e.stopPropagation();
        });
        $('body').click(function (e) {
            e.stopPropagation();
            if ($('.layer-alert').hasClass('active')) {
                $('.layer-alert').removeClass('active');
                $('.layer-alert-opacity').hide();
            }
        })
    }

    //点击check后所执行的方法
    var singleCheckClick = function(bool,val){
        var targetMark = parent.mainData.data.targetMark[val];
        if(bool){
            if(targetMark){
                $.each(targetMark,function(i, item){
                    try{
                        parent.map.addOverLay(item);
                    }catch(e){}
                })
            }else{
                queryMarker(val);
            }
        }else{
            $.each(targetMark,function(i, item){
                try{
                    parent.map.removeOverLay(item);
                }catch(e){}
            })
        }
    }

    //查询所对应的列表所有图层
    var queryMarker = function(val){
        var targetMark = parent.mainData.data.targetMark;
        $.each(parent.mainData.data.targetList[val], function (i, item) {
            if (!targetMark[item.type]) {
                targetMark[item.type] = [];
            }
            var marker = parent.addMarker(item);
            targetMark[item.type].push(marker);
        })
    }

    initCheckbox(parent.mainData.data.layerList);
});