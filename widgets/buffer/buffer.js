var T = parent.T;
var $ = parent.$;
var ol = parent.ol;
var map = parent.map;
var markerTool = parent.markerTool;
var polylineTool = parent.polylineTool;// 初始化画线工具
var polygonTool = parent.polygonTool;// 初始化画面工具
var rectangleTool = parent.rectangleTool;// 初始化矩形工具
var geoFormat = new ol.format.GeoJSON();
var currentDrawTool;
var currentBufferFeature;

var source = new ol.source.Vector({ wrapX: false });
var bufferLayer = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: '#00FFFF7D'
        }),
        stroke: new ol.style.Stroke({
            color: "#00FFFF7D",
            width: 1
        })
    })
});

map.addLayer(bufferLayer);

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
$(function () {
    //获取父窗口的关闭事件
    $('.widgets-select', window.parent.document).find('.widgets-close').click(function () {
        clear();
    })
});

function addGraphic(type) {
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
    map.disableDoubleClickZoom();
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

function drawMarkEnd(currentLnglat, currentFeature) {
    map.enableDoubleClickZoom();
    doBuffer(currentFeature);
    closeTool();
}

function drawEnd(currentLnglats,area, currentFeature) {
    map.enableDoubleClickZoom();
    doBuffer(currentFeature);
    closeTool();
}

function doBuffer(currentFeature) {
    var radius = parseInt($('#bufferRadius').val());
    var bufferUnit = $('#bufferUnits').val();
    var geojson = JSON.parse(geoFormat.writeFeature(currentFeature,{dataProjection:map.getView().getProjection().getCode()}));
    var bufferJson = turf.buffer(geojson, radius, {units: bufferUnit});
    currentBufferFeature = geoFormat.readFeature(bufferJson);
    currentBufferFeature.setStyle(drawStyle);
    source.addFeature(currentBufferFeature)
}

function closeTool() {
    if(currentDrawTool)
    {
        currentDrawTool.clear();
        currentDrawTool.close();
    }
}
function clear() {
    source.clear();
    closeTool();
}