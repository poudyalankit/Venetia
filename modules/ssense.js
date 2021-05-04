module.exports = class SSENSETask {
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
        this.cartSKUS;
        this.cartSKUS2;
        this.cartSKUS3;
        this.csrf_token;
        this.shippingMethod;
        this.shipping;
        this.profilename = taskInfo.profile;
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        this.encryptedcard;
        this.fullname;
        this.sku = "none";
        const tough = require('tough-cookie');
        this.cookieJar = new tough.CookieJar();
        this.accounts = getAccountInfo(taskInfo.accounts)
        this.profile = getProfileInfo(taskInfo.profile);
        this.proxyArray = getProxyInfo(taskInfo.proxies);
        this.proxy = this.proxyArray.sample();
        if (this.link.includes("+")) {
            this.sku = this.link.substring(1)
        }

        this.sizeArray = ["00", "01", "02", "03", "04", "05", "06", "07"]

        if (this.link === "coreM") {
            this.sku = "211712M234002" + this.sizeArray.sample()
            this.sendProductTitle("Yeezy Slide Core")
        }

        if (this.link === "coreW") {
            this.sku = "211712F124003" + this.sizeArray.sample()
            this.sendProductTitle("Yeezy Slide Core")
        }

        if (this.link === "resinM") {
            this.sku = "211712M234001" + this.sizeArray.sample()
            this.sendProductTitle("Yeezy Slide Resin")
        }

        if (this.link === "resinW") {
            this.sku = "211712F124002" + this.sizeArray.sample()
            this.sendProductTitle("Yeezy Slide Resin")
        }

        if (this.link === "pureM") {
            this.sku = "211712M234000" + this.sizeArray.sample()
            this.sendProductTitle("Yeezy Slide Pure")
        }

        if (this.link === "pureW") {
            this.sku = "211712F124004" + this.sizeArray.sample()
            this.sendProductTitle("Yeezy Slide Pure")
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
                    "image": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg"
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
                                "url": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg"
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
                    "image": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg"
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
                                "url": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg"
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

    async sendSuccessPayPal() {
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
                    "image": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg"
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
                                "url": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg"
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

    async login() {
        const got = require('got');
        const tunnel = require('tunnel');

        if (this.stopped === "false") {
            await this.send("Authenticating")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.ssense.com/en-us/account/authenticate',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.ssense.com',
                        'cache-control': 'max-age=0',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        'email': this.profile.email
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
                    console.log("Authenticated")
                    await this.send("Authenticated")
                    return;
                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    this.send("Error authenticating, retrying")
                    await sleep(4000)
                    await this.login()
                }
            }
        }
    }

    async loadProductPage() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Loading product")
            try {
                this.request = {
                    method: 'get',
                    url: this.link + ".json",
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.ssense.com',
                        'cache-control': 'max-age=0',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
                        'accept-language': 'en-US,en;q=0.9'
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
                    console.log("Loaded product info")
                    await this.send("Loaded product")

                    this.productTitle = response.body.product.name;
                    await this.sendProductTitle(this.productTitle)

                    var sizes = response.body.product.sizes;
                    if (this.size === "RS") {
                        var sizesinStock = []
                        for (var i = 0; i < sizes.length; i++) {
                            if (sizes[i].inStock === true)
                                sizesinStock.push(sizes[i].sku)
                        }

                        this.sku = sizesinStock.sample()
                        return;
                    } else {
                        for (var i = 0; i < sizes.length; i++) {
                            if (sizes[i].name.trim() === this.size.trim()) {
                                this.sku = sizes[i].sku;
                                await this.send("Found size")
                                return;
                            }
                        }
                        throw 'Size not found'
                    }
                }
            } catch (error) {
                console.log(error)
                await this.send("Error getting product");
                await sleep(4000)
                await this.loadProductPage()
            }
        }
    }

    async addToCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        console.log(this.sku)
        if (this.stopped === "false") {
            await this.send("Adding to cart")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.ssense.com/en-us/api/shopping-bag/' + this.sku,
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.ssense.com',
                        'cache-control': 'max-age=0',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
                        'accept-language': 'en-US,en;q=0.9',
                    },
                    json: {
                        'serviceType': "product-details",
                        'sku': this.sku,
                        'userId': null
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
                if (response.statusCode === 200 && this.stopped === "false") {
                    console.log("Carted")
                    await this.send("Carted")
                    await this.updateStat("carts")
                    return;
                }

            } catch (error) {
                console.log(error.response.body)
                await this.send("Error carting, retrying")
                await sleep(4000)
                await this.addToCart()
            }
        }
    }

    async getCheckoutSession() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Getting checkout session")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.ssense.com/en-us/checkout.json',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.ssense.com',
                        'cache-control': 'max-age=0',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
                        'accept-language': 'en-US,en;q=0.9'
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
                if (response.statusCode === 200 && this.stopped === "false") {
                    console.log("Got checkout session")
                    this.send("Got checkout session")
                    this.csrf_token = response.body.csrf_token
                    this.cartTotal = response.body.checkout_cart.total;
                    this.cartSKUS = response.body.checkout_cart.products;
                    this.cartSKUS2 = "";
                    this.cartSKUS3 = []
                    for (var i = 0; i < this.cartSKUS.length; i++) {
                        this.cartSKUS3.push(this.cartSKUS[i].sku)
                        if (i == this.cartSKUS.length - 1) {
                            this.cartSKUS2 += this.cartSKUS[i].sku;
                        } else {
                            this.cartSKUS2 += this.cartSKUS[i].sku + ",";
                        }
                    }
                    console.log(this.cartSKUS3)
                    console.log(this.cartTotal)
                    console.log(this.csrf_token)
                    return;
                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    await this.send("Failed getting checkout session")
                    await sleep(4000)
                    await this.getCheckoutSession()
                }
            }
        }
    }

    async getShipping() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Getting shipping")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.ssense.com/en-us/api/checkout/shipping.json',
                    searchParams: {
                        country_code: "US",
                        state_code: abbrRegion(this.profile.state, "abbr")
                    },
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.ssense.com',
                        'cache-control': 'max-age=0',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'navigate',
                        'referer': 'https://www.ssense.com/en-us/checkout',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
                        'accept-language': 'en-US,en;q=0.9'
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
                    this.shipping = response.body[0].price;
                    this.shippingMethod = response.body[0].methodKeyName;
                    console.log(this.shipping)
                    this.send("Got shipping")
                    return;
                }

            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    this.send("Error getting shipping")
                    await sleep(4000)
                    await this.getShipping()
                }
            }
        }
    }


    async getTaxes() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Getting taxes")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.ssense.com/en-us/api/checkout/taxes.json',
                    searchParams: {
                        country_code: "US",
                        state_code: abbrRegion(this.profile.state, "abbr"),
                        sub_total: this.cartTotal,
                        shipping: this.shipping,
                        should_check_restriction: false,
                        city: this.profile.city,
                        postal_code: this.profile.zipcode,
                        address: this.profile.address1,
                        items: this.cartSKUS2
                    },
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.ssense.com',
                        'cache-control': 'max-age=0',
                        'upgrade-insecure-requests': '1',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'navigate',
                        'referer': 'https://www.ssense.com/en-us/checkout',
                        'sec-fetch-user': '?1',
                        'sec-fetch-dest': 'document',
                        'accept-language': 'en-US,en;q=0.9'
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
                    console.log("Got taxes")
                    this.orderTotal = response.body.total
                    console.log(this.orderTotal)
                    this.send("Got taxes")
                    return;

                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    this.send("Error getting taxes")
                    await sleep(4000)
                    await this.getTaxes()
                }
            }
        }
    }

    async submitOrder() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Submitting order")
            this.encryptedcard = this.profile.cardNumber.substring(0, 6) + "000000" + this.profile.cardNumber.substring(12)
            this.fullname = this.profile.firstName + " " + this.profile.lastName;
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.ssense.com/en-us/api/checkout/authorize',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.ssense.com',
                        'accept': 'application/json',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                        'content-type': 'application/json',
                        'origin': 'https://www.ssense.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.ssense.com/en-us/checkout',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "_csrf": this.csrf_token,
                        "shippingAddress": {
                            "id": null,
                            "firstName": this.profile.firstName,
                            "lastName": this.profile.lastName,
                            "company": "",
                            "address1": this.profile.address1,
                            "countryCode": "US",
                            "stateCode": abbrRegion(this.profile.state, "abbr"),
                            "postCode": this.profile.zipcode,
                            "city": this.profile.city,
                            "phone": this.profile.phone
                        },
                        "shippingMethodId": 7,
                        "shippingMethodKeyName": this.shippingMethod,
                        "paymentMethod": "credit",
                        "paymentProcessor": "firstdatapayeezy",
                        "skus": this.cartSKUS3,
                        "orderTotal": this.orderTotal,
                        "creditCardDetails": {
                            "tokenizedCardNumber": this.encryptedcard,
                            "tokenizedSecurityCode": "100",
                            "expiryMonth": this.profile.expiryMonth,
                            "expiryYear": this.profile.expiryYear,
                            "cardholderName": this.fullname
                        },
                        "billingAddress": {
                            "id": null,
                            "firstName": this.profile.firstName,
                            "lastName": this.profile.lastName,
                            "company": "",
                            "address1": this.profile.address1,
                            "countryCode": "US",
                            "stateCode": abbrRegion(this.profile.state, "abbr"),
                            "postCode": this.profile.zipcode,
                            "city": this.profile.city,
                            "phone": this.profile.phone,
                            "isSameAsShipping": true
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
                console.log(response.body)
                if (this.stopped === "false" && response.body.status != "error") {
                    this.updateStat("checkouts")
                    console.log("Check email")
                    console.log(response.body.messages)
                    this.send("Check email")
                    this.sendSuccess()
                    return;
                } else {
                    throw "Error submitting order"
                }
            } catch (error) {
                console.log(error)
                if (this.stopped === "false") {
                    this.updateStat("fails")
                    this.send("Checkout failed")
                    this.sendFail()
                }
            }
        }
    }

    async submitOrderPayPal() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Submitting order")
            this.encryptedcard = this.profile.cardNumber.substring(0, 6) + "000000" + this.profile.cardNumber.substring(12)
            this.fullname = this.profile.firstName + " " + this.profile.lastName;
            try {
                this.request = {
                    method: 'post',
                    url: 'https://www.ssense.com/en-us/api/checkout/authorize',
                    cookieJar: this.cookieJar,
                    headers: {
                        'authority': 'www.ssense.com',
                        'accept': 'application/json',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                        'content-type': 'application/json',
                        'origin': 'https://www.ssense.com',
                        'sec-fetch-site': 'same-origin',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-dest': 'empty',
                        'referer': 'https://www.ssense.com/en-us/checkout',
                        'accept-language': 'en-US,en;q=0.9'
                    },
                    json: {
                        "_csrf": this.csrf_token,
                        "shippingAddress": {
                            "id": null,
                            "firstName": this.profile.firstName,
                            "lastName": this.profile.lastName,
                            "company": "",
                            "address1": this.profile.address1,
                            "countryCode": "US",
                            "stateCode": abbrRegion(this.profile.state, "abbr"),
                            "postCode": this.profile.zipcode,
                            "city": this.profile.city,
                            "phone": this.profile.phone
                        },
                        "shippingMethodId": 7,
                        "shippingMethodKeyName": this.shippingMethod,
                        "paymentMethod": "paypal",
                        "skus": this.cartSKUS3,
                        "orderTotal": this.orderTotal
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
                if (this.stopped === "false" && response.body.status != "error") {
                    this.checkoutLink = response.body.url
                    this.updateStat("checkouts")
                    console.log("Check webhook")
                    console.log(response.body.messages)
                    this.send("Check webhook")
                    this.sendSuccessPayPal()
                    return;
                } else {
                    throw "Error submitting order"
                }
            } catch (error) {
                console.log(error.response.body)
                if (this.stopped === "false") {
                    this.updateStat("fails")
                    this.send("Checkout failed")
                    this.sendFail()
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
        console.log(typeof this.sku)
        if (this.stopped === "false" && this.sku === 'none')
            await this.loadProductPage()

        if (this.stopped === "false")
            await this.addToCart()

        if (this.stopped === "false")
            await this.login()

        if (this.stopped === "false")
            await this.getCheckoutSession()

        if (this.stopped === "false")
            await this.getShipping()

        if (this.stopped === "false")
            await this.getTaxes()

        if (this.stopped === "false" && this.mode.includes("-C"))
            await this.submitOrder()
        else if (this.stopped === "false")
            await this.submitOrderPayPal()



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