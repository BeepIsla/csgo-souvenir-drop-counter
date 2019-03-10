const request = require("request");
const fs = require("fs");
const Unrar = require("node-unrar-js");
const path = require("path");

module.exports = (url, outputDL, outputRAR, progressCb = undefined) => {
	return new Promise((resolve, reject) => {
		let total = NaN;
		let progress = 0;
		let unpackTries = 0;

		let r = request.get(url);

		r.on("error", reject);
		r.on("response", req => total = parseInt(req.headers["content-length"]));
		r.on("complete", completeFunc);
		r.on("data", (chunk) => {
			progress += chunk.length;

			// No header response yet
			if (isNaN(total)) {
				return;
			}

			// Progress Function not a function
			if (typeof progressCb !== "function") {
				return;
			}

			progressCb(progress, total);
		});
		r.pipe(fs.createWriteStream(outputDL));

		function completeFunc() {
			const r = Unrar.createExtractorFromFile(outputDL, outputRAR);
			let extracted = r.extractAll();

			if (extracted[0].state !== "SUCCESS") {
				if (unpackTries >= 5) {
					reject(extracted);
					return;
				}

				setTimeout(completeFunc, 1000);
				unpackTries += 1;
				return;
			}

			resolve(extracted[1].files.map(f => f.fileHeader.name).map(f => path.join(outputRAR, f)));
		}
	});
}
