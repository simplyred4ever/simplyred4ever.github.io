/*
* common plugins 
* create by guilin.li
*/
(function($){
	/*nav toggle，一二级导航*/
	$.fn.navs = function(options1,options2){ 
		var defaults1 = {ctag: 'li',curCss: 'current',overCss:'hover',click:null},
			defaults2 = {subnav: '#subnav',ptag:'ul',ctag:'li',curCss:'current',overCss:'hover',click:null},
			opts1 = $.extend(defaults1, options1),
			opts2 = $.extend(defaults2, options2);
		
		return this.each(function() {
			var o = $.meta ? $.extend(opts1, $this.data()) : opts1;
			var oo = $.meta ? $.extend(opts2, $this.data()) : opts2;
			var $this = $(this),
				nodes = $this.find(o.ctag),
				subnav = $(oo.subnav),
				subNavs = subnav.find(oo.ptag);
			//一级
			nodes.each(function(i,e){
				$(e).hover(function(){
					$(this).toggleClass(o.overCss);
				}).bind("click",{index:i},function(event){
					nodes.removeClass(o.curCss);
					$(this).addClass(o.curCss);
					var subCNodes = subNavs.hide().eq(i).find(oo.ctag);
					if(subCNodes.size()>0){
						subNavs.eq(i).show();
						subCNodes.removeClass(oo.curCss).eq(0).addClass(oo.curCss);
					}else{
						subNavs.eq(i).hide()
					}
					if(subNavs.eq(0).find(oo.ctag).size()>0) subNavs.eq(0).show();
					if(o.click) o.click(event.data.index);
				});
			});
			//二级
			subNavs.each(function(){
				var subCNodes = $(this).find(oo.ctag);
				subCNodes.each(function(i,e){
				    $(e).hover(function() {
                        $(this).toggleClass(o.overCss);
                    }).bind('click', {index:i},function(event) {
                        subCNodes.removeClass(oo.curCss);
                        $(this).addClass(oo.curCss);
                        if(oo.click) oo.click(event.data.index);
                    });
				});
			});			
		});
	};
	/*menu slider，菜单目前只支持到二级*/
    $.fn.menus = function(options){
        var defaults = {headTag:'.menuhead',conTag:'.menucon',height:0,curCss:'current',overCss:'hover',openFirst:true,click:null};
            opts = $.extend(true, defaults, options);
        return this.each(function(){
            var $this = $(this),
                o = $.meta ? $.extend(opts, $this.data()) : opts;
            $this.children(o.headTag).each(function(){
                $(this).unbind("click").bind("click",function(){
                    if($(this).hasClass(o.curCss)) return;
                    sildeLi($(this),$(this).next(o.conTag),o);
                    if(o.click) o.click($(this));
                }).unbind("hover").bind("hover",function(){
                    $(this).toggleClass(o.overCss);
                }); 
                if(o.height==0)
                    $(this).next(o.conTag).hide();
                else
                    $(this).next(o.conTag).height(0);
            });
            if(o.openFirst){
                var first = $this.children(o.headTag).first();
                sildeLi(first,first.next(o.conTag),o,true); 
            }
        });
        function sildeLi(head,con,o,notSlider){
            if(notSlider){
                if(con.height()>0){
                    con.height(0);
                }else{
                    con.height(o.height);
                }
                return; 
            }
            if(o.height==0){
                if(con.css("display")=="none"){
                    head.addClass(o.curCss);
                    con.slideDown("fast");
                }else{
                    head.removeClass(o.curCss);
                    con.slideUp("fast");
                }
            }else{
                if(con.height()>0){
                    con.animate({"height":0}, {complete:function(){head.removeClass(o.curCss);con.css("overflow","hidden")}});
                }else{
                    head.addClass(o.curCss);
                    con.animate({"height":o.height}, {complete:function(){con.css("overflow","auto")}});
                }
            }
        }
    };
    /*弹出框*/
    $.fn.winOpen=function(){
        var methods = {//扩展方法
            init: function(options) {
                return this.each(function() {
                    var $this = $(this);
                    var settings = $this.data('winOpen');
                    if(typeof(settings) == 'undefined') {
                        var defaults = {
                        		modal:true,
                        		name:"winopen",
                        		title:"",
                        		url:"",
                        		width:500,
                        		height:500,
                        		left:'50%',
                        		top:'50%',
                        		center:1,
                        		help:0,
                        		resizable:0,
                        		status:0,
                        		scroll:0,
                        		resizable:false,
                        		event:null,
                        		onClick:null,
                        		beforeOpen:null,
                        		afterOpen:null,
                        		Close:null,
                        		postData:{},
                        		returnData:{}
                        	};
                        settings = $.extend(true, defaults, options);
                        $this.data('winOpen', settings);
                    } else {
                        settings = $.extend(true, settings, options);
                        $this.data('winOpen', settings);
                    }
                    var o = settings;
                        o.width = o.width<1 ? o.width*$(window).width():o.width;
                        o.height = o.height<1 ? o.height*$(window).height():o.height;
                        if(o.center==1){
                        	o.top = (window.screen.availHeight-o.height)*0.5;
                        	o.left = (window.screen.availWidth-o.width)*0.5;
                        }
                    
                    if(o.event){
	                    $this.on(o.event,function(){
	                    	if(o.beforeOpen) if(!o.beforeOpen()) return;
	                    	var wintop = window.top ||window;
	                    	var mask = wintop.$("#winmask");
	                        if(mask.size()==0)
	                        	wintop.$("body").append("<div class='winmask' id='winmask'></div>");
	                        else
	                        	mask.show()
	                    	var returnValue = window.showModalDialog(
	                    			o.url,
	                    			o.postData,
	                    			"dialogWidth="+o.width+"px"+
	                    			";dialogHeight="+o.height+"px"+
	                    			";dialogLeft="+o.left+
	                    			";dialogTop="+o.top+
	                    			";center="+o.center+
	                    			";help="+o.help+
	                    			";resizable="+o.resizable+
	                    			";status="+o.status+
	                    			";scroll="+o.scroll
	                    			
	                    	);
	                        wintop.$("#winmask").hide();
	                    	$this.data('returnValue', returnValue);
	                    	if(o.Close) o.Close($this);
	                    });
                    }else{
                    	if(o.beforeOpen) if(!o.beforeOpen()) return;
                    	var wintop = window.top ||window;
                    	var mask = wintop.$("#winmask");
                        if(mask.size()==0)
                        	wintop.$("body").append("<div class='winmask' id='winmask'></div>");
                        else
                        	mask.show()
                            
                    	var returnValue = window.showModalDialog(
	                    			o.url,
	                    			o.postData,
	                    			"dialogWidth="+o.width+"px"+
	                    			";dialogHeight="+o.height+"px"+
	                    			";dialogLeft="+o.left+
	                    			";dialogTop="+o.top+
	                    			";center="+o.center+
	                    			";help="+o.help+
	                    			";resizable="+o.resizable+
	                    			";status="+o.status+
	                    			";scroll="+o.scroll
	                    			
	                    	);
                        wintop.$("#winmask").hide();
                    	$this.data('returnValue', returnValue);
                    	if(o.Close) o.Close();
                    }
                }); 
            },
            destroy: function(options) {
                return $(this).each(function() {
                    var $this = $(this);
                    $this.removeData('winOpen');
                });
            },
            val: function(options) {
                var someValue = this.eq(0).html();
                return someValue;
            }
        };
        //添加或修改url传参
        function _setParams(param,value,url){
            var reg = new RegExp('([\?&]?)' + param + '=[^&]*[&$]?', 'gi'),
                index = url.indexOf('?'),
                urlParam = "" ;
            if(index > -1){
                urlParam = url.slice(index),
                url = url.slice(0,index),
                urlParam = urlParam.replace(param,'$1');
            }
            
            if (urlParam == '') {
                urlParam += param + '=' + value;
            } else if (urlParam.substr(urlParam.length - 1,1) == '?' || urlParam.substr(urlArgs.length - 1,1) == '&') {
                urlParam += param + '=' + value;
            } else {
                urlParam += '&' + param + '=' + value;
            }
            if(!(/^\?.*?/gi).test(urlParam))
                urlParam = "?"+urlParam;
            return (url + urlParam);
        }
        //function _
        //添加方法
        var method = arguments[0];
        if(methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if( typeof(method) == 'object' || !method ) {
            method = methods.init;
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.winOpen' );
            return this;
        }
        return method.apply(this, arguments);
    };
    /*
	*wresize
	*/
	$.fn.wresize = function(f){
		function handleWResize(e){
			if(f){
				if(f.tid)clearTimeout(f.tid);
				f.tid=setTimeout(function(){
					f.call([e]);
				},100)
			}
		}
		this.each(function(){
			if (this == window){
				$(this).resize(handleWResize);
			}else{
				$(this).resize(f);
			}
		});
		return this;
	};
	/*datagrid.methods*/
	if($.fn.datagrid){
    	$.extend($.fn.datagrid.methods, {
    		editCell: function(jq,param){
    			return jq.each(function(){
    				var opts = $(this).datagrid('options');
    				var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));
    				for(var i=0; i<fields.length; i++){
    					var col = $(this).datagrid('getColumnOption', fields[i]);
    					col.editor1 = col.editor;
    					if (fields[i] != param.field){
    						col.editor = null;
    					}
    				}
    				$(this).datagrid('beginEdit', param.index);
    				for(var i=0; i<fields.length; i++){
    					var col = $(this).datagrid('getColumnOption', fields[i]);
    					col.editor = col.editor1;
    				}
    				$(".datagrid-editable-input").focus();
    			});
    		},
    		// 激活某字段表格列的编辑状态
			// create by guoshun.hou 20130926
			activateColumnEditor:function(jq,columnsNames){
				return jq.each(function(){
					var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));
					for(var i=0; i<fields.length; i++){
						var col = $(this).datagrid('getColumnOption', fields[i]);
						col.editor1 = col.editor;
						if (columnsNames.indexOf(fields[i])<0){
							col.editor = null;
						}
					}
					for(var i=0; i<$(this).datagrid('getRows').length; i++){
						$(this).datagrid('beginEdit', i);
					}
					for(var i=0; i<fields.length; i++){
						var col = $(this).datagrid('getColumnOption', fields[i]);
						col.editor = col.editor1;
					}
				});
			},
			// 合并指定列内容相同的单元格
			// create by guoshun.hou 20130922
			mergeCellsByField: function(jq, colList){
				return jq.each(function(){
					if(!colList)
						colList = $(this).data('colList');
					else
						$(this).data('colList',colList);
					var ColArray = colList.split(',');
					var TableRowCnts = $(this).datagrid('getRows').length;
					var tmpA;
					var tmpB;
					var PerTxt = '';
					var CurTxt = '';
					var alertStr = '';
					for(j=ColArray.length-1;j>=0;j--){
						PerTxt = "";
						tmpA = 1;
						tmpB = 0;
						for(i=0;i<=TableRowCnts;i++){
							if(i==TableRowCnts)
								CurTxt = '';
							else
								CurTxt = $(this).datagrid('getRows')[i][ColArray[j]];
							if(PerTxt==CurTxt)
								tmpA += 1;
							else{
								tmpB += tmpA;
								$(this).datagrid('mergeCells',{
									index: i-tmpA,
									field: ColArray[j],
									rowspan: tmpA,
									colspan: null
								});
								tmpA = 1;
							}
							PerTxt = CurTxt;
						}
					}
					$(this).data('Complex',1);
					$(this).datagrid("selectComplexRow");
				});
			},
			// 拆分合并的复杂单元格
			// create by guoshun.hou 20131121
			breakApartComplexRow: function(jq){
				return jq.each(function(){
					var table = $(this).datagrid('getPanel').find('.datagrid-body > table');
					table[0].className = table[0].className.replace(/[ ]?tr\d+_sel[ ]?/gi,'');
					$('td[rowspan]',table).removeAttr('rowspan');
					$('td',table).each(function(){
						$(this).unbind();
						this.className = this.className.replace('datagrid-td-merged','').replace(/[ ]?tr\d+(?![_\d])[ ]?/gi,'');
					});
					$('td[field="' + $(this).data('colList').replace(',','"]:hidden,td[field="') + '"]:hidden',table).show();
				});
			},
			// 删除含复杂单元格的指定行
			// create by guoshun.hou 20131121
			deleteComplexRow:function(jq,index){
				return jq.each(function(){
					$(this).datagrid('breakApartComplexRow');
					$(this).datagrid('deleteRow',index);
					$(this).datagrid('mergeCellsByField',$(this).data('colList'));
					if($(this).datagrid('options').striped){
						var rows = $(this).datagrid('getPanel').find('.datagrid-body > table > tbody > tr');
						rows.removeClass('datagrid-row-alt');
						rows.filter(':odd').addClass('datagrid-row-alt');
					}
				});
			},
			// 复杂表格选择和鼠标浮动整行
			// 增加onCheck和onUncheck事件响应背景色
			// create by guoshun.hou 20130930 optimize 20140120
			selectComplexRow:function(jq){
				return jq.each(function(){
					var _jq = $(this);
					var table = _jq.datagrid('getPanel').find('.datagrid-body > table');
					var rows = _jq.datagrid('getRows');
					var tdoverStyle = $('#tdoverStyle');
					if(!tdoverStyle[0])$('<style id="tdoverStyle" />').appendTo(document.body);
					var tdSelectedStyle = $('<style id="' + $(this)[0].id + 'TdSelectedStyle" />').appendTo(document.body);
					table.each(function(){
					$(this).find('tr').each(function(i){
						$(this).find('td').each(function(){
							$(this).addClass('tr'+(i+1));
							this.rowspan = parseInt($(this).attr('rowspan'));
							if(this.rowspan > 1)for(var j=1; j<this.rowspan; j++){$(this).addClass('tr'+(i + 1 + j));}
							$(this).mouseover(function(){
								var cls = this.className.match(/tr\d+/gi);
								if(this.rowspan > 100){
									table[0].className += ' ' + cls.join(' ');
									var cssText = '';
									for(var i=0; i<cls.length; i++){cssText += '.' + cls[i] + ' .' + cls[i] + (i!=(cls.length-1)?',':'');}
									cssText += '{background:#FAF3E1;}';
									try{
										tdoverStyle.html(cssText);
									}catch(ex){
										tdoverStyle[0].styleSheet.cssText = tdoverStyle.html() + cssText;
									}
								}else{
									table.find('.'+cls.join(',.')).addClass('td_over');
								}
							}).mouseout(function(){
								if(this.rowspan > 100){
									table[0].className = table[0].className.replace(/tr\d+(?![_\d])/gi,'');
									try{
										tdoverStyle.html('');
									}catch(ex){
										tdoverStyle[0].styleSheet.cssText = '';
									}
								}else{
									table.find('.'+this.className.match(/tr\d+/gi).join(',.')).removeClass('td_over');
								}
							}).click(function(){
								var _this = this;
								var cls = _this.className.match(/tr\d+/gi);
								var isSeledted = table.is('.' + cls.join('_sel,.') + '_sel');
								var opts = _jq.datagrid('options');
								var parentRow = $(this).parent();
								var parentRowIndex = parentRow.attr('datagrid-row-index');
								if(opts.singleSelect){
									if(!isSeledted){
										table[0].className = table[0].className.replace(/tr\d+_sel[ ]?/gi,'');
										try{
											tdSelectedStyle.html('');
										}catch(ex){
											tdSelectedStyle[0].styleSheet.cssText = '';
										}
										table.addClass(cls[0] + '_sel');
									}else
										return;
								}else{
									if(isSeledted){
										table.removeClass(cls.join('_sel ') + '_sel');
										if(_this.rowspan > 1)
											setTimeout(function(){
												table.find('.'+_this.className.match(/tr\d+/gi).join(',.')).each(function(){
													var parentRow = $(this).parent();
													var parentRowIndex = parentRow.attr('datagrid-row-index');
													parentRow.removeClass('datagrid-row-selected');
													opts.onUncheck.call(_jq,parentRowIndex,rows[parentRowIndex]);
												});},10);
									}else{
										table.addClass(cls.join('_sel ') + '_sel');
										if(_this.rowspan > 1)
											setTimeout(function(){
												table.find('tr .'+_this.className.match(/tr\d+/gi).join(':not([rowspan]):first-child,tr .')+':not([rowspan]):first-child').each(function(){
													var parentRow = $(this).parent();
													var parentRowIndex = parentRow.attr('datagrid-row-index');
													parentRow.addClass('datagrid-row-selected');
													opts.onCheck.call(_jq,parentRowIndex,rows[parentRowIndex]);
												});},10);
									}
								}
								var cssText = "";
								for(var i=0; i<cls.length; i++){cssText += '.' + cls[i] + '_sel .' + cls[i] + (i!=(cls.length-1)?',':'');}
								cssText += '{background:#FBEBBF;}';
								if(tdSelectedStyle.html().indexOf(cssText)>=0)return;
								try{
									tdSelectedStyle.html(tdSelectedStyle.html() + cssText);
								}catch(ex){
									tdSelectedStyle[0].styleSheet.cssText=tdSelectedStyle.html() + cssText;
								}
							});
						});
					});
				});
				});
			}
    	});
   };
})(jQuery);

