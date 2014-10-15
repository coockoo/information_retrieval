var lineReader = require('./line-reader');
var fs = require('fs');
var path = require('path');
var Q = require('q');


//var file = '/Users/coockoo/www/information_retrieval/library/ttalk10.txt';
var dictionaryFilePath = '/Users/coockoo/www/information_retrieval/dictionary.txt';
var dictionary = [];
var libraryPath = '/Users/coockoo/www/information_retrieval/library';


var totalWords = 0;
var totalDocuments = 0;

var ignored = ['.DS_Store'];

function parseDirectory (path) {
	var deferred = Q.defer();
	fs.readdir(path, function (err, files) {
		if (!err) {
			deferred.resolve(files);
		} else {
			deferred.reject(err);
		}
	});
	return deferred.promise;
}

parseDirectory(libraryPath).then(function (files) {
	var q = [];
	files.forEach(function (file) {
		if (ignored.indexOf(file) < 0) {
			++totalDocuments;
			console.log('[C]: ', path.join(libraryPath, file));
			q.push(lineReader(path.join(libraryPath, file)).readLines());
		}
	});
	return Q.all(q);
}).then(function (linesList) {
	linesList.forEach(function (lines) {
		lines.forEach(function (line) {
			var words = [];
			var items = line.replace(/[\?\.,-\/#!$%\^&\*;:{}=\-_`~\(\)\[\]\\'"]/g, '').split(/\s/);
			items.forEach(function (item) {
				if (item.length) {
					++totalWords;
					words.push(item.toLowerCase());
				}
			});
			words.forEach(function (word) {
				if (dictionary.indexOf(word) == -1) {
					dictionary.push(word);
				}
			});
		});

	});
	return dictionary;
}).then(function (dictionary) {
	console.log('Collection size: ', totalDocuments);
	console.log('Total words: ', totalWords);
	console.log('Dictionary size: ', dictionary.length);
	fs.writeFileSync(dictionaryFilePath, dictionary.sort().join('\n'));
});
