module.exports = {
	process: function(src, filename) {
		return readFileSync(filename).toString();
	},
};