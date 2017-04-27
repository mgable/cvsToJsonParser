(function(){
	"use strict";
	var _ = require ("underscore"),
		util = require('./util.js');


	function _getOutput(workbook, date) {
		var jsonObj = util.getJsonObj(workbook.Sheets["Join"]);
		var output = _makeOutput(util.parse(jsonObj, date));

		return output;
	}


	function _makeOutput(records){
		// GIFT PAGE
		var joinPage_hero,
			joinPage_themes,
			joinPage_upsells;
	
		var joinPage_hero = _.where(records, {"Channel": "CLUB LANDING-Hero Spot"});
		var joinPage_subscription = _.where(records, {"Channel": "CLUB LANDING-Membership Options"});
		var joinPage_related = _.where(records, {"Channel": "CLUB LANDING-Introductory Shipment Carousel"})

		joinPage_hero = util.getHeroItems(joinPage_hero);
		joinPage_subscription = util.getItems(joinPage_subscription);
		joinPage_related = util.getItems(joinPage_related);

		var output = {
				joinpage: {
					hero: joinPage_hero,
					subscription: joinPage_subscription,
					related: joinPage_related
				}
		};

		return output;
	}

	module.exports = function(workbook, date){return _getOutput(workbook, date)}

})();