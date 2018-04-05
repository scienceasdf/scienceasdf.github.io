var pi = 3.141592653589793;
var mu = 3.98600445e14;
var degPerRad = 180 / pi;
var radPerDeg = pi / 180;
var earthRot = 7.292e-5 * degPerRad;
var gravityConst = mu;

var orbit = function(a, e, i, omega, Omega, phi){
    this.SMA = a;
    this.ECC = e;
    this.INC = i;
    this.AOP = omega;
    this.RAAN = Omega; 
    this.TA = phi;
};

var RV = function(r,v){
    this.r = r;
    this.v = v;
};

var geo = function(long,lat){
    this.long = long;
    this.lat = lat;
};

function EA2TA(EA, ecc)
{
	var sp=Math.pow(1.0-ecc*ecc,0.5) * Math.sin(EA)/(1.0-ecc * Math.cos(EA));
	var cp=(Math.cos(EA)-ecc)/(1.0-ecc*Math.cos(EA));
	return Math.atan2(sp,cp);
}


function MA2TA(MA, ecc)
{

	if(ecc<1.0){
		//elliptic orbit case
		var E;
		if((MA<0.0 && MA>-pi)||(MA>pi))
			E=MA-ecc;
		else
			E=MA+ecc;

		var E_=MA;
		while(Math.abs(E-E_)>1e-8){
			E_=E;
			E=E+(MA-E+ecc*Math.sin(E))/(1-ecc*Math.cos(E));
		}

		return EA2TA(E,ecc);
	}
}


function TA2EA(TA, ecc)
{
    var se=Math.pow(1.0-ecc*ecc, 0.5)*Math.sin(TA)/(1.0+ecc*Math.cos(TA));
    var ce=(ecc+Math.cos(TA))/(1.0+ecc*Math.cos(TA));
    return Math.atan2(se,ce);
}


function EA2MA(EA, ecc)
{
    return EA-ecc*Math.sin(EA);
}

function TA2MA(TA,ecc)
{
    return EA2MA(TA2EA(TA,ecc),ecc);
}

/** \brief This extrapolates the trajectory after time t
 *
 * \t time expressed in seconds
 * \return void
 *  All the states are extrapolated after t seconds
 */
orbit.prototype.step = function (t)
{
    var MA=TA2MA(this.TA,this.ECC);
    var n=Math.pow(gravityConst / this.SMA / this.SMA / this.SMA,0.5);
    MA += n*t;
    this.TA=MA2TA(MA, this.ECC);
};

/** \brief This converts Keplerian state to Cartesian state
 *
 * \r position vector in inertial frame
 * \v velocity vector in inertial frame
 * \return void
 *  This returns the results by pointers r and v
 */
orbit.prototype.toCartesian = function ()
{
    var p=this.SMA*(1.0-this.ECC*this.ECC);
    var radius=p/(1+this.ECC*Math.cos(this.TA));
    var h=Math.pow(gravityConst/p,0.5);

    var x=radius*(Math.cos(this.AOP+this.TA)*Math.cos(this.RAAN)-Math.cos(this.INC)*Math.sin(this.AOP+this.TA)*Math.sin(this.RAAN));
    var y=radius*(Math.cos(this.AOP+this.TA)*Math.sin(this.RAAN)+Math.cos(this.INC)*Math.sin(this.AOP+this.TA)*Math.cos(this.RAAN));
    var z=radius*(Math.sin(this.INC)*Math.sin(this.AOP+this.TA));

    var r = new math.matrix([x,y,z]);

    var dotX=h*(Math.cos(this.TA)+this.ECC)*(-Math.sin(this.AOP)*Math.cos(this.RAAN)-Math.cos(this.INC)*Math.sin(this.RAAN)*Math.cos(this.AOP))-
            h*Math.sin(this.TA)*(Math.cos(this.AOP)*Math.cos(this.RAAN)-Math.cos(this.INC)*Math.sin(this.RAAN)*Math.sin(this.AOP));
    var dotY=h*(Math.cos(this.TA)+this.ECC)*(-Math.sin(this.AOP)*Math.sin(this.RAAN)+Math.cos(this.INC)*Math.cos(this.RAAN)*Math.cos(this.AOP))-
            h*Math.sin(this.TA)*(Math.cos(this.AOP)*Math.sin(this.RAAN)+Math.cos(this.INC)*Math.cos(this.RAAN)*Math.sin(this.AOP));
    var dotZ=h*(Math.cos(this.TA)+this.ECC)*(Math.sin(this.INC)*Math.cos(this.AOP))-
            h*Math.sin(this.TA)*Math.sin(this.INC)*Math.sin(this.AOP);

    var v = new math.matrix([dotX,dotY,dotZ]);
    var res = new RV(r,v);
    return res;
};

orbit.prototype.toGEO = function(){

    var p=this.SMA*(1.0-this.ECC*this.ECC);
    var radius=p/(1+this.ECC*Math.cos(this.TA));
    var h=Math.pow(gravityConst/p,0.5);

    var x=radius*(Math.cos(this.AOP+this.TA)*Math.cos(this.RAAN)-Math.cos(this.INC)*Math.sin(this.AOP+this.TA)*Math.sin(this.RAAN));
    var y=radius*(Math.cos(this.AOP+this.TA)*Math.sin(this.RAAN)+Math.cos(this.INC)*Math.sin(this.AOP+this.TA)*Math.cos(this.RAAN));
    var z=radius*(Math.sin(this.INC)*Math.sin(this.AOP+this.TA));

    var r = new math.matrix([x,y,z]);
    var l = math.norm(r);
    var long = Math.atan2(y,x) * degPerRad;
    var lat = Math.asin(z / l) * degPerRad;
    var res = new geo(long,lat); 
    return res;
};


orbit.prototype.getGroundTrack = function (time){
    dt = time / 6000.0;
    //var m = 0;
    var res = new Array(6000);
    var result = new Array(6000);
    for(var i = 0; i < 6000; ++i){
        this.step( dt);
        res[i] = this.toGEO();
        var x = new Array(2);
        res[i].long -= i * dt  * earthRot;
        //m = i * dt * earthRot;
        res[i].adjust();
        x[0] = res[i].long;
        x[1] = res[i].lat;
        result[i] = x;
    }
    //window.alert(m);
    return result;
};


geo.prototype.adjust = function (){
    this.lat = this.lat % 90.0;
    this.long = this.long % 180.0;
};



