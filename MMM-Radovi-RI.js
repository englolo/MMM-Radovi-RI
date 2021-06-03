/* global Module */

/* Magic Mirror
 * Module: MMM-Radovi-RI
 *
 * By Lolo
 * MIT Licensed.
 */

Module.register("MMM-Radovi-RI", {
    defaults: {
        initialLoadDelay: 2000,
        updateInterval: 2 * 60 * 60 * 1000,
        animationSpeed: 2000,
    },

    getStyles: function () {
        return ["font-awesome.css"];
    },

    start: function () {
        console.log("Starting module: " + this.name);
        requiresVersion: "2.1.5";
        this.scheduleUpdate();
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            hr: "translations/hr.json"
        };
    },

    getInfo: function (place) {
        this.sendSocketNotification('GET_WORK_DATA', this.config);
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "wrapper";

        if (!this.loaded) {			
            wrapper.innerHTML = this.translate("LOADING")  + this.name;
            wrapper.classList.add("small");
			return wrapper;
        }
		else {     
            const header = document.createElement("header");
            header.innerHTML = `${this.translate("POWER_WATER_OUTAGES")}<br>
			<span class="xsmall bright"> ${this.config.street} ${this.config.place}</span>
			`;
            wrapper.appendChild(header);
        }
        const table = document.createElement('table');
         /* electric power data loop */
        let j = Object.keys(this.elecData);
        if (j.length > 0) {
            for (j = 0; j < this.elecData.length; j++) {
                const mainTrElec = document.createElement('tr');
                mainTrElec.classList.add("xsmall");
                mainTrElec.innerHTML = `
					<td>
						<istyle="padding-right:10px" > classList="fas fa-bolt "</i>
					</td>
					<td>
						<span>${this.translate("HOUSE_NUMBER")} ${this.elecData[j].streetNmbr}<br>${this.elecData[j].startDate} ${this.translate("FROM")} ${this.elecData[j].startTime} ${this.translate("TO")} ${this.elecData[j].endTime}<br> ${this.elecData[j].noteElec} </span>
					</td>
					`
                 table.appendChild(mainTrElec);
            }
        } else {
            const noDataElec = document.createElement('tr');
            noDataElec.classList.add("xsmall", "normal");
            noDataElec.innerHTML = `
				<td style="padding-right:10px">
					<i class="fas fa-bolt"></i>
					<td class="xsmall dimmed">${this.translate("NO_NEW_ENTRIES").toUpperCase()}
				</td>
				`
                table.appendChild(noDataElec);
        }
         /* water data loop */
        let i = Object.keys(this.waterData);
        if (i.length > 0) {
            for (i = 0; i < this.waterData.length; i++) {
                const mainTrWater = document.createElement('tr');
                mainTrWater.classList.add("xsmall");
                mainTrWater.innerHTML = `
					<td style="padding-right:10px">
						<i class="fas fa-tint"></i>
					</td>
					<td>
						<span class="normal xsmall">${this.waterData[i].streetNmbr ? this.translate("HOUSE_NUMBER") : this.translate("ALL_NUMBERS")} ${this.waterData[i].streetNmbr}<br>
						${this.waterData[i].startDate} ${this.translate("FROM")} ${this.waterData[i].startTime} ${this.translate("TO")} ${this.waterData[i].endTime}<br>
						${this.waterData[i].noteWater}</span>
					</td>
					`
                 table.appendChild(mainTrWater);
            }
        } else {
            const noDataWater = document.createElement('tr');
            noDataWater.classList.add("xsmall", "normal");
            noDataWater.innerHTML = `
				<td style="padding-right:10px">
					<i class="fas fa-tint"></i>
					<td class="xsmall dimmed">${this.translate("NO_NEW_ENTRIES").toUpperCase()}
				</td>
				`
            table.appendChild(noDataWater);
        }
        wrapper.appendChild(table);
        return wrapper;
    },

    sortPayload: function (data) {
        this.waterData = data.waterList;
        this.elecData = data.elecList;        
    },

    scheduleUpdate: function () {
        setInterval(() => {
            this.getInfo();
        }, this.config.updateInterval);
        this.getInfo();
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "POWER AND WATER OUTAGES") {
            this.loaded = true;
            this.sortPayload(payload);
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.animationSpeed);
    },

});
});
