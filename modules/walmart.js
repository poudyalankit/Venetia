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
                        'referer': 'https://www.walmart.com/ip/ELOQUII-Elements-Women-s-Plus-Size-Shibori-Print-Balloon-Sleeve-Blouse/358134612',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "offerId": "F777A4FD34424C38B7ABBD72A13A6CF1",
                        "quantity": 1,
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
                this.cartID = response.body.items[0].id
                console.log(this.cartID)
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error carting: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.addToCart()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error loading product")
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
            await this.send("Getting checkout info...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.walmart.com/api/checkout/v3/contract?page=CHECKOUT_VIEW',
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
                        'referer': 'https://www.walmart.com/ip/ELOQUII-Elements-Women-s-Plus-Size-Shibori-Print-Balloon-Sleeve-Blouse/358134612',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: { "storeList": [{ "id": "91672" }, { "id": "5936" }, { "id": "2038" }, { "id": "5969" }, { "id": "5880" }, { "id": "2015" }, { "id": "3639" }, { "id": "5227" }, { "id": "1904" }, { "id": "3573" }], "postalCode": "20190", "city": "Reston", "state": "VA", "isZipLocated": true, "crt:CRT": "", "customerId:CID": "", "customerType:type": "", "affiliateInfo:com.wm.reflector": "" },
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
                this.cartid = response.body.items[0].id
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error getting checkout info: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.checkoutView()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error loading product")
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
                        'accept': 'application/json',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/ip/ELOQUII-Elements-Women-s-Plus-Size-Shibori-Print-Balloon-Sleeve-Blouse/358134612',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "groups": [{
                            "fulfillmentOption": "S2H",
                            "itemIds": [
                                this.cartid
                            ],
                            "shipMethod": "STANDARD"
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
                    await this.send("Unexpected error loading product")
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
                        'accept': 'application/json',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.walmart.com/ip/ELOQUII-Elements-Women-s-Plus-Size-Shibori-Print-Balloon-Sleeve-Blouse/358134612',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "addressLineOne": "2167 Mager Dr",
                        "city": "Herndon",
                        "firstName": "JOHN",
                        "lastName": "SMITH",
                        "phone": "9136365489",
                        "email": "test@ANKITPOUDYAL.COM",
                        "marketingEmailPref": false,
                        "postalCode": "20170",
                        "state": "VA",
                        "countryCode": "USA",
                        "addressType": "RESIDENTIAL",
                        "changedFields": [],
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
                    await this.send("Unexpected error loading product")
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
            await this.send("Getting encryption...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://securedataweb.walmart.com/pie/v1/wmcom_us_vtg_pie/getkey.js?bust=' + getTimestamp(),
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
                this.encryptedCard = encrypt("4767718285062834", "013", PIE.L, PIE.E, PIE.K, PIE['key_id'], PIE.phase)
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error submitting: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.getEncryption()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error loading product")
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
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "encryptedPan": this.encryptedCard[0],
                        "encryptedCvv": this.encryptedCard[1],
                        "integrityCheck": this.encryptedCard[2],
                        "keyId": this.keyID,
                        "phase": this.phase,
                        "state": "VA",
                        "postalCode": "20170",
                        "addressLineOne": "2167 Mager Dr",
                        "addressLineTwo": "",
                        "city": "Herndon",
                        "firstName": "JOHN",
                        "lastName": "SMITH",
                        "expiryMonth": "03",
                        "expiryYear": "2027",
                        "phone": "5872930128",
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
                    await this.send("Unexpected error loading product")
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
                        'accept': 'application/json',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
                        'content-type': 'application/json',
                        'origin': 'https://www.walmart.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "payments": [{
                            "paymentType": "CREDITCARD",
                            "cardType": "VISA",
                            "firstName": "JOHN",
                            "lastName": "SMITH",
                            "addressLineOne": "2167 Mager Dr",
                            "addressLineTwo": "",
                            "city": "Herndon",
                            "state": "VA",
                            "postalCode": "20170",
                            "expiryMonth": "03",
                            "expiryYear": "2027",
                            "email": "TEST@ANKITPOUDYAL.COM",
                            "phone": "5872930128",
                            "encryptedPan": this.encryptedCard[0],
                            "encryptedCvv": this.encryptedCard[1],
                            "integrityCheck": this.encryptedCard[2],
                            "keyId": this.keyID,
                            "phase": this.phase,
                            "piHash": this.piHash
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
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error submitting payment: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitPayment()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error loading product")
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
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-encoding": "gzip, deflate, br",
                        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                        "content-type": "application/json",
                        "inkiru_precedence": "false",
                        "origin": "https://www.walmart.com",
                        "referer": "https://www.walmart.com/checkout/",
                        "wm_vertical_id": "0",
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36'
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
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error submitting order: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitOrder()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error loading product")
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
        this.cookieJar.setCookie('com.wm.reflector="reflectorid:0000000000000000000000@lastupd:1628638889868@firstcreate:1628638867463"; Max-Age=315360000; Expires=Fri, 08 Aug 2031 23:41:29 GMT; SameSite=Strict; Domain=.walmart.com; Path=/', "https://www.walmart.com")
        this.cookieJar.setCookie('TBV=7;', "https://www.walmart.com")
        this.cookieJar.setCookie('pxcts=7450d330-fa4a-11eb-8a14-6b455972302a; _pxvid=73b3f6f1-fa4a-11eb-bc75-d534e1f3036a;', "https://www.walmart.com")
        this.cookieJar.setCookie('_pxff_cfp=1;', "https://www.walmart.com")
        this.cookieJar.setCookie('_gcl_au=1.1.1462821640.1628648325;', "https://www.walmart.com")
        this.cookieJar.setCookie('viq=Walmart;', "https://www.walmart.com")
        this.cookieJar.setCookie('tb_sw_supported=true;', "https://www.walmart.com")
        this.cookieJar.setCookie('cbp=391266944-1628648333392;', "https://www.walmart.com")
        this.cookieJar.setCookie('akavpau_p8=1628648934~id=3a8a7e3e8712349990f48ec88689c00e;', "https://www.walmart.com")
        this.cookieJar.setCookie('athrvi=RVI~h17524280;', "https://www.walmart.com")
        this.cookieJar.setCookie('_sp_ses.ad94=*;', "https://www.walmart.com")
        this.cookieJar.setCookie('cart-item-count=1', "https://www.walmart.com")
        this.cookieJar.setCookie('s_sess_2=c32_v%3DS2H%2Cnull%3B%20prop32%3Dnull', "https://www.walmart.com")
        this.cookieJar.setCookie('_sp_id.ad94=319ebc78-2fb3-4e14-9adc-f0d6532a2da1.1628648335.1.1628648340.1628648335.fad35af1-fb88-40f5-a0e2-01b1b2369664', "https://www.walmart.com")
        this.cookieJar.setCookie('akavpau_p1=1628648940~id=8b3d380dd38e01221d3c66534a3b85df', "https://www.walmart.com")
        this.cookieJar.setCookie('xpbun=1', "https://www.walmart.com")
        this.cookieJar.setCookie('xpvoe=1', "https://www.walmart.com")
        this.cookieJar.setCookie('_pxff_fp=1', "https://www.walmart.com")
        this.cookieJar.setCookie('_uetsid=7464f3c0fa4a11eb9ccc31aeb4e11555', "https://www.walmart.com")
        this.cookieJar.setCookie('_uetvid=74652a80fa4a11eb9a63858a191afcbf', "https://www.walmart.com")
        this.cookieJar.setCookie('_abck=eixx2e4v63d70ysitg2r_1799', "https://www.walmart.com")
        this.cookieJar.setCookie('next-day=null|true|true|null|1628648372', "https://www.walmart.com")
        this.cookieJar.setCookie('location-data=20170%3AHerndon%3AVA%3A%3A8%3A1|1km%3B%3B3.76%2C4lt%3B%3B7.09%2C2t3%3B%3B8.11%2C4kw%3B%3B8.26%2C1jz%3B%3B8.78%2C4jc%3B%3B9.48%2C1gw%3B%3B11.9%2C417%3B%3B14%2C1ep%3B%3B15.91%2C2r9%3B%3B16.13||7|1|1y91%3B16%3B0%3B1.86%2C1xvn%3B16%3B1%3B2.09%2C1yqg%3B16%3B2%3B3.4%2C1yqj%3B16%3B7%3B8.42%2C1yb5%3B16%3B10%3B10.7|false|', "https://www.walmart.com")
        this.cookieJar.setCookie('DL=20170%2C%2C%2Cip%2C20170%2C%2C', "https://www.walmart.com")
        this.cookieJar.setCookie('t-loc-zip=1628648372724|20170', "https://www.walmart.com")
        this.cookieJar.setCookie('_px3=acd62172a80a3637f41d44e21cb23a52757811138dedec9609e7d4e94e35cb36:CawLwTqvHRFEAiSsmUqjahgypIq7LC0z/mNcr21QfbO5mJk8zR6LxNYs4mcAHbugRQTY1GD4hpbGTxBNkjhhIA==:1000:AR9wtgZdUe2clt9svXLqY07Jc8NP4FIUvEajpcMPJk8EuMDFFQ/6XFPsy9db+6n1LQruTyhg9LTi5IiCNmL2lucokjwzjxpfFzHEty0aG2StEDNhhh0/wUB//yXOefXx+xjrTTxRkmnDEP/gNlWE7mbmNyIAZw8xvGhAeruZuFDUUg0fMK2h/1R2o314t0wIVw3AyNsChgYNQOW5+gwVMQ==', "https://www.walmart.com")
        this.cookieJar.setCookie('_pxde=548bd5a0c13b8becb957d0941489a20785afc2f3b41d9e02ca67310cdec78d18:eyJ0aW1lc3RhbXAiOjE2Mjg2NDgzOTcyMTgsImZfa2IiOjAsImlwY19pZCI6W119', "https://www.walmart.com")


        await this.addToCart()
        await this.checkoutView()
        await this.submitDelivery()
        await this.submitShipping()
        await this.getEncryption()
        await this.submitCard()
        await this.submitPayment()
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