//格式化json模板
function formatJson(str,args){
	if(!str) return str='';
	for(var i in args){
		var reg= new RegExp('\{('+i+')\}',"g");
		str = str.replace(reg,args[i]);
	}
	return str;
}
//debugging    
function debug(info) {
	if (window.console && window.console.log)    
	window.console.log('out: ' + info);
};
//双击不选中
var clearSelection = function () {
    if(document.selection && document.selection.empty) {
        document.selection.empty();
    }
    else if(window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
	}
};

jQuery(function($){
    //按钮效果
    $("button.button").hover(function(){$(this).toggleClass("bhover")}).mousedown(function(){$(this).addClass("bclick");}).mouseup(function(){$(this).removeClass("bclick")});
    $("button.sbutton").hover(function(){$(this).toggleClass("shover")}).mousedown(function(){$(this).addClass("sclick");}).mouseup(function(){$(this).removeClass("sclick")});
    $("button.bbutton").hover(function(){$(this).toggleClass("bbhover")}).mousedown(function(){$(this).addClass("bbclick");}).mouseup(function(){$(this).removeClass("bbclick")});
	$("button.selbutton1").hover(function(){$(this).toggleClass("selhover1")}).mousedown(function(){$(this).addClass("selclick1");}).mouseup(function(){$(this).removeClass("selclick1")});
	$("button.selbutton2").hover(function(){$(this).toggleClass("selhover2")}).mousedown(function(){$(this).addClass("selclick2");}).mouseup(function(){$(this).removeClass("selclick2")});
	$("button.selbutton3").hover(function(){$(this).toggleClass("selhover3")}).mousedown(function(){$(this).addClass("selclick3");}).mouseup(function(){$(this).removeClass("selclick3")});
	$("button.selbutton4").hover(function(){$(this).toggleClass("selhover4")}).mousedown(function(){$(this).addClass("selclick4");}).mouseup(function(){$(this).removeClass("selclick4")});
});

