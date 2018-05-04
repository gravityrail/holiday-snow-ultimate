// credit should go to https://www.shadertoy.com/view/ldj3zd for this awesome terrian shader
const vertexShader = `
	uniform vec3      iResolution;           // viewport resolution (in pixels)
	uniform float     iTime;                 // shader playback time (in seconds)
	uniform float     iTimeDelta;            // render time (in seconds)
	uniform int       iFrame;                // shader playback frame
	uniform float     iChannelTime[4];       // channel playback time (in seconds)
	uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
	uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
	uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
	uniform vec4      iDate;                 // (year, month, day, time in seconds)

	precision highp float;

	#define LACU 2.0
	#define MAXGRASSSTEEP 0.5
	#define MAXGRASSALTITUDE .8
	#define MAXSNOWSTEEP   0.35
	#define MAXSNOWALTITUDE 0.8
	#define NORMALEPSILON 0.002
	#define SEALEVEL 0.3 //std 0.3
	#define CAMERAALTITUDE 1.3 //std 1.0
	#define CAMERASCREENDISTANCE 0.5 //std 0.4
	#define LOWITER 5
	#define HIGHITER 9
	#define COLORITER 7


	// fractional brownian motion
	// iter is number of octaves

	vec3 fbmDerivative(vec2 p, int iter) {

		float f = 0.0;
		float dfx = 0.0;
		float dfy = 0.0;
		float fLacunarity = LACU;

		float amplitude = 0.5;
		float sumAmplitude = 0.0;

		for (int i=0;i<20;i++) {
			vec3 value = noised( p );

			f += amplitude * value.x;
			dfx +=  value.y;
			dfy +=  value.z;
			p = p * fLacunarity;
			sumAmplitude+=amplitude;
			amplitude/=2.0;
			if (i>iter) {break;}
		}
		f/=sumAmplitude;

		return vec3( conv(f), dfx, dfy);
	}

	// same as above, without derivatives
	float fbm(vec2 p, int iter){
		int idx=0;
		float f = 0.0;
		float amplitude = 0.5;
		float sumAmplitude = 0.0;
		for (int i=0;i<20;i++) {
			float value = noise( p );
			f += amplitude * value;
			p = p * LACU;
			sumAmplitude+=amplitude;
			amplitude/=2.0;
			if ( i>iter ) {break;}
		}
		f/=sumAmplitude;
		return conv(f);
	}

	vec3 getNormal( vec3 p, int iter ) {
		//using noise derivative
		//not sure this code is correct
		vec3 value;
		value = fbmDerivative( p.xz, iter);
		if (value.x <= SEALEVEL) { return vec3(.0,1.0,.0); } //sea is flat
		float dfx=value.y;
		float dfz=value.z;

		return normalize(vec3( -value.y, 1.0, -value.z));
	}

	vec3 getNormal( vec3 p ) {
		//noise derivative
		vec3 value;
		value = fbmDerivative( p.xz, HIGHITER);
		if (value.x <= SEALEVEL) { return vec3(.0,1.0,.0); }
		float dfx=value.y;
		float dfz=value.z;
		//float vy = 1.0 ;	vy -= dfx*dfx + dfz*dfz;vy=sqrt(vy);

		return normalize(vec3( -value.y, 1.0, -value.z));
	}

	// #####################################################################
	vec3 GenerateTerrainColor(vec3 position, vec3 normal) {
		float x = position.x;
		float y = position.z;
		float z = position.y;
		float n = getNormal(position,COLORITER).y;
		float l = 1.0;
		vec3 terrainColor;
		vec3 cmin,cmax;

		//palette
		vec3 ocean      = vec3( 0.2, .300, .8);
		vec3 shore      = vec3( 0.3, .400,1.0);
		vec3 beach      = vec3( 1.0, .894, .710);
		vec3 earth      = vec3(.824, .706, .549);
		vec3 calcaire   = vec3(.624, .412, .118);
		vec3 rocks      = vec3(.412, .388, .422);

		vec3 grass1 = vec3 (.19, .335, .14);
		vec3 grass2 = vec3 (.478, .451, .14);

		vec3 snow1 = vec3 ( .78,.78,.78);
		vec3 snow2 = vec3 ( .9,.9,.9);

		if ( z <= SEALEVEL) {
			//water
			//terrainColor = mix (ocean, shore , smoothstep( 0.0, 1.0,  noise( position.xz * position.xz)) );
			terrainColor=shore;
			return terrainColor;
		}


		// add some noise
		// input noise divisor define size of stains in transition areas
		// multiplicator define the size of the range of altitude with mixed color
		z += noise( position.xz * 47.0 )* 0.2;


		// base color
		terrainColor = mix (        beach,    earth, smoothstep(0.0 , 0.08 , z) );
		terrainColor = mix ( terrainColor, calcaire, smoothstep(0.08, 0.3 , z) );
		terrainColor = mix ( terrainColor,    rocks, smoothstep(0.3, 1.0  , z) );

		//add grass
		if (( n > MAXGRASSSTEEP ) && ( z <  MAXGRASSALTITUDE )) {
			terrainColor = mix( grass1, grass2, smoothstep(0.0 , 1.0, noise( position.xz * 5.0 )));
		}
		// add snow
		if (( n > MAXSNOWSTEEP) && ( z > MAXSNOWALTITUDE )) {
			return mix( snow1, snow2, smoothstep(0.0 , 1.0, noise( position.xz * 131.0 )));
		}
		return vec3(terrainColor);
	}

	main() {
		n = getNormal( p );
		gl_FragColor = GenerateTerrainColor( position, n );
	}
`;

AFRAME.registerComponent('material-snowy-mountain', {
	schema: {},
	init: function () {
		this.material  = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader,
			fragmentShader,
			blending: 		THREE.AdditiveBlending,
			depthTest: 		false,
			transparent:	true,
			// vertexColors:   true
		});
	}
});