(function(){
	"use strict";

	var exports = {};

	var _ = require('underscore'),
	fs = require('fs'),
		XLSX = require('xlsx');

	var channel = false, element = false, currentChannel = false;

	function _parse(obj, targetDate){
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

	function _save(name, data){
		fs.writeFileSync(name + "-XLSX-output.json", JSON.stringify(data));
	}

	function _getUpsells(record){
		var PreTitle = _.find(record, function(item){
				if (/(S|s)econdary/.test(item.Location)){
					return false;
				}

				return /\bPre[ -]?(T|t)itle( Copy)?\b/.test(item.Location)
			}),
			Title = _.find(record, function(item){
				if (/(S|s)econdary/.test(item.Location)){
					return false;
				}
				return /\bTitle\b( Copy)?/.test(item.Location);
			}),
			SecondaryTitle = _.find(record, function(item){return /Upsell Secondary Title Copy/i.test(item.Location)}),
			SecondaryPreTitle =  _.find(record, function(item){return /Upsell Secondary SubTitle Copy/i.test(item.Location)});

		return {headline: Title.value, tagline: PreTitle.value, secondaryTitle: SecondaryTitle.value, secondaryTagline: SecondaryPreTitle.value}

	}

	function _getJsonObj(worksheet){
		return XLSX.utils.sheet_to_json(worksheet);
	}

	function _getChannel(record){
		if (record.Channel === record.Channel.toUpperCase()){
			currentChannel = record.Channel;
			return record.Channel;
		} else {
			return currentChannel + "-" + record.Channel;
		}
	}

	function _getNavBarButton(record){
		var button = _.find(record, function(item){return (/Link 1 Copy/.test(item.Location))});
		return {buttonCopy: button.value};
	}

	function _getCarouselItems(record){
		return _.extend({}, _getItems(record), {buttonText: "View Pack", image: "assets/carousel_1.jpg"});
	}

	function _getFeaturedItems(record){
		return _.extend({}, _getItems(record), _getButton(record), _getSKUs(record));
	}

	function _getHeroItems(record){
		return _.extend({}, _getItems(record), _getButton(record), _getPrice(record));
	}

	function _getPrice(record){
		var obj = {},
			packAmount = _.find(record, function(item){return /\bPack Amount\b/i.test(item.Location)}),
			packPrice =  _.find(record, function(item){return /\bPack Price\b/i.test(item.Location)});

			if (packAmount && packAmount.value){
				obj["priceDetail"] = packAmount.value;
			}
		
			if (packPrice && packPrice.value){
				obj.price = packPrice.value;
			}
			
		return _.extend({}, obj);
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
		var SKUs = _.filter(record, function(item){return /Featured Wine Copy/.test(item.Location)}); // //(SKU|sku)
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
			PreTitle = _.find(record, function(item){return /\b(P|p)re[ -]?(T|t)itle( Copy)?\b/.test(item.Location)}),
			Title = _.find(record, function(item){
				if (/(P|p)re/.test(item.Location)){
					return false;
				} else if (/(S\s)ub/.test(item.Location)){
					return false
				}
				return /\b(T|t)itle\b( Copy)?/.test(item.Location);
			}),
			SubTitle = _.find(record, function(item){return /(\b(S|s)ub[ -]?(T|t)itle( Copy)?\b)|(\b(S|s)ubcopy (T|t)itle\b)/i.test(item.Location)}),
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

	function _getRelated(record){
		return _.extend({}, _getItems(record), _getButton(record));
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

	function _groupByWhich(records, which, group){
		var group = group || 0;
		return _.groupBy(records, function(record){
			var re = new RegExp(which),
				match = record.Location.match(re);

			if (match && match.length){
				return match[group];
			} else {
				return "main";
			}
		});
	}

	function _getQuote(record, set){
		var result = _.find(record, function(item){
			return /Quote/.test(item.Location)
		});

		return ((result && result.value ) ? {[set]: result.value} : null);
	}

	function _getFaqSection(record){
		return _groupByWhich(record, "\\b(A|Q)(\\d{1,2})",2);
	}

	exports.getChannel = _getChannel;
	exports.getRelated = _getRelated;
	exports.getSKUs = _getSKUs;
	exports.getQuote = _getQuote;
	exports.group = _group;
	exports.getItems = _getItems;
	exports.getTriptychItems = _getTriptychItems;
	exports.getButton = _getButton;
	exports.getHeroItems = _getHeroItems;
	exports.getFeaturedItems =_getFeaturedItems;
	exports.getCarouselItems = _getCarouselItems;
	exports.parse = _parse;
	exports.getJsonObj = _getJsonObj;
	exports.getUpsells = _getUpsells;
	exports.getNavBarButton = _getNavBarButton;
	exports.save = _save;
	exports.getFaqSection = _getFaqSection;

	module.exports = exports;
})();
