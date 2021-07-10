module.exports = class FederalPremiumTask {
    constructor(taskInfo) {
        require('log-timestamp');
        require("../src/js/console-file.js");
        var path = require('path')
        var fs = require('fs');

        const electron = require('electron');
        const configDir = (electron.app || electron.remote.app).getPath('userData');
        //console.file(path.join(configDir, '/userdata/logs.txt'));
        this.stopped = "false";
        this.taskId = taskInfo.id;
        this.site = taskInfo.site;
        this.mode = taskInfo.mode;
        this.link = taskInfo.product;
        this.size = taskInfo.size;
        this.csrfToken;
        this.request;
        this.errorMessage;
        this.webhookLink = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/settings.json'), 'utf8'))[0].webhook;
        this.variant;
        this.key = getKey()
        this.accounts = getAccountInfo(taskInfo.accounts)
        this.profilename = taskInfo.profile;
        this.productTitle;
        this.monitorDelay;
        this.errorDelay;
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        this.orginalShipmentUUID;
        this.shipmentUUID;
        this.jsonwebkey;
        this.ogjsonwebkey;
        this.secondKey;
        this.newCard;
        this.imageurl;
        this.keyid;
        this.cyberSourceResponse;
        this.quantity = 1;
        const tough = require('tough-cookie');
        this.cookieJar = new tough.CookieJar();
        this.profile = getProfileInfo(taskInfo.profile);
        this.proxyArray = getProxyInfo(taskInfo.proxies);
        this.proxy = this.proxyArray.sample();
        this.oglink = this.link
        if (this.link.toLowerCase().startsWith('http')) {
            this.link = this.link.split("/")[this.link.split("/").length - 1].split(".html")[0]
        } else
            this.link = this.link.split(",")[0]
        if (this.oglink.split(",").length > 1) {
            this.quantity = this.oglink.split(",")[1].trim()
        }
        if (this.profile.country === "United States") {
            this.country = "US"
        } else if (this.profile.country === "Canada") {
            this.country = "CA"
        }

    }

    async encodeCard(cardNumber, jsonWebKey) {
        const { Buffer } = require("buffer")

        const webcrypto = require("isomorphic-webcrypto")
        const { Base64 } = require("js-base64")

        const cardNumberBuffer = Buffer.from(cardNumber)

        const publicKey = await importKey(jsonWebKey, "encrypt")

        const encryptedCardNumberBuffer = await webcrypto.subtle.encrypt({
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            publicKey,
            cardNumberBuffer
        )

        return Base64.btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedCardNumberBuffer)))
    }

    async sendFail() {
        const got = require('got');
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=FederalPremium&input=" + this.oglink
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
                    "price": this.cartTotal,
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
                    "image": this.imageurl,
                    "quicktask": this.quickTaskLink
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
                                    "value": this.oglink,
                                    "inline": true
                                },
                                {
                                    "name": "Size",
                                    "value": this.size
                                },
                                {
                                    "name": "Price",
                                    "value": this.cartTotal
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
                                "url": this.imageurl
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
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=FederalPremium&input=" + this.oglink
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
                    "price": this.cartTotal,
                    "timestamp": new Date(Date.now()).toISOString(),
                    "image": this.imageurl,
                    "quicktask": this.quickTaskLink
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
                                    "value": this.oglink,
                                    "inline": true
                                },
                                {
                                    "name": "Size",
                                    "value": this.size
                                },
                                {
                                    "name": "Price",
                                    "value": this.cartTotal
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
                                "url": this.imageurl
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

    async monitor() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')

        if (this.stopped === "false") {
            await this.send("Monitoring...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.federalpremium.com/on/demandware.store/Sites-VistaFederal-Site/default/Product-Variation?pid=' + this.link,
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
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
                    if (response.body.product.available == false) {
                        throw "Product OOS"
                    } else {
                        if (typeof response.body.product.images != 'undefined' && typeof response.body.product.images.large != 'undefined')
                            this.imageurl = response.body.product.images.large[0].url
                        return;
                    }
                }
            } catch (error) {
                await this.setDelays()
                if (error === "Product OOS") {
                    await this.send("Waiting for restock")
                    await sleep(this.monitorDelay)
                    await this.monitor()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error monitoring: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.monitor()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.monitor()
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
                    url: 'https://www.federalpremium.com/on/demandware.store/Sites-VistaFederal-Site/default/Cart-AddProduct',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    body: querystring.encode({
                        'pid': this.link,
                        'quantity': this.quantity,
                        'options': '[]'
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
                    if (response.body.message.includes("cannot be added to the cart"))
                        throw "Product OOS"
                    else {
                        await this.send("Carted")
                        this.cartTotal = Math.trunc(parseInt(response.body.cart.totals.subTotal.substring(1)))
                        this.productTitle = response.body.cart.items[0].productName
                        await this.sendProductTitle(this.productTitle)
                        return;
                    }
                }
            } catch (error) {
                await this.setDelays()
                if (error === "Product OOS") {
                    await this.send("Waiting for restock")
                    await sleep(this.monitorDelay)
                    await this.monitor()
                    await this.addToCart()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error carting: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.addToCart()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.addToCart()
                }
            }
        }
    }

    async getCart() {
        const got = require('got');
        const tunnel = require('tunnel');

        if (this.stopped === "false") {
            await this.send("Creating cart...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.federalpremium.com/cart',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
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
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.csrfToken = root.querySelector('[name="csrf_token"]').getAttribute('value')
                    console.log(this.csrfToken)
                    await this.send("Created cart")
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error getting cart: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.getCart()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.getCart()
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
                    method: 'get',
                    url: 'https://www.federalpremium.com/on/demandware.store/Sites-VistaFederal-Site/default/Checkout-Begin?stage=shipping#shipping',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
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
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.originalShipmentUUID = root.querySelector('[name="originalShipmentUUID"]').getAttribute('value')
                    this.shipmentUUID = root.querySelector('[name="shipmentUUID"]').getAttribute('value')
                    await this.send("Loaded checkout")
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.loadCheckout()
                }
            }
        }
    }

    async submitShipping() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')

        if (this.stopped === "false") {
            await this.send("Submitting shipping...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.federalpremium.com/on/demandware.store/Sites-VistaFederal-Site/default/CheckoutShippingServices-SubmitShipping',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    body: querystring.encode({
                        'originalShipmentUUID': this.orginalShipmentUUID,
                        'shipmentUUID': this.shipmentUUID,
                        'shipmentSelector': 'new',
                        'dwfrm_shipping_shippingAddress_addressFields_firstName': this.profile.firstName,
                        'dwfrm_shipping_shippingAddress_addressFields_lastName': this.profile.lastName,
                        'dwfrm_shipping_shippingAddress_addressFields_address1': this.profile.address1,
                        'dwfrm_shipping_shippingAddress_addressFields_address2': '',
                        'dwfrm_shipping_shippingAddress_addressFields_country': this.country,
                        'dwfrm_shipping_shippingAddress_addressFields_states_stateCode': abbrRegion(this.profile.state, 'abbr'),
                        'dwfrm_shipping_shippingAddress_addressFields_city': this.profile.city,
                        'dwfrm_shipping_shippingAddress_addressFields_postalCode': this.profile.zipcode,
                        'dwfrm_shipping_shippingAddress_addressFields_phone': this.profile.phone,
                        'dwfrm_shipping_shippingAddress_shippingMethodID': '001',
                        'dwfrm_shipping_shippingAddress_giftMessage': '',
                        'csrf_token': this.csrfToken
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
                    await this.send("Submitted shipping")
                    console.log(response.body)
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error submitting shipping: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.submitShipping()
                }
            }
        }
    }

    async loadPayment() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Loading payment...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.federalpremium.com/on/demandware.store/Sites-VistaFederal-Site/default/Checkout-Begin?stage=payment#payment',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
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
                    await this.send("Loaded payment")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.jsonwebkey = root.querySelector('[name="flextokenRespose"]').getAttribute('value')
                    this.jsonwebkey = JSON.parse(this.jsonwebkey)
                    this.jsonwebkey = this.jsonwebkey.jwk
                    console.log(this.jsonwebkey)
                    this.newCard = await this.encodeCard(this.profile.cardNumber, this.jsonwebkey)
                    console.log(this.newCard)
                    this.jsonwebkey = JSON.parse(root.querySelector('[name="flextokenRespose"]').getAttribute('value'))
                    this.secondKey = JSON.parse(root.querySelector('[name="flextokenObj"]').getAttribute('value'))
                    this.keyid = this.jsonwebkey.keyId
                    console.log(this.keyid)
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error loading payment: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadPayment()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.loadPayment()
                }
            }
        }
    }


    async encryptCard() {
        const got = require('got');
        const tunnel = require('tunnel');
        console.log(this.encryptedCard)
        if (this.stopped === "false") {
            await this.send("Encrypting card...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://flex.cybersource.com/cybersource/flex/v1/tokens',
                    headers: {
                        'content-type': 'application/json; charset=UTF-8',
                        'origin': 'https://flex.cybersource.com',
                        'referer': 'https://flex.cybersource.com/cybersource/assets/microform/0.4.0/iframe.html?keyId=' + this.keyid
                    },
                    json: {
                        "keyId": this.keyid,
                        "cardInfo": {
                            "cardNumber": this.newCard,
                            "cardType": "001",
                            "cardExpirationMonth": this.profile.expiryMonth,
                            "cardExpirationYear": this.profile.expiryYear
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
                if (this.stopped === "false") {
                    await this.send("Encrypted card")
                    this.cyberSourceResponse = response.body
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body.responseStatus.details)
                    await this.send("Error encrypting card: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.encryptCard()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.encryptCard()
                }
            }
        }
    }

    async submitPayment() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.profile.expiryMonth.startsWith('0'))
            this.profile.expiryMonth = this.profile.expiryMonth.substring(1)
        if (this.stopped === "false") {
            await this.send("Submitting payment...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.federalpremium.com/on/demandware.store/Sites-VistaFederal-Site/default/CheckoutServices-SubmitPayment',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    body: querystring.encode({
                        'addressSelector': 'manual-entry',
                        'dwfrm_billing_addressFields_firstName': this.profile.firstName,
                        'dwfrm_billing_addressFields_lastName': this.profile.lastName,
                        'dwfrm_billing_addressFields_address1': this.profile.address1,
                        'dwfrm_billing_addressFields_address2': '',
                        'dwfrm_billing_addressFields_country': this.country,
                        'dwfrm_billing_addressFields_states_stateCode': abbrRegion(this.profile.state, 'abbr'),
                        'dwfrm_billing_addressFields_city': this.profile.city,
                        'dwfrm_billing_addressFields_postalCode': this.profile.zipcode,
                        'csrf_token': this.csrfToken,
                        'localizedNewAddressTitle': 'New Address',
                        'dwfrm_billing_contactInfoFields_email': this.profile.email,
                        'dwfrm_billing_contactInfoFields_phone': this.profile.phone,
                        'dwfrm_billing_paymentMethod': 'CREDIT_CARD',
                        'flextokenRespose': JSON.stringify(this.jsonwebkey),
                        'flextokenObj': JSON.stringify(this.secondKey),
                        'dwfrm_billing_creditCardFields_flexresponse': JSON.stringify(this.cyberSourceResponse),
                        'dwfrm_billing_creditCardFields_cardType': '001',
                        'dwfrm_billing_creditCardFields_cardNumber': this.profile.cardNumber.substring(0, 7) + "XXXXXX" + this.profile.cardNumber.substring(12),
                        'dwfrm_billing_creditCardFields_expirationMonth': this.profile.expiryMonth,
                        'dwfrm_billing_creditCardFields_expirationYear': this.profile.expiryYear,
                        'dwfrm_billing_creditCardFields_securityCode': this.profile.cvv
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
                    await this.send("Submitted payment")
                    console.log(response.body)
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error submitting payment: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.submitPayment()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.submitPayment()
                }
            }
        }
    }

    async loadReview() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Reviewing order...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.federalpremium.com/on/demandware.store/Sites-VistaFederal-Site/default/Checkout-Begin?stage=placeOrder#placeOrder',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
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
                    await this.send("Loaded review")
                    console.log(response.body)
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error loading review: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.loadReview()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.loadReview()
                }
            }
        }
    }

    async placeOrder() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Submitting order...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.federalpremium.com/on/demandware.store/Sites-VistaFederal-Site/default/CheckoutServices-PlaceOrder',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.federalpremium.com',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': '*/*',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://www.federalpremium.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
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
                if (this.stopped === "false" && typeof response.body.errorMessage === 'undefined') {
                    await this.send("Check email")
                    await this.sendSuccess()
                    console.log(response.body)
                    return;
                } else throw 'Checkout failed'
            } catch (error) {
                await this.setDelays()
                if (error === "Checkout failed") {
                    await this.send("Checkout failed")
                    await this.sendFail()
                    var path = require('path')
                    var fs = require('fs');

                    const electron = require('electron');
                    const configDir = (electron.app || electron.remote.app).getPath('userData');
                    if (JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/settings.json'), 'utf8'))[0].retryCheckouts == true) {
                        await sleep(this.errorDelay)
                        await this.placeOrder()
                    }
                } else if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error submitting order: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.placeOrder()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.placeOrder()
                }
            }
        }
    }

    async stopTask() {
        this.stopped = "true";
        await this.sendProductTitle(this.oglink)
        console.log("Stopped")
        this.send("Stopped")
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
        await this.send("Started")
        await this.setDelays()

        if (this.stopped === "false")
            await this.monitor()

        if (this.stopped === "false")
            await this.addToCart()

        if (this.stopped === "false")
            await this.getCart()

        if (this.stopped === "false")
            await this.loadCheckout()

        if (this.stopped === "false")
            await this.submitShipping()

        if (this.stopped === "false")
            await this.loadPayment()

        if (this.stopped === "false")
            await this.encryptCard()

        if (this.stopped === "false")
            await this.submitPayment()

        if (this.stopped === "false")
            await this.loadReview()

        if (this.stopped === "false")
            await this.placeOrder()
    }
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


const importKey = async(jsonWebKey) => {
    const webcrypto = require("isomorphic-webcrypto")

    return webcrypto.subtle.importKey(
        "jwk", {
            ...jsonWebKey,
            alg: "RSA-OAEP-256",
            ext: true,
        }, {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false, ["encrypt"],
    )
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