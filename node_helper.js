/* Magic Mirror
 * Node Helper: MMM-Radovi-RI
 *
 * By Lolo
 *MIT Licensed.
 */

const NodeHelper = require('node_helper');
const puppeteer = require("puppeteer");
const cheerio = require('cheerio');
const request = require('request');
var self;
const url = 'http://www.ri-info.net/Radovi.aspx';

var elecWorkList = [];
var waterWork = [];

module.exports = NodeHelper.create({

    start: function () {
        self = this;
        self.browser;
        console.log("Starting node_helper for: " + this.name);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'GET_WORK_DATA') {

            self.config = payload
                console.log("Starting node_helper for: ", self.config),

            self.streetUpper = self.config.street.toUpperCase()
                self.searchStreet = self.streetUpper + ", " + self.config.place;

            //console.log("Recived payload for search: " , self.searchStreet); //  //uncomment to see if you recive payload


            getData();
        }

    },

});

async function getData() {
    try {

        if (self.config.chromiumPath != null) {
            self.browser = await puppeteer.launch({
                executablePath: self.config.chromiumPath,
                headless: !self.config.showBrowser
            }); // headless : false
        } else {
            self.browser = await puppeteer.launch({
                headless: !self.config.showBrowser
            }); // headless : false
        }

        const page = await self.browser.newPage();
        await page.goto(url);
        await page.waitForTimeout(1000);
        await page.click('.searchBtn1');
        await page.waitForTimeout(1000);

        const html = await page.content();

        const $ = cheerio.load(html);
        var work = [];
        var elec = [];
        var water = [];
        var elecList = [];
        var waterList = [];
        const elWater = $('#cphContent_cphSadrzaj_upVoda table tbody ')[0];
        const elElec = $('#cphContent_cphSadrzaj_upStruja table tbody ')[0];

        if (elElec) {
            var elementElec = $('#cphContent_cphSadrzaj_upStruja table tbody tr td span').filter(function () {
                return $(this).text() === self.searchStreet;
            }).parent().parent();
            $(elementElec).each(function (jex, eEl) {
                var note = "";
                const $eEl = $(eEl);
                let startDate = $eEl.prevAll('.datum').first().find('tr[class="datum"]>th>div').text().trim();
                let street = $eEl.find('span[id*="Label2"]').text();
                let streetNmbr = $eEl.find('span[id*="Label3"]').text();
                let startTime = $eEl.find('span[id*="Label4"]').text();
                let endTime = $eEl.find('span[id*="Label5"]').text();
                let endWork = $eEl.find('span[id*="Label6"]').text();
                let noteCheck = $eEl.children().children().first()[0];

                if (noteCheck) {
                    var note = $eEl.nextUntil().next().first('.tableNapomena').find('td[class="tableNapomena"]>div>div').text().trim();
                };

                var elec = {
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
            //console.log("New entries for electrical!", elecList);     //uncomment to check, data sorted recived

        };
        if (!elElec) {
            //console.log('No new entries for electrical!');   //uncomment to see, no data recived
        }

        if (elWater) {
            var elementWater = $('#cphContent_cphSadrzaj_upVoda table tbody  span').filter(function () {
                return $(this).text() === self.searchStreet;
            }).parent().parent();
            $(elementWater).each(function (jex, wEl) {
                var noteWater = "";
                const $wEl = $(wEl);
                let startDate = $wEl.prevAll('.datum').first().find('tr[class="datum"]>th>div').text().trim();
                let street = $wEl.find('span[id*="Label2"]').text();
                let streetNmbr = $wEl.find('span[id*="Label7"]').text();
                let startTime = $wEl.find('span[id*="Label8"]').text();
                let endTime = $wEl.find('span[id*="Label9"]').text();
                let endWork = $wEl.find('span[id*="Label10"]').text();
                let noteCheck = $wEl.children().children().first()[0];

                if (noteCheck) {
                    var noteWater = $wEl.nextUntil().next().first('.tableNapomena').find('td[class="tableNapomena"]>div>div').text().trim();
                };
                var water = {
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
            //   console.log('New entries for water!',waterList);   //uncomment to see, data sorted recived
        };
        if (!elWater) {
            //   console.log('No new entries for water!');   //uncomment to see, no data recived
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
