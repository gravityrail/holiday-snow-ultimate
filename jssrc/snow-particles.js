AFRAME.registerComponent('particles-snow', {
	schema: { sprite: { type: 'asset' } },
	init: function () {
		var snowSprite = new THREE.TextureLoader().load( this.data.sprite );
		var particleCount = 2000;
		var pMaterial = new THREE.PointsMaterial({
			color: 0xFFFFFF,
			size: 0.5,
			map: snowSprite,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});

		this.particles = new THREE.Geometry;

		for (var i = 0; i < particleCount; i++) {
			var pX = Math.random()*100 - 50,
			pY = Math.random()*100,
			pZ = Math.random()*100 - 50,
			particle = new THREE.Vector3(pX, pY, pZ);
			particle.velocity = {};
			particle.velocity.y = -0.001;
			this.particles.vertices.push(particle);
		}

		var particleSystem = new THREE.Points(this.particles, pMaterial);
		particleSystem.position.y = 0;
		// scene.add(particleSystem);


		// this.el.setObject3D( 'mesh', particleSystem );
		this.el.object3D.add( particleSystem );
		// simulateRain();
	},

	tick: function (t) {
		var pCount = this.particles.vertices.length;
		while (pCount--) {
			var particle = this.particles.vertices[pCount];
			if (particle.y < -0) {
				particle.y = 100;
				particle.velocity.y = -0.001;
			}

			particle.velocity.y -= Math.random() * .001;

			particle.y += particle.velocity.y;
		}

		this.particles.verticesNeedUpdate = true;
	}
});

