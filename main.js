const electron = require('electron');

const { app, BrowserWindow, ipcMain, BrowserView, dialog, session } = require('electron')
var path = require('path')
const configDir = (electron.app).getPath('userData');
const isDev = require('electron-is-dev');
const storage = require('electron-json-storage');
storage.setDataPath(configDir + "/userdata")

app.commandLine.appendSwitch('disable-site-isolation-trials')


const { autoUpdater } = require("electron-updater")
const client = require('discord-rich-presence')('768276915651739678');
const fs = require('fs')
const fse = require('fs-extra')

const { fork } = require("child_process");


const express = require('express');
const captchaSharing = express();
captchaSharing.use(express.json())

async function checkMultipleInstances() {
    const got = require('got');
    try {
        let response = await got('http://localhost:4444/test')
        app.quit()
    } catch (error) {
        captchaSharing.listen(process.env.PORT || 4444, function() {
            console.log('server running on port 4444', '')
        });
    }
}


checkMultipleInstances()


var captchaQueue = []
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

captchaSharing.get("/test", async(req, res) => {
    res.send("test")
});

captchaSharing.get("/linkchange", async(req, res) => {
    if (req.query.storetype.toLowerCase() === "shopify") {
        var pathArray = req.query.input.split('/');
        var protocol = pathArray[0];
        var host = pathArray[2];
        var url = protocol + '//' + host;
        var shopify = storage.getSync("shopifyStores2")
        var customshopify = storage.getSync("shopifyStores")
        for (var i = 0; i < customshopify.length; i++) {
            shopify.push({
                site: customshopify[i].site,
                baseLink: customshopify[i].baseLink
            })
        }
        for (var i = 0; i < shopify.length; i++) {
            var pathArray = req.query.input.split('/');
            var protocol = pathArray[0];
            var host = pathArray[2];
            var url = protocol + '//' + host;
            if (url.toLowerCase() === shopify[i].baseLink.toLowerCase()) {
                win.focus()
                send({
                    event: "linkChange",
                    data: {
                        storeType: "Shopify",
                        newLink: req.query.input,
                        baseLink: url.toLowerCase()
                    }
                })
                res.send("Link change sent")
                break;
            }
        }
        res.send("Shopify store not found")
    }
});

