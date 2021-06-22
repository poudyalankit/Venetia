module.exports = class PacsunTask {
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
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        const tough = require('tough-cookie');
        this.cookieJar = new tough.CookieJar();
        this.profile = getProfileInfo(taskInfo.profile);
        this.proxyArray = getProxyInfo(taskInfo.proxies);
        this.proxy = this.proxyArray.sample();
        if (this.profile.country === "United States") {
            this.country = "US"
        } else if (this.profile.country === "Canada") {
            this.country = "CA"
        }
    }

    async sendFail() {
        const got = require('got');
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/fail',
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.link,
                    "size": this.size,
                    "price": this.cartTotal,
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
                    "image": this.productImage
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
                                "url": this.productImage
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://i.imgur.com/6h06tuW.png"
                    },
                    responseType: 'json'
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
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.link,
                    "size": this.size,
                    "productTitle": this.productTitle,
                    "price": this.cartTotal,
                    "timestamp": new Date(Date.now()).toISOString(),
                    "image": this.productImage
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
                                    "value": this.cartTotal
                                },
                                {
                                    "name": "Profile",
                                    "value": "||" + this.profilename + "||"
                                },
                                {
                                    "name": "Proxy List",
                                    "value": "||" + this.proxyListName + "||"
                                },
                                {
                                    "name": "Checkout URL",
                                    "value": "||" + this.checkoutLink + "||"
                                }
                            ],
                            "footer": {
                                "text": "Powered by Venetia",
                                "icon_url": "https://i.imgur.com/6h06tuW.png"
                            },
                            "timestamp": new Date(Date.now()).toISOString(),
                            "thumbnail": {
                                "url": this.productImage
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://i.imgur.com/6h06tuW.png"
                    },
                    responseType: 'json'
                }).then(response => {
                    console.log("Finished sending webhook")
                })
                .catch(error => {
                    console.log(error)
                })
        }

    }

    async getInitialCookie() {
        const got = require('got');
        if (this.stopped === "false") {
            this.send("Getting cookie (1)...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.pacsun.com',
                    cookieJar: this.cookieJar,
                    headers: {
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'user-agent': "atomz",
                        'origin': 'https://www.pacsun.com',
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
                let response = await got(this.request)

                if (this.stopped === "false")
                    console.log(response.body)

            } catch (error) {
                console.log(error.response.body)

            }
        }
    }

    async getCookie() {
        const got = require('got');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            this.send("Getting cookie...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.pacsun.com/resource/9e8dae460drn25292f4915cc9fc0195d',
                    cookieJar: this.cookieJar,
                    headers: {
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                        'origin': 'https://www.pacsun.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    },
                    json: {
                        "sensor_data": "7a74G7m23Vrp0o5c9259851.7-1,2,-94,-100,Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36,uaend,12147,20030107,en-US,Gecko,3,0,0,0,399279,3254140,1600,900,1600,900,1920,1080,1600,,cpen:0,i1:0,dm:0,cwen:0,non:1,opc:0,fc:0,sc:0,wrc:1,isc:0,vib:1,bat:1,x11:0,x12:1,8221,0.206697688103,811386627069,0,loc:-1,2,-94,-101,do_en,dm_en,t_en-1,2,-94,-105,0,-1,0,0,113,113,0;0,-1,0,0,750,1038,0;0,0,0,0,1182,360,0;0,0,0,0,1294,440,0;-1,2,-94,-102,0,0,0,0,113,113,0;0,-1,0,0,750,1038,0;0,0,0,0,1182,360,0;0,0,0,0,1294,440,0;-1,2,-94,-108,-1,2,-94,-110,0,1,6552,-1,-1;-1,2,-94,-117,-1,2,-94,-111,0,1881,-1,-1,-1;-1,2,-94,-109,0,1842,-1,-1,-1,-1,-1,-1,-1,-1,-1;1,6552,-1,-1,-1,-1,-1,-1,-1,-1,1;-1,2,-94,-114,-1,2,-94,-103,-1,2,-94,-112,https://www.pacsun.com/-1,2,-94,-115,1,6583,32,1881,8395,0,16827,6562,0,1622773254138,39,17359,0,1,2893,0,0,6564,16827,0,2E8B89F181E96F280B4EBFE7913A2674~0~YAAQhGvcF9pYM6J5AQAA5NrS1AZavRWbh5H1NIIBFfjKGKxE5l8nuaF15RY9eOpb1c053Dz71qigzmrU2UVVzO90f2wHnXLwxP/zGff0hNVQAFZu1HvJCFhEoTBBp8zdZDpobehvHINPK99tLbzD7td0FmuHHn5VjZCRa04RMrhyqbmX8sIHXqzlnt4XKXwlmupK+g9bbS9Shn2bY5H6xho7Rqdr4pz9ifKSBtgCqbDP6AkkxJwWmdIMHAwTgE4vVbSxfSaxpu3VUV+ypk8m4TOL0hQhf82yeGIcotpGC735rhQzLI9947iqLHNMl8aAf5wjjCiXpokdmwAnXTZR6Z09dPPJAqCeX9nZni0alLsVYr9JgPSzpqBlvNks/ZsJEh83dP+Sv1Ld4RqsO0adZL2zjFfQX6T4~-1~||-1||~-1,39126,670,-954685976,30261693,PiZtE,31472,61,0,-1-1,2,-94,-106,1,2-1,2,-94,-119,37,46,41,39,48,50,44,7,6,5,5,2415,2350,925,-1,2,-94,-122,0,0,0,0,1,0,0-1,2,-94,-123,-1,2,-94,-124,-1,2,-94,-126,-1,2,-94,-127,15321144241322243122-1,2,-94,-70,-1752591854;66351601;dis;,8;true;true;true;240;true;24;24;true;false;-1-1,2,-94,-80,5382-1,2,-94,-116,244060548-1,2,-94,-118,100906-1,2,-94,-129,33c6f54e72ed2196a148f981eb3a5bd51bb6639069e41454a91411e89e70f64e,1,7c535402e0cd5007e5c52235cf614eef4ac0185d6ea016852e12d8dc73a502ca,Google Inc.,ANGLE (NVIDIA GeForce RTX 2070 Direct3D11 vs_5_0 ps_5_0),d33258461eabfd04fd17e75f30a377b6ccd03805eccfd319e530279f5cccb45f,32-1,2,-94,-121,;7;18;0"
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
                let response = await got(this.request)

                if (this.stopped === "false")
                    console.log(response.body)

            } catch (error) {
                console.log(error.response.body)

            }
        }
    }

    async addToCart() {
        const got = require('got');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            this.send("Adding to cart...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.pacsun.com/on/demandware.store/Sites-pacsun-Site/default/Cart-AddProduct?format=ajax',
                    cookieJar: this.cookieJar,
                    headers: {
                        'x-sec-clge-req-type': 'ajax',
                        'accept': '*/*',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'admin',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'origin': 'https://www.pacsun.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.pacsun.com/champion/nylon-shorts-0172499380036.html',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    body: querystring.encode({
                        'cartAction': 'add',
                        'Quantity': '1',
                        'pid': "1880673"
                    })
                }
                if (this.proxy != '-') {
                    this.request['agent'] = {
                        https: tunnel.httpsOverHttp({
                            proxy: this.proxy
                        })
                    }
                }
                let response = await got(this.request)
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                console.log(root.querySelector('[class="minicart-quantity"]').rawText.trim().toString())
                if (root.querySelector('[class="minicart-quantity"]').rawText.trim().toString() === "0")
                    throw "Error adding to cart"
                else
                if (this.stopped === "true") {
                    await this.send("Carted")
                    await this.updateStat("carts")
                    return;
                }

            } catch (error) {
                if (error === "Error adding to cart") {
                    await this.send("Waiting for restock")
                    await sleep(3500)
                    await this.addToCart()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error adding to cart: " + error.response.statusCode)
                    await sleep(3500)
                    await this.addToCart()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.addToCart()
                }
            }
        }
    }

    async loadCart() {
        const got = require('got');
        if (this.stopped === "false") {
            this.send("Getting cart...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.pacsun.com/on/demandware.store/Sites-pacsun-Site/default/Cart-Show',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': "atomz",
                        'origin': 'www.' + this.site + '.com',
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
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.checkoutLink = root.querySelector('[id="checkout-form"]').getAttribute('action')
                    await this.send("Got checkout session")
                    return;
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    async loadCheckout() {
        const got = require('got');
        const querystring = require('querystring')

        if (this.stopped === "false") {
            this.send("Loading checkout...")
            try {
                this.request = {
                    method: 'post',
                    url: this.checkoutLink,
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': "atomz",
                        'origin': 'www.' + this.site + '.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    },
                    body: querystring.encode({
                        'dwfrm_cart_checkoutCart': 'Checkout'
                    })
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
                    //console.log(response.data)
                    await this.send("Loaded checkout")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.cartTotal = root.querySelectorAll('.opc-summary-price')[0].rawText.trim()
                    this.profileKey = root.querySelector('[name="dwfrm_profile_securekey"]').getAttribute('value')
                    this.shippingKey = root.querySelector('[name="dwfrm_singleshipping_securekey"]').getAttribute('value')
                    this.billingKey = root.querySelector('[name="dwfrm_billing_securekey"]').getAttribute('value')
                    this.csrfToken = root.querySelector('[name="csrf_token"]').getAttribute('value')


                    this.productImage = root.querySelectorAll('img')[9].getAttribute('src').split("?")[0]


                    this.productTitle = root.querySelectorAll('a')[11].rawText
                    return;
                }
            } catch (error) {
                console.log(error)
            }
        }
    }




    async submitOrder() {
        const got = require('got');
        const querystring = require('querystring')

        if (this.stopped === "false") {
            this.send("Submitting order...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.pacsun.com/on/demandware.store/Sites-pacsun-Site/default/COCheckout-OrderSubmit',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'user-agent': "atomz",
                        'origin': 'www.' + this.site + '.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    },
                    body: querystring.encode({
                        'dwfrm_profile_securekey': this.profileKey,
                        'dwfrm_billing_billingAddress_addressFields_email_emailAddress': this.profile.email,
                        'dwfrm_billing_billingAddress_addressFields_phone': this.profile.phone.substring(0, 3) + " " + this.profile.phone.substring(3),
                        'dwfrm_singleshipping_shippingAddress_alternateFirstName': '',
                        'dwfrm_singleshipping_shippingAddress_alternateLastName': '',
                        'dwfrm_singleshipping_securekey': this.shippingKey,
                        'dwfrm_singleshipping_shippingAddress_addressFields_firstName': this.profile.firstName,
                        'dwfrm_singleshipping_shippingAddress_addressFields_lastName': this.profile.lastName,
                        'dwfrm_singleshipping_shippingAddress_addressFields_address1': this.profile.address1,
                        'dwfrm_singleshipping_shippingAddress_addressFields_address2': '',
                        'dwfrm_singleshipping_shippingAddress_addressFields_city': this.profile.city,
                        'dwfrm_singleshipping_shippingAddress_addressFields_states_state': abbrRegion(this.profile.state, 'abbr'),
                        'dwfrm_singleshipping_shippingAddress_addressFields_country': 'US',
                        'dwfrm_singleshipping_shippingAddress_addressFields_postal': this.profile.zip,
                        'dwfrm_singleshipping_originID': 'DSK',
                        'dwfrm_billing_paymentMethods_selectedPaymentMethodID': 'CREDIT_CARD',
                        'dwfrm_billing_paymentMethods_creditCard_number': this.profile.cardNumber,
                        'dwfrm_billing_paymentMethods_creditCard_owner': this.profile.firstName + " " + this.profile.lastName,
                        'dwfrm_billing_paymentMethods_creditCard_type': 'Visa',
                        'expDate': this.profile.expiryMonth + "/" + this.profile.expiryYear.substring(2),
                        'dwfrm_billing_paymentMethods_creditCard_expiration_month': this.profile.expiryMonth,
                        'dwfrm_billing_paymentMethods_creditCard_expiration_year': this.profile.expiryYear,
                        'dwfrm_billing_paymentMethods_creditCard_cvn': this.profile.cvv,
                        'dwfrm_billing_save': 'true',
                        'dwfrm_billing_securekey': this.billingKey,
                        'ltkSubscriptionCode': 'checkoutbilling',
                        'dwfrm_billing_billingAddress_addressFields_firstName': this.profile.firstName,
                        'dwfrm_billing_billingAddress_addressFields_lastName': this.profile.lastName,
                        'dwfrm_billing_billingAddress_addressFields_address1': this.profile.address1,
                        'dwfrm_billing_billingAddress_addressFields_address2': '',
                        'dwfrm_billing_billingAddress_addressFields_city': this.profile.city,
                        'dwfrm_billing_billingAddress_addressFields_states_state': abbrRegion(this.profile.state, 'abbr'),
                        'dwfrm_billing_billingAddress_addressFields_postal': this.profile.zipcode,
                        'dwfrm_billing_billingAddress_addressFields_country': 'US',
                        'csrf_token': this.csrfToken,
                        'shippingID': 'SP'
                    })
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
                    await this.send("Submitted order")
                    return;
                }
            } catch (error) {
                console.log(error)
                await this.sendFail()
            }
        }
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


        //  if (this.stopped === "false")
        //    await this.getInitialCookie()

        //  if (this.stopped === "false")
        //      await this.getCookie()

        if (this.stopped === "false")
            await this.addToCart()

        if (this.stopped === "false")
            await this.loadCart()

        if (this.stopped === "false")
            await this.loadCheckout()

        if (this.stopped === "false")
            await this.submitOrder()

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