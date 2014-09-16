module.exports.parseMessage = function(msg) {
	var match = msg.match((\w+)\s?(\d\d)?);
	if(match.length == 1 || match.length == 2) {
		return match
	} else {
		return -1;
	}
}