const electron = require('electron');


const { ipcRenderer } = electron;
var path = require('path')
const { v4: uuidv4 } = require('uuid');

const configDir = (electron.app || electron.remote.app).getPath('userData');

var fs = require('fs');
var SlimSelect = require('slim-select')


var statusCache = {}
var iconCache = {}

if (!fs.existsSync(configDir + "/userdata")) {
    fs.mkdirSync(configDir + "/userdata");
}

const storage = require('electron-json-storage');
storage.setDataPath(configDir + "/userdata")


const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
}


function deactivateKey() {
    const got = require('got');
    var key = fs.readFileSync(path.join(configDir, '/userdata/key.txt'), 'utf8');
    got({
        method: "get",
        url: "https://venetiabots.com/api/reset?key=" + key
    }).then(response => {
        closeIt()
    })
}


function filterGroups() {
    var input, filter;
    input = document.getElementById("filterGroups");
    filter = input.value.toUpperCase();

    for (i = 0; i < document.getElementById("groups").rows.length; i++) {
        if (document.getElementById("groups").rows[i].cells[0].children[0].value.toUpperCase().indexOf(filter) > -1) {
            document.getElementById("groups").rows[i].style.display = "";
        } else {
            document.getElementById("groups").rows[i].style.display = "none";
        }

    }
}


function deleteGroup(uuid) {
    var group = document.querySelector('[uuid="' + uuid + '"]')
    var x = storage.getSync('tasksV2');
    delete x[uuid]
    if (group.classList.contains("groupFocused")) document.getElementById("taskContainer").innerHTML = "";
    storage.set('tasksV2', x, function(error) {
        if (error) throw error;
    });
    group.remove()
}



function deleteWallet(uuid) {
    var wallet = document.querySelector('[uuid="' + uuid + '"]')
    var x = storage.getSync('wallets');
    delete x[uuid]
    storage.set('wallets', x, function(error) {
        if (error) throw error;
    });
    wallet.remove()
}


function deleteNetwork(uuid) {
    var network = document.querySelector('[uuid="' + uuid + '"]')
    var x = storage.getSync('networks');
    delete x[uuid]
    storage.set('networks', x, function(error) {
        if (error) throw error;
    });
    network.remove()
}


function modeChoices() {
    if (document.getElementById("siteTask").value === "Ethereum Contract") {
        var select = document.getElementById("modeTask")
        select.options.length = 0;
        select.options[select.options.length] = new Option("Normal", "Normal");
        select.options[select.options.length] = new Option("Contract Monitor", "Contract Monitor");
    }
}

function readFunction() {
    if (document.getElementById("modeTask").value === "Normal") {
        readFunctionTask.disable()
    }

    if (document.getElementById("modeTask").value === "Contract Monitor") {
        readFunctionTask.enable()
    }
}

function max() {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.maximize();
}

function minimize() {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.minimize();
}

function closeIt() {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.close();
}

function taskEditor() {
    if (document.getElementById('groups').rows.length > 0) {
        siteTask2.set()
        modeTask2.set()
        document.getElementById("linkTask2").value = ""
        profileTask2.set([])
        proxyTask2.set()
        accountTask2.set()
        sizeTask2.set([])
        document.getElementById("darkenBackground").style.display = "block";
        document.getElementById("taskEditor").style.display = "block";
    }
}

function update() {
    ipcRenderer.send('update')
}


function reverify() {
    fs.readFile(path.join(configDir, '/userdata/key.txt'), 'utf-8', (err, data) => {
        if (err) throw err;
        var key = data;
        ipcRenderer.send('reverify', key)
    });
}


function handleNonLeftClick(e) {
    if (e.button === 1) {
        e.preventDefault();
    }
}

function stopOpen(e) {
    if (e.button === 0 && e.ctrlKey) {
        e.preventDefault();
    }
}

var siteTask;
var readFunctionTask;
var profileTask;

