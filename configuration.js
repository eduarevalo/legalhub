var configuration = {
	"app":{
		"qrCodeDomain": "http://legishub.irosoft.com/document/",
		"qrCodeDomainCollection": "http://legishub.irosoft.com/collection/"
	},
	"modules": {
		"authentication": {
			"provider" :{
				"type": "ldap",
				"params": {
					"url": 'ldap://irosoft.com',
					"user":'paqadm',
					"password": 'iro123',
					"filter": '(objectclass=user)',
					"scope": 'sub',
					"userSearchDn": 'OU=Users,OU=Irosoft,DC=irosoft,DC=com'
				}
			}
		}
	},
	"server": {
		"port": 80
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
		"pdfbox": 'java -jar "bin/PdfBox/pdfbox-app-2.0.2.jar"',
		"saxon": 'java -jar "bin/Saxon/saxon9pe.jar"'
	},
	"formatters":{
		"pdf": "ah"
	}
};
module.exports = configuration;
