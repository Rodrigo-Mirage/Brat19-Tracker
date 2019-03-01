import fs from 'fs';
import path from 'path';
import GoogleSpreadsheet from 'google-spreadsheet';
import dropboxV2Api from 'dropbox-v2-api';
import delay from 'delay';
import config from './config.js';

const dropbox = dropboxV2Api.authenticate({
    token: config.token
});
const doc = new GoogleSpreadsheet(config.doc);

let basepath = process.cwd() + '/';
let filename = basepath + 'currentBids.json';
let baseObj = 
{
    fields: {
        rght: 2,
        event__scheduledatetimefield: "date and time (cdt/utc-3)",
        biddependency: null,
        speedrun__console: "",
        speedrun__endtime: "2015-07-26T21:43:00Z",
        speedrun__category: null,
        event__locked: true,
        event__public: "BRazilians Against Time 2019",
        lft: 1,
        revealedtime: "2015-07-14T20:43:18Z",
        event__schedulesetupfield: "post-game setup",
        speedrun__deprecated_runners: "gamepro11",
        total: "900.00",
        event: 18,
        event__donationemailsender: "",
        event__name: "BRazilians Against Time 2019",
        goal: "800.00",
        allowuseroptions: false,
        speedrun__description: "Sonic's Story",
        event__schedulerunnersfield: "runner(s)",
        event__usepaypalsandbox: false,
        state: "OPEN",
        tree_id: 116,
        event__timezone: "America/Sao_Paulo",
        event__schedulecommentsfield: "comments",
        speedrun__starttime: "2015-07-26T21:00:00Z",
        public: "Sonic Adventure DX -- BIG THE CAT",
        speedrun__order: 4,
        speedrun__commentators: "",
        description: "THIS IS VERY IMPORTANT AND CANON TO THE SONIC FRANCHISE, ALSO THE GUY WHO VOICED DUKE NUKEM VOICED BIG!",
        parent: null,
        speedrun__setup_time: 0,
        event__schedulegamefield: "game",
        event__paypalcurrency: "BRL",
        event__date: "2015-07-26",
        event__scheduleestimatefield: "estimate",
        event__receivername: "APAE",
        event__schedulecommentatorsfield: "couch commentator(s)",
        speedrun__run_time: 0,
        speedrun__public: "Sonic Adventure DX (BRazilians Against Time 2019)",
        count: 39,
        istarget: true,
        name: "BIG THE CAT",
        level: 0,
        shortdescription: "Sonic Adventure DX\\nBonus run as Big the Cat",
        event__targetamount: "1000000.00",
        speedrun__name: "Sonic Adventure DX",
        speedrun__release_year: null,
        event__scheduletimezone: "America/Sao_Paulo",
        event__short: "brat2019",
        speedrun: 1118,
        event__paypalemail: ""
    },
    model: "tracker.bid",
    pk: 3038
}
let finalObj;

function cloneObject(){
	return JSON.parse(JSON.stringify(baseObj));
}

(async function(){
	function saveFile(){
		let stream = fs.createWriteStream(filename);
		stream.write(JSON.stringify(finalObj));
		dropbox({
		    resource: 'files/upload',
		    parameters: {
			    path: "/brat2019/currentBids.json",
			    mode: "overwrite",
			    autorename: false,
			    mute: false,
			    strict_conflict: false
			},
		    readStream: fs.createReadStream(filename)
		}, (err, result, response) => {
		    if (err) { return console.log('err:', err); }
		    else { console.log("Uploaded file"); } 
		    //console.log(result);
		    //console.log(response.headers);
		});
	}
	// Essa função é a função que vai pegar os dados do gdocs
	async function query(){
		let gotInfo = false;
		doc.getInfo(function(err, info){
			if (err) console.log(err);
			let sheet = info.worksheets[0];
			// Primeira página da sheet
			let masterObject = [];
			// pra cada bid war, adicionar ao master object
			sheet.getCells({
		      'min-row': 9,
		      'max-row': 9,
		      'return-empty': false
		    }, function(err, cells) {
		    	if (err) console.log(err);
		    	//console.log(cells[0].numericValue);
		    	//console.log(cells[2].numericValue);
		    	let total = cells[0].numericValue + cells[2].numericValue;
		    	let parentObject = cloneObject();
		    	parentObject.fields.speedrun__description = 'Save or Kill the Animals';
		    	parentObject.fields.public = 'Super Metroid';
		    	parentObject.fields.total = total;
		    	parentObject.fields.goal = null;
		    	parentObject.fields.name = 'Save or Kill the Animals';
		    	parentObject.fields.tree_id = 1;
		    	parentObject.fields.lft = 1;
		    	parentObject.fields.rght = 6;
		    	parentObject.pk = 1;
		    	masterObject.push(parentObject);
		    	let newObject = cloneObject();
		    	newObject.fields.speedrun__description = 'Save the Animals';
		    	newObject.fields.public = 'Super Metroid';
		    	newObject.fields.total = cells[0].numericValue;
		    	newObject.fields.goal = null;
		    	newObject.fields.name = 'Save';
		    	newObject.fields.tree_id = 1;
		    	newObject.fields.lft = 2;
		    	newObject.fields.parent__lft = 1;
		    	newObject.fields.rght = 5;
		    	newObject.fields.parent__name = 'Save or Kill the Animals';
		    	newObject.fields.parent = 1;
		    	newObject.pk = 2;
		    	masterObject.push(newObject);
		    	let newObject2 = cloneObject();
		    	newObject2.fields.speedrun__description = 'Kill the Animals';
		    	newObject2.fields.public = 'Super Metroid';
		    	newObject2.fields.total = cells[2].numericValue;
		    	newObject2.fields.goal = null;
		    	newObject2.fields.name = 'Kill';
		    	newObject2.fields.tree_id = 1;
		    	newObject2.fields.lft = 3;
		    	newObject2.fields.parent__lft = 1;
		    	newObject2.fields.rght = 3;
		    	newObject2.fields.parent__name = 'Save or Kill the Animals';
		    	newObject2.fields.parent = 1;
		    	newObject2.pk = 3;
		    	masterObject.push(newObject2);
		    	finalObj = masterObject;
		    	gotInfo = true;
			});
		});
		while(!gotInfo){
			await delay(1000);
		}
	}

	console.log("Starting");
	while(1) {
		console.log("Querying");
		await query();
		console.log("Saving");
		await saveFile();
		await delay(30000);
	}
})();