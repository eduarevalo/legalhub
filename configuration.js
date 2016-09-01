var configuration = {
	"server": {
		"port": 8080
	},
	"db":[
		{
			"type": "mongo",
			"url": "mongodb://localhost:27017/legalhub"
		}
	],
	"providers": {
		"ah": '"C:/Program Files/Antenna House/AHFormatterV63/AHFCmd.exe"',
		"prince": '"C:/Program Files (x86)/Prince/engine/bin/prince.exe"'
	},
	"formatters":{
		"pdf": "ah"
	}
};
module.exports = configuration;