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
}

/**
 * Null logging
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off) {
	var nullFunction = function() {
		return this;
	};
	$.extend($Off.logging, {
		debug : nullFunction,
		info : nullFunction,
		warn : nullFunction,
		error : nullFunction
	});
})(Jquery, Offline);

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
})(Jquery, Offline);

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
})(Jquery, Offline);

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
    };
	$Off.Response = function(content, status) {
		if(status == undefined) {
			status = 200;
		}
		$.extend(true, this, {
			content : content,
			status : status
		});
	};
})(Jquery, Offline);

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
			if(current.url && current.url == url) {
				view = current;
			}
		}
		if(view == null || view == undefined) {
			$.logging.error("No view found with the url: " + url);
			throw new $Off.ViewError(null);
		} else if(!$.isFunction(view.view)) {
            $.logging.error("The view " + view.view + " is not a function");
        }
		return view;
	};
	$.extend($.Off, {
		get : function(url) {
			document.location.hash = url;
			var args = {};
			if(url.indexOf("?") != -1) {
	            args = url.substring(args.indexOf("?")+1);
			}
			var request = $Off.Request(url, "GET", args);
			var view = getView(url);
			var response = view.view(request, view.extras);
			var $container = $($Off.settings.container);
			$container.html(response.content);
		},
		post : function(url, args) {
			var request = $Off.Request(url, "POST", args);
            var view = getView(url);
            var response = view.view(request, view.extras);
            var $container = $($Off.settings.container);
            $container.html(response.content);
		}
	});
})(Jquery, Offline);

(function($, $Off) {
	
})(Jquery, Offline);
