(function(){
	"use strict";
	var _ = require ("underscore"),
		util = require('./util.js');


	function _getOutput(workbook, date) {
		var jsonObj = util.getJsonObj(workbook.Sheets["Gift"]);
		var output = _makeOutput(util.parse(jsonObj, date));

		return output;
	}

	function _makeOutput(records){
		// GIFT PAGE
		var giftpage_hero = _.where(records, {"Channel": "GIFTING LANDING PAGE-Hero Spot"});
		var giftpage_themes = _.where(records, {"Channel": "GIFTING LANDING PAGE-Gift Themes"});
		var giftpage_upsells = _.where(records, {"Channel": "GIFTING LANDING PAGE-Club Upsell"});
		var giftpage_select = _.where(records, {"Channel": "GIFTING LANDING PAGE-Gift Shipment ChoicesThemes"});
		var giftpage_select_options = _.where(records, {"Channel": "GIFTING CHOOSE ASSORTMENT-Assortment Options"});

		giftpage_hero = util.getHeroItems(giftpage_hero);
		giftpage_themes = util.getItems(giftpage_themes);
		giftpage_upsells = util.getUpsells(giftpage_upsells);
		giftpage_select = util.getItems(giftpage_select);
		giftpage_select.options = util.getItems(giftpage_select_options);

		var output = {
				giftpage: {
					hero: giftpage_hero,
					themes: giftpage_themes,
					upsells: giftpage_upsells,
					select: giftpage_select
				}
		};

		return output;
	}

	module.exports = function(workbook, date){return _getOutput(workbook, date)}
	
})();