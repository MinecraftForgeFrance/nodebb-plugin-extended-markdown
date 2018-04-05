"use strict";

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();

    $(window).on('action:ajaxify.end', function(ev, data) {
        $('[data-toggle="tooltip"]').tooltip();
    });
});
