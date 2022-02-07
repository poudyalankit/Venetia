const electron = require('electron');
const { ipcRenderer } = electron;
var path = require('path')
const configDir = (electron.remote.app).getPath('userData');
const storage = require('electron-json-storage');
storage.setDataPath(configDir + "/userdata")
const EthereumMintingTask = require(path.join(__dirname, '/modules/EthereumMintingTask.js'));

let taskArray = []

ipcRenderer.on('stopTask1', (event, taskNumber) => {
    for (var i = 0; i < taskArray.length; i++) {
        if (taskArray[i].returnID() === taskNumber.taskID) {
            taskArray[i].stopTask();
            taskArray.splice(i, 1);
        }
    }
});

ipcRenderer.on('message', (event, message) => {
    if (message.event == "startTasks") {
        var groups = storage.getSync("tasksV2")
        var taskObject = groups[message.data.groupUUID].tasks[message.data.taskUUID]
        taskObject.groupUUID = message.data.groupUUID
        if (taskObject.site === "Ethereum Contract") {
            task = new EthereumMintingTask(taskObject)
        }
        taskArray.push(task);
        task.initialize();
    }

    if (message.event === "stopTasks") {
        for (var i = 0; i < taskArray.length; i++) {
            if (taskArray[i].taskUUID === message.data.taskUUID) {
                taskArray[i].stop("Stopped")
            }
        }
    }
});