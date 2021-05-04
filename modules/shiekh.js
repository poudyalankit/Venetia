module.exports = class ShiekhTask {
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
        this.imageURL;
        this.proxyListName = taskInfo.proxies;
        this.cartTotal;
        this.sku;
        this.sizeid;
        this.itemid;
        this.encryptedCard;
        this.accountToken;
        this.cartToken;
        const tough = require('tough-cookie');
        this.cookieJar = new tough.CookieJar();
        this.accounts = getAccountInfo(taskInfo.accounts)
        this.profile = getProfileInfo(taskInfo.profile);
        this.proxyArray = getProxyInfo(taskInfo.proxies);
        this.proxy = this.proxyArray.sample();

        this.cartTotal = 149.99
        this.productTitle = "(GS) Air Jordan 4 Retro University Blue/Black-Tech Grey-White"
        this.sendProductTitle(this.productTitle)
        this.sku = "408452 400"
        this.itemid = "187"
        this.sizeArray = ["1076", "1070", "1074", "1073", "1071", "1072"]
        if (this.size === "RS" && this.link === "408452%20400") {
            this.sizeid = this.sizeArray.sample()
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
                                },
                                {
                                    "name": "Failure Reason",
                                    "value": this.errorMessage
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

    async login() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Logging in...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://api.shiekh.com/api/V1/integration/customer/token',
                    headers: {
                        'user-agent': 'Shiekh Shoes/8.2 (com.shiekh.shoes.ios; build:863; iOS 14.2.0) Alamofire/5.4.2',
                    },
                    json: {
                        "password": this.accounts.password,
                        "username": this.accounts.email
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
                if (this.stopped === "false") {
                    this.accountToken = response.body.token
                    await this.send("Logged in")
                    return;
                }
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error logging in: " + error.response.statusCode)
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

    async generateCart() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Creating cart...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://api.shiekh.com/api/V1/carts/mine',
                    headers: {
                        'user-agent': 'Shiekh Shoes/8.2 (com.shiekh.shoes.ios; build:863; iOS 14.2.0) Alamofire/5.4.2',
                        'authorization': 'Bearer ' + this.accountToken
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
                if (this.stopped === "false") {
                    await this.send("Created cart")
                    this.cartToken = response.body
                    return;
                }
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error creating cart: " + error.response.statusCode)
                    await sleep(3500)
                    await this.generateCart()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.generateCart()
                }
            }
        }
    }

    async getProduct() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Getting product...")
            try {
                this.request = {
                    method: 'get',
                    url: 'https://api.shiekh.com/api/V1/extend/products/' + this.link,
                    headers: {
                        'user-agent': 'Shiekh Shoes/8.2 (com.shiekh.shoes.ios; build:863; iOS 14.2.0) Alamofire/5.4.2',
                        "Accept": "application/json",
                        "Content-Type": "application/json"
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
                if (this.stopped === "false") {
                    this.imageURL = response.body['media_gallery_entries'][0].images[0].original
                    this.sku = response.body.sku
                    this.productTitle = response.body.name
                    await this.sendProductTitle(this.productTitle)
                    this.itemid = response.body['extension_attributes']['configurable_product_options'][0]['attribute_id']
                    this.cartTotal = Math.trunc(response.body['min_price'])
                    var sizesInStock = []
                    if (this.size === "RS") {
                        for (var i = 0; i < response.body.size.length; i++) {
                            if (response.body.size[i]['in_stock'] == true) {
                                sizesInStock.push(response.body.size[i]['size_id'])
                            }
                        }
                        if (sizesInStock.length < 1) {
                            throw "No sizes in stock"
                        } else {
                            this.sizeid = sizesInStock.sample()
                            await this.send("Got product")
                            return;
                        }
                    } else {
                        for (var i = 0; i < response.body.size.length; i++) {
                            if (response.body.size[i].value.includes(this.size) && response.body.size[i]['in_stock'] == true) {
                                this.sizeid = response.body.size[i]['size_id']
                                await this.send("Got product")
                                return;
                            }
                        }
                        throw "No sizes in stock"
                    }
                }
            } catch (error) {
                if (error === "No sizes in stock") {
                    await this.send("Waiting for restock")
                    await sleep(3500)
                    await this.getProduct()
                } else
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error)
                    await this.send("Error getting product: " + error.response.statusCode)
                    await sleep(3500)
                    await this.getProduct()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.getProduct()
                }
            }
        }
    }

    async addToCart() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Adding to cart...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://api.shiekh.com/api/V1/carts/mine/items',
                    headers: {
                        'user-agent': 'Shiekh Shoes/8.2 (com.shiekh.shoes.ios; build:863; iOS 14.2.0) Alamofire/5.4.2',
                        'authorization': 'Bearer ' + this.accountToken
                    },
                    json: {
                        "cart_item": {
                            "product_option": {
                                "extension_attributes": {
                                    "configurable_item_options": [{
                                        "option_id": this.itemid,
                                        "option_value": this.sizeid
                                    }]
                                }
                            },
                            "item_id": null,
                            "qty": 1,
                            "sku": this.sku,
                            "quote_id": this.cartToken
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
                let response = await got(this.request)
                if (this.stopped === "false") {
                    await this.send("Carted")
                }
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    if (typeof error.response.body.message != 'undefined' && error.response.body.message === "This product(s) can't be purchase. Please try it later.") {
                        await this.send("Error product inactive")
                        await sleep(3500)
                        await this.addToCart()
                    } else {
                        await this.send("Error carting: " + error.response.statusCode)
                        await sleep(3500)
                        await this.addToCart()
                    }
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.addToCart()
                }
            }
        }
    }

    async encryptCard() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Encrypting card...")
            try {
                this.request = {
                    method: 'post',
                    url: 'https://payments.braintree-api.com/graphql',
                    headers: {
                        'user-agent': 'Braintree/iOS/4.37.1',
                        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjIwMTgwNDI2MTYtcHJvZHVjdGlvbiIsImlzcyI6Imh0dHBzOi8vYXBpLmJyYWludHJlZWdhdGV3YXkuY29tIn0.eyJleHAiOjE2MTk2NjQ4MTEsImp0aSI6ImM1MGYzYzY0LTQzZGUtNDU3Yi1iY2U1LTllMWE1YWMyYjNlNyIsInN1YiI6ImR5eGNuNHY5cjJ6czkzd3giLCJpc3MiOiJodHRwczovL2FwaS5icmFpbnRyZWVnYXRld2F5LmNvbSIsIm1lcmNoYW50Ijp7InB1YmxpY19pZCI6ImR5eGNuNHY5cjJ6czkzd3giLCJ2ZXJpZnlfY2FyZF9ieV9kZWZhdWx0IjpmYWxzZX0sInJpZ2h0cyI6WyJtYW5hZ2VfdmF1bHQiXSwic2NvcGUiOlsiQnJhaW50cmVlOlZhdWx0Il0sIm9wdGlvbnMiOnt9fQ.zhIJYaXB94ZvSZ9S9j8wjuWPv-CQ9xIT9z6xMblTBV-0XMEy3ESUJO1Aedq-Ra5hLb6tg0SxjCNxorIin8BLnQ',
                        'Braintree-Version': '2018-03-06'
                    },
                    json: {
                        "query": "mutation TokenizeCreditCard($input: TokenizeCreditCardInput!) {  tokenizeCreditCard(input: $input) {    token    creditCard {      brand      expirationMonth      expirationYear      cardholderName      last4      bin      binData {        prepaid        healthcare        debit        durbinRegulated        commercial        payroll        issuingBank        countryOfIssuance        productId      }    }  }}",
                        "clientSdkMetadata": {
                            "sessionId": "E173ADF5E84B48CE9A2827C43A94C332",
                            "integration": "custom",
                            "source": "unknown"
                        },
                        "operationName": "TokenizeCreditCard",
                        "variables": {
                            "input": {
                                "options": {
                                    "validate": false
                                },
                                "creditCard": {
                                    "number": this.profile.cardNumber,
                                    "expirationYear": this.profile.expiryYear,
                                    "expirationMonth": this.profile.expiryMonth,
                                    "cvv": this.profile.cvv
                                }
                            }
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
                let response = await got(this.request)
                if (this.stopped === "false") {
                    this.encryptedCard = response.body.data.tokenizeCreditCard.token
                    console.log(this.encryptedCard)
                    await this.send("Encrypted card")
                    return;
                }
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Error encrypting: " + error.response.statusCode)
                    await sleep(3500)
                    await this.encryptCard()
                } else if (this.stopped === "false") {
                    console.log(error)
                    await this.send("Unexpected error")
                    await sleep(3500)
                    await this.encryptCard()
                }
            }
        }
    }

    async submitOrder() {
        const got = require('got');
        const { v4: uuidv4 } = require('uuid');
        const tunnel = require('tunnel');
        if (this.stopped === "false") {
            this.send("Submitting order...")
            try {
                this.request = {
                    method: 'put',
                    url: 'https://api.shiekh.com/api/V1/extend/carts/mine/order',
                    headers: {
                        'user-agent': 'Shiekh Shoes/8.2 (com.shiekh.shoes.ios; build:863; iOS 14.2.0) Alamofire/5.4.2',
                        'authorization': 'Bearer ' + this.accountToken
                    },
                    json: {
                        "isPaypalAddress": 0,
                        "kountSessionId": "C0A244969A324F429C1EE406A668F152",
                        "deviceInfo": "Apple",
                        "paymentMethod": {
                            "additional_data": {
                                "checkout_token": this.encryptedCard,
                                "is_active_payment_token_enabler": false,
                                "payment_method_nonce": this.encryptedCard
                            },
                            "method": "braintree"
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
                let response = await got(this.request)
                console.log(response.body)
                if (this.stopped === "false") {
                    await this.send("Check email")
                    await this.sendSuccess()
                }
            } catch (error) {
                if (typeof error.response != 'undefined' && this.stopped === "false") {
                    console.log(error.response.body)
                    await this.send("Checkout failed")
                    if (typeof error.response.body.message != 'undefined') {
                        this.errorMessage = error.response.body.message
                    }
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
            await this.login()

        if (this.stopped === "false")
            await this.generateCart()

        if (this.stopped === "false" && typeof this.sizeid === 'undefined')
            await this.getProduct()

        if (this.stopped === "false")
            await this.addToCart()

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