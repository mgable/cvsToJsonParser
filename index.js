(function(){
	"use strict";
	var fs = require('fs'),
		program = require('commander'),
		_ = require ("underscore");


	program
		.version('0.0.1')
		.option('-d, --date [date]', 'Look up for [date]')
		.parse(process.argv);
		
	var targetDate = program.date || "3/6/17";

	console.info(targetDate);

	//foo();

	var XLSX = require('xlsx');
	var workbook = XLSX.readFile('MyContentProgramming.xlsx');
	var path = "/Users/markgable/Sites/drinks/drinks-com/apps/marthastewartwine.com/app/assets/javascripts/"
	var worksheet = workbook.Sheets["Landing Page Programming"];
	var jsonObj = XLSX.utils.sheet_to_json(worksheet)
	var output = _makeOutput(_parse(jsonObj));

	console.info(JSON.stringify(output, null, 4));

	var header = "var MSW = MSW || {}; MSW.data = "

	fs.writeFileSync("raw-XLSX-output.json", JSON.stringify(_parse(jsonObj)));
	fs.writeFileSync(path + "_data.js", "var MSW = MSW || {}; MSW.data = " + JSON.stringify(output));

	var channel = false, element = false, currentChannel = false;

	function _parse(obj){
		return _.filter(_.map(obj, function(record){
			if (record[targetDate]){
				var Channel = channel,
					Location = record.Location;
				return {"value": record[targetDate], Channel, Location};
			} else {
				if (_.keys(record).length === 1){
					channel = _getChannel(record);
				}
			}
		}), function(record){
			return record;
		});
	}

	function _getChannel(record){
		if (record.Channel === record.Channel.toUpperCase()){
			currentChannel = record.Channel;
			return record.Channel;
		} else {
			return currentChannel + "-" + record.Channel;
		}
	}


	function _getCarouselItems(record){
		return _.extend({}, _getItems(record), {buttonText: "View Pack", image: "assets/carousel_1.jpg"});
	}

	function _getFeaturedItems(record){
		return _.extend({}, _getItems(record), _getButton(record), _getSKUs(record));
	}

	function _getButton(record){
		var obj = {},
			ButtonCopy = _.find(record, function(item){return /\b(Button|Link) Copy\b/i.test(item.Location)}),
			ButtonURL = _.find(record, function(item){return /\b(Button|Link) URL\b/i.test(item.Location)});


		if (ButtonCopy && ButtonCopy.value){
			obj.buttonCopy = ButtonCopy.value
		} 

		if (ButtonURL && ButtonURL.value){
			obj.buttonURL = ButtonURL.value
		}

		return _.extend({}, obj);
	}

	function _getSKUs(record){
		var SKUs = _.filter(record, function(item){return /Featured Wine SKU/.test(item.Location)});
		return {"SKUs": _.pluck(SKUs, "value")};
	}

	function _getTriptychItems(record){
		var main = _getItems(record.main),
			items = _.pick(record, function(value, key){
				return parseInt(key);
			});

		items = _.map(items, _getItems);

		return _.extend({}, main, {items: items});
	}

	function _getItems(record){
		var obj = {},
			PreTitle = _.find(record, function(item){return /\bPre[ -]?Title( Copy)?\b/.test(item.Location)}),
			Title = _.find(record, function(item){
				if (/(P|p)re/.test(item.Location)){
					return false;
				} else if (/(S\s)ub/.test(item.Location)){
					return false
				}
				return /\bTitle\b( Copy)?/.test(item.Location);
			}),
			SubTitle = _.find(record, function(item){return /(\bSub[ -]?Title Copy\b)|(\bSubcopy Title\b)/i.test(item.Location)}),
			Image =  _.find(record, function(item){return /\bImage\b/.test(item.Location)});



		if (PreTitle && PreTitle.value){
			obj.tagline = PreTitle.value;
		}

		if (Title && Title.value){
			obj.headline = Title.value;
		}

		if (SubTitle && SubTitle.value){
			obj.subhead = SubTitle.value
		}

		if (Image && Image.value){
			obj.image = Image.value
		}

		return obj;
	}

	function _group(records){
		return _.groupBy(records, function(record){
			var match = record.Location.match(/\d/);

			if (match && match.length){
				return match[0];
			} else {
				return "main";
			}
		});
	}

	function _get(record, set){
		var result = _.find(record, function(item){
			return /Quote/.test(item.Location)
		});

		console.info(result);

		return ((result && result.value ) ? {[set]: result.value} : null);
	}


	function _makeOutput(records){
		// NAV BAR

		var navbar = _.where(records, {"Channel": "NAV BAR"});

			navbar = _.extend({}, _getButton(navbar),_get(navbar, "footerQuote"));

		// HOME PAGE
		var homepage_hero,
			homepage_video,
			homepage_carousel = [],
			homepage_featured = {},
			homepage_related = [];

		var homepage_video = _.find(records, {"Channel": "HOMEPAGE-Video Section"});
		// TEMP !!!
		homepage_video.value = {url: "https://player.vimeo.com/video/40880086"};
		var homepage_featured = _.where(records, {"Channel": "HOMEPAGE-Featured Bottle Section"});
		var homepage_carousel = _.where(records, {"Channel": "HOMEPAGE-Featured Pack Carousel"});
		var homepage_hero = _.where(records, {"Channel": "HOMEPAGE-Hero Spot"});
		var homepage_related = _.where(records, {"Channel": "HOMEPAGE-Related Content"});

		homepage_carousel = (_.groupBy(homepage_carousel, function(record){
			return record.Location.match(/\d/)[0];
		}));
		homepage_carousel = _.map(homepage_carousel, _getCarouselItems);

		homepage_related = (_.groupBy(homepage_related , function(record){
			return record.Location.match(/\d/)[0];
		}));
		homepage_related = _.map(homepage_related, _getItems);

		// TEMP !!!
		homepage_related[0].images = "['assets/home_page/news_1.jpg', (default)], ['assets/home_page/news_1.jpg', (medium)],['assets/home_page/news_1.jpg', (large)]";
		// TEMP !!!
		homepage_related[1].images = "['assets/home_page/news_2.jpg', (default)], ['assets/home_page/news_2.jpg', (medium)],['assets/home_page/news_2.jpg', (large)]";

		homepage_hero = _getItems(homepage_hero);
		// TEMP !!!
		homepage_hero.images = "['assets/home_page/hero.jpg', (default)], ['assets/home_page/hero.jpg', (medium)],['assets/home_page/hero.jpg', (large)]";
		

		homepage_featured = _getFeaturedItems(homepage_featured);

		// SEASONAL PAGE
		var seasonalpage_hero = _.where(records, {"Channel": "SEASONAL LANDING PAGE-Hero Spot"});
		var seasonalpage_featured = _.where(records, {"Channel": "SEASONAL LANDING PAGE-Featured Wine Triptych"});
		var seasonalpage_carousel = _.where(records, {"Channel": "SEASONAL LANDING PAGE-Seasonal Recipes Carousel"});
		var seasonalpage_triptych = _.where(records, {"Channel": "SEASONAL LANDING PAGE-Seasonal Tips Triptych"});

		seasonalpage_featured = _getFeaturedItems(seasonalpage_featured);

		seasonalpage_hero = _getItems(seasonalpage_hero);

		// TEMP !!!
		seasonalpage_hero.images = "['assets/explore_page/hero.jpg', (default)], ['assets/seasonal_page/hero.jpg', (medium)],['assets/seasonal_page/hero.jpg', (large)]";

		seasonalpage_carousel = (_.groupBy(seasonalpage_carousel, function(record){
			return record.Location.match(/\d/)[0];
		}));
		seasonalpage_carousel = _.map(seasonalpage_carousel, _getCarouselItems);

		seasonalpage_triptych = _group(seasonalpage_triptych);

		seasonalpage_triptych =  _getTriptychItems(seasonalpage_triptych);

		// EXPLORE PAGE
		var explorepage_hero = _.where(records, {"Channel": "EXPLORE LANDING PAGE-Hero Spot"});
		var explorepage_featured = _.where(records, {"Channel": "EXPLORE LANDING PAGE-Featured Wine Triptych"});
		var explorepage_carousel = _.where(records, {"Channel": "EXPLORE LANDING PAGE-Explore Carousel "}); // NOTE: trailing space
		var explorepage_related = _.where(records, {"Channel": "EXPLORE LANDING PAGE-Explore Recipes Carousel"});

		explorepage_carousel = (_group(explorepage_carousel));

		explorepage_carousel = _getTriptychItems(explorepage_carousel);

		explorepage_hero = _getItems(explorepage_hero);
		explorepage_featured = _getFeaturedItems(explorepage_featured); 

		explorepage_related = (_.groupBy(explorepage_related, function(record){
			return record.Location.match(/\d/)[0];
		}));
		explorepage_related = _.map(explorepage_related, _getCarouselItems);

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

	var dictionary = {
		"NAV BAR" : {
			"Location": {
				"Link URL": {
					"Seasonal Landing Spring": "/seasonal"
				}
			}
		}
	}
	
})();