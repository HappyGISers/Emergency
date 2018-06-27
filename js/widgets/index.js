/**
 * Created by wangbing on 2018/6/7.
 */
var ctx;
var dataCenterCtx;
var mainData = {
    data: {
        artdialog: null,   //左侧弹框
        accidentMarker: null,  //事故点标注
        eventId: "f4wytyu-2iu3-wvfng-y456df-b6fbfd5-ewe2c",
        targetMark: {},        //各个目标图层点位数据
        bufferLayerData: {}, //缓冲区各个目标图层点位数据
        layerList: {},         //各个图层列表的数据
        accidentInfo: {}       //事故信息
    },
    init: function () {
        this.getAccident();
    },
    getAccident: function () {
        var _this = this;
        $.ajax({
            type: "POST",
            url: ctx + "/eventMap/queryIncidentsMarker.vm",
            data: {eventId: _this.data.eventId},
            dataType: 'json',
            success: function (retMsg) {//调用成功的话
                if (retMsg.success) {
                    if (_this.data.accidentMarker) {
                        map.removeOverLay(_this.data.accidentMarker);
                    } else {
                        _this.data.layerList[retMsg.data.type] = {
                            hyperlink: "查看详情|" + dataCenterCtx + "/utilController/customXMLSJGLMenu.vm?XMLNAME=SJGLMENU&OPTION=edit&EVENT_ID=",
                            imageUrl: "images/incidents/accident.png",
                            name: "事故点"
                        }
                    }
                    _this.data.accidentInfo = retMsg.data;
                    _this.data.accidentMarker = addMarker(retMsg.data);
                    map.centerAndZoom(new T.LngLat(parseFloat(retMsg.data.longitude), parseFloat(retMsg.data.latitude)), 15);
                } else {
                }
            }
        });
    }
};
$(function () {

    var SpReportUtils = {
        getRootPath: function () {
            //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
            var curWwwPath = window.document.location.href;
            //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
            var pathName = window.document.location.pathname;
            var pos = curWwwPath.indexOf(pathName);
            //获取主机地址，如： http://localhost:8083
            var localhostPath = curWwwPath.substring(0, pos);
            //获取带"/"的项目名，如：/uimcardprj
            var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
            return (localhostPath + projectName);
        },
        getUrl: function () {
            //$.ajax({
            //    type : "POST",
            //    url : this.getRootPath()+"/eventMap/queryUrl.vm",
            //    dataType:'json',
            //    success : function(retMsg){//调用成功的话
            //        if (retMsg.success){
            //            ctx = retMsg.data.ctx;
            //            dataCenterCtx = retMsg.data.dataCenterCtx;
            //            mainData.init();
            //        }else{}
            //    }
            //});
            ctx = "http://124.200.187.214:9300/emergency-slzy";
            setTimeout(function () {
                mainData.init();
            }, 1000);
        }
    };

    SpReportUtils.getUrl();

});

