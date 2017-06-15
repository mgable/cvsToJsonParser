(function(){
	"use strict";
	var _ = require ("underscore"),
		util = require('./util.js');


	function _getOutput(workbook, date) {
		var jsonObj = util.getJsonObj(workbook.Sheets["Landing Page Programming"]);
		var output = _makeOutput(util.parse(jsonObj, date));

		// util.save("landingPage", util.parse(jsonObj, date));

		return output;
	}

	function _makeOutput(records){
		// NAV BAR

		var navbar = _.where(records, {"Channel": "NAV BAR"}),
			footer = _.where(records, {"Channel": "FOOTER"})

			navbar = _.extend({}, util.getNavBarButton(navbar), util.getQuote(footer, "footerQuote"));

		// HOME PAGE
		var homepage_hero,
			homepage_video = {},
			homepage_carousel = [],
			homepage_featured = {},
			homepage_related = [];

		var homepage_video_url = _.find(records, {"Channel": "HOMEPAGE-Video Section"});
		// TEMP !!!
		homepage_video.value = {url: homepage_video_url.value};
		var homepage_featured = _.where(records, {"Channel": "HOMEPAGE-Featured Bottle Section"});
		var homepage_carousel = _.where(records, {"Channel": "HOMEPAGE-Featured Pack Carousel"});
		var homepage_hero = _.where(records, {"Channel": "HOMEPAGE-Hero Spot"});
		var homepage_related = _.where(records, {"Channel": "HOMEPAGE-Related Content"});

		homepage_carousel = (_.groupBy(homepage_carousel, function(record){
			return record.Location.match(/\d/)[0];
		}));
		homepage_carousel = _.map(homepage_carousel, util.getCarouselItems);

		homepage_related = (_.groupBy(homepage_related , function(record){
			return record.Location.match(/\d/)[0];
		}));
		homepage_related = _.map(homepage_related, util.getRelated);

		homepage_hero = util.getHeroItems(homepage_hero);

		homepage_featured = util.getFeaturedItems(homepage_featured);

		// SEASONAL PAGE
		var seasonalpage_hero = _.where(records, {"Channel": "SEASONAL LANDING PAGE-Hero Spot"});
		var seasonalpage_featured = _.where(records, {"Channel": "SEASONAL LANDING PAGE-Featured Wine Triptych"});
		var seasonalpage_carousel = _.where(records, {"Channel": "SEASONAL LANDING PAGE-Seasonal Recipes Carousel"});
		var seasonalpage_triptych = _.where(records, {"Channel": "SEASONAL LANDING PAGE-Seasonal Tips Triptych"});

		seasonalpage_featured = util.getFeaturedItems(seasonalpage_featured);

		seasonalpage_hero = util.getHeroItems(seasonalpage_hero);

		// TEMP !!!
		seasonalpage_hero.images = "['assets/explore_page/hero.jpg', (default)], ['assets/seasonal_page/hero.jpg', (medium)],['assets/seasonal_page/hero.jpg', (large)]";

		seasonalpage_carousel = (_.groupBy(seasonalpage_carousel, function(record){
			return record.Location.match(/\d/)[0];
		}));
		seasonalpage_carousel = _.map(seasonalpage_carousel,  util.getCarouselItems);

		seasonalpage_triptych = util.group(seasonalpage_triptych);

		seasonalpage_triptych =   util.getTriptychItems(seasonalpage_triptych);

		// EXPLORE PAGE
		var explorepage_hero = _.where(records, {"Channel": "EXPLORE LANDING PAGE-Hero Spot"});
		var explorepage_featured = _.where(records, {"Channel": "EXPLORE LANDING PAGE-Featured Wine Triptych"});
		var explorepage_carousel = _.where(records, {"Channel": "EXPLORE LANDING PAGE-Explore Carousel "}); // NOTE: trailing space
		var explorepage_related = _.where(records, {"Channel": "EXPLORE LANDING PAGE-Explore Recipes Carousel"});

		explorepage_carousel = ( util.group(explorepage_carousel));

		explorepage_carousel =  util.getTriptychItems(explorepage_carousel);

		explorepage_hero =  util.getItems(explorepage_hero);
		explorepage_featured =  util.getFeaturedItems(explorepage_featured); 

		explorepage_related = (_.groupBy(explorepage_related, function(record){
			return record.Location.match(/\d/)[0];
		}));
		explorepage_related = _.map(explorepage_related,  util.getCarouselItems);

		// TEMP !!!
		explorepage_hero.images = "['assets/explore_page/hero.jpg', (default)], ['assets/explore_page/hero.jpg', (medium)],['assets/explore_page/hero.jpg', (large)]";

		var output = {
			navbar: navbar,
			homepage:{
				hero: homepage_hero,
				carousel: homepage_carousel,
				video: homepage_video.value,
				featured: homepage_featured,
				related: homepage_related
			},
			seasonalpage: {
				hero: seasonalpage_hero,
				featured: seasonalpage_featured,
				carousel: seasonalpage_carousel,
				triptych: seasonalpage_triptych
			},
			explorepage: {
				hero: explorepage_hero,
				featured: explorepage_featured,
				carousel: explorepage_carousel,
				related: explorepage_related
			}
		};

		return output;
	}

	module.exports = function(workbook, date){return _getOutput(workbook, date)}
	
})();