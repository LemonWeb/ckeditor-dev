/*
* Youtube Embed Plugin
*
* @author Jonnas Fonini <contato@fonini.net>
* @version 1.0.9
*/
( function() {
	CKEDITOR.plugins.add( 'youtube',
	{
        requires: 'dialog,fakeobjects',
		lang: [ 'en', 'pt', 'ja', 'hu', 'it', 'fr', 'tr', 'ru', 'de', 'ar', 'nl', 'pl', 'vi'],
        onLoad: function()
        {
            CKEDITOR.addCss('img.cke_youtube' +
                '{' +
                'background-image: url(' + CKEDITOR.getUrl(this.path + 'images/placeholder.png') + ');' +
                'background-position: center center;' +
                'background-repeat: no-repeat;' +
                'border: 1px solid #a9a9a9;' +
                '}'
            );
        },
        afterInit: function(editor)
        {
            var dataProcessor = editor.dataProcessor,
                dataFilter = dataProcessor && dataProcessor.dataFilter;

            if (dataFilter)
            {
                dataFilter.addRules({
                    elements: {
                        'cke:object': function(element)
                        {
                            var fakeImage = editor.createFakeParserElement(element, 'cke_youtube', 'youtube', true);
                            fakeImage.attributes.className = 'cke_youtube';
                            fakeImage.attributes.alt = editor.lang.youtube.object;
                            fakeImage.attributes.title = editor.lang.youtube.object;
                            return fakeImage;
                        }
                    }
                }, 5);
            }
        },
		init: function( editor )
		{
			editor.addCommand( 'youtube', new CKEDITOR.dialogCommand( 'youtube', {
				allowedContent: 'object[classid,codebase,height,hspace,vspace,width];param[name,value];embed[height,hspace,pluginspage,src,type,vspace,width]'
			}));

			editor.ui.addButton( 'Youtube',
			{
				label : editor.lang.youtube.button,
				toolbar : 'insert',
				command : 'youtube',
				icon : this.path + 'images/icon.png'
			});

			CKEDITOR.dialog.add( 'youtube', function ( instance )
			{
				var video;

				return {
					title : editor.lang.youtube.title,
					minWidth : 500,
					minHeight : 100,
					contents :
						[{
							id : 'youtubePlugin',
							expand : true,
							elements :
								[{
									type : 'hbox',
									widths : [ '70%', '15%', '15%' ],
									children :
									[
										{
											id : 'txtUrl',
											type : 'text',
											label : editor.lang.youtube.txtUrl,
											validate : function ()
											{
												if ( this.isEnabled() )
												{
													if ( !this.getValue() )
													{
														alert( editor.lang.youtube.noCode );
														return false;
													}
													else{
														video = ytVidId(this.getValue());

														if ( this.getValue().length === 0 ||  video === false)
														{
															alert( editor.lang.youtube.invalidUrl );
															return false;
														}
													}
												}
											}
										},
										{
											type : 'text',
											id : 'txtWidth',
											width : '60px',
											label : editor.lang.youtube.txtWidth,
											'default' : editor.config.youtube_width != null ? editor.config.youtube_width : '640',
											validate : function ()
											{
												if ( this.getValue() )
												{
													var width = parseInt ( this.getValue() ) || 0;

													if ( width === 0 )
													{
														alert( editor.lang.youtube.invalidWidth );
														return false;
													}
												}
												else {
													alert( editor.lang.youtube.noWidth );
													return false;
												}
											}
										},
										{
											type : 'text',
											id : 'txtHeight',
											width : '60px',
											label : editor.lang.youtube.txtHeight,
											'default' : editor.config.youtube_height != null ? editor.config.youtube_height : '360',
											validate : function ()
											{
												if ( this.getValue() )
												{
													var height = parseInt ( this.getValue() ) || 0;

													if ( height === 0 )
													{
														alert( editor.lang.youtube.invalidHeight );
														return false;
													}
												}
												else {
													alert( editor.lang.youtube.noHeight );
													return false;
												}
											}
										}
									]
								},
	    						{
									type : 'hbox',
									widths : [ '70%', '30%' ],
									children :
									[
                                        {
                                            id : 'chkRelated',
                                            type : 'checkbox',
                                            'default' : editor.config.youtube_related != null ? editor.config.youtube_related : true,
                                            label : editor.lang.youtube.chkRelated
                                        },
										{
											id : 'chkAutoplay',
											type : 'checkbox',
											'default' : editor.config.youtube_autoplay != null ? editor.config.youtube_autoplay : false,
											label : editor.lang.youtube.chkAutoplay
										}
									]
								},
								{
									type : 'hbox',
									widths : [ '45%', '55%'],
									children :
									[
										{
											id : 'txtStartAt',
											type : 'text',
											label : editor.lang.youtube.txtStartAt,
											validate : function ()
											{
												if ( this.getValue() )
												{
													var str = this.getValue();

													if ( !/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/i.test( str ) )
													{
														alert( editor.lang.youtube.invalidTime );
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
					onOk: function()
					{
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
                            var seconds = hmsToSeconds(startSecs);

                            params.push('start=' + seconds);
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

                        content = '<object width="' + width + '" height="' + height + '">';
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
function ytVidId( url )
{
	var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	return ( url.match( p ) ) ? RegExp.$1 : false;
}

/**
 * Converts time in hms format to seconds only
 */
function hmsToSeconds( time )
{
	var arr = time.split(':'), s = 0, m = 1;

	while (arr.length > 0)
	{
		s += m * parseInt(arr.pop(), 10);
		m *= 60;
	}

	return s;
}
