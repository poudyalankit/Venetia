const { app, BrowserWindow, ipcMain, BrowserView, dialog, protocol, session } = require('electron')
const { autoUpdater } = require("electron-updater")
const electron = require('electron');
const client = require('discord-rich-presence')('768276915651739678');
const fs = require('fs')
var path = require('path')
const configDir = (electron.app).getPath('userData');
const express = require('express');
const captchaSharing = express();
captchaSharing.use(express.json())

async function checkMultipleInstances() {
    const got = require('got');
    try {
        let response = await got('http://localhost:4444/toastyaio/datadome')
        app.quit()
    } catch (error) {
        captchaSharing.listen(process.env.PORT || 4444, function() {
            console.log('server running on port 4444', '')
        });
    }
}


checkMultipleInstances()


var cookieBank = []

var captchaQueue = []
var solvedCaptchas = []

var proxyUsername;
var proxyPassword;

autoUpdater.setFeedURL('https://venetiabots.com/update/download')

ipcMain.on('update', (event) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Close'],
        title: 'Checking for updates',
        detail: 'Checking for the latest update. Please standby.'
    }

    dialog.showMessageBox(dialogOpts)
    autoUpdater.checkForUpdates()
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart'],
        title: 'Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart now to complete the update.'
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
})


autoUpdater.on('update-not-available', () => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Close'],
        title: 'Update',
        detail: 'You are on the latest version.'
    }

    dialog.showMessageBox(dialogOpts)
});

autoUpdater.on('error', message => {
    console.error('There was a problem updating the application')
    console.error(message)
})


captchaSharing.post("/venetia/addtoQueue", async(req, res) => {
    var id = makeid(5)
    req.body.sessionCookies = req.body.sessionCookies.cookies
    captchaQueue.push({
        "captchaType": req.body.captchaType,
        "siteURL": req.body.siteURL,
        "sessionCookies": req.body.sessionCookies,
        "id": id,
        "taskProxy": req.body.taskProxy
    })
    res.json({
        "id": id
    })
});

captchaSharing.get("/quicktask", async(req, res) => {
    if (req.query.storetype.toLowerCase() === "shopify") {
        var shopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores2.json'), { encoding: 'utf8', flag: 'r' }));
        var customshopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores.json'), { encoding: 'utf8', flag: 'r' }));
        for (var i = 0; i < customshopify.length; i++) {
            shopify.push({
                site: customshopify[i].site,
                baseLink: customshopify[i].baseLink
            })
        }
        for (var i = 0; i < shopify.length; i++) {
            if (req.query.input.split("/cart")[0].toLowerCase() === shopify[i].baseLink.toLowerCase()) {
                win.webContents.send('quicktask', shopify[i].site, req.query.input)
                res.send("Task created successfully")
                break;
            }
        }
    } else if (req.query.storetype.toLowerCase() === "shiekh") {
        win.webContents.send('quicktask', "Shiekh", req.query.input)
        res.send("Task created successfully")
    } else if (req.query.storetype.toLowerCase() === "federalpremium") {
        win.webContents.send('quicktask', "Federal Premium", req.query.input)
        res.send("Task created successfully")
    } else if (req.query.storetype.toLowerCase() === "ssense") {
        win.webContents.send('quicktask', "SSENSE", req.query.input)
        res.send("Task created successfully")
    } else if (req.query.storetype.toLowerCase() === "footsites") {
        if (req.query.input.toLowerCase().includes("kidsfootlocker.com"))
            var store = "KidsFootLocker"
        else if (req.query.input.toLowerCase().includes("footlocker.ca"))
            var store = "FootLockerCA"
        else if (req.query.input.toLowerCase().includes("footlocker.com"))
            var store = "FootLocker"
        else if (req.query.input.toLowerCase().includes("champssports.com"))
            var store = "ChampsSports"
        else if (req.query.input.toLowerCase().includes("footaction.com"))
            var store = "FootAction"
        else if (req.query.input.toLowerCase().includes("eastbay.com"))
            var store = "EastBay"

        win.webContents.send('quicktask', store, req.query.input)
        res.send("Task created successfully")
    } else
        res.send("Site not available for quick tasks")
});

captchaSharing.get("/venetia/solvedCaptchas", async(req, res) => {
    if (typeof req.query.id != 'undefined') {
        for (var i = 0; i < solvedCaptchas.length; i++) {
            if (solvedCaptchas[i].id === req.query.id) {
                res.json(solvedCaptchas[i])
                solvedCaptchas.splice(i, 1)
            }
        }
    }
    res.json({
        "completed": false
    })
});

captchaSharing.post("/venetia/addToSolvedCaptchas", async(req, res) => {
    solvedCaptchas.push({
        "captchaResponse": req.body.captchaResponse,
        "completed": true,
        "id": req.body.id,
        "cookies": req.body.cookies
    })
    for (var i = 0; i < captchaQueue.length; i++) {
        if (captchaQueue[i].id === req.body.id) {
            captchaQueue.splice(i, 1)
            break;
        }
    }
    res.send("done")
});

