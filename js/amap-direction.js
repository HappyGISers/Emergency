/**
 * @function 高德地图路径导航服务
 * @description 依赖于coordinateUtils.js包
 */

var AMAP_SERVICE_KEY = "89ec03d04105edaa84fc18f07e744939"; //key 请自己申请
/**
 * @function 步行
 * @parma layerName 加载的图层名
 * @parma _routeName 路线名称
 * @param originGeometry,destinationGeometry起始点geometry
 */
var steps;
var routeName;
var layerName;

var lines = [];

function walking(_layerName, _routeName, originGeometry, destinationGeometry) {
    layerName = _layerName;
    routeName = _routeName;
    var origin = wgs84togcj02(originGeometry.x, originGeometry.y); //坐标系转换
    var destination = wgs84togcj02(destinationGeometry.x, destinationGeometry.y);
    var serviceUrl =
        "http://restapi.amap.com/v3/direction/walking?output=JSON&origin=" + origin + "&destination=" + destination + "&key=" + AMAP_SERVICE_KEY;
    $.ajax({ //高德地图HTTP服务
        type: "get",
        url: serviceUrl,
        async: true,
        success: function (result) { //成功返回结果
            result = eval(result); //解析JSON格式的字符串
            steps = result.route.paths[0].steps; //取出步行数组
            handleResult_walking(steps); //处理步行数组
        }
    });
}

/**
 * @function 处理steps 步行数组
 * @param {Object} result
 */
function handleResult_walking(steps) {
    //因服务中所给路线的经纬度为字符串，所以我们将其转换成数组，并覆盖
    $.each(steps, function (index, value) {
        //把字符串变成 坐标数组，然后转换
        var latAndLons = value.polyline.split(";");
        var points = [];
        $.each(latAndLons, function (index, value) {
            var point = value.split(","); //一个点的经纬度 [x,y]
            $.each(point, function (index, value) {//[x,y]字符串转为float
                point[index] -= 0;
            });
            //point = gcj02towgs84(point[0],point[1]);//转换坐标
            //point = ol.proj.fromLonLat([point[0], point[1]]);
            point = [handle_x(point[0]), handle_y(point[1])];
            points.push(point);//放入集合
            //console.log(points);
        });
        value.polyline = points; //覆盖原来的字符串
        //console.log(value.polyline);
    });
    drawRoute_walking(routeName, steps); //画出解决方案
}

function drawRoute_walking(routeName, steps) {
    $.each(steps, function (index, value) {
        var lineName = routeName + " 第" + (index + 1) + "步"; //步数名称
        //console.log(lineName);
        //console.log(value);
        drawLine_walking(lineName, value); //画线
    });
}

function drawLine_walking(lineName, lineMap) {
    // require([
    //     "esri/geometry/Polyline",
    //     "esri/graphic",
    //     "esri/InfoTemplate",
    //     "esri/layers/GraphicsLayer"
    // ], function(Polyline,Graphic,InfoTemplate,GraphicsLayer) {
    //     var polylineJson = { //线对象参数JSON格式
    //         "paths":[
    //             lineMap.polyline
    //         ],
    //         "spatialReference":{
    //             "wkid":4326
    //         }
    //     };
    //     var polyline = new Polyline(polylineJson); //创建线对象
    //     console.log(polyline);
    //     var attr = { //该地理实体的属性
    //         name : lineName,
    //         action : lineMap.action,
    //         distance : lineMap.distance,
    //         instruction : lineMap.instruction,
    //         road :lineMap.road
    //     };
    //     //地理实体的信息窗口
    //     var infoTemplate = new InfoTemplate("${name}", "方向：${action}<br/>介绍：${instruction}<br/>距离：${distance}米<br/>路名：${road}");
    //     //创建客户端图形
    //     var graphic = new Graphic(polyline,symbolMap["line_default"],attr,infoTemplate);
    //     //加载到地图上
    //     map.getLayer(layerName).add(graphic);
    // });
    var line = new T.Polyline(lineMap.polyline);
    lines.push(line);
    //向地图上添加线
    map.addOverLay(line);
}

/**
 * @function 公交
 * @parma layerName 加载的图层名
 * @param routeName 线路名称
 * @param paramsMap参数信息
 origin lon,lat（经度,纬度），如117.500244, 40.417801 经纬度小数点不超过6位  必须
 destination on,lat（经度,纬度），如117.500244, 40.417801 经纬度小数点不超过6位  必须
 city 城市名 支持市内公交换乘/跨城公交的起点城市，规则：城市名称/citycode 必须
 strategy 0：最快捷模式;1：最经济模式;2：最少换乘模式;3：最少步行模式;5：不乘地铁模式
 nightflag 是否计算夜班车,1:是；0：否
 date 根据出发日期筛选，格式：date=2014-3-19
 time 根据出发时间筛选，格式：time=22:34
 */
