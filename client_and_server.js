/*global global, console */
if (typeof global != 'undefined') {	// node.js server
} else {	// client
	var exports = {};
}

exports.MOTION_PORT = 8889;

// common
exports.DP = function(in_o){
	if (typeof console != 'undefined') {
		console.log(in_o);
	}
};
exports.ASSERT = function(in_exp, in_o){
	if (!in_exp) {
		if (typeof console != 'undefined') {
			console.assert(in_exp, in_o);
		}
	}
};

exports.inherit = function(in_sub_class, in_super_class){
	for (var prop in in_super_class.prototype) {
		in_sub_class.prototype[prop] = in_super_class.prototype[prop];
	}
	in_sub_class.prototype.constructor = in_sub_class;
	in_sub_class.prototype.superClass = in_super_class;
};

exports.superClass = function(in_sub_class){
	return in_sub_class.prototype.superClass.prototype;
};