window.onload = function() {
    reverify()
    setInterval(reverify, 20000)
    document.getElementById("settingsIcon").style.transition = "0.3s"
    document.getElementById("taskIcon").style.transition = "0.3s"
    document.getElementById("walletsIcon").style.transition = "0.3s"
    document.getElementById("analyticsIcon").style.transition = "0.3s"
    document.getElementById("networksIcon").style.transition = "0.3s"

    document.addEventListener("auxclick", handleNonLeftClick);
    document.addEventListener("click", stopOpen);

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault()
        }

        if (document.getElementById('taskView').style.display === "block") {

            if (event.ctrlKey && event.key === 'g') {
                if (document.getElementById("taskCreator").style.display != "block")
                    cloneSelected()
            }
            if (event.ctrlKey && event.key === 't') {
                if (document.getElementById("taskCreator").style.display != "block")
                    addGroup()
            }
            if (event.ctrlKey && event.key === 'w') {
                event.preventDefault()
                if (document.getElementById("taskCreator").style.display != "block")
                    deleteGroup()
                else if (document.getElementById("taskCreator").style.display != "none")
                    closeModal(event)
            }
            if (event.ctrlKey && event.key === 'q') {
                if (document.getElementById('createButton').disabled === false)
                    taskCreator()
            }
            if (event.ctrlKey && event.key === 'x') {
                if (document.getElementById("taskCreator").style.display != "block")
                    stopSelected()
            }
            if (event.ctrlKey && event.key === 'z') {
                if (document.getElementById("taskCreator").style.display != "block")
                    startSelected()
            }
            if (event.ctrlKey && event.key === 'd') {
                if (document.getElementById("taskCreator").style.display != "block")
                    deleteSelected()
            }
            if (event.ctrlKey && event.key === 's') {
                if (document.getElementById("taskCreator").style.display != "block") {
                    if (document.getElementById("taskContainer").children.length > 0)
                        deselectAll()
                }
            }
            if (event.ctrlKey && event.key === 'a') {
                if (document.activeElement.tagName != "INPUT") {
                    event.preventDefault()
                    if (document.getElementById("taskCreator").style.display != "block") {
                        if (document.getElementById("taskContainer").children.length > 0)
                            selectAll()
                    }
                }
            }
        }
    });


    window.$ = window.jQuery = require('jquery');
    const shell = require('electron').shell;



    $(document).on('click', 'a[href^="http"]', function(event) {
        event.preventDefault();
        shell.openExternal(this.href);
    });





    new SlimSelect({
        select: '#modeTask',
        placeholder: 'Select mode',
        closeOnSelect: true,
        showSearch: false,
    })

    siteTask = new SlimSelect({
        select: '#siteTask',
        placeholder: 'Select site',
        closeOnSelect: true,
    })

    new SlimSelect({
        select: '#proxyTask',
        placeholder: 'Select network',
        closeOnSelect: true,
        showSearch: true,
    })

    new SlimSelect({
        select: '#writeFunctionTask',
        placeholder: 'Select function',
        closeOnSelect: true,
        showSearch: true,
        showContent: 'down'
    })

    readFunctionTask = new SlimSelect({
        select: '#readFunctionTask',
        placeholder: 'Select function',
        closeOnSelect: true,
        showSearch: true,
        showContent: 'down'
    })


    profileTask = new SlimSelect({
        select: '#profileTask',
        placeholder: 'Select wallet',
        closeOnSelect: false,
        allowDeselectOption: true
    })






    siteTask2 = new SlimSelect({
        select: '#siteTask2',
        placeholder: 'Select site',
        closeOnSelect: true,
    })

    modeTask2 = new SlimSelect({
        select: '#modeTask2',
        placeholder: 'Select mode',
        closeOnSelect: true,
        showSearch: false,
    })



    profileTask2 = new SlimSelect({
        select: '#profileTask2',
        placeholder: 'Select profile',
        closeOnSelect: true
    })

    proxyTask2 = new SlimSelect({
        select: '#proxyTask2',
        placeholder: 'Select proxies',
        closeOnSelect: true
    })






    var tasks = storage.getSync('tasksV2');
    if (Object.getOwnPropertyNames(tasks).length === 0) {
        storage.set('tasksV2', {}, function(error) {
            if (error) throw error;
        });
    }

    for (var i = 0; i < Object.keys(tasks).length; i++) {
        var uuid = Object.keys(tasks)[i]
        var groupName = tasks[uuid].groupName
        var group = document.createElement("div")
        group.classList.add("group")
        group.setAttribute("uuid", uuid)
        document.getElementById("groupContainer").append(group)

        var groupNameInput = document.createElement("input")
        groupNameInput.setAttribute("onblur", "this.readOnly='true'; saveGroup('" + uuid + "');")
        groupNameInput.setAttribute("readonly", "true")
        groupNameInput.setAttribute("ondblclick", "this.readOnly='';")
        groupNameInput.value = groupName
        groupNameInput.classList.add("groupNameInput")
        group.append(groupNameInput)

        var groupTaskAmount = document.createElement("div")
        groupTaskAmount.textContent = Object.keys(tasks[uuid].tasks).length + " tasks"
        groupTaskAmount.classList.add("groupTaskAmount")
        group.append(groupTaskAmount)

        var deleteGroup = document.createElement("img")
        deleteGroup.classList.add("deleteGroup")
        deleteGroup.setAttribute("onclick", "deleteGroup('" + uuid + "')")
        deleteGroup.setAttribute("src", "./images/deleteGroup.png")
        group.append(deleteGroup)

        group.setAttribute("onclick", "viewGroup('" + uuid + "', event)")
    }


    var wallets = storage.getSync('wallets');
    if (Object.getOwnPropertyNames(wallets).length === 0) {
        storage.set('wallets', {}, function(error) {
            if (error) throw error;
        });
    }
    for (var i = 0; i < Object.keys(wallets).length; i++) {
        var uuid = Object.keys(wallets)[i]
        var walletName = wallets[uuid].walletName
        var privateKey = wallets[uuid].privateKey
        var wallet = document.createElement("div")
        wallet.classList.add("wallet")
        wallet.setAttribute("uuid", uuid)
        document.getElementById("walletContainer").appendChild(wallet)
        var walletNameEntry = document.createElement("input")
        walletNameEntry.classList.add("walletName")
        walletNameEntry.setAttribute("onblur", "saveWallet('" + uuid + "')")
        walletNameEntry.value = walletName
        wallet.appendChild(walletNameEntry)
        var privateKeyTitle = document.createElement("div")
        privateKeyTitle.classList.add("walletPrivateKeyTitle")
        privateKeyTitle.textContent = "Private Key"
        wallet.appendChild(privateKeyTitle)
        var privateKeyEntry = document.createElement("input")
        privateKeyEntry.classList.add("walletPrivateKeyEntry")
        privateKeyEntry.setAttribute("placeholder", "Input private key")
        privateKeyEntry.setAttribute("onblur", "saveWallet('" + uuid + "')")
        privateKeyEntry.value = privateKey
        wallet.appendChild(privateKeyEntry)
        var deleteWallet = document.createElement("img")
        deleteWallet.classList.add("deleteWallet")
        deleteWallet.setAttribute("onclick", "deleteWallet('" + uuid + "')")
        deleteWallet.setAttribute("src", "./images/deleteWallet.png")
        wallet.appendChild(deleteWallet)
    }

    var networks = storage.getSync('networks');
    if (Object.getOwnPropertyNames(networks).length === 0) {
        storage.set('networks', {}, function(error) {
            if (error) throw error;
        });
    }
    for (var i = 0; i < Object.keys(networks).length; i++) {
        var uuid = Object.keys(networks)[i]
        var networkName = networks[uuid].networkName
        var networkURL = networks[uuid].networkRPC
        var network = document.createElement("div")
        network.classList.add("wallet")
        network.setAttribute("uuid", uuid)
        document.getElementById("networkContainer").appendChild(network)
        var networkNameEntry = document.createElement("input")
        networkNameEntry.classList.add("walletName")
        networkNameEntry.setAttribute("onblur", "saveNetwork('" + uuid + "')")
        networkNameEntry.value = networkName
        network.appendChild(networkNameEntry)
        var networkURLTitle = document.createElement("div")
        networkURLTitle.classList.add("walletPrivateKeyTitle")
        networkURLTitle.textContent = "Network RPC"
        network.appendChild(networkURLTitle)
        var networkURLEntry = document.createElement("input")
        networkURLEntry.classList.add("walletPrivateKeyEntry")
        networkURLEntry.setAttribute("placeholder", "Input network RPC")
        networkURLEntry.setAttribute("onblur", "saveNetwork('" + uuid + "')")
        networkURLEntry.value = networkURL
        network.appendChild(networkURLEntry)
        var deleteNetwork = document.createElement("img")
        deleteNetwork.classList.add("deleteWallet")
        deleteNetwork.setAttribute("onclick", "deleteNetwork('" + uuid + "')")
        deleteNetwork.setAttribute("src", "./images/deleteWallet.png")
        network.appendChild(deleteNetwork)
    }


    var settings = storage.getSync('settingsV2');
    if (Object.getOwnPropertyNames(settings).length === 0) {
        storage.set('settingsV2', { "webhook": "", apiKeys: {} }, function(error) {
            if (error) throw error;
        });
    }
    if (typeof settings.webhook === 'undefined')
        document.getElementById("webhookLink").value = ""
    else
        document.getElementById("webhookLink").value = settings.webhook


    if (typeof settings.apiKeys === 'undefined')
        document.getElementById("etherscanKey").value = ""
    else
        document.getElementById("etherscanKey").value = settings.apiKeys.etherscanKey
    analytics()
};

