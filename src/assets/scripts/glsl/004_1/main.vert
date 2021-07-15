attribute vec3 position;
attribute vec4 color;

uniform vec2 mouse;
uniform vec2 rotation;

varying vec4 vColor;

void main(){
    // varying 変数は、頂点カラーにマウスの影響を与えてから送る
    
    vColor = color - vec4(mouse[0] * 0.2, mouse[1] * 0.2, mouse[0] * 0.2, 0.0);
    gl_Position = vec4(position, 1.0);
}

