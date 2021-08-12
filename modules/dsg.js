module.exports = class DSGTask {
    constructor(taskInfo) {
        var path = require('path')
        var fs = require('fs');
        this.configDir = taskInfo.configDir
        this.connection = taskInfo.connection
        this.stopped = "false";
        this.request;
        this.key = getKey(this.configDir)
        this.taskId = taskInfo.id;
        this.site = taskInfo.site;
        this.mode = taskInfo.mode;
        this.webhookLink = JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/settings.json'), 'utf8'))[0].webhook;
        this.mode = taskInfo.mode;
        this.productTitle;
        this.link = taskInfo.product;
        this.size = taskInfo.size;
        this.profilename = taskInfo.profile;
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        this.token = ""
        this.monitorDelay;
        this.errorDelay;
        const tough = require('tough-cookie')
        this.cookieJar = new tough.CookieJar()
        this.accounts = getAccountInfo(taskInfo.accounts, this.configDir)
        this.profile = getProfileInfo(taskInfo.profile, this.configDir)
        this.proxyArray = getProxyInfo(taskInfo.proxies, this.configDir)
        this.proxy = this.proxyArray.sample()
    }

    async adyenEncrypt() {
        let adyenEncrypt = require('node-adyen-encrypt')(25);
        const adyenKey = "10001|B4EFFCD06C8D17BEE3B02C9B87B7803C957EAA3A2DF6B03EC834A6A3C4A70657C7A0771EC408BC9F572538EB05308CEDB4CABD0872279A46B764F59EFADB215EF2654816F4BDA187AC17591208F5837955435DC4AEEED36296E1AA8A51B3873D034A67547EA3387B1520A3D08972EE57BE0ACCA5D532C86D00CEC631CCAD45EFB8068C7C3320F220AFC6557D16C5B4EF0D856EA31EC34419F1AE01829FAC9B3B4E283A0C4A775FA5723ED90BB5C772C94E2AFCAC8825FD0499BDAFF48A6165929CE32E76F9843894E49C19D469A050791183D73E33ADC844B9363031948AF85DEF97941979741670EFEA592B49A2CF073D04D212BDB2B18A541381BECEC11BEF";
        let options = {};

        var x = this.profile.cardNumber
        var y = "";
        for (var i = 0; i < x.length; i = i + 4) {
            y += x.substring(i, i + 4)
            if (i != x.length - 1)
                y += " "
        }
        this.profile.cardNumber = y;

        let cardData = {
            number: this.profile.cardNumber,
            cvc: this.profile.cvv,
            holderName: this.profile.firstName + " " + this.profile.lastName,
            expiryMonth: this.profile.expiryMonth,
            expiryYear: this.profile.expiryYear,
            generationtime: new Date().toISOString()
        }

        let cardNumber = {
            number: this.profile.cardNumber,
            generationtime: new Date().toISOString()
        }

        let cardCVC = {
            cvc: this.profile.cvv,
            generationtime: new Date().toISOString()
        }

        let cardexpiryMonth = {
            expiryMonth: this.profile.expiryMonth,
            generationtime: new Date().toISOString()
        }

        let cardexpiryYear = {
            expiryYear: this.profile.expiryYear,
            generationtime: new Date().toISOString()
        }

        let cseInstance = await adyenEncrypt.createEncryption(adyenKey, options);
        await cseInstance.validate(cardData);
        this.adyenCard = await cseInstance.encrypt(cardNumber);
        this.adyenCVV = await cseInstance.encrypt(cardCVC);
        this.adyenYear = await cseInstance.encrypt(cardexpiryYear);
        this.adyenMonth = await cseInstance.encrypt(cardexpiryMonth);
    }



    async sendFail() {
        const got = require('got');
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=Dicks&input=" + this.link
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/fail',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.link,
                    "size": this.size,
                    "productTitle": this.productTitle,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "image": this.imageURL,
                    "quicktask": this.quickTaskLink
                }
            }).then(response => {
                this.log("Finished")
            })
            .catch(error => {
                this.log(error)
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
                                    "value": this.link,
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
                                "url": this.imageURL
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://i.imgur.com/6h06tuW.png"
                    }
                }).then(response => {
                    this.log("Finished sending webhook")
                })
                .catch(error => {
                    this.log(error.response.body)
                })
        }
    }

    async sendSuccess() {
        const got = require('got');
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=Walmart&input=" + this.link
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/success',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.link,
                    "size": this.size,
                    "productTitle": this.productTitle,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "image": this.imageURL,
                    "quicktask": this.quickTaskLink
                }
            }).then(response => {
                this.log("Finished")
            })
            .catch(error => {
                this.log(error)
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
                                    "value": this.link,
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
                                "url": this.imageURL
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://i.imgur.com/6h06tuW.png"
                    }
                }).then(response => {
                    this.log("Finished sending webhook")
                })
                .catch(error => {
                    this.log(error)
                })
        }
    }

    async cart() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Carting...")
            try {
                this.request = {
                    method: 'put',
                    url: 'https://www.dickssportinggoods.com/api/v1/carts/contents/' + this.link + '?qty=1',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.dickssportinggoods.com',
                        'content-length': '0',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'accept': '*/*',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'origin': 'https://www.dickssportinggoods.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9'
                    }
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error carting: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.cart()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error carting")
                    await sleep(this.errorDelay)
                    await this.cart()
                }
            }
        }
    }


    async loadCheckout() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Loading checkout...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.dickssportinggoods.com/api/v1/checkouts/order-summary',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.dickssportinggoods.com',
                        'sec-ch-ua-mobile': '?0',
                        'content-type': 'application/json',
                        'accept': 'application/json, text/plain, */*',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'origin': 'https://www.dickssportinggoods.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'referer': 'https://www.dickssportinggoods.com/OrderItemDisplay',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: { "headers": { "normalizedNames": {}, "lazyUpdate": null }, "withCredentials": true }
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                response.body = JSON.parse(response.body)
                this.checkoutKey = response.body['checkout_key']
                this.imageURL = "https://" + response.body.cart.items[0].images[0].substring(2)
                console.log(this.imageURL)
                this.cartTotal = response.body.cart.items[0]['unit_price']
                this.productTitle = response.body.cart.items[0].description[0]
                await this.sendProductTitle(this.productTitle)
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected loading checkout")
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                }
            }
        }
    }


    async loadCheckout2() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Loading checkout (2)...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.dickssportinggoods.com/api/v1/checkouts/' + this.checkoutKey,
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.dickssportinggoods.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'sec-ch-ua-mobile': '?0',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
                        'referer': 'https://www.dickssportinggoods.com/OrderItemDisplay',
                        'accept-language': 'en-US,en;q=0.9'
                    }
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error loading checkout (2): " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadCheckout2()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected loading checkout (2)")
                    await sleep(this.errorDelay)
                    await this.loadCheckout2()
                }
            }
        }
    }

    async sendShipping() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Sending shipping...")
            try {
                this.request = {
                    method: 'put',
                    url: 'https://www.dickssportinggoods.com/api/v1/checkouts/' + this.checkoutKey + '/addresses',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.dickssportinggoods.com',
                        'pragma': 'no-cache',
                        'sec-ch-ua-mobile': '?0',
                        'content-type': 'application/json',
                        'access-control-allow-origin': '*',
                        'accept': 'application/json',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'origin': 'https://www.dickssportinggoods.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.dickssportinggoods.com/DSGBillingAddressView',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "first_name": this.profile.firstName,
                        "last_name": this.profile.lastName,
                        "address": this.profile.address1,
                        "city": this.profile.city,
                        "state": abbrRegion(this.profile.state, 'abbr'),
                        "zipcode": this.profile.zipcode,
                        "country": "US",
                        "phone": this.profile.phone,
                        "email": this.profile.email
                    }
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error sending shipping: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.sendShipping()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error sending")
                    await sleep(this.errorDelay)
                    await this.sendShipping()
                }
            }
        }
    }


    async submitShipping() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Submitting shipping...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.dickssportinggoods.com/api/v1/checkouts/' + this.checkoutKey + '/addresses',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.dickssportinggoods.com',
                        'pragma': 'no-cache',
                        'sec-ch-ua-mobile': '?0',
                        'content-type': 'application/json',
                        'access-control-allow-origin': '*',
                        'accept': 'application/json',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'origin': 'https://www.dickssportinggoods.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.dickssportinggoods.com/DSGBillingAddressView',
                        'accept-language': 'en-US,en;q=0.9'
                    }
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error sending submitting: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error submitting")
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                }
            }
        }
    }

    async submitOrder() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Submitting order...")
            try {
                this.request = {
                    method: 'put',
                    url: 'https://www.dickssportinggoods.com/api/v1/checkouts/' + this.checkoutKey + '/payment/payment-processor',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.dickssportinggoods.com',
                        'pragma': 'no-cache',
                        'sec-ch-ua-mobile': '?0',
                        'content-type': 'application/json',
                        'access-control-allow-origin': '*',
                        'accept': 'application/json',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'origin': 'https://www.dickssportinggoods.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.dickssportinggoods.com/DSGPaymentViewCmd',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    json: {
                        "paygateReference": "",
                        "expireMonth": this.adyenMonth,
                        "expireYear": this.adyenYear,
                        "cvv": this.adyenCVV,
                        "account": this.adyenCard,
                        "type": "undefined",
                        "threeDSPayload": "",
                        "device": {
                            "browser": {
                                "acceptHeader": "*/*",
                                "colorDepth": 24,
                                "language": "en-US",
                                "javaEnabled": false,
                                "screenHeight": 900,
                                "screenWidth": 1600,
                                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
                                "timeZoneOffset": 240
                            }
                        }
                    }
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
            } catch (error) {
                await this.setDelays()
                if (error.response.body.includes("Payment Required")) {
                    await this.send("Checkout failed")
                    await this.sendFail()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error submitting order: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error submitting")
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                }
            }
        }
    }

    log(message) {
        const winston = require('winston');
        const logConfiguration = {
            transports: [
                new winston.transports.Console({}),
                new winston.transports.File({
                    filename: this.configDir + '/logs/' + this.taskId + '.log'
                })
            ],
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss'
                }),
                winston.format.printf(info => `[${[info.timestamp]}] [${this.taskId}]: ${info.message}`),
            )
        };
        const logger = winston.createLogger(logConfiguration);

        logger.info(message)
    }

    async stopTask() {
        this.stopped = "true";
        await this.sendProductTitle(this.link)
        this.send("Stopped")
    }


    returnID() {
        return this.taskId;
    }

    async setDelays() {
        var fs = require('fs');
        var path = require('path')
        var delays = JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/delays.json'), 'utf8'));
        var groups = JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/tasks.json'), 'utf8'));
        var index;
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i][Object.keys(groups[i])[0]].length; j++) {
                if (Object.keys(groups[i][Object.keys(groups[i])[0]][j])[0] === this.taskId) {
                    index = i;
                    break;
                }
            }
        }
        this.monitorDelay = delays[index].monitor
        this.errorDelay = delays[index].error
    }

    async sendProductTitle(title) {
        this.connection.send(JSON.stringify({
            event: "taskProductTitle",
            data: {
                taskID: this.taskId,
                newTitle: title
            }
        }))
    }

    async send(status) {
        if (this.stopped === "false" || status === "Stopped") {
            this.log(status)
            this.connection.send(JSON.stringify({
                event: "taskStatus",
                data: {
                    taskID: this.taskId,
                    newStatus: status
                }
            }))
        }
    }



    async updateStat(stat) {
        //this.window.webContents.send("updateStats", stat);
        this.log(stat)
    }


    async initialize() {
        if (this.stopped === "false")
            await this.send("Started")

        if (this.stopped === "false")
            await this.cart()

        if (this.stopped === "false")
            await this.loadCheckout()

        if (this.stopped === "false")
            await this.loadCheckout2()

        if (this.stopped === "false")
            await this.sendShipping()

        if (this.stopped === "false")
            await this.submitShipping()

        if (this.stopped === "false")
            await this.adyenEncrypt()

        if (this.stopped === "false")
            await this.submitOrder()

    }

}



function getProxyInfo(proxies, configDir) {
    if (proxies === "-")
        return ["-"]

    var fs = require('fs');
    var path = require('path')
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


function getAccountInfo(accounts, configDir) {
    if (accounts === "-") {
        return "-"
    }
    var fs = require('fs');
    var path = require('path')


    var str = fs.readFileSync(path.join(configDir, '/userdata/accounts.json'), 'utf8');
    var x = JSON.parse(str)
    for (var i = 0; i < x.length; i++) {
        if (x[i].name === accounts) {
            return x[i].account.sample()
        }
    }
}

function getProfileInfo(profiles, configDir) {
    var fs = require('fs');
    var path = require('path')
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


async function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getKey(configDir) {
    var fs = require('fs');
    var path = require('path')
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