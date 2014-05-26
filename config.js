/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * Dit bestand is automatisch gegenereerd. Alle wijzigingen in dit bestand zullen verloren gaan.
 * @see http://fredjan.lemondev.nl/lemonwiki/index.php/CKeditor
 */
CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here.
    // For the complete reference:
    // http://docs.ckeditor.com/#!/api/CKEDITOR.config

    /**
     * Alle eventuele wijzigingen (ook) in de volgende repo doorvoeren en opnieuw builden:
     * $ git clone https://github.com/LemonWeb/ckeditor-dev.git
     * $ cd ckeditor-dev/
     * $ git checkout release/stable
     * $ cd dev/builder/
     * $ ./build.sh [path]
     *
     * De release/kopie die hieruit komt is bruikbaar voor productie
     */

    config.language = 'nl';
    config.format_tags = 'h1;h2;h3;p';
    config.filebrowserWindowWidth = 800;
    config.image_previewText = ' ';
    config.font_defaultLabel = 'Arial';
    config.fontSize_defaultLabel = 12;
    config.fontSize_sizes = '1 (8pt)/xx-small;2 (10pt)/x-small;3 (12pt)/small;4 (14pt)/medium;5 (18pt)/large;6 (24pt)/x-large;7 (36pt)/xx-large';
    config.width = '100%';
    config.font_names = "Andale Mono/'andale mono', times;" +
        "Arial/arial, helvetica, sans-serif;" +
        "Arial Black/'arial black', 'avant garde';" +
        "Book Antiqua/'book antiqua', palatino;" +
        "Century Gothic/century gothic;" +
        "Comic Sans/'comic sans ms', sans-serif;" +
        "Courier New/'courier new', courier;" +
        "Georgia/georgia, palatino;" +
        "Helvetica/helvetica;" +
        "Impact/impact, chicago;" +
        "Symbol/symbol;" +
        "Tahoma/tahoma, arial, helvetica, sans-serif;" +
        "Terminal/terminal, monaco;" +
        "Times New Roman/'times new roman', times;" +
        "Trebuchet/'trebuchet ms', geneva;" +
        "Verdana/verdana, geneva;" +
        "Webdings/webdings;" +
        "Wingdings/wingdings, 'zapf dingbats'";
    config.extraAllowedContent = 'object(ytplayer)[type,data]; img{border,border-style,border-width}';
    // %REMOVE_START%
    config.plugins =
        'backgrounds,' +
            'basicstyles,' +
            'button,' +
            'clipboard,' +
            'colorbutton,' +
            'colordialog,' +
            'contextmenu,' +
            'dialog,' +
            'dialogadvtab,' +
            'dialogui,' +
            'enterkey,' +
            'entities,' +
            'fakeobjects,' +
            'filebrowser,' +
            'find,' +
            'floatingspace,' +
            'floatpanel,' +
            'font,' +
            'format,' +
            'image2,' +
            'indent,' +
            'indentblock,' +
            'indentlist,' +
            'justify,' +
            'lineutils,' +
            'link,' +
            'list,' +
            'listblock,' +
            'liststyle,' +
            'maximize,' +
            'menu,' +
            'panel,' +
            'panelbutton,' +
            'pastefromword,' +
            'popup,' +
            'removeformat,' +
            'richcombo,' +
            'selectall,' +
            'showborders,' +
            'sourcearea,' +
            'specialchar,' +
            'table,' +
            'tableresize,' +
            'tabletools,' +
            'toolbar,' +
            'uicolor,' +
            'undo,' +
            'widget,' +
            'wysiwygarea,' +
            'youtube';
    config.skin = 'moono';
    config.languages = 'en,nl';
    // %REMOVE_END%
};
// %LEAVE_UNMINIFIED% %REMOVE_LINE%

/**
 * Tweak het afbeeldingsdialoog:
 * - Verander de teksten van de uitlijningsopties naar het Nederlands
 * - Verwijder het onderschrift veld
 * - Voeg een randdikte en randkleur veld toe
 */
CKEDITOR.on('dialogDefinition', function (ev) {
    var dialogName = ev.data.name;
    var dialogDefinition = ev.data.definition;

    if (dialogName == 'image2') {
        var infoTab = dialogDefinition.getContents('info');

        // Onderschrift optie uitschakelen
        infoTab.remove('hasCaption');

        // Border veld toevoegen
        infoTab.add({
            type: 'hbox',
            widths: ['25%', '75%'],
            children: [
                {
                    type: 'text',
                    width: '50px',
                    label: 'Randdikte',
                    id: 'borderField',
                    default: '0',
                    validate: function () {
                        if (/[^\d]/.test(this.getValue())) {
                            return 'Randdikte dient een numerieke waarde te bevatten';
                        }
                    }
                },
                {
                    type: 'text',
                    width: '75px',
                    label: 'Randkleur',
                    id: 'borderColor',
                    default: '',
                    setup: function () {
                        jscolor.color(this.getInputElement().$, { hash: true, required: false, pickerZIndex: 100000 });
                    }
                }
            ]
        });

        var dialog = dialogDefinition.dialog;
        dialog.on('show', function () {
            var imageElement = jQuery(this.widget.parts.image.$);

            var borderWidth = imageElement.css("border-left-width").replace(/[^\d]+/g, '');

            // Neem de border kleur over, mits de randdikte ingesteld is en er expliciet een kleur is toegewezen aan de border
            var borderColorRgb = (borderWidth > 0 && imageElement.prop('style').borderColor) ? imageElement.css('border-color') : null;

            var rgbToHex = function (color) {
                return "#" + jQuery.map(color.match(/\b(\d+)\b/g),function (digit) {
                    return ('0' + parseInt(digit).toString(16)).slice(-2)
                }).join('');
            };

            this.getContentElement('info', 'borderColor').setValue(borderColorRgb ? rgbToHex(borderColorRgb) : '');
            this.getContentElement('info', 'borderField').setValue(borderWidth ? borderWidth : '0');
        });

        dialog.on('ok', function () {
            var imageElement = this.widget.parts.image;

            var borderSize = this.getContentElement('info', 'borderField').getValue() + 'px';
            var borderColor = this.getContentElement('info', 'borderColor').getValue();

            // Set alleen de border-width en border-style wanneer er geen randkleur ingesteld is, zodat de randkleur ge-inherit wordt.
            if (!borderColor) {
                imageElement.removeStyle('border');
                imageElement.setStyle('border-width', borderSize);
                imageElement.setStyle('border-style', 'solid');
            } else {
                imageElement.setStyle('border', borderSize + ' solid ' + borderColor);
            }
        });
    }
});
