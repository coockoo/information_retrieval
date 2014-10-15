var fs = require('fs');
var Q = require('q');


function LineReader (filename) {
	var _newLines = [String.fromCharCode(10), String.fromCharCode(13)];

	var _readableDeferred = Q.defer();
	var _lines = [];

	var _line = [];

	var _readable = fs.createReadStream(filename, {encoding: 'utf-8', flags: 'r'});
	_readable.on('open', function () {
		_readable.on('data', function (chunk) {
			for (var i = 0; i < chunk.length; ++i) {
				if (_newLines.indexOf(chunk[i]) > -1) {
					if (_line.length > 0) {
						_lines.push(_line.join(''));
						_line = [];
					}
				} else {
					_line.push(chunk[i]);
				}
			}
		});

		_readable.on('error', function (error) {
			console.log(error);
		});

		_readable.on('end', function () {
			if (_line.length) {
				_lines.push(_line.join('')); //Last line
			}
			_readableDeferred.resolve(_lines);
		});
	});

	return {
		readLines: function () {
			return _readableDeferred.promise.then(function (line) {
				return line;
			})
		}
	}
}

module.exports = LineReader;
