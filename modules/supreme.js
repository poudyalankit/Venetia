module.exports = class SupremeTask {
    constructor(taskInfo) {
        require('log-timestamp');
        require("../src/js/console-file.js");
        var path = require('path')
        const electron = require('electron');
        var fs = require('fs');
        const configDir = (electron.app || electron.remote.app).getPath('userData');
        //console.file(path.join(configDir, '/userdata/logs.txt'));
        this.stopped = "false";
        this.taskId = taskInfo.id;
        this.site = taskInfo.site;
        this.mode = taskInfo.mode;
        this.query = taskInfo.product;
        this.key = getKey()

        this.keywords = taskInfo.product.split("/")[0].split(",");
        this.color = taskInfo.product.split("/")[1];
        this.category = taskInfo.product.split("/")[2];
        this.size = taskInfo.size;
        this.request;
        this.productid;
        this.imageURL;
        this.cartTotal;
        this.chk;
        this.profilename = taskInfo.profile;
        this.proxyListName = taskInfo.proxies;
        this.apiService = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/apiKey.json')))[0].service;
        this.captchaTaskId;
        this.capMonster = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/apiKey.json')))[0].apiKey;
        this.captchaResponse;
        this.colorid;
        this.sizeid;
        this.webhookLink = fs.readFileSync(path.join(configDir, '/userdata/webhook.txt'), 'utf8');
        this.profile = getProfileInfo(taskInfo.profile);
        this.proxyArray = getProxyInfo(taskInfo.proxies);
        this.proxy = this.proxyArray.sample();
        const tough = require('tough-cookie');
        this.cookieJar = new tough.CookieJar();
        this.slug;
    }

    async sendFail() {
        const got = require('got');
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/fail',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.query,
                    "size": this.size,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
                    "image": "https:" + this.imageURL
                },
                responseType: 'json'
            }).then(response => {
                console.log("Finished")
            })
            .catch(error => {
                console.log(error)
            })

        var webhooks = this.webhookLink.split(",")
        for (var i = 0; i < webhooks.length; i++) {
            got({
                    method: 'post',
                    url: webhooks[i].trim(),
                    json: {
                        "content": null,
                        "embeds": [{
                            "title": "Venetia Failed Checkout! :octagonal_sign:",
                            "color": 14706535,
                            "fields": [{
                                    "name": "Site",
                                    "value": this.site
                                },
                                {
                                    "name": "Mode",
                                    "value": this.mode
                                },
                                {
                                    "name": "Product",
                                    "value": this.productTitle,
                                    "inline": true
                                },
                                {
                                    "name": "Query",
                                    "value": this.query,
                                    "inline": true
                                },
                                {
                                    "name": "Size",
                                    "value": this.size
                                },
                                {
                                    "name": "Price",
                                    "value": Math.trunc(this.cartTotal)
                                },
                                {
                                    "name": "Profile",
                                    "value": "||" + this.profilename + "||"
                                },
                                {
                                    "name": "Proxy List",
                                    "value": "||" + this.proxyListName + "||"
                                }
                            ],
                            "footer": {
                                "text": "Powered by Venetia",
                                "icon_url": "https://i.imgur.com/6h06tuW.png"
                            },
                            "timestamp": new Date(Date.now()).toISOString(),
                            "thumbnail": {
                                "url": "https:" + this.imageURL
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://i.imgur.com/6h06tuW.png"
                    }
                }).then(response => {
                    console.log("Finished sending webhook")
                })
                .catch(error => {
                    console.log(error.response.body)
                })
        }
    }

    async sendSuccess() {
        const got = require('got');
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/success',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.query,
                    "size": this.size,
                    "productTitle": this.productTitle,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "image": "https:" + this.imageURL
                }
            }).then(response => {
                console.log("Finished")
            })
            .catch(error => {
                console.log(error)
            })

        var webhooks = this.webhookLink.split(",")
        for (var i = 0; i < webhooks.length; i++) {
            got({
                    method: 'post',
                    url: webhooks[i].trim(),
                    json: {
                        "content": null,
                        "embeds": [{
                            "title": "Venetia Successful Checkout! :tada:",
                            "color": 5230481,
                            "fields": [{
                                    "name": "Site",
                                    "value": this.site
                                },
                                {
                                    "name": "Mode",
                                    "value": this.mode
                                },
                                {
                                    "name": "Product",
                                    "value": this.productTitle,
                                    "inline": true
                                },
                                {
                                    "name": "Query",
                                    "value": this.query,
                                    "inline": true
                                },
                                {
                                    "name": "Size",
                                    "value": this.size
                                },
                                {
                                    "name": "Price",
                                    "value": Math.trunc(this.cartTotal)
                                },
                                {
                                    "name": "Profile",
                                    "value": "||" + this.profilename + "||"
                                },
                                {
                                    "name": "Proxy List",
                                    "value": "||" + this.proxyListName + "||"
                                }
                            ],
                            "footer": {
                                "text": "Powered by Venetia",
                                "icon_url": "https://i.imgur.com/6h06tuW.png"
                            },
                            "timestamp": new Date(Date.now()).toISOString(),
                            "thumbnail": {
                                "url": "https:" + this.imageURL
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://i.imgur.com/6h06tuW.png"
                    }
                }).then(response => {
                    console.log("Finished sending webhook")
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    async sendCaptcha() {
        const got = require('got');
        if (this.stopped === "false") {
            let response = await got({
                method: 'get',
                url: 'http://localhost:4444/venetia/addtoQueue?captchaType=supreme&sitekey=6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz&siteURL=http://www.supremenewyork.com/',
                responseType: 'json'
            })
            this.captchaTaskId = response.body.id
            return;
        }
    }

    async retrieveCaptchaResponse() {
        const got = require('got');
        if (this.stopped === "false") {
            try {
                let response = await got({
                    method: 'get',
                    url: 'http://localhost:4444/venetia/solvedCaptchas?id=' + this.captchaTaskId,
                    responseType: 'json'
                })
                console.log(response.body)
                if (response.body.completed == true) {
                    this.captchaResponse = response.body.captchaResponse
                    return;
                } else
                    throw "Captcha not ready"
            } catch (error) {
                console.log(error)
                console.log(this.captchaTaskId)
                await sleep(500)
                await this.retrieveCaptchaResponse()
            }
        }
    }


    async getStock() {
        const got = require('got');
        const tunnel = require('tunnel');

        if (this.stopped === "false") {
            await this.send("Finding product")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.supremenewyork.com/mobile_stock.json',
                    cookieJar: this.cookieJar,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/80.0.3987.95 Mobile/15E148 Safari/604.1',
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://www.supremenewyork.com',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Referer': 'https://www.supremenewyork.com/mobile/',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache',
                        'TE': 'Trailers',
                    },
                    responseType: 'json'
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                if (this.stopped === "false") {
                    for (var i = 0; i < response.body['products_and_categories'][this.category].length; i++) {
                        for (var j = 0; j < this.keywords.length; j++) {
                            if (response.body['products_and_categories'][this.category][i].name.toLowerCase().includes(this.keywords[j].toLowerCase()) && this.stopped === "false") {
                                console.log("Item found: " + response.body.products_and_categories[this.category][i].name)
                                this.productid = response.body.products_and_categories[this.category][i].id;
                                this.cartTotal = response.body.products_and_categories[this.category][i].price;
                                this.imageURL = response.body.products_and_categories[this.category][i].image_url_hi;
                                this.productTitle = response.body.products_and_categories[this.category][i].name;
                                await this.sendProductTitle(this.productTitle)
                                await this.send("Found product")
                                return;
                            }
                        }
                    }
                    throw "Error finding product"
                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    await this.send("Error finding product")
                    await sleep(3000)
                    await this.getStock()
                }
            }
        }
    }

    async getColor() {
        const got = require('got');
        const tunnel = require('tunnel');

        if (this.stopped === "false") {
            await this.send("Finding style")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.supremenewyork.com/shop/' + this.productid + '.json',
                    cookieJar: this.cookieJar,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/80.0.3987.95 Mobile/15E148 Safari/604.1',
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://www.supremenewyork.com',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Referer': 'https://www.supremenewyork.com/mobile/',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache',
                        'TE': 'Trailers',
                    },
                    responseType: 'json'
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                if (this.stopped === "false") {
                    for (var i = 0; i < response.body.styles.length; i++) {
                        if (response.body.styles[i].name.toLowerCase().includes(this.color.toLowerCase())) {
                            this.chk = response.body.styles[i].chk
                            this.colorid = response.body.styles[i].id
                            var sizes = []
                            if (this.size === "RS") {
                                for (var j = 0; j < response.body.styles[i].sizes.length; j++)
                                    sizes.push(response.body.styles[i].sizes[j].id)
                            }
                            this.sizeid = sizes.sample()
                            console.log(this.sizeid)
                            console.log(this.colorid)
                            console.log("Found style")
                            await this.send("Found style")
                            return;
                        }
                    }
                    throw "Error finding color"
                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    await this.send("Error finding color")
                    await sleep(3000)
                    await this.getColor()
                }
            }
        }
    }

    async addToCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        console.log('https://www.supremenewyork.com/shop/' + this.productid + '/add.json')
        if (this.stopped === "false") {
            await this.send("Adding to cart")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.supremenewyork.com/shop/' + this.productid + '/add.json',
                    cookieJar: this.cookieJar,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/80.0.3987.95 Mobile/15E148 Safari/604.1',
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://www.supremenewyork.com',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Referer': 'https://www.supremenewyork.com/mobile/',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache',
                        'TE': 'Trailers',
                    },
                    body: querystring.encode({
                        "s": this.sizeid,
                        "st": this.colorid,
                        "qty": "1",
                        "chk": this.chk
                    }),
                    responseType: 'json'
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                console.log(response.body)
                if (this.stopped === "false" && response.body.success != false) {
                    await this.send("Carted")
                    await this.updateStat("carts")
                    await this.send("Waiting for captcha")
                    if (this.stopped === "false")
                        await this.sendCaptcha()

                    if (this.stopped === "false")
                        await this.retrieveCaptchaResponse()

                    return;
                } else {
                    throw "Error carting"
                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    await this.send("Error carting, retrying")
                    await sleep(3000)
                    await this.addToCart()
                }
            }
        }
    }

    async submitOrder() {
        const got = require('got');
        const tunnel = require('tunnel');

        const querystring = require('querystring')
        var x = this.profile.cardNumber
        var y = "";
        for (var i = 0; i < x.length; i = i + 4) {
            y += x.substring(i, i + 4)
            if (i != x.length - 1)
                y += " "
        }
        this.profile.cardNumber = y;
        if (this.stopped === "false") {
            await this.send("Submitting order")
            console.log(encodeURIComponent('{"' + this.sizeid + '": 1}').replace(/'/g, " % 27 "))
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.supremenewyork.com/checkout.json',
                    cookieJar: this.cookieJar,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/80.0.3987.95 Mobile/15E148 Safari/604.1',
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://www.supremenewyork.com',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Referer': 'https://www.supremenewyork.com/mobile/',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache',
                        'TE': 'Trailers',
                    },
                    body: querystring.encode({
                        'store_credit_id': '',
                        'from_mobile': 1,
                        'cookie-sub': encodeURIComponent('{"' + this.sizeid + '": 1}').replace(/'/g, " % 27 "),
                        'current_time': getTimestamp(),
                        'same_as_billing_address': 1,
                        'scerkhaj': 'CKCRSUJHXH',
                        'order[billing_name]': '',
                        'order[bn]': this.profile.firstName + " " + this.profile.lastName,
                        'order[email]': this.profile.email,
                        'order[tel]': this.profile.phone.substring(0, 3) + "-" + this.profile.phone.substring(3, 6) + "-" + this.profile.phone.substring(6),
                        'order[billing_address]': this.profile.address1,
                        'order[billing_address_2]': '',
                        'order[billing_zip]': this.profile.zipcode,
                        'order[billing_city]': this.profile.city,
                        'order[billing_state]': abbrRegion(this.profile.state, 'abbr'),
                        'order[billing_country]': 'USA',
                        'credit_card[type]': 'credit card',
                        'riearmxa': this.profile.cardNumber,
                        'credit_card[month]': this.profile.expiryMonth,
                        'credit_card[year]': this.profile.expiryYear,
                        'rand': '',
                        'credit_card[meknk]': this.profile.cvv,
                        'order[terms]': 0,
                        'order[terms]': 1,
                        'g-recaptcha-response': this.captchaResponse
                    }),
                    responseType: 'json'
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                if (this.stopped === "false") {
                    console.log(response.body)
                    if (response.body.status != "failed") {
                        await this.send("Submitted order")
                        this.slug = response.body.slug
                        return;
                    } else
                        throw "Error submitting, retrying"
                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    this.send("Error submitting order")
                    await sleep(3000)
                    await this.submitOrder()
                }
            }
        }
    }

    async checkOrder() {
        const got = require('got');
        const tunnel = require('tunnel');

        if (this.stopped === "false") {
            await this.send("Processing")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.supremenewyork.com/checkout/' + this.slug + '/status.json',
                    cookieJar: this.cookieJar,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/80.0.3987.95 Mobile/15E148 Safari/604.1',
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://www.supremenewyork.com',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Referer': 'https://www.supremenewyork.com/mobile/',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache',
                        'TE': 'Trailers',
                    },
                    responseType: 'json'
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                if (this.stopped === "false") {
                    console.log(response.body)
                    if (response.body.status === "queued") {
                        await sleep(3000)
                        await this.checkOrder()
                    } else
                    if (response.body.status != 'failed') {
                        await this.send("Check email")
                        await this.sendSuccess()
                        return;
                    } else throw "Failed checkout"
                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    await this.send("Checkout failed")
                    await this.sendFail()
                }
            }
        }
    }


    async stopTask() {
        this.stopped = "true";
        await this.sendProductTitle(this.query)
        console.log("Stopped")
        this.send("Stopped")
    }

    returnID() {
        return this.taskId;
    }

    async sendProductTitle(title) {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('updateProductTitle1', this.taskId, title)
    }


    async send(status) {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('updateStatus1', this.taskId, status)
    }

    async updateStat(stat) {
        //this.window.webContents.send("updateStats", stat);
        console.log(stat)
    }

    async initialize() {

        if (this.stopped === "false")
            await this.getStock()

        if (this.stopped === "false")
            await this.getColor()

        if (this.stopped === "false")
            await this.addToCart()

        if (this.stopped === "false") {
            await this.send("Delaying checkout")
            await sleep(1000)
            await this.submitOrder()
        }

        if (this.stopped === "false")
            await this.checkOrder()

    }
}

