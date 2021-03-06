var globals = require('/ui/common/globals');
var css = require('/ui/common/css');

function fn() {

	var curr_event = "";
	var MAXITEMS = 100;
	
	var self = Titanium.UI.createWindow({
    	navBarHidden: true,
    	backgroundColor:css.VERYLIGHTCOLOUR,
		backgroundGradient: css.WINGRAD2,
		tabBarHidden:true
	});
	
	var setpage = function(P) {
		require("/helpers/LocalStorage").setString("page",P);
	}
	var getpage = function() {
		var page = require("/helpers/LocalStorage").getString("page");
		if (!page || page == null || page == "") return 0;
		try {
			return Number(page);
		} catch (E) {
			return 0;
		}
	}
	var PERPAGE = 100;
	var TOTALRESULTS = 0;
	
	var add_spinner = function(view,top,left) {
		
		var activityIndicator = Ti.UI.createActivityIndicator({
			color: css.VERYLIGHTCOLOUR,
			message: 'Loading...',
			style : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
			height:'auto',
			width:'auto'
 		});
 		if (top) activityIndicator.top = top;
 		if (left) activityIndicator.left = left;
		
		view.add(activityIndicator);
		activityIndicator.show();
		var endActivity = function(e) {
			Ti.API.debug(this);
			Ti.API.debug(e);
			Ti.API.debug(e.source);
			view.remove(activityIndicator);
			view.removeEventListener("done-spinning",endActivity);
		}
		view.addEventListener("done-spinning",endActivity);
	};
	
	var topview = Titanium.UI.createView({
		top:0,left:0,right:0,height:40,backgroundColor:"#ff0000"
	})
	var mainview = Titanium.UI.createScrollView({
		contentHeight:'auto',
		contentWidth:'auto',
		top:40,left:0,right:0,height:710,backgroundColor:css.DARKBACKGROUND
	});

	mainview.addEventListener('scrollEnd', function(e) {
		Ti.App.fireEvent("app-endscroll",{
			x : mainview.getContentOffset().x,
			y : mainview.getContentOffset().y,
			w : mainview.getSize().width,
			h : mainview.getSize().height
		})
	});
	mainview.addEventListener('dragEnd', function(e) {
		if (e.decelerate == true) return;
		Ti.API.debug("scroll");
		Ti.API.debug(e);
		Ti.API.debug(mainview.getContentOffset());
		Ti.API.debug(mainview.getContentOffset().x);
		Ti.API.debug(mainview.getContentOffset().y);
		Ti.App.fireEvent("app-endscroll",{
			x : mainview.getContentOffset().x,
			y : mainview.getContentOffset().y,
			w : mainview.getSize().width,
			h : mainview.getSize().height
		})
	});

	var mainview2 = Titanium.UI.createView({
		top:0,left:0,
		width:3200,
		height : (420 * (MAXITEMS / 25)) + 20,
		backgroundColor:"transparent", borderWidth:0, borderColor:css.VERYLIGHTCOLOUR,
		layout:"horizontal"
	});
	var mainviewL = Titanium.UI.createScrollView({
		contentHeight:'auto',
		contentWidth:'auto',
		zIndex:999,
		xopen : false,
		top:40,left:-200,width:190,height:659,backgroundColor:css.DARKBACKGROUND
	});
	var tabL = Titanium.UI.createTableView({
		height : 'auto',
		left:0, right:0,top:0,
		color : css.VERYLIGHTCOLOUR,
		backgroundColor : css.DARKBACKGROUND,
		separatorColor :css.DARKBACKGROUND,
	});
	mainviewL.add(tabL);
	tabL.addEventListener("click", function(e) {
		require("/helpers/LocalStorage").setString("yr-string",e.row.xlink);
		search2.call(this);
	});


	
	var refreshleftlist = function(places) {
		var rows = [];
		
		for (var i=0; i < places.length; i++) {
			var row = Titanium.UI.createTableViewRow({
				xlink : places[i],
				backgroundColor:css.DARKBACKGROUND,
				color : css.VERYLIGHTCOLOUR,
				height : 64,
			})
			var lbl = Titanium.UI.createLabel({
				text : places[i],
				xlink : places[i],
				color : css.VERYLIGHTCOLOUR,
				height : 'auto',
				font : {
					fontSize : 16,
					fontFamily : "arial"
				}
			})
			row.add(lbl);
			rows.push(row);
		}
		tabL.setData(rows);	
	}
	refreshleftlist([]);
	refreshleftlist2 = function()  {
		var items = require("/helpers/LocalStorage").getObject("creators");
		var items = require("/helpers/LocalStorage").getObject("dats");
		if (!items || items == null) items = [];
		refreshleftlist(items);	
	}
	
	
	
	
	var mainviewR = Titanium.UI.createScrollView({
		contentHeight:'auto',
		contentWidth:'auto',
		zIndex:999,
		xopen : false,
		top:40,left:-500,width:400,height:710,backgroundColor:"#333"
	});
	var subviewWrapperR = Ti.UI.createScrollView({
		contentHeight : 'auto'
	});
	var subviewR = Ti.UI.createView({
		layout : 'vertical',
		top : 0,
		height : Ti.UI.SIZE
	});
	mainviewR.add(subviewR);

	var mainviewR_close = function() {
		if (mainviewL.xopen == true) {
			mainviewL.xopen = false;
			//mainviewL.animate({left:-200,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
			mainviewR.animate({left:-500,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
		}
	}
	var mainviewR_open = function() {
		if (mainviewL.xopen == false) {
			mainviewL.xopen = true;
			//mainviewL.animate({left:-200,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
			mainviewR.animate({left:0,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
		}
	}	
	var tabR = Titanium.UI.createTableView({
		height : 'auto',
		left:0, right:0,top:600,
		color : css.LIGHTCOLOUR,
		backgroundColor : css.VERYLIGHTCOLOUR,
		separatorColor :css.DARKBACKGROUND,
		borderColor:css.LIGHTCOLOUR,
		borderWidth:1
	});
//	mainviewR.add(tabR);
	
	var addSearchTerm = function(ST) {
		var type = require("/helpers/LocalStorage").getString("type-string");
		if (type == null) type = "";
		if (type != "") type += "|";
		type += ST;
		require("/helpers/LocalStorage").setString("type-string",type);
		mainviewR_close();
		search2.call(this);
	}
	

	var tabRclickHandler = function(src) {
		Ti.API.debug(src);
		Ti.API.debug(src.xlink);
		Ti.API.debug(src.xindex);
		if (src.xlink == "xignore") {
			return;
		} else if (src.xlink == "page-first") {
			pg = 0;
			//alert(pg);
			setpage(pg);
			mainviewR_close();
			search2.call(this);

		} else if (src.xlink == "page-next") {
			var pg = getpage();
			if (pg >= Math.floor(TOTALRESULTS/PERPAGE)) return;
			pg++;
			//alert(pg);
			setpage(pg);
			mainviewR_close();
			search2.call(this);

		} else if (src.xlink == "page-prev") {
			var pg = getpage();
			Ti.API.debug(pg);
			if (pg < 1) return;
			pg--;
			Ti.API.debug(pg);
			//alert(pg);
			setpage(pg);
			mainviewR_close();
			search2.call(this);

		} else if (src.xlink == "page-last") {
			var pg = Math.floor(TOTALRESULTS/PERPAGE);
			//alert(pg);
			setpage(pg);
			mainviewR_close();
			search2.call(this);
			
		} else if (src.xlink == "remove-searchterm-main") {
			require("/helpers/LocalStorage").setString("search-string","");
			mainviewR_close();
			search2.call(this);
		} else if (src.xlink == "remove-searchterm") {
			var type = require("/helpers/LocalStorage").getString("type-string");
			var type_parts = type.split("|");
			var type = "";
			for (var i=0; i < type_parts.length; i++) {
				if (i == Number(src.xindex)) continue;
				if (type != "") type += "|";
				type += type_parts[i];
			}
			require("/helpers/LocalStorage").setString("type-string",type);
			mainviewR_close();
			search2.call(this);
		} else {
			var type = require("/helpers/LocalStorage").getString("type-string");
			if (type == null) type = "";
			if (type != "") type += "|";
			type += src.xlink;
			
			require("/helpers/LocalStorage").setString("type-string",type);
			mainviewR_close();
			search2.call(this);
		}
	};
	var tabRclick = function(e) {
		if (e && e.source && e.source.xlink) tabRclickHandler.call(this,e.source);
	}
	


	tabR.addEventListener("click", function(e) {
		if (e.row.xlink == "xignore") {
			return;
		} if (e.row.xlink == "remove-searchterm") {
			var type = require("/helpers/LocalStorage").getString("type-string");
			var type_parts = type.split("|");
			var type = "";
			for (var i=0; i < type_parts.length; i++) {
				if (i == Number(e.row.xindex)) continue;
				if (type != "") type += "|";
				type += type_parts[i];
			}
			require("/helpers/LocalStorage").setString("type-string",type);
			search2.call(this);
		} else {
			var type = require("/helpers/LocalStorage").getString("type-string");
			if (type == null) type = "";
			if (type != "") type += "|";
			type += e.row.xlink;
			
			require("/helpers/LocalStorage").setString("type-string",type);
			search2.call(this);
		}
	});
	var breadcrum_description = function(S) {
		if (S.indexOf("&qf=") == 0 && S.indexOf(":") == -1) {
			// &qf=searchterm
			return S.substring(4);
			
		}
		if (S.indexOf("&qf=") == 0) {
			// &qf=searchterm:value
			S_PARTS = S.substring(4).split(":",2);
			return L("#"+S_PARTS[0])+" : "+Ti.Network.decodeURIComponent(S_PARTS[1]).replace(/\+/g," ") ;
		}
		return S;
	}
	
	
	var av = require('/ui/common/sidemenu/accordian_view');
	var smh = require('/ui/common/sidemenu/SideMenuHelpers');
	
	var refreshplaces = function(places, totalResults, perpage) {
		
		TOTALRESULTS = totalResults;
		PERPAGE = perpage;

		if (subviewR.children.length > 0) subviewR.remove(subviewR.children[0]);
		var subviewR2 = Ti.UI.createView({
			layout : 'vertical',
			top : 0,
			height : Ti.UI.SIZE
			
		});
		subviewR.add(subviewR2);
		
		subviewR2.add(smh.H1("Matches for:"));


		var srch = require("/helpers/LocalStorage").getString("search-string");
		if (srch != "") {
			var v = smh.matchingLine(srch,"remove-searchterm-main",0);
			v.addEventListener('click',tabRclick);
			subviewR2.add(v);
		}



		var START = 1;
		
		var type = require("/helpers/LocalStorage").getString("type-string");
		if (!type || type == null) type = "";
		var type_parts = type.split("|");
		for (var i=0; i < type_parts.length; i++) {
			if (type_parts[i].indexOf("&start=") > -1) {
				START = Number(type_parts[i].substring(7));
			} else if (type_parts[i] != "") {
				var v = smh.matchingLine(breadcrum_description(type_parts[i]),"remove-searchterm",i);
				v.addEventListener('click',tabRclick);
				subviewR2.add(v);
			}
		}
		
		
		var PG = Number(getpage());
		var MAXPG = Math.floor(Number(totalResults) / Number(PERPAGE));
		//alert(Number(PERPAGE));
		//alert(Number(totalResults));
		//alert(MAXPG);

		if (totalResults > 0) {
			subviewR2.add(smh.spacer());
			subviewR2.add(smh.H2("Results "+((PERPAGE * PG)+1)+" - "+Math.min(((PERPAGE * PG)+PERPAGE),totalResults)+" of "+totalResults));
	
			var pagination = smh.pagination(getpage()+1,MAXPG+1);
			pagination.addEventListener('click',tabRclick);
			subviewR2.add(pagination);
		}

		
		subviewR2.add(smh.spacer());
		subviewR2.add(smh.H1("Refine your results:"));
		var addmorekeywords = smh.sectionhead("Add more keywords");
		addmorekeywords.fireEvent("open",{});
		subviewR2.add(addmorekeywords);
		

		var extrasearch = Ti.UI.createTextField({});
		subviewR2.add(smh.textbox(extrasearch));
		var addExtraSearchTerm = function() {
			var term = extrasearch.getValue();
			if (term != "") {
				term = "&qf="+Ti.Network.encodeURIComponent(term);
				addSearchTerm(term);
			}
		}
		extrasearch.addEventListener('return',addExtraSearchTerm);

		subviewR2.add(smh.spacer());
		
		var content = function(obj) {

			var xindex = Number(obj.xindex);

			Ti.API.debug(sections[xindex]);
			
			var v0 = Ti.UI.createScrollView({
				contentHeight : 'auto'
			});

			var v = Ti.UI.createView({
				layout : 'vertical'
			});
			
			for (var i=0; i < sections[xindex].items.length; i++) {
				var lbl = smh.option(sections[xindex].items[i].xname,sections[xindex].items[i].xlink,sections[xindex].items[i].xname);
				
//				lbl.xlink = sections[xindex].items[i].xlink;
//				lbl.xname = sections[xindex].items[i].xname;
				lbl.addEventListener('click',tabRclick);
				v.add(lbl);
			}
			v0.add(v);
			return v0;
		}

		
		var sections = [];
		var section_index = -1;
		
		for (var i=0; i < places.length; i++) {
			if (places[i].indexOf("#") == 0) {
				section_index++;
				sections[section_index] = {
					items : []
				}
				var SECHEADTEXT = L(places[i]);
				if (SECHEADTEXT.indexOf("#") == 0 && SECHEADTEXT.length > 1) SECHEADTEXT = SECHEADTEXT.substring(1);
				var hv = smh.sectionhead(SECHEADTEXT);
				var v2 = av.createView({
					headerview : hv,
					xindex : section_index,
					xname : places[i],
					parameters : {
						xindex : section_index,
						xname : places[i]
					},
					content : content
//					content : "section for "+places[i]
				});
				subviewR2.add(v2.view);
				subviewR2.add(smh.spacer());
			} else {
				if (section_index > -1) {
					var place = places[i].split("|");
					var xlink = place[0];
					var xname = place[1];
					sections[section_index].items.push({
						xlink : xlink,
						xname : xname
					});
				}
			}
		}
		
		
		var rows = [];
		var section = null;
	}


	refreshplaces("France Belgium".split(" "));	
	refreshplaces2 = function()  {
		var items = require("/helpers/LocalStorage").getObject("types");
		if (!items || items == null) items = [];

		var totalResults = require("/helpers/LocalStorage").getString("totalResults");
		if (!totalResults || totalResults == null || totalResults == "") totalResults = 0;

		var perpage = require("/helpers/LocalStorage").getString("perpage");
		if (!perpage || perpage == null || perpage == "") perpage = 0;

		refreshplaces(items,Number(totalResults),Number(perpage));	
	}
	
	
	self.add(mainviewL);
	self.add(mainviewR);

	mainview.add(mainview2)
	
	var b1 = Titanium.UI.createButton({
		image : "/images/eu/icon-menu.png"
	})
	var click = function(e) {
		if (mainviewL.xopen == false) {
			mainviewL.xopen = true;
			//mainviewL.animate({left:0,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
			mainviewR.animate({left:0,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
		} else {
			mainviewL.xopen = false;
			//mainviewL.animate({left:-200,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
			mainviewR.animate({left:-500,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
			
		}
		
	}
	
	b1.addEventListener("click", click);
	
	var b1emp = Titanium.UI.createButton({
		image : '',
		width:15
	});
	var b2emp = Titanium.UI.createButton({
		image : '',
		width:145
	});
	var b1muse = Titanium.UI.createButton({
		image : 'images/small-logo.png'
	});
	
//	var bb1 = Titanium.UI.createButtonBar({
	var bb1 = Ti.UI.iOS.createTabbedBar({
//	    labels:['Home','Search results', 'Your Favourites', 'Help'],
	    labels:['Home','Search results', 'Your Favourites'],
		backgroundColor:'#333333',
	    top:50,
	    style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	    height:30,
	    width:400
	});
	var bb1help = Ti.UI.createButtonBar({
	    labels:['Help'],
		backgroundColor:'#333333',
	    top:50,
	    style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	    height:30,
	    width:50
	});
	var bbselect_help = function(e) {
		var tab = e.index;
		if (tab == 0) {
			Titanium.App.fireEvent("display-main-help",{});
		}
	}
	var bbselect = function(e) {
		var tab = e.index;
		
		if (tab == 0) {
			Titanium.App.fireEvent("display-search-force",{});
		}
		if (tab == 1) {
			close_displaySearchForce();
			Titanium.App.fireEvent("redisplay-search",{});			
		}
		if (tab == 2) {
			close_displaySearchForce();
			Titanium.App.fireEvent("redisplay-personal",{});		
		}
		if (tab == 3) {
			//require("/helpers/LocalStorage").setObject("personal",[]);
			//Titanium.App.fireEvent("redisplay-personal",{});	
			Titanium.App.fireEvent("display-main-help",{});
			//Titanium.App.fireEvent("display-search-force",{});
		}
		// if (tab == 3) {
			// mainview2.asImage();
		// }
	}
	bb1.addEventListener("click",bbselect);
	bb1help.addEventListener("click",bbselect_help);
	
	var bbb1 = Ti.UI.createButton({
		image:'images/glyphicons_027_searcht.png'
	});
	
	var topbar = Titanium.UI.iOS.createToolbar({
		top:0,right:0,left:0,height:50,
		items : [b1,bb1,bb1help,b1emp,b1muse,b2emp,bbb1],
		barColor : css.DARKBACKGROUND,
		borderTop:false,
	    borderBottom:true
	})
	
	var search = Titanium.UI.createTextField({
		right : 10,
		top : 5,
		height : 30,
		autocorrect : false,
		autocapitalization : false,
		clearButtonMode : 1,
		paddingLeft : 20,
		width : 200,
		borderRadius : 5,
		backgroundColor : css.VERYLIGHTCOLOUR,
		borderColor : css.LIGHTCOLOUR,
		borderWidth : 1,
		color : css.LIGHTCOLOUR,
		value : require("/helpers/LocalStorage").getString("search-string"),
		font : {
			fontFamily : "SinhalaSangamMN",
			fontSize : 18
		}
	})
	
	topbar.add(search);
	topview.add(topbar);
	
	var search2 = function() {
		working();
		
		var srch = require("/helpers/LocalStorage").getString("search-string");
		var yr = require("/helpers/LocalStorage").getString("yr-string");
		var place = require("/helpers/LocalStorage").getString("place-string");
		var type = require("/helpers/LocalStorage").getString("type-string");
		var query = require("/helpers/LocalStorage").getString("query-string");
		var pg = getpage();
		lock_displaySearchForce = false;
		
		var type_parts = type.split("|");
		type = "";
		for (var i=0; i < type_parts.length; i++) {
			type += type_parts[i];	
		}

		search.setValue(srch);

		require("/helpers/flurry").log("search",{ "srch": srch, "typelength" : type_parts.length, "query" : query });

		
		var ajax = require("/helpers/ajax");
		ajax.getdata({
			url : require("/etc/config").api+"?action=json-srch&query="+query+"&page="+pg+"&srch="+srch+"&type="+Ti.Network.encodeURIComponent(type),
			fn : function(e) {
				Ti.API.info(e.data);
				
				require("/helpers/LocalStorage").setObject("search",e.data.items);
				require("/helpers/LocalStorage").setObject("types",e.data.types);
				require("/helpers/LocalStorage").setString("totalResults",e.data.totalResults);
				require("/helpers/LocalStorage").setString("perpage",e.data.perpage);
				/*require("/helpers/LocalStorage").setObject("creators",e.data.creators);
				require("/helpers/LocalStorage").setObject("dats",e.data.dats);*/
				//Ti.API.debug(e.data.url);
				require("/helpers/LocalStorage").setString("search-message",e.data.status_msg);
				
				bb1.index = 1;
				
				Titanium.App.fireEvent("redisplay-search",{xfrom : 'search2'});
			}
		})
	};
	Titanium.App.addEventListener("app:search2",search2);
	search.addEventListener("click", function() {
		search.value='';
	});
	search.addEventListener("return", function() {
		var srchrealval = search.getValue();
		// srchrealval = srchrealval.replace(" ","_");
		// srchrealval = srchrealval.replace(" ","_");
		// srchrealval = srchrealval.replace(" ","_");
		// srchrealval = srchrealval.replace(" ","_");

		require("/helpers/LocalStorage").setString("search-string",srchrealval);
		require("/helpers/LocalStorage").setString("yr-string","");
		require("/helpers/LocalStorage").setString("place-string","");
		require("/helpers/LocalStorage").setString("type-string","");
		require("/helpers/LocalStorage").setString("query-string","");
		require("/helpers/LocalStorage").setString("page","0");
		if (mainviewL.xopen == true) {
			mainviewL.xopen = false;
			//mainviewL.animate({left:-200,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
			mainviewR.animate({left:-500,duration:500,curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT},function(e){});
		}

		search2.call(this);
	});
	
	var callsearchfromotherplace = function(searchval){
		require("/helpers/LocalStorage").setString("search-string",searchval);
		require("/helpers/LocalStorage").setString("yr-string","");
		require("/helpers/LocalStorage").setString("place-string","");
		require("/helpers/LocalStorage").setString("type-string","");
		require("/helpers/LocalStorage").setString("query-string","");
		require("/helpers/LocalStorage").setString("page","0");
		search2.call(this);
	};
	
	var cnt = 0;
	var cntrow = 0;
	var amnt = 0;
	var vw = null;
	var type = 0;

	function redisplaySearchSetup() {
		var itemClass = require("/ui/common/itemViewShell");		
		for (var i=0; i <MAXITEMS; i++) {
			if (amnt == 0) {
				if (vw != null) {
					mainview2.add(vw);
				}
				if (cnt % 10 == 0) {
					cntrow = (cntrow == 0) ? 1 : 0;
				}
				if ((cnt+cntrow) % 2 == 0) {
					vw = Titanium.UI.createView({
						width:370,
						height:420,
						layout : 'vertical'
					})
					amnt = 2;
					type = 2;
				} else {
					vw = Titanium.UI.createView({
						width:270,
						height:420,
						layout : 'vertical'
					})
					amnt = 3;
					type = 3;
				}
				cnt++;
				// if (cnt == 11) cnt++;
				// if (cnt == 23) cnt++;
				// if (cnt == 34) cnt++;
				// if (cnt == 45) cnt++;
			}
			var view = new itemClass(type,i);
			vw.add(view);
			amnt--;
		}
		
	};

	function working() {
		var transform1 = Titanium.UI.create2DMatrix();
		transform1 = transform1.scale(0.8);
		var animation1 = Titanium.UI.createAnimation({
			transform: transform1,
			anchorPoint : {x : 0, y : 0},
			duration: 500,
			curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
		});
		mainview2.animate(animation1);
		add_spinner(mainview,100,300);
		
	}
	function done() {
		var transform1 = Titanium.UI.create2DMatrix();
		transform1 = transform1.scale(1);
		var animation1 = Titanium.UI.createAnimation({
			transform: transform1,
			anchorPoint : {x : 0, y : 0},
			duration: 500,
			curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
		});
		mainview2.animate(animation1);
		mainview.scrollTo(0,0);
		mainview.fireEvent("done-spinning");
	}
	function redisplaySearch2(e) {
		if (!e.xfrom || e.xfrom != "search2") {
//			if (curr_event == "search") {
//				Titanium.App.fireEvent("display-search-force",{});
//				return;
//			}
		}
		curr_event = "search";
		close_displaySearchForce();
		Titanium.App.fireEvent("clearall",{});
		b1.setEnabled(true);
		bb1.index = 1;
		done();
		require("/helpers/flurry").log("displayresults",{ "from": e.xfrom });


		var items = require("/helpers/LocalStorage").getObject("search");
		if (!items || items == null) items = [];
		
		var itemClass = require("/ui/common/itemView");
		
		for (var i=0; i <items.length; i++) {
			
			Titanium.App.fireEvent("load-"+i,{item:items[i]});
			if (i < 10) {
				Ti.API.info(items[i]);
			}

		}
		Ti.App.fireEvent("app-endscroll",{
			x : 0,
			y : 0,
			w : mainview.getSize().width,
			h : mainview.getSize().height
		});


		refreshplaces2();
		refreshleftlist2();
		if (items.length == 0 || items.length == null) {
			if (require("/helpers/LocalStorage").getString("type-string") == "") {
				Titanium.App.fireEvent("display-search-force",{});
			} else {
				require("/ui/common/growl/fn").growl(require("/helpers/LocalStorage").getString("search-message"),mainviewR_open);
				require("/helpers/LocalStorage").setString("search-message","");
			}
		} else {
//			require("/helpers/LocalStorage").getString("search-message","");
			
		}
	};
	
	function redisplayPersonal2() {
		if (curr_event == "pers") return;
		curr_event = "pers";
		var items = require("/helpers/LocalStorage").getObject("personal");
		if (!items || items == null) items = [];
		
		if (items == null || items == ""){
			alert('Your favourites will appear here');
			return
		};
		
		mainviewR_close();
		Titanium.App.fireEvent("clearall",{});
		close_displaySearchForce();
		b1.setEnabled(false);
		require("/helpers/flurry").log("display_favourites",{ });
		bb1.index = 2;
		done();
	
		var itemClass = require("/ui/common/itemView");
		
		for (var i=0; i <items.length; i++) {
			
			Titanium.App.fireEvent("load-"+i,{item:items[i]});

		}
		Ti.App.fireEvent("app-endscroll",{
			x : 0,
			y : 0,
			w : mainview.getSize().width,
			h : mainview.getSize().height
		});

		if (items.length == 0 || items.length == null) {
			Titanium.App.fireEvent("display-search-force",{});
		}
		
	};
	
	redisplaySearchSetup();
	Titanium.App.addEventListener("redisplay-search",redisplaySearch2);
	Titanium.App.addEventListener("redisplay-personal",redisplayPersonal2);


	self.add(topview);
	self.add(mainview);
	
	var displayhelp = function() {
		var x = Ti.UI.createWindow({
		});
		x.add(Ti.UI.createView({
			top:0,left:0,height:Ti.UI.FILL,width:Ti.UI.FILL,backgroundColor:"#333333",opacity:0.2
		}));
		x.add(Ti.UI.createImageView({
			top:0,left:0,height:Ti.UI.FILL,width:Ti.UI.FILL,
			image : '/images/eu/help-header.png'
		}));
		x.addEventListener('click',function(e) {
			x.close();
		});
		x.open();
	};
//	self.addEventListener('click', displayhelp);
	Titanium.App.addEventListener("display-main-help",displayhelp);
//	setTimeout(displayhelp,1000);
	var lock_displaySearchForce = false;
	var win_displaySearchForce = null;
	var close_displaySearchForce = function() {
		if (win_displaySearchForce != null) {
			win_displaySearchForce.close();
			lock_displaySearchForce = false;
		}
	}
	
	var displaySearchForce = function() {
		if (lock_displaySearchForce == true) {
			if (win_displaySearchForce != null) {
				win_displaySearchForce.close();
				lock_displaySearchForce = false;
			}
			return;
		}
		lock_displaySearchForce = true;
		bb1.index = 0;
		mainviewR_close();
		b1.setEnabled(false);

		
		var x = Ti.UI.createWindow({
			top:40
		});
		win_displaySearchForce = x;
		
		var xview = Ti.UI.createView({
			top:0,left:0,height:Ti.UI.FILL,width:Ti.UI.FILL,backgroundColor:css.LIGHTCOLOUR
		});
		x.add(xview);
		var ximg = Ti.UI.createImageView({
			top:30,
			left:340,
			image:'/images/eu/europeana-logo-white.png',
			width:300
		});
		xview.add(ximg);
		
		
		var xsearch = Titanium.UI.createTextField({
			top : 246,
			height : 54,
			autocorrect : false,
			autocapitalization : false,
			clearButtonMode : 1,
			left:(1024-860)/2,
			width : (860 - 50)-2,
			borderRadius : 5,
			backgroundColor : css.VERYLIGHTCOLOUR,
			borderColor : css.LIGHTCOLOUR,
			paddingLeft : 20,
			borderWidth : 1,
			hintText : "Search a selection of Europeana's collections",
			color : "#676767",
			value : "",
			font : {
				fontFamily : "arial",
				fontSize : 20
			}
		});
		xview.add(xsearch);
		var ximg1 = Ti.UI.createImageView({
			 top:247,
			 width : 60,
			 touchEnabled : false,
			 right:(1024-860)/2,
			 image:'/images/srch-but-white.png'
		});
		xview.add(ximg1);
		var ximg_left = Ti.UI.createImageView({
			 top:428,
			 left:10,
			 width : 50,
			 zIndex : 99,
			 image:'/images/eu/arrow-left.png'
		});
		xview.add(ximg_left);
		var ximg_right = Ti.UI.createImageView({
			 top:428,
			 right:10,
			 width : 50,
			 zIndex : 99,
			 image:'/images/eu/arrow-right.png'
		});
		xview.add(ximg_right);		

		
		var perform_pre_determined_search = function(e) {
			if (!e.source.xindex) return;
			var idx = Number(e.source.xindex)-1;
			
			x.close();
			lock_displaySearchForce = false;
			require("/helpers/LocalStorage").setString("search-string","");
			require("/helpers/LocalStorage").setString("yr-string","");
			require("/helpers/LocalStorage").setString("place-string","");
			require("/helpers/LocalStorage").setString("page","0");
			require("/helpers/LocalStorage").setString("type-string",require("/helpers/LocalStorage").getObject("featured-items").items[idx].query);
			require("/helpers/LocalStorage").setString("query-string",require("/helpers/LocalStorage").getObject("featured-items").items[idx].query2);
			search2.call(this);
			
		}

		var perform_search = function() {
			x.close();
			lock_displaySearchForce = false;
			require("/helpers/LocalStorage").setString("search-string",xsearch.value);
			require("/helpers/LocalStorage").setString("yr-string","");
			require("/helpers/LocalStorage").setString("place-string","");
			require("/helpers/LocalStorage").setString("page","0");
			require("/helpers/LocalStorage").setString("type-string","");
			require("/helpers/LocalStorage").setString("query-string","");
			search2.call(this);
		}
		
		
		var feature_view = Ti.UI.createView({
			top:350,
			height : 320
		});
		xview.add(feature_view);

		add_spinner(feature_view);
		
		var ajax = require("/helpers/ajax");
		ajax.getdata({
			url : require("/etc/config").api+"?action=get-featured",
			index : 2,
			fn : function(e) {
				Ti.API.debug(e.data.items);
				require("/helpers/LocalStorage").setObject("featured-items",{ items : e.data.items});
				feature_view.fireEvent("done-spinning");
				addFeaturedArticles.call(this,feature_view,perform_pre_determined_search,ximg_left,ximg_right);
			}
		})



		// var featured_items = [{ 
				// img : "featured-maps.jpg", 
				// txt : "Maps and Plans",
				// query : '&qf=DATA_PROVIDER:"Cat%C3%A1logo+Colectivo+de+la+Red+de+Bibliotecas+de+los+Archivos+Estatales"|&qf=DATA_PROVIDER:"Biblioteca+Virtual+del+Patrimonio+Bibliogr%C3%A1fico"|&qf=TYPE:IMAGE|&qf=DATA_PROVIDER:"Biblioteca+Virtual+del+Ministerio+de+Defensa"'
			// }, { 
				// img : "featured-art.jpg", txt : "Treasures of Art"},{ img : "featured-past.jpg", txt: "Treasures of the Past"},{ img :"featured-nature.jpg", txt : "Treasures of Nature"}]
// 
// 
		// require("/helpers/LocalStorage").setObject("featured-items",{ items : featured_items});		
// 
		// addFeaturedArticles.call(this,feature_view,perform_pre_determined_search,ximg_left,ximg_right);
		
		var srchval = search.value;
		//alert(srchval);
		xsearch.value = srchval;
		
		// xsearch.addEventListener("click", function() {
			// x.close();
			// lock_displaySearchForce = false;
			// require("/helpers/LocalStorage").setString("search-string",xsearch.value);
			// require("/helpers/LocalStorage").setString("yr-string","");
			// require("/helpers/LocalStorage").setString("place-string","");
			// require("/helpers/LocalStorage").setString("type-string","");
			// search2.call(this);
		// });
		xsearch.addEventListener("return", perform_search);
//		ximg1.addEventListener("click", perform_search);
		
//		x.addEventListener('click', close_displaySearchForce);
		
		x.open();

		if (require("/helpers/LocalStorage").getString("search-message") != "") {
			require("/ui/common/growl/fn").growl(require("/helpers/LocalStorage").getString("search-message"),mainviewR_close);
		}
		
		
		
	};
	
	var addFeaturedArticles = function(feature_view,perform_pre_determined_search,ximg_left,ximg_right) {
		var search_views = [];
		var featured_items_object = require("/helpers/LocalStorage").getObject("featured-items");
		if (!featured_items_object || featured_items_object == null) featured_items_object = {items:[]};
		var featured_items = featured_items_object.items;

		
		var num_items = featured_items.length;
		var search_square_x3 = null;
		
		for (var i=0; i < num_items; i++) {

			if (search_square_x3 != null && (i%3) == 0) {
				search_views.push(search_square_x3);
				search_square_x3 = null;
			}
			if (search_square_x3 == null) {
				search_square_x3 = Ti.UI.createView({
					width:870,
					height:300,
					layout : 'horizontal'
				});
			} 
			var search_square = Ti.UI.createView({
				width:280,
				height:280,
				right : 5,
				left : 5
			});
			var ximg2 = Ti.UI.createImageView({
				xindex : i+1,
				image:"http://europeanaapp.glimworm.com/europeana/featured_items/"+featured_items[i].img
			});
			search_square.add(ximg2);
			
			var square_underlay = Ti.UI.createView({
				bottom : 0, height : 50, backgroundColor : "#333", opacity : 0.75,
				width : Ti.UI.FILL
			});
			
			var square_text = Ti.UI.createLabel({
				text : featured_items[i].txt,
				color : css.VERYLIGHTCOLOUR,
				xindex : i+1,
				bottom : 0, height : 50
			});
			search_square.add(square_underlay);
			search_square.add(square_text);
			ximg2.addEventListener('singletap',perform_pre_determined_search);
//			square_text.addEventListener('click',perform_pre_determined_search);
			search_square_x3.add(search_square);
		}
		if (search_square_x3 != null) {
			search_views.push(search_square_x3);
		}
		

		var normal_searches_view = Ti.UI.createScrollableView({
			views : search_views,
			pagingControlColor : css.LIGHTCOLOUR,
			backgroundColor : css.LIGHTCOLOUR,
			pagingControlHeight : 20,
			top:0,
			showPagingControl:true,
			height : 320
		});

		
		feature_view.add(normal_searches_view);


		var show_correct_navigation_arrows = function() {
			if (normal_searches_view.currentPage > 0) {
				ximg_left.visible = true;
			} else {
				ximg_left.visible = false;
			}
			if (normal_searches_view.currentPage < (normal_searches_view.views.length-1)) {
				ximg_right.visible = true;
			} else {
				ximg_right.visible = false;
			}
		}
		var hide_correct_navigation_arrows = function() {
			ximg_right.visible = false;
			ximg_left.visible = false;
		}
		show_correct_navigation_arrows();
		normal_searches_view.addEventListener('scrollEnd',show_correct_navigation_arrows);
		normal_searches_view.addEventListener('scroll',hide_correct_navigation_arrows);
		
		navigation_arrow_right = function() {
			ximg_right.visible = false;
			normal_searches_view.scrollToView(normal_searches_view.currentPage+1);
		}
		ximg_right.addEventListener('click',navigation_arrow_right);
		navigation_arrow_left = function() {
			ximg_left.visible = false;
			normal_searches_view.scrollToView(normal_searches_view.currentPage-1);
		}
		ximg_left.addEventListener('click',navigation_arrow_left);		
	}
//	self.addEventListener('click', displayhelp);
	Titanium.App.addEventListener("display-search-force",displaySearchForce);
	
	return self;
	
}

module.exports = fn;
