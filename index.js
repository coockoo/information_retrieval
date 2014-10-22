var fs = require('fs');
var path = require('path');
var Q = require('q');

var dictionaryFilePath = '/Users/coockoo/www/information_retrieval/results/dictionary.txt';
var matrixFilePath = '/Users/coockoo/www/information_retrieval/results/matrix.txt';
var libraryPath = '/Users/coockoo/www/information_retrieval/library';

var ignored = ['.DS_Store'];

function getDictionary (libraryPath) {
	var totalWords = 0;
	var totalDocuments = 0;
	return parseDirectory(libraryPath).then(function (files) {
		var q = [];
		files.forEach(function (file) {
			if (ignored.indexOf(file) < 0) {
				++totalDocuments;
				q.push({file: path.join(libraryPath, file), content: fs.readFileSync(path.join(libraryPath, file), {encoding: 'utf-8'})});
			}
		});
		return Q.all(q);
	}).then(function (filesList) {
		var dictionary = [];
		filesList.forEach(function (file) {
			console.log('[C]: ', file.file);
			var words = [];
			var items = file.content.replace(/[\?\.,-\/#!$%\^&\*;:{}=\-_`~\(\)\[\]\\'\+"]/g, '').split(/\s/);
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
		return {
			dictionary: dictionary,
			totalWords: totalWords,
			totalDocuments: totalDocuments
		};
	});
}
/*
getDictionary(libraryPath).then(function (dictionary) {
	console.log('Collection size: ', dictionary.totalDocuments);
	console.log('Total words: ', dictionary.totalWords);
	console.log('Dictionary size: ', dictionary.dictionary.length);
 	fs.writeFileSync(dictionaryFilePath, dictionary.dictionary.sort().join('\n'));
});
*/

function getIncidenceMatrix (libraryPath) {
	return parseDirectory(libraryPath).then(function (files) {
		var q = [];
		files.forEach(function (file) {
			if (ignored.indexOf(file) < 0) {
				q.push({file: path.join(libraryPath, file), content: fs.readFileSync(path.join(libraryPath, file), {encoding: 'utf-8'})});
			}
		});
		return Q.all(q);
	}).then(function (filesList) {
		var filesCount = filesList.length;
		var matrix = {};
		filesList.forEach(function (file, index) {
			console.log('[C]: ', file.file);
			var items = file.content.replace(/[\?\.,-\/#!$%\^&\*;:{}=\-_`~\(\)\[\]\\'\+"]/g, '').split(/\s/);
			items.forEach(function (item) {
				if (item.length) {
					if (!matrix[item]) {
						matrix[item] = [];
						for (var i = 0; i < filesCount; ++i) {
							matrix[item].push(0);
						}
					}
					matrix[item][index] = 1;
				}
			});
		});
		return matrix;
	})
}
/*
getIncidenceMatrix(libraryPath).then(function (matrix) {
	console.log('writing matrix');
	fs.writeFileSync(matrixFilePath, '');
	for (var word in matrix) {
		console.log(word);
		fs.appendFileSync(matrixFilePath, word + ' [' + matrix[word].join(',') + ']\n', {encoding: 'utf-8'});
	}
});
*/


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
