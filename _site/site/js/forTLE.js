
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}

function tryRandom2() {
    $("#myPopup3").popup("close");
    tryRandom();
}

function tryRandom() {
    var rndSat = randomNum(0, 43287);
    $.ajax({
        type: 'GET',
        url: 'https://cors-anywhere.herokuapp.com/https://celestrak.com/cgi-bin/TLE.pl?CATNR=' + rndSat + '&callback=?',
        cache: false,
        dataType: "text",
        crossDomain: true,
        headers: {'Origin':'https://foo.example.com'},
        success: function (data) {
            var el = document.createElement('html');
            el.innerHTML = data;
            var p = el.getElementsByTagName('BODY')[0].getElementsByTagName('PRE')[0].textContent;
            var eachLine = p.split(/[\n]/);
            if (eachLine[0] == 'No TLE found') {
                $("#myPopup3").popup("open");
            } else {
                var titleStr = eachLine[0].replace(/[\s]deb/ig, "的碎片");
                //window.alert("随机得到的卫星名字是" + titleStr);
                swal("随机得到的卫星名字是", titleStr,"success");
                $('#areaTLE').val(eachLine[1] + '\n' + eachLine[2]);
                boolNotGet = false;
            }
        }
    });
}


function propagateFromGuiInput() {
    var inputStr = $('#areaTLE').val();
    var line = inputStr.split(/[\n]/);

    var satrec = satellite.twoline2satrec(line[0].trim(), line[1].trim());
    var secondLineStr = line[1].split(/\s+/);
    var T = 1440 / Number(secondLineStr[7].substr(0, 10));

    //  Propagate satellite using time since epoch (in minutes).
    var slices = Number($('#iNPLOT').val());
    var allData = new Array(slices);
    var date13 = Date.parse($('#datetime3').val());
    var date14 = Date.parse($('#datetime4').val());
    var ddate = (date14 - date13) / slices;
    var totalTime = ddate * slices / 60000;
    str = "运行时间为" + totalTime + "分钟，轨道周期为" + T + "分钟，共计" + (totalTime / T) + "个周期！";
    swal("",str);

    for (var i = 0; i < slices; ++i) {
        var dt = Date(date13 + i * ddate);
        var x = new Array(3);
        var positionAndVelocity = satellite.propagate(satrec, new Date(date13 + i * ddate));
        var positionEci = positionAndVelocity.position;
        var gmst = satellite.gstime(new Date(date13 + i * ddate));
        var positionGd = satellite.eciToGeodetic(positionEci, gmst);
        var longitude = positionGd.longitude * degPerRad;
        var latitude = positionGd.latitude * degPerRad;
        var height = positionGd.height;
        x[0] = longitude;
        x[1] = latitude;
        x[2] = height / (6378.1 / 15);
        allData[i] = x;
    }

    return allData;
}