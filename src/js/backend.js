const electron = require('electron');
const { ipcRenderer } = electron;
var path = require('path')
const SSENSETask = require(path.join(__dirname, '/modules/ssense.js'));
const FootsitesTask = require(path.join(__dirname, '/modules/footsites.js'));
const SupremeTask = require(path.join(__dirname, '/modules/supreme.js'));
const SupremeHybridTask = require(path.join(__dirname, '/modules/supremehybrid.js'));
const ShiekhTask = require(path.join(__dirname, '/modules/shiekh.js'));
const FederalPremiumTask = require(path.join(__dirname, '/modules/federalpremium.js'));

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
    console.log(taskInfo)

    if (taskInfo.site === "SSENSE") {
        task = new SSENSETask(taskInfo)
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