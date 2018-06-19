var T = parent.T;
var map = parent.map;
var markerTool = parent.markerTool;
var polylineTool = parent.polylineTool;// 初始化画线工具
var polygonTool = parent.polygonTool;// 初始化画面工具
var rectangleTool = parent.rectangleTool;// 初始化矩形工具

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
    drawTool.open();
    drawTool.removeEventListener("mouseup", doBuffer.bind(null, drawTool));
    drawTool.addEventListener("mouseup", doBuffer.bind(null, drawTool));
}

function doBuffer(drawTool,currentLnglat, currentMarker, allMarkers) {
    drawTool.clear();
    drawTool.close();
}