(function(){
	"use strict";
	// var fs = require('fs'),
	// 	program = require('commander'),
	// 	XLSX = require('xlsx'),
	// 	_ = require ("underscore"),
	// 	util = require('./util.js'); 

	var Excel = require('exceljs');

	// program
	// 	.version('0.0.1')
	// 	.option('-d, --date [date]', 'Look up for [date]')
	// 	.parse(process.argv);



try {
var workbook = new Excel.Workbook();
	console.info("hey");

	workbook.xlsx.readFile(__dirname + '/ContentProgramming.xlsx').then(function(response) {
        console.info("I go the respone");
        console.info(response);
    },function(error){
    	console.error("the error");
    	console.error(error);
    });
	console.info("done!");
	}catch(e){console.info(e);console.info("error");}
})();