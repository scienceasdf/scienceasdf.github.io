var pi = 3.141592653589793;
var mu = 3.98600445e14;
var degPerRad = 180 / pi;
var radPerDeg = pi / 180;
var earthRot = 7.292e-5 * degPerRad;
var gravityConst = mu;

var orbit = function(a, e, i, omega, Omega, phi) {
  this.SMA = a;
  this.ECC = e;
  this.INC = i;
  this.AOP = omega;
  this.RAAN = Omega;
  this.TA = phi;
};

var RV = function(r, v) {
  this.r = r;
  this.v = v;
};

var geo = function(long, lat, height) {
  this.long = long;
  this.lat = lat;
  this.height = height;
};

function EA2TA(EA, ecc) {
  var sp =
    Math.pow(1.0 - ecc * ecc, 0.5) * Math.sin(EA) / (1.0 - ecc * Math.cos(EA));
  var cp = (Math.cos(EA) - ecc) / (1.0 - ecc * Math.cos(EA));
  return Math.atan2(sp, cp);
}

function MA2TA(MA, ecc) {
  if (ecc < 1.0) {
    //elliptic orbit case
    var E;
    if ((MA < 0.0 && MA > -pi) || MA > pi) E = MA - ecc;
    else E = MA + ecc;

    var E_ = MA;
    while (Math.abs(E - E_) > 1e-8) {
      E_ = E;
      E = E + (MA - E + ecc * Math.sin(E)) / (1 - ecc * Math.cos(E));
    }

    return EA2TA(E, ecc);
  }
}

function TA2EA(TA, ecc) {
  var se =
    Math.pow(1.0 - ecc * ecc, 0.5) * Math.sin(TA) / (1.0 + ecc * Math.cos(TA));
  var ce = (ecc + Math.cos(TA)) / (1.0 + ecc * Math.cos(TA));
  return Math.atan2(se, ce);
}

function EA2MA(EA, ecc) {
  return EA - ecc * Math.sin(EA);
}

function TA2MA(TA, ecc) {
  return EA2MA(TA2EA(TA, ecc), ecc);
}

/** \brief This extrapolates the trajectory after time t
 *
 * \t time expressed in seconds
 * \return void
 *  All the states are extrapolated after t seconds
 */
orbit.prototype.step = function(t) {
  var MA = TA2MA(this.TA, this.ECC);
  var n = Math.pow(gravityConst / this.SMA / this.SMA / this.SMA, 0.5);
  MA += n * t;
  this.TA = MA2TA(MA, this.ECC);
};

/** \brief This converts Keplerian state to Cartesian state
 *
 * \r position vector in inertial frame
 * \v velocity vector in inertial frame
 * \return void
 *  This returns the results by pointers r and v
 */
orbit.prototype.toCartesian = function() {
  var p = this.SMA * (1.0 - this.ECC * this.ECC);
  var radius = p / (1 + this.ECC * Math.cos(this.TA));
  var h = Math.pow(gravityConst / p, 0.5);

  var x =
    radius *
    (Math.cos(this.AOP + this.TA) * Math.cos(this.RAAN) -
      Math.cos(this.INC) * Math.sin(this.AOP + this.TA) * Math.sin(this.RAAN));
  var y =
    radius *
    (Math.cos(this.AOP + this.TA) * Math.sin(this.RAAN) +
      Math.cos(this.INC) * Math.sin(this.AOP + this.TA) * Math.cos(this.RAAN));
  var z = radius * (Math.sin(this.INC) * Math.sin(this.AOP + this.TA));

  var r = new math.matrix([x, y, z]);

  var dotX =
    h *
      (Math.cos(this.TA) + this.ECC) *
      (-Math.sin(this.AOP) * Math.cos(this.RAAN) -
        Math.cos(this.INC) * Math.sin(this.RAAN) * Math.cos(this.AOP)) -
    h *
      Math.sin(this.TA) *
      (Math.cos(this.AOP) * Math.cos(this.RAAN) -
        Math.cos(this.INC) * Math.sin(this.RAAN) * Math.sin(this.AOP));
  var dotY =
    h *
      (Math.cos(this.TA) + this.ECC) *
      (-Math.sin(this.AOP) * Math.sin(this.RAAN) +
        Math.cos(this.INC) * Math.cos(this.RAAN) * Math.cos(this.AOP)) -
    h *
      Math.sin(this.TA) *
      (Math.cos(this.AOP) * Math.sin(this.RAAN) +
        Math.cos(this.INC) * Math.cos(this.RAAN) * Math.sin(this.AOP));
  var dotZ =
    h *
      (Math.cos(this.TA) + this.ECC) *
      (Math.sin(this.INC) * Math.cos(this.AOP)) -
    h * Math.sin(this.TA) * Math.sin(this.INC) * Math.sin(this.AOP);

  var v = new math.matrix([dotX, dotY, dotZ]);
  var res = new RV(r, v);
  return res;
};

