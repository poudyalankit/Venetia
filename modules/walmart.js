module.exports = class WalmartTask {
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


    async sendFail() {
        const got = require('got');
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=Walmart&input=" + this.link
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

    async login() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Logging in...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.walmart.com/account/electrode/api/signin?ref=domain',
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'Referer': 'https://www.walmart.com/account/login?ref=domain',
                        'sec-ch-ua-mobile': '?0',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                    },
                    json: {
                        "username": this.accounts.email,
                        "password": this.accounts.password,
                        "rememberme": true,
                        "showRememberme": "true",
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
                    if (error.response.body.includes("Your password and email do not match.")) {
                        await this.send("Error: account not found")
                        await sleep(this.errorDelay)
                        await this.login()
                    } else {
                        this.log(error.response.body)
                        await this.send("Error logging in: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.login()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error logging in")
                    await sleep(this.errorDelay)
                    await this.login()
                }
            }
        }
    }

    async loadPage() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Getting cookies...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.walmart.com/pac?id=' + this.cartID + '&quantity=1&cv=2',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.walmart.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'sec-ch-ua-mobile': '?0',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'none',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
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
                console.log(response.headers)
            } catch (error) {
                await this.setDelays()
                if (error.toString().includes("Cookie not in this host's domain.")) {
                    return;
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error getting cookies: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadPage()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error getting cookies")
                    await sleep(this.errorDelay)
                    await this.loadPage()
                }
            }
        }
    }

    async addToCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Carting...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.walmart.com/api/v3/cart/guest/:CID/items',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.walmart.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'accept': 'application/json',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/ip/Sofia-Jeans-by-Sofia-Vergara-Women-s-Maxi-Dress-with-Empire-Waist/818689255',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "offerId": this.link,
                        "quantity": 1,
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
                response.body = JSON.parse(response.body)
                this.cartID = response.body.items[0].id
                this.productTitle = response.body.items[0].name
                this.cartTotal = response.body.cart.totals.subTotal
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.body.includes("'canAddToCart' flag is false")) {
                        await this.send("OOS, retrying (ATC)")
                        await sleep(this.errorDelay)
                        await this.addToCart()
                    } else {
                        this.log(error.response.body)
                        await this.send("Error carting: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.addToCart()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error carting")
                    await sleep(this.errorDelay)
                    await this.addToCart()
                }
            }
        }
    }


    async checkoutView() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Loading checkout...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.walmart.com/api/checkout/v3/contract?page=CHECKOUT_VIEW',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.walmart.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'wm_cvv_in_session': 'true',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'wm_vertical_id': '0',
                        'content-type': 'application/json',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/checkout/',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "postalCode": this.profile.zipcode,
                        "city": this.profile.city,
                        "state": abbrRegion(this.profile.state, 'abbr'),
                        "isZipLocated": true,
                        "crt:CRT": "",
                        "customerId:CID": "",
                        "customerType:type": "",
                        "affiliateInfo:com.wm.reflector": ""
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
                this.itemID = response.body.items[0].id
                this.shippingTier = response.body.items[0].fulfillmentSelection.shipMethod
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.checkoutView()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected loading checkout")
                    await sleep(this.errorDelay)
                    await this.checkoutView()
                }
            }
        }
    }




    async submitDelivery() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Submitting delivery...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.walmart.com/api/checkout/v3/contract/:PCID/fulfillment',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.walmart.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'inkiru_precedence': 'false',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'wm_cvv_in_session': 'true',
                        'wm_vertical_id': '0',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/checkout/',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "groups": [{
                            "fulfillmentOption": "S2H",
                            "itemIds": [
                                this.itemID
                            ],
                            "shipMethod": this.shippingTier
                        }]
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
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error submitting delivery: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitDelivery()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error submitting delivery")
                    await sleep(this.errorDelay)
                    await this.submitDelivery()
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
                    url: 'https://www.walmart.com/api/checkout/v3/contract/:PCID/shipping-address',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.walmart.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'inkiru_precedence': 'false',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'wm_cvv_in_session': 'true',
                        'wm_vertical_id': '0',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/checkout/',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "addressLineOne": this.profile.address1,
                        "city": this.profile.city,
                        "firstName": this.profile.firstName,
                        "lastName": this.profile.lastName,
                        "phone": this.profile.phone,
                        "email": this.profile.email,
                        "marketingEmailPref": false,
                        "postalCode": this.profile.zipcode,
                        "state": abbrRegion(this.profile.state, 'abbr'),
                        "countryCode": "USA",
                        "addressType": "RESIDENTIAL",
                        "changedFields": []
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
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error submitting: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error submitting shipping")
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                }
            }
        }
    }

    async getEncryption() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Encrypting card...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://securedataweb.walmart.com/pie/v1/wmcom_us_vtg_pie/getkey.js?bust=' + getTimestamp(),
                    cookieJar: this.cookieJar,
                    headers: {
                        'Connection': 'keep-alive',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'sec-ch-ua-mobile': '?0',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'Accept': '*/*',
                        'Sec-Fetch-Site': 'same-site',
                        'Sec-Fetch-Mode': 'no-cors',
                        'Sec-Fetch-Dest': 'script',
                        'Referer': 'https://www.walmart.com/',
                        'Accept-Language': 'en-US,en;q=0.9'
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
                var PIE = {
                    L: "",
                    E: "",
                    K: "",
                    key_id: "",
                    phase: ""
                }
                eval(response.body.split("// dynamically-generated PIE settings")[1].trim())
                this.keyID = PIE['key_id']
                this.phase = PIE.phase
                this.encryptedCard = encrypt(this.profile.cardNumber, this.profile.cvv, PIE.L, PIE.E, PIE.K, PIE['key_id'], PIE.phase)
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error encrypting: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.getEncryption()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error encrypting")
                    await sleep(this.errorDelay)
                    await this.getEncryption()
                }
            }
        }
    }

    async submitCard() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Submitting card...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.walmart.com/api/checkout-customer/:CID/credit-card',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.walmart.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'accept': 'application/json',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/checkout/',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "encryptedPan": this.encryptedCard[0],
                        "encryptedCvv": this.encryptedCard[1],
                        "integrityCheck": this.encryptedCard[2],
                        "keyId": this.keyID,
                        "phase": this.phase,
                        "state": abbrRegion(this.profile.state, 'abbr'),
                        "postalCode": this.profile.zipcode,
                        "addressLineOne": this.profile.address1,
                        "addressLineTwo": "",
                        "city": this.profile.city,
                        "firstName": this.profile.firstName,
                        "lastName": this.profile.lastName,
                        "expiryMonth": this.profile.expiryMonth,
                        "expiryYear": this.profile.expiryYear,
                        "phone": this.profile.phone,
                        "cardType": "VISA",
                        "isGuest": true
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
                this.piHash = response.body.piHash
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


    async submitPayment() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Submitting payment...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.walmart.com/api/checkout/v3/contract/:PCID/payment',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.walmart.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'inkiru_precedence': 'false',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'wm_cvv_in_session': 'true',
                        'wm_vertical_id': '0',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/checkout/',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "payments": [{
                            "paymentType": "CREDITCARD",
                            "cardType": "VISA",
                            "firstName": this.profile.firstName,
                            "lastName": this.profile.lastName,
                            "addressLineOne": this.profile.address1,
                            "addressLineTwo": "",
                            "city": this.profile.city,
                            "state": abbrRegion(this.profile.state, 'abbr'),
                            "postalCode": this.profile.zipcode,
                            "expiryMonth": this.profile.expiryMonth,
                            "expiryYear": this.profile.expiryYear,
                            "email": this.profile.email,
                            "phone": this.profile.phone,
                            "encryptedPan": this.encryptedCard[0],
                            "encryptedCvv": this.encryptedCard[1],
                            "integrityCheck": this.encryptedCard[2],
                            "keyId": this.keyID,
                            "phase": this.phase,
                            "piHash": this.piHash
                        }],
                        "cvvInSession": true,
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
                    await this.send("Error submitting payment: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitPayment()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error submitting payment")
                    await sleep(this.errorDelay)
                    await this.submitPayment()
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
                    url: 'https://www.walmart.com/api/checkout/v3/contract/:PCID/order',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.walmart.com',
                        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
                        'inkiru_precedence': 'false',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'wm_cvv_in_session': 'true',
                        'wm_vertical_id': '0',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/checkout/',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "cvvInSession": true,
                        "voltagePayments": [{
                            "paymentType": "CREDITCARD",
                            "encryptedCvv": this.encryptedCard[1],
                            "encryptedPan": this.encryptedCard[0],
                            "integrityCheck": this.encryptedCard[2],
                            "keyId": this.keyID,
                            "phase": this.phase
                        }]
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
                await this.send("Check email")
                await this.sendSuccess()
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode == 400) {
                        await this.send("Checkout failed")
                        await this.sendFail()
                    } else {
                        this.log(error.response.body)
                        await this.send("Error submitting order: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.submitOrder()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error submitting payment")
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

        //await this.send("Error: module locked")


        if (this.stopped === "false" && this.accounts != "-")
            await this.login()

        if (this.stopped === "false")
            await this.addToCart()


        if (this.stopped === "false")
            await this.loadPage()

        if (this.stopped === "false")
            await this.checkoutView()

        if (this.stopped === "false")
            await this.submitDelivery()

        if (this.stopped === "false")
            await this.submitShipping()

        if (this.stopped === "false")
            await this.getEncryption()

        if (this.stopped === "false")
            await this.submitCard()

        if (this.stopped === "false")
            await this.submitPayment()

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

var n = {};
n.base10 = "0123456789", n.base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", n.luhn = function(e) {
    for (var t = e.length - 1, n = 0; t >= 0;) n += parseInt(e.substr(t, 1), 10), t -= 2;
    for (t = e.length - 2; t >= 0;) {
        var r = 2 * parseInt(e.substr(t, 1), 10);
        n += r < 10 ? r : r - 9, t -= 2
    }
    return n % 10
}, n.fixluhn = function(e, t, r) {
    var a = n.luhn(e);
    return a < r ? a += 10 - r : a -= r, 0 != a ? (a = (e.length - t) % 2 != 0 ? 10 - a : a % 2 == 0 ? 5 - a / 2 : (9 - a) / 2 + 5, e.substr(0, t) + a + e.substr(t + 1)) : e
}, n.distill = function(e) {
    for (var t = "", r = 0; r < e.length; ++r) n.base10.indexOf(e.charAt(r)) >= 0 && (t += e.substr(r, 1));
    return t
}, n.reformat = function(e, t) {
    for (var r = "", a = 0, i = 0; i < t.length; ++i) a < e.length && n.base10.indexOf(t.charAt(i)) >= 0 ? (r += e.substr(a, 1), ++a) : r += t.substr(i, 1);
    return r
}, n.integrity = function(e, t, n) {
    var o = String.fromCharCode(0) + String.fromCharCode(t.length) + t + String.fromCharCode(0) + String.fromCharCode(n.length) + n,
        c = a.HexToWords(e);
    c[3] ^= 1;
    var u = new r.cipher.aes(c),
        s = i.compute(u, o);
    return a.WordToHex(s[0]) + a.WordToHex(s[1])
}
var r = {
    cipher: {},
    hash: {},
    mode: {},
    misc: {},
    codec: {},
    exception: {
        corrupt: function(e) {
            this.toString = function() {
                return "CORRUPT: " + this.message
            }, this.message = e
        },
        invalid: function(e) {
            this.toString = function() {
                return "INVALID: " + this.message
            }, this.message = e
        },
        bug: function(e) {
            this.toString = function() {
                return "BUG: " + this.message
            }, this.message = e
        }
    }
};
r.cipher.aes = function(e) {
    this._tables[0][0][0] || this._precompute();
    var t, n, a, i, o, c = this._tables[0][4],
        u = this._tables[1],
        s = e.length,
        d = 1;
    if (4 !== s && 6 !== s && 8 !== s) throw new r.exception.invalid("invalid aes key size");
    for (this._key = [i = e.slice(0), o = []], t = s; t < 4 * s + 28; t++) a = i[t - 1], (t % s == 0 || 8 === s && t % s == 4) && (a = c[a >>> 24] << 24 ^ c[a >> 16 & 255] << 16 ^ c[a >> 8 & 255] << 8 ^ c[255 & a], t % s == 0 && (a = a << 8 ^ a >>> 24 ^ d << 24, d = d << 1 ^ 283 * (d >> 7))), i[t] = i[t - s] ^ a;
    for (n = 0; t; n++, t--) a = i[3 & n ? t : t - 4], o[n] = t <= 4 || n < 4 ? a : u[0][c[a >>> 24]] ^ u[1][c[a >> 16 & 255]] ^ u[2][c[a >> 8 & 255]] ^ u[3][c[255 & a]]
}, r.cipher.aes.prototype = {
    encrypt: function(e) {
        return this._crypt(e, 0)
    },
    decrypt: function(e) {
        return this._crypt(e, 1)
    },
    _tables: [
        [
            [],
            [],
            [],
            [],
            []
        ],
        [
            [],
            [],
            [],
            [],
            []
        ]
    ],
    _precompute: function() {
        var e, t, n, r, a, i, o, c, u = this._tables[0],
            s = this._tables[1],
            d = u[4],
            l = s[4],
            f = [],
            p = [];
        for (e = 0; e < 256; e++) p[(f[e] = e << 1 ^ 283 * (e >> 7)) ^ e] = e;
        for (t = n = 0; !d[t]; t ^= 0 == r ? 1 : r, n = 0 == p[n] ? 1 : p[n])
            for (i = (i = n ^ n << 1 ^ n << 2 ^ n << 3 ^ n << 4) >> 8 ^ 255 & i ^ 99, d[t] = i, l[i] = t, c = 16843009 * f[a = f[r = f[t]]] ^ 65537 * a ^ 257 * r ^ 16843008 * t, o = 257 * f[i] ^ 16843008 * i, e = 0; e < 4; e++) u[e][t] = o = o << 24 ^ o >>> 8, s[e][i] = c = c << 24 ^ c >>> 8;
        for (e = 0; e < 5; e++) u[e] = u[e].slice(0), s[e] = s[e].slice(0)
    },
    _crypt: function(e, t) {
        if (4 !== e.length) throw new r.exception.invalid("invalid aes block size");
        var n, a, i, o, c = this._key[t],
            u = e[0] ^ c[0],
            s = e[t ? 3 : 1] ^ c[1],
            d = e[2] ^ c[2],
            l = e[t ? 1 : 3] ^ c[3],
            f = c.length / 4 - 2,
            p = 4,
            m = [0, 0, 0, 0],
            h = this._tables[t],
            b = h[0],
            v = h[1],
            y = h[2],
            E = h[3],
            g = h[4];
        for (o = 0; o < f; o++) n = b[u >>> 24] ^ v[s >> 16 & 255] ^ y[d >> 8 & 255] ^ E[255 & l] ^ c[p], a = b[s >>> 24] ^ v[d >> 16 & 255] ^ y[l >> 8 & 255] ^ E[255 & u] ^ c[p + 1], i = b[d >>> 24] ^ v[l >> 16 & 255] ^ y[u >> 8 & 255] ^ E[255 & s] ^ c[p + 2], l = b[l >>> 24] ^ v[u >> 16 & 255] ^ y[s >> 8 & 255] ^ E[255 & d] ^ c[p + 3], p += 4, u = n, s = a, d = i;
        for (o = 0; o < 4; o++) m[t ? 3 & -o : o] = g[u >>> 24] << 24 ^ g[s >> 16 & 255] << 16 ^ g[d >> 8 & 255] << 8 ^ g[255 & l] ^ c[p++], n = u, u = s, s = d, d = l, l = n;
        return m
    }
};
var a = {
        HexToKey: function(e) {
            return new r.cipher.aes(a.HexToWords(e))
        },
        HexToWords: function(e) {
            var t = new Array(4);
            if (32 != e.length) return null;
            for (var n = 0; n < 4; n++) t[n] = parseInt(e.substr(8 * n, 8), 16);
            return t
        },
        Hex: "0123456789abcdef",
        WordToHex: function(e) {
            for (var t = 32, n = ""; t > 0;) t -= 4, n += a.Hex.substr(e >>> t & 15, 1);
            return n
        }
    },
    i = {};
