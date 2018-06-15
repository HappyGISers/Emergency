/**
 * Created by wangbing on 2018/6/8.
 */
$(function () {
    $.ajax({
        type : "POST",
        url : parent.ctx+"/eventMap/queryTabulation.vm",
        data:{flag:"point"},
        dataType:'json',
        success : function(retMsg){//调用成功的话
            if (retMsg.success){
                initCheckbox(retMsg.data);
            }else{
            }
        }
    });

    var initCheckbox = function(data){
        var tableContent = "";
        $.each(data,function(i, item){
            item.formIcon = item.formIcon||"../../images/monitor/defMark.png";
            item.imageUrl= item.imageUrl||"../../images/monitor/defMark.png";
            parent.mainData.data.layerList[item.type] = item;
            tableContent += '<div class="list-layer" >';
            tableContent += '<div class="checkbox" id="'+item.type+'"><img src="'+item.formIcon+'">'+item.name+'</div>';
            tableContent += '<div class="layer-alert"><div class="btn"></div><div class="layer-alert-menu"></div></div>';
            tableContent += '</div>';
        });
        $("#layersId").html(tableContent);
        addCheckClick();
    }

    var addCheckClick = function(){
        $(".checkbox").click(function () {
            var bool = $(this).hasClass('checked');
            if (bool) {
                $(this).removeClass('checked');
            } else {
                $(this).addClass('checked');
            }
            var val = this.id;
            singleCheckClick(!bool,val);
        });
        $(".menu-item").click(function () {
            var bool;
            if(this.id=="open"){
                $('.checkbox').addClass('checked');
                bool = true;
            }else if(this.id=="close"){
                $('.checkbox').removeClass('checked');
                bool = false;
            }
            $(".checkbox").each(function(){
                singleCheckClick(bool,this.id);
            })
        });
    }

    var singleCheckClick = function(bool,val){
        var targetMark = parent.mainData.data.targetMark[val];
        if(bool){
            if(targetMark){
                $.each(targetMark,function(i, item){
                    parent.map.addOverLay(item);
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

    var queryMarker = function(val){
        $.ajax({
            type : "POST",
            url : parent.ctx+"/eventMap/queryMarker.vm",
            data:{flag:"point",type:val},
            dataType:'json',
            success : function(retMsg){//调用成功的话
                var targentMark = parent.mainData.data.targetMark;
                if (retMsg.success){
                    $.each(retMsg.data,function(i, item){
                        if(!targentMark[item.type]){
                            targentMark[item.type] = [];
                        }
                        targentMark[item.type].push(parent.addMarker(item));
                    })
                }else{
                }
            }
        })
    }
});