orbit.prototype.toGEO = function() {
  var p = this.SMA * (1.0 - this.ECC * this.ECC);
  var radius = p / (1 + this.ECC * Math.cos(this.TA));
  var h = Math.pow(gravityConst / p, 0.5);

  var x =
    radius *
    (Math.cos(this.AOP + this.TA) * Math.cos(this.RAAN) -
      Math.cos(this.INC) * Math.sin(this.AOP + this.TA) * Math.sin(this.RAAN));
  var y =
    radius *
    (Math.cos(this.AOP + this.TA) * Math.sin(this.RAAN) +
      Math.cos(this.INC) * Math.sin(this.AOP + this.TA) * Math.cos(this.RAAN));
  var z = radius * (Math.sin(this.INC) * Math.sin(this.AOP + this.TA));

  var r = new math.matrix([x, y, z]);
  var l = math.norm(r);
  var long = Math.atan2(y, x) * degPerRad;
  var lat = Math.asin(z / l) * degPerRad;
  var height = l - 6378100;
  var res = new geo(long, lat, height);
  return res;
};

orbit.prototype.getGroundTrack = function(time) {
  var slice = Number($("#iNPLOT").val());
  dt = time / slice;
  var res;
  var result = new Array(slice);
  for (var i = 0; i < slice; ++i) {
    this.step(dt);
    res = this.toGEO();
    var x = new Array(2);
    //res[i].adjust();
    res.long -= i * dt * earthRot;
    res.adjust();
    x[0] = res.long;
    x[1] = res.lat;
    result[i] = x;
  }
  return result;
};

orbit.prototype.orbit3d = function(time) {
  var slice = Number($("#iNPLOT").val());
  dt = time / slice;
  //var m = 0;
  var res;
  var result = new Array(slice);
  for (var i = 0; i < slice; ++i) {
    this.step(dt);
    res = this.toGEO();
    var x = new Array(3);
    res.long -= i * dt * earthRot;
    res.adjust();
    x[0] = res.long;
    x[1] = res.lat;
    x[2] = res.height / 1000 / (6378.1 / 15);
    result[i] = x;
  }
  return result;
};

geo.prototype.adjust = function() {
  if (this.long > 180 || this.long < -180) {
    var theta = this.long * radPerDeg;
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    var res = Math.atan2(s, c);
    this.long = res * degPerRad;
  }
};

function processTLE(strTLE) {
  arr = strTLE.split(/\s+/);
  if (arr[0] != "2") {
    window.alert("请输入TLE第二行数据!");
  } else {
    var T = 86400 / Number(arr[7]);
    var a = Math.pow(mu * T * T / 4.0 / pi / pi, 1.0 / 3.0);
    $("#iSMA").val(a / 1000.0);
    $("#iECC").val("0." + arr[4]);
    $("#iINC").val(arr[2]);
    $("#iAOP").val(arr[5]);
    $("#iRAAN").val(arr[3]);
    var ecc = Number("0." + arr[4]);
    var ma = Number(arr[6]);
    var ta = MA2TA(ma * radPerDeg, ecc) * degPerRad;
    $("#iTA").val(ta);
  }
}
