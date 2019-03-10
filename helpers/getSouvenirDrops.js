const demofile = require("demofile");
const fs = require("fs");

module.exports = (demopath, progressCb = undefined) => {
	return new Promise((resolve, reject) => {
		const drops = [];
		let metadata = undefined;

		fs.readFile(demopath, (err, buffer) => {
			if (err) {
				reject(err);
				return;
			}

			const demoFile = new demofile.DemoFile();

			demoFile.gameEvents.on("tournament_reward", (event) => {
				drops.push({
					item: event.defindex,
					accountid: event.accountid,
					total: event.totalrewards
				});
			});

			demoFile.on("start", () => {
				if (metadata === undefined) {
					metadata = demoFile.header
					metadata.tickrate = demoFile.tickRate;
				}
			});

			demoFile.on("progress", (progressFraction) => {
				if (typeof progressCb !== "function") {
					return;
				}

				progressCb(progressFraction);
			});

			demoFile.on("end", (event) => {
				if (event.error) {
					reject(event.error);
					return;
				}

				resolve({
					drops: drops,
					metadata: metadata
				});
			});

			demoFile.parse(buffer);
		});
	});
}
