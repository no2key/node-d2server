process.stdin.setEncoding('utf8');

// 命令行拓展
var readline = require('readline'),
	fs = require('fs'),
	_conf = require('../../conf.js'),
	util = require('../util.js'),
	notice = require('../notice.js'),
	rl = readline.createInterface(process.stdin, process.stdout),
	yesReg = /^y(es)?$/i,

	initAppConfig = require('../appconfig.js').init;

rl.setPrompt('D2> ');
rl.prompt();


rl.on('line', function(data){
	data = data.trim();

	if (data == 'rs') {
		rl.prompt();
		return;
	}

	if (data.indexOf('/') == -1) {
		question('Do you want create "'+data+'" project?', function() {
			var root = _conf.DocumentRoot + data+'/',
				file = root+_conf.AppConfigFile;
			if (!fs.existsSync(file)) {
				try {
					// 生成项目文件
					util.writeFile(file, 'module.exports = {\n\t"dataAPI": false,\n\t"alias": "",\n\t"defaultHeader": "",\n\t"defaultFooter": "",\n\t"HTML": {},\n\t"fileMap": {},\n\t"baseLess": "",\n\t"sync": {\n\t}\n};');
					initAppConfig(root);
					
					file = root+_conf.SourcePath;
					if (!fs.existsSync(file)) util.mkdirs(file);
					file = root+_conf.DynamicDataPath;
					if (!fs.existsSync(file)) util.mkdirs(file);
					file = root+'.gitignore';
					if (!fs.existsSync(file)) util.writeFile(file, 'Thumbs.db\nnode_modules');

					notice.log('Object Init', 'Object create success');
				} catch(err) {
					notice.error('', err);
				}
			} else {
				notice.warn('Object Init', 'Object is exists');
			}
		});
	}

	rl.prompt();
}).on('close', function() {
	console.log('Have a great day!');
	process.exit(0);
});





module.exports = {
	'origin': rl,
	'question': question
};


function question(ques, yes, no){
	rl.question(ques+' (yes/no) ', function(answer){
		if (yesReg.test(answer)) {
			yes();
		} else if (no) {
			no();
		}

		rl.prompt();
	});
}