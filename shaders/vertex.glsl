varying vec2 vUv;
uniform float uTime;

void main() {
    vUv = uv;

    vUv.x = sin(vUv.y + uTime) * vUv.x;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}