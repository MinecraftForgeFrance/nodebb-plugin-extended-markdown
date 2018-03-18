var async = module.parent.require('async');

var MFFCustomBB = {
    parsePost: function(data, callback) {
		if (data && data.postData && data.postData.content) {
			console.log(data.postData.content);
		}
		callback(null, data);
    }
};

module.exports = MFFCustomBB;