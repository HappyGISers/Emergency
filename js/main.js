var map; //地图实例
var markerTool; //加点工具
var currentSceneData = {};
window.onload = function () {
    var satelliteLayerUrl = "http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}";//影像图地址
    var mapCenter = new T.LngLat(118.13214548600001, 24.424820321000027);//地图中心点坐标
    var zoom = 14;//级别
    map = new T.Map('map', {
        minZoom: 3,//地图允许展示的最小级别
        maxZoom: 18,//地图允许展示的最大级别
        zoom: zoom,//地图的初始化级别
        center: mapCenter //地图的初始化中心点
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
    var zoom = new T.Control.Zoom();
    //添加缩放平移控件
    map.addControl(zoom);
    markerTool = new T.MarkTool(map); // 初始化加点工具
};