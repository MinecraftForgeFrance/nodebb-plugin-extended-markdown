const textHeaderRegex = /#([a-zA-Z]*)\((.*)\)/g;
// small hack for compatibility with nodebb-plugin-markdown (remove <p> </p> added by it)
const textHeaderRegexP = /<p>#([a-zA-Z]*)\((.*)\)<\/p>/g;
const tooltipRegex = /°(.*)°\((.*)\)/g;

const codeTabRegex = /(?:<p>={3}group<\/p>\n)((?:<pre><code class=".+">[^]*?<\/code><\/pre>\n){2,})(?:<p>={3}<\/p>)/g;
const langCodeRegex = /<code class="(.+)">/;

const colorRegex = /%\((#[\dA-Fa-f]{6}|rgb\(\d{1,3}, ?\d{1,3}, ?\d{1,3}\)|[a-z]+)\)\[(.+?)]/g;

const alignArrayRegex = [
    {
        name: "center",
        regex: /<(h[1-6]|p)>(?:\|;)([^]*?)(?:;\|)<\/(?:h[1-6]|p)>/g
    },
    {
        name: "left",
        regex: /<(h[1-6]|p)>(?:\|;)([^]*?)<\/(?:h[1-6]|p)>/g
    },
    {
        name: "right",
        regex: /<(h[1-6]|p)>([^]*?)(?:;\|)<\/(?:h[1-6]|p)>/g
    },
    {
        name: "justify",
        regex: /<(h[1-6]|p)>(?:\|=)([^]*?)(?:=\|)<\/(?:h[1-6]|p)>/g
    }
];

const MFFCustomBB = {
    // post
    parsePost: function (data, callback) {
        if (data && data.postData && data.postData.content) {
            data.postData.content = applyMFFCustomBB(data.postData.content);
            data.postData.content = applyGroupCode(data.postData.content, data.postData.pid)
        }
        callback(null, data);
    },
    // user signature
    parseSignature: function (data, callback) {
        if (data && data.userData && data.userData.signature) {
            data.userData.signature = applyMFFCustomBB(data.userData.signature);
        }
        callback(null, data);
    },
    // user description
    parseAboutMe: function (data, callback) {
        if (data) {
            data = applyMFFCustomBB(data);
        }
        callback(null, data);
    },
    // direct preview in editor
    parseRaw: function (data, callback) {
        if (data) {
            data = applyMFFCustomBB(data);
            data = applyGroupCode(data, "")
        }
        callback(null, data);
    },
    registerFormating: function (payload, callback) {
        const formating = [
            {name: "color", className: "fa fa-eyedropper", title: "[[mffcustombb:composer.formatting.color]]"},
            {name: "left", className: "fa fa-align-left", title: "[[mffcustombb:composer.formatting.left]]"},
            {name: "center", className: "fa fa-align-center", title: "[[mffcustombb:composer.formatting.center]]"},
            {name: "right", className: "fa fa-align-right", title: "[[mffcustombb:composer.formatting.right]]"},
            {name: "justify", className: "fa fa-align-justify", title: "[[mffcustombb:composer.formatting.justify]]"},
            {name: "code", className: "fa fa-code", title: "[[mffcustombb:composer.formatting.code]]"},
            {name: "textheader", className: "fa fa-header", title: "[[mffcustombb:composer.formatting.textheader]]"},
            {name: "groupedcode", className: "fa fa-file-code-o", title: "[[mffcustombb:composer.formatting.groupedcode]]"},
            {name: "bubbleinfo", className: "fa fa-info-circle", title: "[[mffcustombb:composer.formatting.bubbleinfo]]"}
        ];

        payload.options = payload.options.concat(formating);

        callback(null, payload);
    }
};

function applyMFFCustomBB(textContent) {
    if (textContent.match(textHeaderRegexP)) {
        textContent = textContent.replace(textHeaderRegexP, function (match, anchorId, text) {
            return '<h2 class="text-header" id="' + anchorId + '">' + text + '</h2>';
        });
    }
    if (textContent.match(textHeaderRegex)) {
        textContent = textContent.replace(textHeaderRegex, function (match, anchorId, text) {
            return '<h2 class="text-header" id="' + anchorId + '">' + text + '</h2>';
        });
    }
    if (textContent.match(tooltipRegex)) {
        textContent = textContent.replace(tooltipRegex, function (match, text, tooltipText) {
            if ("fa-info" === text) {
                return '<i class="fa fa-info-circle mff-tooltip" data-toggle="tooltip" title="' + tooltipText + '"></i>';
            }
            else {
                return '<span class="mff-tooltip" data-toggle="tooltip" title="' + tooltipText + '">' + text + '</span>';
            }
        });
    }
    if (textContent.match(colorRegex)) {
        textContent = textContent.replace(colorRegex, function (match, color, text) {
            return `<span style="color: ${color};">${text}</span>`;
        });
    }

    for (let i = 0; i < alignArrayRegex.length; i++) {
        if (textContent.match(alignArrayRegex[i].regex)) {
            textContent = textContent.replace(alignArrayRegex[i].regex, function (match, baliseName, text) {
                return `<${baliseName} style="text-align: ${alignArrayRegex[i].name}">${text}</${baliseName}>`;
            });
        }
    }

    return textContent;
}

function applyGroupCode(textContent, id) {
    if (textContent.match(codeTabRegex)) {
        let codeArray = codeTabRegex.exec(textContent);
        codeArray = codeArray[1].split(/<\/pre>\n<pre>/g);
        let lang = [];
        lang[0] = langCodeRegex.exec(codeArray[0])[1];
        codeArray[0] += "</pre>\n";
        for (let i = 1; i < codeArray.length - 1; i++) {
            lang[i] = langCodeRegex.exec(codeArray[i])[1];
            codeArray[i] = "<pre>" + codeArray[i] + "</pre>\n";
        }
        codeArray[codeArray.length - 1] = "<pre>" + codeArray[codeArray.length - 1];
        lang[codeArray.length - 1] = langCodeRegex.exec(codeArray[codeArray.length - 1])[1];
        let count = 0;
        textContent = textContent.replace(codeTabRegex, () => {
            let menuTab = "<ul class='nav nav-tabs' role='tablist'>";
            let contentTab = "<div class='tab-content'>";
            for (let i = 0; i < lang.length; i++) {
                menuTab += `<li role='presentation' ${i === 0 ? "class='active'" : ""}><a href='#${lang[i] + count + id}' aria-controls='${lang[i]}' role='tab' data-toggle='tab'>${capitalizeFirstLetter(lang[i])}</a></li>`;
                contentTab += `<div role="tabpanel" class="tab-pane ${i === 0 ? "active" : ""}" id="${lang[i] + count + id}">${codeArray[i]}</div>`;
            }
            menuTab += "</ul>";
            contentTab += "</div>";
            count++;
            return menuTab + contentTab;
        });
    }
    return textContent;
}

function capitalizeFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

module.exports = MFFCustomBB;
