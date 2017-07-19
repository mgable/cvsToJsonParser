(function(){
	"use strict";
	var _ = require ("underscore"),
	fs = require('fs'),
		util = require('./util.js');


	function _getOutput(workbook, date) {
		var jsonObj = util.getJsonObj(workbook.Sheets["Shop"]);
		var output = _makeOutput(util.parse(jsonObj, date));


		//util.save("shop", util.parse(jsonObj, date));

		return output;
	}


	function _makeOutput(records){
		// GIFT PAGE
		var shoppage_featured,
			shoppage_related,
			packpage_carousel;

		var shoppage_category_taglines = _.where(records, {"Channel": "NAV BAR-Category Taglines"});
		shoppage_category_taglines = util.getPLPTaglines(shoppage_category_taglines);
	
		var shoppage_featured = _.where(records, {"Channel": "NAV BAR-Featured Packs Carousel"});
		//var shoppage_related = _.where(records, {"Channel": "NAV BAR-Related Recipes Carousel"});

		shoppage_featured = util.getItems(shoppage_featured);

		// shoppage_related = (_.groupBy(shoppage_related, function(record){
		// 	return record.Location.match(/\d/)[0];
		// }));

		//shoppage_related  = _.map(shoppage_related, util.getCarouselItems);

		var packpage_carousel = _.where(records, {"Channel" :"NAV BAR-Related Content Carousel"});
		packpage_carousel = ( util.group(packpage_carousel));
		packpage_carousel =  util.getTriptychItems(packpage_carousel);

		var output = {
				shoppage: {
					category_taglines: shoppage_category_taglines,
					featured: shoppage_featured,
					//related: shoppage_related
				},
				packpage: {
					carousel: packpage_carousel
				}
		};

		return output;
	}

	module.exports = function(workbook, date){return _getOutput(workbook, date)}

})();