var transitRoute; //{} 有origin、destination、distance、taxi_cost、transits乘车方案
function transit(_layerName, _routeName, paramsMap) {
    layerName = _layerName;
    routeName = _routeName;
    paramsMap.origin = wgs84togcj02(paramsMap.origin.x, paramsMap.origin.y);
    paramsMap.destination = wgs84togcj02(paramsMap.destination.x, paramsMap.destination.y);
    var serviceUrl = "http://restapi.amap.com/v3/direction/transit/integrated?";
    $.each(paramsMap, function (key, value) {
        serviceUrl += key + "=" + value + "&";
    });
    serviceUrl += "output=JSON&key=" + AMAP_SERVICE_KEY;
    //console.log(serviceUrl);
    $.ajax({
        type: "get",
        url: serviceUrl,
        async: true,
        success: function (result) {
            result = eval(result);
            //console.log(result);
            transitRoute = result.route;
            $.each(transitRoute.transits, function (index, value) { //transits [] 遍历乘车方案
                //value {} 一种乘车方案 有cost duration nightflag walking_distance distance missed segments
                var segments = value.segments; //[] 乘车方案分几步
                $.each(segments, function (index, value) {
                    handleResult_walking(value.walking.steps);
                    handleResult_bus(value.bus.buslines);
                });
            });
        }
    });
}

function handleResult_bus(buslines) { //处理数据
    $.each(buslines, function (index, value) {
        //把字符串变成 坐标数组，然后转换
        //console.log(value.polyline);
        var latAndLons = value.polyline.split(";");
        var points = [];
        $.each(latAndLons, function (index, value) {
            var point = value.split(","); //一个点的经纬度 [x,y]
            $.each(point, function (index, value) {//[x,y]字符串转为float
                point[index] -= 0;
            });
            // point = gcj02towgs84(point[0],point[1]);//转换坐标
            point = [handle_x(point[0]), handle_y(point[1])];
            //point=ol.proj.fromLonLat([point[0],point[1]]);
            points.push(point);//放入集合
            //console.log(points);
        });
        value.polyline = points;
        //console.log(value.polyline);
    });
    drawRoute_bus(buslines); //画公交线
}

function drawRoute_bus(buslines) {
    $.each(buslines, function (index, value) {
        var lineName = routeName + " 第" + (index + 1) + "步 " + value.name;
        //console.log(lineName);
        //console.log(value);
        drawLine_bus(lineName, value);
    });
}

function drawLine_bus(lineName, lineMap) {
    // require([
    //     "esri/geometry/Polyline",
    //     "esri/graphic",
    //     "esri/InfoTemplate"
    // ], function(Polyline,Graphic,InfoTemplate) {
    //     var polylineJson = {
    //         "paths":[
    //             lineMap.polyline
    //         ],
    //         "spatialReference":{
    //             "wkid":4326
    //         }
    //     };
    //     var polyline = new Polyline(polylineJson);
    //     console.log(polyline);
    //     var attr = {
    //         name : lineName,
    //         distance : lineMap.distance,
    //         type : lineMap.type,
    //         departure_stop : lineMap.departure_stop.name,
    //         arrival_stop : lineMap.arrival_stop.name
    //     };
    //     var infoTemplate = new InfoTemplate("${name}", "类型：${type}<br/>起始站：${departure_stop}<br/>下车站：${arrival_stop}<br/>距离：${distance}米");
    //     var graphic = new Graphic(polyline,symbolMap["line_default"],attr,infoTemplate);
    //     map.getLayer(layerName).add(graphic);
    // });
    var line = new T.Polyline(lineMap.polyline);
    lines.push(line);
    //向地图上添加线
    map.addOverLay(line);
}

function driving(_layerName, _routeName, originGeometry, destinationGeometry) {
    layerName = _layerName;
    routeName = _routeName;
    //var origin = wgs84togcj02(parseFloat(originGeometry.x), parseFloat(originGeometry.y)); //坐标系转换
    // var destination = wgs84togcj02(parseFloat(destinationGeometry.x), parseFloat(destinationGeometry.y));
    var origin = originGeometry.x + ',' + originGeometry.y;
    var destination = destinationGeometry.x + ',' + destinationGeometry.y;
    var serviceUrl =
        "http://restapi.amap.com/v3/direction/driving?output=JSON&origin=" + origin + "&destination=" + destination + "&key=" + AMAP_SERVICE_KEY;
    $.ajax({ //高德地图HTTP服务
        type: "get",
        url: serviceUrl,
        async: true,
        success: function (result) { //成功返回结果
            result = eval(result); //解析JSON格式的字符串
            steps = result.route.paths[0].steps; //取出步行数组
            handleResult_walking(steps); //处理步行数组
        }
    });
}

function clearPath() {
    if (lines.length > 0) {
        for (var line in lines) {
            map.removeOverLay(lines[line]);
        }
    }
}

