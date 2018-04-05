const textHeaderRegex = /#([a-zA-Z]*)\((.*)\)/g;
// small hack for compatibility with nodebb-plugin-markdown (remove <p> </p> added by it)
const textHeaderRegexP = /<p>#([a-zA-Z]*)\((.*)\)<\/p>/g;
const tooltipRegex = /°(.*)°\((.*)\)/g;

const MFFCustomBB = {
    // post
    parsePost: function(data, callback) {
        if (data && data.postData && data.postData.content) {
            data.postData.content = applyMFFCustomBB(data.postData.content);
        }
        callback(null, data);
    },
    // user signature
    parseSignature: function(data, callback) {
        if (data && data.userData && data.userData.signature) {
            data.userData.signature = applyMFFCustomBB(data.userData.signature);
        }
        callback(null, data);
    },
    // user description
    parseAboutMe: function(data, callback) {
        if(data) {
            data = applyMFFCustomBB(data);
        }
        callback(null, data);
    },
    // direct preview in editor
    parseRaw: function(data, callback) {
        if(data) {
            data = applyMFFCustomBB(data);
        }
        callback(null, data);
    }
};

function applyMFFCustomBB(textContent) {
    if(textContent.match(textHeaderRegexP)) {
        textContent = textContent.replace(textHeaderRegexP, function(match, anchorId, text) {
            return '<h2 class="text-header" id="'+ anchorId + '">' + text + '</h2>';
        });
    }
    if(textContent.match(textHeaderRegex)) {
        textContent = textContent.replace(textHeaderRegex, function(match, anchorId, text) {
            return '<h2 class="text-header" id="'+ anchorId + '">' + text + '</h2>';
        });
    }
    if(textContent.match(tooltipRegex)) {
        textContent = textContent.replace(tooltipRegex, function(match, text, tooltipText) {
            if("fa-info" == text) {
                return '<i class="fa fa-info-circle mff-tooltip" data-toggle="tooltip" title="'+ tooltipText +'"></i>';
            }
            else {
                return '<span class="mff-tooltip" data-toggle="tooltip" title="'+ tooltipText +'">' + text + '</span>';
            }
        });
    }
    return textContent;
}

module.exports = MFFCustomBB;