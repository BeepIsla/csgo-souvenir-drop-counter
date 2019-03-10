const request = require("request");
const cheerio = require("cheerio");

module.exports = (eventid) => {
	return new Promise((resolve, reject) => {
		let returnAry = [];

		request("https://www.hltv.org/results?event=" + eventid, (err, res, body) => {
			if (err) {
				reject(err);
				return;
			}

			if (res.statusCode !== 200) {
				reject(new Error("Invalid status code: " + res.statusCode));
				return;
			}

			const $ = cheerio.load(body);

			$(".results-sublist")[0].children.forEach((elem) => {
				try {
					let parts = elem.children[0].attribs.href.split("/").filter(p => /^\d+$/.test(p));

					if (parts.length <= 0) {
						return;
					}

					returnAry.push(parseInt(parts[0]));
				} catch(e) {};
			});

			resolve(returnAry);
		});
	});
}
