import QtQuick
import org.kde.plasma.plasmoid

WallpaperItem {
    id: root

    readonly property int mode: root.configuration.Mode
    readonly property var shaderFiles: [
        "../shaders/julia.frag.qsb",
        "../shaders/plasma.frag.qsb",
        "../shaders/kaleido.frag.qsb",
        "../shaders/flame.frag.qsb"
    ]
    // Qualità -> scala di rendering interno. 0=Alta(1.0) 1=Media(0.75) 2=Bassa(0.5)
    readonly property real renderScale: [1.0, 0.75, 0.5][Math.min(root.configuration.Quality, 2)]
    // Animo solo se siamo in una modalità frattale e il wallpaper è sullo schermo corrente.
    // (Non lego al focus dell'app: il desktop di rado ha il focus e l'animazione si bloccherebbe.)
    readonly property bool animating: root.mode < 4 && root.visible

    // tempo in secondi; ~30fps. Fermo in modalità SVG (sfondo statico).
    property real iTime: 0
    Timer {
        interval: 33
        running: root.animating
        repeat: true
        onTriggered: root.iTime += 0.033
    }

    // sfondo di base (visibile sotto eventuali SVG con trasparenza)
    Rectangle {
        anchors.fill: parent
        color: "black"
    }

    // --- Frattali generati (modalità 0..3) ---
    // Render in un FBO a risoluzione ridotta (layer.textureSize) e upscale bilineare:
    // dimezzando la scala il numero di invocazioni del fragment shader cala ~4x.
    ShaderEffect {
        id: fx
        anchors.fill: parent
        visible: root.mode < 4
        blending: false

        readonly property int rw: Math.max(1, Math.round(width * root.renderScale))
        readonly property int rh: Math.max(1, Math.round(height * root.renderScale))
        layer.enabled: root.renderScale < 0.999
        layer.textureSize: Qt.size(rw, rh)
        layer.smooth: true

        property real iTime: root.iTime
        property size iResolution: Qt.size(fx.rw, fx.rh)
        property real iSpeed: root.configuration.Speed
        property real iPalette: root.configuration.Palette
        property real iZoom: root.configuration.Zoom
        fragmentShader: Qt.resolvedUrl(root.shaderFiles[Math.min(root.mode, 3)])
    }

    // --- Sfondo vettoriale SVG (modalità 4) ---
    Image {
        anchors.fill: parent
        visible: root.mode === 4
        source: root.configuration.SvgPath
        fillMode: Image.PreserveAspectCrop
        sourceSize.width: root.width
        sourceSize.height: root.height
        smooth: true
        mipmap: true
        asynchronous: true
        cache: false
    }
}
