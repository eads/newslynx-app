collections.article_detailed_subject_tags = {
	"instance": null,
	"Collection": Backbone.Collection.extend({
		model: models.subject_tag.Model,
		url: function(){
			var article_id = collections.article_detailed.instance.pluck('id')[0];
			return '/api/articles/'+article_id+'/subjects';
		},
		set: function() {
			// Always remove contents before setting
			Backbone.Collection.prototype.remove.call(this, this.models );
			Backbone.Collection.prototype.set.apply(this, arguments);
		}
	})
}