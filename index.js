// http-ish
var restify = require('restify');

// level config
var level = require('level');
var uuid = require('node-uuid');
var options = {keyEncoding: 'json', valueEncoding: 'json'};
var db = level(__dirname + '/db', options);

var server = restify.createServer({
  name: 'shortlevel',
  version: '0.1.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/shorten', function (req, res, next) {
  if (req.params.url) {
    var url = req.params.url;
    var urlId = (+new Date()).toString(36);

    db.put(urlId, url, function(err) {
      if (err) {
        console.log('Error', err);
        res.send({error: 'Ohnoez, halp.'});
      }
      else {
        console.log('Shortened ' + urlId + ': ' + url);
        res.send({url: server.url + '/' + urlId});
      }
    });
    // res.send({urlId: urlId});
  }
  else {
    res.send({error: 'URL was not specified.'});
  }
  return next();
});

server.get('/:urlId', function(req, res, next) {
  db.get(req.params.urlId, function(err, url) {
    if (err) res.send({error: 'Unable to find shortened URL.'});
    else {
      res.writeHead(301, {
        'Location': url
      });
      res.end();
    }
  });
  return next();
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