function updateAnalytics() {
    var fs = require('fs');
    const got = require('got');
    var key = fs.readFileSync(path.join(configDir, '/userdata/key.txt'), 'utf8');
    got({
            method: 'get',
            url: 'https://venetiabots.com/api/analytics?key=' + key,
            responseType: 'json'
        }).then(response => {
            let declines = response.body.declines
            let success = response.body.success
            document.getElementById("totalFailures2").textContent = declines.length.toString()
            document.getElementById("totalCheckouts2").textContent = success.length.toString()
            var total = 0;
            for (var i = success.length - 1; i >= 0; i--) {
                total += success[i]['Price']
                var tableRef = document.getElementById('checkoutsTable')
                var d = new Date(success[i]['Date'])
                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                var checkoutDate = months[d.getMonth()] + " " + d.getDate()
                tableRef.innerHTML += `<div class="checkoutsRow">
                <div class="checkoutsRowProduct">` + success[i]['Product'] +
                    `</div>
                <div class="checkoutsTableSiteAndPrice">` + success[i]['Site'] + ' | $' + success[i]['Price'] + `</div>
                <div class="checkoutsRowSize">` +
                    success[i]['Size'] +
                    `</div>
                <img src="` + success[i]['Image'] + `" class="checkoutsRowImage">
                <div class="checkoutsRowSuccess">
                    <div class="checkoutsRowSuccessText">Success</div>
                </div>
                <div class="checkoutsRowDate">
                    <div class="checkoutsRowDateText">` + checkoutDate + `</div>
                </div>
            </div>`
            }
            var totalSpent = 0;
            var checkouts = [0, 0, 0, 0, 0, 0, 0]
            for (var i = 0; i < document.getElementById('checkoutsTable').childNodes.length; i++) {
                totalSpent += parseInt(document.getElementById("checkoutsTable").childNodes[i].children[1].innerHTML.split("| $")[1])
                if (document.getElementById("checkoutsTable").childNodes[i].children[5].children[0].innerHTML.includes("Jan"))
                    checkouts[0]++
                    else if (document.getElementById("checkoutsTable").childNodes[i].children[5].children[0].innerHTML.includes("Feb"))
                        checkouts[1]++
                        else if (document.getElementById("checkoutsTable").childNodes[i].children[5].children[0].innerHTML.includes("Mar"))
                            checkouts[2]++
                            else if (document.getElementById("checkoutsTable").childNodes[i].children[5].children[0].innerHTML.includes("Apr"))
                                checkouts[3]++
                                else if (document.getElementById("checkoutsTable").childNodes[i].children[5].children[0].innerHTML.includes("May"))
                                    checkouts[4]++
                                    else if (document.getElementById("checkoutsTable").childNodes[i].children[5].children[0].innerHTML.includes("Jun"))
                                        checkouts[5]++
                                        else if (document.getElementById("checkoutsTable").childNodes[i].children[5].children[0].innerHTML.includes("Jul"))
                                            checkouts[6]++

            }
            document.getElementById("totalSpent").textContent = "$" + totalSpent
            const Chart = require('chart.js')
            var ctx = document.getElementById('myChart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', "Jun", "Jul"],
                    datasets: [{
                        label: 'Checkouts per Month',
                        data: checkouts,
                        backgroundColor: [
                            'rgba(224, 103, 103, 0.1)'
                        ],
                        borderColor: [
                            'rgba(224, 103, 103, 1)'
                        ],
                        pointBackgroundColor: [
                            'rgba(224, 103, 103, 1)'
                        ],
                        pointHoverBackgroundColor: [
                            'rgba(224, 103, 103, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            },
                            gridLines: {
                                display: false
                            }
                        }],
                        xAxes: [{
                            gridLines: {
                                display: false
                            }
                        }]
                    }
                }
            });
        })
        .catch(error => {
            console.log(error)
        })
}


function saveGroup(uuid) {
    var group = document.querySelector('[uuid="' + uuid + '"]')
    var groupName = group.children[0].value
    var x = storage.getSync('tasksV2');
    x[uuid].groupName = groupName;
    storage.set('tasksV2', x, function(error) {
        if (error) throw error;
    });
}

function saveWallet(uuid) {
    var wallet = document.querySelector('[uuid="' + uuid + '"]')
    var walletName = wallet.children[0].value
    var walletPrivateKey = wallet.children[2].value
    var x = storage.getSync('wallets');
    x[uuid].walletName = walletName;
    x[uuid].privateKey = walletPrivateKey;
    storage.set('wallets', x, function(error) {
        if (error) throw error;
    });
}

