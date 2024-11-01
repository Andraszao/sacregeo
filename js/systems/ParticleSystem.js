export class ParticleSystem {
    constructor(scene, color, count = 1000) {
        this.scene = scene;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        this.velocities = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = Math.random() * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
            
            this.velocities[i3] = (Math.random() - 0.5) * 0.1;
            this.velocities[i3 + 1] = Math.random() * 0.1;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
        }

        geometry.setAttribute('position', 
            new THREE.BufferAttribute(positions, 3)
        );
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    update(time) {
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += this.velocities[i];
            positions[i + 1] += this.velocities[i + 1];
            positions[i + 2] += this.velocities[i + 2];
            
            if (Math.abs(positions[i]) > 10) {
                positions[i] = (Math.random() - 0.5) * 20;
                this.velocities[i] = (Math.random() - 0.5) * 0.1;
            }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }

    dispose() {
        this.scene.remove(this.particles);
        this.particles.geometry.dispose();
        this.particles.material.dispose();
    }

    setColor(color) {
        this.particles.material.color.set(color);
    }
}
