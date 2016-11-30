var db = process.env.MONGO_DB || '101.1.151.13';

module.exports = {
	'secret': 'ilovedatabases',
	'database': 'mongodb://' + db + ':27017/muotituote'
}
