#version 440
// Fractal flame — filamenti luminosi colorati da una mappa IFS iterata (Kali variant),
// con accumulo di "glow" per iterazione per simulare le fiamme apophysis.

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
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

void main(){
    vec2 res = iResolution;
    float t = iTime * iSpeed;
    vec2 fc = vec2(qt_TexCoord0.x, 1.0 - qt_TexCoord0.y) * res;
    vec2 uv = (fc - 0.5 * res) / res.y;

    float a = t * 0.07;
    mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
    vec2 z = R * uv * (1.5 / max(iZoom, 0.05));

    vec2 c = vec2(0.7 + 0.12 * sin(t * 0.21), 0.5 + 0.12 * cos(t * 0.17));
    vec3 col = vec3(0.0);
    for (int i = 0; i < 16; i++){
        z = abs(z) / max(dot(z, z), 1e-4) - c;
        float g = exp(-2.6 * abs(length(z) - 0.72));    // filamento luminoso
        col += palette(float(i) * 0.07 + t * 0.05, iPalette) * g;
    }
    col *= 0.22;

    // bloom morbido + vignetta
    col += col * col * 0.6;
    col *= 1.0 - 0.35 * dot(uv, uv);

    col = aces(col * 1.1);                  // tone-mapping filmico: highlight ricchi, niente clipping piatto
    col += (hash12(fc) - 0.5) / 255.0;      // dither anti-banding
    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0) * qt_Opacity;
}
