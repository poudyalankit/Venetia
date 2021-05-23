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
        this.webhookLink = fs.readFileSync(path.join(configDir, '/userdata/webhook.txt'), 'utf8');
        this.mode = taskInfo.mode;
        this.productTitle;
        this.link = taskInfo.product;
        this.size = taskInfo.size;
        this.profilename = taskInfo.profile;
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        this.encryptedcard;
        const tough = require('tough-cookie')
        this.cookieJar = new tough.CookieJar()
        this.accounts = getAccountInfo(taskInfo.accounts)
        this.profile = getProfileInfo(taskInfo.profile)
        this.proxyArray = getProxyInfo(taskInfo.proxies)
        this.proxy = this.proxyArray.sample()
        this.site = taskInfo.site.replace(/\s/g, '')
        this.baseLink = taskInfo.baseLink
        this.plainLink = this.baseLink.split("https://")[1]
        this.insecurelink = "http://" + this.plainLink
        this.sitekey = taskInfo.sitekey
        this.shippingPayload = {
            "_method": "patch",
            "previous_step": "contact_information",
            "step": "shipping_method",
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
            "checkout[shipping_address][phone]": this.profile.phone
        }
        this.shippingRatePayload = {
            "_method": "patch",
            "previous_step": "shipping_method",
            "step": "payment_method",
            "checkout[client_details][browser_width]": "1087",
            "checkout[client_details][browser_height]": "814",
            "checkout[client_details][javascript_enabled]": "1",
            "checkout[client_details][color_depth]": "24",
            "checkout[client_details][java_enabled]": "false",
            "checkout[client_details][browser_tz]": "300"
        }
        this.paymentPayload = {
            '_method': 'patch',
            'previous_step': 'payment_method',
            'step': '',
            'checkout[credit_card][vault]': 'false',
            'checkout[different_billing_address]': 'false',
            'complete': 1,
            'checkout[client_details][browser_width]': '1600',
            'checkout[client_details][browser_height]': '789',
            'checkout[client_details][javascript_enabled]': '1',
            'checkout[client_details][color_depth]': '24',
            'checkout[client_details][java_enabled]': 'false',
            'checkout[client_details][browser_tz]': '240'

        }
        this.captchaResponse = "none"
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
        const querystring = require('querystring')
        var x = this.profile.cardNumber
        var y = "";
        for (var i = 0; i < x.length; i = i + 4) {
            y += x.substring(i, i + 4)
            if (i != x.length - 1)
                y += " "
        }
        this.profile.cardNumber = y;
        console.log(this.profile.cardNumber)
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
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
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
                console.log(response.body)
                this.encryptedPayment = response.body.id
                await this.send("Submitted card")
                return;
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting card: " + error.response.statusCode)
                    await sleep(4000)
                    await this.submitCard()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting card")
                    await sleep(4000)
                    await this.submitCard()
                }
            }
        }
    }

    async findProduct() {
        const got = require('got');
        const tunnel = require('tunnel');
        console.log(this.baseLink)
        console.log(this.plainLink)
        console.log(this.cookieJar)
            //this.cookie = "shopify_digest=" + await makeid(7)
            //this.cookieJar.setCookie(this.cookie + '; Domain=' + this.plainLink + '; Path=/; Secure; SameSite=Lax; hostOnly=false; aAge=10ms; cAge=10ms', this.baseLink)
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
                let response = await got(this.request);
                this.productTitle = response.body.product.title
                await this.sendProductTitle(this.productTitle)
                for (var i = 0; i < response.body.product.variants.length; i++) {
                    if (response.body.product.variants[i].title.includes(this.size)) {
                        this.productVariant = response.body.product.variants[i].id;
                        this.imageURL = response.body.product.image.src
                        console.log(this.imageURL)
                        console.log("Found product")
                        await this.send("Found product")
                        return;
                    }
                }
                await this.send("Waiting for product")
                throw "Error finding variant"
            } catch (error) {
                if (error === "Error finding variant") {
                    await this.send("Waiting for size")
                    await sleep(4000)
                    await this.findProduct()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error finding product: " + error.response.statusCode)
                    await sleep(4000)
                    await this.findProduct()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error finding variant")
                    await sleep(4000)
                    await this.findProduct()
                }
            }
        }
    }

    async addToCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        console.log(this.productVariant)
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
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
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
                this.cartTotal = response.body.price
                await this.send("Carted")
                console.log(this.cookieJar)

                return;
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    if (error.response.statusCode === 422) {
                        await this.send("Waiting for restock")
                        await sleep(4000)
                        await this.addToCart()
                    } else {
                        await this.send("Error adding to cart: " + error.response.statusCode)
                        await sleep(4000)
                        await this.addToCart()
                    }
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected ATC error")
                    await sleep(4000)
                    await this.addToCart()
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
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
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
                console.log(response.url)
                if (response.url.includes("/checkpoint")) {
                    await this.send("Found checkpoint")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.captchaauthToken = root.querySelector('[name="authenticity_token"]').getAttribute('value')
                    if (this.stopped === "false")
                        await this.sendCaptchaCheckpoint()

                    if (this.stopped === "false")
                        await this.retrieveCaptchaResponse()
                    await this.submitCheckpoint()
                    await this.loadCheckout()
                } else {
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.body);
                    this.authToken = root.querySelector('[name="authenticity_token"]').getAttribute('value')
                    this.shippingPayload['authenticity_token'] = this.authToken
                    this.checkoutURL = response.url
                    await this.send("Loaded checkout")
                    if (this.captchaResponse != 'none') {
                        console.log(response.body)
                        this.fscount = root.querySelector('[value="fs_count"]').getAttribute('name')
                        this.searchBy = this.fscount.split("-count")[0]
                        this.shippingPayload[this.fscount] = "fs_count"
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
                        this.shippingPayload = querystring.encode(this.shippingPayload)
                        var totalfscount = "&" + this.fscount + "=" + count
                        this.shippingPayload = this.shippingPayload + totalfscount
                    } else {
                        this.shippingPayload = querystring.encode(this.shippingPayload)
                    }
                    console.log(this.shippingPayload)
                    return;
                }
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error loading checkout: " + error.response.statusCode)
                    await sleep(4000)
                    await this.loadCheckout()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading checkout")
                    await sleep(4000)
                    await this.loadCheckout()
                }
            }
        }
    }

    async sendCaptchaCheckpoint() {
        const got = require('got');
        if (this.stopped === "false") {
            let response = await got({
                method: 'get',
                url: 'http://localhost:4444/venetia/addtoQueue?captchaType=shopifycheckpoint&sitekey=' + this.sitekey + '&siteURL=' + this.insecurelink,
                responseType: 'json'
            })
            await this.send("Waiting for captcha")
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

    async submitCheckpoint() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Submitting checkpoint...")
            try {
                this.request = {
                    method: 'post',
                    url: this.baseLink + "/checkpoint",
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    body: querystring.encode({
                        'authenticity_token': this.captchaauthToken,
                        'g-recaptcha-response': this.captchaResponse,
                        'data_via': 'cookie',
                        'commit': ''
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
                if (response.body.includes("/checkout") == true)
                    await this.send("Submitted checkpoint")
                else throw "Error submitting checkpoint"
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting checkpoint: " + error.response.statusCode)
                    await sleep(4000)
                    await this.submitCheckpoint()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting checkpoint")
                    await sleep(4000)
                    await this.submitCheckpoint()
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
                    url: this.checkoutURL,
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
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
                console.log(response.body)
                await this.send("Submitted shipping")
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting shipping: " + error.response.statusCode)
                    await sleep(4000)
                    await this.submitShipping()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting shipping")
                    await sleep(4000)
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
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
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

                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (typeof root.querySelectorAll(".input-radio")[0] !== 'undefined') {
                    this.shippingRate = root.querySelectorAll(".input-radio")[0].getAttribute("value")
                    this.shippingRatePayload['authenticity_token'] = this.authToken
                    this.shippingRatePayload['checkout[shipping_rate][id]'] = this.shippingRate
                    if (this.captchaResponse != 'none') {
                        console.log(this.shippingRatePayload)
                        this.fscount = root.querySelector('[value="fs_count"]').getAttribute('name')
                        this.searchBy = this.fscount.split("-count")[0]
                        this.shippingRatePayload[this.fscount] = "fs_count"
                        this.searchBy = "#fs_" + this.searchBy
                        var count = 0;
                        this.values = root.querySelector(this.searchBy)
                        for (var i = 0; i < this.values.childNodes.length; i++) {
                            if (this.values.childNodes[i].tagName === "TEXTAREA") {
                                count++;
                                var id = this.values.childNodes[i].getAttribute('id')
                                this.shippingRatePayload[id] = "";
                            }
                        }
                        this.shippingRatePayload = querystring.encode(this.shippingRatePayload)
                        var totalfscount = "&" + this.fscount + "=" + count
                        this.shippingRatePayload = this.shippingRatePayload + totalfscount
                        console.log(this.shippingRatePayload)
                    } else {
                        console.log(this.shippingRatePayload)
                        this.shippingRatePayload = querystring.encode(this.shippingRatePayload)
                    }
                } else {
                    await sleep(300)
                    await this.loadShippingRate()
                }
                console.log(this.shippingRate)
                await this.send("Loaded rates")
                return;
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error loading rates: " + error.response.statusCode)
                    await sleep(4000)
                    await this.loadShippingRate()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading rates")
                    await sleep(4000)
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
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
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
                await this.send("Submitted rate")
                return;
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting rate: " + error.response.statusCode)
                    await sleep(4000)
                    await this.submitRate()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting rate")
                    await sleep(4000)
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
            await this.submitCard()
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
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
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
                var HTMLParser = require('node-html-parser');
                var root = HTMLParser.parse(response.body);
                if (root.querySelector('[name="checkout[payment_gateway]"]') != null) {
                    this.paymentGateway = root.querySelector('[name="checkout[payment_gateway]"]').getAttribute('value')
                    this.totalPrice = root.querySelector('[name="checkout[total_price]"]').getAttribute('value')
                    this.paymentPayload['authenticity_token'] = this.authToken
                    this.paymentPayload['checkout[total_price]'] = this.totalPrice
                    this.paymentPayload['checkout[payment_gateway]'] = this.paymentGateway
                    this.paymentPayload['s'] = this.encryptedPayment

                    if (this.captchaResponse != 'none') {
                        console.log(this.paymentPayload)
                        this.fscount = root.querySelector('[value="fs_count"]').getAttribute('name')
                        this.searchBy = this.fscount.split("-count")[0]
                        this.paymentPayload[this.fscount] = "fs_count"
                        this.searchBy = "#fs_" + this.searchBy
                        var count = 0;
                        this.values = root.querySelector(this.searchBy)
                        for (var i = 0; i < this.values.childNodes.length; i++) {
                            if (this.values.childNodes[i].tagName === "TEXTAREA") {
                                count++;
                                var id = this.values.childNodes[i].getAttribute('id')
                                this.paymentPayload[id] = "";
                            }
                        }
                        this.paymentPayload = querystring.encode(this.paymentPayload)
                        var totalfscount = "&" + this.fscount + "=" + count
                        this.paymentPayload = this.paymentPayload + totalfscount
                        console.log(this.paymentPayload)
                    } else {
                        console.log(this.paymentPayload)
                        this.paymentPayload = querystring.encode(this.paymentPayload)
                    }
                } else {
                    await sleep(300)
                    await this.loadPayment()
                }
                await this.send("Loaded payment")
                return;
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error loading payment: " + error.response.statusCode)
                    await sleep(4000)
                    await this.loadPayment()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading payment")
                    await sleep(4000)
                    await this.loadPayment()
                }
            }
        }
    }

    async submitOrder() {
        const got = require('got');
        const tunnel = require('tunnel');
        const querystring = require('querystring')
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
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'accept-language': 'en-US,en;q=0.9',
                        'origin': this.baseLink,
                        'referer': this.baseLink
                    },
                    body: this.paymentPayload,
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
                if (root.querySelector("title") != null && root.querySelector("title").rawText.includes("Error")) {
                    throw "Error submitting order"
                } else {
                    await this.send("Submitted order")
                    console.log(response.body)
                    console.log(response.url)
                }
            } catch (error) {
                if (error === "Error submitting order") {
                    await this.send("Error submitting order")
                    await sleep(4000)
                    await this.submitOrder()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error submitting order: " + error.response.statusCode)
                    await sleep(4000)
                    await this.submitOrder()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error submitting order")
                    await sleep(4000)
                    await this.submitOrder()
                }
            }
        }
    }

    async processPayment() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Processing...")
            await sleep(4000)
            try {
                this.request = {
                    method: 'get',
                    url: this.checkoutURL + '/processing',
                    cookieJar: this.cookieJar,
                    headers: {
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'x-requested-with': 'XMLHttpRequest',
                        'sec-ch-ua-mobile': '?0',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
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
                console.log(response.body)
                if (response.url.includes("?from_processing_page=1") == false && response.url.includes("thank")) {
                    await this.send("Check email")
                } else if (response.url.includes("?from_processing_page=1")) {
                    await this.send("Error processing order")
                    await sleep(3000)
                    await this.loadPayment()
                    await this.submitCard()
                    await this.processPayment()
                } else {
                    await sleep(3000)
                    await this.processPayment()
                }
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    await this.send("Error processing: " + error.response.statusCode)
                    await sleep(4000)
                    await this.processPayment()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error loading payment")
                    await sleep(4000)
                    await this.processPayment()
                }
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

        if (this.stopped === "false")
            await this.findProduct()

        if (this.stopped === "false")
            await this.addToCart()

        if (this.stopped === "false")
            await this.loadCheckout()

        await sleep(2000)
        if (this.stopped === "false")
            await this.submitShipping()

        await sleep(2000)
        if (this.stopped === "false")
            await this.loadShippingRate()

        await sleep(2000)
        if (this.stopped === "false")
            await this.submitRate()

        await sleep(2000)
        if (this.stopped === "false")
            await this.loadPayment()

        await sleep(2000)
        if (this.stopped === "false")
            await this.submitOrder()

        if (this.stopped === "false")
            await this.processPayment()
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