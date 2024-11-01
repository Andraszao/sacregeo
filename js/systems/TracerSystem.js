export class TracerSystem {
    constructor(scene) {
        this.scene = scene;
        this.positions = [];
        this.maxPoints = 50;
        
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5
        });
        
        this.line = new THREE.Line(geometry, material);
        this.scene.add(this.line);
    }

    update(position) {
        this.positions.unshift(position.clone());
        if (this.positions.length > this.maxPoints) {
            this.positions.pop();
        }

        const points = new Float32Array(this.positions.length * 3);
        for (let i = 0; i < this.positions.length; i++) {
            const pos = this.positions[i];
            points[i * 3] = pos.x;
            points[i * 3 + 1] = pos.y;
            points[i * 3 + 2] = pos.z;
        }

        this.line.geometry.setAttribute('position', 
            new THREE.BufferAttribute(points, 3)
        );
        
        this.line.material.opacity = this.positions.length / this.maxPoints * 0.5;
    }

    dispose() {
        this.scene.remove(this.line);
        this.line.geometry.dispose();
        this.line.material.dispose();
    }
}
