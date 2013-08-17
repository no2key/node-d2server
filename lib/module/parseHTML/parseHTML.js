var ejs = require('./ejs.extend.js'),
	
	mod = require('../../mod.js'),
	_conf = mod.conf,
	path = require('path'),
	mimeTag = mod.load('mimeTag'),
	d2fsJS = mod.load('d2fsJS');


function getIoScriptTag(dirname){
	return '\n<script type="text/javascript">var d2server_date_4448877 = new Date().getTime(); window["module"+d2server_date_4448877] = window.module; window.module = false; window["io"+d2server_date_4448877] = window.io;</script>\n'+mimeTag.js(d2fsJS.socketUri)+mimeTag.js(d2fsJS.getD2fsUri(dirname))+'\n<script type="text/javascript">window.module = window["module"+d2server_date_4448877]; window.io = window["io"+d2server_date_4448877];</script>\n';
}

function getIncludeTpl(path, isBegin){
	var str = '<% include '+path+' %>';
	if (isBegin) {
		str += '\n\n\n\n\n\n<!-- Content Begin -->\n';
	} else {
		str = '\n<!-- Content End -->\n\n\n\n\n\n' + str;
	}
	return str;
}

function getIncludeCont(cont, file, options) {
	var root = options.projConf.root+_conf.SourcePath,
		fileRoot = path.dirname(file);		// relative不晓得为什么，会多出一级来，貌似文件也当作了一集，所以^^
	if (options.footer) cont += getIncludeTpl(path.relative(fileRoot, root+options.footer));
	if (options.header) cont = getIncludeTpl(path.relative(fileRoot, root+options.header), true) + cont;
	
	return cont;
}


// options 必须包含如下内容
// data  projConf
function parseHTML(cont, file, options) {
	cont = getIncludeCont(cont, file, options);

	var projConf = options.projConf,
		tpl = projConf.cacheTpl[file] || (projConf.cacheTpl[file] = ejs.compile(cont, {
				'filename': file,		// 解析include需要 ejs还需要做debug参数
				'cache': false,
				'projConf': projConf,
				'open': _conf.EJS_openTag,
				'close': _conf.EJS_closeTag
			}));

	return projConf.convertSource4HTML(tpl(options.data), options.htmlVirtualFileDirname);
}


function parseHTMLwithoutCache(cont, file, options) {
	cont = getIncludeCont(cont, file, options);

	return ejs.compile(cont, {
				'filename': file,
				'cache': false,
				'projConf': options.projConf,
				'open': _conf.EJS_openTag,
				'close': _conf.EJS_closeTag
			})(options.data);
}





module.exports = {
	'parse4splice': function(cont, file, options) {
		return parseHTMLwithoutCache(cont, file, options) + getIoScriptTag(options.projConf.dirname);
	},
	'parse4export': function(cont, file, options){
		return parseHTMLwithoutCache(cont, file, options);
	},
	'parse4cache': function(cont, file, callback, errorCallback, options){
		try {
			callback(parseHTML(cont, file, options) + getIoScriptTag(options.projConf.dirname));
		} catch (err) {
			errorCallback(err);
		}
	}
};