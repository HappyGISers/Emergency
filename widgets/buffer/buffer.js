var T = parent.T;
var ol = parent.ol;
var map = parent.map;
var layerList = parent.mainData.data.layerList;
var markerTool = parent.markerTool;
var polylineTool = parent.polylineTool;// 初始化画线工具
var polygonTool = parent.polygonTool;// 初始化画面工具
var rectangleTool = parent.rectangleTool;// 初始化矩形工具
var geoFormat = new ol.format.GeoJSON();
var currentDrawTool;
var bufferResult = {
    count: 0,
    coordinates: [],
    marks: {},
    contents:{}
};

var currentDrawGeoJson = {
    type: "Feature",
    geometry: null,
    properties:null
};
var drawStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#00ffff7d'
    }),
    stroke: new ol.style.Stroke({
        color: "#00FFFF7D",
        width: 1
    }),
    image: new ol.style.Circle({
        fill: new ol.style.Fill({
            color: "#00FFFF7D"
        })
    })
});

var source = new ol.source.Vector({ wrapX: false });
var bufferLayer = new ol.layer.Vector({
    source: source,
    style: drawStyle
});
map.addLayer(bufferLayer);

function initCheckbox() {
    layerList = parent.mainData.data.layerList;
    var tableContent = '';
    var allLayer = document.getElementsByClassName('analog-select-valueall')[0];
    for(var layer in layerList)
    {
        tableContent += "<p class='checkbox' id=" + layer + ">" + layerList[layer].name + "</p>";
    }
    allLayer.innerHTML = tableContent
}

function addGraphic(type) {
    map.disableDoubleClickZoom();
    switch (type)
    {
        case "point":
            startDraw(markerTool);
            break;
        case "polyline":
            startDraw(polylineTool);
            break;
        case "rectangle":
            startDraw(rectangleTool);
            break;
        case "polygon":
            startDraw(polygonTool);
    }
}

function startDraw(drawTool) {
    currentDrawTool = drawTool;
    drawTool.open();
    if(drawTool instanceof T.MarkTool)
    {
        drawTool.removeEventListener("mouseup", drawMarkEnd);
        drawTool.addEventListener("mouseup", drawMarkEnd);
    }
    else {
        drawTool.removeEventListener("draw", drawEnd);
        drawTool.addEventListener("draw", drawEnd);
    }
}

//绘制点完成回调
function drawMarkEnd(currentLnglat, currentFeature) {
    currentDrawGeoJson.geometry = getGeometry(currentLnglat, currentFeature);
    map.enableDoubleClickZoom();
    closeTool();
}

//除点以外的绘制完成回调
function drawEnd(currentLnglats,area, currentFeature) {
    currentDrawGeoJson.geometry = getGeometry(currentLnglats, currentFeature);
    map.enableDoubleClickZoom();
    closeTool();
}

function getGeometry(lnglats, feature) {
    var geometry = feature.getGeometry();
    return {
        type: geometry.getType(),
        coordinates: lnglats
    };
}

function search() {
    if(currentDrawGeoJson.geometry === null)
    {
        alert('请先绘制缓冲图形');
        return;
    }
    initBufferResult();
    //获取缓冲查询参数设置
    var bufferParameters = getBufferParameters();
    var selectedLayers = bufferParameters.selectedLayers;
    //缓冲
    var bufferJson = doBuffer(bufferParameters.radius, bufferParameters.bufferUnit);
    var resultLayers = [];
    //查询结果
    selectedLayers.forEach(function (layer) {
        //按勾选图层逐个查询
        resultLayers.push(layer);
        //获取图层所有数据
        queryLayer(layer,function (data) {
            var count = 0;
            var list = $('.list-keyword')[0];
            for (var i=0; i<data.length; i++) {
                var pointData = data[i];
                // var coordinate = [parseInt(pointData.longitude), parseInt(pointData.latitude)];
                var coordinate = [pointData.longitude, pointData.latitude];
                //查询当前点是否和缓冲区不相交
                var isDisjoint = turf.booleanDisjoint(turf.point(coordinate), bufferJson);
                //如果相交，则添加缓冲结果
                if(isDisjoint === false)
                {
                    var marker = parent.addMarker(pointData);
                    bufferResult.coordinates.push(coordinate);
                    var listContent =getResultContent(layer, pointData.name);
                    bufferResult.contents[layer] +=listContent;
                    //添加结果
                    if(!bufferResult.marks[layer]){
                        bufferResult.marks[layer] = [];
                    }
                    bufferResult.marks[layer].push(marker);
                    count++;
                    bufferResult.count++;
                }
            }
            list.innerHTML(bufferResult.contents[layer]);
            //添加标题栏
            var title = document.createElement('p');
            title.innerHTML = layerList[layer].name + ' (' +count + ') ';
            document.getElementsByClassName('list-title')[0].appendChild(title);
            $('.list-title .select')[0].innerHTML = '全部 (' + bufferResult.count + ') ';
        });
    })
}
//根据绘制的图形进行缓冲获取缓冲图形
function doBuffer(radius, bufferUnit) {
    var bufferJson = turf.buffer(currentDrawGeoJson, radius, {units: bufferUnit});
    var currentBufferFeature = geoFormat.readFeature(bufferJson);
    currentBufferFeature.setStyle(drawStyle);
    source.addFeature(currentBufferFeature);
    return bufferJson;
}
function getBufferParameters() {
    var selectedLayers = [];
    $('.analog-select-valueall .checkbox').each(function () {
        if ($(this).hasClass('checked')) {
            selectedLayers.push(this.id);
        }
    });
    return{
        radius:parseInt($('#bufferRadius').val()),
        bufferUnit : $('#bufferUnits').val(),
        selectedLayers: selectedLayers
    }
}

//查询所对应的列表所有图层
var queryLayer = function(val, callback){
    var bufferLayerData = parent.mainData.data.bufferLayerData[val];
    if(bufferLayerData)
    {
        callback(bufferLayerData);
    }
    else {
        $.ajax({
            type : "POST",
            url : parent.ctx+"/eventMap/queryMarker.vm",
            data:{flag:"point",type:val},
            dataType:'json',
            success : function(retMsg){//成功
                if (retMsg.success){
                    var data = retMsg.data || [];
                    callback(data);
                }
            }
        })
    }
};

function getResultContent(val,name) {
    return "<li>\n" +
        "<img src=\"" + layerList[val].imageUrl + "\">\n" +
        "<p class=\"listname\">\n" +
        "<a>"+name+"</a>\n" +
        "</p>\n" +
        "</li>";
}

function initBufferResult() {
    bufferResult = {
        count: 0,
        coordinates: [],
        marks: {},
        contents:{}
    };
   $('.list-keyword')[0].innerHTML = '';
   $('.list-title')[0].innerHTML ='<p class=\"select\">全部（149）</p>';
}
function closeTool() {
    if(currentDrawTool)
    {
        currentDrawTool.clear();
        currentDrawTool.close();
    }
}
function clear() {
    currentDrawGeoJson.geometry = null;
    source.clear();
    closeTool();
}