function saveNetwork(uuid) {
    var network = document.querySelector('[uuid="' + uuid + '"]')
    var networkName = network.children[0].value
    var networkRPC = network.children[2].value
    var x = storage.getSync('networks');
    x[uuid].networkName = networkName;
    x[uuid].networkRPC = networkRPC;
    storage.set('networks', x, function(error) {
        if (error) throw error;
    });
}

function addGroup() {
    var group = document.createElement("div")
    var uuid = uuidv4()
    group.classList.add("group")
    group.setAttribute("uuid", uuid)
    document.getElementById("groupContainer").append(group)

    var groupNameInput = document.createElement("input")
    groupNameInput.setAttribute("onblur", "this.readOnly='true'; saveGroup('" + uuid + "');")
    groupNameInput.setAttribute("readonly", "true")
    groupNameInput.setAttribute("ondblclick", "this.readOnly='';")
    groupNameInput.value = "Group " + document.getElementById("groupContainer").children.length
    groupNameInput.classList.add("groupNameInput")
    group.append(groupNameInput)

    var groupTaskAmount = document.createElement("div")
    groupTaskAmount.textContent = "0 tasks"
    groupTaskAmount.classList.add("groupTaskAmount")
    group.append(groupTaskAmount)

    var deleteGroup = document.createElement("img")
    deleteGroup.classList.add("deleteGroup")
    deleteGroup.setAttribute("onclick", "deleteGroup('" + uuid + "')")
    deleteGroup.setAttribute("src", "./images/deleteGroup.png")
    group.append(deleteGroup)

    group.setAttribute("onclick", "viewGroup('" + uuid + "', event)")

    var x = storage.getSync('tasksV2');
    x[uuid] = {
        uuid: uuid,
        groupName: groupNameInput.value,
        monitorDelay: 3000,
        retryDelay: 3000,
        tasks: {}
    }
    storage.set('tasksV2', x, function(error) {
        if (error) throw error;
    });

}

function createWallet() {
    var uuid = uuidv4()

    var wallet = document.createElement("div")
    wallet.classList.add("wallet")
    wallet.setAttribute("uuid", uuid)
    document.getElementById("walletContainer").appendChild(wallet)

    var walletNameEntry = document.createElement("input")
    walletNameEntry.classList.add("walletName")
    walletNameEntry.setAttribute("onblur", "saveWallet('" + uuid + "')")
    wallet.appendChild(walletNameEntry)

    var privateKeyTitle = document.createElement("div")
    privateKeyTitle.classList.add("walletPrivateKeyTitle")
    privateKeyTitle.textContent = "Private Key"
    wallet.appendChild(privateKeyTitle)

    var privateKeyEntry = document.createElement("input")
    privateKeyEntry.classList.add("walletPrivateKeyEntry")
    privateKeyEntry.setAttribute("placeholder", "Input private key")
    privateKeyEntry.setAttribute("onblur", "saveWallet('" + uuid + "')")
    wallet.appendChild(privateKeyEntry)

    var deleteWallet = document.createElement("img")
    deleteWallet.classList.add("deleteWallet")
    deleteWallet.setAttribute("onclick", "deleteWallet('" + uuid + "')")
    deleteWallet.setAttribute("src", "./images/deleteWallet.png")
    wallet.appendChild(deleteWallet)

    walletNameEntry.value = "Wallet " + document.getElementById("walletContainer").children.length;

    var x = storage.getSync('wallets');
    x[uuid] = {
        uuid: uuid,
        walletName: walletNameEntry.value,
        privateKey: privateKeyEntry.value,
    }
    storage.set('wallets', x, function(error) {
        if (error) throw error;
    });

}

function createNetwork() {
    var uuid = uuidv4()

    var network = document.createElement("div")
    network.classList.add("wallet")
    network.setAttribute("uuid", uuid)
    document.getElementById("networkContainer").appendChild(network)

    var networkNameEntry = document.createElement("input")
    networkNameEntry.classList.add("walletName")
    networkNameEntry.setAttribute("onblur", "saveWallet('" + uuid + "')")
    network.appendChild(networkNameEntry)

    var networkURLTitle = document.createElement("div")
    networkURLTitle.classList.add("walletPrivateKeyTitle")
    networkURLTitle.textContent = "Network RPC"
    network.appendChild(networkURLTitle)

    var networkURLEntry = document.createElement("input")
    networkURLEntry.classList.add("walletPrivateKeyEntry")
    networkURLEntry.setAttribute("placeholder", "Input network RPC")
    networkURLEntry.setAttribute("onblur", "saveNetwork('" + uuid + "')")
    network.appendChild(networkURLEntry)

    var deleteNetwork = document.createElement("img")
    deleteNetwork.classList.add("deleteWallet")
    deleteNetwork.setAttribute("onclick", "deleteNetwork('" + uuid + "')")
    deleteNetwork.setAttribute("src", "./images/deleteWallet.png")
    network.appendChild(deleteNetwork)

    networkNameEntry.value = "Network " + document.getElementById("networkContainer").children.length;

    var x = storage.getSync('networks');
    x[uuid] = {
        uuid: uuid,
        networkName: networkNameEntry.value,
        networkRPC: networkURLEntry.value,
    }
    storage.set('networks', x, function(error) {
        if (error) throw error;
    });

}

function saveWebhook() {
    var webhookLink = document.getElementById("webhookLink").value;
    var settings = storage.getSync("settingsV2")
    settings.webhook = webhookLink
    storage.set('settingsV2', settings, function(error) {
        if (error) throw error;
    });
}

function saveAPIKeys() {
    var etherscanKey = document.getElementById("etherscanKey").value;
    var settings = storage.getSync("settingsV2")
    settings.apiKeys.etherscanKey = etherscanKey
    storage.set('settingsV2', settings, function(error) {
        if (error) throw error;
    });
}

