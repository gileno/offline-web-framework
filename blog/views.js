var BlogViews = {};
(function($, $Off, $BM){
    $.extend(BlogViews, {
        index: function(request, template, extras){
            if(request.method == 'POST') {
                var entry = new $BM.Entry(request.args);
                entry.save();
            }
            var entries = new $BM.Entry().objects().all();
			$Off.logging.debug(new $BM.Entry().objects().count());
			return new $Off.Response($Off.renderer(template, {
                entries: entries
            }));
        }
    });
})(jQuery, Offline, BlogModels);
