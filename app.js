
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , db = require('./sql2.js')
  , nmo = require('./nexmo.js');

var app = module.exports = express.createServer();

nmo.initialize(process.env.N_KEY, process.env.N_SECRET, 'http', false);
// Configuration

var getTime = function getTime() {
  var date = new Date();
  return ((date.getUTCHours() - 4 + 24) % 24) * 60 + date.getMinutes();
}

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/api/next/:stopId', function(req, res) {
  db.nextBus(req.params.stopId).then(function(rows) {
    res.json(rows);
  })
})

app.get('/api/next/:stopId/:routeId', function(req, res) {
  var routeId = parseInt(req.params.routeId);
  db.nextRoute(req.params.stopId, routeId)
    .then(function(rows) {
      res.json(rows);
    })
})

app.get('/api/stops/:name', function(req, res) {
  db.searchStops(req.params.name.toUpperCase()).then(function(rows) {
    res.json({results: rows});
  })
})

app.get('/api/alias', function(req, res) {
  db.listAliases().then(function(rows) {
    res.json({results: rows});
  })
})

app.get('/sms', function(req, res) {
  if(req.query.text && req.query.msisdn) {
  // if (true) {
    // var msg = req.query.text.toLowerCase();
    var number = req.query.msisdn;
    console.log(number);
    console.log(req.query.text);
    db.nextBus('16905').then(function(rows) {
      var now = getTime();
      console.log(now);
      var msg = "";
      for(var i = 0; i < rows.length; i++) {
        msg += rows[i].trip_headsign;
        msg += " in " + (rows[i].arrival_time - now) + " mins\n"
      }
      if (rows.length == 0) {
        msg = "No more busses today.";
      }
      res.json(rows);
      nmo.sendTextMessage("14012503441", number, msg, {}, function(err, res){ 
        console.log(err);
        console.log(res);
      });
    });
  }
})

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