//	等待效果begin  
jQuery(function($){
	/**
	 *  此功能依赖
	 *  easyui.css
	 *  jquery.easyui.min.js
	 *  jquery.js
	 * @type 
	 */
	var waitObj = window.waitObj = {};
	/**
	 * 实现等待界面遮盖的效果
	 * @param {} message 等待界面显示的信息
	 */
	waitObj.showWait=function(message){
		if($(".datagrid-mask").size() == 0) {
			$("<div class=\"datagrid-mask\"></div>").appendTo("body").css({display:"block",width:"100%",height:$(window).height()}); 
			$("<div class=\"datagrid-mask-msg\"></div>").html((message?message:"请稍候...")).appendTo("body").css({display:"block",left:($(document.body).outerWidth(true) - 190) / 2,top:($(window).height() - 45) / 2});
		} else {
			$('.datagrid-mask').css({display:"block",width:"100%",height:$(window).height()});
    		$('.datagrid-mask-msg').css({display:"block",left:($(document.body).outerWidth(true) - 190) / 2,top:($(window).height() - 45) / 2});
    		$("<div class=\"datagrid-mask-msg\"></div>").html((message?message:"请稍候..."));
		}
	}
	/**
	 * 隐藏等待界面遮盖效果
	 */
	waitObj.hideWait=function(){
		 $('.datagrid-mask').css({display:'none'});
	     $('.datagrid-mask-msg').css({display:'none'});
	}
});
//	等待效果end