module.exports = class ConverseTask {
    constructor(stopped, taskNumber, site, mode, link, size, profiles, proxies, accounts, capMonster, webhookLink) {
        require('log-timestamp');
        require("../src/js/console-file.js");
        var path = require('path')
        var fs = require('fs');

        const electron = require('electron');
        const configDir = (electron.app || electron.remote.app).getPath('userData');
        console.file(path.join(configDir, '/userdata/logs.txt'));
        this.stopped = stopped;
        this.taskNumber = taskNumber;
        this.site = site;
        this.mode = mode;
        this.csrfToken;
        this.size = size;
        this.link = link
        this.webhookLink = webhookLink
        this.key = getKey()
        this.profilename = profiles;
        this.productTitle;
        this.proxyListName = proxies;
        this.cartTotal;
        this.adyen;
        this.mid = link.trim().split("/")[0]
        this.pid = link.trim().split("/")[0] + "_" + link.trim().split("/")[1]
        this.category = link.trim().split("/")[2]
        this.profile = getProfileInfo(profiles);
        this.proxyArray = getProxyInfo(proxies);
        if (this.proxyArray === "-") {
            const axios = require('axios').default;
            const axiosCookieJarSupport = require('axios-cookiejar-support').default;
            const tough = require('tough-cookie');
            axiosCookieJarSupport(axios);
            this.cookieJar = new tough.CookieJar();
            this.proxy = "-";
        } else {
            const axios = require('axios-https-proxy-fix').default;
            const axiosCookieJarSupport = require('axios-cookiejar-support').default;
            const tough = require('tough-cookie');
            axiosCookieJarSupport(axios);
            this.cookieJar = new tough.CookieJar();
            this.proxy = this.proxyArray.sample();
        }
        this.window = require(path.join(__dirname, '..', 'main.js'));
    }

    async adyenEncrypt() {
        let adyenEncrypt = require('node-adyen-encrypt')(24);
        const adyenKey = "10001|92DCDEC16F38637EE0FAFB2767D0E4A17490A5C432CC49FE5A776D61588FDE35FF962092D31B77BA107C2F8A94B97E4101E3F6FF1E310CDFEBCBAB03E8AC0A0F565268E24FFEA7FF9AF4CE906D12A217CD093B74294ABCFAF91D232271F748460E4929643AAC1938651858FDCDADBABC34424D0CA37B12972A52802EDC8F63783F6DD8D96A54CE173153D1D991A990D05FBE5641EA2E633EB403D08693B1D2CA23607479DDC68F44D7459AE716C32832D0935A9A0824CD62B7B11E4596172136F26421D723896043113EFA2A9D73EA3C43920008BAC80CC8AB5AB736A8459BE65DFECC7BD6974D0E9D34538EA584E00ECCB1C5ABC70430751E0966FFE49F96E5";
        let options = {};

        var x = this.profile.cardNumber
        var y = "";
        for (var i = 0; i < x.length; i = i + 4) {
            y += x.substring(i, i + 4)
            if (i != x.length - 1)
                y += " "
        }
        this.profile.cardNumber = y;

        let cardData = {
            number: this.profile.cardNumber,
            cvc: this.profile.cvv,
            holderName: this.profile.firstName + " " + this.profile.lastName,
            expiryMonth: this.profile.expiryMonth,
            expiryYear: this.profile.expiryYear,
            generationtime: new Date().toISOString()
        }
        let cseInstance = await adyenEncrypt.createEncryption(adyenKey, options);
        await cseInstance.validate(cardData);
        this.adyen = await cseInstance.encrypt(cardData);
    }


    async sendFail() {
        const axios = require('axios').default;

        axios({
                method: 'post',
                url: 'https://venetiabots.com/api/fail',
                headers: {
                    'key': this.key
                },
                data: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.link,
                    "size": this.size,
                    "price": this.cartTotal,
                    "timestamp": new Date(Date.now()).toISOString(),
                    "productTitle": this.productTitle,
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
            axios({
                    method: 'post',
                    url: webhooks[i].trim(),
                    data: {
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
                                "icon_url": "https://pbs.twimg.com/profile_images/1372225168764981249/So3X57mB_400x400.jpg"
                            },
                            "timestamp": new Date(Date.now()).toISOString(),
                            "thumbnail": {
                                "url": "https://images.footlocker.com/pi/" + this.sku + "/large/" + this.sku + ".jpeg"
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://pbs.twimg.com/profile_images/1372225168764981249/So3X57mB_400x400.jpg"
                    }
                }).then(response => {
                    console.log("Finished sending webhook")
                })
                .catch(error => {
                    console.log(error.response.data)
                })
        }


    }

    async sendSuccess() {
        const axios = require('axios').default;
        axios({
                method: 'post',
                url: 'https://venetiabots.com/api/success',
                headers: {
                    'key': this.key
                },
                data: {
                    "site": this.site,
                    "mode": this.mode,
                    "product": this.link,
                    "size": this.size,
                    "productTitle": this.productTitle,
                    "price": Math.trunc(this.cartTotal),
                    "timestamp": new Date(Date.now()).toISOString(),
                    "image": "https://images.footlocker.com/pi/" + this.sku + "/large/" + this.sku + ".jpeg"
                }
            }).then(response => {
                console.log("Finished")
            })
            .catch(error => {
                console.log(error)
            })

        var webhooks = this.webhookLink.split(",")
        for (var i = 0; i < webhooks.length; i++) {
            axios({
                    method: 'post',
                    url: webhooks[i].trim(),
                    data: {
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
                                "icon_url": "https://pbs.twimg.com/profile_images/1372225168764981249/So3X57mB_400x400.jpg"
                            },
                            "timestamp": new Date(Date.now()).toISOString(),
                            "thumbnail": {
                                "url": "https://images.footlocker.com/pi/" + this.sku + "/large/" + this.sku + ".jpeg"
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://pbs.twimg.com/profile_images/1372225168764981249/So3X57mB_400x400.jpg"
                    }
                }).then(response => {
                    console.log("Finished sending webhook")
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    async addToCart() {
        const axios = require('axios').default;
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Adding to cart")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://www.converse.com/on/demandware.store/Sites-ConverseUS-Site/default/Cart-AddProduct?format=ajax',
                    jar: this.cookieJar,
                    withCredentials: true,
                    timeout: 6000,
                    headers: {
                        'user-agent': "atomz",
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'www.' + this.site + '.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    },
                    data: querystring.encode({
                        'Quantity': '1',
                        'cgid': this.category,
                        'cartAction': 'add',
                        'mid': this.mid,
                        'pid': this.pid
                    })
                })

                if (this.stopped === "false") {
                    await this.send("Carted")
                    await this.updateStat("carts")
                    return;
                }

            } catch (error) {
                if (typeof error.response != 'undefined') {
                    await this.send("Error adding to cart: " + error.response.status)
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.addToCart()
                } else {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.addToCart()
                }
            }
        }
    }

    async getCSRF() {
        const axios = require('axios').default;
        if (this.stopped === "false") {
            await this.send("Getting checkout token")
            try {
                let response = await axios({
                    method: 'get',
                    url: 'https://www.converse.com/shop-cart',
                    jar: this.cookieJar,
                    withCredentials: true,
                    timeout: 6000,
                    headers: {
                        'user-agent': "atomz",
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'www.' + this.site + '.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    }
                })

                if (this.stopped === "false") {
                    await this.send("Got CSRF")
                    var HTMLParser = require('node-html-parser');
                    var root = HTMLParser.parse(response.data);
                    this.csrfToken = root.querySelector("[name=csrf_token]").getAttribute("value");
                    this.cartTotal = root.querySelector(".product-price--sales").rawText.substring(1);
                    this.productTitle = root.querySelector(".product-mini__name").rawText.trim()
                    this.imageURL = root.querySelector(".ratio-media").getAttribute("src")
                    console.log(this.productTitle)
                    console.log(this.cartTotal)
                    return;
                }

            } catch (error) {
                if (typeof error.response != 'undefined') {
                    await this.send("Error getting token: " + error.response.status)
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.getCSRF()
                } else {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.getCSRF()
                }
            }
        }
    }

    async loadCheckout() {
        const axios = require('axios').default;
        if (this.stopped === "false") {
            await this.send("Loading checkout")
            try {
                let response = await axios({
                    method: 'get',
                    url: 'https://www.converse.com/checkout',
                    jar: this.cookieJar,
                    withCredentials: true,
                    timeout: 6000,
                    headers: {
                        'user-agent': "atomz",
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'www.' + this.site + '.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    }
                })
                if (this.stopped === "false") {
                    await this.send("Loaded checkout")
                    return;
                }
            } catch (error) {
                if (typeof error.response != 'undefined') {
                    await this.send("Error loading checkout: " + error.response.status)
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.loadCheckout()
                } else {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.loadCheckout()
                }
            }
        }
    }

    async submitShipping() {
        const axios = require('axios').default;
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Submitting shipping")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://www.converse.com/payment',
                    jar: this.cookieJar,
                    withCredentials: true,
                    timeout: 6000,
                    headers: {
                        'user-agent': "atomz",
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'www.' + this.site + '.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    },
                    data: querystring.encode({
                        'dwfrm_singleshipping_shippingAddress_addressFields_shipmentDestination': 'homeoffice',
                        'dwfrm_singleshipping_shippingAddress_addressFields_firstName': this.profile.firstName,
                        'dwfrm_singleshipping_shippingAddress_addressFields_lastName': this.profile.lastName,
                        'dwfrm_singleshipping_shippingAddress_addressFields_address1': this.profile.address1,
                        'dwfrm_singleshipping_shippingAddress_addressFields_address2': '',
                        'dwfrm_singleshipping_shippingAddress_addressFields_apofpoType': 'APO',
                        'dwfrm_singleshipping_shippingAddress_addressFields_apofpoRegion': 'AA',
                        'dwfrm_singleshipping_shippingAddress_addressFields_city': this.profile.city,
                        'dwfrm_singleshipping_shippingAddress_addressFields_postal': this.profile.zipcode,
                        'dwfrm_singleshipping_shippingAddress_addressFields_countryDummy': 'United States',
                        'dwfrm_singleshipping_shippingAddress_addressFields_country': 'us',
                        'dwfrm_singleshipping_shippingAddress_addressFields_states_state': abbrRegion(this.profile.state, 'abbr'),
                        'dwfrm_singleshipping_shippingAddress_addressFields_phone': this.profile.phone.substring(0, 3) + "-" + this.profile.phone.substring(3, 6) + "-" + this.profile.phone.substring(6),
                        'dwfrm_singleshipping_shippingAddress_useAsBillingAddress': 'true',
                        'dwfrm_singleshipping_shippingAddress_shippingMethodID': 'M4',
                        'dwfrm_cart_giftMessage': '',
                        'csrf_token': this.csrfToken,
                        'dwfrm_singleshipping_shippingAddress_save': 'Go to Billing'
                    })
                })
                if (this.stopped === "false") {
                    await this.send("Submitted shipping")
                    return;
                }
            } catch (error) {
                if (typeof error.response != 'undefined') {
                    await this.send("Error submitting shipping: " + error.response.status)
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.submitShipping()
                } else {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.submitShipping()
                }
            }
        }
    }

    async submitBilling() {
        const axios = require('axios').default;
        const querystring = require('querystring')
        await this.adyenEncrypt()
        if (this.profile.expiryMonth.startsWith("0"))
            this.profile.expiryMonth = this.profile.expiryMonth.substring(1)
        console.log(this.adyen)
        if (this.stopped === "false") {
            await this.send("Submitting billing")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://www.converse.com/payment',
                    jar: this.cookieJar,
                    withCredentials: true,
                    timeout: 6000,
                    headers: {
                        'user-agent': "atomz",
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'www.' + this.site + '.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    },
                    data: querystring.encode({
                        'dwfrm_billing_save': 'true',
                        'dwfrm_billing_billingAddress_useShippingAddress': 'true',
                        'dwfrm_billing_billingAddress_addressFields_firstName': this.profile.firstName,
                        'dwfrm_billing_billingAddress_addressFields_lastName': this.profile.lastName,
                        'dwfrm_billing_billingAddress_addressFields_address1': this.profile.address1,
                        'dwfrm_billing_billingAddress_addressFields_address2': '',
                        'dwfrm_billing_billingAddress_addressFields_city': this.profile.city,
                        'dwfrm_billing_billingAddress_addressFields_postal': this.profile.zipcode,
                        'dwfrm_billing_billingAddress_addressFields_country': 'us',
                        'dwfrm_billing_billingAddress_addressFields_states_state': abbrRegion(this.profile.state, 'abbr'),
                        'dwfrm_billing_billingAddress_addressFields_phone': this.profile.phone.substring(0, 3) + "-" + this.profile.phone.substring(3, 6) + "-" + this.profile.phone.substring(6),
                        'dwfrm_billing_billingAddress_email_emailAddress': this.profile.email,
                        'dwfrm_billing_billingAddress_addToEmailList': 'true',
                        'dwfrm_billing_subscriptiondob_month': '',
                        'dwfrm_billing_subscriptiondob_day': '',
                        'dwfrm_billing_subscriptiondob_year': '',
                        'dwfrm_cart_couponCode': '',
                        'dwfrm_billing_paymentMethods_selectedPaymentMethodID': 'CREDIT_CARD',
                        'dwfrm_billing_paymentMethods_creditCard_encrypteddata': this.adyen,
                        'noPaymentNeeded': 'true',
                        'dwfrm_billing_paymentMethods_creditCard_type': 'Visa',
                        '_creditCard_number': '************' + this.profile.cardNumber.split(" ")[this.profile.cardNumber.split(" ").length - 1],
                        'creditCard_expiration_month': this.profile.expiryMonth,
                        'creditCard_expiration_year': this.profile.expiryYear,
                        'cvv_flag': '***',
                        'creditCard_owner': this.profile.firstName + " " + this.profile.lastName,
                        'dwfrm_billing_paymentMethods_creditCard_selectedCardID': '',
                        'dwfrm_billing_GivexCard_d0kpecftklud': '',
                        'dwfrm_billing_GivexPIN_d0xwcyqvejbn': '',
                        'csrf_token': this.csrfToken
                    })
                })
                if (this.stopped === "false") {
                    console.log(response.data)
                    await this.send("Submitted billing")
                    return;
                }
            } catch (error) {
                if (typeof error.response != 'undefined') {
                    await this.send("Error submitting billing: " + error.response.status)
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.submitShipping()
                } else {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.submitShipping()
                }
            }
        }
    }

    async submitOrder() {
        const axios = require('axios').default;
        const querystring = require('querystring')
        if (this.stopped === "false") {
            await this.send("Submitting order")
            try {
                let response = await axios({
                    method: 'post',
                    url: 'https://www.converse.com/order-confirmation',
                    jar: this.cookieJar,
                    withCredentials: true,
                    timeout: 6000,
                    headers: {
                        'user-agent': "atomz",
                        'authority': 'www.' + this.site + '.com',
                        'pragma': 'no-cache',
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'www.' + this.site + '.com',
                        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                    },
                    data: querystring.encode({
                        'csrf_token': this.csrfToken,
                        'dwfrm_cart_couponCode': '',
                        'dwfrm_cart_giftMessage': '',
                        'submit': 'Order Now'
                    })
                })
                if (this.stopped === "false") {
                    console.log(response.data)
                    await this.send("Submitted order")
                    await this.send("Check email")
                    await this.updateStat("checkouts")
                    await this.sendSuccess()
                    return;
                }
            } catch (error) {
                if (typeof error.response != 'undefined') {
                    await this.send("Checkout failed")
                    await this.updateStat("fails")
                    await this.sendFail()
                } else {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep((await axios.get("http://localhost:4444/venetia/delays")).data)
                    await this.submitOrder()
                }
            }
        }
    }

    async stopTask() {
        this.stopped = "true";
        console.log("Stopped")
        this.send("Stopped")
    }

    async returnTaskNumber() {
        return this.taskNumber;
    }

    async send(status) {
        this.window.webContents.send("updateStatus", this.taskNumber, status);
    }

    async updateStat(stat) {
        this.window.webContents.send("updateStats", stat);
    }

    async initialize() {
        await this.send("Started")
        const axios = require('axios').default

        if (this.proxy != "-") {
            console.log("ADD PROXY MODE")


        } else {
            if (this.stopped === "false")
                await this.addToCart();

            if (this.stopped === "false")
                await this.getCSRF();

            if (this.stopped === "false")
                await this.loadCheckout();

            if (this.stopped === "false")
                await this.submitShipping();

            if (this.stopped === "false")
                await this.submitBilling();

            if (this.stopped === "false")
                await this.submitOrder();
        }
    }
}


function getProxyInfo(proxies) {
    if (proxies === "-")
        return "-"

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
                    proxyStorage.push({ "host": x[i].proxies[j].ip, "port": x[i].proxies[j].port, "auth": { "username": x[i].proxies[j].username, "password": x[i].proxies[j].password } })
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