# CSGO Souvenir Drop Counter

Counting souvenir drops for all majors pre-viewer pass. Due to the viewer pass souvenir drops are no longer given out during a match and therefore we have no information for them.

I **highly** recommend using a command prompt to run `node index.js` for getting & parsing the demos, it will include a progress counter, [Visual Studio Code](https://code.visualstudio.com/) does not display `process.stdout.write` at the current moment.

I also **highly** recommend using `parsedOutput.js` only in [Visual Studio Code](https://code.visualstudio.com/), or similar, as the output is gigantic and the debug console of VSC makes is infinitely easier to navigate all of the data.

**THIS WILL USE A LOT OF DATA - FACEIT LONDON 2018 MAJOR CHAMPIONSHIP IS TAKING OVER 50GB ON MY DRIVE**

**ANALYZING ALL OF THE DEMOS WILL TAKE A VERY LONG TIME - FACEIT LONDON 2018 MAJOR CHAMPIONSHIP TOOK ME 8 HOURS** *(all depending on your CPU)*

**RUN THE `index.js` IN A COMMAND PROMPT WITH `node index.js`. RUN THE PARSER USING VISUAL STUDIO CODE FOR BETTER VISUALIZATION**

**WARNING:** The `output.json` file includes all drops throughout all majors. It is a gigantic file, be careful!

# Config
- **events**: `array[integer]` Array of integers - These integers are the event IDs [from HLTV](https://www.hltv.org/events/archive?eventType=MAJOR). You can get the ID by clicking on an event and looking at the URL: `https://www.hltv.org/events/3564/faceit-major-2018` > `3564`
- **matchesPerProcess**: `integer` The script will spawn child processes which will do the actual work. Each process does *this* many amount of matches before exiting
- **allAtOnce**: `boolean` Should we process all matches at once or not? I have **not** tested running them all at once, your CPU might just explode, who knows
- **resetOutputJSON**: `boolean` Should we reset the `output.json` file before starting the parsing process? If you set this to `false` it will combine the old output and the new output together. I recommend to keep this at `true`
- **resetOutputFolder**: `boolean` Should we empty out the `output` folder before starting the parsing process? If you set this to `false` all files in that folder will be combined together to form `output.json`. I recommend to keep this at `true`
