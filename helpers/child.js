const path = require("path");
const readline = require("readline");
const fs = require("fs");
const getDownloadOfMatch = require("./getDownloadOfMatch.js");
const downloadAndUnzip = require("./downloadAndUnzip.js");
const getSouvenirDrops = require("./getSouvenirDrops.js");

const identifier = process.argv[2];
const matches = process.argv.slice(3);
const TOTAL_SOUVENIR_DROPS = [];

(async () => {
	for (let i = 0; i < matches.length; i++) {
		console.log("Getting download URL for match " + matches[i] + " " + (i + 1) + "/" + matches.length);

		let download = await getDownloadOfMatch(matches[i]).catch(console.error);
		if (!download) {
			console.lop("Error during " + matches[i]);
			continue;
		}

		matches[i] = {
			id: matches[i],
			download: download
		}
	}

	if (fs.existsSync(path.join(__dirname, "/../", "/demos")) === false) {
		fs.mkdirSync(path.join(__dirname, "/../", "/demos"));
	}

	if (fs.existsSync(path.join(__dirname, "/../", "/packed")) === false) {
		fs.mkdirSync(path.join(__dirname, "/../", "/packed"));
	}

	if (fs.existsSync(path.join(__dirname, "/../", "/output")) === false) {
		fs.mkdirSync(path.join(__dirname, "/../", "/output"));
	}

	if (fs.existsSync(path.join(__dirname, "/../", "/demos/", identifier)) === false) {
		fs.mkdirSync(path.join(__dirname, "/../", "/demos/", identifier));
	}

	for (let i = 0; i < matches.length; i++) {
		process.stdout.write("Downloading and unzipping " + matches[i].id + " " + (i + 1) + "/" + matches.length + " (0.00%)");

		let files = await downloadAndUnzip(
			matches[i].download,
			path.join(__dirname, "/../", "/packed/", matches[i].download.split("/").pop() + ".rar"),
			path.join(__dirname, "/../", "/demos/", identifier),
			(progress, total) => {
				readline.clearLine(process.stdout, 0);
				readline.cursorTo(process.stdout, 0);
				process.stdout.write("Downloading and unzipping " + matches[i].id + " " + (i + 1) + "/" + matches.length + " (" + ((progress * 100) / total).toFixed(2) + "%)");

				if (((progress * 100) / total).toFixed(2) === 100.00) {
					process.stdout.write("\r\n");
					console.log("Unpacking...");
				}
			}
		).catch(console.error);
		if (!files) {
			console.lop("Error during " + matches[i].id);
			continue;
		}

		// Incase we unboxed a best of 3
		for (let file of files) {
			process.stdout.write("Parsing demo 0.00%");

			let data = await getSouvenirDrops(file, (progress) => {
				readline.clearLine(process.stdout, 0);
				readline.cursorTo(process.stdout, 0);
				process.stdout.write("Parsing demo " + (progress * 100).toFixed(2) + "%");
			}).catch(console.error);
			if (!data) {
				console.lop("Error during " + file + " @ " + matches[i].id);
				continue;
			}

			data.HLTV_MATCH_ID = matches[i].id;

			TOTAL_SOUVENIR_DROPS.push(data);

			process.stdout.write("\r\n");
		}

		console.log(TOTAL_SOUVENIR_DROPS.length + " total match" + (TOTAL_SOUVENIR_DROPS.length === 1 ? "" : "es") + " collected");
		fs.writeFileSync(path.join(__dirname, "/../", "output", identifier + ".json"), JSON.stringify(TOTAL_SOUVENIR_DROPS, null, 4));
	}

	console.log("Downloaded and parsed all matches!");

	fs.writeFileSync(path.join(__dirname, "/../", "output", identifier + ".json"), JSON.stringify(TOTAL_SOUVENIR_DROPS, null, 4));
})();
