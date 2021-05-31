const electron = require('electron');
const { ipcRenderer } = electron;
var path = require('path')
const SSENSETask = require(path.join(__dirname, '/modules/ssense.js'));
const FootsitesTask = require(path.join(__dirname, '/modules/footsites.js'));
const SupremeTask = require(path.join(__dirname, '/modules/supreme.js'));
const SupremeHybridTask = require(path.join(__dirname, '/modules/supremehybrid.js'));
const ShiekhTask = require(path.join(__dirname, '/modules/shiekh.js'));
const FederalPremiumTask = require(path.join(__dirname, '/modules/federalpremium.js'));
const ShopifyTask = require(path.join(__dirname, '/modules/shopify.js'));

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
    var shopify = [{
            site: "DTLR",
            base: "https://www.dtlr.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        },
        {
            site: "Shoe Palace",
            base: "https://www.shoepalace.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        },
        {
            site: "Union LA",
            base: "https://store.unionlosangeles.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        },
        {
            site: "Shop Nice Kicks",
            base: "https://shopnicekicks.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        },
        {
            site: "Bodega",
            base: "https://www.bdgastore.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        }, {
            site: "Kith",
            base: "https://kith.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        }, {
            site: "BBCIcecream",
            base: "https://www.bbcicecream.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        }, {
            site: "Packer Shoes",
            base: "https://packershoes.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        }, {
            site: "Bape",
            base: "https://us.bape.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        }, {
            site: "YCMC",
            base: "https://ycmc.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        },
        {
            site: "Social Status",
            base: "https://www.socialstatuspgh.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        },
        {
            site: "Above The Clouds",
            base: "https://www.abovethecloudsstore.com",
            sitekey: "6LeXJ7oUAAAAAHIpfRvgjs3lcJiO_zMC1LAZWlSz"
        }
    ]

    for (var i = 0; i < shopify.length; i++) {
        if (shopify[i].site === taskInfo.site) {
            taskInfo.baseLink = shopify[i].base
            taskInfo.sitekey = shopify[i].sitekey
            task = new ShopifyTask(taskInfo)
            break;
        }
    }

    if (taskInfo.site === "SSENSE" && taskInfo.mode.includes("Safe")) {
        task = new SSENSETask(taskInfo)
    }

    if (taskInfo.site === "SSENSE" && taskInfo.mode === "Fast") {
        task = new SSENSEFastTask(taskInfo)
    }

    if (taskInfo.site === "Shiekh") {
        task = new ShiekhTask(taskInfo)
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