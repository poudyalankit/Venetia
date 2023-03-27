const MongoClient = require('mongodb').MongoClient;
const querystring = require('querystring');

var path = require('path');
const fs = require('fs');
var activeKeys = []
var activeMessage;
var db;
var client;
var serverid = "";
async function connectToDatabase() {
    client = await MongoClient.connect('', {
        useNewUrlParser: true,

        useUnifiedTopology: true,
    });
    db = client.db('keys');
}

connectToDatabase()

const axios = require('axios').default;
const fastify = require('fastify')({
    logger: true
})
fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '/'),
    prefix: '/public/', // optional: default '/'
})

fastify.register(require('fastify-formbody'))
fastify.register(require('fastify-cookie'))

fastify.get('/restock', async(request, reply) => {

    reply.header("Cache-Control", "no-cache, no-store, must-revalidate");
    reply.header("Pragma", "no-cache");
    reply.header("Expires", "0");
    const items = await db.collection('restock').findOne({ "password": request.query.password });
    if (items != null && items.stock > 0) {
        console.log("Release found")
        reply.code(200)
        return reply.sendFile('restock2.html')
    } else {
        console.log("Release not found/OOS")
        reply.code(200)
        return reply.sendFile('index.html')
    }
})

fastify.get('/', async(request, reply) => {
    reply.code(200)
    return reply.sendFile('index.html')
})

