const electron = require('electron');
const { ipcRenderer } = electron;
const configDir = (electron.app || electron.remote.app).getPath('userData');
var path = require('path')
const SSENSETask = require(path.join(__dirname, '/modules/ssense.js'));

const SSENSEFastTask = require(path.join(__dirname, '/modules/ssensefasttask.js'));
const FootsitesTask = require(path.join(__dirname, '/modules/footsites.js'));
const SupremeTask = require(path.join(__dirname, '/modules/supreme.js'));
const SupremeHybridTask = require(path.join(__dirname, '/modules/supremehybrid.js'));
const ShiekhTask = require(path.join(__dirname, '/modules/shiekh.js'));
const FederalPremiumTask = require(path.join(__dirname, '/modules/federalpremium.js'));
const ShopifyTask = require(path.join(__dirname, '/modules/shopify.js'));
const PacsunTask = require(path.join(__dirname, '/modules/pacsun.js'));

let taskArray = []

ipcRenderer.on('stopTask1', (event, taskNumber) => {
    for (var i = 0; i < taskArray.length; i++) {
        if (taskArray[i].returnID() === taskNumber.taskID) {
            taskArray[i].stopTask();
            taskArray.splice(i, 1);
        }
    }
});


ipcRenderer.on('taskinfo1', (event, taskInfo) => {
    var fs = require('fs');
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

    if (taskInfo.site === "SSENSE" && taskInfo.mode.includes("Safe")) {
        task = new SSENSETask(taskInfo)
    }

    if (taskInfo.site === "SSENSE" && taskInfo.mode.includes("Preload")) {
        task = new SSENSETask(taskInfo)
    }

    if (taskInfo.site === "SSENSE" && taskInfo.mode === "Fast") {
        task = new SSENSEFastTask(taskInfo)
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
});