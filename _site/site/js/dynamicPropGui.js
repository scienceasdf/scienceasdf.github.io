var nameToUrlMap = new Map();

function getUnitMap()
{
    var amap = new Map();
    amap.set("Thrust", "N");
    amap.set("PWR", "W");
    amap.set("Pe", "");
    amap.set("Torque", "Nm");
    return amap;
}

function searchProp()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../database/propTitle.db', true);
    xhr.responseType = 'arraybuffer';
    var mySelect = document.getElementById('mySelect');
    mySelect.id = "mySelect";

    xhr.onload = function(e) {
        var uInt8Array = new Uint8Array(this.response);
        var db = new SQL.Database(uInt8Array);
        var qstr = "SELECT title,fileName FROM TitleMap WHERE title like '%" +
                   document.getElementById("name").value + "%'";
        var contents = db.exec(qstr);
        mySelect.length = 0;
        for (i = 0; i < contents[0].values.length; i++) {
            mySelect.add(
                new Option(contents[0].values[i][0], contents[0].values[i][0]));
            nameToUrlMap.set(contents[0].values[i][0],
                             contents[0].values[i][1]);
        }
        $('#mySelect').val(contents[0].values[0]).selectmenu('refresh');
        searchAllRpm();
    };
    xhr.send();
}

function getDatebaseUrl(propName)
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../database/propTitle.db', true);
    xhr.responseType = 'arraybuffer';
    var mySelect = document.getElementById('mySelect');
    mySelect.id = "mySelect";
    var contents;

    xhr.onload = function(e) {
        var uInt8Array = new Uint8Array(this.response);
        var db = new SQL.Database(uInt8Array);
        var qstr =
            "SELECT fileName FROM TitleMap WHERE title = '" + propName + "'";
        contents = db.exec(qstr);
        return contents[0].values[0];
    };
    xhr.send();
}

function searchAllRpm()
{
    var strQueryType = $('input[name=figureType]:checked').attr('id');
    var theUnitMap = getUnitMap();
    var strUnit = theUnitMap.get(strQueryType);

    var obj = document.getElementById('mySelect');
    var index = obj.selectedIndex;
    var xhr = new XMLHttpRequest();
    var propellerName = obj.options[index].value;
    var dbUrl = "../database/" + nameToUrlMap.get(propellerName) + ".db";
    var rpmSelect = document.getElementById('rpmSelect');

    xhr.open('GET', dbUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
        var uInt8Array = new Uint8Array(this.response);
        var db = new SQL.Database(uInt8Array);

        var qstr = "SELECT RPM  FROM propellers GROUP BY RPM";
        var contents = db.exec(qstr);
        rpmSelect.length = 0;
        for (i = 0; i < contents[0].values.length; i++) {
            rpmSelect.add(
                new Option(contents[0].values[i], contents[0].values[i]));
        }
        $('#rpmSelect').val(contents[0].values[0]).selectmenu('refresh');
        plot();
    };
    xhr.send();
}

function plot()
{
    var strQueryType = $('input[name=figureType]:checked').attr('id');
    var theUnitMap = getUnitMap();
    var strUnit = theUnitMap.get(strQueryType);

    var obj = document.getElementById('mySelect');
    var index = obj.selectedIndex;
    var xhr = new XMLHttpRequest();
    var propellerName = obj.options[index].value;
    var dbUrl = "../database/" + nameToUrlMap.get(propellerName) + ".db";
    var objRPM = document.getElementById('rpmSelect');
    var rpmIndex = objRPM.selectedIndex;
    var strRpm = objRPM.options[rpmIndex].value;

    xhr.open('GET', dbUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
        var uInt8Array = new Uint8Array(this.response);
        var db = new SQL.Database(uInt8Array);

        var qstr = "SELECT V, " + strQueryType +
                   " FROM propellers WHERE RPM = " + strRpm + "";
        var contents = db.exec(qstr);

        var myChart = echarts.init(document.getElementById('main'));

        var option = {
            title : {
                text : obj.options[index].value +
                           $('input[name=figureType]:checked').val(),
            },
            tooltip : {},
            legend : {data : [ '拉力' ]},
            dataZoom : [
                {
                  // 这个dataZoom组件，默认控制x轴。
                  type :
                      'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                  start : 10, // 左边在 10% 的位置。
                  end : 60    // 右边在 60% 的位置。
                },
                {
                  // 这个dataZoom组件，也控制x轴。
                  type :
                      'inside', // 这个 dataZoom 组件是 inside 型 dataZoom 组件
                  start : 10, // 左边在 10% 的位置。
                  end : 60    // 右边在 60% 的位置。
                }
            ],
            xAxis : {axisLabel : {formatter : '{value} m/s'}},
            yAxis : {
                axisLabel : {
                    formatter : '{value} ' + strUnit,
                },
                position : 'right'
            },
            series : [
                {
                  data : contents[0].values,
                  type : 'line',
                }
            ]
        };
        myChart.setOption(option);
    };
    xhr.send();
}