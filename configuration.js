var configuration = {
	"server": {
		"port": 8080
	},
	"db":[
		{
			"type": "mongo",
			"url": "mongodb://localhost:27017/legalhub"
		}
	]
};
module.exports = configuration;