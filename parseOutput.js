const fs = require("fs");
const moment = require("moment");
require("moment-duration-format")(moment);

const data = require("./output.json");

let totalText = [];
let og = console.log;
console.log = (input) => {
	og(input);

	if (typeof input === "string") {
		totalText.push(input);
	}
}

let TOTAL_DROPS_ALL = [];
const calculated = [];

for (let i = 0; i < data.length; i++) {
	calculated.push({
		matchid: data[i].HLTV_MATCH_ID,
		matchLength: data[i].metadata.playbackTime,
		totalDrops: data[i].drops.length,
		dropsPerTick: (data[i].drops.length / data[i].metadata.playbackTicks),
		dropsPerSecond: ((data[i].drops.length / data[i].metadata.playbackTicks) * 128),
		dropsPerMinute: ((data[i].drops.length / data[i].metadata.playbackTicks) * 128 * 60),
		groups: []
	});

	TOTAL_DROPS_ALL = TOTAL_DROPS_ALL.concat(data[i].drops);

	let grouped = data[i].drops.reduce((result, stats) => {
		const a = result.find(({ accountid }) => accountid === stats.accountid);
		a ? a.stats.push(stats) : result.push({ accountid: stats.accountid, stats: [ stats ] });
		return result;
	}, []);

	// Remove all the 1 drop plebs
	let drps = 1;
	grouped = grouped.filter(g => g.stats.length > drps);

	while (grouped.length > 0) {
		calculated[i].groups.push(grouped);
		drps += 1;
		grouped = grouped.filter(g => g.stats.length > drps);
	}
}

const PARSED_OUTPUT = calculated.map((data) => {
	let msg = [];

	msg.push("Info for match: " + data.matchid);
	msg.push("Match Length: " + moment.duration(data.matchLength, "seconds").format("hh:mm:ss", { trim: false }));
	msg.push("Total drops: " + data.totalDrops);
	msg.push("Drops per tick: " + data.dropsPerTick.toFixed(5));
	msg.push("Drops per second: " + data.dropsPerSecond.toFixed(5));
	msg.push("Drops per minute: " + data.dropsPerMinute.toFixed(5));

	data.groups.forEach((group, index) => {
		msg.push(group.length + " with more than " + (index + 1) + " drops");

		if (group.length <= 5) {
			msg.push("	- " + group.map(g => g.accountid).join("\n	- "));
		}
	});

	return msg.join("\n");
});

// Total drops calculation
let grouped = TOTAL_DROPS_ALL.reduce((result, stats, index) => {
	if (index % 10000 === 0) {
		console.log(index + "/" + TOTAL_DROPS_ALL.length);
	}

	const a = result.find(({ accountid }) => accountid === stats.accountid);
	a ? a.stats.push(stats) : result.push({ accountid: stats.accountid, stats: [ stats ] });
	return result;
}, []);

// Log! (Really ugly)
console.log(PARSED_OUTPUT.join("\n" + "-".repeat(30) + "\n"));
console.log("Got a global total of " + TOTAL_DROPS_ALL.length + " drop" + (TOTAL_DROPS_ALL.length === 1 ? "" : "s"));

console.log(grouped); // All unique users which got a drop in any shape or form
console.log(grouped.filter(g => g.stats.length === 1)); // 1 drop
console.log(grouped.filter(g => g.stats.length === 2)); // 2 drops
console.log(grouped.filter(g => g.stats.length === 3)); // 3 drops
console.log(grouped.filter(g => g.stats.length === 4)); // 4 drops
console.log(grouped.filter(g => g.stats.length === 5)); // 5 drops
console.log(grouped.filter(g => g.stats.length === 6)); // 6 drops
console.log(grouped.filter(g => g.stats.length === 7)); // 7 drops
console.log(grouped.filter(g => g.stats.length === 8)); // 8 drops
console.log(grouped.filter(g => g.stats.length === 9)); // 9 drops
console.log(grouped.filter(g => g.stats.length === 10)); // 10 drops
console.log(grouped.filter(g => g.stats.length === 11)); // 11 drops
console.log(grouped.filter(g => g.stats.length === 12)); // 12 drops
console.log(grouped.filter(g => g.stats.length === 13)); // 13 drops
console.log(grouped.filter(g => g.stats.length === 14)); // 14 drops
console.log(grouped.filter(g => g.stats.length === 15)); // 15 drops

fs.writeFileSync("output.txt", totalText.join("\n"));

setInterval(() => {}, 1000000);
