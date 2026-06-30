#version 440
// Plasma domain-warp — FBM annidato (warp di warp) per un flusso fluido di colori.

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    float iTime;
    vec2 iResolution;
    float iSpeed;
    float iPalette;
    float iZoom;
};

vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d){ return a + b * cos(6.28318530718 * (c * t + d)); }
vec3 palette(float t, float idx){
    int i = int(idx + 0.5);
    if (i == 0) return pal(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.00, 0.33, 0.67));
    if (i == 1) return pal(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.30, 0.20, 0.20));
    if (i == 2) return pal(t, vec3(0.5), vec3(0.5), vec3(1.0, 1.0, 0.5), vec3(0.80, 0.90, 0.30));
    if (i == 3) return pal(t, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.50, 0.20, 0.25));
    return pal(t, vec3(0.20, 0.50, 0.80), vec3(0.60, 0.30, 0.50), vec3(1.0), vec3(0.00, 0.20, 0.50));
}

float hash21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p){
    float s = 0.0, a = 0.55; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = m * p; a *= 0.5; }
    return s;
}

void main(){
    vec2 res = iResolution;
    float t = iTime * iSpeed * 0.3;
    vec2 fc = vec2(qt_TexCoord0.x, 1.0 - qt_TexCoord0.y) * res;
    vec2 p = (fc - 0.5 * res) / res.y * (3.0 / max(iZoom, 0.05));

    vec2 q = vec2(fbm(p + vec2(0.0, t * 0.4)), fbm(p + vec2(5.2, 1.3) - t * 0.3));
    vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.5),
                  fbm(p + 4.0 * q + vec2(8.3, 2.8) - t * 0.4));
    float f = fbm(p + 4.0 * r);

    vec3 col = palette(f + t * 0.2, iPalette);
    col = mix(col, palette(length(q), iPalette + 1.0), clamp(r.x, 0.0, 1.0));
    col = mix(col, vec3(dot(col, vec3(0.333))), -0.4);   // pump saturation
    col *= 0.55 + 0.65 * f;

    col = pow(clamp(col, 0.0, 1.0), vec3(0.85));
    fragColor = vec4(col, 1.0) * qt_Opacity;
}
