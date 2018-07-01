//军标绘制图层
var drawLayer;
//矢量资源
var source;
//绘制工具
var drawTool;
//修改工具
var modifyTool;
//移动工具
var dragTool;
//选择工具
var selectTool;
//拉框选择工具
var boxSelectTool;
//选中要素数组
var selectedFeatures;
//样式数组
var styles;
//地图容器
var map = parent.map;

var ol = parent.ol;
var MilStd = parent.MilStd;
$(function () {
    //获取父窗口的关闭事件
    $('.widgets-select', window.parent.document).find('.widgets-close').click(function () {
        removeInteractions();
    })
});
//初始化
function init() {

    source = new ol.source.Vector({ wrapX: false });
    parent.milstdSource = source;
    drawLayer = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: $('#FillClr').val()
            }),
            stroke: new ol.style.Stroke({
                color: $('#LinClr').val(),
                lineCap: $('#LinHeadType').val(),
                lineJoin: $('#LinJointType').val(),
                lineDash: [parseInt($('#LinDash').val()), parseInt($('#LinDot').val())],
                width: parseInt($('#LinWidth').val())
            }),
            image: new ol.style.Circle({
                radius: parseInt($('#PntRadius').val()),
                fill: new ol.style.Fill({
                    color: $('#FillClr').val()
                })
            })
        })
    });

    map.addLayer(drawLayer);
    drawTool = new MilStd.tool.MilStdDrawTool(map);
    drawTool.on(MilStd.event.MilStdDrawEvent.DRAW_END, onDrawEnd, false, this);
}

//绘制军标
function drawArrow(type) {
    removeInteractions();
    switch (type) {
        case "SimpleArrow":
            var milParam = new MilStd.MilstdParams({
                headHeightFactor: 0.15,
                headWidthFactor: 0.4,
                neckHeightFactor: 0.75,
                neckWidthFactor: 0.1,
                tailWidthFactor: 0.1,
                hasSwallowTail: true,
                swallowTailFactor: 0.8
            });
            drawTool.activate(MilStd.EnumMilstdType.SimpleArrow, milParam, "drawSimpleArrow");
            break;
        case "DoubleArrow":
            var milParam = new MilStd.MilstdParams({
                headHeightFactor: 0.15,
                headWidthFactor: 0.8,
                neckHeightFactor: 0.7,
                neckWidthFactor: 0.4
            });
            drawTool.activate(MilStd.EnumMilstdType.DoubleArrow, milParam, "drawDoubleArrow");
            break;
        case "StraightArrow":
            var milParam = new MilStd.MilstdParams({
                headHeightFactor: 0.1,
                headWidthFactor: 1.3,
                neckHeightFactor: 1.0,
                neckWidthFactor: 0.7,
                tailWidthFactor: 0.07,
                hasSwallowTail: false,
                swallowTailFactor: 0
            });
            drawTool.activate(MilStd.EnumMilstdType.StraightArrow, milParam, "drawStraightArrow");
            break;
        case "SingleLineArrow":
            var milParam = new MilStd.MilstdParams({
                headHeightFactor: 0.1,
                headWidthFactor: 1.3
            });
            drawTool.activate(MilStd.EnumMilstdType.SingleLineArrow, milParam, "drawdrawSingleLineArrow");
            break;
        case "TriangleFlag":
        case "RectFlag":
        case "CurveFlag":
            drawTool.activate(type, null, "drawFlag");
            break;
        //贝塞尔曲线成区
        case "Bezier":
        //贝塞尔曲线
        case "BezierLine":
        //集结区
        case "AssemblyArea":
            drawTool.activate(type, null, "drawBazier");
            break;
        default:
    }
};
//绘制完成后的回调
function onDrawEnd(event) {
    var drawStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: $('#FillClr').val() + "64"
        }),
        stroke: new ol.style.Stroke({
            color: $('#LinClr').val(),
            width: parseInt($('#LinWidth').val())
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: $('#FillClr').val() + "64"
            })
        })
    });

    var feature = event.feature;
    feature.setStyle(drawStyle);
    source.addFeature(feature);
}

