#!/bin/bash
# Compila gli shader, pacchettizza e installa il wallpaper plugin Fractal Bloom.
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
PKG="$DIR/org.fra.fractal"
QSB="${QSB:-/usr/lib/qt6/bin/qsb}"
ID="org.fra.fractal"

echo "==> Compilo gli shader con qsb"
for f in julia plasma kaleido flame; do
    "$QSB" --glsl "100 es,120,150" --hlsl 50 --msl 12 \
        -o "$PKG/contents/shaders/$f.frag.qsb" "$PKG/contents/shaders/$f.frag"
    echo "    $f.frag.qsb"
done

echo "==> Installo / aggiorno il wallpaper"
SRC="$PKG"
# Se è disponibile zip, crea anche il .plasmoid distribuibile e installa quello.
if command -v zip >/dev/null 2>&1; then
    rm -f "$DIR/$ID.plasmoid"
    ( cd "$DIR" && zip -r -q "$ID.plasmoid" org.fra.fractal -x "*.git*" )
    SRC="$DIR/$ID.plasmoid"
    echo "    creato $ID.plasmoid"
fi

if kpackagetool6 -t Plasma/Wallpaper --list 2>/dev/null | grep -q "$ID"; then
    kpackagetool6 -t Plasma/Wallpaper --upgrade "$SRC"
else
    kpackagetool6 -t Plasma/Wallpaper --install "$SRC"
fi

echo "==> Fatto. Riavvia plasmashell o riapri Impostazioni sfondo per vederlo."
