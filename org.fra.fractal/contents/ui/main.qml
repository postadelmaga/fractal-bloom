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

    // tempo in secondi; ~30fps, fermo in modalità SVG per non sprecare GPU
    property real iTime: 0
    Timer {
        interval: 33
        running: root.mode < 4
        repeat: true
        onTriggered: root.iTime += 0.033
    }

    // sfondo di base (visibile sotto eventuali SVG con trasparenza)
    Rectangle {
        anchors.fill: parent
        color: "black"
    }

    // --- Frattali generati (modalità 0..3) ---
    ShaderEffect {
        anchors.fill: parent
        visible: root.mode < 4
        blending: false
        property real iTime: root.iTime
        property size iResolution: Qt.size(width, height)
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
        asynchronous: true
        cache: false
    }
}