captchaSharing.get("/quicktask", async(req, res) => {
    if (req.query.storetype.toLowerCase() === "shopify") {
        var shopify = storage.getSync("shopifyStores2")
        var customshopify = storage.getSync("shopifyStores")
        for (var i = 0; i < customshopify.length; i++) {
            shopify.push({
                site: customshopify[i].site,
                baseLink: customshopify[i].baseLink
            })
        }
        for (var i = 0; i < shopify.length; i++) {
            var pathArray = req.query.input.split('/');
            var protocol = pathArray[0];
            var host = pathArray[2];
            var url = protocol + '//' + host;
            if (url.toLowerCase() === shopify[i].baseLink.toLowerCase()) {
                win.webContents.send('quicktask', shopify[i].site, req.query.input)
                res.send("Task created successfully")
                break;
            }
        }
        res.send("Shopify store not found")
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



let win;

client.updatePresence({
    details: 'v0.5.1',
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
            devTools: false,
            spellcheck: false
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
        minWidth: 1255,
        minHeight: 780,
        backgroundColor: '#181a26',
        icon: path.join(__dirname, 'images/logo.png'),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            spellcheck: false,
            devTools: false
        }
    })
    win.openDevTools(true)
    win.loadFile('index.html');
    win.setMenuBarVisibility(false);
    fse.emptyDir(path.join(configDir, "logs"), err => {
        if (err) return console.error(err)
    })
    var captchas = storage.getSync("captchas")
    var uuids = []
    for (var i = 0; i < captchas.length; i++) {
        uuids.push(Object.keys(captchas[i])[0])
    }
    fs.readdirSync(path.join(configDir, "Partitions")).forEach(file => {
        if (uuids.includes(file) == false) {
            fse.remove(path.join(configDir, "Partitions", file), err => {
                if (err) return console.error(err)
            })
        }
    });


    win.on('closed', () => app.quit());
    fork(path.join(__dirname, 'taskRunner.js'), { env: { ATOM_SHELL_INTERNAL_RUN_AS_NODE: 0 } }, (error) => { console.log(error) });

    setInterval(function() {
        for (var i = 0; i < BrowserWindow.getAllWindows().length; i++) {
            if (BrowserWindow.getAllWindows()[i].readyToSolve != 'undefined' && BrowserWindow.getAllWindows()[i].readyToSolve && captchaQueue.length != 0) {
                BrowserWindow.getAllWindows()[i].webContents.send("message", {
                    event: "newCaptcha",
                    data: captchaQueue[0]
                })
                BrowserWindow.getAllWindows()[i].readyToSolve = false;
                captchaQueue.shift()
            }
        }
    }, 100);
}


const WebSocket = require("ws");
const backend = new WebSocket.Server({ port: 4445 })
let backendConnection;

function send(message) {
    backendConnection.send(JSON.stringify(message))
}

backend.on('connection', function(backend) {
    backendConnection = backend
    send({
        event: "setConfigDir",
        data: {
            configDir: configDir,
            isDev: isDev
        }
    })
    backend.on('message', function(message) {
        message = JSON.parse(message)
        if (message.event === "connected") {
            if (message.data.status == true)
                win.webContents.send('backendConnection', "Connected")
        }

        if (message.event === "taskStatus") {
            win.webContents.send('updateStatus', message.data.taskID, message.data.newStatus)
        }

        if (message.event === "taskProductTitle") {
            win.webContents.send('updateProductTitle', message.data.taskID, message.data.newTitle)
        }

        if (message.event === "sendCaptcha") {
            captchaQueue.push({
                "captchaType": message.data.captchaType,
                "captchaURL": message.data.captchaURL,
                "sessionCookies": message.data.sessionCookies,
                "taskID": message.data.taskID,
                "taskProxy": message.data.taskProxy,
                "siteURL": message.data.siteURL
            })
        }
    });
    backend.on('close', function() {
        win.webContents.send('backendConnection', "Disconnected")
    });
});


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

ipcMain.on('message', (event, message) => {
    if (message.event === "editTasks") {
        send({
            event: "editTasks",
            data: {
                changedTasks: message.data.changedTasks,
                changedFields: message.data.changedFields
            }
        })
    }


    if (message.event === "restartBackend") {
        send({
            event: "killBackend"
        })
        setTimeout(function() {
            fork(path.join(__dirname, 'taskRunner.js'), { env: { ATOM_SHELL_INTERNAL_RUN_AS_NODE: 0 } }, (error) => { console.log(error) });
        }, 1500);
    }

    if (message.event === "finishedCaptcha") {
        send({
            event: "finishedCaptcha",
            data: {
                taskID: message.data.taskID,
                captchaInfo: message.data.captchaInfo
            }
        })
    }

    if (message.event === "transferCaptcha") {
        captchaQueue.push({
            "captchaType": message.data.captchaType,
            "captchaURL": message.data.captchaURL,
            "sessionCookies": message.data.sessionCookies,
            "taskID": message.data.taskID,
            "taskProxy": message.data.taskProxy,
            "siteURL": message.data.siteURL
        })
    }

    if (message.event === "deleteHarvester") {
        for (var i = 0; i < BrowserWindow.getAllWindows().length; i++) {
            if (typeof BrowserWindow.getAllWindows()[i].uuid != 'undefined' && BrowserWindow.getAllWindows()[i].uuid === message.data.uuid)
                BrowserWindow.getAllWindows()[i].close()
        }
    }

    if (message.event === "signInHarvester") {
        console.log(message.data.harvesterProxy)
        var sess2 = session.fromPartition('persist:' + message.data.uuid);
        if (message.data.harvesterProxy != "") {
            var x = message.data.harvesterProxy.split(":")
            if (x.length == 2)
                sess2.setProxy({ proxyRules: "http://" + message.data.harvesterProxy })
            else if (x.length == 4) {
                proxyUsername = x[2]
                proxyPassword = x[3]
                var newProxy = x[0] + ":" + x[1]
                sess2.setProxy({ proxyRules: "http://" + newProxy })
            }
        } else {
            sess2.setProxy({ proxyRules: null })
        }

        var harvester = new BrowserWindow({
            width: 405,
            height: 600,
            icon: path.join(__dirname, 'images/logo.png'),
            webPreferences: {
                devTools: false
            }
        })
        const view2 = new BrowserView({
            webPreferences: {
                session: sess2,
                devTools: false
            }
        })
        harvester.openDevTools(true)
        harvester.setResizable(false)
        harvester.setMenuBarVisibility(false)
        view2.webContents.openDevTools()
        view2.setBackgroundColor("#181a26")
        harvester.setBrowserView(view2)
        view2.setBounds({ x: 0, y: 0, width: 405, height: 500 })
        view2.webContents.loadURL('https://accounts.google.com', {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1'
        })
        harvester.uuid = message.data.uuid
    }

    if (message.event === "launchHarvester") {
        var isOpen = false;
        for (var i = 0; i < BrowserWindow.getAllWindows().length; i++) {
            if (typeof BrowserWindow.getAllWindows()[i].uuid != 'undefined' && BrowserWindow.getAllWindows()[i].uuid === message.data.uuid)
                isOpen = true;
        }
        if (isOpen == false) {
            var sess = session.fromPartition('persist:' + message.data.uuid);
            if (message.data.harvesterProxy != "") {
                var x = message.data.harvesterProxy.split(":")
                if (x.length == 2)
                    sess.setProxy({ proxyRules: "http://" + message.data.harvesterProxy })
                else if (x.length == 4) {
                    proxyUsername = x[2]
                    proxyPassword = x[3]
                    var newProxy = x[0] + ":" + x[1]
                    sess.setProxy({ proxyRules: "http://" + newProxy })
                }
            } else {
                sess.setProxy({ proxyRules: null })
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
            harvester.loadFile("captchaHandler.html")
            harvester.openDevTools(true)
            harvester.setMenuBarVisibility(false)
            harvester.setResizable(false)
            view2.webContents.openDevTools()
            view2.setBackgroundColor("#181a26")
            harvester.setBrowserView(view2)
            view2.setBounds({ x: 0, y: 80, width: 405, height: 520 })
            harvester.harvesterName = message.data.harvesterName;
            harvester.harvesterType = message.data.harvesterType
            harvester.readyToSolve = false;
            harvester.uuid = message.data.uuid
            harvester.taskID = ""
        }
    }
});


ipcMain.on('taskinfo', (event, taskInfo) => {
    var groups = storage.getSync('tasks')
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
    if (taskInfo.size.includes(",")) {
        taskInfo.size = taskInfo.size.split(",").sample().trim()
    }

    send({
        event: "taskInfo",
        taskInfo: taskInfo
    })
});

ipcMain.on('startQT', (event, taskInfo) => {
    send({
        event: "taskInfo",
        taskInfo: taskInfo
    })
});


ipcMain.on('stopTask', (event, taskID) => {
    for (var i = 0; i < BrowserWindow.getAllWindows().length; i++) {
        if (BrowserWindow.getAllWindows()[i].taskID === taskID.taskID)
            BrowserWindow.getAllWindows()[i].getBrowserView(0).webContents.loadFile("harvester.html")
    }
    for (var i = 0; i < captchaQueue.length; i++) {
        if (captchaQueue[i].taskID === taskID.taskID)
            captchaQueue.splice(i, 1)
    }
    send({
        event: "stopTask",
        data: {
            taskID: taskID.taskID
        }
    })
});


ipcMain.on('reverify', (event, key) => {
    const got = require('got');
    got({
        method: 'get',
        url: "https://venetiabots.com/api/activate?key=" + key,
        headers: {
            version: "0.5.1"
        },
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
        headers: {
            version: "0.5.1"
        },
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