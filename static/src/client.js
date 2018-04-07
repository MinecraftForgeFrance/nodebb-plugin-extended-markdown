"use strict";

$(document).ready(function () {
    var MFFCustomBB = {};

    $('[data-toggle="tooltip"]').tooltip();

    $(window).on('action:ajaxify.end', function (ev, data) {
        $('[data-toggle="tooltip"]').tooltip();
    });

    $(window).on('action:composer.enhanced', function (evt, data) {
        MFFCustomBB.prepareFormattingTools();
    });

    MFFCustomBB.prepareFormattingTools = function () {
        require([
            'composer/formatting',
            'composer/controls',
            'translator',
        ], function (formatting, controls, translator) {
            if (formatting && controls) {
                // params is (language, namespace, callback)
                translator.getTranslations(window.config.userLang || window.config.defaultLang, 'mffcustombb', function (strings) {
                    formatting.addButtonDispatch('grouped_code', function (textarea, selectionStart, selectionEnd) {
                        console.dir(strings);
                        if (selectionStart === selectionEnd) {
                            controls.insertIntoTextarea(textarea, '===group\n```' + strings.codeOne + "\n```\n```" + strings.codeTwo + '\n```\n===');
                            //controls.updateTextareaSelection(textarea, selectionStart + strings.link_text.length + 3, selectionEnd + strings.link_text.length + strings.link_url.length + 3);
                        } /*else {
                            var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '[', '](' + strings.link_url + ')');
                            controls.updateTextareaSelection(textarea, selectionEnd + 3 - wrapDelta[1], selectionEnd + strings.link_url.length + 3 - wrapDelta[1]);
                        }*/
                    });
                });
            }
        });
    };
});
