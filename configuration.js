var configuration = {
	"app":{
		"qrCodeDomain": "http://legishub.irosoft.com/document/"
	},
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
		"prince": '"C:/Program Files (x86)/Prince/engine/bin/prince.exe"',
		"pdfbox": '"bin/PdfBox/pdfbox-app-2.0.2.jar"',
		"saxon": '"bin/Saxon/saxon9pe.jar"'
	},
	"formatters":{
		"pdf": "ah"
	}
};
module.exports = configuration;