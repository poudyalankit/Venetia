const electron = require('electron');

const { app, BrowserWindow, ipcMain, BrowserView, dialog, session } = require('electron')
const isDev = require('electron-is-dev');
var path = require('path')
const { machineId, machineIdSync } = require('node-machine-id');
const configDir = (electron.app).getPath('userData');
const storage = require('electron-json-storage');
storage.setDataPath(configDir + "/userdata")
app.commandLine.appendSwitch('disable-site-isolation-trials')

const { autoUpdater } = require("electron-updater")
const client = require('discord-rich-presence')('768276915651739678');
const fs = require('fs')
const fse = require('fs-extra')

const express = require('express');
const instance = express();
instance.use(express.json())

async function checkMultipleInstances() {
    const got = require('got');
    try {
        let response = await got('http://localhost:4444/test')
        app.quit()
    } catch (error) {
        instance.listen(process.env.PORT || 4444, function() {
            console.log('server running on port 4444', '')
        });
    }
}


checkMultipleInstances()

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



let win;

client.updatePresence({
    details: 'v1.0.0',
    startTimestamp: Date.now(),
    largeImageKey: "venetia",
    largeImageText: "Venetia",
    instance: true,
});

function keyAuth() {
    keyAuthWindow = new BrowserWindow({
        width: 435,
        height: 250,
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

    win.on('closed', () => app.quit());

    backend = new BrowserWindow({
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
    backend.openDevTools(true)
    backend.loadFile('backend.html');
    backend.setMenuBarVisibility(false);
    backend.setResizable(false);
}

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


ipcMain.on('message', (event, message) => {
    if (message.event == "startTasks") {
        backend.webContents.send("message", message)
    }

    if (message.event == "stopTasks") {
        backend.webContents.send("message", message)
    }

    if (message.event == "statusUpdate") {
        win.webContents.send("message", message)
    }

    if (message.event == "stopTask") {
        win.webContents.send("message", message)
    }
});

ipcMain.on('reverify', (event, key) => {
    const got = require('got');
    machineId().then((id) => {
        got({
            method: 'get',
            url: "https://venetiabots.com/api/activate?key=" + key,
            headers: {
                version: "1.0.0",
                hwid: id
            },
            responseType: 'json'
        }).then(response => {
            if (response.body.exists === "false")
                throw "Error"
        }).catch(error => {
            console.log(error)
            app.quit()
        })
    })
});


ipcMain.on('verify', (event, key) => {
    const got = require('got');
    machineId().then((id) => {
        got({
            method: 'get',
            url: "https://venetiabots.com/api/activate?key=" + key,
            headers: {
                version: "1.0.0",
                hwid: id
            },
            responseType: 'json'
        }).then(response => {
            if (response.body.exists === "true") {
                createWindow()
                keyAuthWindow.close()
            } else if (response.body.exists === "false")
                keyAuthWindow.webContents.send("alert", "Key does not exist.")
        }).catch(error => {
            console.log(error)
            app.quit()
        })
    })

});