function testWebhook() {
    var webhookLink = document.getElementById("webhookLink").value;
    const got = require('got');
    var webhooks = webhookLink.split(",")
    for (var i = 0; i < webhooks.length; i++) {
        got({
                method: 'post',
                url: webhooks[i].trim(),
                json: {
                    "content": null,
                    "embeds": [{
                        "title": "Venetia Test Notification! :tada:",
                        "description": "Your webhook is ready to go!",
                        "color": 5230481,
                        "footer": {
                            "text": "Powered by Venetia",
                            "icon_url": "https://i.imgur.com/6h06tuW.png"
                        },
                        "timestamp": new Date(Date.now()).toISOString()
                    }],
                    "username": "Venetia",
                    "avatar_url": "https://i.imgur.com/6h06tuW.png"
                }
            }).then(response => {})
            .catch(error => {
                console.log(error)
            })
    }
}


function selectAll() {
    for (var i = 0; i < document.getElementById("taskContainer").children.length; i++)
        document.getElementById("taskContainer").children[i].classList.add("taskFocused")
}


function deselectAll() {
    for (var i = 0; i < document.getElementById("taskContainer").children.length; i++)
        document.getElementById("taskContainer").children[i].classList.remove("taskFocused")
}

function stopSelected() {
    var selectedTasks = document.getElementsByClassName("taskFocused")
    var groupUUID = document.getElementsByClassName("groupFocused")[0].getAttribute("uuid")
    for (var i = 0; i < selectedTasks.length; i++) {
        if (selectedTasks[i].children[0].children[0].getAttribute("src") === "./images/max.png") {
            selectedTasks[i].children[0].children[0].setAttribute("src", "./images/x.png")
            ipcRenderer.send('message', {
                event: "stopTasks",
                data: {
                    taskUUID: selectedTasks[i].getAttribute("uuid"),
                    groupUUID: groupUUID
                }
            })
        }
    }
}

function startSelected() {
    var selectedTasks = document.getElementsByClassName("taskFocused")
    var groupUUID = document.getElementsByClassName("groupFocused")[0].getAttribute("uuid")
    for (var i = 0; i < selectedTasks.length; i++) {
        if (selectedTasks[i].children[0].children[0].getAttribute("src") === "./images/x.png") {
            selectedTasks[i].children[0].children[0].setAttribute("src", "./images/max.png")
            ipcRenderer.send('message', {
                event: "startTasks",
                data: {
                    taskUUID: selectedTasks[i].getAttribute("uuid"),
                    groupUUID: groupUUID
                }
            })
        }
    }
}

function selectTask(uuid) {
    var task = document.querySelector('[uuid="' + uuid + '"]')
    if (task.classList.contains("taskFocused"))
        task.classList.remove("taskFocused")
    else
        task.classList.add("taskFocused")
}


function viewGroup(uuid, event) {
    if (event.target.classList.contains("deleteGroup") == false) {
        var group = document.querySelector('[uuid="' + uuid + '"]')
        var groupContainer = document.getElementById("groupContainer")
        var taskContainer = document.getElementById("taskContainer")
        taskContainer.innerHTML = "";
        var x = storage.getSync('tasksV2');
        for (var i = 0; i < groupContainer.children.length; i++) {
            groupContainer.children[i].classList.remove("groupFocused")
        }
        group.classList.add("groupFocused")

        document.getElementById('createButton').disabled = false

        for (var i = 0; i < Object.keys(x[uuid].tasks).length; i++) {
            var taskObject = x[uuid].tasks[Object.keys(x[uuid].tasks)[i]]
            var walletName = getWalletFromUUID(taskObject.wallet)
            var networkName = getNetworkFromUUID(taskObject.network)
            var task = document.createElement("div")
            task.classList.add("task")
            task.setAttribute("uuid", taskObject.uuid)
            task.setAttribute("onclick", "selectTask('" + taskObject.uuid + "');")
            document.getElementById("taskContainer").appendChild(task)

            var taskHeader = document.createElement("div")
            taskHeader.classList.add("taskHeader")
            task.appendChild(taskHeader)

            var taskIcon = document.createElement("img")
            taskIcon.classList.add("taskIcon")
            taskHeader.appendChild(taskIcon)

            var taskStatus = document.createElement("div")
            taskStatus.classList.add("taskStatus")
            taskHeader.appendChild(taskStatus)

            if (statusCache[taskObject.uuid] != undefined) {
                taskStatus.textContent = statusCache[taskObject.uuid]
            } else {
                taskStatus.textContent = "Stopped"
            }

            if (iconCache[taskObject.uuid] != undefined) {
                taskIcon.setAttribute("src", iconCache[taskObject.uuid])
            } else {
                taskIcon.setAttribute("src", "./images/x.png")
            }

            var walletTitle = document.createElement("div")
            walletTitle.classList.add("walletTitle")
            walletTitle.textContent = "Wallet"
            task.appendChild(walletTitle)

            var walletInput = document.createElement("div")
            walletInput.classList.add("walletInput")
            walletInput.textContent = walletName
            task.appendChild(walletInput)

            var networkTitle = document.createElement("div")
            networkTitle.classList.add("networkTitle")
            networkTitle.textContent = "Network"
            task.appendChild(networkTitle)

            var networkInput = document.createElement("div")
            networkInput.classList.add("networkInput")
            networkInput.textContent = networkName
            task.appendChild(networkInput)

            var gasLimitTitle = document.createElement("div")
            gasLimitTitle.classList.add("gasLimitTitle")
            gasLimitTitle.textContent = "Gas Limit"
            task.appendChild(gasLimitTitle)

            var gasLimitInput = document.createElement("div")
            gasLimitInput.classList.add("gasLimitInput")
            gasLimitInput.textContent = taskObject.gasInformation.gasLimit
            task.appendChild(gasLimitInput)

            var priorityFeeTitle = document.createElement("div")
            priorityFeeTitle.classList.add("priorityFeeTitle")
            priorityFeeTitle.textContent = "Max Priority Fee"
            task.appendChild(priorityFeeTitle)

            var priorityFeeInput = document.createElement("div")
            priorityFeeInput.classList.add("priorityFeeInput")
            priorityFeeInput.textContent = taskObject.gasInformation.maxPriorityFee
            task.appendChild(priorityFeeInput)

            var gasFeeTitle = document.createElement("div")
            gasFeeTitle.classList.add("gasFeeTitle")
            gasFeeTitle.textContent = "Max Fee"
            task.appendChild(gasFeeTitle)

            var gasFeeInput = document.createElement("div")
            gasFeeInput.classList.add("gasFeeInput")
            gasFeeInput.textContent = taskObject.gasInformation.maxFee
            task.appendChild(gasFeeInput)

        }
    }
}




