#version 440
// Julia set morphing — la costante c percorre un cerchio nel piano complesso,
// con lenta rotazione e "respiro" dello zoom. Colorazione smooth + glow + dither.

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
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

void main(){
    vec2 res = iResolution;
    float t = iTime * iSpeed;
    vec2 fc = vec2(qt_TexCoord0.x, 1.0 - qt_TexCoord0.y) * res;
    vec2 uv = (fc - 0.5 * res) / res.y;

    float zoom = 1.6 * (0.85 + 0.15 * sin(t * 0.12)) / max(iZoom, 0.05);
    float a = t * 0.04;
    mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
    vec2 z = R * uv * zoom;

    vec2 c = 0.7885 * vec2(cos(t * 0.13), sin(t * 0.13 * 1.31));

    float trap = 1e9;
    float dz = 1.0;          // derivata per stima distanza (anti-alias del bordo)
    int iter = 0;
    const int MAX = 128;
    for (int i = 0; i < MAX; i++){
        dz = 2.0 * length(z) * dz + 1.0;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        trap = min(trap, dot(z, z));
        iter = i;
        if (dot(z, z) > 256.0) break;
    }

    vec3 col;
    float r2 = dot(z, z);
    if (r2 > 256.0){
        float sn = float(iter) - log2(0.5 * log2(r2)) + 4.0;
        col = palette(sn * 0.022 + t * 0.02, iPalette);
        // distance estimate -> glow morbido e bordo anti-aliasato
        float d = 0.5 * sqrt(r2 / max(dz * dz, 1e-6)) * log(r2);
        col += palette(sn * 0.022 + t * 0.02 + 0.5, iPalette) * exp(-d * 14.0) * 0.6;
        col *= 0.65 + 0.45 * cos(sn * 0.30);
    } else {
        // interno: tinta dall'orbit trap, non più nero piatto
        float tr = sqrt(trap);
        col = palette(tr * 0.9 + t * 0.05, iPalette) * (0.08 + 0.30 * tr);
    }

    col += (hash12(fc) - 0.5) / 255.0;     // dither anti-banding
    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0) * qt_Opacity;
}
