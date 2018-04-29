"use strict";

/* global $ */

$(document).ready(function() {
    var ExtendedMarkdown = {};

    $('[data-toggle="tooltip"]').tooltip();

    $(window).on('action:ajaxify.end', function(ev, data) {
        $('[data-toggle="tooltip"]').tooltip();
    });

    $(window).on('action:composer.enhanced', function(evt, data) {
        ExtendedMarkdown.prepareFormattingTools();
    });

    ExtendedMarkdown.prepareFormattingTools = function() {
        require([
            'composer/formatting',
            'composer/controls',
            'translator',
            'vendor/colorpicker/colorpicker',
        ], function (formatting, controls, translator) {
            if (formatting && controls) {
                // params is (language, namespace, callback)
                translator.getTranslations(window.config.userLang || window.config.defaultLang, 'extendedmarkdown', function(strings) {
                    var composerTextarea;
                    $('li[data-format="color"]').ColorPicker({
                        eventName: 'showPicker',
                        color: '#000',
                        onChange: function(hsb, hex) {
                            var selectionStart = composerTextarea.selectionStart;
                            var selectionEnd = composerTextarea.selectionEnd;
                            composerTextarea.value = composerTextarea.value.slice(0, selectionStart) + hex + composerTextarea.value.slice(selectionEnd);
                            // force preview to be updated
                            $(composerTextarea).trigger('propertychange');
                            // keep selection
                            composerTextarea.selectionStart = selectionStart;
                            composerTextarea.selectionEnd = selectionEnd;
                        },
                        onShow: function(colpkr) {
                            $(colpkr).css('z-index', 10001); // composer z-index is 10000
                            $(colpkr).fadeIn(250);
                        },
                        onHide: function (colpkr) {
                            $(colpkr).fadeOut(100);
                        }
                    });

                    formatting.addButtonDispatch('color', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '%(#000000)[' + strings.color_text + ']');
                            controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 9);
                        } else {
                            var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '%(#000000)[', ']');
                            controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 9);
                        } 
                        composerTextarea = textarea;
                        $('li[data-format="color"]').trigger("showPicker");
                    });

                    formatting.addButtonDispatch('left', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '|-' + strings.align_left);
                            controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + 2 + strings.align_left.length);
                        } else {
                            controls.wrapSelectionInTextareaWith(textarea, '|-', '');
                            controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + 2);
                        }
                    });

                    formatting.addButtonDispatch('center', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '|-' + strings.align_center + '-|');
                            controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + 2 + strings.align_center.length);
                        } else {
                            var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '|-', '-|');
                            controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + 2);
                        }
                    });

                    formatting.addButtonDispatch('right', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, strings.align_right + '-|');
                            controls.updateTextareaSelection(textarea, selectionStart, selectionStart + strings.align_right.length);
                        } else {
                            controls.wrapSelectionInTextareaWith(textarea, '', '-|');
                            controls.updateTextareaSelection(textarea, selectionStart, selectionEnd);
                        }
                    });

                    formatting.addButtonDispatch('justify', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '|=' + strings.align_justify + '=|');
                            controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + 2 + strings.align_justify.length);
                        } else {
                            controls.wrapSelectionInTextareaWith(textarea, '|=', '=|');
                            controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + 2);
                        } 
                    });

                    formatting.addButtonDispatch('code', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '```java\n' + strings.code + '\n```');
                            controls.updateTextareaSelection(textarea, selectionStart + 8, selectionStart + 8 + strings.code.length);
                        } else {
                            var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '```java\n', '\n```');
                            console.log(wrapDelta);
                            controls.updateTextareaSelection(textarea, selectionEnd + 8, selectionEnd + 8);
                        }
                    });

                    formatting.addButtonDispatch('textheader', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '#' + strings.textheader_anchor + '('  + strings.textheader_title +  ')');
                            controls.updateTextareaSelection(textarea, selectionStart + 1, selectionStart + strings.textheader_anchor.length + 1);
                        } else {
                            var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '#' + strings.textheader_anchor + '(', ')');
                            controls.updateTextareaSelection(textarea, selectionStart + 1, selectionStart + strings.textheader_anchor.length + 1);
                        }
                    });

                    formatting.addButtonDispatch('groupedcode', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '===group\n```' + strings.groupedcode_firstlang + "\n```\n```" + strings.groupedcode_secondlang + '\n```\n===');
                        }
                    });

                    formatting.addButtonDispatch('bubbleinfo', function(textarea, selectionStart, selectionEnd) {
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '°fa-info°(' + strings.bubbleinfo_text + ')');
                            controls.updateTextareaSelection(textarea, selectionStart + 1, selectionStart + 8);
                        } else {
                            var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '°', '°(' + strings.bubbleinfo_text + ')');
                            controls.updateTextareaSelection(textarea, selectionEnd + 3 - wrapDelta[1], selectionEnd + strings.bubbleinfo_text.length + 3 - wrapDelta[1]);
                        }
                    });
                });
            }
        });
    };
});