function editSelected() {
    var groups = storage.getSync("tasks")
    var gname;
    var gindex;
    var changedTasks = []
    var changedFields = {}
    for (var i = 0; i < document.getElementById('groups').rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style['border-left'] === "1px solid rgb(224, 103, 103)") {
            gname = document.getElementById('groups').rows[i].cells[0].children[0].value
            gindex = i
            break;
        }
    }
    for (var i = 0; i < document.getElementById('tasks').rows.length; i++) {
        if (document.getElementById('tasks').rows[i].classList.contains("rowClicked"))
            changedTasks.push(document.getElementById('tasks').rows[i].cells[0].textContent)
    }
    var site = document.getElementById("siteTask2").value;
    var mode = document.getElementById("modeTask2").value;
    var link = document.getElementById("linkTask2").value;
    var profile = document.getElementById("profileTask2").value;
    var proxies = document.getElementById("proxyTask2").value;
    var accounts = document.getElementById("accountTask2").value;
    var size = sizeTask2.selected().toString().replaceAll(",", ", ");
    for (var i = 0; i < document.getElementById('tasks').rows.length; i++) {
        if (document.getElementById('tasks').rows[i].classList.contains("rowClicked")) {
            if (site != "") {
                document.getElementById("tasks").rows[i].cells[1].textContent = site;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['site'] = site
            }

            if (mode != "") {
                document.getElementById("tasks").rows[i].cells[2].textContent = mode;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['mode'] = mode
            }

            if (link != "") {
                document.getElementById("tasks").rows[i].cells[3].textContent = link;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['product'] = link
                changedFields.link = link
            }
            if (profile != "") {
                document.getElementById("tasks").rows[i].cells[5].textContent = profile;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['profile'] = profile
                changedFields.profile = profile
            }
            if (size != "") {
                document.getElementById("tasks").rows[i].cells[4].textContent = size;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['size'] = size
                changedFields.size = sizeTask2.selected()
            }
            if (accounts != "") {
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['accounts'] = accounts
                changedFields.accounts = accounts
            }

            if (proxies != "") {
                document.getElementById("tasks").rows[i].cells[6].textContent = proxies;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['proxies'] = proxies
                changedFields.proxies = proxies
            }

        }
    }

    storage.set('tasks', groups, function(error) {
        if (error) throw error;
    });

    ipcRenderer.send('message', {
        event: "editTasks",
        data: {
            changedTasks: changedTasks,
            changedFields: changedFields
        }
    })

    closeEditor(event)
}

function fillTask() {
    var x = storage.getSync('settingsV2');
    var contractAddress = document.getElementById("linkTask").value
    var etherscanKey = x.apiKeys.etherscanKey
    var writeFunction = document.getElementById("writeFunctionTask")
    var readFunction = document.getElementById("readFunctionTask")
    writeFunction.options.length = 1;
    readFunction.options.length = 1;
    const got = require('got');
    got({
        method: 'get',
        url: `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanKey}`,
        responseType: 'json'
    }).then(response => {
        var contractABI = response.body.result
        contractABI = contractABI.replace(/\\/g, "");

        if (contractABI === "Contract source code not verified" || contractABI === "Invalid Address format")
            throw "Try different network"

        document.getElementById("contractABITask").value = contractABI
        contractABI = JSON.parse(contractABI)
        for (var i = 0; i < contractABI.length; i++) {
            if (typeof contractABI[i].name != 'undefined') {
                writeFunction.options[writeFunction.options.length] = new Option(contractABI[i].name, contractABI[i].name);
                readFunction.options[readFunction.options.length] = new Option(contractABI[i].name, contractABI[i].name);
            }
        }
    }).catch(error => {
        if (error === "Try different network") {
            got({
                method: 'get',
                url: `https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanKey}`,
                responseType: 'json'
            }).then(response => {
                var contractABI = response.body.result
                contractABI = contractABI.replace(/\\/g, "");
                document.getElementById("contractABITask").value = contractABI
                contractABI = JSON.parse(contractABI)
                for (var i = 0; i < contractABI.length; i++) {
                    if (typeof contractABI[i].name != 'undefined') {
                        writeFunction.options[writeFunction.options.length] = new Option(contractABI[i].name, contractABI[i].name);
                        readFunction.options[readFunction.options.length] = new Option(contractABI[i].name, contractABI[i].name);
                    }
                }
            }).catch(error => {
                console.log(error)
            })
        }
    })
}

function getWalletFromUUID(uuid) {
    var wallets = storage.getSync("wallets")
    for (var i = 0; i < Object.keys(wallets).length; i++) {
        if (Object.keys(wallets)[i] === uuid) {
            return wallets[uuid].walletName
        }
    }
    return;
}

function getNetworkFromUUID(uuid) {
    var networks = storage.getSync("networks")
    for (var i = 0; i < Object.keys(networks).length; i++) {
        if (Object.keys(networks)[i] === uuid) {
            return networks[uuid].networkName
        }
    }
    return;
}

