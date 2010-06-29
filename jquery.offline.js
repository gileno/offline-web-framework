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
		}
		return view;
	};
	var processUrl = function(url) {
        document.location.hash = url;
		$Off.currentPage = url;
	};
	var processRequest = function(request, view) {
		if(view.template == undefined) {
			var response = null;
			try{
				if(!$.isFunction(view.view)) {
		            $Off.logging.error("The view " + view.view + " is not a function");
		        } else {
					response = view.view(request, view.extras);
					var $container = $($Off.settings.container);
                    $container.html(response.content);
				}
			}catch(e) {
				var error = getView('500');
				if(error != null) {
					$.ajax({
		                url : error.template,
		                type : "GET",
		                success : function(template) {
							if($.isFunction(error.view)) {
		                        response = error.view(request, error.template, error.extras);
		                    } else {
		                        response = $Off.Response($Off.renderer(template), 500);
		                    }
		                    var $container = $($Off.settings.container);
		                    $container.html(response.content);
		                },
		                error : function(XMLHttpRequest, textStatus, errorThrown) {
		                    $Off.logging.error("Template not found");
		                }
		            });
				} else {
					response = $Off.Response('Page Error', 500);
				}
			}
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
			processRequest(request, view);
		},
		post : function(url, args) {
			processUrl(url);
			var request = $Off.Request(url, "POST", args);
            var view = getView(url);
            processRequest(request, view);
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
			return view.url;
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

/**
 * Database Class
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off) {
    var getModelKey = function(modelName) {
        return "model_" + modelName;
    };
    $Off.Database = function(options) {
        $.extend(this, {
            guid: function() {
                var _guid = localStorage.getItem('_guid');
                if(_guid == null) {
                    _guid = 0;
                }
                try {
                    _guid = parseInt(_guid);
                }catch(e) {
                    _guid = 0;
                }
                _guid = _guid + 1;
                localStorage.setItem('_guid', _guid);
                return (_guid)+"_"+new Date().getTime()+"_"+Math.round(Math.random()*100000000);
            },
            save_model: function(modelName, obj) {
				var objs = this.getModels(modelName);
                if(obj.id == undefined || obj.id == null) {
                    obj.id = this.guid();
                } else {
					
				}
                objs.push(obj);
                var key = getModelKey(modelName);
                localStorage.setItem(key, $.toJSON(objs));
            },
			delete_model: function(modelName, obj) {
				var objs = this.getModels(modelName);
				for(o in objs) {
                    if(o.id == obj.id) {
                        delete o;
                        break;
                    }
                }
			},
            getModels : function(modelName) {
                var key = getModelKey(modelName);
                var json = localStorage.getItem(key);
                if(json == null) {
                    json = "[]";
                }
                return $.evalJSON(json);
            }
        });
        $.extend($Off.Database, options);
    };
    $.extend($Off, {
        db: new $Off.Database({})
    });
})(jQuery, Offline);

/**
 * Model Interface
 * @param {Object} $
 * @param {Object} $Off
 */
(function($, $Off) {
	$Off.Model = {
        id: null,
        name: 'model', // Must be implemented by Derived Class
        timestamp: new Date().getTime(),
        save: function() {
            $Off.db.save_model(this.name, this);
        },
		objects : function() {
			var instance = {};
			var modelName = this.name;
			$.extend(instance, {
				all: function() {
	                return $Off.db.getModels(modelName);
	            },
				count: function() {
					return $Off.db.getModels(modelName).length;
				}
			});
			return instance;
		}
    }
})(jQuery, Offline);