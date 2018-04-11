function getOrbitMap(){
    var amap = new Map();
    amap.set("normal",[8576, 0.241, 112.228, 19.6, 120.671, 25.325]);
    amap.set("GeoSync",[42164, 0, 0, 19.6, 70, 25.325]);
    amap.set("eightSat",[42164, 0, 50, 19.6, 80, 25.325]);
    amap.set("eightSat2",[42164, 0.4, 50, 19.6, 80, 25.325]);
    return amap;
}

function setSatlelliteSetsOnGui(orbitalElement) {
    $('#iSMA').val(orbitalElement[0]);
    $('#iECC').val(orbitalElement[1]);
    $('#iINC').val(orbitalElement[2]);
    $('#iAOP').val(orbitalElement[3]);
    $('#iRAAN').val(orbitalElement[4]);
    $('#iTA').val(orbitalElement[5]);
}

function getOrbitStateOnGui(){
    var a = Number($('#iSMA').val()) * 1000.0;
    var orbit1 = new orbit(Number($('#iSMA').val() * 1000.0),
      Number($('#iECC').val()),
      Number($('#iINC').val() * radPerDeg),
      Number($('#iAOP').val() * radPerDeg),
      Number($('#iRAAN').val() * radPerDeg),
      Number($('#iTA').val()) * radPerDeg);
    return orbit1;
}

function getRunTimeOnGui() {
    var a = Number($('#iSMA').val()) * 1000.0;
    var time = 2 * pi * Math.pow(a * a * a / mu, 0.5) * Number($('#iN').val());
    return time;
}