/*
Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.plugins.add('pasteimage', {
	requires : ['styles', 'button'],
	init : function (a) {
		a.addCommand('pasteimage', CKEDITOR.plugins.pasteimage.commands.pasteimage);
		a.ui.addButton('PasteImage', {
			label : a.lang.pasteimage.label,
			command : 'pasteimage',
			icon : this.path + "pasteimage.gif"
		});
	}
});
CKEDITOR.plugins.pasteimage = {
	commands : {
		pasteimage : {
			exec : function (a) {
				function GetChormeInnerHTML(nodes) {
					var result = '';
					var node = null;
					for (var i = 0; i < nodes.length; i++) {
						node = nodes[i];
						if (node.outerHTML) {
							result += node.outerHTML;
						} else if (node.nodeValue) {
							result += node.nodeValue;
						}
					}
					return result.replace("<div><br></div>", "<br>");
				}
				var sl = a.getSelection();
				if (CKEDITOR.env.webkit) {
					alert(GetChormeInnerHTML(sl.getNative().getRangeAt(0).cloneContents().childNodes));
				}
				if (CKEDITOR.env.ie8) {
					alert(sl.getNative().createRange().htmlText);
				}
				return;
				// 在这里执行你将_html中的空行替换掉的操作
				var objWordPaster = new ActiveXObject("Pera.WordPaster");
				var url = "http://192.168.113.20:8080/ckeditor/uploadstream";
				var p = JSON.stringify({
						url : url
					});
				alert(p)
				var v = objWordPaster.Upload(p);
				alert(v);
				v = JSON.parse(v);
				if (v.errMsg) {
					alert(v.errMsg);
					return;
				}
				var arr = v.data;
				var imgs,
				item,
				exist,
				i,
				j;
				for (var i in arr) {
					imgs = a.document.getElementsByTag('img');
					exist = false;
					for (var j = 0; j < imgs.count(); j++) {
						item = imgs.getItem(j);
						if (arr[i].localPath && item.getAttribute('src').replace(/\\/g, '/') == 'file:///' + arr[i].localPath.replace(/\\/g, '/')) {
							item.setAttribute('src', '/ckeditor/upload/' + arr[i].webFilename);
							item.setAttribute('data-cke-saved-src', '/ckeditor/upload/' + arr[i].webFilename);
							if (arr[i].height > 0) {
								item.setAttribute('height', arr[i].height);
								item.setAttribute('data-cke-saved-height', arr[i].height);
							}
							if (arr[i].width > 0) {
								item.setAttribute('width', arr[i].width);
								item.setAttribute('data-cke-saved-width', arr[i].width);
							}
							exist = true;
						}

					}
					if (!exist) {
						if (arr[i].width > 0) {
							a.insertHtml('<img src="/ckeditor/upload/' + arr[i].webFilename + '" width="' + arr[i].width + '" height="'
								 + arr[i].height + '"/>');
						} else {
							a.insertHtml('<img src="/ckeditor/upload/' + arr[i].webFilename + '"/>');
						}

					}

				}
				a.updateElement();

			}
		}
	}
};
