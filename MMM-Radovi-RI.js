/* global Module */

/* Magic Mirror
 * Module: MMM-Radovi-RI
 *
 * By Lolo
 * MIT Licensed.
 */

Module.register("MMM-Radovi-RI", {
    defaults: {
        header: "Loading DATA!",
        initialLoadDelay: 4250,
        updateInterval: 2 * 60 * 60 * 1000,
    },
    getStyles: function () {
    return ["font-awesome.css"];
    },
    start: function () {
        console.log("Starting module: " + this.name);
        requiresVersion: "2.1.0";
        this.scheduleUpdate();
        //this.waterData = [];
        //this.elecData = [];
        this.stretUpper = "";
        var self = this;
    },
    getTranslations: function () {
        return {
            en: "translations/en.json",
            hr: "translations/hr.json"
        };
    },

    getInfo: function (place) {
        this.streetUpper = this.config.street.toUpperCase()
        var searchStreet = this.streetUpper + ", " + this.config.place;
        this.sendSocketNotification('GET_WORK_DATA', (searchStreet));
        //console.log(searchStreet); 

    },

    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";

        if (!this.loaded) {
            wrapper.innerHTML = "Awaiting  data...";
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("small", "bright", "header-text");
            header.innerHTML = this.translate("POWER_WATER_OUTAGES");
            wrapper.appendChild(header);
        }

        var placeElement = document.createElement('div');
        placeElement.classList.add("xsmall", "bright");
        placeElement.innerHTML = this.config.street + ", " + this.config.place;

        var table = document.createElement('table');
      		
////////////////////////////////////////////////////////////////////////////////////////// electricity list DOM loop
        var j = Object.keys(this.elecData);
        if (j.length > 0) {
            for (j = 0; j < this.elecData.length; j++) {
                var mainTrElec = document.createElement('tr');
                var iconElecTd = document.createElement('td');
                var iconElec = document.createElement('i');
                iconElec.classList = "fas fa-bolt";
                iconElecTd.appendChild(iconElec);
                var dataTdElec = document.createElement('td');
                var streetTrElec = document.createElement('span');
                streetTrElec.classList.add("normal");
                streetTrElec.innerHTML = this.translate("HOUSE_NUMBER") + "  " + this.elecData[j].streetNmbr + "<br>" + this.elecData[j].startDate + "  " + this.translate("FROM") + " " + this.elecData[j].startTime + " " + this.translate("TO") + " " + this.elecData[j].endTime + "<br>" + this.elecData[j].note;
                dataTdElec.appendChild(streetTrElec);
                mainTrElec.appendChild(iconElecTd);
                mainTrElec.appendChild(dataTdElec);
                table.appendChild(mainTrElec);
            }
        } else {
            var noDataElec = document.createElement('tr');
            var iconElecNoData = document.createElement('i');
            var textnoDataElec = document.createElement('td');
            noDataElec.classList.add("normal");
            textnoDataElec.classList.add("xsmall","dimmed" );
            iconElecNoData.classList = "fas fa-bolt";
            textnoDataElec.innerHTML = this.translate("NO_NEW_ENTRIES").toUpperCase();
            noDataElec.appendChild(iconElecNoData);
            noDataElec.appendChild(textnoDataElec);
            table.appendChild(noDataElec);
        }
 /////////////////////////////////////////////////////////////////////  water list DOM loop
        var i = Object.keys(this.waterData);
        if (i.length > 0) {
            for (i = 0; i < this.waterData.length; i++) {

                var mainTrWater = document.createElement('tr');
                var iconWaterTd = document.createElement('td');
                var iconWater = document.createElement('i');
                iconWater.classList = "fas fa-tint ";
                iconWaterTd.appendChild(iconWater);
                var dataTdWater = document.createElement('td');
                var streetTrWater = document.createElement('span');
                streetTrWater.classList.add( "normal");
                streetTrWater.innerHTML = this.translate("HOUSE_NUMBER") + "  " + this.waterData[i].streetNmbr + "<br>" + this.waterData[i].startDate + "  " + this.translate("FROM") + " " + this.waterData[i].startTime + " " + this.translate("TO") + " " + this.waterData[i].endTime + "<br>" + this.waterData[i].noteWater;
                dataTdWater.appendChild(streetTrWater);
                mainTrWater.appendChild(iconWaterTd);
                mainTrWater.appendChild(dataTdWater);
                table.appendChild(mainTrWater);
            }
        } else {
            var noDataWater = document.createElement('tr');
            var iconWaternoData = document.createElement('i');
            var textnoDataWater = document.createElement('td');
            noDataWater.classList.add("normal"); 
            textnoDataWater.classList.add("xsmall","dimmed");
            iconWaternoData.classList = "fas fa-tint";
            textnoDataWater.innerHTML = this.translate("NO_NEW_ENTRIES").toUpperCase();
            noDataWater.appendChild(iconWaternoData);
            noDataWater.appendChild(textnoDataWater);
            table.appendChild(noDataWater);
        }
 //////////////////////////////////////////////////////////////////////////////////////////
        placeElement.appendChild(table);
        wrapper.appendChild(placeElement);
        return wrapper;
    }, // <-- closes the getDom function from above

    workList: function (data) {
        this.waterData = data.waterList; 
        this.elecData = data.elecList; 
        this.loaded = true;
        //console.log(this.waterData);  //uncomment to see if you're getting data (in dev console)
        //console.log(this.elecData);   //uncomment to see if you're getting data (in dev console)
    },

    scheduleUpdate: function () {
        setInterval(() => {
            this.getInfo();
        }, this.config.updateInterval);
        this.getInfo(this.config.initialLoadDelay);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "ELECTRIC_POWER_DISCONNECTED") {
            this.workList(payload);
            this.updateDom(this.config.initialLoadDelay);
        }
        this.updateDom(this.config.initialLoadDelay);
    },

});
