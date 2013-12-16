// PAGE JS TEST //

//function jsTest() {
//	document.getElementById("jsTest").innerHTML = "<span style='color:green'>is</span>";
//}


// VARIABLES //

var swp = {					// short for "Sine Wave Properties": the display variables (units: px)
	anchorX: 50,			// x value for top left of sample
	anchorY: 150,			// y value for median point of surface
	l: 500,					// length of the sample
	l0: 500,				// initial length of the sample
	h: 3,					// thickness of the film
	wl: 70,					// wavelength
	amp: 10,				// amplitude
	subThick: 60			// substrate thickness
}

var wp = {					// short for "Wrinkle Properties" (SI units)
	wl: 1,					// wavelength
	amp: 1,					// amplitude
}

var scaleFactor = Math.pow(10,7.55);

var mp = {						// short for "Material Properties": the physical variables (SI units)
	Es: 2.13*Math.pow(10,6),	// Plane strain modulus, Pascals
	Ef: 72*Math.pow(10,7),		// Plane strain modulus, Pascals
	hf: 10*Math.pow(10,-9),		// meters
	strain: 0.1,				// MUST BE CALCULATED BEFORE AMPLITUDE EVERY TIME
	critStrain: 0.2,			// MUST BE CALCULATED BEFORE AMPLITUDE EVERY TIME
}

coOrds = {				// mouse co-ordinates
	x: 0,
	y: 0
};

// DISPLAYING SLIDER BARS [at correct values!] & DATA COLLECTION (jQuery) //

$(function() {
    $( "#slider-range-min" ).slider({
      	range: "min",
      	value: 10,
      	min: 2,
      	max: 100,
    	slide: function( event, ui ) {
    		$( "#thickness" ).val( ui.value + "nm" );
    		mp.hf = $( "#slider-range-min" ).slider( "value" )*Math.pow(10,-9);
    		swp.h = 2+$( "#slider-range-min" ).slider( "value" )*0.05;
    	}
    });
    $( "#thickness" ).val($( "#slider-range-min" ).slider( "value" ) + "nm" );
 });

$(function() {
    $( "#slider-range-min2" ).slider({
      	range: "min",
      	step: 0.01,
      	value: 2.13,
      	min: 0.1,
      	max: 10,
    	slide: function( event, ui ) {
    		$( "#Es" ).val( ui.value + "MPa" );
    		mp.Es = $( "#slider-range-min2" ).slider( "value" )*Math.pow(10,6);
    	}
    });
    $( "#Es" ).val($( "#slider-range-min2" ).slider( "value" ) + "MPa");
});

$(function() {
    $( "#slider-range-min3" ).slider({
      	range: "min",
      	value: 1000,
      	min: 50,
      	max: 5000,
    	slide: function( event, ui ) {
    		$( "#Ef" ).val( ui.value + "MPa" );
    		mp.Ef = $( "#slider-range-min3" ).slider( "value" )*Math.pow(10,6);
    	}
    });
    $( "#Ef" ).val($( "#slider-range-min3" ).slider( "value" ) + "MPa");
});

// WRINKLE CALCULATION ALGORITHM //

function recalculate() {
	swp.l = coOrds.x-swp.anchorX;
	mp.strain = strainCalc();
	mp.critStrain = critStrainCalc();
	wp.amp = ampCalc();
	wp.wl = wlCalc();
	swp.amp = wp.amp*scaleFactor;
	swp.wl = wp.wl*scaleFactor;
};

// WRINKLE CALCULATION EQUATIONS //

function wlCalc() {
	wl = 2*Math.PI*mp.hf*Math.pow((mp.Ef/(3*mp.Es)),(2/3));
	return wl;
}

function ampCalc() {
	if (mp.strain<=mp.critStrain) {
		amp = 0;
	}
	else {
		amp = mp.hf*Math.pow((mp.strain/mp.critStrain-1),0.5);
	}
	return amp;
}

function critStrainCalc() {
	critStrain = 0.25*Math.pow(3*mp.Es/mp.Ef,(2/3))
	return critStrain;
}

function strainCalc() {
	strain = Math.round(100*(1-swp.l/swp.l0))/100;
	if (strain<0) {strain = 0;}
	if (strain>1) {strain = 1;}
	return(strain);
}

// MOUSE CO-ORDINATES (jQuery) //

$(document).ready(function(){
	$(document).mousemove(function(event){ 
		if ((event.pageX<551)&&(event.pageY<251)) {
			coOrds = {
				x: event.pageX,
				y: event.pageY,
			}
		}
		$("#xySpan").text("X: " + coOrds.x + ", Y: " + coOrds.y); 
	});
});

// RENDERING //

function canvasStartup() {
	document.getElementById("canvasHolder").innerHTML = '<canvas id="myCanvas" width=600 height=260>You run IE 8 or earlier? Come on... just... COME ON</canvas>'
	canvasEngine();
}

function canvasEngine() {
	c = document.getElementById("myCanvas");
	ctx = c.getContext("2d");
	ctx.fillStyle = "#D4D4D4";
	ctx.strokeStyle = "#949494";
	updateFrame();
}

function updateFrame() {
	recalculate();		// recalculate sine wave properties and image properties
	redraw();			// draw new frame
	setTimeout(function(){updateFrame()},30);
}

function redraw() {
	ctx.clearRect(0, 0, c.width, c.height);		// careful!
	drawSineWave();
	drawText();
}

function drawSineWave() {
	ctx.beginPath();
	ctx.moveTo(swp.anchorX, sinCalc(swp.anchorX));
	for (var x=swp.anchorX+1; x<swp.anchorX+swp.l; x++) {
		y = sinCalc(x);
		dy = swp.anchorY-y;
		ctx.lineTo(x,y);
		ctx.fillRect(x, y, 1, swp.subThick+dy);
	}
	ctx.lineWidth = swp.h;
	ctx.stroke();
}

function sinCalc(x) {
	y = swp.anchorY+swp.amp*Math.sin(x*2*Math.PI/swp.wl);
	return y;
}

function drawText() {
	ctx.font = "18px Helvetica";
	ctx.fillText("Compressive Strain: " + Math.round(mp.strain*10000)/100 + "%", 360, 50);
	ctx.fillText("Period: " + Math.round(wp.wl*1000000000) + "nm", 50, 50);
	ctx.fillText("Amplitude: " + Math.round(wp.amp*10000000000) + "nm", 200, 50);
}

//window.onload = (jsTest);
