import { mandalaVertexShader } from '../shaders/mandala.vert.js';
import { mandalaFragmentShader } from '../shaders/mandala.frag.js';

export class CeremonyController {
    constructor(scene) {
        this.scene = scene;
        this.dancePatterns = [
            this.circularDance.bind(this),
            this.spiralDance.bind(this),
            this.wavelikeDance.bind(this),
            this.mandalaFormation.bind(this)
        ];
        this.currentPattern = 0;
        this.patternTime = 0;
        
        const mandalaGeometry = new THREE.PlaneGeometry(20, 20);
        const mandalaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xffffff) }
            },
            vertexShader: mandalaVertexShader,
            fragmentShader: mandalaFragmentShader,
            transparent: true,
            depthWrite: false
        });
        
        this.mandala = new THREE.Mesh(mandalaGeometry, mandalaMaterial);
        this.mandala.position.y = 0.1;
        this.mandala.rotation.x = -Math.PI / 2;
    }

    circularDance(npc, index, time, totalNPCs) {
        const angle = this.patternTime * 2 + index * Math.PI * 2 / totalNPCs;
        const radius = 6 + Math.sin(time * 2) * 2;
        npc.position.x = Math.cos(angle) * radius;
        npc.position.z = Math.sin(angle) * radius;
        npc.position.y = 1 + Math.sin(time * 4 + index) * 0.5;
    }

    spiralDance(npc, index, time, totalNPCs) {
        const spiralAngle = this.patternTime * 3 + index * Math.PI * 2 / totalNPCs;
        const radius = (index / totalNPCs) * 8 + 3;
        npc.position.x = Math.cos(spiralAngle) * radius;
        npc.position.z = Math.sin(spiralAngle) * radius;
        npc.position.y = 1 + Math.cos(time * 2 + index) * 0.5;
    }

    wavelikeDance(npc, index, time, totalNPCs) {
        const baseAngle = index * Math.PI * 2 / totalNPCs;
        const radius = 6;
        npc.position.x = Math.cos(baseAngle) * radius;
        npc.position.z = Math.sin(baseAngle) * radius;
        npc.position.y = 1 + Math.sin(time * 3 + baseAngle * 2) * 2;
    }

    mandalaFormation(npc, index, time, totalNPCs) {
        const angle = index * Math.PI * 2 / totalNPCs;
        const radius = 6 + Math.sin(time * 4) * 0.5;
        npc.position.x = Math.cos(angle) * radius;
        npc.position.z = Math.sin(angle) * radius;
        npc.position.y = 1;
        npc.rotation.z = angle + time * 2;
    }

    update(time, delta, npcs) {
        this.patternTime += delta;
        if (this.patternTime > 3) {
            this.currentPattern = (this.currentPattern + 1) % this.dancePatterns.length;
            this.patternTime = 0;
        }

        npcs.forEach((npc, index) => {
            this.dancePatterns[this.currentPattern](npc,