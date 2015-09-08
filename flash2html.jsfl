﻿var fileURI,doc,timeline,lib;

function init(){
	doc = fl.getDocumentDOM();
	timeline = doc.getTimeline();
	lib = doc.library;
	fileURI = doc.pathURI.slice(0, doc.pathURI.lastIndexOf("/")+1);
	
	var _tlData = cookTimeline(timeline);
	
	exportHtml(_tlData.html);
	exportCss(_tlData.css);
}

init();


//---------------------------------------输出

function cookTimeline(timeline, className){
	var _html = '';
	var _css = '';
	for(var len = timeline.layers.length, j = len-1; j>=0; j--){
		var layer = timeline.layers[j];
		if(layer.layerType == 'normal'){
			var elements = layer.frames[0].elements;
			for(var i in elements){
				var ele = elements[i];
				var domObj = null;
				switch(ele.elementType){
					case 'instance':
						switch(ele.instanceType){
							case 'symbol':
								domObj = cerateDiv(ele);
								break;
							case 'bitmap':
								var img = exportImg(ele.libraryItem).url;
								domObj = cerateDiv(ele, img);
								break;
						}
						break;
					case 'shape':
						break;
					case 'text':
						break;
				}
				
				if(domObj){
					_html += domObj.html;
					_css += (className?('.' + className + ' '):'') + domObj.css;
				}
			}
		}
	}
	
	return {
		html:_html,
		css:_css
	};
}

function exportImg (libItem){
	var URI = 'images';
	var aURL,rURL;
	var _data = checkName(libItem.name);
	
	for(var i in _data.path){
		URI += '/' + _data.path[i];
		FLfile.createFolder(fileURI + URI);
	}
	
	var _name = _data.name;
	switch(libItem.originalCompressionType){
		case 'photo':
			rURL = URI + '/' + _name + '.jpg';
			aURL = fileURI + rURL;
			break;
		case 'lossless':
			rURL = URI + '/' + _name + '.png';
			aURL = fileURI + rURL;
			break;
	}
	libItem.exportToFile(aURL, 100);
	
	return {
		name:libItem.name,
		url:rURL
	};
}

function exportHtml (text){
	var _fileURL = fileURI + 'index.html';
	var _text = '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title></title><style>html,body{background:' + doc.backgroundColor + '}</style><link rel="stylesheet" href="css/main.css"/></head><body>' + text + '</body></html>';
	FLfile.write(_fileURL, _text);
}

function exportCss (text){
	var _folderURI = fileURI + 'css';
	var _fileURL = _folderURI + '/main.css';
	var _text = text;
	FLfile.createFolder(_folderURI);
	FLfile.write(_fileURL, _text);
}

function cerateDiv(ele, img){
	var _a = Math.round(ele.colorAlphaPercent)/100;
	var _r = Math.round(ele.rotation);
	var _sx = Math.round(ele.scaleX*100)/100;
	var _sy = Math.round(ele.scaleY*100)/100;
	var _kx = Math.round(ele.skewX);
	var _ky = Math.round(ele.skewY);
	
	if(!isNaN(_r)){
		ele.rotation = 0;
	}else{
		ele.skewX = 0;
		ele.skewY = 0;
	}
	ele.scaleX = 1;
	ele.scaleY = 1;
	
	var _w = Math.round(ele.width);
	var _h = Math.round(ele.height);
	var _x = Math.round(ele.x);
	var _y = Math.round(ele.y);
	var _tx = Math.round(ele.transformX);
	var _ty = Math.round(ele.transformY);
	
	if(!isNaN(_r)){
		ele.rotation = _r;
	}else{
		ele.skewX = _kx;
		ele.skewY = _ky;
	}
	ele.scaleX = _sx;
	ele.scaleY = _sy;
	
	var _cName = ele.name || createClassName(checkName(ele.libraryItem.name).name);
	var _tlData,_html,_css;
	
	_css = '.' + _cName + 
	'{position:absolute;' + 
	'left:' + _x + 'px;' + 
	'top:' + _y + 'px;';
	
	if(img){
		_css += 
		'width:' + _w + 'px;' + 
		'height:' + _h + 'px;' + 
		'background:url("../' + img + '");'
	}
	
	if(_a){
		_css += 
		'opacity:' + _a + ';'
	}
	
	var _tf = '';
	if(!isNaN(_r)){
		_tf += 'rotate(' + _r + 'deg) ';
	}else if(!isNaN(_kx) && !isNaN(_ky)){
		_tf += 'skew(' + _kx + 'deg,' + _ky + 'deg) ';
	}
	if(_sx !== 1 || _sy !== 1){
		_tf += 'scale(' + _sx + ',' + _sy + ') ';
	}
	
	if(_tf !== ''){
		_css += 
		'transform-origin:' + (_tx-_x) + 'px ' + (_ty-_y) + 'px;' + 
		'-webkie-transform-origin:' + (_tx-_x) + 'px ' + (_ty-_y) + 'px;' + 
		'transform:' + _tf + ';' + 
		'-webkie-transform:' + _tf + ';';
	}
	
	_css += '}';
	
	if(ele.libraryItem.timeline){
		_tlData = cookTimeline(ele.libraryItem.timeline, _cName);
		_html = '<div class="' + _cName + '">' + _tlData.html + '</div>';
		_css += _tlData.css;
	}else{
		_html = '<div class="' + _cName + '">' + '</div>';
	}
	
	return {
		html:_html,
		css:_css
	};
}

var cid = 0;
function createClassName(name){
	var _name = parseInt(name[0])+'' == name[0]?('p'+name):name;
	return (_name||'div') + 's' + ++cid;
}

function checkName(name){
	var _a = name.split("/");
	for(var i in _a){
		var _t = _a[i];
		var _n = _t.lastIndexOf(".");
		_t = _n>=0?_t.slice(0, _n):_t;
		_t = _t.replace(/[\.\s]/g, "_");
		_a[i] = _t;
	}
	var _name = _a.pop();
	
	return {
		path:_a,
		name:_name
	};
}




