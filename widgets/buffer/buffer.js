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
var currentDrawGeoJson = {
    type: "Feature",
    geometry: {},
    properties:null
};

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
    if(currentDrawGeoJson === undefined)
    {
        alert('请先绘制缓冲图形');
        return;
    }
    var bufferParameters = getBufferParameters();
    var selectedLayers = bufferParameters.selectedLayers;
    var bufferJson = doBuffer(bufferParameters.radius, bufferParameters.bufferUnit);
    // var resultLayers = [], len = [];
    // var self = this;
    // var count = 0, layerLength = selectedLayers.length - 1;
    // selectedLayers.forEach(function (index) {
    //     resultLayers.push(index);
    //     var layer = selectedLayers[index];
    //     var layerData = layer.data;
    //     var intersectData = turf.intersect(layerData, bufferJson);
    //     len.push(intersectData.features.length);
    //     if (count === layerLength) {
    //         var resultLen = 0;
    //         for (var i = 0; i < len.length; i++) {
    //             resultLen += len[i];
    //         }
    //         var returnData = {
    //             features: self._resultDatas,
    //             allResultLen: resultLen,
    //             resultLayer: self._resultLayers
    //         };
    //     }
    //     count++;
    // })
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
            for(var i=0; i<layers.length; i++)
            {
                if(layers[i] === this.id)
                {

                    selectedLayers.push(layers[i]);
                }
            }
        }
    });
    return{
        radius:parseInt($('#bufferRadius').val()),
        bufferUnit : $('#bufferUnits').val(),
        selectedLayers: selectedLayers
    }
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