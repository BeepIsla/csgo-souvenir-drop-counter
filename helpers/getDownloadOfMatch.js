const request = require("request");
const cheerio = require("cheerio");

module.exports = (matchid) => {
	return new Promise((resolve, reject) => {
		let returnAry = [];

		request("https://www.hltv.org/matches/" + matchid + "/-", (err, res, body) => {
			if (err) {
				reject(err);
				return;
			}

			if (res.statusCode !== 200) {
				reject(new Error("Invalid status code: " + res.statusCode));
				return;
			}

			const $ = cheerio.load(body);

			$(".streams")[0].children.forEach((elem) => {
				try {
					let url = elem.children[0].attribs.href;

					if (/^\/download\/demo\/\d+$/.test(url) === false) {
						return;
					}

					returnAry.push("https://www.hltv.org" + url);
				} catch(e) {};
			});

			resolve(returnAry[0]);
		});
	});
}
