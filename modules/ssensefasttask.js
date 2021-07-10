module.exports = class SSENSEFastTask {
    constructor(taskInfo) {
        var tokens = [
            'AgAAAHygUUHijToB4bOeNzm/+WwEUNk0+me89vLfv5ZingpyOOkgXXXyjPzYTzWmWSu+BYqcD47byirLZ++3dJccpF99hWppT7G5xAuU+y56WpSYsAQoYsEB5AYRZFCcAkhU/+l/b9S+qP40HijD0em7uwssjXgSs4E8YQWCY4LpR74lv/EzKOIKNmzD4oOFVfLsK1X5vgcAALGs7oP9Rx4XWbP/bSnf6Din/zHy0OQpAYuM94yYxan7/yEylCJE2ICqW7d6OsxslWgFEbHgA6mZAGHuI5PARM7FzhIrugm+UlPg36aTnPZpHyNx5yRHx+3GwRa9SCWZTROjlr38XSQVFkzdlymd0lNXV8rxM0/Q73RL9nNkH+OtmqUxrVm5T9vdeozJwyEmUI3Q4R5kdCg5ZWJI3CjVvzonfLgTwOGiYF6TtBkVL4FFKE1NX89FM3GUFap1OLae1USzeSBsuUlHuBZbDeeMW6/Q15JAkeYA/xDL3lX7DCFYIiSaAVI17yYNJgSpZY6XkmUyew0uA0FMm5CVgPk1fMhY0xwZK0f2SOTGswCk4kBiE/VeyD5oycxuQv6o9CHW9Pjm0T/Ucun3ltSOzmyHfJuXhjZKYx9nE61tvTRCen8Ox6sgc/Y56/P0/WoD4vf6hSltfGy0RZxsOZAwBMLRPhy00kETN0EBrQVSpH/WvVb7uHvM6DXh3LpIRQpfByDyBBGYq8y63rrjM8N2lOouiBziFUaiieF7r+nU4zb50KkQFPdzewWvrj0Rnwh4w4bi5Vdl+w2shea+44NBNNtUbD3bZcy0foWNdLjkC2orKXovRETYDOdPqAw7HUqX3KQVN//AAb1OWDwspgrXEM3LylEe7BF7nJDFV/U4UApJLtDx90rph9HsNHRtx/bs3i0uGAv3qNZokDR/g8zHnDY3mJlScWXIjgTRLcxK0Kwtov9PVLe6/ROKK8TiR5MVVqPtYTPxU50kxd9gDYFHNpbUeZi4xnO0GwOrSU3SOdtrbqqPLaFqCYi4I7Pag5s+TOoVxJWwcLzYDlZxOVlVX3Y5YVBYbU5j2r8+/RRCEoDnOdqgvXn4YBoFwjknCTfVolhhqgkSV2SXaRuEeloXpIGlyoMAKtXtnkOovEeyAeOiG5rwIMvCuTIJStLeuHSlrjXACuu5KxquQ5yxw2Kd0L28YMs2RPoQVXOtZ3X9dgdHmKjbp9mePUoDojUt2P5hoRpVfHoGE/YOfoAdukhj8kXU8U/wjjtNytJt5N5s0ajAXbDPtMOh/ezi9qkXA+FxGmYzQ8Sku3l6TwVSLfgwCgqoJ6jyoY14UR8Cy+NpMBDKCCEYh2MVeK6vSvPb6b7bvvB8YUCiSsl8noaH9m8KljGBiFM24Viwh3B89C9MClWKnZXJIxWVjujXOyEqcSEkXFHA60aNn/zcha3ZtYa6FQEFNEWz2JFD/GcnlLilchQ6XcncYLi7QAwa3mJp1RRUkpEE3GIkyxE9FdpRo7s/GFY5IX/4j4NAx4pRwlTyszAiyDRsMBaUZbQzYvyqpzX0WQtFsuXmv0NZwpQu4NFSjgLEObhjceTDCxzQ4/3uN6wOtMZZT6MJ7WQOvvy10E1218jLPMhHVHs55ytpqBY1gvWDCi17tJrwf+Z4hegXJ/UBtiq0amsYR3AQy68s4axCGwcyu9hD2f0amdt+XyFceS9BQ0ZCuT08r1H8u7sO6hojL8ES5DgLDQcEIgVX4NP9mFuuY9hehxJ3O5goz8bvbmPrjv3Xq26P2qHEPpLk6YSyQX7/a0Hg8T6seSWlGR2mOBTfxmA0nTJGReTfeMwELzAQD+c0veNnVGCP/3S7H6V9OUNx/Xn+nceWRUr9r6L5AE6D8+SB3IL2xcI+q0DzjHV1iVivMAmqX5QhTm8WSMLxylB9BG5zwFRkc5GwaUaTQHXfFgSNP8wTo/wqaY828h3zjafIa6skrct1ectM2tV28kNS+iglvuCuzLM+JbhgVhiZkj34OPQdjiO90zMkL22RrG18Q7Z5qAIhqaczSwNlGWbIWqhOkoBxgosyzCLN84dNuYOIDW/DDoVK3uzyM7imca5dVGtDKZ7D72+rmV5q31Ee4Uq/ulTo0DrEahhi+HCKU0cZZO1bIzTZ1pNufpTeJxPsy2tKg6hfHkzfS/Yj417/R/zSp9v98oyMFy+bv+2LIn2m3at6ZloES7Nv/lD5adlR3TKR7UamK1g6Xj+BJbhw2hmC8h19ECnIpFO2FXUtCOeOOIlP79O2bBOOGNCkN3A4207tJXEKvDVuA9a6DiBFtb5vSFN4by8d+H+2kyVuZmBKc/+kMb2ha4dY8QIXz34FV7VXn3Bjwvd9mchPdeMbOqm5TsIr+/yE78ThRala8Vn7/aNKbAgLmZIuYbQd02qNUeHXveE+Ix0u0Qz/tUYuWSFhfkX0ONkY9X8+ZSAKZgRwChKF5YIrGRkKizPwGXMefKNkuj7NH8bU2oO6LOv5QRfMI0dsTSgflIz7xOyxpbgNXAsC9qe4fs6veli/FxNLpv+kqMM6teZ2kzO4Ug4DRR3Ej0zV0Cfb00vLy5NpvTPTOH2ngf9Qnm5QEgl8EpWZT2Awr96bBIt0urRvuPJhMjr3I7LZa+IRs/kKyp4tEA1x3tw8H0+idM/3sZXSPnPfc2JJyj8Dj377pu9O8uVTSh1kycgLHlf2E8bWb1NrNiFLc0/jjIi411Zbxj2FVAOj0QaiPWM8znCHohkc+c8/9Q7ze/GS6IX8wsBYsVx45bPzYXvecaqjW1ryGHjgKP0o3Ucm0FCyJw93MYROftpKMbNHbBsqVIAtREnol/7cbs7x+EZ0oW1Ejy25zeYc'
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
        const got = require('got');
        const tunnel = require('tunnel');
        const { v4: uuidv4 } = require('uuid');

        if (this.stopped === "false") {
            await this.send("Getting product info")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://mobile.ssense.com',
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
                        "query": "query ProductDetail($productId: Int!, $languageCode: String!, $countryCode: String!) {\n  getProductDetail(productId: $productId, languageCode: $languageCode, countryCode: $countryCode) {\n    __typename\n    id\n    name\n    description\n    season\n    gender\n    code\n    countryOfOrigin\n    composition\n    showShippingDutiesMessage\n    shippingDutiesMessage\n    sizes {\n      __typename\n      sequence\n      sku\n      stock\n      isLowStock\n      isOutOfStock\n      displaySizeName\n    }\n    brand {\n      __typename\n      id\n      name\n      seoKeyword {\n        __typename\n        en\n        fr\n      }\n    }\n    category {\n      __typename\n      id\n      name\n      seoKeyword {\n        __typename\n        en\n        fr\n      }\n    }\n    images\n    price {\n      __typename\n      sale\n      regular\n      formatSale\n      fullFormatSale\n      formatRegular\n      fullFormatRegular\n    }\n    discountPercentage\n    discountPercentageInteger\n    isSale\n    isPrivateSale\n    isFinalSale\n    isNotAvailable\n    websiteUrl\n  }\n}",
                        "variables": {
                            "countryCode": "US",
                            "languageCode": "en",
                            "productId": this.link
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
                    await this.send("Error getting SKU: " + error.response.statusCode)
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
        //if (this.stopped === "false")
        //    await this.login()

        //if (this.stopped === "false")
        //   await this.startCart()

        if (this.stopped === "false" && typeof this.sku === 'undefined')
            await this.getSKU()

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