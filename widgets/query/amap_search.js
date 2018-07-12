var AMAP_SERVICE_KEY = "89ec03d04105edaa84fc18f07e744939"; //key 请自己申请
var keywords = "kfc";
var city = "010";
var extent = "116.278942,39.837798|116.641491,39.977376";
var serviceUrl1 =
    "https://restapi.amap.com/v3/place/text?parameters?keywords=" + keywords + "&city=" + city + "&offset=20&page=1&key=" + AMAP_SERVICE_KEY + "&extensions=base";
var serviceUrl2 = "https://restapi.amap.com/v3/place/polygon?polygon=" + extent + "&keywords=" + keywords + "&key=" + AMAP_SERVICE_KEY;
$.ajax({ //高德地图HTTP服务
    type: "get",
    url: serviceUrl2,
    success: function (result) { //成功返回结果
        var result = eval(result); //解析JSON格式的字符串

    }
});