var knex = require('knex')({
	client: 'pg',
	connection: process.env.DATABASE_URL || "postgres://jonathan:root@localhost/NextRipta"
})

var getDate = function getDate() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return year + '-' + month + '-' + day;
}

var getTime = function getTime() {
  var date = new Date();
  return ((date.getUTCHours() - 4 + 24) % 24) * 60 + date.getMinutes();
}

var weekday=new Array(7);
weekday[0]="sunday";
weekday[1]="monday";
weekday[2]="tuesday";
weekday[3]="wednesday";
weekday[4]="thursday";
weekday[5]="friday";
weekday[6]="saturday";

var getDayColumn = function getDayColumn() {
	var date = new Date();
	return 'calendar.' + weekday[date.getDay()];
}

module.exports.nextBus = function(stopId) {
	return knex.select('stoptimes.arrival_time', 'trips.trip_headsign')
		.from('stoptimes')
		.innerJoin('trips', 'stoptimes.trip_id', 'trips.trip_id')
		.innerJoin('routes', 'trips.route_id', 'routes.route_id')
		.innerJoin('calendar', 'trips.service_id', 'calendar.service_id')
		// .where('calendar.start_date', '<=', getDate())
		// .where('calendar.end_date', '>=', getDate())
		.where(getDayColumn(), 'true')
		.where('stoptimes.arrival_time', '>=', getTime())
		.where('stoptimes.stop_id', '17045')
		.orderBy('stoptimes.arrival_time', 'ASC')
		.limit(5);
}

module.exports.nextRoute = function(stopId, routeName) {
	return knex.select('stoptimes.arrival_time', 'trips.trip_headsign')
		.from('stoptimes')
		.innerJoin('trips', 'stoptimes.trip_id', 'trips.trip_id')
		.innerJoin('routes', 'trips.route_id', 'routes.route_id')
		.innerJoin('calendar', 'trips.service_id', 'calendar.service_id')
		.where('calendar.start_date', '<=', getDate())
		.where('calendar.end_date', '>=', getDate())
		.where(getDayColumn(), 'true')
		.where('stoptimes.arrival_time', '>=', 600)
		.where('stoptimes.stop_id', '17045')
		.where('routes.route_short_name', '92')
		.orderBy('stoptimes.arrival_time', 'ASC')
		.limit(5);
}

// Stops
module.exports.searchStops = function(name) {
	return knex.select('stops.stop_id', 'stops.stop_name')
		.from('stops')
		.where('stops.stop_name', 'like', '%'+name+'%')
		.limit(10);
}

// Aliases
module.exports.listAliases = function() {
	return knex.select('aliases.alias_name', 'stops.stop_name')
		.from('aliases')
		.innerJoin('stops', 'aliases.stop_id', 'stops.stop_id')
		.limit(50);
}

module.exports.getAlias = function(alias) {
	return knex.select('stop_id')
		.from('aliases')
		.where('alias_name', alias);
}

module.exports.createAlias = function(alias, stopId) {
	return knex('aliases')
		.insert({alias_name: alias, stop_id: stopId});
}

module.exports.deleteAlias = function(alias, stopId) {
	return knex('alias')
		.where('alias_name', alias)
		.where('stop_id', stopId)
		.del()
}