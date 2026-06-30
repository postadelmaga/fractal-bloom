# Fractal Bloom 🌀

Wallpaper plugin animato per **KDE Plasma 6** che genera frattali colorati in tempo
reale tramite shader GPU, oppure mostra un tuo **sfondo vettoriale SVG** nitido a
qualunque risoluzione.

Tutti gli effetti girano su GPU come singolo fragment shader (`ShaderEffect` Qt6 /
RHI), quindi sono fluidi e leggeri.

## Modalità

| Modalità | Descrizione |
|----------|-------------|
| **Julia (morphing)** | Insieme di Julia con la costante `c` che ruota nel piano complesso: forme che si trasformano di continuo, con zoom che "respira". |
| **Plasma fluido** | FBM con domain-warping annidato: flussi di colore morbidi e ipnotici. Molto leggero. |
| **Caleidoscopio** | Simmetria polare a 8 spicchi sul frattale di Kali, in lenta rotazione. |
| **Fractal flame** | Filamenti luminosi stile *apophysis* generati da una mappa IFS iterata, con bloom. |
| **Immagine SVG** | Carica un tuo file `.svg`/`.svgz` e lo renderizza come sfondo (PreserveAspectCrop). |

Per ogni frattale puoi regolare **palette colori** (5 preset), **velocità** e **zoom**
dalle impostazioni dello sfondo.

## Requisiti

- KDE Plasma 6 (testato su 6.7)
- Qt 6 con `qsb` (Qt Shader Baker) — pacchetto `qt6-shadertools`
- `kpackagetool6`

## Installazione

```bash
./build.sh
```

Lo script compila i 4 shader (`.frag` → `.frag.qsb`) e installa/aggiorna il pacchetto
in `~/.local/share/plasma/wallpapers/org.fra.fractal/`.

Poi: **clic destro sul desktop → Configura desktop e sfondo → Sfondo → Fractal Bloom**.

### Installazione manuale

```bash
# compila gli shader
for f in julia plasma kaleido flame; do
  /usr/lib/qt6/bin/qsb --glsl "100 es,120,150" --hlsl 50 --msl 12 \
    -o org.fra.fractal/contents/shaders/$f.frag.qsb \
       org.fra.fractal/contents/shaders/$f.frag
done
# installa
kpackagetool6 -t Plasma/Wallpaper --install org.fra.fractal
# aggiornamento: --upgrade al posto di --install
```

## Struttura

```
org.fra.fractal/
├── metadata.json                 # KPackageStructure: Plasma/Wallpaper
└── contents/
    ├── ui/
    │   ├── main.qml              # WallpaperItem: ShaderEffect + Image SVG
    │   └── config.qml            # UI impostazioni (modalità, palette, velocità, zoom, file SVG)
    ├── config/main.xml           # schema configurazione (KCfg)
    └── shaders/
        ├── julia.frag      (+ .qsb)
        ├── plasma.frag     (+ .qsb)
        ├── kaleido.frag    (+ .qsb)
        └── flame.frag      (+ .qsb)
```

Gli shader usano GLSL `#version 440` (Vulkan style) con UBO `std140` standard di
Qt Quick: `qt_Matrix, qt_Opacity, iTime, iResolution, iSpeed, iPalette, iZoom`.

## Aggiungere una palette o un frattale

- **Palette**: aggiungi un ramo alla funzione `palette()` (identica nei 4 shader) e una
  voce al `ComboBox` in `config.qml`.
- **Frattale**: crea un nuovo `contents/shaders/<nome>.frag`, aggiungilo a `build.sh` e
  all'array `shaderFiles` in `main.qml`, più una voce nel ComboBox modalità.

## Licenza

MIT
