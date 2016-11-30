var db = process.env.MONGO_DB || '10.1.151.13';

module.exports = {
	'secret': 'ilovedatabases',
	'database': 'mongodb://' + db + ':27017/muotituote'
}
