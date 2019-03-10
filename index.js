const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const getEventMatches = require("./helpers/getEventMatches.js");
const config = require("./config.json");

if (config.resetOutputJSON === true) {
	fs.writeFileSync("output.json", "[]");
}

if (config.resetOutputFolder === true) {
	let files = fs.readdirSync(path.join(__dirname, "/output/"));

	for (let file of files) {
		try {
			fs.unlinkSync(path.join(__dirname, "/output/", file));
		} catch(err) {
			console.error(err);
		}
	}
}

let matches = [];

(async () => {
	for (let i = 0; i < config.events.length; i++) {
		console.log("Getting matches for event " + config.events[i] + " " + (i + 1) + "/" + config.events.length);

		let m = await getEventMatches(config.events[i]).catch(console.error);
		if (!m) {
			console.lop("Error during " + config.events[i]);
			continue;
		}

		matches = matches.concat(m);
	}

	matches = [...new Set(matches)];

	let processes = chunkArray(matches, config.matchesPerProcess);

	if (config.allAtOnce === false) {
		for (let i = 0; i < processes.length; i++) {
			console.log("Process: " + (i + 1) + "/" + processes.length);

			await new Promise((resolve, reject) => {
				let p = cp.fork(path.join(__dirname, "/helpers/", "/child.js"), [ getUniqueIdentifier(), processes[i] ].flat());
				p.on("error", reject);
				p.on("exit", resolve);
			}).then(console.log).catch(console.error);
		}
	} else {
		console.log("NOTE: Running all processes at once might make the output buggy and/or ugly!");
		console.log("Will continue in 3 seconds...");
		await new Promise(p => setTimeout(p, 3000));

		let procs = processes.map((proc) => {
			return new Promise((resolve, reject) => {
				let p = cp.fork(path.join(__dirname, "/helpers/", "/child.js"), [ getUniqueIdentifier(), proc ].flat());
				p.on("error", reject);
				p.on("exit", resolve);
			}).then(console.log).catch(console.error);
		});

		await Promise.all(procs);
	}

	console.log("Successfully parsed all event matches");
	console.log("Combining results...");

	let total = [];
	fs.readdir(path.join(__dirname, "/output/"), (err, files) => {
		if (err) {
			console.error(err);
			return;
		}

		files.filter(f => f.endsWith(".json")).forEach((file) => {
			try {
				let part = JSON.parse(fs.readFileSync(path.join(__dirname, "/output/", file)));
				total = total.concat(part);
			} catch(err) {
				console.error(err);
			}
		});

		let curOut = JSON.parse(fs.readFileSync(path.join(__dirname, "/output.json")));
		total = curOut.concat(total);
		fs.writeFileSync(path.join(__dirname, "/output.json"), JSON.stringify(total, null, 4));

		console.log("Combined results! Total matches parsed: " + total.length);
	});
})();

let INCREMENT = 0;
const EPOCH = 1546300800000;

function getUniqueIdentifier() {
	if (INCREMENT >= 4095) {
		INCREMENT = 0;
	}

	let num = (Date.now() - EPOCH).toString(2).padStart(42, "0") + "0000100000" + (INCREMENT++).toString(2).padStart(12, "0");
	let dec = '';
	
	while (num.length > 50) {
		const high = parseInt(num.slice(0, -32), 2);
		const low = parseInt((high % 10).toString(2) + num.slice(-32), 2);

		dec = (low % 10).toString() + dec;
		num = Math.floor(high / 10).toString(2) + Math.floor(low / 10).toString(2).padStart(32, '0');
	}

	num = parseInt(num, 2);
	while (num > 0) {
		dec = (num % 10).toString() + dec;
		num = Math.floor(num / 10);
	}

	return dec;
}

// Copied from: https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
function chunkArray(myArray, chunk_size) {
	var tempArray = [];

	for (let index = 0; index < myArray.length; index += chunk_size) {
		myChunk = myArray.slice(index, index + chunk_size);
		tempArray.push(myChunk);
	}

	return tempArray;
}
