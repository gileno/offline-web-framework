var BlogModels = {};
(function($, $Off, $BM){
    $BM.Entry = function(fields) {
        $.extend(this, {
            title: '',
            content: '',
            name: 'blog_entry'
        });
        $.extend(this, fields);
        return this;
    };
    $.extend(true, $BM.Entry.prototype, $Off.Model);
})(jQuery, Offline, BlogModels);
