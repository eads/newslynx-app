views.DrawerListItem = Backbone.View.extend({

	tagName: 'li',

	className: 'drawer-list-item',

	events: {
		'click .drawer-list-outer': 'setHash',
		'click .enable-switch': 'toggleEnabled',
		'click .cancel': 'toggleModal',
		'click .settings-switch': 'toggleModal',
		'click .modal-overlay': 'toggleModal',
		'click input': 'killEvent',
		'click select': 'killEvent',
		'submit form': 'saveModal',
		'click .destroy': 'destroyModel'
	},

	initialize: function(){
		this.listenTo(this.model, 'change:viewing', this.setActiveCssState);
		this.listenTo(this.model, 'change:enabled', this.renderEnabled);
	},

	render: function(){
		var drawer_list_item_markup = templates.drawerListItemFactory( _.extend(this.model.toJSON(), helpers.templates) );
		this.$el.html(drawer_list_item_markup);
		this.$form = this.$el.find('form');

		return this;
	},

	renderEnabled: function(){
		var enabled = this.model.get('enabled');
		this.$el.find('.enable-switch')
						.attr('data-enabled', enabled)
						.html(helpers.templates.formatEnabled(enabled));
	},

	toggleModal: function(e){
		this.killEvent(e);
		views.helpers.toggleModal(e)
	},

	saveModal: function(e){
		e.preventDefault();
		var that = this;

		var recipe_data = this.remodelRecipeJson();
		this.model.save(recipe_data, {
			error: function(model, response, options){
				console.log('error in recipe update', response)
				alert('Your update did not succeed. Please try again. Check the console for errors.')
			},
			success: function(model, response, options){
				console.log('updated recipe', response);
				// TODO, fancier animation on success
				that.toggleModal(e);
			}
		});
	},

	destroyModel: function(e){
		var that = this;
		this.model.destroy({
			error: function(model, response, options){
				console.log('error in model destroy', response)
				alert('Your destroy did not work. Please try again. Check the console for errors.')
			},
			success: function(model, response, options){
				console.log('recipe destroyed', response);
				// TODO, fancier animation on success
				that.toggleModal(e);
				that.$el.remove();
			}
		});
	},

	remodelRecipeJson: function(){
		var serializedArray = this.$form.serializeArray(),
				recipe_info = {
					source: this.model.get('source'),
					type: this.model.get('type')
				};
		var model_json = views.helpers.remodelRecipeJson.update(recipe_info, serializedArray);
		return model_json;
	},

	toggleEnabled: function(e){
		this.killEvent(e);
		this.model.set('enabled', !this.model.get('enabled'));
	},

	killEvent: function(e){
		e.stopPropagation();
	},

	setActiveCssState: function(model){
		var uids = routing.helpers.getArticleUids(window.location.hash);
		if (uids != 'all'){
			this.$el.find('.drawer-list-outer').toggleClass('active', model.get('viewing'));
			this.$el.find('.inputs-container input').prop('checked', model.get('viewing'));
		} else {
			this.$el.find('.drawer-list-outer').toggleClass('active', false);
			this.$el.find('.inputs-container input').prop('checked', false);
		}
		return this;
	},

	// radioSet: function(){
	// 	var uid = this.model.get(app.instance.listUid);
	// 	if ( !this.model.get('viewing') ){
	// 		// Clear the last active article
	// 		collections.drawer_items.instance.zeroOut('viewing');
	// 		// Also clear anything that was in the content area
	// 		app.helpers.itemDetail.removeAll();

	// 		// And set this model to the one being viewed
	// 		this.model.set('viewing', true);
	// 	} else if ( models.section_mode.get('mode') == 'my-alerts' ) {
	// 		// TODO, This should eventually be kicked into its own model that keeps track of filters more generally
	// 		$('.view-all').trigger('click');
	// 		uid = 'all';
	// 	}
	// 	return this;
	// },

	// checkboxSet: function(){
	// 	// This section behaves like a checkbox
	// 	this.model.set('viewing', !this.model.get('viewing'));
	// 	return this;
	// },

	setHash: function(){
		var behavior = app.helpers.drawer.determineBehavior();
		// Call the appropriate behavior
		routing.router.set[behavior]( this.model.get(app.instance.listUid) );
		return this;
	}

});