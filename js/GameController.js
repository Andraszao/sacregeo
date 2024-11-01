import { getColor } from './utils/colors.js';
import { TracerSystem } from './systems/TracerSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { CeremonyController } from './systems/CeremonyController.js';

export class GameController {
    constructor() {
        this.setupScene();
        this.setupState();
        this.setupSystems();
        this.setupControls();
        this.bindEvents();
        
        // Start the game loop
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000008, 0.02);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    setupState() {
        this.state = {
            currentSides: 3,          // Start as triangle
            experience: 0,            // Current XP
            isEvolving: false,        // Evolution state flag
            level: 1,                 // Current level
            maxLevel: 4,              // Max level (hexagon)
            experienceRate: 10,       // XP gain rate
            experienceThreshold: 100  // XP needed to evolve
        };
    }

    setupSystems() {
        this.tracer = new TracerSystem(this.scene);
        this.particles = new ParticleSystem(this.scene, getColor(this.state.currentSides));
        this.ceremony = new CeremonyController(this.scene);
        this.clock = new THREE.Clock();
        this.velocity = new THREE.Vector3();
    }

    setupControls() {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    createShape(sides, size = 1) {
        const geometry = new THREE.CircleGeometry(size, sides);
        const material = new THREE.MeshPhongMaterial({
            color: getColor(sides),
            shininess: 100,
            emissive: getColor(sides),
            emissiveIntensity: 0.2
        });
        return new THREE.Mesh(geometry, material);
    }

    createPlatform(sides) {
        const geometry = new THREE.CircleGeometry(10, sides);
        const material = new THREE.MeshPhongMaterial({
            color: getColor(sides),
            transparent: true,
            opacity: 0.8
        });
        const platform = new THREE.Mesh(geometry, material);
        platform.rotation.x = -Math.PI / 2;
        return platform;
    }

    initLevel() {
        // Clear existing level
        while(this.scene.children.length > 0) {
            const obj = this.scene.children[0];
            this.scene.remove(obj);
        }
        this.npcs = [];

        // Create new platform
        this.platform = this.createPlatform(this.state.currentSides);
        this.scene.add(this.platform);

        // Create player
        this.player = this.createShape(this.state.currentSides);
        this.player.position.y = 1;
        this.scene.add(this.player);

        // Create NPCs
        const npcCount = 8;
        for(let i = 0; i < npcCount; i++) {
            const npc = this.createShape(this.state.currentSides, 0.8);
            const angle = (i / npcCount) * Math.PI * 2;
            const radius = 6;
            npc.position.set(
                Math.cos(angle) * radius,
                1,
                Math.sin(angle) * radius
            );
            this.scene.add(npc);
            this.npcs.push(npc);
        }

        // Add lights
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 10, 10);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
    }

    async evolve() {
        if (this.state.isEvolving) return;
        
        this.state.isEvolving = true;
        
        // Start evolution ceremony
        this.ceremony.startCeremony();
        
        // Float up animation
        const startY = this.player.position.y;
        const targetY = startY + 3;
        
        await this.animateFloat(startY, targetY);
        await this.ceremonyDance();
        await this.animateFall(targetY);

        // Progress to next form
        this.state.currentSides++;
        if (this.state.currentSides > 6) {
            this.state.currentSides = 3;
        }
        
        this.state.level = this.state.currentSides - 2;
        this.state.experience = 0;
        this.updateExperienceBar();
        
        // Initialize new level
        this.ceremony.endCeremony();
        this.initLevel();
        this.state.isEvolving = false;
    }

    async animateFloat(startY, targetY) {
        return new Promise(resolve => {
            const duration = 1000;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    const progress = elapsed / duration;
                    this.player.position.y = startY + (targetY - startY) * progress;
                    this.player.rotation.z += 0.1;
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    async ceremonyDance() {
        return new Promise(resolve => {
            setTimeout(resolve, 5000); // 5 second ceremony
        });
    }

    async animateFall(startY) {
        return new Promise(resolve => {
            const duration = 2000;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    const progress = elapsed / duration;
                    this.player.position.y = startY - (startY + 20) * progress;
                    this.camera.position.y = 15 - 5 * progress;
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    updateExperienceBar() {
        const fill = document.getElementById('experience-fill');
        fill.style.width = `${(this.state.experience / this.state.experienceThreshold) * 100}%`;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w') this.keys.up = true;
            if (e.key === 'ArrowDown' || e.key === 's') this.keys.down = true;
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w') this.keys.up = false;
            if (e.key === 'ArrowDown' || e.key === 's') this.keys.down = false;
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    update() {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        if (!this.state.isEvolving) {
            // Player movement
            if (this.keys.up) this.velocity.z -= 0.01;
            if (this.keys.down) this.velocity.z += 0.01;
            if (this.keys.left) this.velocity.x -= 0.01;
            if (this.keys.right) this.velocity.x += 0.01;

            this.velocity.multiplyScalar(0.95);
            this.player.position.add(this.velocity);

            // Platform boundary
            const dist = Math.sqrt(this.player.position.x ** 2 + this.player.position.z ** 2);
            if (dist > 9) {
                const angle = Math.atan2(this.player.position.z, this.player.position.x);
                this.player.position.x = Math.cos(angle) * 9;
                this.player.position.z = Math.sin(angle) * 9;
            }

            // Update tracers
            this.tracer.update(this.player.position);

            // Gain experience while moving
            if (Math.abs(this.velocity.x) > 0.001 || Math.abs(this.velocity.z) > 0.001) {
                this.state.experience += delta * this.state.experienceRate;
                this.updateExperienceBar();
                
                if (this.state.experience >= this.state.experienceThreshold) {
                    this.evolve();
                }
            }

            // Rotate player based on movement
            if (this.velocity.length() > 0.001) {
                this.player.rotation.z = Math.atan2(this.velocity.z, this.velocity.x);
            }
        } else {
            // Update ceremony
            this.ceremony.update(time, delta, this.npcs);
        }

        // Always update particles
        this.particles.update(time);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}
