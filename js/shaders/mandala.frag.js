export const mandalaFragmentShader = `
    varying vec2 vUv;
    uniform float time;
    uniform vec3 color;
    
    #define PI 3.14159265359
    
    float mandala(vec2 uv, float t) {
        vec2 pos = uv * 2.0 - 1.0;
        float r = length(pos);
        float angle = atan(pos.y, pos.x);
        
        float sides = floor(mix(3.0, 12.0, 0.5 + sin(t * 0.2) * 0.5));
        float pattern = sin(angle * sides + t) * 0.5 + 0.5;
        pattern *= sin(r * 10.0 + t) * 0.5 + 0.5;
        pattern *= smoothstep(1.0, 0.8, r);
        
        return pattern;
    }
    
    void main() {
        float pattern = mandala(vUv, time);
        vec3 finalColor = color * pattern;
        gl_FragColor = vec4(finalColor, pattern * 0.7);
    }
`;
