import QtQuick
import QtQuick.Controls as QQC2
import QtQuick.Layouts
import QtQuick.Dialogs as QtDialogs
import org.kde.kirigami as Kirigami

Kirigami.FormLayout {
    id: root

    property alias cfg_Mode: modeCombo.currentIndex
    property alias cfg_Palette: paletteCombo.currentIndex
    property alias cfg_Quality: qualityCombo.currentIndex
    property alias cfg_Speed: speedSlider.value
    property alias cfg_Zoom: zoomSlider.value
    property string cfg_SvgPath: ""

    QQC2.ComboBox {
        id: modeCombo
        Kirigami.FormData.label: i18n("Modalità:")
        model: [
            i18n("Julia (morphing)"),
            i18n("Plasma fluido"),
            i18n("Caleidoscopio"),
            i18n("Fractal flame"),
            i18n("Immagine SVG")
        ]
    }

    QQC2.ComboBox {
        id: paletteCombo
        Kirigami.FormData.label: i18n("Palette colori:")
        enabled: modeCombo.currentIndex < 4
        model: [
            i18n("Arcobaleno"),
            i18n("Tramonto"),
            i18n("Oro"),
            i18n("Fuoco"),
            i18n("Oceano")
        ]
    }

    QQC2.ComboBox {
        id: qualityCombo
        Kirigami.FormData.label: i18n("Qualità:")
        enabled: modeCombo.currentIndex < 4
        model: [
            i18n("Alta (risoluzione piena)"),
            i18n("Media (75%)"),
            i18n("Bassa (50%)")
        ]
    }

    RowLayout {
        Kirigami.FormData.label: i18n("Velocità:")
        enabled: modeCombo.currentIndex < 4
        QQC2.Slider {
            id: speedSlider
            from: 0.1
            to: 3.0
            stepSize: 0.05
            Layout.preferredWidth: Kirigami.Units.gridUnit * 12
        }
        QQC2.Label { text: speedSlider.value.toFixed(2) }
    }

    RowLayout {
        Kirigami.FormData.label: i18n("Zoom:")
        enabled: modeCombo.currentIndex < 4
        QQC2.Slider {
            id: zoomSlider
            from: 0.3
            to: 3.0
            stepSize: 0.05
            Layout.preferredWidth: Kirigami.Units.gridUnit * 12
        }
        QQC2.Label { text: zoomSlider.value.toFixed(2) }
    }

    Item { Kirigami.FormData.isSection: true; visible: modeCombo.currentIndex === 4 }

    RowLayout {
        Kirigami.FormData.label: i18n("File SVG:")
        visible: modeCombo.currentIndex === 4
        QQC2.TextField {
            id: svgField
            text: root.cfg_SvgPath
            placeholderText: i18n("Nessun file selezionato")
            Layout.preferredWidth: Kirigami.Units.gridUnit * 16
            onEditingFinished: root.cfg_SvgPath = text
        }
        QQC2.Button {
            text: i18n("Sfoglia…")
            icon.name: "document-open"
            onClicked: svgDialog.open()
        }
    }

    QtDialogs.FileDialog {
        id: svgDialog
        title: i18n("Scegli un file SVG")
        nameFilters: [i18n("Immagini vettoriali (*.svg *.svgz)")]
        onAccepted: {
            root.cfg_SvgPath = selectedFile.toString()
            svgField.text = root.cfg_SvgPath
        }
    }
}
