#version 440
// Caleidoscopio — simmetria polare + frattale di Kali (abs(z)/dot(z,z) - c) che ruota.

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

    // simmetria caleidoscopica
    float r = length(uv);
    float ang = atan(uv.y, uv.x) + t * 0.05;
    const float SEG = 8.0;
    float wedge = 6.28318530718 / SEG;
    ang = mod(ang, wedge);
    ang = abs(ang - 0.5 * wedge);
    vec2 p = vec2(cos(ang), sin(ang)) * r * (2.0 / max(iZoom, 0.05));

    // frattale di Kali
    vec2 z = p;
    vec2 c = vec2(0.9 + 0.15 * sin(t * 0.23), 0.7 + 0.15 * cos(t * 0.19));
    float acc = 0.0;
    for (int i = 0; i < 8; i++){
        z = abs(z) / max(dot(z, z), 1e-4) - c;
        acc += exp(-2.3 * length(z));
    }

    vec3 col = palette(acc * 0.18 + r * 0.5 - t * 0.08, iPalette);
    col *= 0.35 + acc * 0.5;
    col += palette(r - t * 0.1, iPalette) * smoothstep(0.02, 0.0, abs(fract(r * 6.0 - t * 0.2) - 0.5)) * 0.15;

    col = aces(col * 1.05);                 // tone-mapping filmico sull'accumulo di glow
    col += (hash12(fc) - 0.5) / 255.0;      // dither anti-banding
    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0) * qt_Opacity;
}
