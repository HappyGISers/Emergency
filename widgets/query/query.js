/**
 * Created by wangbing on 2018/6/20.
 */

var vm = new Vue({
    el: '#app',
    data: {
        multiList:{},   //下拉列表数据
        multiCheckbox:[],   //多选框选择的数据
        keyword:"",       //关键字
        searchMark:{},     //查询到的点位信息存储
        searchList:{},     //列表显示的数据
        typeList:[],        //查询到的类型
        notMarkType:"chemicals,referenceCase,emergencyDetection",   //没有点位信息的类型
        listFilter:"all",             //当前选择的类型
        viewport:{}                  //所有点位坐标集合
    },
    methods: {
        //获取图层对象列表数据
        getMultiList:function(){
            var _this = this;
            $.ajax({
                type : "POST",
                url : parent.ctx+"/eventMap/queryTabulation.vm",
                data:{flag:"query"},
                dataType:'json',
                success : function(retMsg){//调用成功的话
                    if (retMsg.success){
                        var multiList ={};
                        $.each(retMsg.data,function(i, item){
                            item.formIcon = item.formIcon||"../../images/monitor/defMark.png";
                            multiList[item.type] = item;
                        });
                        _this.multiList = multiList;
                    }else{
                    }
                }
            });
        },
        //查询
        search:function(){
            if(!this.keyword){
                alert("关键字不能为空！");
                return false;
            }
            var _this = this;
            $.ajax({
                type : "POST",
                url : parent.ctx+"/eventMap/queryMarker.vm",
                data:{flag:"query",type:this.multiCheckbox.join(),keyword:this.keyword},
                dataType:'json',
                success : function(retMsg){//调用成功的话
                    if (retMsg.success){
                        _this.empty();
                        _this.setMarkAndList(retMsg.data);
                    }else{
                    }
                }
            })
        },
        //清除列表记录
        empty:function(){
            this.listFilter="all";
            this.typeList = [];
            this.searchList = {};
            this.emptyMark();
            this.searchMark = {};
        },
        //清除点位信息
        emptyMark:function(){
            $.each(this.searchMark,function(key, item1) {
                $.each(item1,function(j, item) {
                    try {
                        parent.map.removeOverLay(item);
                    } catch (e) {}//地图中没有该点位
                });
            });
        },
        //查看对应点位信息
        showMarkInfo:function(data){
            parent.showInfoWindow(data);
        },
        //设置查询到的类型列表
        setTypeList:function(length){
            var _this = this;
            $.each(this.searchList,function(key, item){
                var type = new TypeObj(item[0].typeName,key,item.length);
                _this.typeList.push(type);
            });
            this.typeList.unshift(new TypeObj("全部","all",length));

        },
        //组建点位信息与列表信息
        setMarkAndList:function(data){
            var _this = this;
            var layerList = this.multiList;
            $.each(data,function(i, item){
                var layer = layerList[item.type];
                //组建列表对应信息
                item.img = layer.formIcon;
                item.hyperlink = layer.hyperlink.split("|")[1]+item.dataId;
                item.typeName = layer.name;

                //组建列表显示的对象数组
                if(!_this.searchList[item.type]){
                    _this.searchList[item.type] = [];
                }
                _this.searchList[item.type].push(item);
                /*
                 1、是否有点位信息
                 2、地图标注并组建对应信息
                 */
                if(_this.notMarkType.indexOf(item.type)==-1){
                    if(!_this.searchMark[item.type]){
                        _this.searchMark[item.type] = [];
                        _this.viewport[item.type] = [];
                    }
                    //所有经纬度集合
                    var lonLat = [parseFloat(item.longitude),parseFloat(item.latitude)];
                    _this.viewport[item.type].push(lonLat);

                    //所有点位信息
                    var marker = parent.addMarker(item);
                    _this.searchMark[item.type].push(marker);
                }
            });
            this.setTypeList(data.length);
            this.setViewport(this.listFilter);
        },
        //选择当前类型
        selectType:function(type){
            this.listFilter=type;
            this.emptyMark();
            $.each(this.searchMark,function(key, item1) {
                if(type=="all"||type==key){
                    $.each(item1,function(j, item) {
                        parent.map.addOverLay(item);
                    });
                }
            });
            this.setViewport(this.listFilter);
        },
        //设置地图视图大小
        setViewport:function(type){
            var viewportList = [];
            if(type=="all"){
                $.each(this.viewport,function(key, item) {
                    viewportList = viewportList.concat(item);
                });
            }else{
                viewportList = this.viewport[type];
            }
            if(viewportList&&viewportList.length>0){
                parent.map.setViewport(viewportList);
            }
        }
    },
    created: function () {
        this.getMultiList();
    },
    watch:{
        multiCheckbox:function(val) {
            var typeText = "";
            var typeVal = val.join();
            $.each(this.multiList, function (i, item) {
                if (-1 != typeVal.indexOf(item.type)) {
                    typeText += item.name + ";";
                }
            });
            $("#multi").val(typeText);
        }
    }
});


function TypeObj(name,value,length){
    this.name=name;
    this.value=value;
    this.length=length;
}