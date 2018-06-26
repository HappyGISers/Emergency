var T = parent.T;
var $ = parent.$;
var ol = parent.ol;
var map = parent.map;
var layerList = parent.mainData.data.layerList;
var markerTool = parent.markerTool;
var polylineTool = parent.polylineTool;// 初始化画线工具
var polygonTool = parent.polygonTool;// 初始化画面工具
var rectangleTool = parent.rectangleTool;// 初始化矩形工具
var geoFormat = new ol.format.GeoJSON();
var currentDrawTool;
var bufferResultCount = 0;
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
    var bufferParameters = getBufferParameters();
    var selectedLayers = bufferParameters.selectedLayers;
    var bufferJson = doBuffer(bufferParameters.radius, bufferParameters.bufferUnit);
    var resultLayers = [];
    var layerLength = selectedLayers.length - 1;
    selectedLayers.forEach(function (layer) {
        resultLayers.push(layer);
        queryLayerAndIntersects(layer,bufferJson);
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
var queryLayerAndIntersects = function(val, bufferJson){
    $.ajax({
        type : "POST",
        url : parent.ctx+"/eventMap/queryMarker.vm",
        data:{flag:"point",type:val},
        dataType:'json',
        success : function(retMsg){//成功
            if (retMsg.success){
                retMsg.data = retMsg.data || [];
                var points =retMsg.data.map(function (point) {
                    return {
                        type: "Feature",
                        geometry: {
                            x: point.longitude,
                            y: point.latitude
                        },
                        properties:{
                            dataId: point.dataId,
                            name: point.name,
                            type: point.type
                        }
                    }
                });
                var intersectData = turf.pointsWithinPolygon({
                    type: "FeatureCollection ",
                    features: points
                }, bufferJson);
                bufferResultCount += intersectData.features.length;
                var title = document.createElement('p');
                title.innerHTML = layerList[val].name + ' (' + intersectData.features.length + ') ';
                document.getElementsByClassName('list-title')[0].appendChild(title);
                $('.list-title .select')[0].innerHTML = '全部 (' + bufferResultCount + ') ';
            }
        }
    })
};

function closeTool() {
    if(currentDrawTool)
    {
        currentDrawTool.clear();
        currentDrawTool.close();
    }
}
function clear() {
    bufferResultCount = 0;
    currentDrawGeoJson.geometry = null;
    source.clear();
    closeTool();
}