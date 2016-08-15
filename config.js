var db = process.env.MONGO_DB || '192.168.199.3';

module.exports = {
	'secret': 'ilovedatabases',
	'database': 'mongodb://' + db + ':27017/muotituote'
}