function addTask() {
    var site = document.getElementById("siteTask").value
    var mode = document.getElementById("modeTask").value;
    var monitorInput = document.getElementById("linkTask").value;
    var wallet = profileTask.selected();
    var network = document.getElementById("proxyTask").value;
    var parameters = document.getElementById("parametersTask").value;
    var ethValue = document.getElementById("ethValueTask").value;
    var writeFunction = document.getElementById("writeFunctionTask").value;
    var readFunction = document.getElementById("readFunctionTask").value;
    var contractABI = document.getElementById("contractABITask").value;
    var gasInformation = document.getElementById("gasInfoTask").value.split(",")
    var quantity = document.getElementById("quantityTask").value;
    var groupUUID = document.getElementsByClassName("groupFocused")[0].getAttribute("uuid")

    if (mode === "Contract Monitor" && readFunction == "") return;

    if (site != "" && mode != "" && monitorInput != "" && wallet != "" && network != "" && parameters != "" && ethValue != "" &&
        writeFunction != "" && contractABI != "" & gasInformation != "") {
        var groups = storage.getSync('tasksV2');
        if (gasInformation.length == 3) {
            for (var i = 0; i < wallet.length; i++) {
                for (var j = 0; j < quantity; j++) {
                    var uuid = uuidv4()
                    groups[groupUUID].tasks[uuid] = {
                        "uuid": uuid,
                        "site": site,
                        "mode": mode,
                        "monitorInput": monitorInput,
                        "wallet": wallet[i],
                        "network": network,
                        "parameters": parameters,
                        "ethValue": ethValue,
                        "writeFunction": writeFunction,
                        "readFunction": readFunction,
                        "contractABI": contractABI,
                        "gasInformation": {
                            "gasLimit": gasInformation[0],
                            "maxPriorityFee": gasInformation[1],
                            "maxFee": gasInformation[2]
                        }
                    }
                    var walletName = getWalletFromUUID(wallet[i])
                    var networkName = getNetworkFromUUID(network)
                    var task = document.createElement("div")
                    task.classList.add("task")
                    task.setAttribute("uuid", uuid)
                    task.setAttribute("onclick", "selectTask('" + uuid + "');")
                    document.getElementById("taskContainer").appendChild(task)

                    var taskHeader = document.createElement("div")
                    taskHeader.classList.add("taskHeader")
                    task.appendChild(taskHeader)

                    var taskIcon = document.createElement("img")
                    taskIcon.classList.add("taskIcon")
                    taskIcon.setAttribute("src", "./images/x.png")
                    taskHeader.appendChild(taskIcon)

                    var taskStatus = document.createElement("div")
                    taskStatus.classList.add("taskStatus")
                    taskStatus.textContent = "Stopped"
                    taskHeader.appendChild(taskStatus)

                    var walletTitle = document.createElement("div")
                    walletTitle.classList.add("walletTitle")
                    walletTitle.textContent = "Wallet"
                    task.appendChild(walletTitle)

                    var walletInput = document.createElement("div")
                    walletInput.classList.add("walletInput")
                    walletInput.textContent = walletName
                    task.appendChild(walletInput)

                    var networkTitle = document.createElement("div")
                    networkTitle.classList.add("networkTitle")
                    networkTitle.textContent = "Network"
                    task.appendChild(networkTitle)

                    var networkInput = document.createElement("div")
                    networkInput.classList.add("networkInput")
                    networkInput.textContent = networkName
                    task.appendChild(networkInput)

                    var gasLimitTitle = document.createElement("div")
                    gasLimitTitle.classList.add("gasLimitTitle")
                    gasLimitTitle.textContent = "Gas Limit"
                    task.appendChild(gasLimitTitle)

                    var gasLimitInput = document.createElement("div")
                    gasLimitInput.classList.add("gasLimitInput")
                    gasLimitInput.textContent = gasInformation[0]
                    task.appendChild(gasLimitInput)

                    var priorityFeeTitle = document.createElement("div")
                    priorityFeeTitle.classList.add("priorityFeeTitle")
                    priorityFeeTitle.textContent = "Max Priority Fee"
                    task.appendChild(priorityFeeTitle)

                    var priorityFeeInput = document.createElement("div")
                    priorityFeeInput.classList.add("priorityFeeInput")
                    priorityFeeInput.textContent = gasInformation[1]
                    task.appendChild(priorityFeeInput)

                    var gasFeeTitle = document.createElement("div")
                    gasFeeTitle.classList.add("gasFeeTitle")
                    gasFeeTitle.textContent = "Max Fee"
                    task.appendChild(gasFeeTitle)

                    var gasFeeInput = document.createElement("div")
                    gasFeeInput.classList.add("gasFeeInput")
                    gasFeeInput.textContent = gasInformation[2]
                    task.appendChild(gasFeeInput)

                    var groupFocused = document.getElementsByClassName("groupFocused")[0]
                    groupFocused.children[1].textContent = document.getElementById("taskContainer").children.length + " tasks"
                }
            }
        }
        storage.set('tasksV2', groups, function(error) {
            if (error) throw error;
        });
    }


}



function taskCreator() {
    if (document.getElementById('groupContainer').children.length > 0) {
        document.getElementById("darkenBackground").style.display = "block";
        document.getElementById("taskCreator").style.display = "block";
    }

}


function saveDelays() {
    var delays = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/delays.json'), 'utf-8'))
    var index;
    for (var i = 0; i < document.getElementById("groups").rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style['border'] === "1px solid rgb(224, 103, 103)") {
            index = i;
            break;
        }
    }
    delays[index].monitor = document.getElementById("monitorDelay").value
    delays[index].error = document.getElementById("errorDelay").value
    fs.writeFile(path.join(configDir, '/userdata/delays.json'), JSON.stringify(delays), function(err) {
        if (err) throw err;
        console.log('Groups saved!');
    });
}



function closeModal(event) {
    if (event.target.tagName === "IMG") {
        document.getElementById('darkenBackground').style.display = "none"
        document.getElementById("taskCreator").classList.add('animate__zoomOut')
        document.getElementById("taskCreator").addEventListener('animationend', () => {
            document.getElementById("taskCreator").classList.remove('animate__zoomOut')
            document.getElementById('taskCreator').style.display = "none"
        }, { once: true });
    }
}


