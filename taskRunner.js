const WebSocket = require("ws");
const frontend = new WebSocket("ws://localhost:4443");
const path = require('path')

let configDir;
let taskArray = []

let ShopifyTask;
let FootsitesTask;
let SSENSETask;
let ShiekhTask;
let FederalPremiumTask;
let WalmartTask;
let DSGTask;


function send(message) {
    frontend.send(JSON.stringify(message))
}

frontend.on('open', function() {
    send({
        event: "connected",
        data: {
            status: true
        }
    })
});

frontend.on('close', function() {
    for (var i = 0; i < taskArray.length; i++) {
        taskArray[i].stopTask();
        taskArray.splice(i, 1);
    }
});


function requireFromString(src, filename) {
    var m = new module.constructor();
    m.paths = module.paths;
    m._compile(src, filename);
    return m.exports;
}

frontend.on('message', function(message) {
    message = JSON.parse(message)

    if (message.event === "finishedCaptcha") {
        for (var i = 0; i < taskArray.length; i++) {
            if (taskArray[i].returnID() === message.data.taskID)
                taskArray[i].sendCaptchaInfo(message.data.captchaInfo)
        }
    }

    if (message.event === "killBackend") {
        for (var i = 0; i < taskArray.length; i++) {
            taskArray[i].stopTask();
            taskArray.splice(i, 1);
        }
        setTimeout(function() {
            process.exit()
        }, 1000);
    }

    if (message.event === "setConfigDir") {
        configDir = message.data.configDir
        const path = require('path')
        const fs = require('fs')
        let key = fs.readFileSync(path.join(configDir, '/userdata/key.txt'), 'utf8');
        const got = require('got')
            /* if (message.data.isDev == true) {
                 ShopifyTask = require(path.join(__dirname, '../', "Backend", "shopify.js"));
                 SSENSETask = require(path.join(__dirname, '../', "Backend", "ssense.js"));
                 FootsitesTask = require(path.join(__dirname, '../', "Backend", "footsites.js"));
                 ShiekhTask = require(path.join(__dirname, '../', "Backend", "shiekh.js"));
                 FederalPremiumTask = require(path.join(__dirname, '../', "Backend", "federalpremium.js"));
                 WalmartTask = require(path.join(__dirname, '../', "Backend", "walmart.js"));
                 DSGTask = require(path.join(__dirname, '../', "Backend", "dsg.js"));
             } else {*/
        got({
            method: 'get',
            url: "https://venetiabots.com/api/loadShop?key=" + key,
            headers: { 'user-agent': "Venetia Dont Crack" }
        }).then(response => {
            ShopifyTask = requireFromString(response.body, "shop")
        })
        got({
            method: 'get',
            url: "https://venetiabots.com/api/loadSS?key=" + key,
            headers: { 'user-agent': "Venetia Dont Crack" }
        }).then(response => {
            SSENSETask = requireFromString(response.body, "ssense")
        })
        got({
            method: 'get',
            url: "https://venetiabots.com/api/loadDSG?key=" + key,
            headers: { 'user-agent': "Venetia Dont Crack" }
        }).then(response => {
            DSGTask = requireFromString(response.body, "dsg")
        })
        got({
            method: 'get',
            url: "https://venetiabots.com/api/loadFoo?key=" + key,
            headers: { 'user-agent': "Venetia Dont Crack" }
        }).then(response => {
            FootsitesTask = requireFromString(response.body, "foots")
        })
        got({
            method: 'get',
            url: "https://venetiabots.com/api/loadShi?key=" + key,
            headers: { 'user-agent': "Venetia Dont Crack" }
        }).then(response => {
            ShiekhTask = requireFromString(response.body, "shi")
        })
        got({
            method: 'get',
            url: "https://venetiabots.com/api/loadFP?key=" + key,
            headers: { 'user-agent': "Venetia Dont Crack" }
        }).then(response => {
            FederalPremiumTask = requireFromString(response.body, "fp")
        })
        got({
            method: 'get',
            url: "https://venetiabots.com/api/loadWM?key=" + key,
            headers: { 'user-agent': "Venetia Dont Crack" }
        }).then(response => {
            WalmartTask = requireFromString(response.body, "walm")
        })

        // }
    }

    if (message.event === "stopTask") {
        for (var i = 0; i < taskArray.length; i++) {
            if (taskArray[i].returnID() === message.data.taskID) {
                taskArray[i].stopTask();
                taskArray.splice(i, 1);
            }
        }
    }

    if (message.event === "taskInfo") {
        var fs = require('fs');
        let taskInfo = message.taskInfo
        taskInfo.configDir = configDir
        taskInfo.connection = frontend
        var shopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores2.json'), { encoding: 'utf8', flag: 'r' }));
        var customshopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores.json'), { encoding: 'utf8', flag: 'r' }));

        for (var i = 0; i < shopify.length; i++) {
            if (shopify[i].site === taskInfo.site) {
                taskInfo.baseLink = shopify[i].baseLink
                task = new ShopifyTask(taskInfo)
                break;
            }
        }

        for (var i = 0; i < customshopify.length; i++) {
            if (customshopify[i].site === taskInfo.site) {
                taskInfo.baseLink = customshopify[i].baseLink
                taskInfo.site = "Custom (Shopify)"
                task = new ShopifyTask(taskInfo)
                break;
            }
        }

        if (taskInfo.site === "SSENSE") {
            task = new SSENSETask(taskInfo)
        }


        if (taskInfo.site === "Dicks") {
            task = new DSGTask(taskInfo)
        }


        if (taskInfo.site === "Walmart") {
            task = new WalmartTask(taskInfo)
        }


        if (taskInfo.site === "Shiekh") {
            task = new ShiekhTask(taskInfo)
        }

        if (taskInfo.site === "Pacsun") {
            task = new PacsunTask(taskInfo)
        }


        if (taskInfo.site === "Federal Premium") {
            task = new FederalPremiumTask(taskInfo)
        }

        if (taskInfo.site === "FootLocker") {
            task = new FootsitesTask(taskInfo)
        }
        if (taskInfo.site === "ChampsSports") {
            task = new FootsitesTask(taskInfo)
        }
        if (taskInfo.site === "FootAction") {
            task = new FootsitesTask(taskInfo)
        }
        if (taskInfo.site === "EastBay") {
            task = new FootsitesTask(taskInfo)
        }
        if (taskInfo.site === "KidsFootLocker") {
            task = new FootsitesTask(taskInfo)
        }
        if (taskInfo.site === "LadyFootLocker") {
            task = new FootsitesTask(taskInfo)
        }
        if (taskInfo.site === "FootLockerCA") {
            task = new FootsitesTask(taskInfo)
        }

        if (taskInfo.site === "Supreme" && taskInfo.mode === "Restock") {
            task = new SupremeTask(taskInfo)
        }

        if (taskInfo.site === "Supreme" && taskInfo.mode === "Hybrid") {
            task = new SupremeHybridTask(taskInfo)
        }

        taskArray.push(task);
        task.initialize();
    }
});