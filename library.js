'use strict';

const utils = require.main.require('./src/utils');

const textHeaderRegex = /<p dir="auto">#([a-zA-Z0-9-]*)\((.*)\)<\/p>/g;
const tooltipRegex = /(<code.*>*?[^]<\/code>)|°(.*)°\((.*)\)/g;

const codeTabRegex = /(?:<p dir="auto">={3}group<\/p>\n)((?:<pre><code class=".+">[^]*?<\/code><\/pre>\n){2,})(?:<p dir="auto">={3}<\/p>)/g;
const langCodeRegex = /<code class="(.+)">/;

const colorRegex = /(<code.*>*?[^]<\/code>)|%\((#[\dA-Fa-f]{6}|rgb\(\d{1,3}, ?\d{1,3}, ?\d{1,3}\)|[a-z]+)\)\[(.+?)]/g;

const paragraphAndHeadingRegex = /<(h[1-6]|p dir="auto")>([^]*?)<\/(h[1-6]|p)>/g;

const noteRegex = /<p dir="auto">!!! (info|warning|important) \[([a-zA-Z0-9]*)\]: ((.|<br \/>\n)*)<\/p>/g;

const spoilerRegex = /(?:<p dir="auto">)(?:\|\|)([^]*?)(?:\|\|)(?:<\/p>)/g;

const noteIcons = {
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle',
    important: 'fa-exclamation-circle'
};

const ExtendedMarkdown = {
    // post
    parsePost(data, callback) {
        if (data && data.postData && data.postData.content) {
            data.postData.content = applyExtendedMarkdown(data.postData.content);
            data.postData.content = applyGroupCode(data.postData.content, data.postData.pid);
            data.postData.content = applySpoiler(data.postData.content, data.postData.pid);
        }
        callback(null, data);
    },
    // user signature
    parseSignature(data, callback) {
        if (data && data.userData && data.userData.signature) {
            data.userData.signature = applyExtendedMarkdown(data.userData.signature);
        }
        callback(null, data);
    },
    // user description
    parseAboutMe(data, callback) {
        if (data) {
            data = applyExtendedMarkdown(data);
        }
        callback(null, data);
    },
    // direct preview in editor
    parseRaw(data, callback) {
        if (data) {
            data = applyExtendedMarkdown(data);
            data = applyGroupCode(data, "");
            data = applySpoiler(data, "");
        }
        callback(null, data);
    },
    registerFormatting(payload, callback) {
        const formatting = [
            {name: "color", className: "fa fa-eyedropper", title: "[[extendedmarkdown:composer.formatting.color]]"},
            {name: "left", className: "fa fa-align-left", title: "[[extendedmarkdown:composer.formatting.left]]"},
            {name: "center", className: "fa fa-align-center", title: "[[extendedmarkdown:composer.formatting.center]]"},
            {name: "right", className: "fa fa-align-right", title: "[[extendedmarkdown:composer.formatting.right]]"},
            {name: "justify", className: "fa fa-align-justify", title: "[[extendedmarkdown:composer.formatting.justify]]"},
            {name: "textheader", className: "fa fa-header", title: "[[extendedmarkdown:composer.formatting.textheader]]"},
            {name: "groupedcode", className: "fa fa-file-code-o", title: "[[extendedmarkdown:composer.formatting.groupedcode]]"},
            {name: "bubbleinfo", className: "fa fa-info-circle", title: "[[extendedmarkdown:composer.formatting.bubbleinfo]]"},
            {name: "spoiler", className: "fa fa-eye-slash", title: "[[extendedmarkdown:composer.formatting.spoiler]]"}
        ];

        payload.options = payload.options.concat(formatting);

        callback(null, payload);
    },
    async sanitizerConfig(config) {
        config.allowedAttributes['a'].push('name');
        return config;
    }
};

function applyExtendedMarkdown(textContent) {
    if (textContent.match(noteRegex)) {
        textContent = textContent.replace(noteRegex, function (match, type, title, text) {
            return `<div class="admonition ${type.toLowerCase()}"><p class="admonition-title"><i class="fa ${noteIcons[type.toLowerCase()]}"></i>${title}</p><p>${text}</p></div>`;
        });
    }

    if (textContent.match(textHeaderRegex)) {
        textContent = textContent.replace(textHeaderRegex, function (match, anchorId, text) {
            return `<h2 class="text-header"><a class="anchor-offset" name="${anchorId}"></a>${text}</h2>`;
        });
    }

    if (textContent.match(tooltipRegex)) {
        textContent = textContent.replace(tooltipRegex, function (match, code, text, tooltipText) {
            if (typeof (code) !== "undefined") {
                return code;
            } else if ("fa-info" === text) {
                return `<i class="fa fa-info-circle extended-markdown-tooltip" data-toggle="tooltip" title="${tooltipText}"></i>`;
            } else {
                return `<span class="extended-markdown-tooltip" data-toggle="tooltip" title="${tooltipText}">${text}</span>`;
            }
        });
    }

    if (textContent.match(colorRegex)) {
        textContent = textContent.replace(colorRegex, function (match, code, color, text) {
            if (typeof (code) !== "undefined") {
                return code;
            }
            return `<span style="color: ${color};">${text}</span>`;
        });
    }

    if (textContent.match(paragraphAndHeadingRegex)) {
        textContent = textContent.replace(paragraphAndHeadingRegex, function (match, tag, text, closeTag) {
            let hasStartPattern = text.startsWith("|-");
            let hasEndPattern = text.endsWith("-|");
            let anchor = tag.charAt(0) == "h" ? generateAnchorFromHeading(text) : "";
            if (text.startsWith("|=") && text.endsWith("=|")) {
                return `<${tag} style="text-align:justify;">${anchor}${text.slice(2).slice(0, -2)}</${closeTag}>`;
            } else if (hasStartPattern && hasEndPattern) {
                return `<${tag} style="text-align:center;">${anchor}${text.slice(2).slice(0, -2)}</${closeTag}>`;
            } else if (hasEndPattern) {
                return `<${tag} style="text-align:right;">${anchor}${text.slice(0, -2)}</${closeTag}>`;
            } else if (hasStartPattern) {
                return `<${tag} style="text-align:left;">${anchor}${text.slice(2)}</${closeTag}>`;
            }
            return `<${tag}>${anchor}${text}</${closeTag}>`;
        });
    }

    return textContent;
}

function applyGroupCode(textContent, id) {
    if (textContent.match(codeTabRegex)) {
        let count = 0;
        textContent = textContent.replace(codeTabRegex, (match, codes) => {
            // code is the first match, the full grouped code without the start ===group and the end ===
            let codeArray = codes.substring(5, codes.length - 6).split(/<\/pre>\n<pre>/g); // remove first and last <pre> then split between all lang
            let lang = [];
            for (let i in codeArray) {
                lang[i] = langCodeRegex.exec(codeArray[i])[1]; // extract lang for code
                codeArray[i] = "<pre>" + codeArray[i] + "</pre>\n"; // add pre at the start and at the end of all code
            }
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

function generateAnchorFromHeading(heading) {
    return `<a class="anchor-offset" name="${utils.slugify(heading)}"></a>`;
}

function applySpoiler(textContent, id) {
    if (textContent.match(spoilerRegex)) {
        let count = 0;
        textContent = textContent.replace(spoilerRegex, (match, text) => {
            const spoilerButton = `<p><button class="btn btn-sm btn-primary" name="spoiler" type="button" data-toggle="collapse" data-target="#spoiler${count + id}" aria-expanded="false" aria-controls="spoiler${count + id}">Spoiler <i class="fa fa-eye"></i></button>`;
            const spoilerContent = `<div class="collapse" id="spoiler${count + id}"><div class="card card-body spoiler">${text}</div></div></p>`;
            count++;
            return spoilerButton + spoilerContent;
        });
    }
    return textContent;
}

module.exports = ExtendedMarkdown;