function showKey() {
    if (document.getElementById("licenseKey").textContent === "XXXX-XXXX-XXXX-XXXX") {
        var key = fs.readFileSync(path.join(configDir, '/userdata/key.txt'), 'utf8');
        document.getElementById("licenseKey").textContent = key;
    } else {
        document.getElementById("licenseKey").textContent = "XXXX-XXXX-XXXX-XXXX";
    }
}



function deleteSelected() {
    var groupFocused = document.getElementsByClassName("groupFocused")[0]
    var groupUUID = groupFocused.getAttribute("uuid")
    var selectedTasks = document.getElementsByClassName("taskFocused")
    var groups = storage.getSync("tasksV2")

    while (selectedTasks.length > 0) {
        delete groups[groupUUID].tasks[selectedTasks[0].getAttribute("uuid")]
        selectedTasks[0].remove()
    }

    groupFocused.children[1].textContent = document.getElementById("taskContainer").children.length + " tasks"

    storage.set('tasksV2', groups, function(error) {
        if (error) throw error;
    });
}

function statusUpdate(task) {
    var taskUUID = task.data.taskUUID;
    var groupUUID = task.data.groupUUID;
    var newStatus = task.data.status

    var group = document.querySelector('[uuid="' + groupUUID + '"]')

    if (group.classList.contains("groupFocused") == false) {
        statusCache[taskUUID] = newStatus;
        iconCache[taskUUID] = "./images/max.png";
        return;
    }

    var task = document.querySelector('[uuid="' + taskUUID + '"]')
    task.children[0].children[1].textContent = newStatus;
}

function stopTask(task) {
    var taskUUID = task.data.taskUUID;
    var groupUUID = task.data.groupUUID;
    var newStatus = task.data.status

    var group = document.querySelector('[uuid="' + groupUUID + '"]')

    if (group.classList.contains("groupFocused") == false) {
        if (newStatus === "Stopped") {
            delete statusCache[taskUUID]
        } else {
            statusCache[taskUUID] = newStatus;
            iconCache[taskUUID] = "./images/x.png"
        }
        return;
    }

    var task = document.querySelector('[uuid="' + taskUUID + '"]')
    task.children[0].children[1].textContent = newStatus;
    task.children[0].children[0].setAttribute('src', './images/x.png')
}


ipcRenderer.on('message', (event, message) => {
    if (message.event === "statusUpdate") {
        statusUpdate(message)
    }

    if (message.event === "stopTask") {
        stopTask(message)
    }
});

ipcRenderer.on('verified', (event) => {
    analytics()
});


ipcRenderer.on('alert', (event, alert2) => {
    alert(alert2)
});


function setProfilePicture() {
    var fs = require('fs');
    const got = require('got');
    fs.readFile(path.join(configDir, '/userdata/key.txt'), 'utf-8', (err, data) => {
        if (err) throw err;
        var key = data;
        got({
            method: 'get',
            url: "https://venetiabots.com/api/activate?key=" + key,
            responseType: 'json'
        }).then(response => {
            var x = response.body.Avatar.split("?")
            document.getElementById("discordavatar").src = x[0] + "?size=64";
        }).catch(error => {
            console.log(error)
        })
    });
}





function analytics() {
    document.getElementById("checkoutsTable").innerHTML = ""
    updateAnalytics()
    setProfilePicture();
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("walletsIcon").style.opacity = 0.3
    document.getElementById("networksIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 1.0
    document.getElementById('walletsTitle').style.display = "none";
    document.getElementById('wallets').style.display = "none";
    document.getElementById('analyticsTitle').style.display = "block";
    document.getElementById('analyticsView').style.display = "block";
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('networksTitle').style.display = "none";
    document.getElementById('networks').style.display = "none";
}


function tasks() {
    var select = document.getElementById('profileTask');
    select.options.length = 0;
    for (var i = 0; i < document.getElementById('walletContainer').children.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById("walletContainer").children[i].children[0].value, document.getElementById("walletContainer").children[i].getAttribute("uuid"));
    }

    var select = document.getElementById('proxyTask');
    select.options.length = 1;
    for (var i = 0; i < document.getElementById('networkContainer').children.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById("networkContainer").children[i].children[0].value, document.getElementById("networkContainer").children[i].getAttribute("uuid"));
    }

    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("walletsIcon").style.opacity = 0.3
    document.getElementById("networksIcon").style.opacity = 0.3
    document.getElementById('walletsTitle').style.display = "none";
    document.getElementById('wallets').style.display = "none";
    document.getElementById('networksTitle').style.display = "none";
    document.getElementById('networks').style.display = "none";
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById("taskIcon").style.opacity = 1.0
    document.getElementById('taskView').style.display = "block";
}


function wallets() {
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("networksIcon").style.opacity = 0.3
    document.getElementById("walletsIcon").style.opacity = 1.0
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('walletsTitle').style.display = "block";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('wallets').style.display = "block";
    document.getElementById('networksTitle').style.display = "none";
    document.getElementById('networks').style.display = "none";
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById('analyticsTitle').style.display = "none";
}

function networks() {
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("networksIcon").style.opacity = 1.0
    document.getElementById("walletsIcon").style.opacity = 0.3
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('walletsTitle').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('wallets').style.display = "none";
    document.getElementById('networksTitle').style.display = "block";
    document.getElementById('networks').style.display = "block";
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById('analyticsTitle').style.display = "none";
}

function settings() {
    document.getElementById("settingsIcon").style.opacity = 1.0
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("networksIcon").style.opacity = 0.3
    document.getElementById("walletsIcon").style.opacity = 0.3
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsDiv').style.display = "block";
    document.getElementById('walletsTitle').style.display = "none";
    document.getElementById('settingsTitle').style.display = "block";
    document.getElementById('wallets').style.display = "none";
    document.getElementById('networksTitle').style.display = "none";
    document.getElementById('networks').style.display = "none";
    document.getElementById('analyticsTitle').style.display = "none";
}