var pg = require('pg');
var conString = "postgres://jonathan:root@localhost/NextRipta";

var stopId = '17045';
var route = '40';
var stopQuery = 'SELECT '
stopQuery += '"StopTimes".arrival_time, "Trips".trip_headsign '
stopQuery += 'FROM '
stopQuery += 'public."Calendar", public."Trips", public."StopTimes", public."Routes" '
stopQuery += 'WHERE '
stopQuery += '"Calendar".service_id = "Trips".service_id AND '
stopQuery += '"Trips".trip_id = "StopTimes".trip_id AND '
stopQuery += '"Routes".route_id = "Trips".route_id AND '
stopQuery += '"Calendar".start_date <= current_date AND ' 
stopQuery += '"Calendar".end_date >= current_date AND '
stopQuery += '"Calendar".wednesday = true AND '
stopQuery += '"StopTimes".arrival_time >= $1 AND '
stopQuery += '"StopTimes".stop_id = $2 '
stopQuery += 'ORDER BY '
stopQuery += '"StopTimes".arrival_time ASC '
stopQuery += 'LIMIT 5; '

var routeQuery = 'SELECT '
routeQuery += '"StopTimes".arrival_time, "Trips".trip_headsign '
routeQuery += 'FROM '
routeQuery += 'public."Calendar", public."Trips", public."StopTimes", public."Routes" '
routeQuery += 'WHERE '
routeQuery += '"Calendar".service_id = "Trips".service_id AND '
routeQuery += '"Trips".trip_id = "StopTimes".trip_id AND '
routeQuery += '"Routes".route_id = "Trips".route_id AND '
routeQuery += '"Calendar".start_date <= current_date AND ' 
routeQuery += '"Calendar".end_date >= current_date AND '
routeQuery += '"Calendar".wednesday = true AND '
routeQuery += '"StopTimes".arrival_time >= $1 AND '
routeQuery += '"StopTimes".stop_id = $2 AND '
routeQuery += '"Routes".route_short_name = $3 '
routeQuery += 'ORDER BY '
routeQuery += '"StopTimes".arrival_time ASC '
routeQuery += 'LIMIT 5; '

var getTime = function() {
	var date = new Date();
	// return date.getHours() * 60 + date.getMinutes();
	return 600;
}

var connect = function(cb) {
	pg.connect(conString, function(err, client, done) {
		if (err) {
			return console.error("err", err);
		}
		cb(client, done);
	})
}

var nextBus = function(stopId, cb) {
	connect(function(client, done) {
		client.query(stopQuery, [getTime(), stopId], function(err, result) {
			done();
			if (err) return console.log(err);
			console.log(result.rows);
			cb(result);
		})
	});
}

var nextBusWithRoute = function(stopId, routeId, cb) {
	connect(function(client, done) {
		client.query(routeQuery, [getTime(), stopId, routeId], function(err, result) {
			console.log(routeQuery);
			if (err) return console.log(err);
			console.log(result.rows);
			cb(result);
		})
	});
}

module.exports.nextBus = nextBus;
module.exports.nextBusWithRoute = nextBusWithRoute;