fastify.get('/api/loadShop', async(request, reply) => {
    const items = await db.collection('keys').findOne({ "Key": request.query.key });
    if (items != null && items.Binded != "null") {
        if (request.headers['user-agent'] != 'Venetia Dont Crack') {
            sendCrackMessage(request.query.key, items.Binded, request.headers['x-forwarded-for'].split(",")[0].trim())
            reply.code(404)
            reply.send()
        } else {
            reply.code(200)
            return reply.sendFile('modules/shopify.js')
        }
    } else if (items != null && items.Binded === "null") {
        sendCrackMessage(request.query.key, "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    } else {
        sendCrackMessage("-", "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    }
})

fastify.get('/api/loadDSG', async(request, reply) => {
    const items = await db.collection('keys').findOne({ "Key": request.query.key });
    if (items != null && items.Binded != "null") {
        if (request.headers['user-agent'] != 'Venetia Dont Crack') {
            sendCrackMessage(request.query.key, items.Binded, request.headers['x-forwarded-for'].split(",")[0].trim())
            reply.code(404)
            reply.send()
        } else {
            reply.code(200)
            return reply.sendFile('modules/dsg.js')
        }
    } else if (items != null && items.Binded === "null") {
        sendCrackMessage(request.query.key, "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    } else {
        sendCrackMessage("-", "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    }
})

fastify.get('/api/loadWM', async(request, reply) => {
    const items = await db.collection('keys').findOne({ "Key": request.query.key });
    if (items != null && items.Binded != "null") {
        if (request.headers['user-agent'] != 'Venetia Dont Crack') {
            sendCrackMessage(request.query.key, items.Binded, request.headers['x-forwarded-for'].split(",")[0].trim())
            reply.code(404)
            reply.send()
        } else {
            reply.code(200)
            return reply.sendFile('modules/walmart.js')
        }
    } else if (items != null && items.Binded === "null") {
        sendCrackMessage(request.query.key, "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    } else {
        sendCrackMessage("-", "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    }
})



function sendCrackMessage(key, binded, ipAddress) {
    const embedMessage = {
        "title": "**Security Notice**",
        "fields": [{
                "name": "Key",
                "value": key
            },
            {
                "name": "Discord ID",
                "value": binded
            },
            {
                "name": "IP Address",
                "value": ipAddress
            }
        ],
        "color": 14706535,
        "footer": {
            "text": "Powered by Venetia",
            "icon_url": "https://i.imgur.com/6h06tuW.png"
        }
    }
    discClient.channels.cache.get('').send({ embed: embedMessage })

}


fastify.get('/api/loadFoo', async(request, reply) => {
    const items = await db.collection('keys').findOne({ "Key": request.query.key });
    if (items != null && items.Binded != "null") {
        if (request.headers['user-agent'] != 'Venetia Dont Crack') {
            sendCrackMessage(request.query.key, items.Binded, request.headers['x-forwarded-for'].split(",")[0].trim())
            reply.code(404)
            reply.send()
        } else {
            reply.code(200)
            return reply.sendFile('modules/footsites.js')
        }
    } else if (items != null && items.Binded === "null") {
        sendCrackMessage(request.query.key, "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    } else {
        sendCrackMessage("-", "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    }
})

fastify.get('/api/loadSS', async(request, reply) => {
    const items = await db.collection('keys').findOne({ "Key": request.query.key });
    console.log(request)
    if (items != null && items.Binded != "null") {
        if (request.headers['user-agent'] != 'Venetia Dont Crack') {
            sendCrackMessage(request.query.key, items.Binded, request.headers['x-forwarded-for'].split(",")[0].trim())
            reply.code(404)
            reply.send()
        } else {
            reply.code(200)
            return reply.sendFile('modules/ssense.js')
        }
    } else if (items != null && items.Binded === "null") {
        sendCrackMessage(request.query.key, "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    } else {
        sendCrackMessage("-", "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    }
})

fastify.get('/api/loadShi', async(request, reply) => {
    const items = await db.collection('keys').findOne({ "Key": request.query.key });
    if (items != null && items.Binded != "null") {
        if (request.headers['user-agent'] != 'Venetia Dont Crack') {
            sendCrackMessage(request.query.key, items.Binded, request.headers['x-forwarded-for'].split(",")[0].trim())
            reply.code(404)
            reply.send()
        } else {
            reply.code(200)
            return reply.sendFile('modules/shiekh.js')
        }
    } else if (items != null && items.Binded === "null") {
        sendCrackMessage(request.query.key, "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    } else {
        sendCrackMessage("-", "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    }
})

fastify.get('/api/loadFP', async(request, reply) => {
    const items = await db.collection('keys').findOne({ "Key": request.query.key });
    if (items != null && items.Binded != "null") {
        if (request.headers['user-agent'] != 'Venetia Dont Crack') {
            sendCrackMessage(request.query.key, items.Binded, request.headers['x-forwarded-for'].split(",")[0].trim())
            reply.code(404)
            reply.send()
        } else {
            reply.code(200)
            return reply.sendFile('modules/federalpremium.js')
        }
    } else if (items != null && items.Binded === "null") {
        sendCrackMessage(request.query.key, "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    } else {
        sendCrackMessage("-", "-", request.headers['x-forwarded-for'].split(",")[0].trim())
        reply.code(404)
        reply.send()
    }
})

fastify.get('/discord', async(request, reply) => {
    reply.redirect("https://discord.gg/Hn2RXNBP9y")
})

fastify.post("/api/restock", async(request, reply) => {
    console.log(request.body.name)
    console.log(request.body.email)
    console.log(request.headers.referer.split("?password=")[1])



    const items = await db.collection('restock').findOne({ "password": request.headers.referer.split("?password=")[1] });
    if (items != null && items.stock > 0) {
        console.log("Release found")
        reply.status(200)
        reply.send({ status: "Success" })
        await db.collection('restock').replaceOne({ "password": request.headers.referer.split("?password=")[1] }, { "password": request.headers.referer.split("?password=")[1], "stock": items.stock - 1 });
        const items2 = db.collection('keys');
        var x = await makeid(4) + "-" + await makeid(4) + "-" + await makeid(4) + "-" + await makeid(4);
        await items2.insertOne({ Key: x, Active: "FALSE", IP: "null", Binded: "null", Avatar: "null" })
        axios({
                method: 'post',
                url: 'https://api.sendgrid.com/v3/mail/send',
                headers: {
                    'Authorization': "",
                    'Content-Type': 'application/json',
                },
                data: {
                    "personalizations": [{
                        "to": [{
                            "email": request.body.email
                        }],
                        "dynamic_template_data": {
                            "key": x
                        },
                        "subject": "Your Venetia key is here!"
                    }],
                    "from": {
                        "email": "orders@venetiabots.com"
                    },
                    "template_id": ""
                }
            }).then(response => {
                console.log("Finished sending")
            })
            .catch(error => {
                console.log(error.response.data)
            })
    } else {
        console.log("Release not found/OOS")

        reply.code(200)
        reply.send({ status: "OOS" })
    }


});


fastify.get("/api/analytics", async(request, reply) => {
    const declines = await db.collection('declines').find({ "Key": request.query.key }).toArray();
    const success = await db.collection('success').find({ "Key": request.query.key }).toArray();
    for (var i = 0; i < success.length; i++) {
        success[i]['Date'] = success[i]["_id"].getTimestamp()
    }
    reply.code(200)
    reply.send({ "declines": declines, "success": success })
});



fastify.get("/api/activate", async(request, reply) => {
    console.log(request.headers['x-forwarded-for'].split(",")[0].trim())
    const items = await db.collection('keys').findOne({ "Key": request.query.key });
    var date = new Date(Date.now())
    if (items != null) {
        console.log("Key found: " + items.Key);
        if (items.Active === 'FALSE') {
            console.log("Key has not been activated and ip has not been set")
            reply.send({ key: request.query.key, exists: 'true', activated: 'false' })
            console.log("Setting ip and activating now")
            await db.collection('keys').replaceOne({ "Key": request.query.key }, { "Key": request.query.key, "Active": "TRUE", "IP": request.headers['x-forwarded-for'].split(",")[0].trim(), "Binded": items.Binded, Avatar: items.Avatar, version: request.headers['version'], "Last Activated": date.toUTCString() });
        } else
        if (items.Active === 'TRUE' && items.IP === request.headers['x-forwarded-for'].split(",")[0].trim()) {
            console.log("Key has been activated on this IP")
            reply.send({ key: request.query.key, exists: 'true', activated: 'true', ipMatch: 'true', Avatar: items.Avatar })
            await db.collection('keys').replaceOne({ "Key": request.query.key }, { "Key": request.query.key, "Active": "TRUE", "IP": request.headers['x-forwarded-for'].split(",")[0].trim(), "Binded": items.Binded, Avatar: items.Avatar, version: request.headers['version'], "Last Activated": date.toUTCString() });
            if (activeKeys.includes(request.query.key) == false)
                activeKeys.push(request.query.key)
        } else if (items.Active === 'TRUE' && items.IP != request.headers['x-forwarded-for'].split(",")[0].trim()) {
            console.log("Key has been activated on another IP")
            reply.send({ key: request.query.key, exists: 'true', activated: 'true', ipMatch: 'false' })
            console.log("Please reset the key")
        }
    } else {
        console.log("Key not found")
        reply.send({ exists: 'false' })
    }
});

fastify.get("/download", async(request, reply) => {
    return reply.sendFile('download.html')
});


fastify.get("/extension", async(request, reply) => {
    return reply.sendFile('Venetia Extension.zip')
});

fastify.get("/api/shopifyStores", async(request, reply) => {
    var shopifyStores = await db.collection('storelist').find().sort({ "site": 1 })
    return reply.send(await shopifyStores.toArray())
});


fastify.get("/raffle", async(request, reply) => {
    if (serverid === "none")
        return reply.sendFile('groupbuy.html')

    if (typeof request.query.code != 'undefined' && serverid != "none") {
        try {
            let response = await axios({
                method: 'post',
                url: 'https://discord.com/api/oauth2/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: querystring.stringify({
                    'client_id': '',
                    'client_secret': '',
                    'grant_type': 'authorization_code',
                    'code': request.query.code,
                    'redirect_uri': 'https://venetiabots.com/raffle',
                })
            })
            let userToken = response.data['access_token']
            let response2 = await axios({
                method: 'get',
                url: 'https://discord.com/api/users/@me/guilds ',
                headers: {
                    'Authorization': 'Bearer ' + userToken
                }
            })
            for (var i = 0; i < response2.data.length; i++) {
                if (response2.data[i].id === serverid) {
                    let response3 = await axios({
                        method: 'get',
                        url: 'https://discord.com/api/users/@me ',
                        headers: {
                            'Authorization': 'Bearer ' + userToken
                        }
                    })
                    var user = await db.collection('raffle').findOne({ "userID": response3.data.id });
                    console.log(user)
                    if (user == null) {
                        reply.cookie('id', response3.data.id)
                        return reply.sendFile('groupbuy.html')
                    }
                    return reply.send('Duplicate raffle entry')
                }
            }
            throw 'Not in server'
        } catch (error) {
            console.log(error)
            return reply.sendFile('index.html')
        }
    } else
        return reply.redirect('')

    return reply.sendFile('index.html')
});


fastify.post("/api/groupbuy", async(request, reply) => {
    console.log(request.body.email)
    console.log(request.body.twitter)
    console.log(request.body.userID)
    var entries = db.collection('raffle')
    var findEntries = await entries.findOne({ "userID": request.body.userID });
    if (findEntries == null) {
        await entries.insertOne({ userID: request.body.userID, email: request.body.email, twitter: request.body.twitter })
        reply.code(200)
        reply.send("Success")
    } else if (serverid === "none") {
        await entries.insertOne({ userID: request.body.userID, email: request.body.email, twitter: request.body.twitter })
        reply.code(200)
        reply.send("Success")
    } else {
        reply.code(400)
        reply.send("Duplicate entry")
    }
});


fastify.post("/api/checkKey", async(request, reply) => {
    const items = await db.collection('keys').findOne({ "Key": request.body.key });
    if (items != null) {
        reply.send({ exists: 'true', download: 'https://venetiabots.com/update/download' })


    } else {
        reply.send({ exists: 'false' })
    }
});

fastify.post("/api/success", async(request, reply) => {

    const items = db.collection('success')
    await items.insertOne({ Site: request.body.site, Product: request.body.productTitle, Query: request.body.product, Price: request.body.price, Size: request.body.size, Mode: request.body.mode, Key: request.headers.key, Image: request.body.image })
    if (request.body.site === "Custom (Shopify)") {
        axios({
                method: 'post',
                url: '',
                data: {
                    "content": null,
                    "embeds": [{
                        "title": "Venetia Successful Checkout! :tada:",
                        "color": 5230481,
                        "fields": [{
                                "name": "Site",
                                "value": request.body.site,
                            },
                            {
                                "name": "Product",
                                "value": "Hidden",
                                "inline": true
                            },
                            {
                                "name": "Query",
                                "value": "Hidden",
                                "inline": true
                            },
                            {
                                "name": "Mode",
                                "value": request.body.mode
                            },
                            {
                                "name": "Price",
                                "value": "Hidden"
                            },
                            {
                                "name": "Size",
                                "value": "Hidden"
                            }
                        ],
                        "footer": {
                            "text": "Powered by Venetia",
                            "icon_url": "https://i.imgur.com/6h06tuW.png"
                        },
                        "timestamp": request.body.timestamp,
                    }],
                    "username": "Venetia",
                    "avatar_url": "https://i.imgur.com/6h06tuW.png"
                }
            }).then(response => {
                console.log("Finished sending webhook")
            })
            .catch(error => {
                console.log(error.response.data)
            })
    } else {
        axios({
                method: 'post',
                url: '',
                data: {
                    "content": null,
                    "embeds": [{
                        "title": "Venetia Successful Checkout! :tada:",
                        "color": 5230481,
                        "fields": [{
                                "name": "Site",
                                "value": request.body.site,
                            },
                            {
                                "name": "Product",
                                "value": request.body.productTitle,
                                "inline": true
                            },
                            {
                                "name": "Query",
                                "value": request.body.product,
                                "inline": true
                            },
                            {
                                "name": "Mode",
                                "value": request.body.mode
                            },
                            {
                                "name": "Price",
                                "value": request.body.price
                            },
                            {
                                "name": "Size",
                                "value": request.body.size
                            },
                            {
                                "name": "Quick Task",
                                "value": "[Click here](" + request.body.quicktask + ")"
                            }
                        ],
                        "footer": {
                            "text": "Powered by Venetia",
                            "icon_url": "https://i.imgur.com/6h06tuW.png"
                        },
                        "timestamp": request.body.timestamp,
                        "thumbnail": {
                            "url": request.body.image
                        }
                    }],
                    "username": "Venetia",
                    "avatar_url": "https://i.imgur.com/6h06tuW.png"
                }
            }).then(response => {
                console.log("Finished sending webhook")
            })
            .catch(error => {
                console.log(error.response.data)
            })
    }
    reply.send({ success: 'true' })
});


fastify.post("/api/fail", async(request, reply) => {
    const items = db.collection('declines')
    await items.insertOne({ Site: request.body.site, Product: request.body.productTitle, Query: request.body.product, Price: request.body.price, Size: request.body.size, Mode: request.body.mode, Key: request.headers.key, Image: request.body.image })
    if (request.body.site === "Custom (Shopify)") {
        axios({
                method: 'post',
                url: '',
                data: {
                    "content": null,
                    "embeds": [{
                        "title": "Venetia Failed Checkout! :octagonal_sign:",
                        "color": 14706535,
                        "fields": [{
                                "name": "Site",
                                "value": request.body.site,
                            },
                            {
                                "name": "Product",
                                "value": "Hidden",
                                "inline": true
                            },
                            {
                                "name": "Query",
                                "value": "Hidden",
                                "inline": true
                            },
                            {
                                "name": "Mode",
                                "value": request.body.mode
                            },
                            {
                                "name": "Price",
                                "value": "Hidden"
                            },
                            {
                                "name": "Size",
                                "value": "Hidden"
                            }
                        ],
                        "footer": {
                            "text": "Powered by Venetia",
                            "icon_url": "https://i.imgur.com/6h06tuW.png"
                        },
                        "timestamp": request.body.timestamp,
                    }],
                    "username": "Venetia",
                    "avatar_url": "https://i.imgur.com/6h06tuW.png"
                }
            }).then(response => {
                console.log("Finished sending webhook")
            })
            .catch(error => {
                console.log(error.response.data)
            })
    } else {
        axios({
                method: 'post',
                url: '',
                data: {
                    "content": null,
                    "embeds": [{
                        "title": "Venetia Failed Checkout! :octagonal_sign:",
                        "color": 14706535,
                        "fields": [{
                                "name": "Site",
                                "value": request.body.site,
                            },
                            {
                                "name": "Product",
                                "value": request.body.productTitle,
                                "inline": true
                            },
                            {
                                "name": "Query",
                                "value": request.body.product,
                                "inline": true
                            },
                            {
                                "name": "Mode",
                                "value": request.body.mode
                            },
                            {
                                "name": "Price",
                                "value": request.body.price
                            },
                            {
                                "name": "Size",
                                "value": request.body.size
                            },
                            {
                                "name": "Quick Task",
                                "value": "[Click here](" + request.body.quicktask + ")"
                            }
                        ],
                        "footer": {
                            "text": "Powered by Venetia",
                            "icon_url": "https://i.imgur.com/6h06tuW.png"
                        },
                        "timestamp": request.body.timestamp,
                        "thumbnail": {
                            "url": request.body.image
                        }
                    }],
                    "username": "Venetia",
                    "avatar_url": "https://i.imgur.com/6h06tuW.png"
                }
            }).then(response => {
                console.log("Finished sending webhook")
            })
            .catch(error => {
                console.log(error.response.data)
            })
    }
    reply.send({ success: 'true' })
});

fastify.setNotFoundHandler(function(req, reply) {
    reply.code(404).send()
})

fastify.listen(process.env.PORT || 80, "0.0.0.0", (err, address) => {
    if (err) throw err
    fastify.log.info(`server listening on ${address}`)
})

const Discord = require('discord.js');
const discClient = new Discord.Client();
const disbut = require('discord-buttons');
disbut(discClient)


discClient.on('ready', () => {
    console.log('I am ready!');
    discClient.user.setStatus("online")
});

discClient.on('clickButton', async(button) => {
    if (button.id === "openTicket") {
        var guild = discClient.guilds.cache.get("793870325523283978")
        var channel = await guild.channels.create("ticket-" + button.clicker.user.username, "text")
        let category = await guild.channels.cache.find(c => c.name == "Tickets" && c.type == "category");
        await channel.setParent(category.id);
        await channel.overwritePermissions([{
            id: button.clicker.id,
            allow: ['VIEW_CHANNEL', 'ADD_REACTIONS'],
            deny: ['MENTION_EVERYONE']
        }, ]);

        await channel.updateOverwrite(guild.roles.cache.find(r => r.name === '@everyone'), {
            'VIEW_CHANNEL': false
        })

        const exampleEmbed = {
            "title": "**Tickets**",
            "description": "**Thank you for opening a ticket. Please standby.**",
            "color": 14706535,
            "footer": {
                "text": "Powered by Venetia",
                "icon_url": "https://i.imgur.com/6h06tuW.png"
            }
        }
        await channel.send({ embed: exampleEmbed })
    }
    await button.reply.defer();
});


discClient.on('message', async(msg) => {
    if (msg.channel.type == "dm") {
        console.log(msg.content)
        if (msg.content.startsWith("!bind")) {
            var keytoBind = msg.content.substring(6)
            var x = await bindKey(keytoBind, msg.author.id, msg.author.avatarURL())
            msg.author.send(x)
        } else
        if (msg.content.startsWith("!keys")) {
            var x = await viewKeys(msg.author.id)
            msg.author.send(x)
        } else
        if (msg.content.startsWith("!unbind")) {
            var keytounbind = msg.content.substring(8)
            var x = await unbindKey(keytounbind, msg.author.id)
            msg.author.send(x)
        } else
        if (msg.content.startsWith("!reset")) {
            var keytounbind = msg.content.substring(7)
            var x = await resetKey(keytounbind, msg.author.id, msg.author.avatarURL())
            msg.author.send(x)
        }
    } else if (msg.content.startsWith("!gen") && msg.author.id === '272903042628583425') {
        var x = await genKeys(msg.content.substring(5))
        msg.channel.send(x)
    } else
    if (msg.content.startsWith("!update") && msg.author.id === '272903042628583425') {
        var x = msg.content.split("/");
        const exampleEmbed = {
            "title": "**" + x[1] + "**",
            "description": x[2],
            "color": 14706535,
            "footer": {
                "text": "Powered by Venetia",
                "icon_url": "https://i.imgur.com/6h06tuW.png"
            }
        }
        msg.delete()
        msg.channel.send({ embed: exampleEmbed });
    } else
    if (msg.content.startsWith("!startRaffle") && msg.author.id === '272903042628583425') {
        serverid = msg.content.split(" ")[1]
        msg.channel.send("Raffle started");
    } else
    if (msg.content.startsWith("!endRaffle") && msg.author.id === '272903042628583425') {
        serverid = ""
        msg.channel.send("Raffle ended");
    } else if (msg.content.startsWith("!auth") && msg.author.id === '272903042628583425') {
        const exampleEmbed = {
            "title": "**Welcome!**",
            "description": "Commands to DM <@768276915651739678>\n\n**Bind a key:**\n**```!bind <key>```**\n**Unbind a key:**\n**```!unbind <key>```**\n**Reset a key:**\n**```!reset <key>```**\n**View all binded keys:**\n**```!keys```**\n**Discord invite: https://discord.gg/Hn2RXNBP9y**",
            "color": 14706535,
            "footer": {
                "text": "Powered by Venetia",
                "icon_url": "https://i.imgur.com/6h06tuW.png"
            }
        }
        msg.channel.send({ embed: exampleEmbed });
    } else if (msg.content.startsWith("!close") && msg.author.id === '272903042628583425') {
        msg.channel.delete();
    } else if (msg.content.startsWith("!download")) {
        const exampleEmbed = {
            "title": "**Venetia Download**",
            "description": "https://venetiabots.com/download",
            "color": 14706535,
            "footer": {
                "text": "Powered by Venetia",
                "icon_url": "https://i.imgur.com/6h06tuW.png"
            }
        }

        msg.channel.send({ embed: exampleEmbed })
    } else if (msg.content.startsWith("!restock") && msg.author.id === '272903042628583425') {
        var contents = msg.content.split(" ")
        const items = db.collection('restock');
        await items.insertOne({ password: contents[1], stock: parseInt(contents[2]) })
        msg.channel.send("https://venetiabots.com/restock?password=" + contents[1])
    } else if (msg.content.startsWith("!clear") && msg.author.id === '272903042628583425') {
        var amount = msg.content.substring(7)
        var x = parseInt(amount)
        x = x + 1;
        amount = x.toString()
        var messages = await msg.channel.messages.fetch({
            limit: amount
        })
        console.log(messages)
        msg.channel.bulkDelete(messages);
    } else if (msg.content.startsWith("!pick") && (msg.author.id === '272903042628583425' || msg.author.id === "701428839011582002")) {
        var amount = parseInt(msg.content.substring("6"))
        for (var i = 0; i < amount; i++) {
            var items = await db.collection('raffle').aggregate([{ $sample: { size: 1 } }])
            var entry = await items.next()
            await db.collection('raffle').deleteMany({ "email": entry.email });
            await db.collection('raffle').deleteMany({ "twitter": entry.twitter });
            var key = await genKeys(1)
            msg.channel.send("Email: " + entry.email + "\n" + "Twitter: " + entry.twitter + "\n" + "Key: " + key)
            var response = await axios({
                method: 'post',
                url: 'https://api.sendgrid.com/v3/mail/send',
                headers: {
                    'Authorization': "",
                    'Content-Type': 'application/json',
                },
                data: {
                    "personalizations": [{
                        "to": [{
                            "email": entry.email
                        }],
                        "dynamic_template_data": {
                            "key": key
                        },
                        "subject": "Your Venetia key is here!"
                    }],
                    "from": {
                        "email": "orders@venetiabots.com"
                    },
                    "template_id": ""
                }
            })
        }
    } else if (msg.content.startsWith("!mute") && msg.author.id === '272903042628583425') {
        var guild = discClient.guilds.cache.get("793870325523283978")
        var userID = msg.content.substring(6)
        userID = userID.replace("@", "")
        userID = userID.replace("!", "")
        userID = userID.replace(">", "")
        userID = userID.replace("<", "")
        console.log(userID)
        var member = guild.members.cache.get(userID);
        var role = guild.roles.cache.get("809532053631795201");
        member.roles.add(role);
    } else if (msg.content.startsWith("!roles")) {
        var contents = msg.content.split(" ")
        if (contents[1] === "add") {
            if (contents[2].toLowerCase() === "restock") {
                var guild = discClient.guilds.cache.get("793870325523283978")
                var role = guild.roles.cache.get("818368872326365245");
                var member = guild.members.cache.get(msg.author.id);
                member.roles.add(role);
                msg.channel.send("Role added")
            } else
                msg.channel.send("You cannot add that role.")
        } else if (contents[1] === "remove") {
            if (contents[2].toLowerCase() === "restock") {
                var guild = discClient.guilds.cache.get("793870325523283978")
                var role = guild.roles.cache.get("818368872326365245");
                var member = guild.members.cache.get(msg.author.id);
                member.roles.remove(role);
                msg.channel.send("Role removed")
            } else
                msg.channel.send("You cannot remove that role.")
        } else {
            msg.channel.send("Invalid command")
        }
    } else if (msg.content.startsWith("!unmute") && msg.author.id === '272903042628583425') {
        var guild = discClient.guilds.cache.get("793870325523283978")
        var userID = msg.content.substring(8)
        userID = userID.replace("@", "")
        userID = userID.replace("!", "")
        userID = userID.replace(">", "")
        userID = userID.replace("<", "")
        console.log(userID)
        var member = guild.members.cache.get(userID);
        var role = guild.roles.cache.get("809532053631795201");
        member.roles.remove(role);
    } else if (msg.content.startsWith("!destroy") && msg.author.id === '272903042628583425') {
        var guild = discClient.guilds.cache.get("793870325523283978")
        var userID = msg.content.substring(9)
        userID = userID.replace("@", "")
        userID = userID.replace("!", "")
        userID = userID.replace(">", "")
        userID = userID.replace("<", "")
        console.log(userID)
        var member = guild.members.cache.get(userID);
        if (typeof member != 'undefined') {
            member.kick();
            const items = await db.collection('keys').findOne({ "Binded": userID });
            if (items != null) {
                await db.collection('keys').deleteMany({ "Binded": userID });
                msg.channel.send("User has been purged.")
            } else {
                msg.channel.send("User does not have a key.")
            }
        } else
            msg.channel.send("User is not in server.")
    } else if (msg.content.startsWith("!kick") && msg.author.id === '272903042628583425') {
        var guild = discClient.guilds.cache.get("793870325523283978")
        var userID = msg.content.substring(6)
        userID = userID.replace("@", "")
        userID = userID.replace("!", "")
        userID = userID.replace(">", "")
        userID = userID.replace("<", "")
        console.log(userID)
        var member = guild.members.cache.get(userID);
        if (typeof member != 'undefined') {
            member.kick();
            msg.channel.send("User has been kicked.")
        } else
            msg.channel.send("User is not in server.")

    } else if (msg.content.startsWith("!setupticket") && msg.author.id === '272903042628583425') {
        var openTicket = new disbut.MessageButton()
            .setLabel("Open Ticket")
            .setID("openTicket")
            .setStyle("red");
        var exampleEmbed = {
            "title": "**Tickets**",
            "description": "**Press the button below to open a ticket for support.**",
            "color": 14706535,
            "footer": {
                "text": "Powered by Venetia",
                "icon_url": "https://i.imgur.com/6h06tuW.png"
            }
        }
        await msg.channel.send({
            embed: exampleEmbed,
            button: openTicket
        })
    } else if (msg.content.startsWith("!setupActive") && msg.author.id === '272903042628583425') {
        var exampleEmbed = {
            "title": "**Active  Users**",
            "description": activeKeys.length,
            "color": 14706535,
            "footer": {
                "text": "Powered by Venetia",
                "icon_url": "https://i.imgur.com/6h06tuW.png"
            }
        }
    } else if (msg.content.startsWith("!track") && (msg.author.id === '272903042628583425' || msg.author.id === '701428839011582002')) {
        var exampleEmbed = {
            "title": "**Active  Users**",
            "description": activeKeys.length,
            "color": 14706535,
            "footer": {
                "text": "Powered by Venetia",
                "icon_url": "https://i.imgur.com/6h06tuW.png"
            }
        }
        await msg.channel.send({
            embed: exampleEmbed
        })
    }
    return;
});

async function genKeys(number) {
    var keys = "";
    const items = db.collection('keys');
    for (var i = 0; i < number; i++) {
        var x = await makeid(4) + "-" + await makeid(4) + "-" + await makeid(4) + "-" + await makeid(4);
        keys += x + "\n";
        await items.insertOne({ Key: x, Active: "FALSE", IP: "null", Binded: "null", Avatar: "null" })
    }
    return keys;
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


async function viewKeys(userID) {
    const items = db.collection('keys').find({ Binded: userID });
    var x = await items.toArray();
    if (x.length != 0) {
        var keys = "";
        for (var i = 0; i < x.length; i++) {
            keys += x[i].Key + "\n";
        }
        return keys + "Total: " + x.length;
    } else {
        return "You have no keys binded."
    }
}

async function bindKey(keytoBind, userID, avatar) {
    avatar = avatar.split("webp")[0] + "png?size=2048"

    var guild = discClient.guilds.cache.get("793870325523283978")

    const items = await db.collection('keys').findOne({ "Key": keytoBind });
    if (items != null) {
        if (items.Binded != "null") {
            return "Key has already been bound."
        } else {
            await db.collection('keys').replaceOne({ "Key": keytoBind }, { "Key": keytoBind, "Active": "FALSE", "IP": "null", "Binded": userID, "Avatar": avatar });
            var member = guild.members.cache.get(userID);
            var role = guild.roles.cache.get("800593862380879893");
            member.roles.add(role);
            return "Key binded successfully. Welcome to Venetia!"
        }
    } else {
        return "Key does not exist."
    }
}

async function unbindKey(keytoBind, userID) {
    return "Unbinding is not allowed."
    var guild = discClient.guilds.cache.get("793870325523283978")
    const items = await db.collection('keys').findOne({ Key: keytoBind });
    if (items != null) {
        if (items.Binded === userID) {
            await db.collection('keys').replaceOne({ "Key": keytoBind }, { "Key": keytoBind, "Active": "FALSE", "IP": 'null', "Binded": "null", "Avatar": "null" });
            var x = await viewKeys(userID)
            if (x === "You have no keys binded.") {
                var member = guild.members.cache.get(userID);
                var role = guild.roles.cache.get("800593862380879893");
                member.roles.remove(role);
            }
            return "Key unbinded."
        } else
        if (items.Binded === "null") {
            return "Key has already been unbound."
        } else
        if (items.Binded != userID) {
            return "Key has already been binded."
        }
    } else {
        return "Key does not exist."
    }
}

async function resetKey(keytoBind, userID, avatar) {
    console.log(userID)
    avatar = avatar.split("webp")[0] + "png?size=2048"
    const items = await db.collection('keys').findOne({ Key: keytoBind });
    if (items != null) {
        if (items.Binded === userID) {
            await db.collection('keys').replaceOne({ "Key": keytoBind }, { "Key": keytoBind, "Active": "FALSE", "IP": 'null', "Binded": userID, "Avatar": avatar });
            return "Key reset."
        } else
        if (items.Binded != userID) {
            return "Key is binded to another account."
        }
    } else {
        return "Key does not exist."
    }
}

discClient.login("")


fastify.get("/api/reset", async(request, reply) => {
    const items = await db.collection('keys').findOne({ Key: request.query.key });
    if (items != null) {
        await db.collection('keys').replaceOne({ "Key": request.query.key }, { "Key": request.query.key, "Active": "FALSE", "IP": 'null', "Binded": items.Binded, "Avatar": items.Avatar });
        reply.send({ "reset": true })
    } else {
        reply.send({ "exists": false })
    }
});

fastify.get("/api/restocks/footlocker", async(request, reply) => {
    reply.code(200)
    reply.send(footlocker)
});

fastify.get("/api/restocks/champssports", async(request, reply) => {
    reply.code(200)
    reply.send(champs)
});

fastify.get("/api/restocks/eastbay", async(request, reply) => {
    reply.code(200)
    reply.send(eastbay)
});

fastify.get("/api/restocks/kidsfootlocker", async(request, reply) => {
    reply.code(200)
    reply.send(kidsftl)
});

fastify.get("/api/restocks/footaction", async(request, reply) => {
    reply.code(200)
    reply.send(footaction)
});

fastify.get("/api/restocks/footlockerca", async(request, reply) => {
    reply.code(200)
    reply.send(footlockerca)
});