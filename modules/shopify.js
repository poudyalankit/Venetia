module.exports = class ShopifyTask {
    constructor(taskInfo) {
        require('log-timestamp');
        require("../src/js/console-file.js");
        var path = require('path')
        var fs = require('fs');
        const electron = require('electron');
        const configDir = (electron.app || electron.remote.app).getPath('userData');
        //console.file(path.join(configDir, '/userdata/logs.txt'));
        this.stopped = "false";
        this.request;
        this.key = getKey()
        this.taskId = taskInfo.id;
        this.site = taskInfo.site;
        this.mode = taskInfo.mode;
        this.webhookLink = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/settings.json'), 'utf8'))[0].webhook;
        this.mode = taskInfo.mode;
        this.productTitle;
        this.link = taskInfo.product;
        this.preloadlimit = 25;
        this.size = taskInfo.size;
        this.profilename = taskInfo.profile;
        this.checkoutURL;
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        this.monitorDelay;
        this.errorDelay;
        this.encryptedcard;
        const tough = require('tough-cookie')
        this.cookieJar = new tough.CookieJar()
        this.accounts = getAccountInfo(taskInfo.accounts)
        this.profile = getProfileInfo(taskInfo.profile)
        this.proxyArray = getProxyInfo(taskInfo.proxies)
        this.proxy = this.proxyArray.sample()
        this.baseLink = taskInfo.baseLink
        this.plainLink = this.baseLink.split("https://")[1]
        this.insecurelink = "http://" + this.plainLink
        this.shippingPayload = {}
        this.shippingRatePayload = {}
        this.paymentPayload = {}
        this.captchaResponse = "none"

        if (this.link.startsWith("http")) {
            this.searchMethod = "link"
        } else if (this.link.startsWith("+")) {
            this.searchMethod = "variant"
        } else {
            this.searchMethod = "keywords"
            this.keywords = this.link.split(",")
            this.positiveKeywords = []
            this.negativeKeywords = []
            for (var i = 0; i < this.keywords.length; i++) {
                if (this.keywords[i].trim().startsWith("-"))
                    this.negativeKeywords.push(this.keywords[i].substring(1).trim())
                else
                    this.positiveKeywords.push(this.keywords[i].trim())
            }
        }
    }

    async sendFailError() {
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
                    "product": this.link,
                    "size": this.size,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
                    "image": this.imageURL
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
                            "title": "Venetia Failed Checkout (BP) ! :octagonal_sign:",
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
                    console.log("Finished sending webhook")
                })
                .catch(error => {
                    console.log(error.response.body)
                })
        }
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
                    "product": this.link,
                    "size": this.size,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
                    "image": this.imageURL
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
                    "product": this.link,
                    "size": this.size,
                    "productTitle": this.productTitle,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "image": this.imageURL
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
                    console.log("Finished sending webhook")
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    async submitCard() {
        const got = require('got');
        const tunnel = require('tunnel');
        var x = this.profile.cardNumber
        var y = "";
        for (var i = 0; i < x.length; i = i + 4) {
            y += x.substring(i, i + 4)
            if (i != x.length - 1)
                y += " "
        }
        this.profile.cardNumber = y;
        if (this.stopped === "false") {
            await this.send("Submitting card...")
            try {
                this.request = {
                    method: 'post',
                    url: "https://deposit.us.shopifycs.com/sessions",
                    headers: {
                        'Connection': 'keep-alive',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'Accept': 'application/json',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'Content-Type': 'application/json',
                        'Origin': 'https://checkout.shopifycs.com',
                        'Sec-Fetch-Site': 'same-site',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Dest': 'empty',
                        'Referer': 'https://checkout.shopifycs.com/',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                    json: {
                        "credit_card": {
                            "number": this.profile.cardNumber,
                            "name": this.profile.firstName + " " + this.profile.lastName,
                            "month": parseInt(this.profile.expiryMonth),
                            "year": parseInt(this.profile.expiryYear),
                            "verification_value": this.profile.cvv
                        },
                        "payment_session_scope": this.plainLink
                    },
                    responseType: "json"
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                this.encryptedPayment = response.body.id
                await this.send("Submitted card")
                return;
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting card: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitCard()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting card")
                    await sleep(this.errorDelay)
                    await this.submitCard()
                }
            }
        }
    }

    async login() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            console.log(querystring.encode({
                'form_type': 'customer_login',
                'utf8': '✓',
                'customer[email]': this.accounts.email,
                'customer[password]': this.accounts.password,
                'return_url': "/account"
            }))
            await this.send("Logging in...")
            try {
                this.request = {
                    method: 'post',
                    url: this.baseLink + "/account/login",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    body: querystring.encode({
                        'form_type': 'customer_login',
                        'utf8': '✓',
                        'customer[email]': this.accounts.email,
                        'customer[password]': this.accounts.password,
                        'return_url': "/account"
                    }),
                    followRedirect: false
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
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error logging in: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.login()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error logging in")
                    await sleep(this.errorDelay)
                    await this.login()
                }
            }
        }
    }

    async findRandomItem() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Preloading...")
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/products.json?limit=" + this.preloadlimit,
                    cookieJar: this.cookieJar,
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
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
                for (var i = 0; i < response.body.products.length; i++) {
                    for (var j = 0; j < response.body.products[i].variants.length; j++) {
                        if (response.body.products[i].variants[j].available == true) {
                            this.productVariant = response.body.products[i].variants[j].id
                            await this.send("Found product")
                            return;
                        }
                    }
                }
                throw ("Error preloading")
            } catch (error) {
                await this.setDelays()
                if (error === "Error preloading") {
                    await this.send("Error preloading")
                    this.preloadlimit += 25
                    await this.findRandomItem()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error preloading: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.findRandomItem()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error preloading")
                    await sleep(this.errorDelay)
                    await this.findRandomItem()
                }
            }
        }
    }

    async waitForCheckpoint() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Waiting for checkpoint...")
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/checkout",
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
                    },
                    followRedirect: false
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                if (response.body.includes("/checkpoint") == false)
                    throw "Waiting for checkpoint"
            } catch (error) {
                await this.setDelays()
                if (error === "Waiting for checkpoint") {
                    await this.send("Waiting for checkpoint...")
                    await sleep(this.monitorDelay)
                    await this.waitForCheckpoint()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error finding product: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.waitForCheckpoint()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error finding variant")
                    await sleep(this.errorDelay)
                    await this.waitForCheckpoint()
                }
            }
        }
    }

    async clearCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Clearing cart...")
            try {
                this.request = {
                    method: 'post',
                    url: this.baseLink + "/cart/clear.js",
                    cookieJar: this.cookieJar,
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
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
                console.log(response.body)
                if (response.body.items.length != 0 && response.body.items['item_count'] != 0)
                    throw "Error clearing cart"
            } catch (error) {
                await this.setDelays()
                if (error === "Error clearing cart") {
                    await this.send("Error clearing cart")
                    await sleep(this.errorDelay)
                    await this.clearCart()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error clearing cart: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.clearCart()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error clearing cart")
                    await sleep(this.errorDelay)
                    await this.clearCart()
                }
            }
        }
    }

    async findProductByKeywords() {
        const got = require('got');
        const tunnel = require('tunnel');
        this.cookie = "shopify_digest=" + await makeid(7)
        this.cookieJar.setCookie(this.cookie + '; Domain=' + this.plainLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', this.baseLink)
        if (this.stopped === "false") {
            await this.send("Searching for product...")
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/products.json?limit=25",
                    cookieJar: this.cookieJar,
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
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
                var positiveMatch = true;
                var negativeMatch = true;
                var index;
                for (var i = 0; i < response.body.products.length; i++) {
                    for (var j = 0; j < this.positiveKeywords.length; j++) {
                        if (response.body.products[i].title.toLowerCase().includes(this.positiveKeywords[j].toLowerCase()) == false)
                            positiveMatch = false;
                    }
                    for (var k = 0; k < this.negativeKeywords.length; k++) {
                        if (response.body.products[i].title.toLowerCase().includes(this.negativeKeywords[k].toLowerCase()) == true)
                            negativeMatch = false;
                    }
                    if (positiveMatch && negativeMatch) {
                        index = i;
                        break;
                    } else {
                        positiveMatch = true;
                        negativeMatch = true;
                    }
                }
                if (typeof index === 'undefined')
                    throw "Waiting for product"
                response.body.product = response.body.products[index]
                this.productTitle = response.body.product.title
                try {
                    this.imageURL = response.body.product.images[0].src
                } catch (error) {
                    console.log("No image")
                }
                await this.sendProductTitle(this.productTitle)
                if (this.size === "RS") {
                    this.productVariant = response.body.product.variants.sample().id;
                    console.log("Found product")
                    console.log(this.productVariant)
                    await this.send("Found product")
                    return;
                } else {
                    for (var i = 0; i < response.body.product.variants.length; i++) {
                        if (response.body.product.variants[i].title.includes(this.size)) {
                            this.productVariant = response.body.product.variants[i].id;
                            console.log("Found product")
                            await this.send("Found product")
                            return;
                        }
                    }
                }
                await this.send("Searching for product...")
                throw "Error finding variant"
            } catch (error) {
                await this.setDelays()
                if (error === "Error finding variant") {
                    await this.send("Waiting for size...")
                    await sleep(this.monitorDelay)
                    await this.findProductByKeywords()
                } else
                if (error === "Waiting for product") {
                    await this.send("Searching for product...")
                    await sleep(this.monitorDelay)
                    await this.findProductByKeywords()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 404) {
                        await this.send("Searching for product...")
                        await sleep(this.monitorDelay)
                        await this.findProductByKeywords()
                    } else {
                        await this.send("Error finding product: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.findProductByKeywords()
                    }
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error finding variant")
                    await sleep(this.errorDelay)
                    await this.findProductByKeywords()
                }
            }
        }
    }

    async findProductByLink() {
        const got = require('got');
        const tunnel = require('tunnel');
        this.cookie = "shopify_digest=" + await makeid(7)
        this.cookieJar.setCookie(this.cookie + '; Domain=' + this.plainLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', this.baseLink)
        if (this.stopped === "false") {
            await this.send("Searching for product...")
            try {
                this.request = {
                    method: 'get',
                    url: this.link + ".json",
                    cookieJar: this.cookieJar,
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
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
                if (this.site.includes("DSM Eflash")) {
                    this.request.url = this.link
                    this.request.responseType = 'text'
                }
                let response = await got(this.request);
                if (response.url.includes("/password"))
                    throw "Password page up"
                if (this.site.includes("DSM Eflash")) {
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    response.body = {}
                    response.body.product = JSON.parse(root.querySelector('[id="ProductJson-product-template"]').rawText)
                    console.log(response.body.product)
                }
                this.productTitle = response.body.product.title
                try {
                    this.imageURL = response.body.product.image.src
                } catch (error) {
                    console.log("No image")
                }
                await this.sendProductTitle(this.productTitle)
                if (this.size === "RS") {
                    this.productVariant = response.body.product.variants.sample().id;
                    console.log("Found product")
                    console.log(this.productVariant)
                    await this.send("Found product")
                    return;
                } else {
                    for (var i = 0; i < response.body.product.variants.length; i++) {
                        if (response.body.product.variants[i].title.includes(this.size)) {
                            this.productVariant = response.body.product.variants[i].id;
                            console.log("Found product")
                            await this.send("Found product")
                            return;
                        }
                    }
                }
                await this.send("Waiting for product")
                throw "Error finding variant"
            } catch (error) {
                await this.setDelays()
                if (error === "Error finding variant") {
                    await this.send("Waiting for size...")
                    await sleep(this.monitorDelay)
                    await this.findProductByLink()
                } else
                if (error === "Password page up") {
                    await this.send("Password page up")
                    await sleep(this.monitorDelay)
                    await this.findProductByLink()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 404) {
                        await this.send("Searching for product...")
                        await sleep(this.monitorDelay)
                        await this.findProductByLink()
                    } else {
                        await this.send("Error finding product: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.findProductByLink()
                    }
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error finding variant")
                    await sleep(this.errorDelay)
                    await this.findProductByLink()
                }
            }
        }
    }

    async addToCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Adding to cart...")
            try {
                this.request = {
                    method: 'post',
                    url: this.baseLink + '/cart/add.js',
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    body: querystring.encode({
                        'utf8': '\u2713',
                        'id': this.productVariant,
                        'quantity': '1'
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
                this.cartTotal = response.body.price
                this.cartTotal = this.cartTotal.toString()
                this.cartTotal = this.cartTotal.substring(0, this.cartTotal.length - 2)
                await this.send("Carted")
                this.url = this.baseLink + "/checkout"
                return;
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 422) {
                        await this.addToCart2()
                    } else {
                        await this.send("Error adding to cart: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.addToCart()
                    }
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected ATC error")
                    await sleep(this.errorDelay)
                    await this.addToCart()
                }
            }
        }
    }

    async addToCart2() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Adding to cart (2)...")
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/cart/" + this.productVariant + ":1",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
                    },
                    followRedirect: false
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                console.log(response.statusCode)
                console.log(root.querySelector("a").getAttribute("href"))
                console.log(response.body)
                if (response.body.includes("/checkpoint")) {
                    await this.send("Found checkpoint")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    if (this.stopped === "false")
                        await this.sendCaptchaCheckpoint()

                    if (this.stopped === "false")
                        await this.retrieveCaptchaResponse()

                    await this.addToCart2()
                } else {
                    this.url = root.querySelector("a").getAttribute("href") + "/stock_problems"
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.addToCart2()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading checkout")
                    await sleep(this.errorDelay)
                    await this.addToCart2()
                }
            }
        }
    }

    async loadCheckoutforPreload() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Loading checkout...")
            console.log(this.url)
            try {
                this.request = {
                    method: 'get',
                    url: this.url,
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
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
                console.log(response.statusCode)
                console.log(response.url)
                if (response.url.includes("/checkpoint")) {
                    await this.send("Found checkpoint")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    if (this.stopped === "false")
                        await this.sendCaptchaCheckpoint()

                    if (this.stopped === "false")
                        await this.retrieveCaptchaResponse()

                    await this.loadCheckoutforPreload()
                } else if (response.url.includes("/queue")) {
                    for (var i = 0; i < response.headers['set-cookie'].length; i++) {
                        if (response.headers['set-cookie'][i].includes("_checkout_queue_token")) {
                            this.checkoutQueueToken = response.headers['set-cookie'][i].split(";")[0].split("_checkout_queue_token=")[1]
                            break;
                        }
                    }
                    if (this.stopped === "false") {
                        await this.pollQueue()
                        await this.loadCheckoutforPreload()
                    }
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadCheckoutforPreload()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading checkout")
                    await sleep(this.errorDelay)
                    await this.loadCheckoutforPreload()
                }
            }
        }
    }

    async loadCheckout() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Loading checkout...")
            console.log(this.url)
            try {
                this.request = {
                    method: 'get',
                    url: this.url,
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
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
                console.log(response.statusCode)
                console.log(response.body)
                if (response.url.includes("/checkpoint")) {
                    await this.send("Found checkpoint")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    if (this.stopped === "false")
                        await this.sendCaptchaCheckpoint()

                    if (this.stopped === "false")
                        await this.retrieveCaptchaResponse()

                    await this.loadCheckout()
                } else if (response.url.includes("/queue")) {
                    for (var i = 0; i < response.headers['set-cookie'].length; i++) {
                        if (response.headers['set-cookie'][i].includes("_checkout_queue_token")) {
                            this.checkoutQueueToken = response.headers['set-cookie'][i].split(";")[0].split("_checkout_queue_token=")[1]
                            break;
                        }
                    }
                    if (this.stopped === "false") {
                        await this.pollQueue()
                        await this.loadCheckout()
                    }
                } else if (this.stopped === "false") {
                    this.checkoutURL = response.url
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.authToken = root.querySelector('[name="authenticity_token"]').getAttribute('value')
                    if (this.site === "Kith" || this.site === "Bape") {
                        this.test = "_method=patch&authenticity_token=" + this.authToken + "&previous_step=contact_information&step=shipping_method&checkout%5Bemail%5D=" + encodeURIComponent(this.profile.email) + "&checkout%5Bbuyer_accepts_marketing%5D=0&checkout%5Bbuyer_accepts_marketing%5D=1&checkout%5Bshipping_address%5D%5Bfirst_name%5D=&checkout%5Bshipping_address%5D%5Blast_name%5D=&checkout%5Bshipping_address%5D%5Baddress1%5D=&checkout%5Bshipping_address%5D%5Baddress2%5D=&checkout%5Bshipping_address%5D%5Bcity%5D=&checkout%5Bshipping_address%5D%5Bcountry%5D=&checkout%5Bshipping_address%5D%5Bprovince%5D=&checkout%5Bshipping_address%5D%5Bzip%5D=&checkout%5Bshipping_address%5D%5Bphone%5D="
                        this.test += "&checkout%5Bshipping_address%5D%5Bfirst_name%5D=" + this.profile.firstName //first name
                        this.test += "&checkout%5Bshipping_address%5D%5Blast_name%5D=" + this.profile.lastName //last name
                        this.test += "&checkout%5Bshipping_address%5D%5Baddress1%5D=" + this.profile.address1.replaceAll(" ", "+") //address 1
                        this.test += "&checkout%5Bshipping_address%5D%5Baddress2%5D=&checkout%5Bshipping_address%5D%5Bcity%5D=" + this.profile.city //city
                        this.test += "&checkout%5Bshipping_address%5D%5Bcountry%5D=" + this.profile.country.replaceAll(" ", "+") //country
                        this.test += "&checkout%5Bshipping_address%5D%5Bprovince%5D=" + abbrRegion(this.profile.state, 'abbr') //state
                        this.test += "&checkout%5Bshipping_address%5D%5Bzip%5D=" + this.profile.zipcode //zipcode
                        this.test += "&checkout%5Bshipping_address%5D%5Bphone%5D=" + "%28" + this.profile.phone.substring(0, 3) + "%29" + "+" + this.profile.phone.substring(3, 6) + "-" + this.profile.phone.substring(6) + "&" //phone number
                    } else {
                        this.test = "_method=patch&authenticity_token=" + this.authToken + "&previous_step=contact_information&step=shipping_method&checkout%5Bemail%5D=" + encodeURIComponent(this.profile.email) + "&checkout%5Bbuyer_accepts_marketing%5D=0&checkout%5Bbuyer_accepts_marketing%5D=1&checkout%5Bshipping_address%5D%5Bfirst_name%5D=&checkout%5Bshipping_address%5D%5Blast_name%5D=&checkout%5Bshipping_address%5D%5Bcompany%5D=&checkout%5Bshipping_address%5D%5Baddress1%5D=&checkout%5Bshipping_address%5D%5Baddress2%5D=&checkout%5Bshipping_address%5D%5Bcity%5D=&checkout%5Bshipping_address%5D%5Bcountry%5D=&checkout%5Bshipping_address%5D%5Bprovince%5D=&checkout%5Bshipping_address%5D%5Bzip%5D=&checkout%5Bshipping_address%5D%5Bphone%5D="
                        this.test += "&checkout%5Bshipping_address%5D%5Bfirst_name%5D=" + this.profile.firstName //first name
                        this.test += "&checkout%5Bshipping_address%5D%5Blast_name%5D=" + this.profile.lastName //last name
                        this.test += "&checkout%5Bshipping_address%5D%5Bcompany%5D=&checkout%5Bshipping_address%5D%5Baddress1%5D=" + this.profile.address1.replaceAll(" ", "+") //address 1
                        this.test += "&checkout%5Bshipping_address%5D%5Baddress2%5D=&checkout%5Bshipping_address%5D%5Bcity%5D=" + this.profile.city //city
                        this.test += "&checkout%5Bshipping_address%5D%5Bcountry%5D=" + this.profile.country.replaceAll(" ", "+") //country
                        this.test += "&checkout%5Bshipping_address%5D%5Bprovince%5D=" + abbrRegion(this.profile.state, 'abbr') //state
                        this.test += "&checkout%5Bshipping_address%5D%5Bzip%5D=" + this.profile.zipcode //zipcode
                        this.test += "&checkout%5Bshipping_address%5D%5Bphone%5D=" + "%28" + this.profile.phone.substring(0, 3) + "%29" + "+" + this.profile.phone.substring(3, 6) + "-" + this.profile.phone.substring(6) //phone
                        this.test += "&checkout%5Bremember_me%5D=false&checkout%5Bremember_me%5D=0&checkout%5Battributes%5D%5BI-agree-to-the-Terms-and-Conditions%5D=Yes&"
                    }
                    if (this.stopped === "false")
                        await this.send("Loaded checkout")
                    if (this.captchaResponse != 'none') {
                        this.fscount = root.querySelector('[value="fs_count"]').getAttribute('name')
                        this.searchBy = this.fscount.split("-count")[0]
                        this.searchBy = "#fs_" + this.searchBy
                        var count = 0;
                        this.values = root.querySelector(this.searchBy)
                        for (var i = 0; i < this.values.childNodes.length; i++) {
                            if (this.values.childNodes[i].tagName === "TEXTAREA") {
                                count++;
                                var id = this.values.childNodes[i].getAttribute('id')
                                this.shippingPayload[id] = "";
                            }
                        }

                        this.test2 = querystring.encode(this.shippingPayload)
                        var totalfscount = "&" + this.fscount + "=" + count
                        totalfscount = totalfscount + "&" + this.fscount + "=fs_count"
                        this.test2 = this.test2 + totalfscount
                        this.shippingPayload = this.test + this.test2
                        this.shippingPayload = this.shippingPayload + "&checkout%5Bclient_details%5D%5Bbrowser_width%5D=1583&checkout%5Bclient_details%5D%5Bbrowser_height%5D=789&checkout%5Bclient_details%5D%5Bjavascript_enabled%5D=1&checkout%5Bclient_details%5D%5Bcolor_depth%5D=24&checkout%5Bclient_details%5D%5Bjava_enabled%5D=false&checkout%5Bclient_details%5D%5Bbrowser_tz%5D=240"
                        console.log("Shipping payload here")
                        console.log(this.shippingPayload)
                    } else {
                        this.shippingPayload = querystring.encode({
                            "_method": "patch",
                            "previous_step": "contact_information",
                            "step": "shipping_method",
                            "authenticity_token": this.authToken,
                            "checkout[email]": this.profile.email,
                            "checkout[buyer_accepts_marketing]": "0",
                            "checkout[shipping_address][first_name]": this.profile.firstName,
                            "checkout[shipping_address][last_name]": this.profile.lastName,
                            "checkout[shipping_address][address1]": this.profile.address1,
                            "checkout[shipping_address][address2]": "",
                            "checkout[shipping_address][city]": this.profile.city,
                            "checkout[shipping_address][country]": this.profile.country,
                            "checkout[shipping_address][province]": abbrRegion(this.profile.state, 'abbr'),
                            "checkout[shipping_address][zip]": this.profile.zipcode,
                            "checkout[client_details][browser_width]": "1087",
                            "checkout[client_details][browser_height]": "814",
                            "checkout[client_details][javascript_enabled]": "1",
                            "checkout[client_details][color_depth]": "24",
                            "checkout[client_details][java_enabled]": "false",
                            "checkout[client_details][browser_tz]": "300",
                            "checkout[attributes][I-agree-to-the-Terms-and-Conditions]": "Yes",
                            "checkout[shipping_address][phone]": this.profile.phone
                        })
                        console.log(this.shippingPayload)
                    }
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading checkout")
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                }
            }
        }
    }

    async sendCaptchaCheckpoint() {
        const got = require('got');
        if (this.stopped === "false") {
            let response = await got({
                method: 'post',
                url: 'http://localhost:4444/venetia/addtoQueue',
                json: {
                    "siteURL": this.baseLink + "/checkpoint",
                    "captchaType": "shopifyCheckpoint",
                    "sessionCookies": this.cookieJar,
                    "taskProxy": this.proxy
                },
                responseType: 'json'
            })
            await this.send("Waiting for captcha")
            this.captchaTaskId = response.body.id
            return;
        }
    }

    async pollQueue() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Polling queue...")
            try {
                this.request = {
                    method: 'post',
                    url: this.baseLink + "/queue/poll",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/json',
                        'accept': '*/*',
                        'origin': this.baseLink,
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': this.baseLink + '/throttle/queue',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    json: {
                        "query": "\n      {\n        poll(token: $token) {\n          token\n          pollAfter\n          queueEtaSeconds\n          productVariantAvailability {\n            id\n            available\n          }\n        }\n      }\n    ",
                        "variables": {
                            "token": this.checkoutQueueToken
                        },
                    },
                    responseType: 'json'
                }
                console.log(this.request)
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                console.log(response.body)
                this.checkoutQueueToken = response.body.data.poll.token
                var now = new Date(Date.now())
                var then = new Date(response.body.data.poll.pollAfter)
                await this.send("In queue - ETA: " + response.body.data.poll.queueEtaSeconds + "s")
                await sleep(Math.abs(then - now))
                if (response.body.data.poll['__typename'] === "PollContinue")
                    await this.pollQueue()
                else if (response.body.data.poll['__typename'] === "PollComplete")
                    return;
                else
                    throw ("Error polling queue")
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error polling queue: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.pollQueue()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error polling queue")
                    await sleep(this.errorDelay)
                    await this.pollQueue()
                }
            }
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
                if (response.body.completed == true) {
                    this.captchaResponse = response.body.captchaResponse.captcha
                    const tough = require('tough-cookie')
                    this.cookieJar = new tough.CookieJar()
                    for (var i = 0; i < response.body.cookies.length; i++) {
                        this.cookieJar.setCookie(new tough.Cookie({
                            "key": response.body.cookies[i].name,
                            "value": response.body.cookies[i].value,
                        }), this.baseLink)
                    }
                } else
                    throw "Captcha not ready"
            } catch (error) {
                await sleep(500)
                await this.retrieveCaptchaResponse()
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
                    url: this.checkoutURL,
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
                    },
                    body: this.shippingPayload,
                    followRedirect: false
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                console.log("Shipping submitted here")
                console.log(response.body)
                console.log(response.statusCode)
                if (this.stopped === "false")
                    await this.send("Submitted shipping")
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting shipping: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting shipping")
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                }
            }
        }
    }

    async loadShippingRate() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Loading rates...")
            try {
                this.request = {
                    method: 'get',
                    url: this.checkoutURL + "?previous_step=contact_information&step=shipping_method",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
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
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (typeof root.querySelectorAll(".input-radio")[0] !== 'undefined') {
                    this.shippingRate = root.querySelectorAll(".input-radio")[0].getAttribute("value")
                    if (this.captchaResponse != 'none') {
                        if (this.site === "Kith")
                            this.test2 = "_method=patch&authenticity_token=" + this.authToken + "&previous_step=shipping_method&step=payment_method&checkout%5Bshipping_rate%5D%5Bid%5D=" + encodeURIComponent(this.shippingRate)
                        else
                            this.test2 = "_method=patch&authenticity_token=" + this.authToken + "&previous_step=shipping_method&step=payment_method&checkout%5Bshipping_rate%5D%5Bid%5D=" + encodeURIComponent(this.shippingRate) + "&checkout%5Battributes%5D%5BI-agree-to-the-Terms-and-Conditions%5D=Yes"
                        this.fscount = root.querySelector('[value="fs_count"]').getAttribute('name')
                        this.searchBy = this.fscount.split("-count")[0]
                        this.searchBy = "#fs_" + this.searchBy
                        var count = 0;
                        this.fscountvalues = ""
                        this.values = root.querySelector(this.searchBy)
                        for (var i = 0; i < this.values.childNodes.length; i++) {
                            if (this.values.childNodes[i].tagName === "TEXTAREA") {
                                count++;
                                this.fscountvalues += "&" + this.values.childNodes[i].getAttribute('id') + "="
                            }
                        }
                        this.test2 += this.fscountvalues
                        this.test2 += "&" + this.fscount + "=" + count + "&" + this.fscount + "=" + "fs_count" + "&checkout%5Bclient_details%5D%5Bbrowser_width%5D=1263&checkout%5Bclient_details%5D%5Bbrowser_height%5D=913&checkout%5Bclient_details%5D%5Bjavascript_enabled%5D=1&checkout%5Bclient_details%5D%5Bcolor_depth%5D=24&checkout%5Bclient_details%5D%5Bjava_enabled%5D=false&checkout%5Bclient_details%5D%5Bbrowser_tz%5D=240"
                        this.shippingRatePayload = this.test2
                        console.log("Shipping rate payload here")
                        console.log(this.shippingRatePayload)
                    } else {
                        this.shippingRatePayload = querystring.encode({
                            '_method': 'patch',
                            'authenticity_token': this.authToken,
                            'previous_step': 'shipping_method',
                            'step': 'payment_method',
                            'checkout[shipping_rate][id]': this.shippingRate,
                            'checkout[attributes][I-agree-to-the-Terms-and-Conditions]': 'Yes',
                            'checkout[client_details][browser_width]': '1583',
                            'checkout[client_details][browser_height]': '757',
                            'checkout[client_details][javascript_enabled]': '1',
                            'checkout[client_details][color_depth]': '24',
                            'checkout[client_details][java_enabled]': 'false',
                            'checkout[client_details][browser_tz]': '240'
                        })
                        console.log(this.shippingRatePayload)
                    }
                } else {
                    await sleep(300)
                    await this.loadShippingRate()
                }
                await this.send("Loaded rates")
                return;
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error loading rates: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadShippingRate()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading rates")
                    await sleep(this.errorDelay)
                    await this.loadShippingRate()
                }
            }
        }
    }

    async submitRate() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Submitting rate...")
            try {
                this.request = {
                    method: 'post',
                    url: this.checkoutURL,
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
                    },
                    body: this.shippingRatePayload,
                    followRedirect: false
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                console.log("submitted shipping rate here")
                console.log(response.body)
                console.log(response.statusCode)
                if (this.stopped === "false") {
                    await this.send("Submitted rate")
                    await this.submitCard()
                }
                return;
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting rate: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitRate()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting rate")
                    await sleep(this.errorDelay)
                    await this.submitRate()
                }
            }
        }
    }

    async loadPayment() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Loading payment...")
            try {
                this.request = {
                    method: 'get',
                    url: this.checkoutURL + "?previous_step=shipping_method&step=payment_method",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
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
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (root.querySelector('[name="checkout[payment_gateway]"]') != null) {
                    console.log(response.body)
                    this.paymentGateway = root.querySelector('[name="checkout[payment_gateway]"]').getAttribute('value')
                    this.totalPrice = root.querySelector('[name="checkout[total_price]"]').getAttribute('value')
                    if (this.captchaResponse != 'none') {
                        this.test3 = "_method=patch&authenticity_token=" + this.authToken + "&previous_step=payment_method&step=&s=" + this.encryptedPayment
                        this.fscount = root.querySelector('[value="fs_count"]').getAttribute('name')
                        this.searchBy = this.fscount.split("-count")[0]
                        this.searchBy = "#fs_" + this.searchBy
                        var count = 0;
                        this.values = root.querySelector(this.searchBy)
                        this.fscountvalues2 = ""
                        for (var i = 0; i < this.values.childNodes.length; i++) {
                            if (this.values.childNodes[i].tagName === "TEXTAREA") {
                                count++;
                                this.fscountvalues2 += "&" + this.values.childNodes[i].getAttribute('id') + "="
                            }
                        }
                        this.test3 += this.fscountvalues2
                        this.test3 += "&" + this.fscount + "=" + count + "&" + this.fscount + "=" + "fs_count"
                        this.test3 += "&checkout%5Bpayment_gateway%5D=" + this.paymentGateway + "&checkout%5Bcredit_card%5D%5Bvault%5D=false&checkout%5Bdifferent_billing_address%5D=false&checkout%5Btotal_price%5D=" + this.totalPrice + "&complete=1&checkout%5Bclient_details%5D%5Bbrowser_width%5D=1263&checkout%5Bclient_details%5D%5Bbrowser_height%5D=913&checkout%5Bclient_details%5D%5Bjavascript_enabled%5D=1&checkout%5Bclient_details%5D%5Bcolor_depth%5D=24&checkout%5Bclient_details%5D%5Bjava_enabled%5D=false&checkout%5Bclient_details%5D%5Bbrowser_tz%5D=240"
                        this.paymentPayload = this.test3
                        console.log("payment payload hhere")
                        console.log(this.paymentPayload)
                    } else {
                        this.paymentPayload = querystring.encode({
                            '_method': 'patch',
                            'authenticity_token': this.authToken,
                            'previous_step': 'payment_method',
                            'step': '',
                            's': this.encryptedPayment,
                            'checkout[payment_gateway]': this.paymentGateway,
                            'checkout[credit_card][vault]': 'false',
                            'checkout[different_billing_address]': 'false',
                            'checkout[attributes][I-agree-to-the-Terms-and-Conditions]': 'Yes',
                            'checkout[total_price]': this.totalPrice,
                            'complete': '1',
                            'checkout[client_details][browser_width]': '1583',
                            'checkout[client_details][browser_height]': '757',
                            'checkout[client_details][javascript_enabled]': '1',
                            'checkout[client_details][color_depth]': '24',
                            'checkout[client_details][java_enabled]': 'false',
                            'checkout[client_details][browser_tz]': '240'
                        })
                        console.log(this.paymentPayload)
                    }
                } else if (this.mode === "Launch" || this.mode === "Restock") {
                    await sleep(this.monitorDelay)
                    await this.loadPayment()
                } else {
                    await sleep(300)
                    await this.loadPayment()
                }
                if (this.stopped === "false")
                    await this.send("Loaded payment")
                return;
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error loading payment: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadPayment()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading payment")
                    await sleep(this.errorDelay)
                    await this.loadPayment()
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
                    method: 'post',
                    url: this.checkoutURL,
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
                    },
                    body: this.paymentPayload
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (root.querySelector("title") != null && root.querySelector("title").rawText.includes("Error"))
                    throw "Error submitting order"
                if (this.stopped === "false" && response.statusCode == 200) {
                    console.log(response.url)
                    await this.send("Submitted order")
                    console.log(this.checkoutURL)
                    await this.send("Processing...")
                    await sleep(4000)
                }
            } catch (error) {
                await this.setDelays()
                if (error === "Error submitting order") {
                    await this.send("Error submitting order")
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting order: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting order")
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                }
            }
        }
    }

    async processPayment() {
        const got = require('got');
        const tunnel = require('tunnel');
        console.log(this.checkoutURL)
        if (this.stopped === "false") {
            await this.send("Processing...")
            try {
                this.request = {
                    method: 'get',
                    url: this.checkoutURL + "/processing",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
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
                console.log("body")
                console.log(response.body)
                console.log("status")
                console.log(response.statusCode)
                console.log("url")
                console.log(response.redirectUrls)
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (root.querySelector("title") != null && root.querySelector("title").rawText.includes("Processing")) {
                    await this.send("Processing...")
                    await sleep(4000)
                    await this.processPayment()
                } else {
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 429) {
                        await this.send("Checkout failed")
                        await this.sendFailError()
                    } else {
                        await this.send("Error processing: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.processPayment()
                    }
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error processing")
                    await sleep(this.errorDelay)
                    await this.processPayment()
                }
            }
        }
    }


    async checkOrder() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Checking order...")
            try {
                this.request = {
                    method: 'get',
                    url: this.checkoutURL + "/thank_you",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
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
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (root.querySelector("title") != null && root.querySelector("title").rawText.includes("Payment") || (response.body === "")) {
                    await this.send("Checkout failed")
                    await this.sendFail()
                } else if (root.querySelector("title") != null && root.querySelector("title").rawText.includes("Thank")) {
                    await this.send("Check email")
                    await this.sendSuccess()
                } else {
                    await sleep(3000)
                    await this.checkOrder()
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error checking: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.checkOrder()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error checking")
                    await sleep(this.errorDelay)
                    await this.checkOrder()
                }
            }
        }
    }

    async findProduct() {
        if (this.searchMethod === "link")
            await this.findProductByLink()
        else if (this.searchMethod === "variant")
            await this.findProductByVariant()
        else if (this.searchMethod === "keywords")
            await this.findProductByKeywords()
    }

    async stopTask() {
        this.stopped = "true";
        await this.sendProductTitle(this.link)
        console.log("Stopped")
        this.send("Stopped")
    }

    returnID() {
        return this.taskId;
    }

    async setDelays() {
        var fs = require('fs');
        var path = require('path')
        const electron = require('electron');
        const configDir = (electron.app || electron.remote.app).getPath('userData');
        var delays = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/delays.json'), 'utf8'));
        var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), 'utf8'));
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
        await this.send("Started")
        await this.setDelays()

        if (this.accounts != "-") {
            if (this.stopped === "false")
                await this.login()

            if (this.stopped === "false")
                await this.clearCart()
        }

        if (this.mode === "Restock") {

            if (this.stopped === "false")
                await this.findRandomItem()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.loadCheckout()

            if (this.stopped === "false")
                await this.submitShipping()

            if (this.stopped === "false")
                await this.loadShippingRate()

            if (this.stopped === "false")
                await this.submitRate()

            if (this.stopped === "false")
                await this.loadPayment()

            if (this.stopped === "false")
                await this.clearCart()

            if (this.stopped === "false")
                await this.findProduct()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.loadPayment()

            if (this.stopped === "false")
                await this.submitOrder()

            if (this.stopped === "false")
                await this.processPayment()

            if (this.stopped === "false")
                await this.checkOrder()
        }

        if (this.mode === "Launch") {
            if (this.stopped === "false")
                await this.waitForCheckpoint()

            if (this.stopped === "false")
                await this.findRandomItem()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.loadCheckout()

            if (this.stopped === "false")
                await this.submitShipping()

            if (this.stopped === "false")
                await this.loadShippingRate()

            if (this.stopped === "false")
                await this.submitRate()

            if (this.stopped === "false")
                await this.loadPayment()

            if (this.stopped === "false")
                await this.clearCart()

            if (this.stopped === "false")
                await this.findProduct()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.loadPayment()

            if (this.stopped === "false")
                await this.submitOrder()

            if (this.stopped === "false")
                await this.processPayment()

            if (this.stopped === "false")
                await this.checkOrder()
        }

        if (this.mode === "Preload") {
            if (this.stopped === "false")
                await this.findRandomItem()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.loadCheckoutforPreload()

            if (this.stopped === "false")
                await this.clearCart()

            if (this.stopped === "false")
                await this.findProduct()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.loadCheckout()

            if (this.stopped === "false")
                await this.submitShipping()

            if (this.stopped === "false")
                await this.loadShippingRate()

            if (this.stopped === "false")
                await this.submitRate()

            if (this.stopped === "false")
                await this.loadPayment()

            if (this.stopped === "false")
                await this.submitOrder()

            if (this.stopped === "false")
                await this.processPayment()

            if (this.stopped === "false")
                await this.checkOrder()
        }

        if (this.mode === "Safe") {
            if (this.stopped === "false")
                await this.findProduct()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.loadCheckout()

            if (this.stopped === "false")
                await this.submitShipping()

            if (this.stopped === "false")
                await this.loadShippingRate()

            if (this.stopped === "false")
                await this.submitRate()

            if (this.stopped === "false")
                await this.loadPayment()

            if (this.stopped === "false")
                await this.submitOrder()

            if (this.stopped === "false")
                await this.processPayment()

            if (this.stopped === "false")
                await this.checkOrder()
        }
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


function getAccountInfo(accounts) {
    if (accounts === "-") {
        return "-"
    }
    var fs = require('fs');
    var path = require('path')
    const electron = require('electron');

    const configDir = (electron.app || electron.remote.app).getPath('userData');

    var str = fs.readFileSync(path.join(configDir, '/userdata/accounts.json'), 'utf8');
    var x = JSON.parse(str)
    for (var i = 0; i < x.length; i++) {
        if (x[i].name === accounts) {
            return x[i].account.sample()
        }
    }
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


async function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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