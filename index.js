(function(){
	"use strict";
	var fs = require('fs'),
		program = require('commander'),
		XLSX = require('xlsx'),
		_ = require ("underscore"),
		util = require('./util.js'); 

	program
		.version('0.0.1')
		.option('-d, --date [date]', 'Look up for [date]')
		.option('-f, --file [file]', 'Load file [file]')
		.option('-p, --path [path]', 'Save [file] to [path]')
		.parse(process.argv);


	var defaultDate = "3/6/17";
	var targetDate = program.date || defaultDate;
	var workbook = XLSX.readFile(program.file || 'ContentProgramming.xlsx');
	var path = program.path || __dirname;
	var header = "var MSW = MSW || {}; MSW.data = ";

	var landingpage = require('./indexLanding.js')(workbook, targetDate);
	var giftpage = require('./indexGift.js')(workbook, defaultDate);
	var joinpage = require('./indexJoin.js')(workbook, defaultDate);
	var shoppage = require('./indexShop.js')(workbook, defaultDate);
	var helppage = require('./indexHelp.js')(workbook, defaultDate);

	var output = _.extend({}, landingpage, giftpage, joinpage, shoppage, helppage);  //, joinpage
	
	console.info(JSON.stringify(output, null, 4));

	fs.writeFileSync(path + "/_data.js", header + JSON.stringify(output));
	
})();