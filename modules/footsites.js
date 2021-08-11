module.exports = class FootsitesTask {
    constructor(taskInfo) {
        var path = require('path')
        var fs = require('fs');
        this.configDir = taskInfo.configDir
        this.connection = taskInfo.connection
        this.stopped = "false";
        this.taskId = taskInfo.id;
        this.site = taskInfo.site;
        this.mode = taskInfo.mode;
        this.csrfToken;
        this.link = taskInfo.product;
        this.size = taskInfo.size;
        this.request;
        this.captchaURL;
        this.productID;
        this.randomsize;
        this.monitorDelay;
        this.errorDelay;
        this.webhookLink = JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/settings.json'), 'utf8'))[0].webhook;
        this.variant;
        this.key = getKey(this.configDir)
        this.queueitUrl
        this.queueitUUID
        this.seid
        this.sizesinStock;
        this.CID;
        this.suffix = 'api'
        this.icid;
        this.reusedCookie = "0"
        this.targetUrl;
        this.profilename = taskInfo.profile;
        this.cartId;
        this.productTitle;
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        const tough = require('tough-cookie');
        this.cookieJar = new tough.CookieJar();
        this.DDCookie;
        this.captchaTaskId;
        this.captchaResponse;
        this.adyenCard;
        this.adyenCVV;
        this.adyenMonth;
        this.adyenYear;
        if (this.link.includes("https")) {
            this.sku = this.link.split("/")[this.link.split("/").length - 1].split(".html")[0];
        } else
            this.sku = this.link
        this.log(this.link.split("/")[this.link.split("/").length - 1].split(".html")[0])
        this.accounts = getAccountInfo(taskInfo.accounts, this.configDir)
        this.profile = getProfileInfo(taskInfo.profile, this.configDir)
        this.proxyArray = getProxyInfo(taskInfo.proxies, this.configDir)
        this.proxy = this.proxyArray.sample();
        if (taskInfo.site === "FootLockerCA") {
            this.baseLink = "footlocker.ca"
            this.country = "CA"
        } else {
            this.baseLink = this.site + ".com"
            this.country = "US"
        }
        this.mode += "-NC"
    }

    async adyenEncrypt() {
        let adyenEncrypt = require('node-adyen-encrypt')(18);
        const adyenKey = "10001|A237060180D24CDEF3E4E27D828BDB6A13E12C6959820770D7F2C1671DD0AEF4729670C20C6C5967C664D18955058B69549FBE8BF3609EF64832D7C033008A818700A9B0458641C5824F5FCBB9FF83D5A83EBDF079E73B81ACA9CA52FDBCAD7CD9D6A337A4511759FA21E34CD166B9BABD512DB7B2293C0FE48B97CAB3DE8F6F1A8E49C08D23A98E986B8A995A8F382220F06338622631435736FA064AEAC5BD223BAF42AF2B66F1FEA34EF3C297F09C10B364B994EA287A5602ACF153D0B4B09A604B987397684D19DBC5E6FE7E4FFE72390D28D6E21CA3391FA3CAADAD80A729FEF4823F6BE9711D4D51BF4DFCB6A3607686B34ACCE18329D415350FD0654D";
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
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=Footsites&input=" + "https://" + this.baseLink + "/product/~/" + this.sku + ".html"

        if (this.size === "RS") {
            for (var i = 0; i < this.sizesinStock.length; i++) {
                if (this.sizesinStock[i].productid === this.productID) {
                    this.randomsize = this.sizesinStock[i].size
                }
            }
            this.size = "Random / " + this.randomsize
        }
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
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
                    "image": "https://images.footlocker.com/pi/" + this.sku + "/large/" + this.sku + ".jpeg",
                    "quicktask": this.quickTaskLink
                },
                responseType: 'json'
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
                                "url": "https://images.footlocker.com/pi/" + this.sku + "/large/" + this.sku + ".jpeg"
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
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=Footsites&input=" + "https://" + this.baseLink + "/product/~/" + this.sku + ".html"

        if (this.size === "RS") {
            for (var i = 0; i < this.sizesinStock.length; i++) {
                if (this.sizesinStock[i].productid === this.productID) {
                    this.randomsize = this.sizesinStock[i].size
                }
            }
            this.size = "Random / " + this.randomsize
        }
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
                    "image": "https://images.footlocker.com/pi/" + this.sku + "/large/" + this.sku + ".jpeg",
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
                                "url": "https://images.footlocker.com/pi/" + this.sku + "/large/" + this.sku + ".jpeg"
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


    async handleQueue() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Polling queue...")
            try {
                this.request = {
                    method: 'head',
                    url: 'https://www.' + this.baseLink + "?skipqueue=true",
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.baseLink,
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                        'origin': 'www.' + this.baseLink,
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
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
                if (this.stopped === "false") {
                    await this.send("Passed queue")
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode == 529) {
                        this.log("In queue")
                        await this.send("In queue")
                        await sleep(10000)
                        await this.handleQueue()
                    } else if (error.response.statusCode === 503) {
                        this.log("In queue")
                        await this.send("In queue (perma)")
                        await sleep(10000)
                        await this.handleQueue()
                    }
                } else {
                    this.log(error)
                    await this.send("Error polling queue")
                    await sleep(this.errorDelay)
                    await this.handleQueue()
                }
            }
        }
    }


    async getSession() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        const tunnel = require('tunnel');

        if (this.stopped === "false") {
            this.send("Getting session...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.' + this.baseLink + '/api/session',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.baseLink,
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'origin': 'www.' + this.baseLink,
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                        'x-fl-request-id': uuidv4(),
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
                this.log(this.request)
                let response = await got(this.request);
                this.csrftoken = response.body.data.csrfToken;
                this.log("Got CSRF Token: " + this.csrftoken)
                if (this.stopped === "false") {
                    this.send("Got session")
                    return;
                }
            } catch (error) {
                await this.setDelays()
                this.log(error)
                if (typeof error.response != 'undefined') {
                    if (error.response.statusCode === 403 && this.stopped === "false") {
                        /*if (typeof error.response.body.url != 'undefined' && error.response.body.url.includes("t=bv")) {
                            await this.send("Error Datadome blacklisted")
                            await sleep(3500)
                            await this.getSession()
                        } else
                        if (this.mode.includes("-NC")) {
                            await this.send("Skipping captcha")
                            this.proxy = this.proxyArray.sample();
                            await this.getSession()
                        } else {
                            this.log("datadome captcha")
                            await this.send("Found Datadome Captcha")
                            this.DDCookie = JSON.parse(JSON.stringify(await this.cookieJar.getCookies('https://' + this.baseLink)))[0].value
                            this.cid = this.DDCookie;
                            this.captchaURL = error.response.body.url + "&cid=" + this.DDCookie
                            this.icid = this.captchaURL.substring(42).split("&referer")[0].substring(11)
                            await this.send("Waiting for captcha")
                            if (this.stopped === "false")
                                await this.sendCaptcha()

                            if (this.stopped === "false" && this.reusedCookie != "1")
                                await this.getDataDomeCookie()

                            this.DDCookie = "datadome=" + this.cid
                            this.cookieJar.setCookie(this.DDCookie + '; Max-Age=31536000; Domain=' + this.baseLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', 'https://' + this.baseLink)
                            if (this.stopped === "false")
                                await this.send("Setting Datadome")*/
                        await this.send("Site backend error: 403")
                        await sleep(this.errorDelay)
                        await this.getSession()
                    } else if (error.response.statusCode === 503 && this.stopped === "false") {
                        if (this.stopped === "false") {
                            await this.handleQueue()
                            await this.getSession()
                        }
                    } else if (error.response.statusCode === 529 && this.stopped === "false") {
                        if (this.stopped === "false") {
                            await this.handleQueue()
                            await this.getSession()
                        }
                    } else if (error.response.statusCode === 429 && this.stopped === "false") {
                        this.log(error.response.body)
                        this.send("Error getting session: 429")
                        await sleep(this.errorDelay)
                        await this.getSession()
                    } else if (this.stopped === "false") {
                        this.log(error.response.body)
                        await this.send("Unexpected error: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.getSession()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.getSession()
                }
            }
        }
    }


    async getProductID() {
        const got = require('got');
        const tunnel = require('tunnel');

        if (this.stopped === "false") {
            this.send("Getting product...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.' + this.baseLink + '/api/products/pdp/' + this.sku + "?cache=none",
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.baseLink,
                        'content-length': '0',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                        'origin': 'www.' + this.baseLink,
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
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
                this.productTitle = response.body.name;
                await this.sendProductTitle(this.productTitle)
                if (typeof response.body.variantAttributes != 'undefined') {
                    if (this.size === "RS") {
                        this.sizesinStock = []
                        for (var i = 0; i < response.body.variantAttributes.length; i++) {
                            if (response.body.variantAttributes[i].sku === this.sku) {
                                this.variant = response.body.variantAttributes[i].code
                            }
                        }
                        if (typeof this.variant === 'undefined')
                            throw 'Variant not found'
                        else {
                            for (var i = 0; i < response.body.sellableUnits.length; i++) {
                                if (response.body.sellableUnits[i].attributes[1].id === this.variant && response.body.sellableUnits[i].stockLevelStatus === 'inStock')
                                    this.sizesinStock.push({ "size": response.body.sellableUnits[i].attributes[0].value, "productid": response.body.sellableUnits[i].attributes[0].id })
                            }
                            if (this.sizesinStock.length > 0) {
                                this.productID = this.sizesinStock.sample().productid
                                if (this.stopped === "false") {
                                    await this.send("Got PID")
                                    return;
                                }
                            } else
                                throw 'Variant has no size available'
                        }
                    } else {
                        for (var i = 0; i < response.body.variantAttributes.length; i++) {
                            if (response.body.variantAttributes[i].sku === this.sku) {
                                this.variant = response.body.variantAttributes[i].code
                            }
                        }
                        if (typeof this.variant === 'undefined')
                            throw 'Variant not found'
                        else {
                            for (var i = 0; i < response.body.sellableUnits.length; i++) {
                                if (response.body.sellableUnits[i].attributes[1].id === this.variant && response.body.sellableUnits[i].attributes[0].value.includes(this.size))
                                    this.productID = response.body.sellableUnits[i].attributes[0].id
                            }
                            if (typeof this.productID != 'undefined') {
                                if (this.stopped === "false") {
                                    await this.send("Got PID")
                                    return;
                                }
                            } else
                                throw 'Variant not found'
                        }
                    }
                } else throw 'Variant has not found'
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined') {
                    if (error.response.statusCode === 503 && this.stopped === "false") {
                        if (error.response.body.includes("backend")) {
                            await this.send("Error backend block: 503")
                            await sleep(this.errorDelay)
                            await this.getProductID()
                        } else {
                            await this.handleQueue()
                            await this.getProductID()
                        }
                    } else if (error.response.statusCode === 529 && this.stopped === "false") {
                        if (this.stopped === "false") {
                            await this.handleQueue()
                            await this.getProductID()
                        }
                    } else if (error.response.statusCode === 429 && this.stopped === "false") {
                        await this.send("Error getting PID: 429")
                        await sleep(this.errorDelay)
                        await this.getProductID()
                    } else if (error === 'Variant not found') {
                        await this.send("Error, variant not found")
                        await sleep(this.monitorDelay)
                        await this.getProductID()
                    } else if (error.response.statusCode === 400 && this.stopped === "false") {
                        await this.send("Waiting for restock")
                        await sleep(this.monitorDelay)
                        await this.getProductID()
                    } else if (this.stopped === "false") {
                        this.log(error.response.body)
                        await this.send("Unexpected error: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.getProductID()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.getProductID()
                }
            }
        }
    }


    async addToCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        const { v4: uuidv4 } = require('uuid');

        if (this.size === "RS")
            this.productID = this.sizesinStock.sample().productid
        if (this.stopped === "false") {
            this.reusedCookie = "0"
            await this.send("Adding to cart...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.' + this.baseLink + '/api/users/carts/current/entries',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.baseLink,
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                        'origin': 'www.' + this.baseLink,
                        'referer': this.link,
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                        'x-fl-productid': this.productID,
                        'x-csrf-token': this.csrftoken,
                        'x-fl-request-id': uuidv4(),
                    },
                    json: {
                        'productId': this.productID,
                        'productQuantity': '1'
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
                    this.cartId = response.body.guid
                    this.cartTotal = response.body.totalPrice.value
                    await this.send("Carted")
                    await this.updateStat("carts")
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (this.suffix === "api")
                    this.suffix = "apigate"
                else if (this.suffix === "apigate")
                    this.suffix = "api"
                if (typeof error.response != 'undefined') {
                    if (error.response.statusCode === 503 && this.stopped === "false") {
                        await this.handleQueue()
                        await this.addToCart()
                    } else if (error.response.statusCode === 529 && this.stopped === "false") {
                        if (this.stopped === "false") {
                            await this.handleQueue()
                            await this.addToCart()
                        }
                    } else if (error.response.statusCode === 403 && typeof error.response.body.url != 'undefined' && this.stopped === "false") {
                        if (typeof error.response.body.url != 'undefined' && error.response.body.url.includes("t=bv")) {
                            await this.send("Error Datadome blacklisted")
                            await sleep(this.errorDelay)
                            await this.addToCart()
                        } else
                        if (this.mode.includes("-NC")) {
                            await this.send("Skipping captcha")
                            this.proxy = this.proxyArray.sample();
                            await this.addToCart()
                        } else {
                            this.log("datadome captcha")
                            await this.send("Found Datadome Captcha")
                            this.DDCookie = JSON.parse(JSON.stringify(await this.cookieJar.getCookies('https://' + this.baseLink)))[0].value
                            this.cid = this.DDCookie;
                            this.captchaURL = error.response.body.url + "&cid=" + this.DDCookie
                            this.icid = this.captchaURL.substring(42).split("&referer")[0].substring(11)
                            await this.send("Waiting for captcha")
                            if (this.stopped === "false")
                                await this.sendCaptcha()

                            if (this.stopped === "false" && this.reusedCookie != "1")
                                await this.getDataDomeCookie()

                            this.DDCookie = "datadome=" + this.cid
                            this.cookieJar.setCookie(this.DDCookie + '; Max-Age=31536000; Domain=' + this.baseLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', 'https://' + this.baseLink)
                            if (this.stopped === "false")
                                await this.send("Setting Datadome")

                            await this.addToCart()
                        }
                    } else if (error.response.statusCode === 429 && this.stopped === "false") {
                        await this.send("Error carting, 429")
                        await sleep(this.errorDelay)
                        await this.addToCart()
                    } else if (error.response.statusCode === 531 && this.stopped === "false") {
                        this.log(error.response.headers['x-cache'])
                        if (error.response.headers['x-cache'].includes("HIT")) {
                            await this.send("OOS cached, retrying")
                            await sleep(this.errorDelay)
                                // const tough = require('tough-cookie');
                                //this.cookieJar = new tough.CookieJar()
                                //await this.getSession()
                            await this.addToCart()
                        } else {
                            this.log("failed carting, retrying")
                            await this.send("OOS, retrying")
                            await sleep(this.errorDelay)
                            await this.addToCart()
                        }
                    } else if (this.stopped === "false") {
                        this.log(error.response.body)
                        await this.send("Unexpected error: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.addToCart()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.addToCart()
                }
            }
        }
    }

    /*   async sendEmail() {
           const got = require('got');
           const { v4: uuidv4 } = require('uuid');
           if (this.stopped === "false") {
               this.reusedCookie = "0"

               await this.send("Submitting email")
               try {
                   let response = await got({
                       method: 'put',
                       url: 'https://www.' + this.baseLink + '/api/users/carts/current/email/' + this.profile.email + '?timestamp=' + getTimestamp(),
                       cookieJar: this.cookieJar,
                       withCredentials: true,
                       headers: {
                           'authority': 'www.' + this.baseLink + '/checkout',
                           'content-length': '0',
                           'pragma': 'no-cache',
                           'cache-control': 'no-cache',
                           'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                           'origin': 'www.' + this.baseLink,
                           'sec-fetch-site': 'same-origin',
                           'sec-fetch-mode': 'cors',
                           'sec-fetch-dest': 'empty',
                           'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                           'x-csrf-token': this.csrftoken,
                           'x-fl-request-id': uuidv4()
                       },
                       responseType: 'json'
                   })

                   if (this.stopped === "false") {
                       await this.send("Submitted email")
                       return;
                   }
               } catch (error) {
                   this.log(error)
                   if (this.stopped === "false") {
                       if (typeof error.response != 'undefined' && typeof error.response.body.url != 'undefined' && this.stopped === "false") {
                           this.log("Datadome captcha")
                               //this.log(this.cookieJar)
                           this.DDCookie = JSON.parse(JSON.stringify(await this.cookieJar.getCookies('https://' + this.baseLink)))[0].value
                           this.cid = this.DDCookie;
                           // this.log(this.cid)
                           this.captchaURL = error.response.body.url + "&cid=" + this.DDCookie
                           this.icid = this.captchaURL.substring(42).split("&referer")[0].substring(11)
                           await this.send("Waiting for captcha")
                           if (this.stopped === "false")
                               await this.sendCaptcha()


                           if (this.stopped === "false" && this.reusedCookie != "1")
                               await this.getDataDomeCookie()

                           this.DDCookie = "datadome=" + this.cid
                               // this.log(this.DDCookie)
                           this.cookieJar.setCookie(this.DDCookie + '; Max-Age=31536000; Domain=.' + this.baseLink + '; Path=/; Secure; SameSite=Lax;', 'https://' + this.baseLink)
                               // this.log(this.cookieJar)
                           if (this.stopped === "false")
                               await this.send("Setting Datadome")
                       } else {
                           this.log("Error submitting email")
                           await this.send("Error submitting email")
           await sleep(3500)
                           this.sendEmail()
                       }
                   }
               }
           }
       }*/

    /*  async submitShipping() {
          const got = require('got');
          const { v4: uuidv4 } = require('uuid');
          this.log(this.profile)
          if (this.stopped === "false") {
              await this.send("Submitting shipping")
              try {
                  let response = await got({
                      method: 'post',
                      url: 'https://www.' + this.baseLink + '/api/users/carts/current/addresses/shipping?timestamp=' + getTimestamp(),
                      cookieJar: this.cookieJar,
                      withCredentials: true,
                      headers: {
                          'authority': 'www.' + this.baseLink + '/checkout',
                          'content-length': '0',
                          'pragma': 'no-cache',
                          'cache-control': 'no-cache',
                          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                          'origin': 'www.' + this.baseLink,
                          'sec-fetch-site': 'same-origin',
                          'sec-fetch-mode': 'cors',
                          'sec-fetch-dest': 'empty',
                          'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                          'x-csrf-token': this.csrftoken,
                          'x-fl-request-id': uuidv4()
                      },
                      json: {
                          "shippingAddress": {
                              "setAsDefaultBilling": false,
                              "setAsDefaultShipping": false,
                              "firstName": this.profile.firstName,
                              "lastName": this.profile.lastName,
                              "email": this.profile.email,
                              "phone": this.profile.phone,
                              "country": {
                                  "isocode": this.country,
                                  "name": this.profile.country
                              },
                              "billingAddress": false,
                              "defaultAddress": false,
                              "id": null,
                              "region": { "countryIso": this.country, "isocode": this.country + "-" + abbrRegion(this.profile.state, 'abbr'), "isocodeShort": abbrRegion(this.profile.state, 'abbr'), "name": this.profile.state },
                              "setAsBilling": true,
                              "shippingAddress": true,
                              "visibleInAddressBook": false,
                              "type": "default",
                              "line1": this.profile.address1,
                              "town": this.profile.city,
                              "postalCode": this.profile.zipcode,
                              "regionFPO": null,
                              "recordType": "S"
                          }
                      },
                      responseType: 'json'
                  })

                  if (this.stopped === "false") {
                      await this.send("Submitted shipping")
                      return;
                  }
              } catch (error) {
                  if (error.response != 'undefined') {
                      if (error.response.statusCode === 403 && this.stopped === "false") {
                          if (error.response.body.url.includes("t=bv")) {
                              await this.send("Error Datadome blacklisted")
                          } else {
                              this.log("datadome captcha")
                              await this.send("Found Datadome Captcha")
                              this.DDCookie = JSON.parse(JSON.stringify(await this.cookieJar.getCookies('https://' + this.baseLink)))[0].value
                              this.cid = this.DDCookie;
                              this.captchaURL = error.response.body.url + "&cid=" + this.DDCookie
                              this.icid = this.captchaURL.substring(42).split("&referer")[0].substring(11)
                              await this.send("Waiting for captcha")
                              if (this.stopped === "false")
                                  await this.sendCaptcha()

                              if (this.stopped === "false" && this.reusedCookie != "1")
                                  await this.getDataDomeCookie()

                              this.DDCookie = "datadome=" + this.cid
                              this.cookieJar.setCookie(this.DDCookie + '; Max-Age=31536000; Domain=' + this.baseLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', 'https://' + this.baseLink)
                              if (this.stopped === "false")
                                  await this.send("Setting Datadome")

                              await this.submitShipping()
                          }
                      } else if (this.stopped === "false") {
                          this.log(error.response.body)
                          await this.send("Error submitting info: " + error.response.statusCode)
          await sleep(3500)
                          await this.submitShipping()
                      }
                  } else if (this.stopped === "false") {
                      this.log(error)
                      await this.send("Unexpected error")
      await sleep(3500)
                      await this.submitShipping()
                  }
              }
          }
      }*/

    async logintoFLX() {
        const got = require('got');
        const tunnel = require('tunnel');

        const { v4: uuidv4 } = require('uuid');
        if (this.stopped === "false") {
            await this.send("Logging in...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.' + this.baseLink + '/api/v3/auth?timestamp=' + getTimestamp(),
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.baseLink,
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                        'origin': 'www.' + this.baseLink,
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                        'x-csrf-token': this.csrftoken,
                        'x-fl-request-id': uuidv4()
                    },
                    json: {
                        'password': this.accounts.password,
                        'uid': this.accounts.email
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
                    await this.send("Logged in")
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (error.response != 'undefined') {
                    if (error.response.statusCode === 403 && this.stopped === "false") {
                        if (typeof error.response.body.url != 'undefined' && error.response.body.url.includes("t=bv")) {
                            await this.send("Error Datadome blacklisted")
                        } else {
                            this.log("datadome captcha")
                            await this.send("Found Datadome Captcha")
                            this.DDCookie = JSON.parse(JSON.stringify(await this.cookieJar.getCookies('https://' + this.baseLink)))[0].value
                            this.cid = this.DDCookie;
                            this.captchaURL = error.response.body.url + "&cid=" + this.DDCookie
                            this.icid = this.captchaURL.substring(42).split("&referer")[0].substring(11)
                            await this.send("Waiting for captcha")
                            if (this.stopped === "false")
                                await this.sendCaptcha()

                            if (this.stopped === "false" && this.reusedCookie != "1")
                                await this.getDataDomeCookie()

                            this.DDCookie = "datadome=" + this.cid
                            this.cookieJar.setCookie(this.DDCookie + '; Max-Age=31536000; Domain=' + this.baseLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', 'https://' + this.baseLink)
                            if (this.stopped === "false")
                                await this.send("Setting Datadome")

                            await this.logintoFLX()
                        }
                    } else if (this.stopped === "false") {
                        this.log(error.response.body)
                        await this.send("Error logging in: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.logintoFLX()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.logintoFLX()
                }
            }
        }
    }

    /*   async submitBilling() {
           const axios = require('axios').default;
           const { v4: uuidv4 } = require('uuid');
           if (this.stopped === "false") {
               await this.send("Submitting billing")
               try {
                   let response = await axios({
                       method: 'post',
                       url: 'https://www.' + this.baseLink + '/api/users/carts/current/set-billing?timestamp=' + getTimestamp(),
                       cookieJar: this.cookieJar,
                       withCredentials: true,
                       headers: {
                           'authority': 'www.' + this.baseLink + '/checkout',
                           'content-length': '0',
                           'pragma': 'no-cache',
                           'cache-control': 'no-cache',
                           'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                           'origin': 'www.' + this.baseLink,
                           'sec-fetch-site': 'same-origin',
                           'sec-fetch-mode': 'cors',
                           'sec-fetch-dest': 'empty',
                           'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                           'x-csrf-token': this.csrftoken,
                           'x-fl-request-id': uuidv4()
                       },
                       data: {
                           "setAsDefaultBilling": false,
                           "setAsDefaultShipping": false,
                           "firstName": this.profile.firstName,
                           "lastName": this.profile.lastName,
                           "email": this.profile.email,
                           "phone": this.profile.phone,
                           "country": { "isocode": this.country, "name": this.profile.country },
                           "billingAddress": false,
                           "defaultAddress": false,
                           "id": null,
                           "region": { "countryIso": this.country, "isocode": this.country + "-" + abbrRegion(this.profile.state, 'abbr'), "isocodeShort": abbrRegion(this.profile.state, 'abbr'), "name": this.profile.state },
                           "setAsBilling": false,
                           "shippingAddress": true,
                           "visibleInAddressBook": false,
                           "type": "default",
                           "line1": this.profile.address1,
                           "town": this.profile.city,
                           "postalCode": this.profile.zipcode,
                           "regionFPO": null,
                           "recordType": "S"
                       }
                   })

                   if (this.stopped === "false") {
                       await this.send("Submitted billing")
                       return;
                   }
               } catch (error) {
                   if (error.response != 'undefined') {
                       if (error.response.statusCode === 403 && this.stopped === "false") {
                           if (error.response.body.url.includes("t=bv")) {
                               await this.send("Error Datadome blacklisted")
                           } else {
                               this.log("datadome captcha")
                               await this.send("Found Datadome Captcha")
                               this.DDCookie = JSON.parse(JSON.stringify(await this.cookieJar.getCookies('https://' + this.baseLink)))[0].value
                               this.cid = this.DDCookie;
                               this.captchaURL = error.response.body.url + "&cid=" + this.DDCookie
                               this.icid = this.captchaURL.substring(42).split("&referer")[0].substring(11)
                               await this.send("Waiting for captcha")
                               if (this.stopped === "false")
                                   await this.sendCaptcha()

                               if (this.stopped === "false" && this.reusedCookie != "1")
                                   await this.getDataDomeCookie()

                               this.DDCookie = "datadome=" + this.cid
                               this.cookieJar.setCookie(this.DDCookie + '; Max-Age=31536000; Domain=' + this.baseLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', 'https://' + this.baseLink)
                               if (this.stopped === "false")
                                   await this.send("Setting Datadome")

                               await this.submitBilling()
                           }
                       } else if (this.stopped === "false") {
                           this.log(error.response.body)
                           await this.send("Error submitting info: " + error.response.statusCode)
           await sleep(3500)
                           await this.submitBilling()
                       }
                   } else if (this.stopped === "false") {
                       this.log(error)
                       await this.send("Unexpected error")
       await sleep(3500)
                       await this.submitBilling()
                   }
               }
           }
       }*/

    async submitInformation() {
        const got = require('got');
        const tunnel = require('tunnel');

        const { v4: uuidv4 } = require('uuid');
        if (this.stopped === "false") {
            await this.send("Submitting information...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.' + this.baseLink + '/api/users/carts/current/paypal?timestamp=' + getTimestamp(),
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.baseLink + '/checkout',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                        'origin': 'www.' + this.baseLink,
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                        'x-csrf-token': this.csrftoken,
                        'x-fl-request-id': uuidv4()
                    },
                    json: {
                        "checkoutType": "EXPRESS",
                        "nonce": uuidv4(),
                        "details": {
                            "email": this.profile.email,
                            "firstName": this.profile.firstName,
                            "lastName": this.profile.lastName,
                            "payerId": "EPM8LVXC2DHQ6",
                            "shippingAddress": {
                                "recipientName": this.profile.firstName + " " + this.profile.lastName,
                                "line1": this.profile.address1,
                                "city": this.profile.city,
                                "state": abbrRegion(this.profile.state, 'abbr'),
                                "postalCode": this.profile.zipcode,
                                "countryCode": "US",
                                "countryCodeAlpha2": "US",
                                "locality": this.profile.city,
                                "region": abbrRegion(this.profile.state, 'abbr'),
                                "state": abbrRegion(this.profile.state, 'abbr')
                            },
                            "phone": this.profile.phone,
                            "countryCode": "US",
                            "billingAddress": {
                                "recipientName": this.profile.firstName + " " + this.profile.lastName,
                                "line1": this.profile.address1,
                                "city": this.profile.city,
                                "state": abbrRegion(this.profile.state, 'abbr'),
                                "postalCode": this.profile.zipcode,
                                "countryCode": "US",
                                "countryCodeAlpha2": "US",
                                "locality": this.profile.city,
                                "region": abbrRegion(this.profile.state, 'abbr'),
                                "state": abbrRegion(this.profile.state, 'abbr')
                            }
                        },
                        "type": "PayPalAccount"
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
                    await this.send("Submitted information")
                    this.log(response.body)
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (error.response != 'undefined') {
                    if (error.response.statusCode === 403 && this.stopped === "false") {
                        if (typeof error.response.body.url != 'undefined' && error.response.body.url.includes("t=bv")) {
                            await this.send("Error Datadome blacklisted")
                        } else
                        if (this.mode.includes("-NC")) {
                            await this.send("Skipping captcha")
                            this.proxy = this.proxyArray.sample();
                            await this.submitInformation()
                        } else {
                            this.log("datadome captcha")
                            await this.send("Found Datadome Captcha")
                            this.DDCookie = JSON.parse(JSON.stringify(await this.cookieJar.getCookies('https://' + this.baseLink)))[0].value
                            this.cid = this.DDCookie;
                            this.captchaURL = error.response.body.url + "&cid=" + this.DDCookie
                            this.icid = this.captchaURL.substring(42).split("&referer")[0].substring(11)
                            await this.send("Waiting for captcha")
                            if (this.stopped === "false")
                                await this.sendCaptcha()

                            if (this.stopped === "false" && this.reusedCookie != "1")
                                await this.getDataDomeCookie()

                            this.DDCookie = "datadome=" + this.cid
                            this.cookieJar.setCookie(this.DDCookie + '; Max-Age=31536000; Domain=' + this.baseLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', 'https://' + this.baseLink)
                            if (this.stopped === "false")
                                await this.send("Setting Datadome")

                            await this.submitInformation()
                        }
                    } else if (this.stopped === "false") {
                        this.log(error.response.body)
                        await this.send("Error submitting info: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.submitInformation()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.submitInformation()
                }
            }
        }
    }


    async submitOrder() {
        const got = require('got');
        const tunnel = require('tunnel');

        const { v4: uuidv4 } = require('uuid');
        if (this.stopped === "false") {
            await this.send("Submitting order...")
            await this.adyenEncrypt()
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.' + this.baseLink + '/api/v2/users/orders?timestamp=' + getTimestamp(),
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.baseLink + '/checkout',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                        'origin': 'www.' + this.baseLink,
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                        'x-csrf-token': this.csrftoken,
                        'x-fl-request-id': uuidv4()
                    },
                    json: {
                        "preferredLanguage": "en",
                        "termsAndCondition": false,
                        "deviceId": "",
                        "cartId": this.cartId,
                        "encryptedCardNumber": this.adyenCard,
                        "encryptedExpiryMonth": this.adyenMonth,
                        "encryptedExpiryYear": this.adyenYear,
                        "encryptedSecurityCode": this.adyenCVV,
                        "paymentMethod": "CREDITCARD",
                        "returnUrl": 'https://www.' + this.baseLink + '/adyen/checkout',
                        "browserInfo": { "screenWidth": 1600, "screenHeight": 900, "colorDepth": 24, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36", "timeZoneOffset": 300, "language": "en-US", "javaEnabled": false }
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
                    this.send("Check email")
                    this.sendSuccess()
                    this.log(response.body)
                    return;
                }
            } catch (error) {
                await this.setDelays()
                this.log(error.response.body)
                if (this.stopped === "false") {
                    this.sendFail()
                    this.send("Checkout failed")
                    var path = require('path')
                    var fs = require('fs');
                    if (JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/settings.json'), 'utf8'))[0].retryCheckouts == true) {
                        await sleep(this.errorDelay)
                        await this.submitOrder()
                    }
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
        await this.send("Started")
        await this.setDelays()
        if (this.stopped === "false")
            await this.getSession()

        if (this.stopped === "false" && typeof this.productID === 'undefined')
            await this.getProductID()

        if (this.stopped === "false")
            await this.addToCart()

        if (this.stopped === "false" && this.accounts != '-')
            await this.logintoFLX()

        if (this.stopped === "false")
            await this.submitInformation()

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

function getKey(configDir) {
    var fs = require('fs');
    var path = require('path')
    var str = fs.readFileSync(path.join(configDir, '/userdata/key.txt'), 'utf8');
    return str;
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

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
}

function getTimestamp() {
    return Math.floor(Date.now() / 1000);
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