function getProxyInfo(proxies) {
    if (proxies === "-")
        return ["-"]

    var fs = require('fs');
    var path = require('path')
    const electron = require('electron');

    const configDir = (electron.app || electron.remote.app).getPath('userData');

    var str = fs.readFileSync(path.join(configDir, '/userdata/proxies.json'), 'utf8');
    var x = JSON.parse(str)
    var proxyStorage = [];
    for (var i = 0; i < x.length; i++) {
        if (x[i].name === proxies) {
            for (var j = 0; j < x[i].proxies.length; j++) {
                if (x[i].proxies[j].username === null) {
                    proxyStorage.push({ "host": x[i].proxies[j].ip, "port": x[i].proxies[j].port })
                } else {
                    proxyStorage.push({ "host": x[i].proxies[j].ip, "port": x[i].proxies[j].port, "proxyAuth": x[i].proxies[j].username + ":" + x[i].proxies[j].password })
                }
            }
        }
    }
    return proxyStorage;
}


async function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getProfileInfo(profiles) {
    var fs = require('fs');
    var path = require('path')
    const electron = require('electron');

    const configDir = (electron.app || electron.remote.app).getPath('userData');

    var str = fs.readFileSync(path.join(configDir, '/userdata/profiles.json'), 'utf8');
    var x = JSON.parse(str)
    for (var i = 0; i < x.length; i++) {
        if (x[i].name === profiles) {
            return { "firstName": x[i].delivery.firstName, "lastName": x[i].delivery.lastName, "address1": x[i].delivery.address1, "zipcode": x[i].delivery.zip, "city": x[i].delivery.city, "country": x[i].delivery.country, "state": x[i].delivery.state, "email": x[i].email, "phone": x[i].phone, "cardNumber": x[i].card.number, "expiryMonth": x[i].card.expiryMonth, "expiryYear": x[i].card.expiryYear, "cvv": x[i].card.cvv }
        }
    }
}
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
}

