module.exports = class SSENSEFastTask {
    constructor(taskInfo) {
        var tokens = [
            'AgAAAOfCXgb60x9RpAOjeZPWVXUEUNk0+me89vLfv5ZingpyOOkgXXXyjPzYTzWmWSu+BYqcD47byirLZ++3dJccpF99hWppT7G5xAuU+y56WpSYsAQ7elNwHWvTfPOaSlYwe/wKBuowlczrzNN3uwYUm2BAd8mEQjJGF4GunKGshNWXuepNWZPM5AkpEzzVMFcq4xYPvgcAAPJwU30HQR+/m4Znc+qGXHX5d4jgT6x0FM857uJkbIp39B3KXPs0scPXs6PrvNaUdA0Kpv3HivenARN/hYoHbpjxLnHL6aLINzTa9fJSv2lIcD/aCbDP0VYuMrvuCpFkgeBRuN4tmxjBQefJM3zm08g6raw3EBMNDVSriaKKiJbyghmNgsmqHL+jv9C4ZUckNnwf1QVyOWjQwUvLIIownz5gq8gu215GO2ShbaG4fwRRgf95dw/jxab8yNLeyj+hV2c/xFLoGCTc+1J39ZmfWopGmk4f4StmTe+R5TIVZYTG+QHEKsrj/JXjl2P9YA3hgnpsBAV5TiINcdVFq8fiNjMiHCp8yn8mMyhHCWldWxbP42ceOZD4lm5Bqs1WONvN5ellg2AgGLbB4XF3CdHfwRxCXrAJ4xvrcUX7HDHTHbkP8FOtLwsU9scapHezQtE5nDropYmEy3rTZSap1ZNmkbVqD7nsUCo7cgrDAd41+BFiI+4dWT5MWzB0Z/9JslzB2deAglJBuJwKkI3kQy8WV+6UeeQEUdhxTbE6GmCZqehh5WIQxUzRaS3Q9ZY5yLHXKuVbZRIP/qnDl1SR+VW/i86+7Mw9ctmXxDuNTd8w29Ar/X5tzZfCg2TwEuL7m8JqXrSs0NppLNq/NCvZzt2jmLqejsWxrYr39ZBinHY56kCBfGktS0DpTTr8DQTNvyColpNNg13AvVdJaYwkNsLR2pptW1NnVyXvV1rgMOKJxUXQozCSBpEA+kv1O4nW1qi5n+wxdqs2WAT8tz1uJdg2moMGDCHxE02klmGxs+QL40WG7JePf9M0DWWX2A/Ye93+h4ZRG6F8WIuFJaSuUx4X2CZ/DeMjRcggA5nuMkxLYANBhwXpTFdt/K6n/jidiOHkBr0CeKqm7dasFzVuNdQMZYGUQJdTZ27VI7QCeOZGsU0O5fXxSG/BP2zNA2j5z3XtcBJZkiC1SsKfCHLl68Z4DjZVxNy3SZX1PStvHM10tms2ZuzD0tYYS4x2J5eTW1s2W0QF+8nCWBNDhNsmZm+joid+4ObqBC/pnWNRaH5vQuI42gS6vz1V8YNYmj4fCil219djq/tEDVC3jRfKSB99qZj3M2U3nwkSUGtZLQLD5CaD2Q2veWqNR8w0C4zdkghyTRs7ggykI9JEqtCpH9beA4aD+NLQf9Apjr7d6E+wz7wCpAdl5nW0/A1h4H1DVlQebFuPlA9lIYD+rb+8/FR421FwEyDJs84wBpvddDF+EtT5Mun52zhLrRg8KOWRxsaMsbjMDmwxAfyH+b1W3jyLlOs2vikhCbJD3OT0spifHJ0ohNw2501Mr2VRFxSsqQaAzSFE+DFCNLaubbgQT7JRzkQjyL9ILCypAJ6NJYDYVKwARBWPhDARRq49ErzreHKVsjPfMT0LcbRvNfdahMjmmRVWFaSYHBfnqEwnJKgGwhQCkQH3lvKauSow+mbzB2IAxe4ZBszJS9G9Dq0JPhLta5AenPOeu0PStlmtExJzvpdmfm0LVmlxSifNVJx+XxqmJSXTuXckRFpGFBD4ZB6ZmGQiYnCuPlGp1ZWQ6iZvzQiQulnb9noSL2oc4HWRUkZvFc3S0FmcVEFunsjir7Hv+vEomKgbFkPe4ooa2pWqbC9idhTlB2nPKoq9HD88r9zJ3flAt/Epqwh0izire2U3+YdlurqVCaxQNjnBPVqKVaPdy1QfOmKaVVSPwhwvy5xpoG2Ayj3TQpJL2frf/vdTEWaiThtiAAKfPOJwI1IJQmO5Q5dGDbjBsRAKLV/vzkQzRRWQg4YEpWdUmufIxWfHWWWMSKcg35HCA0kiWQi+CePR3QRyrjq4/vVjV6dglQvy40oN7eJwtGptAetx9kqc7Tmk6dvKqzBtvB/6cAXcdB8IdYMNCG82C6BAnweMPkzHzw8J0CsDO6nVeqBjeaZ4k/yLbv0yh6a3Zjwn5hAW/I56Y5FJEvjzdSGmk4C2vcDBXkaWDH1pOT8E2W7O0Ux52gp7zVtaw3cZjIol6TQf+/I15C+IfkcK8wOo+Puz3lTBRZV6p9XX904fqKBqIASA6TRVx8KRIEvgfYE0106lXC3Z+Mq6f7kAVEmnDBRol7fT817K11skj0WatH+K2tycHY/4B5tmQflmpsX4fB942Bqa54ap2KeUhdJwC+WMT3hwgsfmBoWujPHYdbP4KQY8g+OywJi8RLqAemIJHyiRUzNXTV8LuWZ3zIoHy6xwMYQfKU0PKMzvJz4C6/sZiyMzvZCnAAysaU9JOtplkvG9mpi6LFfYNE5kW6nsDBUFTH/biz+Gep9D1J5Y0k+qUC0gwA4U/9BdoG1PgUOgiz/9gcGd0YocgGaHt6uuuqhRkhsgnFKb3gsiVDoIeijJWvArTiD3MEMe13hNqVzp2vNmCDCXZ0De0vpKCWMc8yLiQltiaJ2rrZwW1Qdr7TESJstevaZR4fep4yM7zEjUBhvXgHKPJNHt+o1dWpZk7QR5R/QpTTjfZYwcMjecOmyLfB/lwMlJBO6IDplrX6HKrwOrlAnOK+a5fyUCFOCKn/6GN+iOlr5j9q/CHcLs6i8sqZGXUtgZ84LIAEQll5DsrElXdmcBzbFD50sVSrbWVO/yMS/88RBb1Zo/8gcYQYeEPQ0y'
        ]
        this.authToken = tokens.sample()
        require('log-timestamp');
        require("../src/js/console-file.js");
        const { v4: uuidv4 } = require('uuid');
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
        this.cartToken;
        this.webhookLink = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/settings.json'), 'utf8'))[0].webhook;
        this.mode = taskInfo.mode;
        this.productTitle;
        this.sessionId = uuidv4()
        this.link = taskInfo.product;
        this.size = taskInfo.size;
        this.profilename = taskInfo.profile;
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        this.encryptedcard;
        const tough = require('tough-cookie');
        this.cookieJar = new tough.CookieJar();
        this.accounts = getAccountInfo(taskInfo.accounts)
        this.profile = getProfileInfo(taskInfo.profile);
        this.proxyArray = getProxyInfo(taskInfo.proxies);
        this.proxy = this.proxyArray.sample();
        this.oglink = this.link
        this.sku = this.link
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
                    "product": this.oglink,
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
                    "product": this.oglink,
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
                    "product": this.oglink,
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
                    console.log("Finished sending webhook")
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }


    async startCart() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        if (this.stopped === "false") {
            await this.send("Initializing cart...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    headers: {
                        'build': '1156',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'ssense/1.0.0 SSENSE',
                        'uuid': this.sessionId,
                        'version': '1.3.8',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'x-home-personalized-enabled': true,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                    },
                    json: {
                        "variables": {
                            "shippingTotal": 0,
                            "stateCode": "",
                            "coupon": null,
                            "countryCode": "US",
                            "customerId": null,
                            "addressId": null,
                            "languageCode": "en",
                            "token": null
                        },
                        "query": "query Cart($languageCode: String!, $countryCode: String!, $stateCode: String, $token: String, $customerId: Int, $addressId: Int, $shippingTotal: Float!, $coupon: String) {\n  getCart(addressId: $addressId, countryCode: $countryCode, customerId: $customerId, languageCode: $languageCode, shippingTotal: $shippingTotal, stateCode: $stateCode, token: $token, coupon: $coupon) {\n    __typename\n    userId\n    token\n    quantity\n    total\n    formatTotal\n    fullFormatTotal\n    totalDiscount\n    formatTotalDiscount\n    fullFormatTotalDiscount\n    totalSale\n    formatTotalSale\n    fullFormatTotalSale\n    currency\n    format\n    fullFormat\n    dateCreated\n    dateUpdated\n    truncatedItems\n    sanitizedItems\n    priceDisplayRule\n    discountPercentage\n    discountPercentageInteger\n    totalTax\n    formattedTotalTax\n    hasTaxes\n    isTaxesIncluded\n    isDutiesIncluded\n    finalTotal\n    formatFinalTotal\n    fullFormatFinalTotal\n    hasAdditionalChargesNotice\n    items {\n      __typename\n      id\n      name\n      gender\n      code\n      brand {\n        __typename\n        id\n        name\n      }\n      category {\n        __typename\n        id\n        name\n      }\n      images\n      price {\n        __typename\n        sale\n        regular\n        formatSale\n        fullFormatSale\n        formatRegular\n        fullFormatRegular\n      }\n      discountPercentage\n      discountPercentageInteger\n      isSale\n      isPrivateSale\n      isFinalSale\n      isNotAvailable\n      size {\n        __typename\n        sequence\n        sku\n        stock\n        isLowStock\n        isOutOfStock\n        displaySizeName\n      }\n      discountedBy\n    }\n    coupon {\n      __typename\n      couponCode\n      validated\n      message\n    }\n    importantNotice {\n      __typename\n      message\n      link {\n        __typename\n        text\n        url\n      }\n    }\n  }\n}"
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
                if (this.stopped === "false") {
                    if (typeof response.body.data.getCart != 'undefined' && response.body.data.getCart != null) {
                        this.cartToken = response.body.data.getCart.token;
                        await this.send("Cart initialized")
                        return;
                    } else
                        throw "Error getting cart"
                }


            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error getting cart: " + error.response.status)
                    await sleep(3500)
                    await this.startCart()
                } else if (error === "Error logging in" && this.stopped === "false") {
                    await this.send("Error getting cart")
                    await sleep(3500)
                    await this.startCart()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.startCart()
                }
            }
        }
    }

    async login() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        if (this.stopped === "false") {
            await this.send("Logging in")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    headers: {
                        'build': '1272',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'SSENSE/1272 CFNetwork/1206 Darwin/20.1.0',
                        'uuid': this.sessionId,
                        'version': '1.3.13',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'x-home-personalized-enabled': true,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "query": "mutation Login($email: String!, $password: String!) {\n  doLogin(email: $email, password: $password) {\n    __typename\n    customerId\n    email\n    expireAt\n    token\n   }\n}",
                        "variables": {
                            "email": this.accounts.email,
                            "password": this.accounts.password
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
                if (this.stopped === "false") {
                    if (response.body.data.doLogin != null) {
                        this.customerId = response.body.data.doLogin.customerId
                        this.loginToken = response.body.data.doLogin.token
                        await this.send("Logged in")
                        return;
                    } else
                        throw "Error logging in"
                }


            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error logging in: " + error.response.status)
                    await sleep(3500)
                    await this.login()
                } else if (error === "Error logging in" && this.stopped === "false") {
                    await this.send("Error logging in")
                    await sleep(3500)
                    await this.login()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.login()
                }
            }
        }
    }


    async getSKU() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');
        console.log(this.link)
        if (this.stopped === "false") {
            await this.send("Getting product info")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    withCredentials: true,
                    jar: this.cookieJar,
                    timeout: 6000,
                    headers: {
                        'build': '1156',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'ssense/1.0.0 SSENSE',
                        'uuid': this.sessionId,
                        'version': '1.3.8',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'x-home-personalized-enabled': true,
                        'token': this.loginToken,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "query": "query ProductDetail($productId: Int!, $languageCode: String!, $countryCode: String!) {\n  getProductDetail(productId: $productId, languageCode: $languageCode, countryCode: $countryCode) {\n    __typename\n    id\n    name\n    description\n    season\n    gender\n    code\n    countryOfOrigin\n    composition\n    showShippingDutiesMessage\n    shippingDutiesMessage\n    sizes {\n      __typename\n      sequence\n      sku\n      stock\n      isLowStock\n      isOutOfStock\n      displaySizeName\n    }\n    brand {\n      __typename\n      id\n      name\n      seoKeyword {\n        __typename\n        en\n        fr\n      }\n    }\n    category {\n      __typename\n      id\n      name\n      seoKeyword {\n        __typename\n        en\n        fr\n      }\n    }\n    images\n    price {\n      __typename\n      sale\n      regular\n      formatSale\n      fullFormatSale\n      formatRegular\n      fullFormatRegular\n    }\n    discountPercentage\n    discountPercentageInteger\n    isSale\n    isPrivateSale\n    isFinalSale\n    isNotAvailable\n    websiteUrl\n  }\n}",
                        "variables": {
                            "countryCode": "US",
                            "languageCode": "en",
                            "productId": this.link
                        }
                    }
                })
                console.log(response.body.data.getProductDetail)
                if (this.stopped === "false") {
                    if (typeof response.body.data.getProductDetail != 'undefined' && response.body.data.getProductDetail != null && response.body.data.getProductDetail.sizes.length > 0) {
                        this.productTitle = response.body.data.getProductDetail.name
                        if (this.size === "Random") {
                            var temp = response.body.data.getProductDetail.sizes.sample()
                            if (temp.stock > 0 && response.body.data.getProductDetail.isNotAvailable == false) {
                                this.sku = temp.sku;
                                await this.send("Got SKU")
                                return;
                            } else throw 'Monitoring'
                        } else {
                            for (var i = 0; i < response.body.data.getProductDetail.sizes.length; i++) {
                                if (response.body.data.getProductDetail.sizes[i].displaySizeName.trim() === this.size) {
                                    var temp = response.body.data.getProductDetail.sizes[i]
                                    if (temp.stock > 0 && response.body.data.getProductDetail.isNotAvailable == false) {
                                        this.sku = temp.sku;
                                        await this.send("Got SKU")
                                        return;
                                    } else throw 'Monitoring'
                                }
                            }
                            throw "Sizes not available"
                        }
                    } else throw "Sizes not available"
                }


            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error getting SKU: " + error.response.status)
                    await sleep(3500)
                    await this.getSKU()
                } else if (error === "Monitoring" && this.stopped === "false") {
                    await this.send("Monitoring")
                    await sleep(3500)
                    await this.getSKU()
                } else if (error === "Sizes not available" && this.stopped === "false") {
                    await this.send("Error getting size")
                    await sleep(3500)
                    await this.getSKU()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.getSKU()
                }
            }
        }
    }

    async addToCart() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        console.log(this.sku)
        console.log(this.cartToken)
        if (this.stopped === "false") {
            await this.send("Adding to cart")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    headers: {
                        'build': '1272',
                        'Content-Type': 'application/json',
                        'reqid': uuidv4(),
                        'User-Agent': 'SSENSE/1272 CFNetwork/1206 Darwin/20.1.0',
                        'uuid': this.sessionId,
                        'version': '1.3.13',
                        'x-brand-gender-category': 'false',
                        'x-home-personalized-enabled': true,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                    },
                    json: {
                        "query": "mutation AddItemsToCartV2($token: String!, $skus: [String]!, $languageCode: String!, $countryCode: String!, $customerId: Int, $shippingTotal: Float!, $stateCode: String, $addressId: Int) {\n  addItemsToCartV2(token: $token, skus: $skus, languageCode: $languageCode, countryCode: $countryCode, customerId: $customerId, shippingTotal: $shippingTotal, stateCode: $stateCode, addressId: $addressId) {\n    __typename\n    userId\n    token\n    quantity\n    total\n    formatTotal\n    fullFormatTotal\n    totalDiscount\n    formatTotalDiscount\n    fullFormatTotalDiscount\n    totalSale\n    formatTotalSale\n    fullFormatTotalSale\n    currency\n    format\n    fullFormat\n    dateCreated\n    dateUpdated\n    truncatedItems\n    sanitizedItems\n    priceDisplayRule\n    discountPercentage\n    discountPercentageInteger\n    totalTax\n    formattedTotalTax\n    hasTaxes\n    isTaxesIncluded\n    isDutiesIncluded\n    finalTotal\n    formatFinalTotal\n    fullFormatFinalTotal\n    hasAdditionalChargesNotice\n    items {\n      __typename\n      id\n      name\n      gender\n      code\n      brand {\n        __typename\n        id\n        name\n      }\n      category {\n        __typename\n        id\n        name\n      }\n      images\n      price {\n        __typename\n        sale\n        regular\n        formatSale\n        fullFormatSale\n        formatRegular\n        fullFormatRegular\n      }\n      discountPercentage\n      discountPercentageInteger\n      isSale\n      isPrivateSale\n      isFinalSale\n      isNotAvailable\n      size {\n        __typename\n        sequence\n        sku\n        stock\n        isLowStock\n        isOutOfStock\n        displaySizeName\n      }\n    }\n  }\n}",
                        "variables": {
                            "addressId": null,
                            "languageCode": "en",
                            "countryCode": "US",
                            "customerId": null,
                            "shippingTotal": 0,
                            "token": this.cartToken,
                            "stateCode": "VA",
                            "skus": [
                                this.link
                            ]
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
                console.log(response.body.data)
                if (this.stopped === "false") {
                    if (typeof response.body.data.addItemsToCartV2 != 'undefined' && response.body.data.addItemsToCartV2 != null) {
                        this.cartTotal = response.body.data.addItemsToCartV2.total;
                        await this.send("Carted")
                        await this.updateStat("carts")
                        return;
                    } else throw "Error carting"
                }


            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error logging in: " + error.response.status)
                    await sleep(3500)
                    await this.addToCart()
                } else if (error === "Error carting" && this.stopped === "false") {
                    await this.send("Error carting, retrying")
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

    async submitOrderPayPal() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');
        const publicIp = require('public-ip');

        if (this.stopped === "false") {
            await this.send("Submitting order")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    withCredentials: true,
                    jar: this.cookieJar,
                    timeout: 6000,
                    headers: {
                        'build': '1156',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'ssense/1.0.0 SSENSE',
                        'uuid': this.sessionId,
                        'version': '1.3.8',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'token': this.loginToken,
                        'x-home-personalized-enabled': true,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "query": "mutation authorizePayPal($orderInput: OrderInput!) {\n  authorizePaypal(orderCreateRequestParam: $orderInput) {\n    __typename\n    ppxToken\n    redirectUrl\n  }\n}",
                        "variables": {
                            "orderInput": {
                                "cartToken": this.cartToken,
                                "shippingAddress": {
                                    "id": this.customerId,
                                    "postCode": this.profile.zipcode,
                                    "defaultShipping": false,
                                    "firstName": this.profile.firstName,
                                    "phone": this.profile.phone,
                                    "lastName": this.profile.lastName,
                                    "defaultBilling": false,
                                    "address1": this.profile.address1,
                                    "countryCode": "US",
                                    "stateCode": abbrRegion(this.profile.state, 'abbr'),
                                    "address2": "",
                                    "address3": "",
                                    "city": this.profile.city
                                },
                                "paymentMethod": "paypal",
                                "total": this.cartTotal,
                                "languageCode": "en",
                                "affiliate": null,
                                "coupon": null,
                                "customerId": this.customerId,
                                "ip": await publicIp.v4(),
                                "items": [
                                    this.sku
                                ],
                                "sessionId": this.sessionId,
                                "shippingMethodKeyName": "express"
                            }
                        }
                    }
                })
                console.log(response.body)
                if (this.stopped === "false") {
                    if (typeof response.body.data.authorizePaypal != 'undefined' && response.body.data.authorizePaypal != null) {
                        this.checkoutURL = response.body.data.authorizePaypal.redirectUrl
                        await this.updateStat("checkouts")
                        await this.send("Check email")
                        await this.sendSuccessPayPal()
                    } else throw "Checkout failed"
                }



            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error submitting order: " + error.response.status)
                    await sleep(3500)
                    await this.submitOrderPayPal()
                } else if (error === "Checkout failed" && this.stopped === "false") {
                    console.log(this.cookieJar)
                    await this.send("Checkout failed")
                    await this.updateStat("fails")
                    await this.sendFail()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.submitOrderPayPal()
                }
            }
        }
    }

    async submitOrderProxy() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');
        const publicIp = require('public-ip');
        this.encryptedcard = this.profile.cardNumber.substring(0, 6) + "000000" + this.profile.cardNumber.substring(12)

        if (this.stopped === "false") {
            await this.send("Submitting order")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    withCredentials: true,
                    jar: this.cookieJar,
                    proxy: this.proxy,
                    timeout: 6000,
                    headers: {
                        'build': '1156',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'ssense/1.0.0 SSENSE',
                        'uuid': this.sessionId,
                        'version': '1.3.8',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'token': this.loginToken,
                        'x-home-personalized-enabled': true,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "query": "mutation CreateOrder($orderInput: OrderInput!) {\n  createOrder(orderCreateRequestParam: $orderInput) {\n    __typename\n    status\n    orderDetails {\n      __typename\n      billingAddress {\n        __typename\n        address\n        city\n        company\n        countryCode\n        countryName\n        firstName\n        id\n        lastName\n        phone\n        postCode\n        stateCode\n      }\n      customerId\n      id\n      invoiceId\n      isReturnable\n      isOnHoldAllowed\n      isStoreOrder\n      items {\n        __typename\n        brand\n        displayPrice\n        formattedPrice\n        fullPrice\n        id\n        imageUrl\n        isDiscounted\n        isFinalSale\n        itemId\n        name\n        size\n        sku\n      }\n      orderDate\n      shortFormattedOrderDate\n      longFormattedOrderDate\n      payment {\n        __typename\n        areDutiesAndTaxesIncluded\n        areDutiesIncluded\n        currency\n        methodName\n        network\n        lastFourDigits\n        taxes {\n          __typename\n          gst {\n            __typename\n            amount\n            rate\n          }\n          hst {\n            __typename\n            amount\n            rate\n          }\n          pst {\n            __typename\n            amount\n            rate\n          }\n          taxes {\n            __typename\n            amount\n            rate\n          }\n        }\n        totals {\n          __typename\n          shippingFormatted\n          subtotalFormatted\n          totalFormatted\n        }\n      }\n      shipment {\n        __typename\n        carrierName\n        categoryText\n        trackingUrl\n      }\n      shippingAddress {\n        __typename\n        address\n        city\n        company\n        countryCode\n        countryName\n        firstName\n        id\n        lastName\n        phone\n        postCode\n        stateCode\n      }\n      status\n      totalFormatted\n    }\n  }\n}",
                        "variables": {
                            "orderInput": {
                                "cartToken": this.cartToken,
                                "shippingAddress": {
                                    "id": this.customerId,
                                    "defaultBilling": false,
                                    "lastName": this.profile.lastName,
                                    "firstName": this.profile.firstName,
                                    "address1": this.profile.address1,
                                    "postCode": this.profile.zipcode,
                                    "phone": this.profile.phone,
                                    "defaultShipping": false,
                                    "countryCode": "US",
                                    "stateCode": abbrRegion(this.profile.state, 'abbr'),
                                    "address2": "",
                                    "address3": "",
                                    "city": this.profile.city
                                },
                                "paymentMethod": "credit",
                                "total": this.cartTotal,
                                "languageCode": "en",
                                "affiliate": null,
                                "coupon": null,
                                "customerId": this.customerId,
                                "token": '{\"cardHolderName\":\"' + this.profile.firstName + ' ' + this.profile.lastName + '\",\"securityCode\":\"100\",\"expiryMonth\":\"' + this.profile.expiryMonth + '\",\"expiryYear\":\"' + this.profile.expiryYear + '\",\"cardNumber\":\"' + this.encryptedcard + '\"}',
                                "ip": await publicIp.v4(),
                                "billingAddress": {
                                    "id": this.customerId,
                                    "postCode": this.profile.zipcode,
                                    "defaultBilling": false,
                                    "address1": this.profile.address1,
                                    "defaultShipping": false,
                                    "phone": this.profile.phone,
                                    "firstName": this.profile.firstName,
                                    "address2": "",
                                    "countryCode": "US",
                                    "stateCode": abbrRegion(this.profile.state, 'abbr'),
                                    "lastName": this.profile.lastName,
                                    "address3": "",
                                    "city": this.profile.city
                                },
                                "items": [
                                    this.sku
                                ],
                                "sessionId": uuidv4(),
                                "shippingMethodKeyName": "express"
                            }
                        }
                    }
                })
                console.log(response.body)
                if (this.stopped === "false") {
                    if (typeof response.body.data.createOrder != 'undefined' && response.body.data.createOrder != null) {
                        await this.updateStat("checkouts")
                        await this.send("Check email")
                        await this.sendSuccess()
                    } else throw "Checkout failed"
                }



            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error submitting order: " + error.response.status)
                    await sleep(3500)
                    await this.submitOrderProxy()
                } else if (error === "Checkout failed" && this.stopped === "false") {
                    console.log(this.cookieJar)
                    await this.send("Checkout failed")
                    await this.updateStat("fails")
                    await this.sendFail()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.submitOrderProxy()
                }
            }
        }
    }

    async submitOrder() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');
        const publicIp = require('public-ip');
        this.encryptedcard = this.profile.cardNumber.substring(0, 6) + "000000" + this.profile.cardNumber.substring(12)

        if (this.stopped === "false") {
            await this.send("Submitting order")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    withCredentials: true,
                    jar: this.cookieJar,
                    timeout: 6000,
                    headers: {
                        'build': '1156',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'ssense/1.0.0 SSENSE',
                        'uuid': this.sessionId,
                        'version': '1.3.8',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'token': this.loginToken,
                        'x-home-personalized-enabled': true,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "query": "mutation CreateOrder($orderInput: OrderInput!) {\n  createOrder(orderCreateRequestParam: $orderInput) {\n    __typename\n    status\n    orderDetails {\n      __typename\n      billingAddress {\n        __typename\n        address\n        city\n        company\n        countryCode\n        countryName\n        firstName\n        id\n        lastName\n        phone\n        postCode\n        stateCode\n      }\n      customerId\n      id\n      invoiceId\n      isReturnable\n      isOnHoldAllowed\n      isStoreOrder\n      items {\n        __typename\n        brand\n        displayPrice\n        formattedPrice\n        fullPrice\n        id\n        imageUrl\n        isDiscounted\n        isFinalSale\n        itemId\n        name\n        size\n        sku\n      }\n      orderDate\n      shortFormattedOrderDate\n      longFormattedOrderDate\n      payment {\n        __typename\n        areDutiesAndTaxesIncluded\n        areDutiesIncluded\n        currency\n        methodName\n        network\n        lastFourDigits\n        taxes {\n          __typename\n          gst {\n            __typename\n            amount\n            rate\n          }\n          hst {\n            __typename\n            amount\n            rate\n          }\n          pst {\n            __typename\n            amount\n            rate\n          }\n          taxes {\n            __typename\n            amount\n            rate\n          }\n        }\n        totals {\n          __typename\n          shippingFormatted\n          subtotalFormatted\n          totalFormatted\n        }\n      }\n      shipment {\n        __typename\n        carrierName\n        categoryText\n        trackingUrl\n      }\n      shippingAddress {\n        __typename\n        address\n        city\n        company\n        countryCode\n        countryName\n        firstName\n        id\n        lastName\n        phone\n        postCode\n        stateCode\n      }\n      status\n      totalFormatted\n    }\n  }\n}",
                        "variables": {
                            "orderInput": {
                                "cartToken": this.cartToken,
                                "shippingAddress": {
                                    "id": this.customerId,
                                    "defaultBilling": false,
                                    "lastName": this.profile.lastName,
                                    "firstName": this.profile.firstName,
                                    "address1": this.profile.address1,
                                    "postCode": this.profile.zipcode,
                                    "phone": this.profile.phone,
                                    "defaultShipping": false,
                                    "countryCode": "US",
                                    "stateCode": abbrRegion(this.profile.state, 'abbr'),
                                    "address2": "",
                                    "address3": "",
                                    "city": this.profile.city
                                },
                                "paymentMethod": "credit",
                                "total": this.cartTotal,
                                "languageCode": "en",
                                "affiliate": null,
                                "coupon": null,
                                "customerId": this.customerId,
                                "token": '{\"cardHolderName\":\"' + this.profile.firstName + ' ' + this.profile.lastName + '\",\"securityCode\":\"100\",\"expiryMonth\":\"' + this.profile.expiryMonth + '\",\"expiryYear\":\"' + this.profile.expiryYear + '\",\"cardNumber\":\"' + this.encryptedcard + '\"}',
                                "ip": await publicIp.v4(),
                                "billingAddress": {
                                    "id": this.customerId,
                                    "postCode": this.profile.zipcode,
                                    "defaultBilling": false,
                                    "address1": this.profile.address1,
                                    "defaultShipping": false,
                                    "phone": this.profile.phone,
                                    "firstName": this.profile.firstName,
                                    "address2": "",
                                    "countryCode": "US",
                                    "stateCode": abbrRegion(this.profile.state, 'abbr'),
                                    "lastName": this.profile.lastName,
                                    "address3": "",
                                    "city": this.profile.city
                                },
                                "items": [
                                    this.sku
                                ],
                                "sessionId": uuidv4(),
                                "shippingMethodKeyName": "express"
                            }
                        }
                    }
                })
                console.log(response.body)
                if (this.stopped === "false") {
                    if (typeof response.body.data.createOrder != 'undefined' && response.body.data.createOrder != null) {
                        await this.updateStat("checkouts")
                        await this.send("Check email")
                        await this.sendSuccess()
                    } else throw "Checkout failed"
                }



            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error submitting order: " + error.response.status)
                    await sleep(3500)
                    await this.submitOrder()
                } else if (error === "Checkout failed" && this.stopped === "false") {
                    console.log(this.cookieJar)
                    await this.send("Checkout failed")
                    await this.updateStat("fails")
                    await this.sendFail()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.submitOrder()
                }
            }
        }
    }

    async startCartProxy() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');

        if (this.stopped === "false") {
            await this.send("Initializing cart")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    withCredentials: true,
                    jar: this.cookieJar,
                    timeout: 6000,
                    proxy: this.proxy,
                    headers: {
                        'build': '1272',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'SSENSE/1272 CFNetwork/1206 Darwin/20.1.0',
                        'uuid': this.sessionId,
                        'version': '1.3.13',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'x-home-personalized-enabled': true,
                        'token': this.loginToken,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "variables": {
                            "shippingTotal": 0,
                            "stateCode": "",
                            "coupon": null,
                            "countryCode": "US",
                            "customerId": null,
                            "addressId": null,
                            "languageCode": "en",
                            "token": null
                        },
                        "query": "query Cart($languageCode: String!, $countryCode: String!, $stateCode: String, $token: String, $customerId: Int, $addressId: Int, $shippingTotal: Float!, $coupon: String) {\n  getCart(addressId: $addressId, countryCode: $countryCode, customerId: $customerId, languageCode: $languageCode, shippingTotal: $shippingTotal, stateCode: $stateCode, token: $token, coupon: $coupon) {\n    __typename\n    userId\n    token\n    quantity\n    total\n    formatTotal\n    fullFormatTotal\n    totalDiscount\n    formatTotalDiscount\n    fullFormatTotalDiscount\n    totalSale\n    formatTotalSale\n    fullFormatTotalSale\n    currency\n    format\n    fullFormat\n    dateCreated\n    dateUpdated\n    truncatedItems\n    sanitizedItems\n    priceDisplayRule\n    discountPercentage\n    discountPercentageInteger\n    totalTax\n    formattedTotalTax\n    hasTaxes\n    isTaxesIncluded\n    isDutiesIncluded\n    finalTotal\n    formatFinalTotal\n    fullFormatFinalTotal\n    hasAdditionalChargesNotice\n    items {\n      __typename\n      id\n      name\n      gender\n      code\n      brand {\n        __typename\n        id\n        name\n      }\n      category {\n        __typename\n        id\n        name\n      }\n      images\n      price {\n        __typename\n        sale\n        regular\n        formatSale\n        fullFormatSale\n        formatRegular\n        fullFormatRegular\n      }\n      discountPercentage\n      discountPercentageInteger\n      isSale\n      isPrivateSale\n      isFinalSale\n      isNotAvailable\n      size {\n        __typename\n        sequence\n        sku\n        stock\n        isLowStock\n        isOutOfStock\n        displaySizeName\n      }\n      discountedBy\n    }\n    coupon {\n      __typename\n      couponCode\n      validated\n      message\n    }\n    importantNotice {\n      __typename\n      message\n      link {\n        __typename\n        text\n        url\n      }\n    }\n  }\n}"
                    }
                })
                console.log(response.body)
                if (this.stopped === "false") {
                    if (typeof response.body.data.getCart != 'undefined' && response.body.data.getCart != null) {
                        this.cartToken = response.body.data.getCart.token;
                        await this.send("Cart initialized")
                        return;
                    } else
                        throw "Error getting cart"
                }


            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error getting cart: " + error.response.status)
                    await sleep(3500)
                    await this.startCart()
                } else if (error === "Error logging in" && this.stopped === "false") {
                    await this.send("Error getting cart")
                    await sleep(3500)
                    await this.startCart()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.startCart()
                }
            }
        }
    }

    async loginProxy() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');

        if (this.stopped === "false") {
            await this.send("Logging in")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    withCredentials: true,
                    jar: this.cookieJar,
                    timeout: 6000,
                    proxy: this.proxy,
                    headers: {
                        'build': '1156',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'ssense/1.0.0 SSENSE',
                        'uuid': this.sessionId,
                        'version': '1.3.8',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'x-home-personalized-enabled': true,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "query": "mutation Login($email: String!, $password: String!) {\n  doLogin(email: $email, password: $password) {\n    __typename\n    customerId\n    email\n    expireAt\n    token\n   }\n}",
                        "variables": {
                            "email": this.account.email,
                            "password": this.account.password
                        }
                    }
                })
                console.log(response.body)
                if (this.stopped === "false") {
                    if (response.body.data.doLogin != null) {
                        this.customerId = response.body.data.doLogin.customerId
                        this.loginToken = response.body.data.doLogin.token
                        await this.send("Logged in")
                        return;
                    } else
                        throw "Error logging in"
                }


            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error logging in: " + error.response.status)
                    await sleep(3500)
                    await this.login()
                } else if (error === "Error logging in" && this.stopped === "false") {
                    await this.send("Error logging in")
                    await sleep(3500)
                    await this.login()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.login()
                }
            }
        }
    }


    async getSKUProxy() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');
        console.log(this.link)
        if (this.stopped === "false") {
            await this.send("Getting product info")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    withCredentials: true,
                    jar: this.cookieJar,
                    timeout: 6000,
                    proxy: this.proxy,
                    headers: {
                        'build': '1156',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'ssense/1.0.0 SSENSE',
                        'uuid': this.sessionId,
                        'version': '1.3.8',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'x-home-personalized-enabled': true,
                        'token': this.loginToken,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "query": "query ProductDetail($productId: Int!, $languageCode: String!, $countryCode: String!) {\n  getProductDetail(productId: $productId, languageCode: $languageCode, countryCode: $countryCode) {\n    __typename\n    id\n    name\n    description\n    season\n    gender\n    code\n    countryOfOrigin\n    composition\n    showShippingDutiesMessage\n    shippingDutiesMessage\n    sizes {\n      __typename\n      sequence\n      sku\n      stock\n      isLowStock\n      isOutOfStock\n      displaySizeName\n    }\n    brand {\n      __typename\n      id\n      name\n      seoKeyword {\n        __typename\n        en\n        fr\n      }\n    }\n    category {\n      __typename\n      id\n      name\n      seoKeyword {\n        __typename\n        en\n        fr\n      }\n    }\n    images\n    price {\n      __typename\n      sale\n      regular\n      formatSale\n      fullFormatSale\n      formatRegular\n      fullFormatRegular\n    }\n    discountPercentage\n    discountPercentageInteger\n    isSale\n    isPrivateSale\n    isFinalSale\n    isNotAvailable\n    websiteUrl\n  }\n}",
                        "variables": {
                            "countryCode": "US",
                            "languageCode": "en",
                            "productId": this.link
                        }
                    }
                })
                console.log(response.body.data.getProductDetail)
                if (this.stopped === "false") {
                    if (typeof response.body.data.getProductDetail != 'undefined' && response.body.data.getProductDetail != null && response.body.data.getProductDetail.sizes.length > 0) {
                        this.productTitle = response.body.data.getProductDetail.name
                        if (this.size === "Random") {
                            var temp = response.body.data.getProductDetail.sizes.sample()
                            if (temp.stock > 0 && response.body.data.getProductDetail.isNotAvailable == false) {
                                this.sku = temp.sku;
                                await this.send("Got SKU")
                                return;
                            } else throw 'Monitoring'
                        } else {
                            for (var i = 0; i < response.body.data.getProductDetail.sizes.length; i++) {
                                if (response.body.data.getProductDetail.sizes[i].displaySizeName.trim() === this.size) {
                                    var temp = response.body.data.getProductDetail.sizes[i]
                                    if (temp.stock > 0 && response.body.data.getProductDetail.isNotAvailable == false) {
                                        this.sku = temp.sku;
                                        await this.send("Got SKU")
                                        return;
                                    } else throw 'Monitoring'
                                }
                            }
                            throw "Sizes not available"
                        }
                    } else throw "Sizes not available"
                }


            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error getting SKU: " + error.response.status)
                    await sleep(3500)
                    await this.getSKU()
                } else if (error === "Monitoring" && this.stopped === "false") {
                    await this.send("Monitoring")
                    await sleep(3500)
                    await this.getSKU()
                } else if (error === "Sizes not available" && this.stopped === "false") {
                    await this.send("Error getting size")
                    await sleep(3500)
                    await this.getSKU()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.getSKU()
                }
            }
        }
    }

    async submitOrderPayPalProxy() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');
        const publicIp = require('public-ip');

        if (this.stopped === "false") {
            await this.send("Submitting order")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://mobile.ssense.com/',
                    withCredentials: true,
                    jar: this.cookieJar,
                    proxy: this.proxy,
                    timeout: 6000,
                    headers: {
                        'build': '1156',
                        'Content-Type': 'application/json',
                        'reqId': uuidv4(),
                        'User-Agent': 'ssense/1.0.0 SSENSE',
                        'uuid': this.sessionId,
                        'version': '1.3.8',
                        'x-brand-gender-category': 'false',
                        'x-get-products-version': 'v2',
                        'token': this.loginToken,
                        'x-home-personalized-enabled': true,
                        'x-markdown-ab': 'markdown_v2_0-desc',
                        'x-se-auth': this.authToken
                    },
                    json: {
                        "query": "mutation authorizePayPal($orderInput: OrderInput!) {\n  authorizePaypal(orderCreateRequestParam: $orderInput) {\n    __typename\n    ppxToken\n    redirectUrl\n  }\n}",
                        "variables": {
                            "orderInput": {
                                "cartToken": this.cartToken,
                                "shippingAddress": {
                                    "id": this.customerId,
                                    "postCode": this.profile.zipcode,
                                    "defaultShipping": false,
                                    "firstName": this.profile.firstName,
                                    "phone": this.profile.phone,
                                    "lastName": this.profile.lastName,
                                    "defaultBilling": false,
                                    "address1": this.profile.address1,
                                    "countryCode": "US",
                                    "stateCode": abbrRegion(this.profile.state, 'abbr'),
                                    "address2": "",
                                    "address3": "",
                                    "city": this.profile.city
                                },
                                "paymentMethod": "paypal",
                                "total": this.cartTotal,
                                "languageCode": "en",
                                "affiliate": null,
                                "coupon": null,
                                "customerId": this.customerId,
                                "ip": await publicIp.v4(),
                                "items": [
                                    this.sku
                                ],
                                "sessionId": this.sessionId,
                                "shippingMethodKeyName": "express"
                            }
                        }
                    }
                })
                console.log(response.body)
                if (this.stopped === "false") {
                    if (typeof response.body.data.authorizePaypal != 'undefined' && response.body.data.authorizePaypal != null) {
                        this.checkoutURL = response.body.data.authorizePaypal.redirectUrl
                        await this.updateStat("checkouts")
                        await this.send("Check email")
                        await this.sendSuccessPayPal()
                    } else throw "Checkout failed"
                }



            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error submitting order: " + error.response.status)
                    await sleep(3500)
                    await this.submitOrderPayPalProxy()
                } else if (error === "Checkout failed" && this.stopped === "false") {
                    console.log(this.cookieJar)
                    await this.send("Checkout failed")
                    await this.updateStat("fails")
                    await this.sendFail()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.submitOrderPayPalProxy()
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
        if (this.stopped === "false")
            await this.login()

        if (this.stopped === "false")
            await this.startCart()

        // if (this.stopped === "false" && typeof this.sku === 'undefined')
        //   await this.getSKU()

        if (this.stopped === "false")
            await this.addToCart()

        if (this.stopped === "false" && this.mode === "PayPal")
            await this.submitOrderPayPal()

        if (this.stopped === "false" && this.mode === "Card")
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