var map; //地图实例
var markerTool; //加点工具
var polylineTool;
var polygonTool;
var rectangleTool;
var milstdSource = {};//存放态势标绘的source，场景保存时使用
var milstdDrawLayer ={};
window.onload = function () {
    var satelliteLayerUrl = "http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}";//影像图地址
    var mapCenter = new T.LngLat(109.69, 34.968);//地图中心点坐标
    var zoom = 4;//级别
    map = new T.Map('map', {
        minZoom: 3,//地图允许展示的最小级别
        maxZoom: 18,//地图允许展示的最大级别
        // zoom: zoom,//地图的初始化级别
        // center: mapCenter //地图的初始化中心点
        // projection: "EPSG:900913"
    });
    var gaode = new T.TileLayer("", {
        title: "高德矢量图",
        source: new T.OnlineMap({mapType: "aMap-vec"})
    });
    map.addLayer(gaode); // 添加高德地图
    // var satelliteLayer = new T.TileLayer(satelliteLayerUrl);
    // map.addLayer(satelliteLayer);
    // map.centerAndZoom(mapCenter, zoom); // 定位到中心点和指定级别
    var zoomCtrl = new T.Control.Zoom();
    zoomCtrl.setPosition("bottomright");
    //添加缩放平移控件
    map.addControl(zoomCtrl);
    markerTool = new T.MarkTool(map); // 初始化加点工具
    polylineTool = new T.PolylineTool(map);// 初始化画线工具
    polygonTool = new T.PolygonTool(map);// 初始化画面工具
    rectangleTool = new T.RectangleTool(map);// 初始化矩形工具

    //初始化态势标绘的图层
    milstdSource = new ol.source.Vector({ wrapX: false });//存放态势标绘的source，场景保存时使用
    milstdDrawLayer = new ol.layer.Vector({
        source: milstdSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: "#99CCFF64"
            }),
            stroke: new ol.style.Stroke({
                color: "#99CCFF",
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: "#99CCFF64",
                })
            })
        })
    });

    map.addLayer(milstdDrawLayer);
};

/**
 * 向地图中添加点位
 * @param data
 * @returns {*}
 */
function addMarker(data) {
    var layer = getLayerData(data.type);
    //向地图上添加自定义标注
    var marker = new T.Marker(new T.LngLat(data.longitude, data.latitude), {
        icon: new T.Icon({
            iconUrl: layer.imageUrl || "images/monitor/defMark.png",
            scale: 0.3,
            iconAnchor: new T.Point(0.5, 1)
        })
    });
    marker.addEventListener("click", function () {
        marker.openInfoWindow(createInfoWindow(data, layer), {closeOnClick: true});
    });
    // 将标注添加到地图中
    map.addOverLay(marker);

    return marker;
}

function createInfoWindow(data, layer) {
    var sContent = "<div style='margin:10px 0 10px 0;color:#0074d9;font-size: 16px'>" +
        layer.name + "</div>";
    if (data.name) {
        sContent += "<div>名称：" + data.name + " </div>";
    }
    for (var key in data) if (key.indexOf("_showData") > -1) {
        var value = data[key].split("==");
        sContent += "<div>" + value[0] + ":" + value[1] + "</div>";
    }
    if (layer.hyperlink) {
        var hyperlink = layer.hyperlink.split("|");
        for (var i = 0; i < hyperlink.length; i += 2) {
            sContent += "<div style='margin-top: 5px;text-align: right'>";
            sContent += "<a style='display: inline;margin-left: 5px' href='" + hyperlink[i + 1] + data.dataId + "' target='_blank'>" + hyperlink[i] + "</a>";
            sContent += "</div>";
        }
    }
    return new T.InfoWindow(sContent, {offset: new T.Point(0, 56)}); //加上图片的像素高度偏移
}


function showInfoWindow(data) {
    var point = new T.LngLat(data.longitude, data.latitude);
    map.centerAndZoom(point, 12);
    var layer = getLayerData(data.type);
    setTimeout(function () {
        map.openInfoWindow(createInfoWindow(data, layer), point);
    }, 500);
}


function getLayerData(type){
    if (type == "accident") {
        return mainData.data.accidentLayer;
    } else {
        return mainData.data.layerList[type];
    }
}