//修改军标
function modifyArrow() {
    removeInteractions();
    modifyTool = new MilStd.ModifyTool(map);
    modifyTool.activate();
};

//移动军标
function moveArrow() {
    removeInteractions();

    dragTool = new MilStd.DragPan(map);
    dragTool.activate();
};

//移除选中的军标
function removeArrow() {
    removeInteractions();

    boxSelectTool = new ol.interaction.DragBox({
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [0, 0, 255, 1]
            })
        })
    });
    map.addInteraction(boxSelectTool);
    boxSelectTool.on('boxend', function (e) {
        selectedFeatures = new Array();
        var extent = boxSelectTool.getGeometry().getExtent();
        source.forEachFeatureIntersectingExtent(extent, function (feature) {
            selectedFeatures.push(feature);
        });
        if (selectedFeatures && selectedFeatures.length > 0) {
            for (var i = 0; i < selectedFeatures.length; i++) {
                source.removeFeature(selectedFeatures[i]);
            }
        }
    });
}

var inputObjStyleEx = null;
//*设置颜色选择器
function showcolors(ids) {
    var o = document.getElementById(ids);
    inputObjStyleEx = o;
    showColorPicker(o, o, colorchangStyleEx);
}
function colorchangStyleEx(e) {
    inputObjStyleEx.style.background = inputObjStyleEx.value;
}

//修改样式
function editGeom() {
    removeInteractions();

    selectTool = new ol.interaction.Select();
    map.addInteraction(selectTool);

    boxSelectTool = new ol.interaction.DragBox({
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [0, 0, 255, 1]
            })
        })
    });
    map.addInteraction(boxSelectTool);
    boxSelectTool.on('boxend', function (e) {
        selectedFeatures = new Array();
        styles = new Array();
        var extent = boxSelectTool.getGeometry().getExtent();
        source.forEachFeatureIntersectingExtent(extent, function (feature) {
            styles.push(feature.getStyle());
            selectedFeatures.push(feature);
            var editStyle = getEditStyle();
            feature.setStyle(editStyle);
            $('#cancelEditBtn').attr("class", "enable");
        });
    });

    selectTool.on('select', function (e) {
        styles = new Array();
        selectedFeatures = e.selected;
        if (selectedFeatures && selectedFeatures.length > 0) {
            for (var i = 0; i < selectedFeatures.length; i++) {
                styles.push(selectedFeatures[i].getStyle());
                var editStyle = getEditStyle();
                selectedFeatures[i].setStyle(editStyle);
            }
        }
        $('#cancelEditBtn').attr("class", "enable");
    });
}

//获取表单样式信息
function getEditStyle() {
    var style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: $('#FillClr').val() + "64"
        }),
        stroke: new ol.style.Stroke({
            color: $('#LinClr').val(),
            width: parseInt($('#LinWidth').val())
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: $('#FillClr').val() + "64"
            })
        })
    });

    return style;
}
//撤销样式修改
function cancelEditGeom() {
    if (selectedFeatures && selectedFeatures.length > 0) {
        for (var i = 0; i < selectedFeatures.length; i++) {
            selectedFeatures[i].setStyle(styles[i]);
        }
    }
    selectedFeatures = new Array();
    styles = new Array();
    $('#cancelEditBtn').attr("class", "disable");
}

//移除所有控件
function removeInteractions() {
    $('#cancelEditBtn').attr("class", "disable");

    if (drawTool) {
        drawTool.deactivate();
    }
    if (modifyTool) {
        modifyTool.deactivate();
    }
    if (dragTool) {
        dragTool.deactivate();
    }
    if (selectTool) {
        map.removeInteraction(selectTool);
    }
    if (boxSelectTool) {
        map.removeInteraction(boxSelectTool);
    }
}

//清除所有要素
function removeAllFeatures() {
    removeInteractions();
    source.clear();
}