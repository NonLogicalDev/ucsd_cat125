uniform vec2 iGlobalTime;
uniform vec2 iResolution;

uniform vec2 center;

void main() {
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
	gl_FragColor = vec4(uv,0.5+0.5*sin(iGlobalTime),1.0);
}