captchaSharing.get("/venetia/viewCaptchaQueue", async(req, res) => {
    var alreadyTaken = []
    for (var j = 0; j < captchaQueue.length; j++) {
        if (typeof captchaQueue[j].windowid != 'undefined') {
            alreadyTaken.push(captchaQueue[j].windowid)
        }
    }
    for (var i = 0; i < captchaQueue.length; i++) {
        if (typeof captchaQueue[i].windowid === 'undefined') {
            captchaQueue[i].windowid = req.query.windowid
            res.json(captchaQueue[i])
            break;
        }
    }

    res.json({
        "message": "No captchas available to solve"
    })
});

captchaSharing.get("/venetia/searchByWindowID", async(req, res) => {
    for (var i = 0; i < captchaQueue.length; i++) {
        if (typeof captchaQueue[i].windowid != 'undefined' && captchaQueue[i].windowid === req.query.windowid) {
            res.json(captchaQueue[i])
        }
    }
    res.json([])
});


captchaSharing.get("/toastyaio/datadome", async(req, res) => {
    res.json(cookieBank)
});


captchaSharing.get("/toastyaio/addCookie", async(req, res) => {
    cookieBank.push({ cookie: req.query.cookie, uses: 0 })
    res.send("added")
});

captchaSharing.get("/toastyaio/addUse", async(req, res) => {
    for (var i = 0; i < cookieBank.length; i++) {
        if (cookieBank[i].cookie === req.query.cookie) {
            cookieBank[i].uses = cookieBank[i].uses + 1;
        }
    }
    res.send("added")
});


setInterval(function() {
    for (var i = 0; i < cookieBank.length; i++) {
        if (cookieBank[i].uses > 20)
            cookieBank.splice(i, 1);
    }
}, 5000);



let taskArray = []


let win;

client.updatePresence({
    details: 'v0.4.7',
    startTimestamp: Date.now(),
    largeImageKey: "venetia",
    largeImageText: "Venetia",
    instance: true,
});

function keyAuth() {
    keyAuthWindow = new BrowserWindow({
        width: 682,
        height: 366,
        backgroundColor: '#181a26',
        icon: path.join(__dirname, 'images/logo.png'),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: false
        }
    })
    keyAuthWindow.openDevTools(true)
    keyAuthWindow.loadFile('auth.html');
    keyAuthWindow.setMenuBarVisibility(false);
    keyAuthWindow.setResizable(false);

}

function createWindow() {
    win = new BrowserWindow({
        width: 1255,
        height: 780,
        backgroundColor: '#181a26',
        icon: path.join(__dirname, 'images/logo.png'),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: false
        }
    })
    win.openDevTools(true)
    win.loadFile('index.html');
    win.setMenuBarVisibility(false);
    win.setResizable(false);
    win.on('closed', () => app.quit());

    backendA = new BrowserWindow({
        width: 200,
        height: 50,
        backgroundColor: '#181a26',
        icon: path.join(__dirname, 'images/logo.png'),
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: false
        }
    })
    backendA.openDevTools(true)
    backendA.loadFile('backend.html');
    backendA.setMenuBarVisibility(false);
    backendA.setResizable(false);


    backendB = new BrowserWindow({
        width: 200,
        height: 50,
        backgroundColor: '#181a26',
        icon: path.join(__dirname, 'images/logo.png'),
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: false
        }
    })
    backendB.openDevTools(true)
    backendB.loadFile('backend.html');
    backendB.setMenuBarVisibility(false);
    backendB.setResizable(false);
}

var backendArray = ['backendA', 'backendB']

app.whenReady(() => {
    app.allowRendererProcessReuse = false;
})

app.whenReady().then(keyAuth)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        keyAuth()
    }
})

app.on('login', (event, webContents, request, authInfo, callback) => {
    callback(proxyUsername, proxyPassword);
});

ipcMain.on('authHarvesterProxy', (event, harvesterID, harvesterProxy, proxyAuth) => {
    proxyUsername = proxyAuth.split(":")[0]
    proxyPassword = proxyAuth.split(":")[1]
    var harvestertochange = BrowserWindow.fromId(harvesterID)
    harvestertochange.getBrowserView(0).webContents.session.setProxy({
        proxyRules: "http://" + harvesterProxy
    })
});

ipcMain.on('updateStatus1', (event, taskID, status) => {
    win.webContents.send('updateStatus', taskID, status)
});

ipcMain.on('updateProductTitle1', (event, taskID, title) => {
    win.webContents.send('updateProductTitle', taskID, title)
});

