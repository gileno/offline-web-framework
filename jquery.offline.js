/**
 * @author orygens
 */
var Offline = {
	logging : {
		// Default Loggin
	},
	settings : {
		// Default settings
	}
};
/**
 * Alert logging
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off) {
	var alertFunction = function(message) {
		alert(message);
		return this;
	};
	$.extend($Off.logging, {
		debug : alertFunction,
		info : alertFunction,
		warn : alertFunction,
		error : alertFunction
	});
})(jQuery, Offline);
/**
 * Default settings
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off) {
	$.extend($Off.settings, {
		urls : [],
		container : null
	});
	$.extend($Off, {
		setUrls : function(urls) {
			$.extend($Off.settings, {
				urls : urls
			});
		},
		setContainer : function(container) {
			$.extend($Off.settings, {
                container : container
            });
		}
	});
})(jQuery, Offline);

/**
 * Cache Template
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off){
	$Off.CacheTemplate = function(options) {
		$.extend(this, options);
		return this;
	};
    $.extend($Off.CacheTemplate, {
		cache: {},
        size: 0,
        clear: function(){
            this.cache = {};
            this.size = 0;
        },
        add: function(id, object){
            this.cache[id] = object;
            this.size++;
            return id;
        },
        remove: function(id){
            if (this.find(id)) {
                return (delete this.cache[id]) ? --this.size : -1;
            }
            return null;
        },
        find: function(id){
            return cache[id] || null;
        }
    });
})(jQuery, Offline);

/**
 * Template renderer
 * Mustache: http://github.com/defunkt/mustache
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off){
	var nullRenderer = function(template, context, partials) {
        return "";
    };
	$.extend($Off, {
		renderer : function(template, context, partials) {
            return nullRenderer(template, context, partials);
		}
	});
	// If Mustache is loaded
	if(Mustache && $.isFunction(Mustache.to_html)) {
		$.extend($Off, {
			renderer : function(template, context, partials) {
	            return Mustache.to_html(template, context, partials);
	        } 
		});
	}
})(jQuery, Offline);

/**
 * Request Object
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off) {
	$Off.Request = function(url, method, args) {
        if(typeof args == "string") {
			args = args.split("&");
			var _args = {};
			for(arg in args) {
				var param = arg.split("=");
				_args[param[0]] = param[1];
			}
			args = _args;
		}
		$.extend(true, this, {
			url : url,
			method : method,
			args : args
		});
		return this;
    };
	$Off.Response = function(content, status) {
		if(status == undefined) {
			status = 200;
		}
		$.extend(true, this, {
			content : content,
			status : status
		});
		return this;
	};
})(jQuery, Offline);

/**
 * 
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off) {
	$Off.ViewError = function(e){
        var details = {
            name:"Offline.ViewError",
            message:"An error occurred trying to access the view."
        };
        $.extend( this, new Error());
    };
	var getView = function(url) {
		var urls = $Off.settings.urls;
		var view = null;
		for(current in urls) {
			current = urls[current];
			if(current.url == url) {
				view = current;
				break;
			}
		}
		if(view == null || view == undefined) {
			$Off.logging.error("No view found with the url: " + url);
		} else if(!$.isFunction(view.view)) {
            $Off.logging.error("The view " + view.view + " is not a function");
        }
		return view;
	};
	var processUrl = function(url) {
        document.location.hash = url;
		$Off.currentPage = url;
	};
	$.extend($Off, {
		get : function(url) {
            processUrl(url);
			var args = {};
			if(url.indexOf("?") != -1) {
	            args = url.substring(args.indexOf("?")+1);
			}
			var request = $Off.Request(url, "GET", args);
			var view = getView(url);
			if(view.template == undefined) {
				var response = view.view(request, view.extras);
	            var $container = $($Off.settings.container);
	            $container.html(response.content);
			} else {
				$.ajax({
					url : view.template,
					type : "GET",
					success : function(template) {
						var response = view.view(request, template, view.extras);
		                var $container = $($Off.settings.container);
		                $container.html(response.content);
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {
                        $Off.logging.error("Template not found");
					}
				});
			}
		},
		post : function(url, args) {
			processUrl(url);
			var request = $Off.Request(url, "POST", args);
            var view = getView(url);
            var response = view.view(request, view.extras);
            var $container = $($Off.settings.container);
            $container.html(response.content);
		},
		getUrl : function(name) {
			var urls = $Off.settings.urls;
	        var view = null;
	        for(current in urls) {
	            if(current.name && current.name == name) {
	                view = current;
					break;
	            }
	        }
			return view;
		}
	});
})(jQuery, Offline);

(function($, $Off) {
	$.extend($Off, {
		currentPage : null
	});
    $.extend($Off, {
        init : function(urls, container) {
			$Off.setUrls(urls);
			$Off.setContainer(container);
			self.setInterval("checkPage()", 300);
		}
    });
})(jQuery, Offline);

function checkPage() {
    var page = document.location.hash;
    var indexHash = page.indexOf("#");
    if(indexHash != -1) {
        page = page.substring(indexHash+1);
    }
	if(Offline.currentPage == null 
	   || page != Offline.currentPage) {
        Offline.currentPage = page;
        Offline.get(page);
   }
}