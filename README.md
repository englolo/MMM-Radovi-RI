# MMM-Radovi-RI

Module for [MagicMirror](https://github.com/MichMich/MagicMirror) that scrapes [RI-info.net](http://www.ri-info.net/Radovi.aspx) for possible power and water outages in the city of Rijeka, Croatia.
![GitHub Logo](/images/testTable.PNG)
## Installation
Clone this repository into the MagicMirror Modules folder:
```
cd ~/MagicMirror/modules
git clone https://github.com/englolo/MMM-Radovi-RI.git
```
Install the dependencies (puppeteer, cheerio) in the MMM-Radovi_RI module folder:
```
cd ~/MagicMirror/modules/MMM-Radovi-RI
npm install
```
## Configuration
Always omit the word street (ulica) in street name ```street:```

Add the following data to your config.js file
```
{
	module: "MMM-Radovi-RI",
	position: "top_right",            
		config: {
			street:"Brnelići",   // enter your street name (Nova Cesta, Primorje, Ratulje...)
			place:"Dražice"      // enter your place name  (Rijeka, Dražice, Kostrena, Bakar...)
		}
}
```
