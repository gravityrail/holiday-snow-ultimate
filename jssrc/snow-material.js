const vertexShader = `
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                * 43758.5453123);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float cloud(vec2 st) {
    float n = 0.0;
    for (float i = 1.0; i < 8.0; i ++) {
        float m = pow(2.0, i);
        n += snoise(st * m) * (1.0 / m);
    }
    return n * 0.5 + 0.5;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float v = cloud(st);
    gl_FragColor = vec4(vec3(v), 1.0);
}
`;

AFRAME.registerComponent('material-snow', {
	schema: {},// { color: { type: 'color', default: '#FFF' }, backgroundImage: { type: 'asset' } },

	/**
	 * Creates a new ShaderMaterial and assigns to a buffer geometry containing lots of snowflakes
	 */
	init: function () {
		const data = this.data;


		const uniforms = {
			// color:      { type: "c", value: new THREE.Color( data.color ) },
			// texture:    { type: "t", value: 0, texture: map },
			// globalTime:	{ type: "f", value: 0.0 },
		};

		this.material  = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader,
			// fragmentShader,
			blending: 		THREE.AdditiveBlending,
			depthTest: 		false,
			transparent:	true,
			// vertexColors:   true
		});

		// create particle geometry
		var geometry = new THREE.BufferGeometry();

		const numSnowflakes = 10000;

		const positions = [];
		const colors = [];
		const sizes = [];
		const times = [];

		for( var v = 0; v < numSnowflakes; v++ ) {
			var color = new THREE.Color( 0xffffff );
			color.setHSL(1.0, 0.0, 0.05 + Math.random()*0.9);
			colors.push( color.r, color.g, color.b );
			positions.push( Math.random()*10 - 5, Math.random()*10 - 5, Math.random()*10 - 5 );
			sizes.push( 0.1+Math.random() );
			times.push( Math.random() );
		}

		// console.log(positions);

		geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.addAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
		geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
		geometry.addAttribute('time', new THREE.Float32BufferAttribute(times, 1));

		var particles = new THREE.Points( geometry, this.material );
		particles.position.x = 0;
		particles.position.y = 5;
		particles.position.z = 0;

		console.log("adding particles");

		// this.el.sceneEl.object3D.background = new THREE.Color('#000');
		this.el.object3D.add( particles );

		// this.applyToMesh();
		// this.el.addEventListener('model-loaded', () => this.applyToMesh());
	},


	/**
	 * Update the ShaderMaterial when component data changes.
	 */
	// update: function () {

	// 	time = new Date().getTime();
	// 	delta = time - this.oldTime;
	// 	this.oldTime = time;

	// 	if (isNaN(delta) || delta > 1000 || delta == 0 ) {
	// 		delta = 1000/60;
	// 	}

	// 	this.uniforms.globalTime.value += delta * 0.00015;

	// 	// targetPosition.x += (mouseXpercent*250 - targetPosition.x)/20;
	// 	// targetPosition.y += (-mouseYpercent*300 - targetPosition.y)/20;
	// 	// camera.lookAt(targetPosition);

	// 	// this.material.uniforms.color.value.set(this.data.color);
	// },

	/**
	 * Apply the material to the current entity.
	 */
	// applyToMesh: function() {
	// 	const mesh = this.el.getObject3D('mesh');
	// 	if (mesh) {
	// 		mesh.material = this.material;
	// 	}
	// },

	/**
	 * On each frame, update the 'time' uniform in the shaders.
	 */
	// tick: function (t) {
	// 	// console.log("tick "+t);
	// 	this.material.uniforms.globalTime.value = t * 0.00015;
	// }

})