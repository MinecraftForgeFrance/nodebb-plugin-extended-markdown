"use strict";

/* global $ */

$(document).ready(function () {
    var ExtendedMarkdown = {};

    pageReady();

    $(window).on('action:ajaxify.end', function (ev, data) {
        pageReady();
    });

    $(window).on('action:composer.enhanced', function (evt, data) {
        ExtendedMarkdown.prepareFormattingTools();
    });

    ExtendedMarkdown.prepareFormattingTools = async function () {
        const [formatting, controls, translator] = await app.require(['composer/formatting', 'composer/controls', 'translator']);
        if (formatting && controls) {
            // params is (language, namespace, callback)
            translator.getTranslations(window.config.userLang || window.config.defaultLang, 'extendedmarkdown', function (strings) {
                var composerTextarea;
                var colorPickerButton = document.querySelector('li[data-format="color"]');
                var hiddenPicker = document.createElement("input");
                hiddenPicker.style.visibility = 'hidden';
                hiddenPicker.style.width = 0;
                hiddenPicker.style.padding = 0;
                hiddenPicker.style.border = 0;
                hiddenPicker.type = 'color';
                hiddenPicker.id = 'nodebb-plugin-extended-markdown-colorpicker';
                colorPickerButton.parentNode.insertBefore(hiddenPicker, colorPickerButton.nextSibling);
                hiddenPicker.addEventListener('input', function() {
                    var selectionStart = composerTextarea.selectionStart;
                    var selectionEnd = composerTextarea.selectionEnd;
                    composerTextarea.value = composerTextarea.value.slice(0, selectionStart) + this.value + composerTextarea.value.slice(selectionEnd);
                    // force preview to be updated
                    $(composerTextarea).trigger('propertychange');
                    // keep selection
                    composerTextarea.selectionStart = selectionStart;
                    composerTextarea.selectionEnd = selectionEnd;
                });

                formatting.addButtonDispatch('color', function (textarea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textarea, '%(#000000)[' + strings.color_text + ']');
                        controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + 9);
                    } else {
                        var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '%(#000000)[', ']');
                        controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + 9);
                    }
                    composerTextarea = textarea;
                    hiddenPicker.click();
                });

                formatting.addButtonDispatch('left', function (textarea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textarea, '|-' + strings.align_left);
                        controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + 2 + strings.align_left.length);
                    } else {
                        controls.wrapSelectionInTextareaWith(textarea, '|-', '');
                        controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + 2);
                    }
                });

                formatting.addButtonDispatch('center', function (textarea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textarea, '|-' + strings.align_center + '-|');
                        controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + 2 + strings.align_center.length);
                    } else {
                        var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '|-', '-|');
                        controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + 2);
                    }
                });

                formatting.addButtonDispatch('right', function (textarea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textarea, strings.align_right + '-|');
                        controls.updateTextareaSelection(textarea, selectionStart, selectionStart + strings.align_right.length);
                    } else {
                        controls.wrapSelectionInTextareaWith(textarea, '', '-|');
                        controls.updateTextareaSelection(textarea, selectionStart, selectionEnd);
                    }
                });

                formatting.addButtonDispatch('justify', function (textarea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textarea, '|=' + strings.align_justify + '=|');
                        controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + 2 + strings.align_justify.length);
                    } else {
                        controls.wrapSelectionInTextareaWith(textarea, '|=', '=|');
                        controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + 2);
                    }
                });

                formatting.addButtonDispatch('textheader', function (textarea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textarea, '#' + strings.textheader_anchor + '(' + strings.textheader_title + ')');
                        controls.updateTextareaSelection(textarea, selectionStart + 1, selectionStart + strings.textheader_anchor.length + 1);
                    } else {
                        var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '#' + strings.textheader_anchor + '(', ')');
                        controls.updateTextareaSelection(textarea, selectionStart + 1, selectionStart + strings.textheader_anchor.length + 1);
                    }
                });

                formatting.addButtonDispatch('groupedcode', function (textarea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textarea, '===group\n```' + strings.groupedcode_firstlang + "\n```\n```" + strings.groupedcode_secondlang + '\n```\n===');
                    }
                });

                formatting.addButtonDispatch('bubbleinfo', function (textarea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textarea, '°fa-info°(' + strings.bubbleinfo_text + ')');
                        controls.updateTextareaSelection(textarea, selectionStart + 1, selectionStart + 8);
                    } else {
                        var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '°', '°(' + strings.bubbleinfo_text + ')');
                        controls.updateTextareaSelection(textarea, selectionEnd + 3 - wrapDelta[1], selectionEnd + strings.bubbleinfo_text.length + 3 - wrapDelta[1]);
                    }
                });
                formatting.addButtonDispatch('spoiler', function (textearea, selectionStart, selectionEnd) {
                    if (selectionStart === selectionEnd) {
                        controls.insertIntoTextarea(textearea, "||" + strings.spoiler + "||");
                        controls.updateTextareaSelection(textearea, selectionStart + 2, selectionStart + 2 + strings.spoiler.length);
                    } else {
                        controls.wrapSelectionInTextareaWith(textearea, "||", "||");
                        controls.updateTextareaSelection(textearea, selectionStart + 2, selectionEnd + 2);
                    }
                });
            });
        }
    };

    function pageReady() {
        $('[data-toggle="tooltip"]').tooltip();
        document.querySelectorAll('button[type=button][name=spoiler]').forEach(function(element) {
            element.onclick = function() {
                element.children[0].className = element.attributes.getNamedItem("aria-expanded").value === "false" ? "fa fa-eye-slash" : "fa fa-eye";
            };
        });
    }
});
