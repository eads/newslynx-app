views.helpers = {
	toggleModal: function(e){
		e.preventDefault();
		e.stopPropagation();
		var $tray = $(e.currentTarget).parents('.modal-parent').find('.modal-outer');
		$tray.toggleClass('active', !$tray.hasClass('active'));
		// This will set `overflow: hidden` so you can't horizontal scroll
		$('body').attr('data-modal', $tray.hasClass('active'));

		// Center it
		this.centerishInViewport( $tray.find('.modal-inner') );
	},
	centerishInViewport: function($el){
		// Center the element horizontally and in the top third vertically
		var el_width = $el.outerWidth(),
		    el_height = $el.outerHeight(),
		    v_width = $(window).width(),
		    v_height = $(window).height();

		$el.css({
			top: (v_height/2 - (el_height))/v_height*100 + '%',
			left: (v_width/2 - (el_width/2))/v_width*100 + '%' // This line calculation can be improved
		});
	},
	formSerialToObject: function(formInputsArray){
		// This is an array of objects for each `input` field
		// Each object contains `name` and `value` For instance:
		/* 
			name: "name"
			value: "Mentions of fracking coverage"
		*/

		// Transform an array of objects into an array of tuples
		var inputArrays = formInputsArray.map(function(inputObj) { 
			var name_parts;
			// These need some additional mapping in case they are checkbox items
			// This is used to detect some unusual situations where we need to nest objects. TODO, assignee
			if ( inputObj.name.indexOf('impact_tags|') != -1 || inputObj.name.indexOf('asignee|') != -1 ){
				name_parts = inputObj.name.split('|');
				inputObj.name = name_parts[0];
				inputObj.value = name_parts[1];
			}
			return inputObj
		});

		// Convert these into objects. We've cut out the `name` `value` parts of the object and nested things with multiple keys as an array
		// This is probably possible through underscore chaining of `groupBy`, `map`, then some type of use of `object` but this works too.
		var inputObj = d3.nest()
		    .key(function(d) { return d.name })
		    .rollup(function(list){
		        if (list.length == 1) return list[0].value;
		        else return list.map(function(f) { return f.value });
		    })
		    .map(inputArrays);
/*
		{
				name: "Mentions of fracking coverage"
		}
*/
		return inputObj;
	},
	remodelRecipeJson: {
		create: function(formInfo, formInputsArray, setDefaultEvent){
			var input_obj = views.helpers.formSerialToObject(formInputsArray);
			// console.log(input_obj)
			// Do some custom manipulations to get this object properly nested
			// Put the name on the top leve lobject
			formInfo.name = input_obj.name;
			// Delete it from the settings
			delete input_obj.name;
			// Add all the form information under settings
			formInfo.settings = input_obj;
			// Add the defaults, the values of which will need to be extracted one by one
			formInfo.default_event = {};
			if (setDefaultEvent) { 
				formInfo.default_event = {
					title: input_obj.title,
					what_happened: input_obj.what_happened,
					significance: input_obj.significance,
					impact_tags: input_obj.impact_tags
				}
			}
			// Delete the default events from the object
			delete input_obj.title;
			delete input_obj.what_happened;
			delete input_obj.significance;
			delete input_obj.impact_tags;
			
			return formInfo;

		},
		update: function(formInfo, formInputsArray, setDefaultEvent){
			var input_obj = views.helpers.formSerialToObject(formInputsArray);
			// Do some custom manipulations to get this object properly nested
			// Put the name on the top leve lobject
			formInfo.name = input_obj.name;
			// Delete a few things from the settings
			delete input_obj.name;
			delete input_obj.pending;
			// Add all the form information under settings
			formInfo.settings = input_obj;
			// And eventually add a defaults, the values of which will need to be extracted one by one
			formInfo.default_event = {};

			return formInfo;
		}
	}
}