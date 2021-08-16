module.exports = class ShopifyTask {
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
        this.checkoutURL;
        this.proxyListName = taskInfo.proxies;
        this.accountName = taskInfo.accounts
        this.cartTotal;
        this.monitorDelay;
        this.errorDelay;
        this.encryptedcard;
        this.checkpointPayload = ""
        const tough = require('tough-cookie')
        this.finishedSubmittingCheckpoint = false;
        this.cookieJar = new tough.CookieJar()
        this.accounts = getAccountInfo(taskInfo.accounts, this.configDir)
        this.profile = getProfileInfo(taskInfo.profile, this.configDir)
        this.setAbbreviations()
        this.proxyArray = getProxyInfo(taskInfo.proxies, this.configDir)
        this.proxy = this.proxyArray.sample()
        this.baseLink = taskInfo.baseLink
        this.shippingPayload = {}
        this.shippingRatePayload = {}
        this.paymentPayload = {}
        this.captchaResponse = "none"
        this.cartLink = this.baseLink + "/cart"
        this.plainLink = this.baseLink.split("https://")[1]
        this.oglink = this.link
        if (this.link.includes("*")) {
            this.quantity = this.link.split("*")[1].trim()
            this.link = this.link.split("*")[0].trim()
        } else {
            this.quantity = 1
        }
        this.insecurelink = "http://" + this.plainLink
        if (this.link.startsWith("http") && this.link.includes(this.cartLink) == false) {
            if (this.link.includes("?"))
                this.link = this.link.split("?")[0]
            this.searchMethod = "link"
        } else if (this.link.includes(this.cartLink) == true) {
            this.link = this.link.split("/cart/")[1].split(":")[0]
            this.searchMethod = "variant"
        } else if (this.link.includes(",") == false && this.link.length == 14 && /^\d+$/.test(this.link)) {
            this.searchMethod = "variant"
        } else {
            this.searchMethod = "keywords"
            this.keywords = this.link.split(",")
            this.positiveKeywords = []
            this.negativeKeywords = []
            for (var i = 0; i < this.keywords.length; i++) {
                if (this.keywords[i].trim().startsWith("-"))
                    this.negativeKeywords.push(this.keywords[i].trim().substring(1))
                else
                    this.positiveKeywords.push(this.keywords[i].trim())
            }
        }
    }

    async editTask(changedFields) {
        if (typeof changedFields.size != 'undefined') {
            this.size = changedFields.size.sample()
        }

        if (typeof changedFields.link != 'undefined') {
            this.oglink = changedFields.link
            this.link = changedFields.link
            await this.sendProductTitle(this.oglink)
            if (this.link.includes("*")) {
                this.quantity = this.link.split("*")[1].trim()
                this.link = this.link.split("*")[0].trim()
            } else {
                this.quantity = 1
            }
            if (this.link.startsWith("http") && this.link.includes(this.cartLink) == false) {
                if (this.link.includes("?"))
                    this.link = this.link.split("?")[0]
                this.searchMethod = "link"
            } else if (this.link.includes(this.cartLink) == true) {
                this.link = this.link.split("/cart/")[1].split(":")[0]
                this.searchMethod = "variant"
            } else if (this.link.includes(",") == false && this.link.length == 14 && /^\d+$/.test(this.link)) {
                this.searchMethod = "variant"
            } else {
                this.searchMethod = "keywords"
                this.keywords = this.link.split(",")
                this.positiveKeywords = []
                this.negativeKeywords = []
                for (var i = 0; i < this.keywords.length; i++) {
                    if (this.keywords[i].trim().startsWith("-"))
                        this.negativeKeywords.push(this.keywords[i].trim().substring(1))
                    else
                        this.positiveKeywords.push(this.keywords[i].trim())
                }
            }
        }

        if (typeof changedFields.profile != 'undefined') {
            this.profileName = changedFields.profile
            this.profile = getProfileInfo(changedFields.profile, this.configDir)
            this.setAbbreviations()
        }

        if (typeof changedFields.proxies != 'undefined') {
            this.proxyListName = changedFields.proxies
            this.proxyArray = getProxyInfo(changedFields.proxies, this.configDir)
            this.proxy = this.proxyArray.sample()
        }

        if (typeof changedFields.accounts != 'undefined') {
            this.accounts = getAccountInfo(changedFields.accounts, this.configDir)
        }

    }

    async sendFailError() {
        const got = require('got');
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=Shopify&input=" + this.baseLink + "/cart/" + this.productVariant + ":1"
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/fail',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.oglink,
                    "size": this.size,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
                    "image": this.imageURL,
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
                                    "value": this.oglink,
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

    async sendFail() {
        const got = require('got');
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=Shopify&input=" + this.baseLink + "/cart/" + this.productVariant + ":1"
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/fail',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.oglink,
                    "size": this.size,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
                    "image": this.imageURL,
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
                                    "value": this.oglink,
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
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=Shopify&input=" + this.baseLink + "/cart/" + this.productVariant + ":1"
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/success',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.oglink,
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
                                    "value": this.oglink,
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

    async formatCard() {
        await this.send("Formatting card...")
        if (this.profile.cardNumber.length == 16) {
            var x = this.profile.cardNumber
            var y = "";
            for (var i = 0; i < x.length; i = i + 4) {
                y += x.substring(i, i + 4)
                if (i != x.length - 1)
                    y += " "
            }
            this.profile.cardNumber = y;
        } else if (this.profile.cardNumber.length == 15) {
            var x = this.profile.cardNumber
            var y = ""
            y += x.substring(0, 4)
            y += " "
            y += x.substring(4, 10)
            y += " "
            y += x.substring(10)
            this.profile.cardNumber = y;
        } else {
            await this.send("Error invalid card length")
        }
    }

    async submitCard() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Presubmitting card...")
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
                if (this.stopped === "false")
                    await this.send("Submitted card")
                return;
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error submitting card: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitCard()
                } else if (this.stopped === "false") {
                    this.log(error)
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
                        'accept-language': 'en-US,en;q=0.9'
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
                if (response.body.includes("/login"))
                    throw ("Error logging in")
            } catch (error) {
                await this.setDelays()
                if (error === "Error logging in") {
                    await this.send("Account error logging in")
                    await sleep(this.errorDelay)
                    await this.login()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error logging in: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.login()
                } else if (this.stopped === "false") {
                    this.log(error)
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
        this.cookie = "shopify_digest=" + await makeid(7)
        this.cookieJar.setCookie(this.cookie + '; Domain=' + this.plainLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', this.baseLink)
        if (this.stopped === "false") {
            await this.send("Preloading item...")
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
                this.productVariant = response.body.products.sample().variants.sample().id
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error preloading: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.findRandomItem()
                } else if (this.stopped === "false") {
                    this.log(error)
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
                    url: this.baseLink + "/checkpoint",
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
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
                if (response.body.includes("default_checkpoint") == true)
                    throw "Waiting for checkpoint"
            } catch (error) {
                await this.setDelays()
                if (error === "Waiting for checkpoint") {
                    await this.send("Waiting for checkpoint...")
                    await sleep(this.monitorDelay)
                    await this.waitForCheckpoint()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error waiting: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.waitForCheckpoint()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error waiting")
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
                    this.log(error.response.body)
                    await this.send("Error clearing cart: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.clearCart()
                } else if (this.stopped === "false") {
                    this.log(error)
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
            await this.send("Monitoring keywords...")
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
                    this.log("No image")
                }
                await this.sendProductTitle(this.productTitle)
                if (this.size === "RS") {
                    this.productVariant = response.body.product.variants.sample().id;
                    await this.send("Found product")
                    return;
                } else {
                    for (var i = 0; i < response.body.product.variants.length; i++) {
                        if (response.body.product.variants[i].title.includes(this.size)) {
                            this.productVariant = response.body.product.variants[i].id;
                            await this.send("Found product")
                            return;
                        }
                    }
                }
                throw "Error finding variant"
            } catch (error) {
                await this.setDelays()
                if (error === "Error finding variant") {
                    await this.send("Waiting for size...")
                    await sleep(this.monitorDelay)
                    await this.findProduct()
                } else
                if (error === "Waiting for product") {
                    await sleep(this.monitorDelay)
                    await this.findProduct()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 404) {
                        await sleep(this.monitorDelay)
                        await this.findProduct()
                    } else {
                        await this.send("Error finding product: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.findProduct()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error finding variant")
                    await sleep(this.errorDelay)
                    await this.findProduct()
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
            console.log(this.size)
            await this.send("Monitoring link...")
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
                if (this.site.includes("DSM Eflash") || this.site.includes("Travis Scott")) {
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
                } else if (this.site.includes("Travis Scott")) {
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    var x = response.body
                    x = x.split(`window.ShopifyAnalytics = window.ShopifyAnalytics || {};
window.ShopifyAnalytics.meta = window.ShopifyAnalytics.meta || {};
window.ShopifyAnalytics.meta.currency = 'USD';
var meta = `)[1].split(`;
for (var attr in meta) {
  window.ShopifyAnalytics.meta[attr] = meta[attr];
}`)[0]
                    x = JSON.parse(x)
                    if (this.size === "RS") {
                        var variant = x.product.variants.sample()
                        this.productVariant = variant.id;
                        this.productTitle = variant.name
                        await this.sendProductTitle(this.productTitle)
                    } else {
                        for (var i = 0; i < x.product.variants.length; i++) {
                            if (x.product.variants[i]['public_title'].includes(this.size)) {
                                this.productVariant = x.product.variants[i].id
                                this.productTitle = x.product.variants[i].name
                                await this.sendProductTitle(this.productTitle)
                                break;
                            }
                        }
                    }
                    await this.send("Found product")
                    return;
                }
                this.productTitle = response.body.product.title
                try {
                    this.imageURL = response.body.product.image.src
                } catch (error) {
                    this.log("No image")
                }
                await this.sendProductTitle(this.productTitle)
                if (this.size === "RS") {
                    this.productVariant = response.body.product.variants.sample().id;
                    await this.send("Found product")
                    return;
                } else {
                    for (var i = 0; i < response.body.product.variants.length; i++) {
                        if (response.body.product.variants[i].title.includes(this.size)) {
                            this.productVariant = response.body.product.variants[i].id;
                            await this.send("Found product")
                            return;
                        }
                    }
                }
                throw "Error finding variant"
            } catch (error) {
                await this.setDelays()
                if (error === "Error finding variant") {
                    await this.send("Waiting for size...")
                    await sleep(this.monitorDelay)
                    await this.findProduct()
                } else
                if (error === "Password page up") {
                    await this.send("Password page up")
                    await sleep(this.monitorDelay)
                    await this.findProduct()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 404) {
                        await sleep(this.monitorDelay)
                        await this.findProduct()
                    } else {
                        this.log(error.response.body)
                        await this.send("Error finding product: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.findProduct()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error finding variant")
                    await sleep(this.errorDelay)
                    await this.findProduct()
                }
            }
        }
    }

    async findProductByVariant() {
        const got = require('got');
        const tunnel = require('tunnel');
        this.cookie = "shopify_digest=" + await makeid(7)
        this.cookieJar.setCookie(this.cookie + '; Domain=' + this.plainLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', this.baseLink)
        if (this.stopped === "false") {
            await this.send("Monitoring variant...")
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/variants/" + this.link + ".js",
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
                if (response.url.includes("/password"))
                    throw "Password page up"
                this.productTitle = response.body.name
                this.productVariant = response.body.id
                await this.sendProductTitle(this.productTitle)
            } catch (error) {
                await this.setDelays()
                if (error === "Password page up") {
                    await this.send("Password page up")
                    await sleep(this.monitorDelay)
                    await this.findProduct()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 404) {
                        await sleep(this.monitorDelay)
                        await this.findProduct()
                    } else {
                        this.log(error.response.body)
                        await this.send("Error finding product: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.findProduct()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error finding variant")
                    await sleep(this.errorDelay)
                    await this.findProduct()
                }
            }
        }
    }

    async addToCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            this.log(this.productVariant)
            await this.send("Adding to cart...")
            try {
                this.request = {
                    method: 'post',
                    url: this.baseLink + '/cart/add.js',
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
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
                        'quantity': this.quantity
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
                await this.send("Carted")
                for (var i = 0; i < response.headers['set-cookie'].length; i++) {
                    if (response.headers['set-cookie'][i].includes("cart=")) {
                        this.cartToken = response.headers['set-cookie'][i].split(";")[0].split("cart=")[1]
                        break;
                    }
                }
                return;
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error adding to cart: " + error.response.statusCode)
                    this.log(error.response.body)
                    await sleep(this.errorDelay)
                    await this.addToCart()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected ATC error")
                    await sleep(this.errorDelay)
                    await this.addToCart()
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
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/checkout",
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
                this.log(response.url)
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
                    this.log(error.response.body)
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadCheckoutforPreload()
                } else if (this.stopped === "false") {
                    this.log(error)
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
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/checkout",
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
                } else if (response.headers['content-location'] != null && response.headers['content-location'].includes("/login") && this.stopped === "false") {
                    throw "Error: Account required"
                } else if (response.headers['content-location'] != null && response.headers['content-location'].includes("/stock_problems") && this.stopped === "false") {
                    throw "Waiting for restock"
                } else if (this.stopped === "false") {
                    this.checkoutURL = response.url
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.authToken = root.querySelector('[name="authenticity_token"]').getAttribute('value')
                    if (this.stopped === "false")
                        await this.send("Loaded checkout")
                    this.test = "_method=patch" //patch
                    this.test += "&authenticity_token=" + this.authToken //auth token
                    this.test += "&previous_step=contact_information" //previous step
                    this.test += "&step=shipping_method" //shipping method
                    if (root.querySelector('[id="checkout_email_or_phone"]') != null) {
                        this.test += "&checkout%5Bemail_or_phone%5D=" + encodeURIComponent(this.profile.email)
                    } else {
                        this.test += "&checkout%5Bemail%5D=" + encodeURIComponent(this.profile.email) //email
                    }
                    this.test += "&checkout%5Bbuyer_accepts_marketing%5D=0"
                    this.test += "&checkout%5Bbuyer_accepts_marketing%5D=1"
                    if (root.querySelector('[id="checkout_pick_up_in_store_selected"]') != null) {
                        this.test += "&checkout%5Bpick_up_in_store%5D%5Bselected%5D=false" //delivery
                        this.test += "&checkout%5Bid%5D=delivery-shipping" //delivery
                    }
                    this.test += "&checkout%5Bshipping_address%5D%5Bfirst_name%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Blast_name%5D="
                    if (root.querySelector('[id="checkout_shipping_address_company"]') != null) {
                        this.test += "&checkout%5Bshipping_address%5D%5Bcompany%5D=" //company field
                    }
                    this.test += "&checkout%5Bshipping_address%5D%5Baddress1%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Baddress2%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Bcity%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Bcountry%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Bprovince%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Bzip%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Bphone%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Bfirst_name%5D=" + this.profile.firstName //first name
                    this.test += "&checkout%5Bshipping_address%5D%5Blast_name%5D=" + this.profile.lastName //last name
                    if (root.querySelector('[id="checkout_shipping_address_company"]') != null) {
                        this.test += "&checkout%5Bshipping_address%5D%5Bcompany%5D=" //company field
                    }
                    this.test += "&checkout%5Bshipping_address%5D%5Baddress1%5D=" + this.profile.address1.replaceAll(" ", "+") //address 1
                    this.test += "&checkout%5Bshipping_address%5D%5Baddress2%5D="
                    this.test += "&checkout%5Bshipping_address%5D%5Bcity%5D=" + this.profile.city.replaceAll(" ", "+") //city
                    this.test += "&checkout%5Bshipping_address%5D%5Bcountry%5D=" + this.profile.country.replaceAll(" ", "+") //country
                    this.test += "&checkout%5Bshipping_address%5D%5Bprovince%5D=" + this.stateCode //state
                    this.test += "&checkout%5Bshipping_address%5D%5Bzip%5D=" + this.profile.zipcode //zipcode
                    this.test += "&checkout%5Bshipping_address%5D%5Bphone%5D=" + "%28" + this.profile.phone.substring(0, 3) + "%29" + "+" + this.profile.phone.substring(3, 6) + "-" + this.profile.phone.substring(6) //phone number
                    if (root.querySelector('[id="checkout_remember_me"]') != null) {
                        this.test += "&checkout%5Bremember_me%5D=" //remember me
                        this.test += "&checkout%5Bremember_me%5D=0"
                    }
                    if (root.querySelector('[id="i-agree__checkbox"]') != null) {
                        this.test += "&checkout%5Battributes%5D%5BI-agree-to-the-Terms-and-Conditions%5D=Yes" //agree
                    }
                    if (root.querySelector('[value="fs_count"]') != null) {
                        this.test += "&"
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
                    } else {
                        this.shippingPayload = this.test
                    }
                    this.shippingPayload = this.shippingPayload + "&checkout%5Bclient_details%5D%5Bbrowser_width%5D=1583&checkout%5Bclient_details%5D%5Bbrowser_height%5D=789&checkout%5Bclient_details%5D%5Bjavascript_enabled%5D=1&checkout%5Bclient_details%5D%5Bcolor_depth%5D=24&checkout%5Bclient_details%5D%5Bjava_enabled%5D=false&checkout%5Bclient_details%5D%5Bbrowser_tz%5D=240"
                    this.log(this.shippingPayload)
                }
            } catch (error) {
                await this.setDelays()
                if (error === "Error: Account required") {
                    await this.send("Error: Account required")
                    this.stopped = "true"
                } else
                if (error === "Waiting for restock") {
                    await this.send("Waiting for restock")
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error loading checkout")
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                }
            }
        }
    }

    async sendCaptchaCheckpoint() {
        if (this.stopped === "false") {
            this.connection.send(JSON.stringify({
                event: "sendCaptcha",
                data: {
                    "captchaURL": this.baseLink + "/checkpoint",
                    "captchaType": "Shopify Checkpoint",
                    "sessionCookies": this.cookieJar,
                    "taskID": this.taskId,
                    "taskProxy": this.proxy,
                    "siteURL": this.baseLink
                }
            }))
            await this.send("Waiting for captcha...")
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
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request);
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
                    this.log(error.response.body)
                    await this.send("Error polling queue: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.pollQueue()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error polling queue")
                    await sleep(this.errorDelay)
                    await this.pollQueue()
                }
            }
        }
    }

    async pollQueueFast() {
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
                        'x-shopify-storefront-access-token': this.accessToken,
                    },
                    json: {
                        "query": "{ poll(token: $token) { token pollAfter } }",
                        "variables": {
                            "token": this.checkoutQueueToken
                        },
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
                this.checkoutQueueToken = response.body.data.poll.token
                var now = new Date(Date.now())
                var then = new Date(response.body.data.poll.pollAfter)
                await this.send("In queue")
                await sleep(Math.abs(then - now))
                if (response.body.data.poll['__typename'] === "PollContinue")
                    await this.pollQueueFast()
                else if (response.body.data.poll['__typename'] === "PollComplete")
                    return;
                else
                    throw ("Error polling queue")
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error polling queue: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.pollQueueFast()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error polling queue")
                    await sleep(this.errorDelay)
                    await this.pollQueueFast()
                }
            }
        }
    }

    async retrieveCaptchaResponse() {
        while (this.finishedSubmittingCheckpoint == false) {
            await sleep(100)
        }
        return;
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
                if (response.headers['content-location'] != null && response.headers['content-location'].includes("/stock_problems") && this.stopped === "false") {
                    throw "Waiting for restock"
                } else if (this.stopped === "false") {
                    await this.send("Submitted shipping")
                    this.log(response.statusCode)
                }
            } catch (error) {
                await this.setDelays()
                if (error === "Waiting for restock") {
                    await this.send("Waiting for restock")
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 404) {
                        await this.send("Waiting for restock")
                        await sleep(this.errorDelay)
                        await this.submitShipping()
                    } else {
                        this.log(error.response.body)
                        await this.send("Error submitting shipping: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.submitShipping()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
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
                if (response.url.includes("/checkpoint")) {
                    await this.send("Found checkpoint")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    if (this.stopped === "false")
                        await this.sendCaptchaCheckpoint()

                    if (this.stopped === "false")
                        await this.retrieveCaptchaResponse()

                    await this.loadShippingRate()
                } else if (response.url.includes("/queue")) {
                    for (var i = 0; i < response.headers['set-cookie'].length; i++) {
                        if (response.headers['set-cookie'][i].includes("_checkout_queue_token")) {
                            this.checkoutQueueToken = response.headers['set-cookie'][i].split(";")[0].split("_checkout_queue_token=")[1]
                            break;
                        }
                    }
                    if (this.stopped === "false") {
                        await this.pollQueue()
                        await this.loadShippingRate()
                    }
                } else if (response.headers['content-location'] != null && response.headers['content-location'].includes("/stock_problems") && this.stopped === "false") {
                    throw "Waiting for restock"
                } else
                if (typeof root.querySelectorAll(".input-radio")[0] !== 'undefined') {
                    this.shippingRate = root.querySelectorAll(".input-radio")[0].getAttribute("value")
                    this.test2 = "_method=patch" //patch
                    this.test2 += "&authenticity_token=" + this.authToken //auth token 
                    this.test2 += "&previous_step=shipping_method" //previous step
                    this.test2 += "&step=payment_method" //current step
                    this.test2 += "&checkout%5Bshipping_rate%5D%5Bid%5D=" + encodeURIComponent(this.shippingRate)
                    if (root.querySelector('[id="i-agree__checkbox"]') != null) {
                        this.test2 += "&checkout%5Battributes%5D%5BI-agree-to-the-Terms-and-Conditions%5D=Yes" // agree
                    }
                    if (root.querySelector('[value="fs_count"]') != null) {
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
                        this.test2 += "&" + this.fscount + "=" + count + "&" + this.fscount + "=" + "fs_count"
                    }
                    this.test2 += "&checkout%5Bclient_details%5D%5Bbrowser_width%5D=1263"
                    this.test2 += "&checkout%5Bclient_details%5D%5Bbrowser_height%5D=913"
                    this.test2 += "&checkout%5Bclient_details%5D%5Bjavascript_enabled%5D=1"
                    this.test2 += "&checkout%5Bclient_details%5D%5Bcolor_depth%5D=24"
                    this.test2 += "&checkout%5Bclient_details%5D%5Bjava_enabled%5D=false"
                    this.test2 += "&checkout%5Bclient_details%5D%5Bbrowser_tz%5D=240"
                    this.shippingRatePayload = this.test2
                    this.log(this.shippingRatePayload)
                } else {
                    await sleep(300)
                    await this.loadShippingRate()
                }
                if (this.stopped === "false")
                    await this.send("Loaded rates")
                return;
            } catch (error) {
                await this.setDelays()
                if (error === "Waiting for restock") {
                    await this.send("Waiting for restock")
                    await sleep(this.errorDelay)
                    await this.loadShippingRate()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error loading rates: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadShippingRate()
                } else if (this.stopped === "false") {
                    this.log(error)
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
                if (response.headers['content-location'] != null && response.headers['content-location'].includes("/stock_problems") && this.stopped === "false") {
                    throw "Waiting for restock"
                } else
                if (this.stopped === "false") {
                    await this.send("Submitted rate")
                    this.log(response.statusCode)
                }
            } catch (error) {
                await this.setDelays()
                if (error === "Waiting for restock") {
                    await this.send("Waiting for restock")
                    await sleep(this.errorDelay)
                    await this.submitRate()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 404) {
                        await this.send("Waiting for restock")
                        await sleep(this.errorDelay)
                        await this.submitRate()
                    } else {
                        this.log(error.response.body)
                        await this.send("Error submitting rate: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.submitRate()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
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
                if (response.url.includes("/checkpoint")) {
                    await this.send("Found checkpoint")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    if (this.stopped === "false")
                        await this.sendCaptchaCheckpoint()

                    if (this.stopped === "false")
                        await this.retrieveCaptchaResponse()

                    await this.loadPayment()
                } else if (response.url.includes("/queue")) {
                    for (var i = 0; i < response.headers['set-cookie'].length; i++) {
                        if (response.headers['set-cookie'][i].includes("_checkout_queue_token")) {
                            this.checkoutQueueToken = response.headers['set-cookie'][i].split(";")[0].split("_checkout_queue_token=")[1]
                            break;
                        }
                    }
                    if (this.stopped === "false") {
                        await this.pollQueue()
                        await this.loadPayment()
                    }
                } else if (response.headers['content-location'] != null && response.headers['content-location'].includes("/login") && this.stopped === "false") {
                    throw "Error: Account required"
                } else if (response.headers['content-location'] != null && response.headers['content-location'].includes("/stock_problems") && this.stopped === "false") {
                    await this.setDelays()
                    await this.send("OOS, retrying")
                    await sleep(this.monitorDelay)
                    await this.loadPayment()
                } else
                if (root.querySelector('[name="checkout[payment_gateway]"]') != null) {
                    this.paymentGateway = root.querySelector('[name="checkout[payment_gateway]"]').getAttribute('value')
                    this.totalPrice = root.querySelector('[name="checkout[total_price]"]').getAttribute('value')
                    this.cartTotal = this.totalPrice
                    this.cartTotal = this.cartTotal.toString()
                    this.cartTotal = this.cartTotal.substring(0, this.cartTotal.length - 2)
                    if (root.querySelector('[value="fs_count"]') != null) {
                        this.test3 = "_method=patch" //patch
                        this.test3 += "&authenticity_token=" + this.authToken //auth token
                        this.test3 += "&previous_step=payment_method" //previous step
                        this.test3 += "&step=" //final step
                        this.test3 += "&s=" + this.encryptedPayment //payment
                        if (root.querySelector('[value="fs_count"]') != null) {
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
                        }
                        this.test3 += "&checkout%5Bpayment_gateway%5D=" + this.paymentGateway //payment gateway
                        this.test3 += "&checkout%5Bcredit_card%5D%5Bvault%5D=false"
                        this.test3 += "&checkout%5Bdifferent_billing_address%5D=false"
                        if (root.querySelector('[id="post_purchase_page_requested"]') != null) {
                            this.test3 += "&checkout%5Bpost_purchase_page_requested%5D=0" //post purchase page requested
                        }
                        if (root.querySelector('[id="checkout_remember_me"]') != null) {
                            this.test3 += "&checkout%5Bremember_me%5D=" //remember me
                            this.test3 += "&checkout%5Bremember_me%5D=0"
                        }
                        if (root.querySelector('[id="checkout_vault_phone"]') != null) {
                            this.test3 += "&checkout%5Bvault_phone%5D=%2B1" + this.profile.phone //vault phone
                        }
                        this.test3 += "&checkout%5Btotal_price%5D=" + this.totalPrice //total price
                        this.test3 += "&complete=1"
                        this.test3 += "&checkout%5Bclient_details%5D%5Bbrowser_width%5D=1263"
                        this.test3 += "&checkout%5Bclient_details%5D%5Bbrowser_height%5D=913"
                        this.test3 += "&checkout%5Bclient_details%5D%5Bjavascript_enabled%5D=1"
                        this.test3 += "&checkout%5Bclient_details%5D%5Bcolor_depth%5D=24"
                        this.test3 += "&checkout%5Bclient_details%5D%5Bjava_enabled%5D=false"
                        this.test3 += "&checkout%5Bclient_details%5D%5Bbrowser_tz%5D=240"

                        this.paymentPayload = this.test3
                        this.log(this.paymentPayload)
                    } else {
                        if (typeof this.authToken === 'undefined')
                            this.authToken = root.querySelector('[name="authenticity_token"]').getAttribute('value')

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
                        this.log(this.paymentPayload)
                    }
                } else {
                    await sleep(300)
                    await this.loadPayment()
                }
                if (this.stopped === "false")
                    await this.send("Loaded payment")
                return;
            } catch (error) {
                await this.setDelays()
                if (error === "Error: Account required") {
                    await this.send("Error: Account required")
                    await sleep(this.errorDelay)
                    await this.loadPayment()
                }
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error loading payment: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadPayment()
                } else if (this.stopped === "false") {
                    this.log(error)
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
                var request = got(this.request)
                var timeout = setTimeout(() => request.cancel(), 15000);
                let response = await request;
                clearTimeout(timeout);
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (response.headers['content-location'] != null && response.headers['content-location'].includes("/process") && this.stopped === "false") {
                    await this.send("Submitted order")
                    this.log(this.checkoutURL)
                } else if (response.body.includes("Error")) {
                    throw "Error submitting order"
                } else throw "OOS, retrying"
            } catch (error) {
                await this.setDelays()
                if (error === "Promise was canceled") {
                    await this.send("Error: timed out")
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                } else
                if (error === "OOS, retrying") {
                    await this.send("OOS, retrying")
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                } else if (error === "Error submitting order") {
                    this.log(error.response.body)
                    await this.send("Error submitting order")
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 404) {
                        await this.send("Waiting for restock")
                        await sleep(this.errorDelay)
                        await this.submitOrder()
                    } else {
                        this.log(error.response.body)
                        await this.send("Error submitting order: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.submitOrder()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
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
        this.log(this.checkoutURL)
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
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (response.headers['content-location'] != null && response.headers['content-location'].includes("/thank") && this.stopped === "false") {
                    await this.send("Check email")
                    await this.sendSuccess()
                } else
                if (response.headers['content-location'] != null && response.headers['content-location'].includes("/process") && this.stopped === "false") {
                    await this.send("Processing...")
                    await sleep(2000)
                    await this.processPayment()
                } else if (response.headers['content-location'] == null) {
                    await this.send("Processing...")
                    await sleep(2000)
                    await this.processPayment()
                } else if (response.headers['content-location'] != null && response.headers['content-location'].includes(this.checkoutURL) && this.stopped === "false") {
                    await this.send("Checkout failed")
                    await this.sendFail()
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    if (error.response.statusCode === 429) {
                        await this.send("Checkout failed")
                        await this.sendFailError()
                    } else {
                        await this.send("Error processing: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.processPayment()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error processing")
                    await sleep(this.errorDelay)
                    await this.processPayment()
                }
            }
        }
    }

    async getConfig() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Getting config...")
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/payments/config.json",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
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
                this.accessToken = response.body.paymentInstruments.accessToken
                if (this.stopped === "false")
                    await this.send("Got config")
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error getting config: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.getConfig()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error getting config")
                    await sleep(this.errorDelay)
                    await this.getConfig()
                }
            }
        }
    }

    async createCheckout() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Creating checkout...")
            try {
                this.request = {
                    method: 'post',
                    url: this.baseLink + "/wallets/checkouts.json",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                        'content-type': 'application/json',
                        'cache-control': 'max-age=0',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'accept': '*/*',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'x-shopify-storefront-access-token': this.accessToken,
                        'x-checkout-queue-token': this.checkoutQueueToken
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
                this.checkoutURL = response.body.checkout['web_url']
                this.checkoutToken = response.body.checkout.token
                if (this.stopped === "false")
                    await this.send("Created checkout")
            } catch (error) {
                await this.setDelays()
                if (error.response.statusCode === 429) {
                    for (var i = 0; i < error.response.headers['set-cookie'].length; i++) {
                        if (error.response.headers['set-cookie'][i].includes("_checkout_queue_token")) {
                            this.checkoutQueueToken = error.response.headers['set-cookie'][i].split(";")[0].split("_checkout_queue_token=")[1]
                            break;
                        }
                    }
                    if (this.stopped === "false") {
                        await this.pollQueueFast()
                        await this.createCheckout()
                    }
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error creating checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.createCheckout()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error creating checkout")
                    await sleep(this.errorDelay)
                    await this.createCheckout()
                }
            }
        }
    }

    async updateCheckout() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Updating checkout...")
            try {
                this.request = {
                    method: 'put',
                    url: this.baseLink + "/wallets/checkouts/" + this.checkoutToken + ".json",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                        'content-type': 'application/json',
                        'cache-control': 'max-age=0',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'accept': '*/*',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'x-shopify-storefront-access-token': this.accessToken,
                    },
                    json: {
                        "checkout": {
                            "email": this.profile.email,
                            "cart_token": this.cartToken,
                            "shipping_address": {
                                "first_name": this.profile.firstName,
                                "last_name": this.profile.lastName,
                                "address1": this.profile.address1,
                                "city": this.profile.city,
                                "province_code": this.stateCode,
                                "country_code": this.countryCode,
                                "phone": this.profile.phone,
                                "zip": this.profile.zipcode
                            }
                        }
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
                if (this.stopped === "false")
                    await this.send("Updated checkout")
            } catch (error) {
                await this.setDelays()
                if (error.response.statusCode === 412) {
                    for (var i = 0; i < error.response.headers['set-cookie'].length; i++) {
                        if (error.response.headers['set-cookie'][i].includes("_checkout_queue_token")) {
                            this.checkoutQueueToken = error.response.headers['set-cookie'][i].split(";")[0].split("_checkout_queue_token=")[1]
                            break;
                        }
                    }
                    if (this.stopped === "false") {
                        await this.pollQueueFast()
                        await this.updateCheckout()
                    }
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(JSON.stringify(error.response.body))
                    await this.send("Error updating checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.updateCheckout()
                } else if (this.updateCheckout === "false") {
                    this.log(error)
                    await this.send("Unexpected error updating checkout")
                    await sleep(this.errorDelay)
                    await this.updateCheckout()
                }
            }
        }
    }

    async pollFastRates() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Loading rates...")
            try {
                this.request = {
                    method: 'get',
                    url: this.baseLink + "/wallets/checkouts/" + this.checkoutToken + "/shipping_rates.json",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                        'content-type': 'application/json',
                        'cache-control': 'max-age=0',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'accept': '*/*',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink,
                        'x-shopify-storefront-access-token': this.accessToken,
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
                if (response.body.hasOwnProperty('shipping_rates') == false) {
                    await sleep(300)
                    await this.pollFastRates()
                } else {
                    this.shippingRate = response.body['shipping_rates'][0].id
                    this.log(this.shippingRate)
                    if (this.stopped === "false")
                        await this.send("Got rates")
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(JSON.stringify(error.response.body))
                    await this.send("Error getting rates: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.pollFastRates()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error getting rates")
                    await sleep(this.errorDelay)
                    await this.pollFastRates()
                }
            }
        }
    }

    async addShippingFast() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Submitting rate...")
            try {
                this.request = {
                    method: 'put',
                    url: this.baseLink + "/wallets/checkouts/" + this.checkoutToken + ".json",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                        'content-type': 'application/json',
                        'cache-control': 'max-age=0',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'accept': '*/*',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink,
                        'x-shopify-storefront-access-token': this.accessToken,
                    },
                    json: {
                        "checkout": {
                            "shipping_line": {
                                "handle": this.shippingRate
                            }
                        }
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
                if (this.stopped === "false")
                    await this.send("Submitted rate")
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(JSON.stringify(error.response.body))
                    await this.send("Error submitting rates: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.addShippingFast()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error submitting rates")
                    await sleep(this.errorDelay)
                    await this.addShippingFast()
                }
            }
        }
    }


    async calculateTaxes() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Calculating taxes...")
            try {
                this.request = {
                    method: 'put',
                    url: this.location,
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                        'content-type': 'application/json',
                        'cache-control': 'max-age=0',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'accept': '*/*',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink,
                        'x-shopify-storefront-access-token': this.accessToken,
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
                if (response.body.checkout['tax_lines'].length == 0) {
                    await sleep(50)
                    await this.calculateTaxes()
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error calculating taxes: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.calculateTaxes()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error calculating rates")
                    await sleep(this.errorDelay)
                    await this.calculateTaxes()
                }
            }
        }
    }

    async submitCheckpoint() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Submitting checkpoint...")
            try {
                this.request = {
                    method: 'post',
                    url: this.baseLink + "/checkpoint",
                    cookieJar: this.cookieJar,
                    headers: {
                        'cache-control': 'max-age=0',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'sec-ch-ua-mobile': '?0',
                        'upgrade-insecure-requests': '1',
                        'content-type': 'application/x-www-form-urlencoded',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
                        'accept-language': 'en-US,en;q=0.9',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'origin': this.baseLink,
                        'referer': this.baseLink,
                    },
                    body: this.checkpointPayload,
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
                this.log(response.body)
                this.checkpointPayload = ""
                this.finishedSubmittingCheckpoint = true;
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error submitting checkpoint: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitCheckpoint()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error submitting checkpoint")
                    await sleep(this.errorDelay)
                    await this.submitCheckpoint()
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
        await this.sendProductTitle(this.oglink)
        this.send("Stopped")
    }

    async sendCaptchaInfo(captchaInfo) {
        const tough = require('tough-cookie')
        this.cookieJar = new tough.CookieJar()
        this.finishedSubmittingCheckpoint = false;
        for (var i = 0; i < captchaInfo.cookies.length; i++) {
            this.cookieJar.setCookie(new tough.Cookie({
                "key": captchaInfo.cookies[i].name,
                "value": captchaInfo.cookies[i].value,
            }), this.baseLink)
        }
        if (captchaInfo.captchaType === "recaptcha") {
            this.checkpointPayload = "authenticity_token="
            this.checkpointPayload += captchaInfo.authToken
            this.checkpointPayload += "&g-recaptcha-response="
            this.checkpointPayload += captchaInfo.captchaResponse
            this.checkpointPayload += "&data_via=cookie"
            this.checkpointPayload += "&commit="
        } else {
            this.checkpointPayload = "authenticity_token="
            this.checkpointPayload += captchaInfo.authToken
            this.checkpointPayload += "&h-captcha-response="
            this.checkpointPayload += captchaInfo.captchaResponse
            this.checkpointPayload += "&data_via=cookie"
            this.checkpointPayload += "&hcaptcha_challenge_response_token="
            this.checkpointPayload += captchaInfo.hcaptchachallengeresponsetoken
            this.checkpointPayload += "&hcaptcha_data="
            this.checkpointPayload += encodeURIComponent(captchaInfo.hcaptchadata)
            this.checkpointPayload += "&commit="
        }
        this.log(this.checkpointPayload)
        await this.submitCheckpoint()
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

    async setAbbreviations() {
        this.countryCode = ""
        this.stateCode = ""

        var countries = {
            "Argentina": {
                "address_format": {
                    "edit": 3
                },
                "code": "AR",
                "flag_path": "/assets/flags/ar-dc0a5ed2f626c59955a9ac31509fb91cced47ccc437dfae53d60a38005249afc.svg",
                "labels": {
                    "province": "Province"
                },
                "provinces": {
                    "Ciudad Autónoma de Buenos Aires": {
                        "label": "Buenos Aires (Autonomous City)",
                        "alternate_names": [
                            "Ciudad Autonoma de Buenos Aires"
                        ],
                        "code": "C"
                    },
                    "Buenos Aires": {
                        "label": "Buenos Aires Province",
                        "code": "B"
                    },
                    "Catamarca": {
                        "code": "K"
                    },
                    "Chaco": {
                        "code": "H"
                    },
                    "Chubut": {
                        "code": "U"
                    },
                    "Córdoba": {
                        "alternate_names": [
                            "Cordoba"
                        ],
                        "code": "X"
                    },
                    "Corrientes": {
                        "code": "W"
                    },
                    "Entre Ríos": {
                        "alternate_names": [
                            "Entre Rios"
                        ],
                        "code": "E"
                    },
                    "Formosa": {
                        "code": "P"
                    },
                    "Jujuy": {
                        "code": "Y"
                    },
                    "La Pampa": {
                        "code": "L"
                    },
                    "La Rioja": {
                        "code": "F"
                    },
                    "Mendoza": {
                        "code": "M"
                    },
                    "Misiones": {
                        "code": "N"
                    },
                    "Neuquén": {
                        "alternate_names": [
                            "Neuquen"
                        ],
                        "code": "Q"
                    },
                    "Río Negro": {
                        "alternate_names": [
                            "Rio Negro"
                        ],
                        "code": "R"
                    },
                    "Salta": {
                        "code": "A"
                    },
                    "San Juan": {
                        "code": "J"
                    },
                    "San Luis": {
                        "code": "D"
                    },
                    "Santa Cruz": {
                        "code": "Z"
                    },
                    "Santa Fe": {
                        "code": "S"
                    },
                    "Santiago Del Estero": {
                        "label": "Santiago del Estero",
                        "code": "G"
                    },
                    "Tierra Del Fuego": {
                        "label": "Tierra del Fuego",
                        "code": "V"
                    },
                    "Tucumán": {
                        "alternate_names": [
                            "Tucuman"
                        ],
                        "code": "T"
                    }
                }
            },
            "Australia": {
                "address_format": {
                    "edit": 4
                },
                "code": "AU",
                "flag_path": "/assets/flags/au-13873c845dd7bb5655a50d96e393b1e5c08af1bd431f14a91d1d616cc46f192c.svg",
                "labels": {
                    "city": "Suburb",
                    "province": "State/territory",
                    "zip": "Postcode"
                },
                "provinces": {
                    "Australian Capital Territory": {
                        "code": "ACT"
                    },
                    "New South Wales": {
                        "code": "NSW"
                    },
                    "Northern Territory": {
                        "code": "NT"
                    },
                    "Queensland": {
                        "code": "QLD"
                    },
                    "South Australia": {
                        "code": "SA"
                    },
                    "Tasmania": {
                        "code": "TAS"
                    },
                    "Victoria": {
                        "code": "VIC"
                    },
                    "Western Australia": {
                        "code": "WA"
                    }
                }
            },
            "Brazil": {
                "address_format": {
                    "edit": 4
                },
                "code": "BR",
                "flag_path": "/assets/flags/br-c0141f79405d80a7da70de1b45f6f9ce24e52f65c6c7b4dfa2e4b4728aa02660.svg",
                "labels": {
                    "address1": "Street and house number",
                    "province": "State"
                },
                "provinces": {
                    "Acre": {
                        "code": "AC"
                    },
                    "Alagoas": {
                        "code": "AL"
                    },
                    "Amapá": {
                        "alternate_names": [
                            "Amapa"
                        ],
                        "code": "AP"
                    },
                    "Amazonas": {
                        "code": "AM"
                    },
                    "Bahia": {
                        "code": "BA"
                    },
                    "Ceará": {
                        "alternate_names": [
                            "Ceara"
                        ],
                        "code": "CE"
                    },
                    "Espírito Santo": {
                        "alternate_names": [
                            "Espirito Santo"
                        ],
                        "code": "ES"
                    },
                    "Distrito Federal": {
                        "label": "Federal District",
                        "code": "DF"
                    },
                    "Goiás": {
                        "alternate_names": [
                            "Goias"
                        ],
                        "code": "GO"
                    },
                    "Maranhão": {
                        "alternate_names": [
                            "Maranhao"
                        ],
                        "code": "MA"
                    },
                    "Mato Grosso": {
                        "code": "MT"
                    },
                    "Mato Grosso do Sul": {
                        "code": "MS"
                    },
                    "Minas Gerais": {
                        "code": "MG"
                    },
                    "Pará": {
                        "alternate_names": [
                            "Para"
                        ],
                        "code": "PA"
                    },
                    "Paraíba": {
                        "alternate_names": [
                            "Paraiba"
                        ],
                        "code": "PB"
                    },
                    "Paraná": {
                        "alternate_names": [
                            "Parana"
                        ],
                        "code": "PR"
                    },
                    "Pernambuco": {
                        "code": "PE"
                    },
                    "Piauí": {
                        "alternate_names": [
                            "Piaui"
                        ],
                        "code": "PI"
                    },
                    "Rio Grande do Norte": {
                        "code": "RN"
                    },
                    "Rio Grande do Sul": {
                        "code": "RS"
                    },
                    "Rio de Janeiro": {
                        "code": "RJ"
                    },
                    "Rondônia": {
                        "alternate_names": [
                            "Rondonia"
                        ],
                        "code": "RO"
                    },
                    "Roraima": {
                        "code": "RR"
                    },
                    "Santa Catarina": {
                        "code": "SC"
                    },
                    "São Paulo": {
                        "alternate_names": [
                            "Sao Paulo"
                        ],
                        "code": "SP"
                    },
                    "Sergipe": {
                        "code": "SE"
                    },
                    "Tocantins": {
                        "code": "TO"
                    }
                }
            },
            "Canada": {
                "address_format": {
                    "edit": 4
                },
                "code": "CA",
                "flag_path": "/assets/flags/ca-0d78c57d795e496c1419de30c2af44b0d9b3cb96299cf879dcbf08cf9bbf41a4.svg",
                "labels": {
                    "province": "Province"
                },
                "provinces": {
                    "Alberta": {
                        "code": "AB"
                    },
                    "British Columbia": {
                        "code": "BC"
                    },
                    "Manitoba": {
                        "code": "MB"
                    },
                    "New Brunswick": {
                        "code": "NB"
                    },
                    "Newfoundland and Labrador": {
                        "alternate_names": [
                            "Newfoundland"
                        ],
                        "code": "NL"
                    },
                    "Northwest Territories": {
                        "code": "NT"
                    },
                    "Nova Scotia": {
                        "code": "NS"
                    },
                    "Nunavut": {
                        "code": "NU"
                    },
                    "Ontario": {
                        "code": "ON"
                    },
                    "Prince Edward Island": {
                        "code": "PE"
                    },
                    "Quebec": {
                        "alternate_names": [
                            "Québec"
                        ],
                        "code": "QC"
                    },
                    "Saskatchewan": {
                        "code": "SK"
                    },
                    "Yukon": {
                        "code": "YT"
                    }
                }
            },
            "Chile": {
                "address_format": {
                    "edit": 5
                },
                "code": "CL",
                "flag_path": "/assets/flags/cl-dce51159690a7a5026eec5515d46b167d5d025913a66adf0171ed3981c5bd1c1.svg",
                "provinces": {
                    "Arica and Parinacota": {
                        "label": "Arica y Parinacota",
                        "alternate_names": [
                            "Arica y Parinacota",
                            "Región de Arica y Parinacota",
                            "Region de Arica y Parinacota"
                        ],
                        "code": "AP"
                    },
                    "Tarapacá": {
                        "alternate_names": [
                            "Tarapaca",
                            "Región de Tarapacá",
                            "Region de Tarapaca"
                        ],
                        "code": "TA"
                    },
                    "Antofagasta": {
                        "alternate_names": [
                            "Región de Antofagasta",
                            "Region de Antofagasta"
                        ],
                        "code": "AN"
                    },
                    "Atacama": {
                        "alternate_names": [
                            "Región de Atacama",
                            "Region de Atacama"
                        ],
                        "code": "AT"
                    },
                    "Coquimbo": {
                        "alternate_names": [
                            "Región de Coquimbo",
                            "Region de Coquimbo"
                        ],
                        "code": "CO"
                    },
                    "Valparaíso": {
                        "alternate_names": [
                            "Valparaiso",
                            "Región de Valparaíso",
                            "Region de Valparaiso"
                        ],
                        "code": "VS"
                    },
                    "Santiago": {
                        "label": "Santiago Metropolitan",
                        "alternate_names": [
                            "Región Metropolitana",
                            "Region Metropolitana",
                            "Región Metropolitana de Santiago",
                            "Region Metropolitana de Santiago"
                        ],
                        "code": "RM"
                    },
                    "O'Higgins": {
                        "label": "Libertador General Bernardo O’Higgins",
                        "alternate_names": [
                            "Región del Libertador General Bernardo O'Higgins",
                            "Region del Libertador General Bernardo O'Higgins"
                        ],
                        "code": "LI"
                    },
                    "Maule": {
                        "alternate_names": [
                            "Región del Maule",
                            "Region del Maule"
                        ],
                        "code": "ML"
                    },
                    "Ñuble": {
                        "alternate_names": [
                            "Nuble",
                            "Región de Ñuble",
                            "Region de Nuble"
                        ],
                        "code": "NB"
                    },
                    "Biobío": {
                        "label": "Bío Bío",
                        "alternate_names": [
                            "Biobio",
                            "Región del Biobío",
                            "Region del Biobio"
                        ],
                        "code": "BI"
                    },
                    "Araucanía": {
                        "alternate_names": [
                            "Araucania",
                            "Región de La Araucanía",
                            "Region de La Araucania"
                        ],
                        "code": "AR"
                    },
                    "Los Ríos": {
                        "alternate_names": [
                            "Los Rios",
                            "Región de Los Ríos",
                            "Region de Los Rios"
                        ],
                        "code": "LR"
                    },
                    "Los Lagos": {
                        "alternate_names": [
                            "Región de Los Lagos",
                            "Region de Los Lagos"
                        ],
                        "code": "LL"
                    },
                    "Aysén": {
                        "alternate_names": [
                            "Aysen",
                            "Región Aysén del General Carlos Ibáñez del Campo",
                            "Region Aysen del General Carlos Ibanez del Campo"
                        ],
                        "code": "AI"
                    },
                    "Magallanes": {
                        "label": "Magallanes Region",
                        "alternate_names": [
                            "Región de Magallanes y de la Antártica Chilena",
                            "Region de Magallanes y de la Antartica Chilena"
                        ],
                        "code": "MA"
                    }
                }
            },
            "China": {
                "address_format": {
                    "edit": 4
                },
                "code": "CN",
                "flag_path": "/assets/flags/cn-2153644e96e86a433f6157a6a75327d8f5b74c72e3b9c744bb9c53b125c15143.svg",
                "labels": {
                    "address1": "Full address",
                    "province": "Province"
                },
                "provinces": {
                    "Anhui": {
                        "alternate_names": [
                            "安徽"
                        ],
                        "code": "AH"
                    },
                    "Beijing": {
                        "alternate_names": [
                            "北京"
                        ],
                        "code": "BJ"
                    },
                    "Chongqing": {
                        "alternate_names": [
                            "重庆"
                        ],
                        "code": "CQ"
                    },
                    "Fujian": {
                        "alternate_names": [
                            "福建"
                        ],
                        "code": "FJ"
                    },
                    "Gansu": {
                        "alternate_names": [
                            "甘肃"
                        ],
                        "code": "GS"
                    },
                    "Guangdong": {
                        "alternate_names": [
                            "广东"
                        ],
                        "code": "GD"
                    },
                    "Guangxi": {
                        "alternate_names": [
                            "广西"
                        ],
                        "code": "GX"
                    },
                    "Guizhou": {
                        "alternate_names": [
                            "贵州"
                        ],
                        "code": "GZ"
                    },
                    "Hainan": {
                        "alternate_names": [
                            "海南"
                        ],
                        "code": "HI"
                    },
                    "Hebei": {
                        "alternate_names": [
                            "河北"
                        ],
                        "code": "HE"
                    },
                    "Heilongjiang": {
                        "alternate_names": [
                            "黑龙江"
                        ],
                        "code": "HL"
                    },
                    "Henan": {
                        "alternate_names": [
                            "河南"
                        ],
                        "code": "HA"
                    },
                    "Hubei": {
                        "alternate_names": [
                            "湖北"
                        ],
                        "code": "HB"
                    },
                    "Hunan": {
                        "alternate_names": [
                            "湖南"
                        ],
                        "code": "HN"
                    },
                    "Inner Mongolia": {
                        "alternate_names": [
                            "内蒙古",
                            "Nei Mongol"
                        ],
                        "code": "NM"
                    },
                    "Jiangsu": {
                        "alternate_names": [
                            "江苏"
                        ],
                        "code": "JS"
                    },
                    "Jiangxi": {
                        "alternate_names": [
                            "江西"
                        ],
                        "code": "JX"
                    },
                    "Jilin": {
                        "alternate_names": [
                            "吉林"
                        ],
                        "code": "JL"
                    },
                    "Liaoning": {
                        "alternate_names": [
                            "辽宁"
                        ],
                        "code": "LN"
                    },
                    "Ningxia": {
                        "alternate_names": [
                            "宁夏"
                        ],
                        "code": "NX"
                    },
                    "Qinghai": {
                        "alternate_names": [
                            "青海"
                        ],
                        "code": "QH"
                    },
                    "Shaanxi": {
                        "alternate_names": [
                            "陕西"
                        ],
                        "code": "SN"
                    },
                    "Shandong": {
                        "alternate_names": [
                            "山东"
                        ],
                        "code": "SD"
                    },
                    "Shanghai": {
                        "alternate_names": [
                            "上海"
                        ],
                        "code": "SH"
                    },
                    "Shanxi": {
                        "alternate_names": [
                            "山西"
                        ],
                        "code": "SX"
                    },
                    "Sichuan": {
                        "alternate_names": [
                            "四川"
                        ],
                        "code": "SC"
                    },
                    "Tianjin": {
                        "alternate_names": [
                            "天津"
                        ],
                        "code": "TJ"
                    },
                    "Xizang": {
                        "label": "Tibet",
                        "alternate_names": [
                            "西藏",
                            "Tibet"
                        ],
                        "code": "YZ"
                    },
                    "Xinjiang": {
                        "alternate_names": [
                            "新疆"
                        ],
                        "code": "XJ"
                    },
                    "Yunnan": {
                        "alternate_names": [
                            "云南"
                        ],
                        "code": "YN"
                    },
                    "Zhejiang": {
                        "alternate_names": [
                            "浙江"
                        ],
                        "code": "ZJ"
                    }
                }
            },
            "Colombia": {
                "address_format": {
                    "edit": 4
                },
                "code": "CO",
                "flag_path": "/assets/flags/co-a37a6bc1fe59000adbe09ea8ac216e2b66ba728742e119349bab34d1fd1b3c11.svg",
                "labels": {
                    "province": "Province"
                },
                "provinces": {
                    "Bogotá, D.C.": {
                        "label": "Capital District",
                        "alternate_names": [
                            "Bogota, D.C.",
                            "Bogotá",
                            "Bogota",
                            "Capital District",
                            "Distrito Capital de Bogotá",
                            "Distrito Capital de Bogota"
                        ],
                        "code": "DC"
                    },
                    "Amazonas": {
                        "code": "AMA"
                    },
                    "Antioquia": {
                        "code": "ANT"
                    },
                    "Arauca": {
                        "code": "ARA"
                    },
                    "Atlántico": {
                        "alternate_names": [
                            "Atlantico"
                        ],
                        "code": "ATL"
                    },
                    "Bolívar": {
                        "alternate_names": [
                            "Bolivar"
                        ],
                        "code": "BOL"
                    },
                    "Boyacá": {
                        "alternate_names": [
                            "Boyaca"
                        ],
                        "code": "BOY"
                    },
                    "Caldas": {
                        "code": "CAL"
                    },
                    "Caquetá": {
                        "alternate_names": [
                            "Caqueta"
                        ],
                        "code": "CAQ"
                    },
                    "Casanare": {
                        "code": "CAS"
                    },
                    "Cauca": {
                        "code": "CAU"
                    },
                    "Cesar": {
                        "code": "CES"
                    },
                    "Chocó": {
                        "alternate_names": [
                            "Choco"
                        ],
                        "code": "CHO"
                    },
                    "Córdoba": {
                        "alternate_names": [
                            "Cordoba"
                        ],
                        "code": "COR"
                    },
                    "Cundinamarca": {
                        "code": "CUN"
                    },
                    "Guainía": {
                        "alternate_names": [
                            "Guainia"
                        ],
                        "code": "GUA"
                    },
                    "Guaviare": {
                        "code": "GUV"
                    },
                    "Huila": {
                        "code": "HUI"
                    },
                    "La Guajira": {
                        "code": "LAG"
                    },
                    "Magdalena": {
                        "code": "MAG"
                    },
                    "Meta": {
                        "code": "MET"
                    },
                    "Nariño": {
                        "alternate_names": [
                            "Narino"
                        ],
                        "code": "NAR"
                    },
                    "Norte de Santander": {
                        "code": "NSA"
                    },
                    "Putumayo": {
                        "code": "PUT"
                    },
                    "Quindío": {
                        "alternate_names": [
                            "Quindio"
                        ],
                        "code": "QUI"
                    },
                    "Risaralda": {
                        "code": "RIS"
                    },
                    "San Andrés, Providencia y Santa Catalina": {
                        "label": "San Andrés & Providencia",
                        "alternate_names": [
                            "San Andres, Providencia y Santa Catalina",
                            "San Andrés y Providencia",
                            "San Andres y Providencia"
                        ],
                        "code": "SAP"
                    },
                    "Santander": {
                        "code": "SAN"
                    },
                    "Sucre": {
                        "code": "SUC"
                    },
                    "Tolima": {
                        "code": "TOL"
                    },
                    "Valle del Cauca": {
                        "code": "VAC"
                    },
                    "Vaupés": {
                        "alternate_names": [
                            "Vaupes"
                        ],
                        "code": "VAU"
                    },
                    "Vichada": {
                        "code": "VID"
                    }
                }
            },
            "Egypt": {
                "address_format": {
                    "edit": 4
                },
                "code": "EG",
                "flag_path": "/assets/flags/eg-5b2eda03efba7ebfb1c548ca444b4b406b8f80d1b1e68935de595f7ef9b1a5af.svg",
                "labels": {
                    "province": "Governorate"
                },
                "provinces": {
                    "6th of October": {
                        "alternate_names": [
                            "As Sādis min Uktūbar",
                            "As Sadis min Uktubar"
                        ],
                        "code": "SU"
                    },
                    "Al Sharqia": {
                        "alternate_names": [
                            "Ash Sharqīyah",
                            "Ash Sharqiyah"
                        ],
                        "code": "SHR"
                    },
                    "Alexandria": {
                        "alternate_names": [
                            "Al Iskandarīyah",
                            "Al Iskandariyah"
                        ],
                        "code": "ALX"
                    },
                    "Aswan": {
                        "alternate_names": [
                            "Aswān"
                        ],
                        "code": "ASN"
                    },
                    "Asyut": {
                        "alternate_names": [
                            "Asyūţ"
                        ],
                        "code": "AST"
                    },
                    "Beheira": {
                        "alternate_names": [
                            "Al Buḩayrah",
                            "Al Buayrah"
                        ],
                        "code": "BH"
                    },
                    "Beni Suef": {
                        "alternate_names": [
                            "Banī Suwayf",
                            "Bani Suwayf"
                        ],
                        "code": "BNS"
                    },
                    "Cairo": {
                        "alternate_names": [
                            "Al Qāhirah",
                            "Al Qahirah"
                        ],
                        "code": "C"
                    },
                    "Dakahlia": {
                        "alternate_names": [
                            "Ad Daqahlīyah",
                            "Ad Daqahliyah"
                        ],
                        "code": "DK"
                    },
                    "Damietta": {
                        "alternate_names": [
                            "Dumyāţ",
                            "Dumyat"
                        ],
                        "code": "DT"
                    },
                    "Faiyum": {
                        "alternate_names": [
                            "Al Fayyūm",
                            "Al Fayyum"
                        ],
                        "code": "FYM"
                    },
                    "Gharbia": {
                        "alternate_names": [
                            "Al Gharbīyah",
                            "Al Gharbiyah"
                        ],
                        "code": "GH"
                    },
                    "Giza": {
                        "alternate_names": [
                            "Al Jīzah",
                            "Al Jizah"
                        ],
                        "code": "GZ"
                    },
                    "Helwan": {
                        "alternate_names": [
                            "Ḩulwān",
                            "ulwan"
                        ],
                        "code": "HU"
                    },
                    "Ismailia": {
                        "alternate_names": [
                            "Al Ismāٰīlīyah",
                            "Al Ismailiyah"
                        ],
                        "code": "IS"
                    },
                    "Kafr el-Sheikh": {
                        "alternate_names": [
                            "Kafr ash Shaykh"
                        ],
                        "code": "KFS"
                    },
                    "Luxor": {
                        "alternate_names": [
                            "Al Uqşur",
                            "Al Uqsur"
                        ],
                        "code": "LX"
                    },
                    "Matrouh": {
                        "alternate_names": [
                            "Maţrūḩ",
                            "Matru"
                        ],
                        "code": "MT"
                    },
                    "Minya": {
                        "alternate_names": [
                            "Al Minyā",
                            "Al Minya"
                        ],
                        "code": "MN"
                    },
                    "Monufia": {
                        "alternate_names": [
                            "Al Minūfīyah",
                            "Al Minufiyah"
                        ],
                        "code": "MNF"
                    },
                    "New Valley": {
                        "alternate_names": [
                            "Al Wādī al Jadīd",
                            "Al Wadi al Jadid"
                        ],
                        "code": "WAD"
                    },
                    "North Sinai": {
                        "alternate_names": [
                            "Shamāl Sīnā",
                            "Shamal Sina"
                        ],
                        "code": "SIN"
                    },
                    "Port Said": {
                        "alternate_names": [
                            "Būr Saٰīd",
                            "Bur Said"
                        ],
                        "code": "PTS"
                    },
                    "Qalyubia": {
                        "alternate_names": [
                            "Al Qalyūbīyah",
                            "Al Qalyubiyah"
                        ],
                        "code": "KB"
                    },
                    "Qena": {
                        "alternate_names": [
                            "Qinā",
                            "Qina"
                        ],
                        "code": "KN"
                    },
                    "Red Sea": {
                        "alternate_names": [
                            "Al Baḩr al Aḩmar",
                            "Al Bar al Amar"
                        ],
                        "code": "BA"
                    },
                    "Sohag": {
                        "alternate_names": [
                            "Sūhāj",
                            "Suhaj"
                        ],
                        "code": "SHG"
                    },
                    "South Sinai": {
                        "alternate_names": [
                            "Janūb Sīnā",
                            "Janub Sina"
                        ],
                        "code": "JS"
                    },
                    "Suez": {
                        "alternate_names": [
                            "As Suways"
                        ],
                        "code": "SUZ"
                    }
                }
            },
            "Guatemala": {
                "address_format": {
                    "edit": 4
                },
                "code": "GT",
                "flag_path": "/assets/flags/gt-6b7c52001bc25b596e05cc2730f93d6976271bd7fda1667a0a6171573a5eb0cf.svg",
                "provinces": {
                    "Alta Verapaz": {
                        "code": "AVE"
                    },
                    "Baja Verapaz": {
                        "code": "BVE"
                    },
                    "Chimaltenango": {
                        "code": "CMT"
                    },
                    "Chiquimula": {
                        "code": "CQM"
                    },
                    "El Progreso": {
                        "code": "EPR"
                    },
                    "Escuintla": {
                        "code": "ESC"
                    },
                    "Guatemala": {
                        "code": "GUA"
                    },
                    "Huehuetenango": {
                        "code": "HUE"
                    },
                    "Izabal": {
                        "code": "IZA"
                    },
                    "Jalapa": {
                        "code": "JAL"
                    },
                    "Jutiapa": {
                        "code": "JUT"
                    },
                    "Petén": {
                        "alternate_names": [
                            "Peten"
                        ],
                        "code": "PET"
                    },
                    "Quetzaltenango": {
                        "code": "QUE"
                    },
                    "Quiché": {
                        "alternate_names": [
                            "Quiche"
                        ],
                        "code": "QUI"
                    },
                    "Retalhuleu": {
                        "code": "RET"
                    },
                    "Sacatepéquez": {
                        "alternate_names": [
                            "Sacatepequez"
                        ],
                        "code": "SAC"
                    },
                    "San Marcos": {
                        "code": "SMA"
                    },
                    "Santa Rosa": {
                        "code": "SRO"
                    },
                    "Sololá": {
                        "alternate_names": [
                            "Solola"
                        ],
                        "code": "SOL"
                    },
                    "Suchitepéquez": {
                        "alternate_names": [
                            "Suchitepequez"
                        ],
                        "code": "SUC"
                    },
                    "Totonicapán": {
                        "alternate_names": [
                            "Totonicapan"
                        ],
                        "code": "TOT"
                    },
                    "Zacapa": {
                        "code": "ZAC"
                    }
                }
            },
            "Hong Kong": {
                "address_format": {
                    "edit": 7
                },
                "code": "HK",
                "flag_path": "/assets/flags/hk-6eedf73300bf96c4ffb2528905eb62da02456b532d08545de303aa55cd0cf057.svg",
                "labels": {
                    "city": "District"
                },
                "provinces": {
                    "Hong Kong Island": {
                        "alternate_names": [
                            "Hong Kong Province",
                            "Hong Kong",
                            "香港",
                            "香港島"
                        ],
                        "code": "HK"
                    },
                    "Kowloon": {
                        "alternate_names": [
                            "九龍"
                        ],
                        "code": "KL"
                    },
                    "New Territories": {
                        "alternate_names": [
                            "新界"
                        ],
                        "code": "NT"
                    }
                }
            },
            "India": {
                "address_format": {
                    "edit": 4
                },
                "code": "IN",
                "flag_path": "/assets/flags/in-0e84df729f1dd51112bd51e4523e7f5416aa65ade27b7f66056bcb13e1f933c4.svg",
                "labels": {
                    "province": "State",
                    "zip": "PIN code"
                },
                "provinces": {
                    "Andaman and Nicobar Islands": {
                        "alternate_names": [
                            "Andaman and Nicobar"
                        ],
                        "code": "AN"
                    },
                    "Andhra Pradesh": {
                        "code": "AP"
                    },
                    "Arunachal Pradesh": {
                        "code": "AR"
                    },
                    "Assam": {
                        "code": "AS"
                    },
                    "Bihar": {
                        "code": "BR"
                    },
                    "Chandigarh": {
                        "code": "CH"
                    },
                    "Chhattisgarh": {
                        "alternate_names": [
                            "Chattisgarh",
                            "CT"
                        ],
                        "code": "CG"
                    },
                    "Dadra and Nagar Haveli": {
                        "code": "DN"
                    },
                    "Daman and Diu": {
                        "code": "DD"
                    },
                    "Delhi": {
                        "code": "DL"
                    },
                    "Goa": {
                        "code": "GA"
                    },
                    "Gujarat": {
                        "code": "GJ"
                    },
                    "Haryana": {
                        "code": "HR"
                    },
                    "Himachal Pradesh": {
                        "code": "HP"
                    },
                    "Jammu and Kashmir": {
                        "code": "JK"
                    },
                    "Jharkhand": {
                        "code": "JH"
                    },
                    "Karnataka": {
                        "code": "KA"
                    },
                    "Kerala": {
                        "code": "KL"
                    },
                    "Ladakh": {
                        "code": "LA"
                    },
                    "Lakshadweep": {
                        "code": "LD"
                    },
                    "Madhya Pradesh": {
                        "code": "MP"
                    },
                    "Maharashtra": {
                        "code": "MH"
                    },
                    "Manipur": {
                        "code": "MN"
                    },
                    "Meghalaya": {
                        "code": "ML"
                    },
                    "Mizoram": {
                        "code": "MZ"
                    },
                    "Nagaland": {
                        "code": "NL"
                    },
                    "Odisha": {
                        "alternate_names": [
                            "OD",
                            "Orissa"
                        ],
                        "code": "OR"
                    },
                    "Puducherry": {
                        "code": "PY"
                    },
                    "Punjab": {
                        "code": "PB"
                    },
                    "Rajasthan": {
                        "code": "RJ"
                    },
                    "Sikkim": {
                        "code": "SK"
                    },
                    "Tamil Nadu": {
                        "code": "TN"
                    },
                    "Telangana": {
                        "code": "TS"
                    },
                    "Tripura": {
                        "code": "TR"
                    },
                    "Uttar Pradesh": {
                        "code": "UP"
                    },
                    "Uttarakhand": {
                        "code": "UK"
                    },
                    "West Bengal": {
                        "code": "WB"
                    }
                }
            },
            "Indonesia": {
                "address_format": {
                    "edit": 8
                },
                "code": "ID",
                "flag_path": "/assets/flags/id-af8ae4bcec649b476a512871baf313544722c3dc3b9336e6bc15496e1e158cfb.svg",
                "labels": {
                    "province": "Province"
                },
                "provinces": {
                    "Aceh": {
                        "code": "AC"
                    },
                    "Bali": {
                        "code": "BA"
                    },
                    "Bangka Belitung": {
                        "label": "Bangka–Belitung Islands",
                        "code": "BB"
                    },
                    "Banten": {
                        "code": "BT"
                    },
                    "Bengkulu": {
                        "code": "BE"
                    },
                    "Jawa Tengah": {
                        "label": "Central Java",
                        "code": "JT"
                    },
                    "Kalimantan Tengah": {
                        "label": "Central Kalimantan",
                        "code": "KT"
                    },
                    "Sulawesi Tengah": {
                        "label": "Central Sulawesi",
                        "code": "ST"
                    },
                    "Jawa Timur": {
                        "label": "East Java",
                        "code": "JI"
                    },
                    "Kalimantan Timur": {
                        "label": "East Kalimantan",
                        "code": "KI"
                    },
                    "Nusa Tenggara Timur": {
                        "label": "East Nusa Tenggara",
                        "code": "NT"
                    },
                    "Gorontalo": {
                        "code": "GO"
                    },
                    "Jakarta": {
                        "code": "JK"
                    },
                    "Jambi": {
                        "code": "JA"
                    },
                    "Lampung": {
                        "code": "LA"
                    },
                    "Maluku": {
                        "code": "MA"
                    },
                    "Kalimantan Utara": {
                        "label": "North Kalimantan",
                        "code": "KU"
                    },
                    "Maluku Utara": {
                        "label": "North Maluku",
                        "code": "MU"
                    },
                    "Sulawesi Utara": {
                        "label": "North Sulawesi",
                        "code": "SA"
                    },
                    "North Sumatra": {
                        "alternate_names": [
                            "Sumatra Utara"
                        ],
                        "code": "SU"
                    },
                    "Papua": {
                        "code": "PA"
                    },
                    "Riau": {
                        "code": "RI"
                    },
                    "Kepulauan Riau": {
                        "label": "Riau Islands",
                        "code": "KR"
                    },
                    "Kalimantan Selatan": {
                        "label": "South Kalimantan",
                        "code": "KS"
                    },
                    "Sulawesi Selatan": {
                        "label": "South Sulawesi",
                        "code": "SN"
                    },
                    "South Sumatra": {
                        "alternate_names": [
                            "Sumatra Selatan"
                        ],
                        "code": "SS"
                    },
                    "Sulawesi Tenggara": {
                        "label": "Southeast Sulawesi",
                        "code": "SG"
                    },
                    "Jawa Barat": {
                        "label": "West Java",
                        "code": "JB"
                    },
                    "Kalimantan Barat": {
                        "label": "West Kalimantan",
                        "code": "KB"
                    },
                    "Nusa Tenggara Barat": {
                        "label": "West Nusa Tenggara",
                        "code": "NB"
                    },
                    "Papua Barat": {
                        "label": "West Papua",
                        "code": "PB"
                    },
                    "Sulawesi Barat": {
                        "label": "West Sulawesi",
                        "code": "SR"
                    },
                    "West Sumatra": {
                        "alternate_names": [
                            "Sumatra Barat"
                        ],
                        "code": "SB"
                    },
                    "Yogyakarta": {
                        "code": "YO"
                    }
                }
            },
            "Ireland": {
                "address_format": {
                    "edit": 4
                },
                "code": "IE",
                "flag_path": "/assets/flags/ie-8147f9c27f0e03a7873cd3183607439337bc9b49b8d2578c3819df5cd76bf02e.svg",
                "labels": {
                    "province": "County"
                },
                "provinces": {
                    "Carlow": {
                        "alternate_names": [
                            "Ceatharlach",
                            "Contae Cheatharlach",
                            "County Carlow",
                            "Co. Carlow"
                        ],
                        "code": "CW"
                    },
                    "Cavan": {
                        "alternate_names": [
                            "An Cabhán",
                            "An Cabhan",
                            "Contae an Chabháin",
                            "Contae an Chabhain",
                            "County Cavan",
                            "Co. Cavan"
                        ],
                        "code": "CN"
                    },
                    "Clare": {
                        "alternate_names": [
                            "An Clár",
                            "An Clar",
                            "Contae an Chláir",
                            "Contae an Chlair",
                            "County Clare",
                            "Co. Clare"
                        ],
                        "code": "CE"
                    },
                    "Cork": {
                        "alternate_names": [
                            "Corcaigh",
                            "Contae Chorcaí",
                            "Contae Chorcai",
                            "County Cork",
                            "Co. Cork"
                        ],
                        "code": "CO"
                    },
                    "Donegal": {
                        "alternate_names": [
                            "Dún na nGall",
                            "Dun na nGall",
                            "Contae Dhún na nGall",
                            "Contae Dhun na nGall",
                            "County Donegal",
                            "Co. Donegal"
                        ],
                        "code": "DL"
                    },
                    "Dublin": {
                        "alternate_names": [
                            "Baile Átha Cliath",
                            "Baile Atha Cliath",
                            "County Dublin",
                            "Co. Dublin"
                        ],
                        "code": "D"
                    },
                    "Galway": {
                        "alternate_names": [
                            "Gaillimh",
                            "Contae na Gaillimhe",
                            "County Galway",
                            "Co. Galway"
                        ],
                        "code": "G"
                    },
                    "Kerry": {
                        "alternate_names": [
                            "Ciarraí",
                            "Ciarrai",
                            "Contae Chiarraí",
                            "Contae Chiarrai",
                            "County Kerry",
                            "Co. Kerry"
                        ],
                        "code": "KY"
                    },
                    "Kildare": {
                        "alternate_names": [
                            "Cill Dara",
                            "Contae Chill Dara",
                            "County Kildare",
                            "Co. Kildare"
                        ],
                        "code": "KE"
                    },
                    "Kilkenny": {
                        "alternate_names": [
                            "Cill Chainnigh",
                            "Contae Chill Chainnigh",
                            "County Kilkenny",
                            "Co. Kilkenny"
                        ],
                        "code": "KK"
                    },
                    "Laois": {
                        "alternate_names": [
                            "Contae Laoise",
                            "County Laois",
                            "Co. Laois"
                        ],
                        "code": "LS"
                    },
                    "Leitrim": {
                        "alternate_names": [
                            "Liatroim",
                            "Contae Liatroma",
                            "County Leitrim",
                            "Co. Leitrim"
                        ],
                        "code": "LM"
                    },
                    "Limerick": {
                        "alternate_names": [
                            "Luimneach",
                            "Contae Luimnigh",
                            "County Limerick",
                            "Co. Limerick"
                        ],
                        "code": "LK"
                    },
                    "Longford": {
                        "alternate_names": [
                            "An Longfort",
                            "Contae an Longfoirt",
                            "County Longford",
                            "Co. Longford"
                        ],
                        "code": "LD"
                    },
                    "Louth": {
                        "alternate_names": [
                            "Lú",
                            "Lu",
                            "Contae Lú",
                            "Contae Lu",
                            "County Louth",
                            "Co. Louth"
                        ],
                        "code": "LH"
                    },
                    "Mayo": {
                        "alternate_names": [
                            "Maigh Eo",
                            "Contae Mhaigh Eo",
                            "County Mayo",
                            "Co. Mayo"
                        ],
                        "code": "MO"
                    },
                    "Meath": {
                        "alternate_names": [
                            "An Mhí",
                            "An Mhi",
                            "Contae na Mí",
                            "Contae na Mi",
                            "County Meath",
                            "Co. Meath"
                        ],
                        "code": "MH"
                    },
                    "Monaghan": {
                        "alternate_names": [
                            "Muineachán",
                            "Muineachan",
                            "Contae Mhuineacháin",
                            "Contae Mhuineachain",
                            "County Monaghan",
                            "Co. Monaghan"
                        ],
                        "code": "MN"
                    },
                    "Offaly": {
                        "alternate_names": [
                            "Uíbh Fhailí",
                            "Uibh Fhaili",
                            "Contae Uíbh Fhailí",
                            "Contae Uibh Fhaili",
                            "County Offaly",
                            "Co. Offaly"
                        ],
                        "code": "OY"
                    },
                    "Roscommon": {
                        "alternate_names": [
                            "Ros Comáin",
                            "Ros Comain",
                            "Contae Ros Comáin",
                            "Contae Ros Comain",
                            "County Roscommon",
                            "Co. Roscommon"
                        ],
                        "code": "RN"
                    },
                    "Sligo": {
                        "alternate_names": [
                            "Sligeach",
                            "Contae Shligigh",
                            "County Sligo",
                            "Co. Sligo"
                        ],
                        "code": "SO"
                    },
                    "Tipperary": {
                        "alternate_names": [
                            "Tiobraid Árann",
                            "Tiobraid Arann",
                            "Contae Thiobraid Árann",
                            "Contae Thiobraid Arann",
                            "County Tipperary",
                            "Co. Tipperary"
                        ],
                        "code": "TA"
                    },
                    "Waterford": {
                        "alternate_names": [
                            "Port Láirge",
                            "Port Lairge",
                            "Contae Phort Láirge",
                            "Contae Phort Lairge",
                            "County Waterford",
                            "Co. Waterford"
                        ],
                        "code": "WD"
                    },
                    "Westmeath": {
                        "alternate_names": [
                            "An Iarmhí",
                            "An Iarmhi",
                            "Contae na hIarmhí",
                            "Contae na hIarmhi",
                            "County Westmeath",
                            "Co. Westmeath"
                        ],
                        "code": "WH"
                    },
                    "Wexford": {
                        "alternate_names": [
                            "Loch Garman",
                            "Contae Loch Garman",
                            "County Wexford",
                            "Co. Wexford"
                        ],
                        "code": "WX"
                    },
                    "Wicklow": {
                        "alternate_names": [
                            "Cill Mhantáin",
                            "Cill Mhantain",
                            "Contae Chill Mhantáin",
                            "Contae Chill Mhantain",
                            "County Wicklow",
                            "Co. Wicklow"
                        ],
                        "code": "WW"
                    }
                }
            },
            "Italy": {
                "address_format": {
                    "edit": 9
                },
                "code": "IT",
                "flag_path": "/assets/flags/it-df6faa9601d03e30d30e9a0e630d0286bcdc4306a0570f217034077e7f5875f8.svg",
                "labels": {
                    "address1": "Street and house number",
                    "province": "Province"
                },
                "provinces": {
                    "Agrigento": {
                        "code": "AG"
                    },
                    "Alessandria": {
                        "code": "AL"
                    },
                    "Ancona": {
                        "code": "AN"
                    },
                    "Aosta": {
                        "code": "AO"
                    },
                    "Arezzo": {
                        "code": "AR"
                    },
                    "Ascoli Piceno": {
                        "code": "AP"
                    },
                    "Asti": {
                        "code": "AT"
                    },
                    "Avellino": {
                        "code": "AV"
                    },
                    "Bari": {
                        "code": "BA"
                    },
                    "Barletta-Andria-Trani": {
                        "code": "BT"
                    },
                    "Belluno": {
                        "code": "BL"
                    },
                    "Benevento": {
                        "code": "BN"
                    },
                    "Bergamo": {
                        "code": "BG"
                    },
                    "Biella": {
                        "code": "BI"
                    },
                    "Bologna": {
                        "code": "BO"
                    },
                    "Brescia": {
                        "code": "BS"
                    },
                    "Brindisi": {
                        "code": "BR"
                    },
                    "Cagliari": {
                        "code": "CA"
                    },
                    "Caltanissetta": {
                        "code": "CL"
                    },
                    "Campobasso": {
                        "code": "CB"
                    },
                    "Carbonia-Iglesias": {
                        "code": "CI"
                    },
                    "Caserta": {
                        "code": "CE"
                    },
                    "Catania": {
                        "code": "CT"
                    },
                    "Catanzaro": {
                        "code": "CZ"
                    },
                    "Chieti": {
                        "code": "CH"
                    },
                    "Como": {
                        "code": "CO"
                    },
                    "Cosenza": {
                        "code": "CS"
                    },
                    "Cremona": {
                        "code": "CR"
                    },
                    "Crotone": {
                        "code": "KR"
                    },
                    "Cuneo": {
                        "code": "CN"
                    },
                    "Enna": {
                        "code": "EN"
                    },
                    "Fermo": {
                        "code": "FM"
                    },
                    "Ferrara": {
                        "code": "FE"
                    },
                    "Firenze": {
                        "label": "Florence",
                        "code": "FI"
                    },
                    "Foggia": {
                        "code": "FG"
                    },
                    "Forlì-Cesena": {
                        "alternate_names": [
                            "Forli-Cesena"
                        ],
                        "code": "FC"
                    },
                    "Frosinone": {
                        "code": "FR"
                    },
                    "Genova": {
                        "label": "Genoa",
                        "code": "GE"
                    },
                    "Gorizia": {
                        "code": "GO"
                    },
                    "Grosseto": {
                        "code": "GR"
                    },
                    "Imperia": {
                        "code": "IM"
                    },
                    "Isernia": {
                        "code": "IS"
                    },
                    "La Spezia": {
                        "code": "SP"
                    },
                    "Latina": {
                        "code": "LT"
                    },
                    "Lecce": {
                        "code": "LE"
                    },
                    "Lecco": {
                        "code": "LC"
                    },
                    "Livorno": {
                        "code": "LI"
                    },
                    "Lodi": {
                        "code": "LO"
                    },
                    "Lucca": {
                        "code": "LU"
                    },
                    "L'Aquila": {
                        "label": "L’Aquila",
                        "code": "AQ"
                    },
                    "Macerata": {
                        "code": "MC"
                    },
                    "Mantova": {
                        "label": "Mantua",
                        "code": "MN"
                    },
                    "Massa-Carrara": {
                        "label": "Massa and Carrara",
                        "code": "MS"
                    },
                    "Matera": {
                        "code": "MT"
                    },
                    "Medio Campidano": {
                        "code": "VS"
                    },
                    "Messina": {
                        "code": "ME"
                    },
                    "Milano": {
                        "label": "Milan",
                        "code": "MI"
                    },
                    "Modena": {
                        "code": "MO"
                    },
                    "Monza e Brianza": {
                        "label": "Monza and Brianza",
                        "code": "MB"
                    },
                    "Napoli": {
                        "label": "Naples",
                        "code": "NA"
                    },
                    "Novara": {
                        "code": "NO"
                    },
                    "Nuoro": {
                        "code": "NU"
                    },
                    "Ogliastra": {
                        "code": "OG"
                    },
                    "Olbia-Tempio": {
                        "code": "OT"
                    },
                    "Oristano": {
                        "code": "OR"
                    },
                    "Padova": {
                        "label": "Padua",
                        "code": "PD"
                    },
                    "Palermo": {
                        "code": "PA"
                    },
                    "Parma": {
                        "code": "PR"
                    },
                    "Pavia": {
                        "code": "PV"
                    },
                    "Perugia": {
                        "code": "PG"
                    },
                    "Pesaro e Urbino": {
                        "label": "Pesaro and Urbino",
                        "code": "PU"
                    },
                    "Pescara": {
                        "code": "PE"
                    },
                    "Piacenza": {
                        "code": "PC"
                    },
                    "Pisa": {
                        "code": "PI"
                    },
                    "Pistoia": {
                        "code": "PT"
                    },
                    "Pordenone": {
                        "code": "PN"
                    },
                    "Potenza": {
                        "code": "PZ"
                    },
                    "Prato": {
                        "code": "PO"
                    },
                    "Ragusa": {
                        "code": "RG"
                    },
                    "Ravenna": {
                        "code": "RA"
                    },
                    "Reggio Calabria": {
                        "alternate_names": [
                            "Calabria"
                        ],
                        "code": "RC"
                    },
                    "Reggio Emilia": {
                        "code": "RE"
                    },
                    "Rieti": {
                        "code": "RI"
                    },
                    "Rimini": {
                        "code": "RN"
                    },
                    "Roma": {
                        "label": "Rome",
                        "code": "RM"
                    },
                    "Rovigo": {
                        "code": "RO"
                    },
                    "Salerno": {
                        "code": "SA"
                    },
                    "Sassari": {
                        "code": "SS"
                    },
                    "Savona": {
                        "code": "SV"
                    },
                    "Siena": {
                        "code": "SI"
                    },
                    "Sondrio": {
                        "code": "SO"
                    },
                    "Bolzano": {
                        "label": "South Tyrol",
                        "code": "BZ"
                    },
                    "Siracusa": {
                        "label": "Syracuse",
                        "code": "SR"
                    },
                    "Taranto": {
                        "code": "TA"
                    },
                    "Teramo": {
                        "code": "TE"
                    },
                    "Terni": {
                        "code": "TR"
                    },
                    "Trapani": {
                        "code": "TP"
                    },
                    "Trento": {
                        "label": "Trentino",
                        "code": "TN"
                    },
                    "Treviso": {
                        "code": "TV"
                    },
                    "Trieste": {
                        "code": "TS"
                    },
                    "Torino": {
                        "label": "Turin",
                        "code": "TO"
                    },
                    "Udine": {
                        "code": "UD"
                    },
                    "Varese": {
                        "code": "VA"
                    },
                    "Venezia": {
                        "label": "Venice",
                        "code": "VE"
                    },
                    "Verbano-Cusio-Ossola": {
                        "code": "VB"
                    },
                    "Vercelli": {
                        "code": "VC"
                    },
                    "Verona": {
                        "code": "VR"
                    },
                    "Vibo Valentia": {
                        "code": "VV"
                    },
                    "Vicenza": {
                        "code": "VI"
                    },
                    "Viterbo": {
                        "code": "VT"
                    }
                }
            },
            "Japan": {
                "address_format": {
                    "edit": 10
                },
                "code": "JP",
                "flag_path": "/assets/flags/jp-51834ceb282af719ada5d7477c503a77711d1e57d0b0a5665d78497e6c9521c8.svg",
                "labels": {
                    "city": "City/ward/town/village",
                    "province": "Prefecture"
                },
                "provinces": {
                    "Hokkaidō": {
                        "label": "Hokkaido",
                        "alternate_names": [
                            "Hokkaido",
                            "Hokkaido Prefecture",
                            "北海道"
                        ],
                        "code": "JP-01"
                    },
                    "Aomori": {
                        "alternate_names": [
                            "Aomori Prefecture",
                            "Aomori-ken",
                            "青森県",
                            "青森"
                        ],
                        "code": "JP-02"
                    },
                    "Iwate": {
                        "alternate_names": [
                            "Iwate Prefecture",
                            "Iwate-ken",
                            "岩手県",
                            "岩手"
                        ],
                        "code": "JP-03"
                    },
                    "Miyagi": {
                        "alternate_names": [
                            "Miyagi Prefecture",
                            "Miyagi-ken",
                            "宮城県",
                            "宮城"
                        ],
                        "code": "JP-04"
                    },
                    "Akita": {
                        "alternate_names": [
                            "Akita Prefecture",
                            "Akita-ken",
                            "秋田県",
                            "秋田"
                        ],
                        "code": "JP-05"
                    },
                    "Yamagata": {
                        "alternate_names": [
                            "Yamagata Prefecture",
                            "Yamagata-ken",
                            "山形県",
                            "山形"
                        ],
                        "code": "JP-06"
                    },
                    "Fukushima": {
                        "alternate_names": [
                            "Fukushima Prefecture",
                            "Fukushima-ken",
                            "福島県",
                            "福島"
                        ],
                        "code": "JP-07"
                    },
                    "Ibaraki": {
                        "alternate_names": [
                            "Ibaraki Prefecture",
                            "Ibaraki-ken",
                            "茨城県",
                            "茨城"
                        ],
                        "code": "JP-08"
                    },
                    "Tochigi": {
                        "alternate_names": [
                            "Tochigi Prefecture",
                            "Tochigi-ken",
                            "栃木県",
                            "栃木"
                        ],
                        "code": "JP-09"
                    },
                    "Gunma": {
                        "alternate_names": [
                            "Gunma Prefecture",
                            "Gunma-ken",
                            "群馬県",
                            "群馬"
                        ],
                        "code": "JP-10"
                    },
                    "Saitama": {
                        "alternate_names": [
                            "Saitama Prefecture",
                            "Saitama-ken",
                            "埼玉県",
                            "埼玉"
                        ],
                        "code": "JP-11"
                    },
                    "Chiba": {
                        "alternate_names": [
                            "Chiba Prefecture",
                            "Chiba-ken",
                            "千葉県",
                            "千葉"
                        ],
                        "code": "JP-12"
                    },
                    "Tōkyō": {
                        "label": "Tokyo",
                        "alternate_names": [
                            "Tokyo",
                            "Tokyo Prefecture",
                            "Tōkyō-to",
                            "Tokyo-to",
                            "東京都",
                            "東京"
                        ],
                        "code": "JP-13"
                    },
                    "Kanagawa": {
                        "alternate_names": [
                            "Kanagawa Prefecture",
                            "Kanagawa-ken",
                            "神奈川県",
                            "神奈川"
                        ],
                        "code": "JP-14"
                    },
                    "Niigata": {
                        "alternate_names": [
                            "Niigata Prefecture",
                            "Niigata-ken",
                            "新潟県",
                            "新潟"
                        ],
                        "code": "JP-15"
                    },
                    "Toyama": {
                        "alternate_names": [
                            "Toyama Prefecture",
                            "Toyama-ken",
                            "富山県",
                            "富山"
                        ],
                        "code": "JP-16"
                    },
                    "Ishikawa": {
                        "alternate_names": [
                            "Ishikawa Prefecture",
                            "Ishikawa-ken",
                            "石川県",
                            "石川"
                        ],
                        "code": "JP-17"
                    },
                    "Fukui": {
                        "alternate_names": [
                            "Fukui Prefecture",
                            "Fukui-ken",
                            "福井県",
                            "福井"
                        ],
                        "code": "JP-18"
                    },
                    "Yamanashi": {
                        "alternate_names": [
                            "Yamanashi Prefecture",
                            "Yamanashi-ken",
                            "山梨県",
                            "山梨"
                        ],
                        "code": "JP-19"
                    },
                    "Nagano": {
                        "alternate_names": [
                            "Nagano Prefecture",
                            "Nagano-ken",
                            "長野県",
                            "長野"
                        ],
                        "code": "JP-20"
                    },
                    "Gifu": {
                        "alternate_names": [
                            "Gifu Prefecture",
                            "Gifu-ken",
                            "岐阜県",
                            "岐阜"
                        ],
                        "code": "JP-21"
                    },
                    "Shizuoka": {
                        "alternate_names": [
                            "Shizuoka Prefecture",
                            "Shizuoka-ken",
                            "静岡県",
                            "静岡"
                        ],
                        "code": "JP-22"
                    },
                    "Aichi": {
                        "alternate_names": [
                            "Aichi Prefecture",
                            "Aichi-ken",
                            "愛知県",
                            "愛知"
                        ],
                        "code": "JP-23"
                    },
                    "Mie": {
                        "alternate_names": [
                            "Mie Prefecture",
                            "Mie-ken",
                            "三重県",
                            "三重"
                        ],
                        "code": "JP-24"
                    },
                    "Shiga": {
                        "alternate_names": [
                            "Shiga Prefecture",
                            "Shiga-ken",
                            "滋賀県",
                            "滋賀"
                        ],
                        "code": "JP-25"
                    },
                    "Kyōto": {
                        "label": "Kyoto",
                        "alternate_names": [
                            "Kyoto",
                            "Kyoto Prefecture",
                            "Kyōto-fu",
                            "Kyoto-fu",
                            "京都府",
                            "京都"
                        ],
                        "code": "JP-26"
                    },
                    "Ōsaka": {
                        "label": "Osaka",
                        "alternate_names": [
                            "Osaka",
                            "Osaka Prefecture",
                            "Ōsaka-fu",
                            "Osaka-fu",
                            "大阪府",
                            "大阪"
                        ],
                        "code": "JP-27"
                    },
                    "Hyōgo": {
                        "label": "Hyogo",
                        "alternate_names": [
                            "Hyogo",
                            "Hyogo Prefecture",
                            "Hyōgo-ken",
                            "Hyogo-ken",
                            "兵庫県",
                            "兵庫"
                        ],
                        "code": "JP-28"
                    },
                    "Nara": {
                        "alternate_names": [
                            "Nara Prefecture",
                            "Nara-ken",
                            "奈良県",
                            "奈良"
                        ],
                        "code": "JP-29"
                    },
                    "Wakayama": {
                        "alternate_names": [
                            "Wakayama Prefecture",
                            "Wakayama-ken",
                            "和歌山県",
                            "和歌山"
                        ],
                        "code": "JP-30"
                    },
                    "Tottori": {
                        "alternate_names": [
                            "Tottori Prefecture",
                            "Tottori-ken",
                            "鳥取県",
                            "鳥取"
                        ],
                        "code": "JP-31"
                    },
                    "Shimane": {
                        "alternate_names": [
                            "Shimane Prefecture",
                            "Shimane-ken",
                            "島根県",
                            "島根"
                        ],
                        "code": "JP-32"
                    },
                    "Okayama": {
                        "alternate_names": [
                            "Okayama Prefecture",
                            "Okayama-ken",
                            "岡山県",
                            "岡山"
                        ],
                        "code": "JP-33"
                    },
                    "Hiroshima": {
                        "alternate_names": [
                            "Hiroshima Prefecture",
                            "Hiroshima-ken",
                            "広島県",
                            "広島"
                        ],
                        "code": "JP-34"
                    },
                    "Yamaguchi": {
                        "alternate_names": [
                            "Yamaguchi Prefecture",
                            "Yamaguchi-ken",
                            "山口県",
                            "山口"
                        ],
                        "code": "JP-35"
                    },
                    "Tokushima": {
                        "alternate_names": [
                            "Tokushima Prefecture",
                            "Tokushima-ken",
                            "徳島県",
                            "徳島"
                        ],
                        "code": "JP-36"
                    },
                    "Kagawa": {
                        "alternate_names": [
                            "Kagawa Prefecture",
                            "Kagawa-ken",
                            "香川県",
                            "香川"
                        ],
                        "code": "JP-37"
                    },
                    "Ehime": {
                        "alternate_names": [
                            "Ehime Prefecture",
                            "Ehime-ken",
                            "愛媛県",
                            "愛媛"
                        ],
                        "code": "JP-38"
                    },
                    "Kōchi": {
                        "label": "Kochi",
                        "alternate_names": [
                            "Kochi",
                            "Kochi Prefecture",
                            "Kōchi-ken",
                            "Kochi-ken",
                            "高知県",
                            "高知"
                        ],
                        "code": "JP-39"
                    },
                    "Fukuoka": {
                        "alternate_names": [
                            "Fukuoka Prefecture",
                            "Fukuoka-ken",
                            "福岡県",
                            "福岡"
                        ],
                        "code": "JP-40"
                    },
                    "Saga": {
                        "alternate_names": [
                            "Saga Prefecture",
                            "Saga-ken",
                            "佐賀県",
                            "佐賀"
                        ],
                        "code": "JP-41"
                    },
                    "Nagasaki": {
                        "alternate_names": [
                            "Nagasaki Prefecture",
                            "Nagasaki-ken",
                            "長崎県",
                            "長崎"
                        ],
                        "code": "JP-42"
                    },
                    "Kumamoto": {
                        "alternate_names": [
                            "Kumamoto Prefecture",
                            "Kumamoto-ken",
                            "熊本県",
                            "熊本"
                        ],
                        "code": "JP-43"
                    },
                    "Ōita": {
                        "label": "Oita",
                        "alternate_names": [
                            "Oita",
                            "Oita Prefecture",
                            "Ōita-ken",
                            "Oita-ken",
                            "大分県",
                            "大分"
                        ],
                        "code": "JP-44"
                    },
                    "Miyazaki": {
                        "alternate_names": [
                            "Miyazaki Prefecture",
                            "Miyazaki-ken",
                            "宮崎県",
                            "宮崎"
                        ],
                        "code": "JP-45"
                    },
                    "Kagoshima": {
                        "alternate_names": [
                            "Kagoshima Prefecture",
                            "Kagoshima-ken",
                            "鹿児島県",
                            "鹿児島"
                        ],
                        "code": "JP-46"
                    },
                    "Okinawa": {
                        "alternate_names": [
                            "Okinawa Prefecture",
                            "Okinawa-ken",
                            "沖縄県",
                            "沖縄"
                        ],
                        "code": "JP-47"
                    }
                }
            },
            "Malaysia": {
                "address_format": {
                    "edit": 3
                },
                "code": "MY",
                "flag_path": "/assets/flags/my-62b6693d248cda235b57a98a890d31675b9f374ae77d1c6432a80509d9708d5e.svg",
                "labels": {
                    "province": "State/territory",
                    "zip": "Postcode"
                },
                "provinces": {
                    "Johor": {
                        "code": "JHR"
                    },
                    "Kedah": {
                        "code": "KDH"
                    },
                    "Kelantan": {
                        "code": "KTN"
                    },
                    "Kuala Lumpur": {
                        "code": "KUL"
                    },
                    "Labuan": {
                        "code": "LBN"
                    },
                    "Melaka": {
                        "label": "Malacca",
                        "code": "MLK"
                    },
                    "Negeri Sembilan": {
                        "code": "NSN"
                    },
                    "Pahang": {
                        "code": "PHG"
                    },
                    "Penang": {
                        "alternate_names": [
                            "Pulau Pinang"
                        ],
                        "code": "PNG"
                    },
                    "Perak": {
                        "code": "PRK"
                    },
                    "Perlis": {
                        "code": "PLS"
                    },
                    "Putrajaya": {
                        "code": "PJY"
                    },
                    "Sabah": {
                        "code": "SBH"
                    },
                    "Sarawak": {
                        "code": "SWK"
                    },
                    "Selangor": {
                        "code": "SGR"
                    },
                    "Terengganu": {
                        "code": "TRG"
                    }
                }
            },
            "Mexico": {
                "address_format": {
                    "edit": 3
                },
                "code": "MX",
                "flag_path": "/assets/flags/mx-7c49b8206aa19f98841540b81f52c02bc28e0058528a8c0b2af4b6178de83f10.svg",
                "labels": {
                    "address1": "Street and house number",
                    "province": "State"
                },
                "provinces": {
                    "Aguascalientes": {
                        "code": "AGS"
                    },
                    "Baja California": {
                        "code": "BC"
                    },
                    "Baja California Sur": {
                        "code": "BCS"
                    },
                    "Campeche": {
                        "code": "CAMP"
                    },
                    "Chiapas": {
                        "code": "CHIS"
                    },
                    "Chihuahua": {
                        "code": "CHIH"
                    },
                    "Ciudad de México": {
                        "label": "Ciudad de Mexico",
                        "alternate_names": [
                            "Ciudad de Mexico",
                            "CDMX"
                        ],
                        "code": "DF"
                    },
                    "Coahuila": {
                        "code": "COAH"
                    },
                    "Colima": {
                        "code": "COL"
                    },
                    "Durango": {
                        "code": "DGO"
                    },
                    "Guanajuato": {
                        "code": "GTO"
                    },
                    "Guerrero": {
                        "code": "GRO"
                    },
                    "Hidalgo": {
                        "code": "HGO"
                    },
                    "Jalisco": {
                        "alternate_names": [
                            "Jal."
                        ],
                        "code": "JAL"
                    },
                    "México": {
                        "label": "Mexico State",
                        "alternate_names": [
                            "Mexico"
                        ],
                        "code": "MEX"
                    },
                    "Michoacán": {
                        "alternate_names": [
                            "Michoacan"
                        ],
                        "code": "MICH"
                    },
                    "Morelos": {
                        "code": "MOR"
                    },
                    "Nayarit": {
                        "code": "NAY"
                    },
                    "Nuevo León": {
                        "alternate_names": [
                            "Nuevo Leon"
                        ],
                        "code": "NL"
                    },
                    "Oaxaca": {
                        "code": "OAX"
                    },
                    "Puebla": {
                        "code": "PUE"
                    },
                    "Querétaro": {
                        "alternate_names": [
                            "Queretaro"
                        ],
                        "code": "QRO"
                    },
                    "Quintana Roo": {
                        "code": "Q ROO"
                    },
                    "San Luis Potosí": {
                        "alternate_names": [
                            "San Luis Potosi"
                        ],
                        "code": "SLP"
                    },
                    "Sinaloa": {
                        "code": "SIN"
                    },
                    "Sonora": {
                        "code": "SON"
                    },
                    "Tabasco": {
                        "code": "TAB"
                    },
                    "Tamaulipas": {
                        "code": "TAMPS"
                    },
                    "Tlaxcala": {
                        "code": "TLAX"
                    },
                    "Veracruz": {
                        "code": "VER"
                    },
                    "Yucatán": {
                        "alternate_names": [
                            "Yucatan"
                        ],
                        "code": "YUC"
                    },
                    "Zacatecas": {
                        "code": "ZAC"
                    }
                }
            },
            "New Zealand": {
                "address_format": {
                    "edit": 4
                },
                "code": "NZ",
                "flag_path": "/assets/flags/nz-067fcad818cb43f94a1b4912fc8aabba2ebf649c0012a155227b7b9d7bff5e2a.svg",
                "provinces": {
                    "Auckland": {
                        "code": "AUK"
                    },
                    "Bay of Plenty": {
                        "code": "BOP"
                    },
                    "Canterbury": {
                        "code": "CAN"
                    },
                    "Chatham Islands": {
                        "code": "CIT"
                    },
                    "Gisborne": {
                        "code": "GIS"
                    },
                    "Hawke's Bay": {
                        "label": "Hawke’s Bay",
                        "code": "HKB"
                    },
                    "Manawatu-Wanganui": {
                        "code": "MWT"
                    },
                    "Marlborough": {
                        "code": "MBH"
                    },
                    "Nelson": {
                        "code": "NSN"
                    },
                    "Northland": {
                        "code": "NTL"
                    },
                    "Otago": {
                        "code": "OTA"
                    },
                    "Southland": {
                        "code": "STL"
                    },
                    "Taranaki": {
                        "code": "TKI"
                    },
                    "Tasman": {
                        "code": "TAS"
                    },
                    "Waikato": {
                        "code": "WKO"
                    },
                    "Wellington": {
                        "code": "WGN"
                    },
                    "West Coast": {
                        "code": "WTC"
                    }
                }
            },
            "Nigeria": {
                "address_format": {
                    "edit": 4
                },
                "code": "NG",
                "flag_path": "/assets/flags/ng-57301401e20c7ebd6687c930caa9c10c227b593bd38b15a217c45f3f2c36a166.svg",
                "labels": {
                    "province": "State"
                },
                "provinces": {
                    "Abia": {
                        "code": "AB"
                    },
                    "Adamawa": {
                        "code": "AD"
                    },
                    "Akwa Ibom": {
                        "code": "AK"
                    },
                    "Anambra": {
                        "code": "AN"
                    },
                    "Bauchi": {
                        "code": "BA"
                    },
                    "Bayelsa": {
                        "code": "BY"
                    },
                    "Benue": {
                        "code": "BE"
                    },
                    "Borno": {
                        "code": "BO"
                    },
                    "Cross River": {
                        "code": "CR"
                    },
                    "Delta": {
                        "code": "DE"
                    },
                    "Ebonyi": {
                        "code": "EB"
                    },
                    "Edo": {
                        "code": "ED"
                    },
                    "Ekiti": {
                        "code": "EK"
                    },
                    "Enugu": {
                        "code": "EN"
                    },
                    "Abuja Federal Capital Territory": {
                        "label": "Federal Capital Territory",
                        "alternate_names": [
                            "Abuja"
                        ],
                        "code": "FC"
                    },
                    "Gombe": {
                        "code": "GO"
                    },
                    "Imo": {
                        "code": "IM"
                    },
                    "Jigawa": {
                        "code": "JI"
                    },
                    "Kaduna": {
                        "code": "KD"
                    },
                    "Kano": {
                        "code": "KN"
                    },
                    "Katsina": {
                        "code": "KT"
                    },
                    "Kebbi": {
                        "code": "KE"
                    },
                    "Kogi": {
                        "code": "KO"
                    },
                    "Kwara": {
                        "code": "KW"
                    },
                    "Lagos": {
                        "code": "LA"
                    },
                    "Nasarawa": {
                        "code": "NA"
                    },
                    "Niger": {
                        "code": "NI"
                    },
                    "Ogun": {
                        "code": "OG"
                    },
                    "Ondo": {
                        "code": "ON"
                    },
                    "Osun": {
                        "code": "OS"
                    },
                    "Oyo": {
                        "code": "OY"
                    },
                    "Plateau": {
                        "code": "PL"
                    },
                    "Rivers": {
                        "code": "RI"
                    },
                    "Sokoto": {
                        "code": "SO"
                    },
                    "Taraba": {
                        "code": "TA"
                    },
                    "Yobe": {
                        "code": "YO"
                    },
                    "Zamfara": {
                        "code": "ZA"
                    }
                }
            },
            "Panama": {
                "address_format": {
                    "edit": 7
                },
                "code": "PA",
                "flag_path": "/assets/flags/pa-ceb96947effb2596e74c37fa80a049626b71dee595bf21ba5754ac103ac4c476.svg",
                "provinces": {
                    "Bocas del Toro": {
                        "code": "PA-1"
                    },
                    "Chiriquí": {
                        "alternate_names": [
                            "Chiriqui"
                        ],
                        "code": "PA-4"
                    },
                    "Coclé": {
                        "alternate_names": [
                            "Cocle"
                        ],
                        "code": "PA-2"
                    },
                    "Colón": {
                        "alternate_names": [
                            "Colon"
                        ],
                        "code": "PA-3"
                    },
                    "Darién": {
                        "alternate_names": [
                            "Darien"
                        ],
                        "code": "PA-5"
                    },
                    "Emberá": {
                        "alternate_names": [
                            "Embera"
                        ],
                        "code": "PA-EM"
                    },
                    "Kuna Yala": {
                        "label": "Guna Yala",
                        "code": "PA-KY"
                    },
                    "Herrera": {
                        "code": "PA-6"
                    },
                    "Los Santos": {
                        "code": "PA-7"
                    },
                    "Ngöbe-Buglé": {
                        "alternate_names": [
                            "Ngobe-Bugle"
                        ],
                        "code": "PA-NB"
                    },
                    "Panamá": {
                        "alternate_names": [
                            "Panama"
                        ],
                        "code": "PA-8"
                    },
                    "Veraguas": {
                        "code": "PA-9"
                    },
                    "Panamá Oeste": {
                        "label": "West Panamá",
                        "alternate_names": [
                            "Panama Oeste"
                        ],
                        "code": "PA-10"
                    }
                }
            },
            "Peru": {
                "address_format": {
                    "edit": 4
                },
                "code": "PE",
                "flag_path": "/assets/flags/pe-0e5601aa50fdf7ab9f060114fd66def0f9b37b04177c5d043bb8fe46bef7f90a.svg",
                "provinces": {
                    "Amazonas": {
                        "code": "PE-AMA"
                    },
                    "Áncash": {
                        "label": "Ancash",
                        "alternate_names": [
                            "Ancash",
                            "Ancash"
                        ],
                        "code": "PE-ANC"
                    },
                    "Apurímac": {
                        "alternate_names": [
                            "Apurimac",
                            "Apurimac"
                        ],
                        "code": "PE-APU"
                    },
                    "Arequipa": {
                        "code": "PE-ARE"
                    },
                    "Ayacucho": {
                        "code": "PE-AYA"
                    },
                    "Cajamarca": {
                        "code": "PE-CAJ"
                    },
                    "Cuzco": {
                        "label": "Cusco",
                        "code": "PE-CUS"
                    },
                    "Callao": {
                        "label": "El Callao",
                        "code": "PE-CAL"
                    },
                    "Huancavelica": {
                        "code": "PE-HUV"
                    },
                    "Huánuco": {
                        "alternate_names": [
                            "Huanuco",
                            "Huanuco"
                        ],
                        "code": "PE-HUC"
                    },
                    "Ica": {
                        "code": "PE-ICA"
                    },
                    "Junín": {
                        "alternate_names": [
                            "Junin",
                            "Junin"
                        ],
                        "code": "PE-JUN"
                    },
                    "La Libertad": {
                        "code": "PE-LAL"
                    },
                    "Lambayeque": {
                        "code": "PE-LAM"
                    },
                    "Lima (provincia)": {
                        "label": "Lima",
                        "code": "PE-LMA"
                    },
                    "Lima (departamento)": {
                        "label": "Lima Region",
                        "code": "PE-LIM"
                    },
                    "Loreto": {
                        "code": "PE-LOR"
                    },
                    "Madre de Dios": {
                        "code": "PE-MDD"
                    },
                    "Moquegua": {
                        "code": "PE-MOQ"
                    },
                    "Pasco": {
                        "code": "PE-PAS"
                    },
                    "Piura": {
                        "code": "PE-PIU"
                    },
                    "Puno": {
                        "code": "PE-PUN"
                    },
                    "San Martín": {
                        "alternate_names": [
                            "San Martin",
                            "San Martin"
                        ],
                        "code": "PE-SAM"
                    },
                    "Tacna": {
                        "code": "PE-TAC"
                    },
                    "Tumbes": {
                        "code": "PE-TUM"
                    },
                    "Ucayali": {
                        "code": "PE-UCA"
                    }
                }
            },
            "Philippines": {
                "address_format": {
                    "edit": 5
                },
                "code": "PH",
                "flag_path": "/assets/flags/ph-b4958dc8963871a24b0ca6ddec26c436eeee34c0bf34e8e14f9717c708a2c606.svg",
                "provinces": {
                    "Abra": {
                        "code": "PH-ABR"
                    },
                    "Agusan del Norte": {
                        "code": "PH-AGN"
                    },
                    "Agusan del Sur": {
                        "code": "PH-AGS"
                    },
                    "Aklan": {
                        "code": "PH-AKL"
                    },
                    "Albay": {
                        "code": "PH-ALB"
                    },
                    "Antique": {
                        "code": "PH-ANT"
                    },
                    "Apayao": {
                        "code": "PH-APA"
                    },
                    "Aurora": {
                        "code": "PH-AUR"
                    },
                    "Basilan": {
                        "code": "PH-BAS"
                    },
                    "Bataan": {
                        "code": "PH-BAN"
                    },
                    "Batanes": {
                        "code": "PH-BTN"
                    },
                    "Batangas": {
                        "code": "PH-BTG"
                    },
                    "Benguet": {
                        "code": "PH-BEN"
                    },
                    "Biliran": {
                        "code": "PH-BIL"
                    },
                    "Bohol": {
                        "code": "PH-BOH"
                    },
                    "Bukidnon": {
                        "code": "PH-BUK"
                    },
                    "Bulacan": {
                        "code": "PH-BUL"
                    },
                    "Cagayan": {
                        "code": "PH-CAG"
                    },
                    "Camarines Norte": {
                        "code": "PH-CAN"
                    },
                    "Camarines Sur": {
                        "code": "PH-CAS"
                    },
                    "Camiguin": {
                        "code": "PH-CAM"
                    },
                    "Capiz": {
                        "code": "PH-CAP"
                    },
                    "Catanduanes": {
                        "code": "PH-CAT"
                    },
                    "Cavite": {
                        "code": "PH-CAV"
                    },
                    "Cebu": {
                        "code": "PH-CEB"
                    },
                    "Davao de Oro": {
                        "label": "Compostela Valley",
                        "code": "PH-COM"
                    },
                    "Cotabato": {
                        "code": "PH-NCO"
                    },
                    "Davao Occidental": {
                        "code": "PH-DVO"
                    },
                    "Davao Oriental": {
                        "code": "PH-DAO"
                    },
                    "Davao del Norte": {
                        "code": "PH-DAV"
                    },
                    "Davao del Sur": {
                        "code": "PH-DAS"
                    },
                    "Dinagat Islands": {
                        "code": "PH-DIN"
                    },
                    "Eastern Samar": {
                        "code": "PH-EAS"
                    },
                    "Guimaras": {
                        "code": "PH-GUI"
                    },
                    "Ifugao": {
                        "code": "PH-IFU"
                    },
                    "Ilocos Norte": {
                        "code": "PH-ILN"
                    },
                    "Ilocos Sur": {
                        "code": "PH-ILS"
                    },
                    "Iloilo": {
                        "code": "PH-ILI"
                    },
                    "Isabela": {
                        "code": "PH-ISA"
                    },
                    "Kalinga": {
                        "code": "PH-KAL"
                    },
                    "La Union": {
                        "code": "PH-LUN"
                    },
                    "Laguna": {
                        "code": "PH-LAG"
                    },
                    "Lanao del Norte": {
                        "code": "PH-LAN"
                    },
                    "Lanao del Sur": {
                        "code": "PH-LAS"
                    },
                    "Leyte": {
                        "code": "PH-LEY"
                    },
                    "Maguindanao": {
                        "code": "PH-MAG"
                    },
                    "Marinduque": {
                        "code": "PH-MAD"
                    },
                    "Masbate": {
                        "code": "PH-MAS"
                    },
                    "Metro Manila": {
                        "code": "PH-00"
                    },
                    "Misamis Occidental": {
                        "code": "PH-MSC"
                    },
                    "Misamis Oriental": {
                        "code": "PH-MSR"
                    },
                    "Mountain Province": {
                        "label": "Mountain",
                        "code": "PH-MOU"
                    },
                    "Negros Occidental": {
                        "code": "PH-NEC"
                    },
                    "Negros Oriental": {
                        "code": "PH-NER"
                    },
                    "Northern Samar": {
                        "code": "PH-NSA"
                    },
                    "Nueva Ecija": {
                        "code": "PH-NUE"
                    },
                    "Nueva Vizcaya": {
                        "code": "PH-NUV"
                    },
                    "Occidental Mindoro": {
                        "code": "PH-MDC"
                    },
                    "Oriental Mindoro": {
                        "code": "PH-MDR"
                    },
                    "Palawan": {
                        "code": "PH-PLW"
                    },
                    "Pampanga": {
                        "code": "PH-PAM"
                    },
                    "Pangasinan": {
                        "code": "PH-PAN"
                    },
                    "Quezon": {
                        "code": "PH-QUE"
                    },
                    "Quirino": {
                        "code": "PH-QUI"
                    },
                    "Rizal": {
                        "code": "PH-RIZ"
                    },
                    "Romblon": {
                        "code": "PH-ROM"
                    },
                    "Samar": {
                        "code": "PH-WSA"
                    },
                    "Sarangani": {
                        "code": "PH-SAR"
                    },
                    "Siquijor": {
                        "code": "PH-SIG"
                    },
                    "Sorsogon": {
                        "code": "PH-SOR"
                    },
                    "South Cotabato": {
                        "code": "PH-SCO"
                    },
                    "Southern Leyte": {
                        "code": "PH-SLE"
                    },
                    "Sultan Kudarat": {
                        "code": "PH-SUK"
                    },
                    "Sulu": {
                        "code": "PH-SLU"
                    },
                    "Surigao del Norte": {
                        "code": "PH-SUN"
                    },
                    "Surigao del Sur": {
                        "code": "PH-SUR"
                    },
                    "Tarlac": {
                        "code": "PH-TAR"
                    },
                    "Tawi-Tawi": {
                        "code": "PH-TAW"
                    },
                    "Zambales": {
                        "code": "PH-ZMB"
                    },
                    "Zamboanga Sibugay": {
                        "code": "PH-ZSI"
                    },
                    "Zamboanga del Norte": {
                        "code": "PH-ZAN"
                    },
                    "Zamboanga del Sur": {
                        "code": "PH-ZAS"
                    }
                }
            },
            "Portugal": {
                "address_format": {
                    "edit": 4
                },
                "code": "PT",
                "flag_path": "/assets/flags/pt-6607776592531b9043b8733f61f360acee1731a1ae6b797583ec6f4b3b2843dc.svg",
                "provinces": {
                    "Aveiro": {
                        "code": "PT-01"
                    },
                    "Açores": {
                        "label": "Azores",
                        "alternate_names": [
                            "Acores"
                        ],
                        "code": "PT-20"
                    },
                    "Beja": {
                        "code": "PT-02"
                    },
                    "Braga": {
                        "code": "PT-03"
                    },
                    "Bragança": {
                        "alternate_names": [
                            "Braganca"
                        ],
                        "code": "PT-04"
                    },
                    "Castelo Branco": {
                        "code": "PT-05"
                    },
                    "Coimbra": {
                        "code": "PT-06"
                    },
                    "Évora": {
                        "alternate_names": [
                            "Evora"
                        ],
                        "code": "PT-07"
                    },
                    "Faro": {
                        "code": "PT-08"
                    },
                    "Guarda": {
                        "code": "PT-09"
                    },
                    "Leiria": {
                        "code": "PT-10"
                    },
                    "Lisboa": {
                        "label": "Lisbon",
                        "code": "PT-11"
                    },
                    "Madeira": {
                        "code": "PT-30"
                    },
                    "Portalegre": {
                        "code": "PT-12"
                    },
                    "Porto": {
                        "code": "PT-13"
                    },
                    "Santarém": {
                        "alternate_names": [
                            "Santarem"
                        ],
                        "code": "PT-14"
                    },
                    "Setúbal": {
                        "alternate_names": [
                            "Setubal"
                        ],
                        "code": "PT-15"
                    },
                    "Viana do Castelo": {
                        "code": "PT-16"
                    },
                    "Vila Real": {
                        "code": "PT-17"
                    },
                    "Viseu": {
                        "code": "PT-18"
                    }
                }
            },
            "Romania": {
                "address_format": {
                    "edit": 3
                },
                "code": "RO",
                "flag_path": "/assets/flags/ro-15755637dd265e88f60a53a6e62d8daf8ad893dfa4e42f51085b9c778f0d2e91.svg",
                "labels": {
                    "province": "County"
                },
                "provinces": {
                    "Alba": {
                        "code": "AB"
                    },
                    "Arad": {
                        "code": "AR"
                    },
                    "Argeș": {
                        "alternate_names": [
                            "Arge?"
                        ],
                        "code": "AG"
                    },
                    "Bacău": {
                        "alternate_names": [
                            "Bacau"
                        ],
                        "code": "BC"
                    },
                    "Bihor": {
                        "code": "BH"
                    },
                    "Bistrița-Năsăud": {
                        "label": "Bistriţa-Năsăud",
                        "alternate_names": [
                            "Bistri?a-Nasaud"
                        ],
                        "code": "BN"
                    },
                    "Botoșani": {
                        "label": "Botoşani",
                        "alternate_names": [
                            "Boto?ani"
                        ],
                        "code": "BT"
                    },
                    "Brăila": {
                        "alternate_names": [
                            "Braila"
                        ],
                        "code": "BR"
                    },
                    "Brașov": {
                        "label": "Braşov",
                        "alternate_names": [
                            "Bra?ov"
                        ],
                        "code": "BV"
                    },
                    "București": {
                        "label": "Bucharest",
                        "alternate_names": [
                            "Bucure?ti"
                        ],
                        "code": "B"
                    },
                    "Buzău": {
                        "alternate_names": [
                            "Buzau"
                        ],
                        "code": "BZ"
                    },
                    "Caraș-Severin": {
                        "alternate_names": [
                            "Cara?-Severin"
                        ],
                        "code": "CS"
                    },
                    "Cluj": {
                        "code": "CJ"
                    },
                    "Constanța": {
                        "alternate_names": [
                            "Constan?a"
                        ],
                        "code": "CT"
                    },
                    "Covasna": {
                        "code": "CV"
                    },
                    "Călărași": {
                        "alternate_names": [
                            "Calara?i"
                        ],
                        "code": "CL"
                    },
                    "Dolj": {
                        "code": "DJ"
                    },
                    "Dâmbovița": {
                        "alternate_names": [
                            "Dambovi?a"
                        ],
                        "code": "DB"
                    },
                    "Galați": {
                        "alternate_names": [
                            "Gala?i"
                        ],
                        "code": "GL"
                    },
                    "Giurgiu": {
                        "code": "GR"
                    },
                    "Gorj": {
                        "code": "GJ"
                    },
                    "Harghita": {
                        "code": "HR"
                    },
                    "Hunedoara": {
                        "code": "HD"
                    },
                    "Ialomița": {
                        "alternate_names": [
                            "Ialomi?a"
                        ],
                        "code": "IL"
                    },
                    "Iași": {
                        "alternate_names": [
                            "Ia?i"
                        ],
                        "code": "IS"
                    },
                    "Ilfov": {
                        "code": "IF"
                    },
                    "Maramureș": {
                        "label": "Maramureş",
                        "alternate_names": [
                            "Maramure?"
                        ],
                        "code": "MM"
                    },
                    "Mehedinți": {
                        "alternate_names": [
                            "Mehedin?i"
                        ],
                        "code": "MH"
                    },
                    "Mureș": {
                        "label": "Mureş",
                        "alternate_names": [
                            "Mure?"
                        ],
                        "code": "MS"
                    },
                    "Neamț": {
                        "label": "Neamţ",
                        "alternate_names": [
                            "Neam?"
                        ],
                        "code": "NT"
                    },
                    "Olt": {
                        "code": "OT"
                    },
                    "Prahova": {
                        "code": "PH"
                    },
                    "Sălaj": {
                        "alternate_names": [
                            "Salaj"
                        ],
                        "code": "SJ"
                    },
                    "Satu Mare": {
                        "code": "SM"
                    },
                    "Sibiu": {
                        "code": "SB"
                    },
                    "Suceava": {
                        "code": "SV"
                    },
                    "Teleorman": {
                        "code": "TR"
                    },
                    "Timiș": {
                        "alternate_names": [
                            "Timi?"
                        ],
                        "code": "TM"
                    },
                    "Tulcea": {
                        "code": "TL"
                    },
                    "Vâlcea": {
                        "alternate_names": [
                            "Valcea"
                        ],
                        "code": "VL"
                    },
                    "Vaslui": {
                        "code": "VS"
                    },
                    "Vrancea": {
                        "code": "VN"
                    }
                }
            },
            "Russia": {
                "address_format": {
                    "edit": 4
                },
                "code": "RU",
                "flag_path": "/assets/flags/ru-6963edca3433f981a1b431600ddee98cc8451da01629c9bf394835a859291bf1.svg",
                "provinces": {
                    "Republic of Adygeya": {
                        "label": "Adygea",
                        "code": "AD"
                    },
                    "Altai Republic": {
                        "label": "Altai",
                        "code": "AL"
                    },
                    "Altai Krai": {
                        "code": "ALT"
                    },
                    "Amur Oblast": {
                        "label": "Amur",
                        "code": "AMU"
                    },
                    "Arkhangelsk Oblast": {
                        "label": "Arkhangelsk",
                        "code": "ARK"
                    },
                    "Astrakhan Oblast": {
                        "label": "Astrakhan",
                        "code": "AST"
                    },
                    "Republic of Bashkortostan": {
                        "label": "Bashkortostan",
                        "code": "BA"
                    },
                    "Belgorod Oblast": {
                        "label": "Belgorod",
                        "code": "BEL"
                    },
                    "Bryansk Oblast": {
                        "label": "Bryansk",
                        "code": "BRY"
                    },
                    "Republic of Buryatia": {
                        "label": "Buryat",
                        "code": "BU"
                    },
                    "Chechen Republic": {
                        "label": "Chechen",
                        "code": "CE"
                    },
                    "Chelyabinsk Oblast": {
                        "label": "Chelyabinsk",
                        "code": "CHE"
                    },
                    "Chukotka Autonomous Okrug": {
                        "label": "Chukotka Okrug",
                        "code": "CHU"
                    },
                    "Chuvash Republic": {
                        "label": "Chuvash",
                        "code": "CU"
                    },
                    "Republic of Dagestan": {
                        "label": "Dagestan",
                        "code": "DA"
                    },
                    "Republic of Ingushetia": {
                        "label": "Ingushetia",
                        "code": "IN"
                    },
                    "Irkutsk Oblast": {
                        "label": "Irkutsk",
                        "code": "IRK"
                    },
                    "Ivanovo Oblast": {
                        "label": "Ivanovo",
                        "code": "IVA"
                    },
                    "Jewish Autonomous Oblast": {
                        "label": "Jewish",
                        "code": "YEV"
                    },
                    "Kabardino-Balkarian Republic": {
                        "label": "Kabardino-Balkar",
                        "code": "KB"
                    },
                    "Kaliningrad Oblast": {
                        "label": "Kaliningrad",
                        "code": "KGD"
                    },
                    "Republic of Kalmykia": {
                        "label": "Kalmykia",
                        "code": "KL"
                    },
                    "Kaluga Oblast": {
                        "label": "Kaluga",
                        "code": "KLU"
                    },
                    "Kamchatka Krai": {
                        "code": "KAM"
                    },
                    "Karachay–Cherkess Republic": {
                        "label": "Karachay-Cherkess",
                        "alternate_names": [
                            "Karachay?Cherkess Republic"
                        ],
                        "code": "KC"
                    },
                    "Republic of Karelia": {
                        "label": "Karelia",
                        "code": "KR"
                    },
                    "Kemerovo Oblast": {
                        "label": "Kemerovo",
                        "code": "KEM"
                    },
                    "Khabarovsk Krai": {
                        "code": "KHA"
                    },
                    "Republic of Khakassia": {
                        "label": "Khakassia",
                        "code": "KK"
                    },
                    "Khanty-Mansi Autonomous Okrug": {
                        "label": "Khanty-Mansi",
                        "code": "KHM"
                    },
                    "Kirov Oblast": {
                        "label": "Kirov",
                        "code": "KIR"
                    },
                    "Komi Republic": {
                        "label": "Komi",
                        "code": "KO"
                    },
                    "Kostroma Oblast": {
                        "label": "Kostroma",
                        "code": "KOS"
                    },
                    "Krasnodar Krai": {
                        "code": "KDA"
                    },
                    "Krasnoyarsk Krai": {
                        "code": "KYA"
                    },
                    "Kurgan Oblast": {
                        "label": "Kurgan",
                        "code": "KGN"
                    },
                    "Kursk Oblast": {
                        "label": "Kursk",
                        "code": "KRS"
                    },
                    "Leningrad Oblast": {
                        "label": "Leningrad",
                        "code": "LEN"
                    },
                    "Lipetsk Oblast": {
                        "label": "Lipetsk",
                        "code": "LIP"
                    },
                    "Magadan Oblast": {
                        "label": "Magadan",
                        "code": "MAG"
                    },
                    "Mari El Republic": {
                        "label": "Mari El",
                        "code": "ME"
                    },
                    "Republic of Mordovia": {
                        "label": "Mordovia",
                        "code": "MO"
                    },
                    "Moscow": {
                        "code": "MOW"
                    },
                    "Moscow Oblast": {
                        "label": "Moscow Province",
                        "code": "MOS"
                    },
                    "Murmansk Oblast": {
                        "label": "Murmansk",
                        "code": "MUR"
                    },
                    "Nizhny Novgorod Oblast": {
                        "label": "Nizhny Novgorod",
                        "code": "NIZ"
                    },
                    "Republic of North Ossetia–Alania": {
                        "label": "North Ossetia-Alania",
                        "alternate_names": [
                            "Republic of North Ossetia?Alania"
                        ],
                        "code": "SE"
                    },
                    "Novgorod Oblast": {
                        "label": "Novgorod",
                        "code": "NGR"
                    },
                    "Novosibirsk Oblast": {
                        "label": "Novosibirsk",
                        "code": "NVS"
                    },
                    "Omsk Oblast": {
                        "label": "Omsk",
                        "code": "OMS"
                    },
                    "Orenburg Oblast": {
                        "label": "Orenburg",
                        "code": "ORE"
                    },
                    "Oryol Oblast": {
                        "label": "Oryol",
                        "code": "ORL"
                    },
                    "Penza Oblast": {
                        "label": "Penza",
                        "code": "PNZ"
                    },
                    "Perm Krai": {
                        "code": "PER"
                    },
                    "Primorsky Krai": {
                        "code": "PRI"
                    },
                    "Pskov Oblast": {
                        "label": "Pskov",
                        "code": "PSK"
                    },
                    "Rostov Oblast": {
                        "label": "Rostov",
                        "code": "ROS"
                    },
                    "Ryazan Oblast": {
                        "label": "Ryazan",
                        "code": "RYA"
                    },
                    "Saint Petersburg": {
                        "code": "SPE"
                    },
                    "Sakha Republic (Yakutia)": {
                        "label": "Sakha",
                        "code": "SA"
                    },
                    "Sakhalin Oblast": {
                        "label": "Sakhalin",
                        "code": "SAK"
                    },
                    "Samara Oblast": {
                        "label": "Samara",
                        "code": "SAM"
                    },
                    "Saratov Oblast": {
                        "label": "Saratov",
                        "code": "SAR"
                    },
                    "Smolensk Oblast": {
                        "label": "Smolensk",
                        "code": "SMO"
                    },
                    "Stavropol Krai": {
                        "code": "STA"
                    },
                    "Sverdlovsk Oblast": {
                        "label": "Sverdlovsk",
                        "code": "SVE"
                    },
                    "Tambov Oblast": {
                        "label": "Tambov",
                        "code": "TAM"
                    },
                    "Republic of Tatarstan": {
                        "label": "Tatarstan",
                        "code": "TA"
                    },
                    "Tomsk Oblast": {
                        "label": "Tomsk",
                        "code": "TOM"
                    },
                    "Tula Oblast": {
                        "label": "Tula",
                        "code": "TUL"
                    },
                    "Tyva Republic": {
                        "label": "Tuva",
                        "code": "TY"
                    },
                    "Tver Oblast": {
                        "label": "Tver",
                        "code": "TVE"
                    },
                    "Tyumen Oblast": {
                        "label": "Tyumen",
                        "code": "TYU"
                    },
                    "Udmurtia": {
                        "label": "Udmurt",
                        "code": "UD"
                    },
                    "Ulyanovsk Oblast": {
                        "label": "Ulyanovsk",
                        "code": "ULY"
                    },
                    "Vladimir Oblast": {
                        "label": "Vladimir",
                        "code": "VLA"
                    },
                    "Volgograd Oblast": {
                        "label": "Volgograd",
                        "code": "VGG"
                    },
                    "Vologda Oblast": {
                        "label": "Vologda",
                        "code": "VLG"
                    },
                    "Voronezh Oblast": {
                        "label": "Voronezh",
                        "code": "VOR"
                    },
                    "Yamalo-Nenets Autonomous Okrug": {
                        "label": "Yamalo-Nenets Okrug",
                        "code": "YAN"
                    },
                    "Yaroslavl Oblast": {
                        "label": "Yaroslavl",
                        "code": "YAR"
                    },
                    "Zabaykalsky Krai": {
                        "code": "ZAB"
                    }
                }
            },
            "South Africa": {
                "address_format": {
                    "edit": 4
                },
                "code": "ZA",
                "flag_path": "/assets/flags/za-2bc4ce21e2f155186022d608ae17af208ac7929dae2975c8e8d3fe0567ecf761.svg",
                "labels": {
                    "province": "Province"
                },
                "provinces": {
                    "Eastern Cape": {
                        "code": "EC"
                    },
                    "Free State": {
                        "code": "FS"
                    },
                    "Gauteng": {
                        "code": "GT"
                    },
                    "KwaZulu-Natal": {
                        "code": "NL"
                    },
                    "Limpopo": {
                        "code": "LP"
                    },
                    "Mpumalanga": {
                        "code": "MP"
                    },
                    "North West": {
                        "code": "NW"
                    },
                    "Northern Cape": {
                        "code": "NC"
                    },
                    "Western Cape": {
                        "code": "WC"
                    }
                }
            },
            "South Korea": {
                "address_format": {
                    "edit": 14
                },
                "code": "KR",
                "flag_path": "/assets/flags/kr-226f316d7ae7a184e23d015e3982bd9d685ac8071fc2ee19906d0f6031489f19.svg",
                "labels": {
                    "province": "Province"
                },
                "provinces": {
                    "Busan": {
                        "code": "KR-26"
                    },
                    "Daegu": {
                        "code": "KR-27"
                    },
                    "Daejeon": {
                        "code": "KR-30"
                    },
                    "Gangwon": {
                        "code": "KR-42"
                    },
                    "Gwangju": {
                        "label": "Gwangju City",
                        "code": "KR-29"
                    },
                    "Gyeonggi": {
                        "code": "KR-41"
                    },
                    "Incheon": {
                        "code": "KR-28"
                    },
                    "Jeju": {
                        "code": "KR-49"
                    },
                    "Chungbuk": {
                        "label": "North Chungcheong",
                        "code": "KR-43"
                    },
                    "Gyeongbuk": {
                        "label": "North Gyeongsang",
                        "code": "KR-47"
                    },
                    "Jeonbuk": {
                        "label": "North Jeolla",
                        "code": "KR-45"
                    },
                    "Sejong": {
                        "code": "KR-50"
                    },
                    "Seoul": {
                        "code": "KR-11"
                    },
                    "Chungnam": {
                        "label": "South Chungcheong",
                        "code": "KR-44"
                    },
                    "Gyeongnam": {
                        "label": "South Gyeongsang",
                        "code": "KR-48"
                    },
                    "Jeonnam": {
                        "label": "South Jeolla",
                        "code": "KR-46"
                    },
                    "Ulsan": {
                        "code": "KR-31"
                    }
                }
            },
            "Spain": {
                "address_format": {
                    "edit": 9
                },
                "code": "ES",
                "flag_path": "/assets/flags/es-65865b592449f3b8d056283310c88f3bbfc439a23ff1df1a25c811b07a54f1e8.svg",
                "labels": {
                    "address1": "Street and house number",
                    "province": "Province"
                },
                "provinces": {
                    "A Coruña": {
                        "alternate_names": [
                            "A Coruna"
                        ],
                        "code": "C"
                    },
                    "Álava": {
                        "alternate_names": [
                            "Alava",
                            "Araba"
                        ],
                        "code": "VI"
                    },
                    "Albacete": {
                        "code": "AB"
                    },
                    "Alicante": {
                        "code": "A"
                    },
                    "Almería": {
                        "alternate_names": [
                            "Almeria"
                        ],
                        "code": "AL"
                    },
                    "Asturias": {
                        "label": "Asturias Province",
                        "alternate_names": [
                            "Principado de Asturias"
                        ],
                        "code": "O"
                    },
                    "Ávila": {
                        "alternate_names": [
                            "Avila"
                        ],
                        "code": "AV"
                    },
                    "Badajoz": {
                        "code": "BA"
                    },
                    "Balears": {
                        "label": "Balears Province",
                        "alternate_names": [
                            "Baleares",
                            "Illes Balears",
                            "Islas Baleares"
                        ],
                        "code": "PM"
                    },
                    "Barcelona": {
                        "code": "B"
                    },
                    "Vizcaya": {
                        "label": "Biscay",
                        "alternate_names": [
                            "Biscay",
                            "Bizkaia"
                        ],
                        "code": "BI"
                    },
                    "Burgos": {
                        "code": "BU"
                    },
                    "Cáceres": {
                        "alternate_names": [
                            "Caceres"
                        ],
                        "code": "CC"
                    },
                    "Cádiz": {
                        "alternate_names": [
                            "Cadiz"
                        ],
                        "code": "CA"
                    },
                    "Cantabria": {
                        "label": "Cantabria Province",
                        "code": "S"
                    },
                    "Castellón": {
                        "alternate_names": [
                            "Castellon",
                            "Castelló",
                            "Castello"
                        ],
                        "code": "CS"
                    },
                    "Ceuta": {
                        "code": "CE"
                    },
                    "Ciudad Real": {
                        "alternate_names": [
                            "Cdad. Real"
                        ],
                        "code": "CR"
                    },
                    "Córdoba": {
                        "alternate_names": [
                            "Cordoba",
                            "Cordova"
                        ],
                        "code": "CO"
                    },
                    "Cuenca": {
                        "code": "CU"
                    },
                    "Guipúzcoa": {
                        "label": "Gipuzkoa",
                        "alternate_names": [
                            "Guipuzcoa",
                            "Gipuzkoa"
                        ],
                        "code": "SS"
                    },
                    "Girona": {
                        "alternate_names": [
                            "Gerona"
                        ],
                        "code": "GI"
                    },
                    "Granada": {
                        "code": "GR"
                    },
                    "Guadalajara": {
                        "code": "GU"
                    },
                    "Huelva": {
                        "code": "H"
                    },
                    "Huesca": {
                        "alternate_names": [
                            "Uesca",
                            "Osca"
                        ],
                        "code": "HU"
                    },
                    "Jaén": {
                        "alternate_names": [
                            "Jaen"
                        ],
                        "code": "J"
                    },
                    "La Rioja": {
                        "label": "La Rioja Province",
                        "code": "LO"
                    },
                    "Las Palmas": {
                        "code": "GC"
                    },
                    "León": {
                        "alternate_names": [
                            "Leon"
                        ],
                        "code": "LE"
                    },
                    "Lleida": {
                        "alternate_names": [
                            "Lérida",
                            "Lerida"
                        ],
                        "code": "L"
                    },
                    "Lugo": {
                        "code": "LU"
                    },
                    "Madrid": {
                        "label": "Madrid Province",
                        "alternate_names": [
                            "Comunidad de Madrid",
                            "Community of Madrid"
                        ],
                        "code": "M"
                    },
                    "Málaga": {
                        "alternate_names": [
                            "Malaga"
                        ],
                        "code": "MA"
                    },
                    "Melilla": {
                        "code": "ML"
                    },
                    "Murcia": {
                        "alternate_names": [
                            "Región de Murcia",
                            "Region de Murcia"
                        ],
                        "code": "MU"
                    },
                    "Navarra": {
                        "alternate_names": [
                            "Nafarroa",
                            "Navarre"
                        ],
                        "code": "NA"
                    },
                    "Ourense": {
                        "code": "OR"
                    },
                    "Palencia": {
                        "code": "P"
                    },
                    "Pontevedra": {
                        "code": "PO"
                    },
                    "Salamanca": {
                        "code": "SA"
                    },
                    "Santa Cruz de Tenerife": {
                        "alternate_names": [
                            "Santa Cruz"
                        ],
                        "code": "TF"
                    },
                    "Segovia": {
                        "code": "SG"
                    },
                    "Sevilla": {
                        "label": "Seville",
                        "alternate_names": [
                            "Seville"
                        ],
                        "code": "SE"
                    },
                    "Soria": {
                        "code": "SO"
                    },
                    "Tarragona": {
                        "code": "T"
                    },
                    "Teruel": {
                        "code": "TE"
                    },
                    "Toledo": {
                        "code": "TO"
                    },
                    "Valencia": {
                        "alternate_names": [
                            "València"
                        ],
                        "code": "V"
                    },
                    "Valladolid": {
                        "code": "VA"
                    },
                    "Zamora": {
                        "code": "ZA"
                    },
                    "Zaragoza": {
                        "alternate_names": [
                            "Saragossa"
                        ],
                        "code": "Z"
                    }
                }
            },
            "Thailand": {
                "address_format": {
                    "edit": 4
                },
                "code": "TH",
                "flag_path": "/assets/flags/th-ffe662e5a63774ffd37330c5a5b08336e788e68148c2f63e9bdc8ab9d98c9f88.svg",
                "labels": {
                    "province": "Province"
                },
                "provinces": {
                    "Amnat Charoen": {
                        "code": "TH-37"
                    },
                    "Ang Thong": {
                        "code": "TH-15"
                    },
                    "Bangkok": {
                        "alternate_names": [
                            "Krung Thep Maha Nakhon"
                        ],
                        "code": "TH-10"
                    },
                    "Bueng Kan": {
                        "code": "TH-38"
                    },
                    "Buriram": {
                        "label": "Buri Ram",
                        "alternate_names": [
                            "Buri Ram"
                        ],
                        "code": "TH-31"
                    },
                    "Chachoengsao": {
                        "code": "TH-24"
                    },
                    "Chai Nat": {
                        "code": "TH-18"
                    },
                    "Chaiyaphum": {
                        "code": "TH-36"
                    },
                    "Chanthaburi": {
                        "code": "TH-22"
                    },
                    "Chiang Mai": {
                        "code": "TH-50"
                    },
                    "Chiang Rai": {
                        "code": "TH-57"
                    },
                    "Chon Buri": {
                        "code": "TH-20"
                    },
                    "Chumphon": {
                        "code": "TH-86"
                    },
                    "Kalasin": {
                        "code": "TH-46"
                    },
                    "Kamphaeng Phet": {
                        "code": "TH-62"
                    },
                    "Kanchanaburi": {
                        "code": "TH-71"
                    },
                    "Khon Kaen": {
                        "code": "TH-40"
                    },
                    "Krabi": {
                        "code": "TH-81"
                    },
                    "Lampang": {
                        "code": "TH-52"
                    },
                    "Lamphun": {
                        "code": "TH-51"
                    },
                    "Loei": {
                        "code": "TH-42"
                    },
                    "Lopburi": {
                        "alternate_names": [
                            "Lop Buri"
                        ],
                        "code": "TH-16"
                    },
                    "Mae Hong Son": {
                        "code": "TH-58"
                    },
                    "Maha Sarakham": {
                        "code": "TH-44"
                    },
                    "Mukdahan": {
                        "code": "TH-49"
                    },
                    "Nakhon Nayok": {
                        "code": "TH-26"
                    },
                    "Nakhon Pathom": {
                        "code": "TH-73"
                    },
                    "Nakhon Phanom": {
                        "code": "TH-48"
                    },
                    "Nakhon Ratchasima": {
                        "code": "TH-30"
                    },
                    "Nakhon Sawan": {
                        "code": "TH-60"
                    },
                    "Nakhon Si Thammarat": {
                        "code": "TH-80"
                    },
                    "Nan": {
                        "code": "TH-55"
                    },
                    "Narathiwat": {
                        "code": "TH-96"
                    },
                    "Nong Bua Lam Phu": {
                        "code": "TH-39"
                    },
                    "Nong Khai": {
                        "code": "TH-43"
                    },
                    "Nonthaburi": {
                        "code": "TH-12"
                    },
                    "Pathum Thani": {
                        "code": "TH-13"
                    },
                    "Pattani": {
                        "code": "TH-94"
                    },
                    "Pattaya": {
                        "code": "TH-S"
                    },
                    "Phangnga": {
                        "label": "Phang Nga",
                        "code": "TH-82"
                    },
                    "Phatthalung": {
                        "code": "TH-93"
                    },
                    "Phayao": {
                        "code": "TH-56"
                    },
                    "Phetchabun": {
                        "code": "TH-67"
                    },
                    "Phetchaburi": {
                        "code": "TH-76"
                    },
                    "Phichit": {
                        "code": "TH-66"
                    },
                    "Phitsanulok": {
                        "code": "TH-65"
                    },
                    "Phra Nakhon Si Ayutthaya": {
                        "code": "TH-14"
                    },
                    "Phrae": {
                        "code": "TH-54"
                    },
                    "Phuket": {
                        "code": "TH-83"
                    },
                    "Prachin Buri": {
                        "code": "TH-25"
                    },
                    "Prachuap Khiri Khan": {
                        "code": "TH-77"
                    },
                    "Ranong": {
                        "code": "TH-85"
                    },
                    "Ratchaburi": {
                        "code": "TH-70"
                    },
                    "Rayong": {
                        "code": "TH-21"
                    },
                    "Roi Et": {
                        "code": "TH-45"
                    },
                    "Sa Kaeo": {
                        "code": "TH-27"
                    },
                    "Sakon Nakhon": {
                        "code": "TH-47"
                    },
                    "Samut Prakan": {
                        "code": "TH-11"
                    },
                    "Samut Sakhon": {
                        "code": "TH-74"
                    },
                    "Samut Songkhram": {
                        "code": "TH-75"
                    },
                    "Saraburi": {
                        "code": "TH-19"
                    },
                    "Satun": {
                        "code": "TH-91"
                    },
                    "Sisaket": {
                        "label": "Si Sa Ket",
                        "alternate_names": [
                            "Si Sa Ket"
                        ],
                        "code": "TH-33"
                    },
                    "Sing Buri": {
                        "code": "TH-17"
                    },
                    "Songkhla": {
                        "code": "TH-90"
                    },
                    "Sukhothai": {
                        "code": "TH-64"
                    },
                    "Suphan Buri": {
                        "label": "Suphanburi",
                        "code": "TH-72"
                    },
                    "Surat Thani": {
                        "code": "TH-84"
                    },
                    "Surin": {
                        "code": "TH-32"
                    },
                    "Tak": {
                        "code": "TH-63"
                    },
                    "Trang": {
                        "code": "TH-92"
                    },
                    "Trat": {
                        "code": "TH-23"
                    },
                    "Ubon Ratchathani": {
                        "code": "TH-34"
                    },
                    "Udon Thani": {
                        "code": "TH-41"
                    },
                    "Uthai Thani": {
                        "code": "TH-61"
                    },
                    "Uttaradit": {
                        "code": "TH-53"
                    },
                    "Yala": {
                        "code": "TH-95"
                    },
                    "Yasothon": {
                        "code": "TH-35"
                    }
                }
            },
            "United Arab Emirates": {
                "address_format": {
                    "edit": 7
                },
                "code": "AE",
                "flag_path": "/assets/flags/ae-3cce5239a0c9c329a8f2f0e6f900a7d58e463bd79ff4dd8cc9f2d89e057777d4.svg",
                "labels": {
                    "province": "Emirate"
                },
                "provinces": {
                    "Abu Dhabi": {
                        "code": "AZ"
                    },
                    "Ajman": {
                        "code": "AJ"
                    },
                    "Dubai": {
                        "code": "DU"
                    },
                    "Fujairah": {
                        "code": "FU"
                    },
                    "Ras al-Khaimah": {
                        "code": "RK"
                    },
                    "Sharjah": {
                        "code": "SH"
                    },
                    "Umm al-Quwain": {
                        "code": "UQ"
                    }
                }
            },
            "United Kingdom": {
                "address_format": {
                    "edit": 0
                },
                "code": "GB",
                "flag_path": "/assets/flags/gb-de46013c87c1d6b0e4804a6bd8be50f2c5f961c5adbc42ba40b8913af33afe75.svg",
                "labels": {
                    "zip": "Postcode"
                },
                "provinces": {
                    "British Forces": {
                        "code": "BFP"
                    },
                    "England": {
                        "code": "ENG"
                    },
                    "Northern Ireland": {
                        "code": "NIR"
                    },
                    "Scotland": {
                        "code": "SCT"
                    },
                    "Wales": {
                        "code": "WLS"
                    }
                }
            },
            "United States": {
                "address_format": {
                    "edit": 4
                },
                "code": "US",
                "flag_path": "/assets/flags/us-1c64c14fa68916dba409ddf0e38ca5dc8bd262b959a5814ecb6667096b35efa5.svg",
                "labels": {
                    "province": "State",
                    "zip": "ZIP code"
                },
                "provinces": {
                    "Alabama": {
                        "code": "AL"
                    },
                    "Alaska": {
                        "code": "AK"
                    },
                    "American Samoa": {
                        "code": "AS"
                    },
                    "Arizona": {
                        "code": "AZ"
                    },
                    "Arkansas": {
                        "code": "AR"
                    },
                    "California": {
                        "code": "CA"
                    },
                    "Colorado": {
                        "code": "CO"
                    },
                    "Connecticut": {
                        "code": "CT"
                    },
                    "Delaware": {
                        "code": "DE"
                    },
                    "Florida": {
                        "code": "FL"
                    },
                    "Georgia": {
                        "code": "GA"
                    },
                    "Guam": {
                        "code": "GU"
                    },
                    "Hawaii": {
                        "code": "HI"
                    },
                    "Idaho": {
                        "code": "ID"
                    },
                    "Illinois": {
                        "code": "IL"
                    },
                    "Indiana": {
                        "code": "IN"
                    },
                    "Iowa": {
                        "code": "IA"
                    },
                    "Kansas": {
                        "code": "KS"
                    },
                    "Kentucky": {
                        "code": "KY"
                    },
                    "Louisiana": {
                        "code": "LA"
                    },
                    "Maine": {
                        "code": "ME"
                    },
                    "Marshall Islands": {
                        "code": "MH"
                    },
                    "Maryland": {
                        "code": "MD"
                    },
                    "Massachusetts": {
                        "code": "MA"
                    },
                    "Michigan": {
                        "code": "MI"
                    },
                    "Federated States of Micronesia": {
                        "label": "Micronesia",
                        "code": "FM"
                    },
                    "Minnesota": {
                        "code": "MN"
                    },
                    "Mississippi": {
                        "code": "MS"
                    },
                    "Missouri": {
                        "code": "MO"
                    },
                    "Montana": {
                        "code": "MT"
                    },
                    "Nebraska": {
                        "code": "NE"
                    },
                    "Nevada": {
                        "code": "NV"
                    },
                    "New Hampshire": {
                        "code": "NH"
                    },
                    "New Jersey": {
                        "code": "NJ"
                    },
                    "New Mexico": {
                        "code": "NM"
                    },
                    "New York": {
                        "code": "NY"
                    },
                    "North Carolina": {
                        "code": "NC"
                    },
                    "North Dakota": {
                        "code": "ND"
                    },
                    "Northern Mariana Islands": {
                        "code": "MP"
                    },
                    "Ohio": {
                        "code": "OH"
                    },
                    "Oklahoma": {
                        "code": "OK"
                    },
                    "Oregon": {
                        "code": "OR"
                    },
                    "Palau": {
                        "code": "PW"
                    },
                    "Pennsylvania": {
                        "code": "PA"
                    },
                    "Puerto Rico": {
                        "code": "PR"
                    },
                    "Rhode Island": {
                        "code": "RI"
                    },
                    "South Carolina": {
                        "code": "SC"
                    },
                    "South Dakota": {
                        "code": "SD"
                    },
                    "Tennessee": {
                        "code": "TN"
                    },
                    "Texas": {
                        "code": "TX"
                    },
                    "Virgin Islands": {
                        "label": "U.S. Virgin Islands",
                        "code": "VI"
                    },
                    "Utah": {
                        "code": "UT"
                    },
                    "Vermont": {
                        "code": "VT"
                    },
                    "Virginia": {
                        "code": "VA"
                    },
                    "Washington": {
                        "code": "WA"
                    },
                    "District of Columbia": {
                        "label": "Washington DC",
                        "code": "DC"
                    },
                    "West Virginia": {
                        "code": "WV"
                    },
                    "Wisconsin": {
                        "code": "WI"
                    },
                    "Wyoming": {
                        "code": "WY"
                    },
                    "Armed Forces Americas": {
                        "code": "AA"
                    },
                    "Armed Forces Europe": {
                        "code": "AE"
                    },
                    "Armed Forces Pacific": {
                        "code": "AP"
                    }
                }
            }
        }

        for (var i = 0; i < Object.keys(countries).length; i++) {
            if (Object.keys(countries)[i] === this.profile.country) {
                this.countryCode = countries[Object.keys(countries)[i]].code
                var country = countries[Object.keys(countries)[i]]
                for (var j = 0; j < Object.keys(country.provinces).length; j++) {
                    if (this.profile.state === Object.keys(country.provinces)[j] || (typeof country.provinces[Object.keys(country.provinces)[j]]['alternate_names'] != 'undefined' && country.provinces[Object.keys(country.provinces)[j]]['alternate_names'].includes(this.profile.state)))
                        this.stateCode = country.provinces[Object.keys(country.provinces)[j]].code
                }
            }
        }
    }

    async initialize() {
        await this.send("Started")

        await this.formatCard()
        await this.submitCard()

        if (this.accounts != "-") {
            if (this.stopped === "false")
                await this.login()

            if (this.stopped === "false")
                await this.clearCart()
        }


        if (this.mode === "Fast") {
            if (this.stopped === "false")
                await this.getConfig()

            if (this.stopped === "false")
                await this.createCheckout()

            if (this.stopped === "false")
                await this.findProduct()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.updateCheckout()

            if (this.stopped === "false")
                await this.pollFastRates()

            if (this.stopped === "false")
                await this.addShippingFast()

            if (this.stopped === "false")
                await this.loadPayment()

            if (this.stopped === "false")
                await this.submitOrder()

            if (this.stopped === "false")
                await this.processPayment()
        }

        if (this.mode === "Prestock") {
            if (this.stopped === "false")
                await this.findRandomItem()

            if (this.stopped === "false")
                await this.addToCart()

            if (this.stopped === "false")
                await this.loadCheckoutforPreload()

            if (this.stopped === "false")
                await this.clearCart()

            if (this.stopped === "false")
                await this.waitForCheckpoint()

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
        }
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