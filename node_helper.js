/* Magic Mirror
 * Node Helper: MMM-Radovi-RI
 *
 * By Lolo
 *MIT Licensed.
 */

const NodeHelper = require('node_helper');
const puppeteer = require("puppeteer");
const cheerio = require('cheerio');
const url = 'http://www.ri-info.net/Radovi.aspx';

module.exports = NodeHelper.create({

    start: function () {
		self = this; 
        self.browser;
        self.loaded = false;       
        console.log("Starting node_helper for: " + this.name);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'GET_WORK_DATA') {
            self.config = payload
            self.streetUpper = self.config.street.toUpperCase()
                self.searchStreet = self.streetUpper + ", " + self.config.place;
            if (!self.loaded) {
                setTimeout(() => {
                    getData()
                }, self.config.initialLoadDelay);
            } else {
                getData()
            }
        }
    },
});

async function getData() {
    try {
        if (self.config.chromiumPath != null) {
            self.browser = await puppeteer.launch({
                executablePath: self.config.chromiumPath,
                headless: !self.config.showBrowser
            });
        } else {
            self.browser = await puppeteer.launch({
                headless: !self.config.showBrowser
            });
        }
        const page = await self.browser.newPage();
        await page.goto(url);
        await page.waitForTimeout(1000);
        await page.click('.searchBtn1');
        await page.waitForTimeout(1000);
        const html = await page.content();
        const $ = cheerio.load(html);


        let elecList = [];
        let waterList = [];
        const elWater = $('#cphContent_cphSadrzaj_upVoda table tbody ')[0];
        const elElec = $('#cphContent_cphSadrzaj_upStruja table tbody ')[0];
        if (elElec) {
            var elementElec = $('#cphContent_cphSadrzaj_upStruja table tbody tr td span').filter(function () {
                return $(this).text() === self.searchStreet;
            }).parent().parent();
            $(elementElec).each(function (jex, eEl) {
                const $eEl = $(eEl);
                const startDate = $eEl.prevAll('.datum').first().find('tr[class="datum"]>th>div').text().trim();
                const street = $eEl.find('span[id*="Label2"]').text();
                const streetNmbr = $eEl.find('span[id*="Label3"]').text();
                const startTime = $eEl.find('span[id*="Label4"]').text();
                const endTime = $eEl.find('span[id*="Label5"]').text();
                const endWork = $eEl.find('span[id*="Label6"]').text();
                const noteCheck = $eEl.children().children().first()[0];
                if (noteCheck) {
                    var noteElec = $eEl.nextUntil().next().first('.tableNapomena').find('td[class="tableNapomena"]>div>div').text().trim();
                };
                let elec = {
                    startDate,
                    street,
                    streetNmbr,
                    startTime,
                    endTime,
                    endWork,
                    note
                };
                elecList.push(elec);
            });
        };
        if (!elElec) {
            //console.log('No new entries for electrical!'); 
        }
        if (elWater) {
            const elementWater = $('#cphContent_cphSadrzaj_upVoda table tbody  span').filter(function () {
                return $(this).text() === self.searchStreet;
            }).parent().parent();
            $(elementWater).each(function (jex, wEl) {
                //var noteWater = "";
                const $wEl = $(wEl);
                const startDate = $wEl.prevAll('.datum').first().find('tr[class="datum"]>th>div').text().trim();
                const street = $wEl.find('span[id*="Label2"]').text();
                const streetNmbr = $wEl.find('span[id*="Label7"]').text();
                const startTime = $wEl.find('span[id*="Label8"]').text();
                const endTime = $wEl.find('span[id*="Label9"]').text();
                const endWork = $wEl.find('span[id*="Label10"]').text();
                const noteCheck = $wEl.children().children().first()[0];
                if (noteCheck) {
                    var noteWater = $wEl.nextUntil().next().first('.tableNapomena').find('td[class="tableNapomena"]>div>div').text().trim();
                };
                let water = {
                    startDate,
                    street,
                    streetNmbr,
                    startTime,
                    endTime,
                    endWork,
                    noteWater
                };
                waterList.push(water);
            });
        };
        if (!elWater) {
            //console.log('No new entries for water!'); 
        }       
        self.sendSocketNotification('POWER AND WATER OUTAGES', {
            waterList: waterList,
            elecList: elecList
        });
        await self.browser.close();
    } catch (error) {
        console.error('getData(): ' + error);
    }
};