i.MSBnotZero = function(e) {
    return 2147483647 != (2147483647 | e)
}, i.leftShift = function(e) {
    e[0] = (2147483647 & e[0]) << 1 | e[1] >>> 31, e[1] = (2147483647 & e[1]) << 1 | e[2] >>> 31, e[2] = (2147483647 & e[2]) << 1 | e[3] >>> 31, e[3] = (2147483647 & e[3]) << 1
}, i.const_Rb = 135, i.compute = function(e, t) {
    var n = [0, 0, 0, 0],
        r = e.encrypt(n),
        a = r[0];
    i.leftShift(r), i.MSBnotZero(a) && (r[3] ^= i.const_Rb);
    for (var o = 0; o < t.length;) n[o >> 2 & 3] ^= (255 & t.charCodeAt(o)) << 8 * (3 - (3 & o)), 0 == (15 & ++o) && o < t.length && (n = e.encrypt(n));
    return 0 != o && 0 == (15 & o) || (a = r[0], i.leftShift(r), i.MSBnotZero(a) && (r[3] ^= i.const_Rb), n[o >> 2 & 3] ^= 128 << 8 * (3 - (3 & o))), n[0] ^= r[0], n[1] ^= r[1], n[2] ^= r[2], n[3] ^= r[3], e.encrypt(n)
};
var o = {
    alphabet: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    precompF: function(e, t, n, r) {
        var a = new Array(4),
            i = n.length;
        return a[0] = 16908544 | r >> 16 & 255, a[1] = (r >> 8 & 255) << 24 | (255 & r) << 16 | 2560 | 255 & Math.floor(t / 2), a[2] = t, a[3] = i, e.encrypt(a)
    },
    precompb: function(e, t) {
        for (var n = Math.ceil(t / 2), r = 0, a = 1; n > 0;) --n, (a *= e) >= 256 && (a /= 256, ++r);
        return a > 1 && ++r, r
    },
    bnMultiply: function(e, t, n) {
        var r, a = 0;
        for (r = e.length - 1; r >= 0; --r) {
            var i = e[r] * n + a;
            e[r] = i % t, a = (i - e[r]) / t
        }
    },
    bnAdd: function(e, t, n) {
        for (var r = e.length - 1, a = n; r >= 0 && a > 0;) {
            var i = e[r] + a;
            e[r] = i % t, a = (i - e[r]) / t, --r
        }
    },
    convertRadix: function(e, t, n, r, a) {
        var i, c = new Array(r);
        for (i = 0; i < r; ++i) c[i] = 0;
        for (var u = 0; u < t; ++u) o.bnMultiply(c, a, n), o.bnAdd(c, a, e[u]);
        return c
    },
    cbcmacq: function(e, t, n, r) {
        for (var a = new Array(4), i = 0; i < 4; ++i) a[i] = e[i];
        for (var o = 0; 4 * o < n;) {
            for (i = 0; i < 4; ++i) a[i] = a[i] ^ (t[4 * (o + i)] << 24 | t[4 * (o + i) + 1] << 16 | t[4 * (o + i) + 2] << 8 | t[4 * (o + i) + 3]);
            a = r.encrypt(a), o += 4
        }
        return a
    },
    F: function(e, t, n, r, a, i, c, u, s) {
        var d = Math.ceil(s / 4) + 1,
            l = n.length + s + 1 & 15;
        l > 0 && (l = 16 - l);
        var f, p = new Array(n.length + l + s + 1);
        for (f = 0; f < n.length; f++) p[f] = n.charCodeAt(f);
        for (; f < l + n.length; f++) p[f] = 0;
        p[p.length - s - 1] = t;
        for (var m = o.convertRadix(r, a, u, s, 256), h = 0; h < s; h++) p[p.length - s + h] = m[h];
        var b, v = o.cbcmacq(c, p, p.length, e),
            y = v,
            E = new Array(2 * d);
        for (f = 0; f < d; ++f) f > 0 && 0 == (3 & f) && (b = f >> 2 & 255, b |= b << 8 | b << 16 | b << 24, y = e.encrypt([v[0] ^ b, v[1] ^ b, v[2] ^ b, v[3] ^ b])), E[2 * f] = y[3 & f] >>> 16, E[2 * f + 1] = 65535 & y[3 & f];
        return o.convertRadix(E, 2 * d, 65536, i, u)
    },
    DigitToVal: function(e, t, n) {
        var r = new Array(t);
        if (256 == n) {
            for (var a = 0; a < t; a++) r[a] = e.charCodeAt(a);
            return r
        }
        for (var i = 0; i < t; i++) {
            var o = parseInt(e.charAt(i), n);
            if (NaN == o || !(o < n)) return "";
            r[i] = o
        }
        return r
    },
    ValToDigit: function(e, t) {
        var n, r = "";
        if (256 == t)
            for (n = 0; n < e.length; n++) r += String.fromCharCode(e[n]);
        else
            for (n = 0; n < e.length; n++) r += o.alphabet[e[n]];
        return r
    },
    encryptWithCipher: function(e, t, n, r) {
        var a = e.length,
            i = Math.floor(a / 2),
            c = o.precompF(n, a, t, r),
            u = o.precompb(r, a),
            s = o.DigitToVal(e, i, r),
            d = o.DigitToVal(e.substr(i), a - i, r);
        if ("" == s || "" == d) return "";
        for (var l = 0; l < 5; l++) {
            var f, p = o.F(n, 2 * l, t, d, d.length, s.length, c, r, u);
            f = 0;
            for (var m = s.length - 1; m >= 0; --m) {
                (h = s[m] + p[m] + f) < r ? (s[m] = h, f = 0) : (s[m] = h - r, f = 1)
            }
            p = o.F(n, 2 * l + 1, t, s, s.length, d.length, c, r, u);
            f = 0;
            for (m = d.length - 1; m >= 0; --m) {
                var h;
                (h = d[m] + p[m] + f) < r ? (d[m] = h, f = 0) : (d[m] = h - r, f = 1)
            }
        }
        return o.ValToDigit(s, r) + o.ValToDigit(d, r)
    },
    encrypt: function(e, t, n, r) {
        var i = a.HexToKey(n);
        return null == i ? "" : o.encryptWithCipher(e, t, i, r)
    }
}

function encrypt(e, t, PIE_L, PIE_E, PIE_K, PIE_key_id, PIE_phase) {
    PIE = { L: parseInt(PIE_L), E: parseInt(PIE_E), K: PIE_K, key_id: PIE_key_id, phase: parseInt(PIE_phase) }
    var a_var = n.distill(e)
    var i_var = n.distill(t)
    var c_var = a_var.substr(0, PIE.L) + a_var.substring(a_var.length - PIE.E)
    var u_var = n.luhn(a_var)
    var s_var = a_var.substring(PIE.L + 1, a_var.length - PIE.E)
    var d_var = o.encrypt(s_var + i_var, c_var, PIE.K, 10)
    var l_var = a_var.substr(0, PIE.L) + "0" + d_var.substr(0, d_var.length - i_var.length) + a_var.substring(a_var.length - PIE.E)
    var f_var = n.reformat(n.fixluhn(l_var, PIE.L, u_var), e)
    var p_var = n.reformat(d_var.substring(d_var.length - i_var.length), t)
    return [f_var, p_var, n.integrity(PIE.K, f_var, p_var)]
}


function getTimestamp() {
    return new Date().getTime();
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