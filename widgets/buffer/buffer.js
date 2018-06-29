var T = parent.T;
var ol = parent.ol;
var map = parent.map;
var layerList = parent.layerList;
var markerTool = parent.markerTool;
var polylineTool = parent.polylineTool;// 初始化画线工具
var polygonTool = parent.polygonTool;// 初始化画面工具
var rectangleTool = parent.rectangleTool;// 初始化矩形工具
var currentDrawTool;
var selectLayerCount = 0;
var bufferResult = {
    bufferJson: {},
    bufferPolygon: {},
    count: 0,
    coordinates: [],
    marks: {},
    contents: {}
};

var currentDrawGeoJson = {
    type: "Feature",
    geometry: null,
    properties: null
};

function initCheckbox() {
    layerList = parent.layerList;
    var tableContent = '';
    var allLayer = document.getElementsByClassName('analog-select-valueall')[0];
    for (var layer in layerList) {
        tableContent += "<p class='checkbox' id=" + layer + ">" + layerList[layer].name + "</p>";
    }
    allLayer.innerHTML = tableContent
}

//开始绘制
function prepareDraw(type) {
    clearDrawGraphic();
    initBufferResult();
    closeTool();
    switch (type) {
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
    if (drawTool instanceof T.MarkTool) {
        drawTool.removeEventListener("mouseup", drawMarkEnd);
        drawTool.addEventListener("mouseup", drawMarkEnd);
    }
    else {
        map.disableDoubleClickZoom();
        drawTool.removeEventListener("draw", drawEnd);
        drawTool.addEventListener("draw", drawEnd);
    }
}

//绘制点完成回调
function drawMarkEnd(currentLnglat, currentFeature) {
    $('.lump').removeClass('active');
    // var temp=[];
    // for(var i =0;i<currentLnglat.length;i++)
    // {
    //     temp.push(currentLnglat[i].toFixed(6));
    // }
    currentDrawGeoJson.geometry = getGeometry(currentLnglat, currentFeature);
    closeTool();
}

//除点以外的绘制完成回调
function drawEnd(currentLnglats, area, currentFeature) {
    $('.lump').removeClass('active');
    currentDrawGeoJson.geometry = getGeometry(currentLnglats, currentFeature);
    closeTool();
    map.enableDoubleClickZoom();
}

function getGeometry(lnglats, feature) {
    var geometry = feature.getGeometry();
    return {
        type: geometry.getType(),
        coordinates: lnglats
    };
}

//开始缓冲并搜索
function search() {
    if (currentDrawGeoJson.geometry === null) {
        alert('请先绘制缓冲图形');
        return;
    }
    //获取缓冲查询参数设置
    var bufferParameters = getBufferParameters();
    var selectedLayers = bufferParameters.selectedLayers;
    if (selectedLayers.length === 0) {
        alert('请选择查询对象');
        return;
    }
    initBufferResult();
    //缓冲
    var bufferJson = doBuffer(bufferParameters.radius, bufferParameters.bufferUnit);
    selectLayerCount = selectedLayers.length;
    //查询结果
    selectedLayers.forEach(function (layer) {
        //获取图层所有数据
        queryLayer(layer, queryAndAddResult.bind(null, layer, bufferJson));
    })
}

//根据绘制的图形进行缓冲获取缓冲图形
function doBuffer(radius, bufferUnit) {
    var bufferJson = turf.buffer(currentDrawGeoJson,
        radius, {
            units: bufferUnit,
            steps: 200
        });
    var bufferCoordinates = [];
    if (bufferJson && bufferJson.geometry &&
        bufferJson.geometry.coordinates.length === 1) {
        bufferCoordinates = bufferJson.geometry.coordinates[0];
    }
    else {
        bufferCoordinates = bufferJson.geometry.coordinates
    }
    // //向地图上添加自定义标注
    var points = bufferCoordinates.map(function (coordinate) {
        return new T.LngLat(coordinate[0], coordinate[1]);
    });
    var polygon = new T.Polygon(points);
    bufferResult.bufferPolygon = polygon;
    map.addOverLay(polygon);
    bufferResult.bufferCoordinates = bufferCoordinates;
    return bufferJson;
}

function getBufferParameters() {
    var selectedLayers = [];
    $('.analog-select-valueall .checkbox').each(function () {
        if ($(this).hasClass('checked')) {
            selectedLayers.push(this.id);
        }
    });
    return {
        radius: parseInt($('#bufferRadius').val()),
        bufferUnit: $('#bufferUnits').val(),
        selectedLayers: selectedLayers
    }
}

//查询所对应的列表所有图层
var queryLayer = function (val, callback) {
    var bufferLayerData = parent.targentMark[val];
    if (bufferLayerData) {
        callback(bufferLayerData);
    }
    else {
        $.ajax({
            type: "POST",
            url: parent.ctx + "/eventMap/queryMarker.vm",
            data: {flag: "point", type: val},
            dataType: 'json',
            success: function (retMsg) {//成功
                if (retMsg.success) {
                    var data = retMsg.data || [];
                    callback(data);
                }
            }
        })
    }
};

//对每个图层进行缓冲查询并添加结果
function queryAndAddResult(layer, bufferJson, data) {
    var count = 0;
    var list = $('.list-keyword')[0];
    bufferResult.contents[layer] = bufferResult.contents[layer] || "";
    for (var i = 0; i < data.length; i++) {
        var pointData = data[i];
        var coordinate = [parseFloat(pointData.longitude), parseFloat(pointData.latitude)];
        // var coordinate = [pointData.longitude, pointData.latitude];
        //查询当前点是否和缓冲区相交
        var isInPolygon = turf.booleanDisjoint(turf.point(coordinate), bufferJson);
        //如果相交，则添加缓冲结果
        if (isInPolygon === false) {
            var marker = parent.addMarker(pointData);
            bufferResult.coordinates.push(coordinate);
            var listContent = getResultContent(layer, pointData.name);
            bufferResult.contents[layer] += listContent;
            //添加结果
            if (!bufferResult.marks[layer]) {
                bufferResult.marks[layer] = [];
            }
            bufferResult.marks[layer].push(marker);
            count++;
            bufferResult.count++;
        }
    }
    //更新结果列表
    list.innerHTML += bufferResult.contents[layer];
    //添加标题栏
    var title = document.createElement('p');
    title.innerHTML = layerList[layer].name + ' (' + count + ') ';
    document.getElementsByClassName('list-title')[0].appendChild(title);
    $('.list-title .select')[0].innerHTML = '全部 (' + bufferResult.count + ') ';
    var count = Object.keys(bufferResult.contents).length;
    if (selectLayerCount === count) {
        zoomToBuffer();
    }
}

function getResultContent(val, name) {
    return "<li>\n" +
        "<img src=\"../../" + layerList[val].imageUrl + "\">\n" +
        "<p class=\"listname\">\n" +
        "<a>" + name + "</a>\n" +
        "</p>\n" +
        "</li>";
}

function zoomToBuffer() {
    if (bufferResult.bufferCoordinates.length) {
        map.setViewport(bufferResult.bufferCoordinates);
    }
}

//清空所有并初始化面板
function clear(isClearBufferParameters) {
    initBufferWidget(isClearBufferParameters);
    clearDrawGraphic();
    closeTool();
    currentDrawTool = undefined;
}

//初始化缓冲区微件
function initBufferWidget(isClearBufferParameters) {
    isClearBufferParameters = isClearBufferParameters || true;
    initBufferResult();
    currentDrawGeoJson.geometry = null;
    if (isClearBufferParameters) {
        $('.analog-select-value').html('请选择查询对象');
    }
}

//清空搜索结果
function initBufferResult() {
    //移除地图上所有缓冲结果点
    $.each(bufferResult.marks, function (i, layer) {
        $.each(layer, function (i, mark) {
            try {
                map.removeOverLay(mark);
            } catch (e) {
            }
        });
    });
    try {
        map.removeOverLay(bufferResult.bufferPolygon);
    } catch (e) {
    }
    bufferResult = {
        bufferJson: {},
        bufferPolygon: {},
        count: 0,
        bufferCoordinates: [],
        coordinates: [],
        marks: {},
        contents: {}
    };
    $('.list-keyword')[0].innerHTML = '';
    $('.list-title')[0].innerHTML = '<p class=\"select\">全部（0）</p>';
}

function closeTool() {
    if (currentDrawTool) {
        currentDrawTool.close();
    }
}

function clearDrawGraphic() {
    try {
        currentDrawTool.clear();
    } catch (e) {
    }
}