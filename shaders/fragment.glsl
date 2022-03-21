precision mediump float;

varying vec2 vUv;
uniform float uTime;

void main() {

        vec2 uv = vUv;

        vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
        
        gl_FragColor = color;
}