const fs = require("fs");
let middlewares = new Map();
fs.readdirSync(__dirname + "/middleware/").map(async (filename) => {
	middlewares.set(filename.replace(".js", ""), require(`./middleware/${filename}`));
});

module.exports = {
	debug: false,
	baseDir: __dirname,
	middleware: [
		[
			middlewares.get("auth")(),
			{ enable: true }
		],
		[
			middlewares.get("context_process")(),
			{ enable: true }
		]
	]
};