ipcMain.on('taskinfo', (event, taskInfo) => {
    var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    taskInfo = {
        "id": taskInfo.taskID,
        "site": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['site'],
        "mode": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['mode'],
        "product": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['product'],
        "size": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['size'],
        "profile": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['profile'],
        "proxies": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['proxies'],
        "accounts": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['accounts'],
        "schedule": {
            "hour": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['schedule']['hour'],
            "minute": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['schedule']['minute'],
            "second": groups[taskInfo.groupIndex][taskInfo.groupName][taskInfo.taskIndex][taskInfo.taskID]['schedule']['second']
        }
    }
    var x = backendArray.sample()
    console.log(x)
    if (x === 'backendA')
        backendA.webContents.send('taskinfo1', taskInfo)
    else if (x === 'backendB')
        backendB.webContents.send('taskinfo1', taskInfo)
});

ipcMain.on('startQT', (event, taskInfo) => {
    var x = backendArray.sample()
    if (x === 'backendA')
        backendA.webContents.send('taskinfo1', taskInfo)
    else if (x === 'backendB')
        backendB.webContents.send('taskinfo1', taskInfo)
});



ipcMain.on('stopTask', (event, taskNumber) => {
    backendA.webContents.send('stopTask1', taskNumber)
    backendB.webContents.send('stopTask1', taskNumber)
});



ipcMain.on('reverify', (event, key) => {
    const got = require('got');
    got({
        method: 'get',
        url: "https://venetiabots.com/api/activate?key=" + key,
        responseType: 'json'
    }).then(response => {
        if (response.body.exists === "false") {
            app.quit()
        } else if (response.body.activated === "true" && response.body.ipMatch === "false") {
            app.quit()
        } else if (response.body.activated === "false") {
            app.quit()
        }
    }).catch(error => {
        console.log(error)
        app.quit()
    })
});


ipcMain.on('verify', (event, key) => {
    const got = require('got');
    got({
        method: 'get',
        url: "https://venetiabots.com/api/activate?key=" + key,
        responseType: 'json'
    }).then(response => {
        if (response.body.activated === "true" && response.body.ipMatch === "true") {
            createWindow()
            keyAuthWindow.close()
        } else
        if (response.body.activated === "false") {
            createWindow()
            keyAuthWindow.close()
        } else if (response.body.exists === "false")
            keyAuthWindow.webContents.send("alert", "Key does not exist.")
        else if (response.body.activated === "true" && response.body.ipMatch === "false")
            keyAuthWindow.webContents.send("alert", "Key active on another IP.")
    }).catch(error => {
        console.log(error)
        app.quit()
    })
});


ipcMain.on('launchHarvester', function(event, harvesterName, harvesterProxy) {
    var sess = session.fromPartition('persist:' + harvesterName);
    if (harvesterProxy != "") {
        var x = harvesterProxy.split(":")
        if (x.length == 2)
            sess.setProxy({ proxyRules: "http://" + harvesterProxy })
        else if (x.length == 4) {
            proxyUsername = x[2]
            proxyPassword = x[3]
            var newProxy = x[0] + ":" + x[1]
            sess.setProxy({ proxyRules: "http://" + newProxy })
        }
    } else {
        sess.setProxy({ proxyRules: "" })
    }

    var harvester = new BrowserWindow({
        frame: false,
        width: 405,
        height: 600,
        backgroundColor: '#181a26',
        icon: path.join(__dirname, 'images/logo.png'),
        webPreferences: {
            devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true

        }
    })
    const view2 = new BrowserView({
        webPreferences: {
            enableRemoteModule: true,
            webSecurity: false,
            session: sess,
            devTools: false
        }
    })
    harvester.loadFile("harvesterBackScreen.html")
    harvester.openDevTools(true)
    harvester.setMenuBarVisibility(false)
    harvester.setResizable(false)
    view2.webContents.openDevTools()
    view2.setBackgroundColor("#181a26")
    harvester.setBrowserView(view2)
    view2.setBounds({ x: 0, y: 25, width: 405, height: 500 })
    view2.webContents.loadFile('harvester.html')
});

ipcMain.on('googleSignIn', function(event, harvesterName, harvesterProxy) {
    var sess2 = session.fromPartition('persist:' + harvesterName);
    if (harvesterProxy != "") {
        var x = harvesterProxy.split(":")
        if (x.length == 2)
            sess2.setProxy({ proxyRules: "http://" + harvesterProxy })
        else if (x.length == 4) {
            proxyUsername = x[2]
            proxyPassword = x[3]
            var newProxy = x[0] + ":" + x[1]
            sess2.setProxy({ proxyRules: "http://" + newProxy })
        }
    } else {
        sess2.setProxy({ proxyRules: "" })
    }
    var harvester = new BrowserWindow({
        width: 405,
        height: 600,
        icon: path.join(__dirname, 'images/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            webSecurity: false,
            session: sess2,
            devTools: false
        }
    })

    harvester.setMenuBarVisibility(false)
    harvester.setResizable(false)
    harvester.loadURL('https://accounts.google.com', { userAgent: 'Chrome' })

});
Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
}
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}