function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

function getKey() {
    var fs = require('fs');
    var path = require('path')
    const electron = require('electron');

    const configDir = (electron.app || electron.remote.app).getPath('userData');
    var str = fs.readFileSync(path.join(configDir, '/userdata/key.txt'), 'utf8');
    return str;
}

function abbrRegion(input, to) {
    var states = [
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['American Samoa', 'AS'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['Armed Forces Americas', 'AA'],
        ['Armed Forces Europe', 'AE'],
        ['Armed Forces Pacific', 'AP'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['District Of Columbia', 'DC'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Guam', 'GU'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Marshall Islands', 'MH'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Northern Mariana Islands', 'NP'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Puerto Rico', 'PR'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['US Virgin Islands', 'VI'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    var provinces = [
        ['Alberta', 'AB'],
        ['British Columbia', 'BC'],
        ['Manitoba', 'MB'],
        ['New Brunswick', 'NB'],
        ['Newfoundland', 'NF'],
        ['Northwest Territory', 'NT'],
        ['Nova Scotia', 'NS'],
        ['Nunavut', 'NU'],
        ['Ontario', 'ON'],
        ['Prince Edward Island', 'PE'],
        ['Quebec', 'QC'],
        ['Saskatchewan', 'SK'],
        ['Yukon', 'YT'],
    ];

    var regions = states.concat(provinces);

    var i;
    if (to == 'abbr') {
        input = input.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        for (i = 0; i < regions.length; i++) {
            if (regions[i][0] == input) {
                return (regions[i][1]);
            }
        }
    } else if (to == 'name') {
        input = input.toUpperCase();
        for (i = 0; i < regions.length; i++) {
            if (regions[i][1] == input) {
                return (regions[i][0]);
            }
        }
    }
}