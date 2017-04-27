(function(){
	"use strict";
	var _ = require ("underscore"),
		util = require('./util.js');


	function _getOutput(workbook, date) {
		var jsonObj = util.getJsonObj(workbook.Sheets["Help"]);
		var output = _makeOutput(util.parse(jsonObj, date));

		//util.save("help", util.parse(jsonObj, date));

		return output;
	}

	function _getContentFrom(records, where, obj){
		var temp = _.where(records, {"Channel": where}), //"NAV BAR-About"
			section = util.getFaqSection(temp),
			main = _.pick(section, 'main');

		obj.main =  {headline: ((main.main && main.main.length && main.main[0].value)  || "TBD")} //helppage_sectionone
		obj.faqs = _.map(_.omit(section, 'main'), function(item){ //helppage_sectionone
			return {"question":item[0].value, "answer": item[1].value};
		});
	}


	function _makeOutput(records){
		// GIFT PAGE
		var helppage_sectionone = {},
			helppage_sectiontwo = {},
			helppage_sectionthree = {},
			helppage_sectionfour = {},
			helppage_sectionfive = {},
			helppage_sectionsix = {},
			helppage_sectionseven = {},
			helppage_sectioneight = {},
			helppage_header;
	
		helppage_header = _.where(records, {"Channel": "HELP-Top Header Section"});
		helppage_header = util.getItems(helppage_header);

		_getContentFrom(records, "HELP-About", helppage_sectionone);
		_getContentFrom(records, "HELP-More About Membership", helppage_sectiontwo);
		_getContentFrom(records, "HELP-More About Gifting", helppage_sectionthree);
		_getContentFrom(records, "HELP-Order Support", helppage_sectionfour);
		_getContentFrom(records, "HELP-Billing Support", helppage_sectionfive);
		_getContentFrom(records, "HELP-Voucher Support", helppage_sectionsix);
		_getContentFrom(records, "HELP-Shipping Support", helppage_sectionseven);
		_getContentFrom(records, "HELP-Technical Support", helppage_sectioneight);

		var output = {
				helppage: {
					header: helppage_header,
					sectionone: helppage_sectionone,
					sectiontwo: helppage_sectiontwo,
					sectionthree: helppage_sectionthree,
					sectionfour: helppage_sectionfour,
					sectionfive: helppage_sectionfive,
					sectionsix: helppage_sectionsix,
					sectionseven: helppage_sectionseven,
					sectioneight: helppage_sectioneight
				}
		};

		return output;
	}

	module.exports = function(workbook, date){return _getOutput(workbook, date)}

})();