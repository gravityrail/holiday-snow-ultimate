/**
 * Register aframe shaders etc.
 */

// material-grid-glitch.js

const vertexShader = `
	attribute float size;
	attribute float time;
	attribute vec3 customColor;
	uniform float globalTime;

	varying vec3 vColor;
	varying float fAlpha;

	void main() {

		vColor = customColor;

		vec3 pos = position;

		// time
		float localTime = time + globalTime;
		float modTime = mod( localTime, 1.0 );
		float accTime = modTime * modTime;

		pos.x += cos(modTime*8.0 + (position.z))*1.0;
		pos.z += sin(modTime*6.0 + (position.x))*1.2;

		fAlpha = 1.0; //(pos.z)/1.0;

		vec3 animated = vec3( pos.x, pos.y * accTime, pos.z );

		vec4 mvPosition = modelViewMatrix * vec4( animated, 1.0 );

		gl_PointSize = min(0.1, size * ( 0.1 / length( mvPosition.xyz ) ) );

		gl_Position = projectionMatrix * mvPosition;

	}
`;

const fragmentShader = `
	uniform vec3 color;
	uniform sampler2D texture;

	varying vec3 vColor;
	varying float fAlpha;

	void main() {

		gl_FragColor = vec4( color * vColor, fAlpha );
		gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );

	}
`;

AFRAME.registerComponent('material-snow', {
	schema: { color: { type: 'color', default: '#FFF' }, backgroundImage: { type: 'asset' } },

	/**
	 * Creates a new ShaderMaterial and assigns to a buffer geometry containing lots of snowflakes
	 */
	init: function () {
		const data = this.data;

		var map = new THREE.TextureLoader().load( this.data['background-image'] );

		const uniforms = {
			color:      { type: "c", value: new THREE.Color( data.color ) },
			texture:    { type: "t", value: 0, texture: map },
			globalTime:	{ type: "f", value: 0.0 },
		};

		this.material  = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader,
			fragmentShader,
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
	tick: function (t) {
		// console.log("tick "+t);
		this.material.uniforms.globalTime.value = t * 0.00015;
	}

})