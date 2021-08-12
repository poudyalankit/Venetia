module.exports = class SSENSETask {
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
        this.cartSKUS;
        this.cartSKUS2;
        this.monitorDelay;
        this.errorDelay;
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
        this.accounts = getAccountInfo(taskInfo.accounts, this.configDir)
        this.profile = getProfileInfo(taskInfo.profile, this.configDir)
        this.proxyArray = getProxyInfo(taskInfo.proxies, this.configDir)
        this.proxy = this.proxyArray.sample();
        this.oglink = this.link
        if (this.link.length == 15) {
            this.sku = this.link
            this.productTitle = this.sku
        } else if (this.link.includes("http") == false) {
            this.link = "https://www.ssense.com/en-us/men/product/essentials/~/" + this.link
        }
        if (this.profile.country === "Canada") {
            this.country = "CA"
        } else {
            this.country = "US"
        }
    }

    async sendFail() {
        const got = require('got');
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=SSENSE&input=" + this.oglink
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
                    "image": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg",
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
                                "url": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg"
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
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=SSENSE&input=" + this.oglink
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
                    "image": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg",
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
                                "url": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg"
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

    async sendSuccessPayPal() {
        const got = require('got');
        this.quickTaskLink = "http://localhost:4444/quicktask?storetype=SSENSE&input=" + this.oglink
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
                    "image": "https://img.ssensemedia.com/images/b_white,g_center,f_auto,q_auto:best/" + this.sku.substring(0, this.sku.length - 2) + "_1/image.jpg",
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
                    this.log("Finished sending webhook")
                })
                .catch(error => {
                    this.log(error)
                })
        }
    }


    async authenticateEmail() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Authenticating...")
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
                    await this.send("Authenticated")
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    await this.send("Error authenticating: " + error.response.statusCode)
                    await sleep(this.errorDelay)
                    await this.authenticateEmail()
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error authenticating")
                    await sleep(this.errorDelay)
                    await this.authenticateEmail()
                }
            }
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
                    url: 'https://www.ssense.com/en-us/account/login',
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
                        'email': this.accounts.email,
                        'password': this.accounts.password
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
                    await this.send("Logged in")
                    return;
                }
            } catch (error) {
                await this.setDelays()
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

    async loadProductPage() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            await this.send("Loading product...")
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
                await this.setDelays()
                if (error === "Size not found" && this.stopped === "false") {
                    await this.send("Waiting for restock")
                    await sleep(this.monitorDelay)
                    await this.loadProductPage()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response)
                    if (error.response.statusCode === 403) {
                        await this.send("Error proxy banned")
                        await sleep(this.errorDelay)
                        await this.loadProductPage()
                    } else {
                        await this.send("Error getting product: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.loadProductPage()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.loadProductPage()
                }
            }
        }
    }


    async addToCart() {
        const got = require('got');
        const tunnel = require('tunnel');
        this.log(this.sku)
        if (this.stopped === "false") {
            await this.send("Adding to cart...")
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
                    await this.send("Carted")
                    return;
                }

            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response.body)
                    if (error.response.statusCode === 409) {
                        await this.send("OOS, retrying")
                        await sleep(this.errorDelay)
                        await this.addToCart()
                    } else
                    if (error.response.statusCode === 403) {
                        await this.send("Error proxy banned")
                        this.proxy = this.proxyArray.sample()
                        await sleep(this.errorDelay)
                        await this.addToCart()
                    } else {
                        await this.send("Error adding to cart: " + error.response.statusCode)
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

    async getCheckoutSession() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Loading checkout...")
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
                    this.log(this.cartSKUS3)
                    this.log(this.cartTotal)
                    this.log(this.csrf_token)
                    return;
                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response)
                    if (error.response.statusCode === 403) {
                        await this.send("Error proxy banned")
                        await sleep(this.errorDelay)
                        await this.getCheckoutSession()
                    } else {
                        await this.send("Error getting checkout: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.getCheckoutSession()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.getCheckoutSession()
                }
            }
        }
    }

    async getShipping() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Getting shipping...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.ssense.com/en-us/api/checkout/shipping.json',
                    searchParams: {
                        country_code: this.country,
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
                    this.log(this.shipping)
                    this.send("Got shipping")
                    return;
                }

            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response)
                    if (error.response.statusCode === 403) {
                        await this.send("Error proxy banned")
                        await sleep(this.errorDelay)
                        await this.getShipping()
                    } else {
                        await this.send("Error getting shipping: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.getShipping()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.getShipping()
                }
            }
        }
    }


    async getTaxes() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Getting taxes...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://www.ssense.com/en-us/api/checkout/taxes.json',
                    searchParams: {
                        country_code: this.country,
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
                    this.log("Got taxes")
                    this.orderTotal = response.body.total
                    this.log(this.orderTotal)
                    this.send("Got taxes")
                    return;

                }
            } catch (error) {
                await this.setDelays()
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    this.log(error.response)
                    if (error.response.statusCode === 403) {
                        await this.send("Error proxy banned")
                        await sleep(this.errorDelay)
                        await this.getTaxes()
                    } else {
                        await this.send("Error getting taxes: " + error.response.statusCode)
                        await sleep(this.errorDelay)
                        await this.getTaxes()
                    }
                } else if (this.stopped === "false") {
                    this.log(error)
                    await this.send("Unexpected error")
                    await sleep(this.errorDelay)
                    await this.getTaxes()
                }
            }
        }
    }

    async submitOrder() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Submitting order...")
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
                            "countryCode": this.country,
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
                            "countryCode": this.country,
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
                this.log(response.body)
                if (this.stopped === "false" && response.body.status != "error") {
                    this.log(response.body.messages)
                    this.send("Check email")
                    this.sendSuccess()
                    return;
                } else {
                    throw "Error submitting order"
                }
            } catch (error) {
                this.log(error)
                await this.setDelays()
                if (this.stopped === "false") {
                    this.send("Checkout failed")
                    this.sendFail()
                    var path = require('path')
                    var fs = require('fs');
                    this.log(JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/settings.json'), 'utf8'))[0].retryCheckouts)
                    if (JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/settings.json'), 'utf8'))[0].retryCheckouts == true) {
                        await sleep(this.errorDelay)
                        await this.submitOrder()
                    }
                }
            }
        }
    }

    async submitOrderPayPal() {
        const got = require('got');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Submitting order...")
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
                            "countryCode": this.country,
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
                this.log(response.body)
                if (this.stopped === "false" && response.body.status != "error") {
                    this.checkoutLink = response.body.url
                    this.log(response.body.messages)
                    this.send("Check webhook")
                    this.sendSuccessPayPal()
                    return;
                } else {
                    throw "Error submitting order"
                }
            } catch (error) {
                await this.setDelays()
                this.log(error.response.body)
                if (this.stopped === "false") {
                    this.send("Checkout failed")
                    this.sendFail()
                    var path = require('path')
                    var fs = require('fs');
                    this.log(JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/settings.json'), 'utf8'))[0].retryCheckouts)
                    if (JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/settings.json'), 'utf8'))[0].retryCheckouts == true) {
                        await sleep(this.errorDelay)
                        await this.submitOrderPayPal()
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
        await this.sendProductTitle(this.oglink)
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

        if (this.stopped === "false" && this.sku === 'none')
            await this.loadProductPage()

        if (this.stopped === "false")
            await this.addToCart()

        if (this.accounts != "-") {
            if (this.stopped === "false")
                await this.actualLogin()
        } else if (this.accounts === "-") {
            if (this.stopped === "false")
                await this.login()
        }

        if (this.stopped === "false")
            await this.getCheckoutSession()

        if (this.stopped === "false")
            await this.getShipping()

        if (this.stopped === "false")
            await this.getTaxes()

        if (this.stopped === "false" && this.mode === "Card")
            await this.submitOrder()

        else if (this.stopped === "false" && this.mode === "PayPal")
            await this.submitOrderPayPal()
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

function getKey(configDir) {
    var fs = require('fs');
    var path = require('path')
    var str = fs.readFileSync(path.join(configDir, '/userdata/key.txt'), 'utf8');
    return str;
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