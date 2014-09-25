/*
 * Youtube Embed Plugin
 *
 * @author Jonnas Fonini <contato@fonini.net>
 * @version 1.0.9
 */
(function () {
    CKEDITOR.plugins.add('youtube',
        {
            requires: 'dialog,fakeobjects',
            lang: ['en', 'pt', 'ja', 'hu', 'it', 'fr', 'tr', 'ru', 'de', 'ar', 'nl', 'pl', 'vi'],
            afterInit: function (editor) {
                var dataProcessor = editor.dataProcessor,
                    dataFilter = dataProcessor && dataProcessor.dataFilter;
                if (dataFilter) {
                    dataFilter.addRules({
                        elements: {
                            'cke:object': function (element) {
                                var fakeImage = editor.createFakeParserElement(element, 'cke_youtube', 'youtube', true);
                                fakeImage.attributes.className = 'cke_youtube';
                                fakeImage.attributes.alt = editor.lang.youtube.object;
                                fakeImage.attributes.title = editor.lang.youtube.object;
                                fakeImage.attributes.width = element.attributes.width;
                                fakeImage.attributes.height = element.attributes.height;
                                fakeImage.attributes.style = fakeImage.attributes.style + 'background-image: url(' + CKEDITOR.getUrl(CKEDITOR.plugins.get('youtube').path + 'images/placeholder.png') + ');background-position: center center;background-repeat: no-repeat;border: 1px solid #a9a9a9;';
                                return fakeImage;
                            }
                        }
                    }, 5);
                }
            },
            init: function (editor) {
                editor.addCommand('youtube', new CKEDITOR.dialogCommand('youtube', {
                    allowedContent: 'object[classid,codebase,height,hspace,vspace,width];param[name,value];embed[height,hspace,pluginspage,src,type,vspace,width]'
                }));

                if (editor.contextMenu) {
                    editor.addMenuItems({
                        youtube: {
                            label: editor.lang.youtube.editContextItem,
                            icon: this.path + 'images/icon.png',
                            command: 'youtube',
                            group: 'image'
                        }
                    });

                    editor.contextMenu.addListener(function (element) {
                        if (element.getAscendant('img', true)) {
                            return {
                                youtube: CKEDITOR.TRISTATE_OFF
                            };
                        }
                    });
                }

                editor.ui.addButton('Youtube',
                    {
                        label: editor.lang.youtube.button,
                        toolbar: 'insert',
                        command: 'youtube',
                        icon: this.path + 'images/icon.png'
                    });

                CKEDITOR.dialog.add('youtube', function (instance) {
                    var video;

                    return {
                        title: editor.lang.youtube.title,
                        minWidth: 500,
                        minHeight: 100,
                        contents: [{
                            id: 'youtubePlugin',
                            expand: true,
                            elements: [{
                                type: 'hbox',
                                widths: ['70%', '15%', '15%'],
                                children: [
                                    {
                                        id: 'txtUrl',
                                        type: 'text',
                                        label: editor.lang.youtube.txtUrl,
                                        setup: function( element ) {
                                            var realElement = new CKEDITOR.htmlParser.fragment.fromHtml(decodeURIComponent(element.getAttribute('data-cke-realelement'))).children[0];
                                            var videoSettings = parseVideoSettings('http:'+realElement.attributes.data)
                                            this.setValue(videoSettings.url);
                                        },
                                        validate: function () {
                                            if (this.isEnabled()) {
                                                if (!this.getValue()) {
                                                    alert(editor.lang.youtube.noCode);
                                                    return false;
                                                }
                                                else {
                                                    video = ytVidId(this.getValue());

                                                    if (this.getValue().length === 0 || video === false) {
                                                        alert(editor.lang.youtube.invalidUrl);
                                                        return false;
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        type: 'text',
                                        id: 'txtWidth',
                                        width: '60px',
                                        label: editor.lang.youtube.txtWidth,
                                        'default': editor.config.youtube_width != null ? editor.config.youtube_width : '640',
                                        setup: function( element ) {
                                            this.setValue(element.getAttribute('width'));
                                        },
                                        validate: function () {
                                            if (this.getValue()) {
                                                var width = parseInt(this.getValue()) || 0;

                                                if (width === 0) {
                                                    alert(editor.lang.youtube.invalidWidth);
                                                    return false;
                                                }
                                            }
                                            else {
                                                alert(editor.lang.youtube.noWidth);
                                                return false;
                                            }
                                        }
                                    },
                                    {
                                        type: 'text',
                                        id: 'txtHeight',
                                        width: '60px',
                                        label: editor.lang.youtube.txtHeight,
                                        'default': editor.config.youtube_height != null ? editor.config.youtube_height : '360',
                                        setup: function( element ) {
                                            this.setValue(element.getAttribute('height'));
                                        },
                                        validate: function () {
                                            if (this.getValue()) {
                                                var height = parseInt(this.getValue()) || 0;

                                                if (height === 0) {
                                                    alert(editor.lang.youtube.invalidHeight);
                                                    return false;
                                                }
                                            }
                                            else {
                                                alert(editor.lang.youtube.noHeight);
                                                return false;
                                            }
                                        }
                                    }
                                ]
                            },
                                {
                                    type: 'hbox',
                                    widths: ['70%', '30%'],
                                    children: [
                                        {
                                            id: 'chkRelated',
                                            type: 'checkbox',
                                            'default': editor.config.youtube_related != null ? editor.config.youtube_related : true,
                                            setup: function( element ) {
                                                var realElement = new CKEDITOR.htmlParser.fragment.fromHtml(decodeURIComponent(element.getAttribute('data-cke-realelement'))).children[0];
                                                var videoSettings = parseVideoSettings('http:'+realElement.attributes.data);
                                                this.setValue(videoSettings.related == 1);
                                            },
                                            label: editor.lang.youtube.chkRelated
                                        },
                                        {
                                            id: 'chkAutoplay',
                                            type: 'checkbox',
                                            'default': editor.config.youtube_autoplay != null ? editor.config.youtube_autoplay : false,
                                            setup: function( element ) {
                                                var realElement = new CKEDITOR.htmlParser.fragment.fromHtml(decodeURIComponent(element.getAttribute('data-cke-realelement'))).children[0];
                                                var videoSettings = parseVideoSettings('http:'+realElement.attributes.data);
                                                this.setValue(videoSettings.autoplay == 1);
                                            },
                                            label: editor.lang.youtube.chkAutoplay
                                        }
                                    ]
                                },
                                {
                                    type: 'hbox',
                                    widths: ['45%', '55%'],
                                    children: [
                                        {
                                            id: 'txtStartAt',
                                            type: 'text',
                                            label: editor.lang.youtube.txtStartAt,
                                            setup: function( element ) {
                                                var realElement = new CKEDITOR.htmlParser.fragment.fromHtml(decodeURIComponent(element.getAttribute('data-cke-realelement'))).children[0];
                                                var videoSettings = parseVideoSettings('http:'+realElement.attributes.data);
                                                this.setValue(videoSettings.start);
                                            },
                                            validate: function () {
                                                if (this.getValue()) {
                                                    var str = this.getValue();

                                                    if (!/^\d+$/i.test(str)) {
                                                        alert(editor.lang.youtube.invalidTime);
                                                        return false;
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            id: 'empty',
                                            type: 'html',
                                            html: ''
                                        }
                                    ]
                                }
                            ]
                        }
                        ],
                        onShow: function() {
                            var selection = editor.getSelection();
                            var element = selection.getStartElement();

                            if ( element )
                                element = element.getAscendant( 'img', true );

                            if ( !element || element.getName() != 'img' ) {
                                element = editor.document.createElement( 'img' );
                                this.insertMode = true;
                            }
                            else
                                this.insertMode = false;

                            this.element = element;
                            if ( !this.insertMode )
                                this.setupContent( this.element );
                        },
                        onOk: function () {
                            var content = '';

                            var url = '//', params = [], startSecs;
                            var width = this.getValueOf('youtubePlugin', 'txtWidth');
                            var height = this.getValueOf('youtubePlugin', 'txtHeight');

                            url += 'www.youtube.com/';
                            url += 'embed/' + video;

                            if (this.getContentElement('youtubePlugin', 'chkRelated').getValue() === false) {
                                params.push('rel=0');
                            }

                            if (this.getContentElement('youtubePlugin', 'chkAutoplay').getValue() === true) {
                                params.push('autoplay=1');
                            }

                            startSecs = this.getValueOf('youtubePlugin', 'txtStartAt');
                            if (startSecs) {
                                params.push('start=' + startSecs);
                            }

                            if (params.length > 0) {
                                url = url + '?' + params.join('&');
                            }

                            url = url.replace('embed/', 'v/');
                            url = url.replace(/&/g, '&amp;');

                            if (url.indexOf('?') == -1) {
                                url += '?';
                            }
                            else {
                                url += '&amp;';
                            }
                            url += 'version=3';

                            content = '<object width="' + width + '" height="' + height + '" data="' + url + '">';
                            content += '<param name="movie" value="' + url + '"></param>';
                            content += '<param name="allowFullScreen" value="true"></param>';
                            content += '<param name="allowscriptaccess" value="always"></param>';
                            content += '<embed src="' + url + '" type="application/x-shockwave-flash" ';
                            content += 'width="' + width + '" height="' + height + '" allowscriptaccess="always" ';
                            content += 'allowfullscreen="true"></embed>';
                            content += '</object>';

                            var instance = this.getParentEditor();
                            instance.insertHtml(content);
                        }
                    };
                });
            }
        });
})();

/**
 * JavaScript function to match (and return) the video Id
 * of any valid Youtube Url, given as input string.
 * @author: Stephan Schmitz <eyecatchup@gmail.com>
 * @url: http://stackoverflow.com/a/10315969/624466
 */
function ytVidId(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return ( url.match(p) ) ? RegExp.$1 : false;
}

function parseVideoSettings(url) {
    url = url.replace(/&amp;/g, '&');
    return data = {
        url: url.match(/(.*)\?/) ? RegExp.$1 : url,
        related: url.match(/rel=(0|1)/) ? RegExp.$1 : 1,
        autoplay: url.match(/autoplay=(0|1)/) ? RegExp.$1 : 0,
        start:  url.match(/start=(\d+)/) ? RegExp.$1 : null
    };
}
