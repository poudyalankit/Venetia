const electron = require('electron');


const { ipcRenderer } = electron;
var path = require('path')
var isMouseDown = false;
const { v4: uuidv4 } = require('uuid');

const configDir = (electron.app || electron.remote.app).getPath('userData');

var fs = require('fs');


var statusCache = {}
var titleCache = {}
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

function savePreferences() {
    var settings = storage.getSync('settings');
    settings[0].retryCheckouts = document.getElementById("retryCheckouts").checked
    settings[0].systemNotifs = document.getElementById("systemNotifs").checked
    settings[0].checkoutSound = document.getElementById("checkoutSound").checked
    storage.set('settings', settings, function(error) {
        if (error) throw error;
    });

}


function filterTable() {
    var input, filter;
    input = document.getElementById("filterInput");
    filter = input.value.toUpperCase();

    for (i = 1; i < document.getElementById("tasks").rows.length; i++) {
        if (document.getElementById("tasks").rows[i].cells[0].textContent.toUpperCase().indexOf(filter) > -1 || document.getElementById("tasks").rows[i].cells[1].textContent.toUpperCase().indexOf(filter) > -1 || document.getElementById("tasks").rows[i].cells[2].textContent.toUpperCase().indexOf(filter) > -1 || document.getElementById("tasks").rows[i].cells[3].textContent.toUpperCase().indexOf(filter) > -1 || document.getElementById("tasks").rows[i].cells[4].textContent.toUpperCase().indexOf(filter) > -1 || document.getElementById("tasks").rows[i].cells[5].textContent.toUpperCase().indexOf(filter) > -1 || document.getElementById("tasks").rows[i].cells[6].textContent.toUpperCase().indexOf(filter) > -1 || document.getElementById("tasks").rows[i].cells[7].textContent.toUpperCase().indexOf(filter) > -1) {
            document.getElementById("tasks").rows[i].style.display = "";
        } else {
            document.getElementById("tasks").rows[i].style.display = "none";
        }

    }

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

function deleteHarvester(uuid) {
    var harvester = document.querySelector('[uuid="' + uuid + '"]')
    ipcRenderer.send("message", {
        event: "deleteHarvester",
        data: {
            uuid: harvester.getAttribute("uuid")
        }
    })
    var x = storage.getSync('captchas');
    for (var i = 0; i < x.length; i++) {
        if (Object.keys(x[i])[0] === harvester.getAttribute("uuid")) {
            x.splice(i, 1)
        }
    }
    storage.set('captchas', x, function(error) {
        if (error) throw error;
    });
    harvester.remove()
}

function launchHarvester(uuid) {
    var harvester = document.querySelector('[uuid="' + uuid + '"]')
    if (harvester.children[2].children[0].value != "") {
        ipcRenderer.send("message", {
            event: "launchHarvester",
            data: {
                harvesterName: harvester.children[0].value,
                harvesterProxy: harvester.children[4].value,
                harvesterType: harvester.children[2].children[0].value,
                uuid: harvester.getAttribute("uuid")
            }
        })
    }
}

function signInHarvester(uuid) {
    var harvester = document.querySelector('[uuid="' + uuid + '"]')
    ipcRenderer.send("message", {
        event: "signInHarvester",
        data: {
            harvesterProxy: harvester.children[4].value,
            uuid: harvester.getAttribute("uuid")
        }
    })
}


function modeChoices() {
    if (document.getElementById("siteTask").value === "FootLockerCA" || document.getElementById("siteTask").value === "FootLocker" || document.getElementById("siteTask").value === "EastBay" || document.getElementById("siteTask").value === "ChampsSports" || document.getElementById("siteTask").value === "FootAction" || document.getElementById("siteTask").value === "KidsFootLocker") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Release", "Release");
    }

    if (document.getElementById("siteTask").value === "SSENSE") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Card", "Card");
        select.options[select.options.length] = new Option("PayPal", "PayPal");
    }


    if (document.getElementById("siteTask").value === "Walmart") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Safe", "Safe");
    }

    if (document.getElementById("siteTask").value === "Dicks") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Restock", "Restock");
    }



    if (document.getElementById("siteTask").value === "Shiekh") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Fast", "Fast");
    }

    if (document.getElementById("siteTask").value === "Federal Premium") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = true;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Fast", "Fast");
    }

    var shopify = storage.getSync('shopifyStores2');
    var customshopify = storage.getSync('shopifyStores');
    for (var i = 0; i < customshopify.length; i++) {
        shopify.push({
            site: customshopify[i].site,
            baseLink: customshopify[i].baseLink
        })
    }

    for (var i = 0; i < shopify.length; i++) {
        if (document.getElementById("siteTask").value === shopify[i].site) {
            var select = document.getElementById("modeTask")
            document.getElementById("accountTask").disabled = false;
            select.options.length = 0;
            select.options[select.options.length] = new Option("Safe", "Safe");
            select.options[select.options.length] = new Option("Preload", "Preload");
            select.options[select.options.length] = new Option("Prestock", "Prestock");
            select.options[select.options.length] = new Option("Fast", "Fast");
            break;
        }
    }
}

function modeChoices2() {
    var select = document.getElementById("modeTask2")
    if (document.getElementById("siteTask2").value === "FootLockerCA" || document.getElementById("siteTask2").value === "FootLocker" || document.getElementById("siteTask2").value === "EastBay" || document.getElementById("siteTask2").value === "ChampsSports" || document.getElementById("siteTask2").value === "FootAction" || document.getElementById("siteTask2").value === "KidsFootLocker") {
        modeTask2.enable()
        select.options.length = 0;
        select.options[select.options.length] = new Option("Release", "Release");
    }

    if (document.getElementById("siteTask2").value === "SSENSE") {
        modeTask2.enable()
        select.options.length = 0;
        select.options[select.options.length] = new Option("Card", "Card");
        select.options[select.options.length] = new Option("PayPal", "PayPal");
    }

    if (document.getElementById("siteTask2").value === "Walmart") {
        modeTask2.enable()
        select.options.length = 0;
        select.options[select.options.length] = new Option("Safe", "Safe");
    }

    if (document.getElementById("siteTask2").value === "Dicks") {
        modeTask2.enable()
        select.options.length = 0;
        select.options[select.options.length] = new Option("Restock", "Restock");
    }


    if (document.getElementById("siteTask2").value === "Shiekh") {
        modeTask2.enable()
        select.options.length = 0;
        select.options[select.options.length] = new Option("Fast", "Fast");
    }

    if (document.getElementById("siteTask2").value === "Federal Premium") {
        modeTask2.enable()
        select.options.length = 0;
        select.options[select.options.length] = new Option("Fast", "Fast");
    }


    var shopify = storage.getSync('shopifyStores2');
    var customshopify = storage.getSync('shopifyStores');
    for (var i = 0; i < customshopify.length; i++) {
        shopify.push({
            site: customshopify[i].site,
            baseLink: customshopify[i].baseLink
        })
    }

    for (var i = 0; i < shopify.length; i++) {
        if (document.getElementById("siteTask2").value === shopify[i].site) {
            modeTask2.enable()
            select.options.length = 0;
            select.options[select.options.length] = new Option("Safe", "Safe");
            select.options[select.options.length] = new Option("Preload", "Preload");
            select.options[select.options.length] = new Option("Prestock", "Prestock");
            select.options[select.options.length] = new Option("Fast", "Fast");
            break;
        }
    }

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

function deleteSelected() {
    stopSelected()
    if (document.getElementById('tasks').rows.length === 1)
        deleteGroup()
    else {
        var groupIndex;
        var groupName;
        var groups = storage.getSync('tasks');
        for (var i = 0; i < document.getElementById("groups").rows.length; i++) {
            if (document.getElementById('groups').rows[i].cells[0].style['border'] === "1px solid rgb(224, 103, 103)") {
                groupIndex = i;
                groupName = document.getElementById('groups').rows[i].cells[0].children[0].value
                break;
            }
        }
        var tasks = document.getElementById("tasks");
        var rowCount = tasks.rows.length;
        for (var x = rowCount - 1; x > 0; x--) {
            if (document.getElementById('tasks').rows[x].classList.contains("rowClicked")) {
                groups[groupIndex][groupName].splice([x - 1], 1)
                tasks.deleteRow(x)
            }
        }

        storage.set('tasks', groups, function(error) {
            if (error) throw error;
        });

        document.getElementById('groups').rows[groupIndex].cells[0].children[1].textContent = (document.getElementById('tasks').rows.length - 1).toString() + " tasks"
    }
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


function cloneSelected() {
    var gname;
    var gindex;
    for (var i = 0; i < document.getElementById('groups').rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style['border-left'] === "1px solid rgb(224, 103, 103)") {
            gname = document.getElementById('groups').rows[i].cells[0].children[0].value
            gindex = i
            break;
        }
    }
    var groups = storage.getSync('tasks');
    for (var i = 0; i < document.getElementById('tasks').rows.length; i++) {
        if (document.getElementById('tasks').rows[i].classList.contains("rowClicked")) {
            var id = makeid(5)
            var task = {
                [id]: {
                    "site": document.getElementById('tasks').rows[i].cells[1].textContent,
                    "mode": document.getElementById('tasks').rows[i].cells[2].textContent,
                    "product": groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['product'],
                    "size": document.getElementById('tasks').rows[i].cells[4].textContent,
                    "profile": document.getElementById('tasks').rows[i].cells[5].textContent,
                    "proxies": document.getElementById('tasks').rows[i].cells[6].textContent,
                    "accounts": groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['accounts'],
                    "schedule": {
                        "hour": groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['schedule']['hour'],
                        "minute": groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['schedule']['minute'],
                        "second": groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['schedule']['second']
                    }
                }
            }
            var tableRef = document.getElementById('tasks').getElementsByTagName('tbody')[0];
            var row = tableRef.insertRow()
            row.innerHTML =
                "<td>" + id + "</td>" +
                "<td>" + task[id].site + "</td>" +
                "<td>" + task[id].mode + "</td>" + "<td class='link'>" + task[id].product + "</td>" +
                "<td class='size'>" + task[id].size + "</td>" +
                "<td>" + task[id].profile + "</td>" +
                "<td>" + task[id].proxies + "</td>" +
                "<td>" + 'Stopped' + "</td>"
            groups[gindex][gname].push(task)
        }
    }

    storage.set('tasks', groups, function(error) {
        if (error) throw error;
    });

    document.getElementById('groups').rows[gindex].cells[0].children[1].textContent = (document.getElementById('tasks').rows.length - 1).toString() + " tasks"

}

function update() {
    ipcRenderer.send('update')
}

function deleteAllProfiles() {
    $("#profiles2 tr:gt(0)").remove();
    storage.set('profiles', [], function(error) {
        if (error) throw error;
    });
}

function deleteProfile() {
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        if (document.getElementById('profiles2').rows[i].cells[0].style.background != '') {
            document.getElementById("profiles2").deleteRow(i);
            var x = storage.getSync('profiles');
            for (var j = 0; j < x.length; j++) {
                if (x[j].name === document.getElementById("profilename").value) {
                    x.splice(j, 1);
                }
            }
            clearFields()
            storage.set('profiles', x, function(error) {
                if (error) throw error;
            });
        }
    }
}


function reverify() {
    const got = require('got');
    var SlimSelect = require('slim-select')
    got({
            method: 'get',
            url: 'https://venetiabots.com/api/shopifyStores',
            responseType: 'json'
        }).then(response => {
            var storelist = []
            var currentList = []
            var currentListFile = []
            var shopify = document.getElementById("shopify")
            var shopify2 = document.getElementById("shopify2")
            var currentSelection = document.getElementById("siteTask").value
            var currentSelection2 = document.getElementById("siteTask2").value
            for (var i = 0; i < shopify.childNodes.length; i++) {
                currentList.push(shopify.childNodes[i].value)
            }
            for (var i = 0; i < storage.getSync('shopifyStores2').length; i++) {
                currentListFile.push(storage.getSync('shopifyStores2')[i].site)
            }
            for (var i = 0; i < response.body.length; i++) {
                delete response.body[i]['_id']
            }
            if (JSON.stringify(response.body) != JSON.stringify(storage.getSync('shopifyStores2')) || JSON.stringify(currentList) != JSON.stringify(currentListFile)) {
                shopify.innerHTML = ""
                shopify2.innerHTML = ""
                for (var i = 0; i < response.body.length; i++) {
                    shopify.innerHTML += "<option value='" + response.body[i].site + "'>" + response.body[i].site + "</option>"
                    shopify2.innerHTML += "<option value='" + response.body[i].site + "'>" + response.body[i].site + "</option>"
                    storelist.push({
                        site: response.body[i].site,
                        baseLink: response.body[i].baseLink
                    })
                }
                siteTask.destroy()
                siteTask =
                    new SlimSelect({
                        select: '#siteTask',
                        placeholder: 'Select site',
                        closeOnSelect: true,
                    })
                siteTask2.destroy()
                siteTask2 =
                    new SlimSelect({
                        select: '#siteTask2',
                        placeholder: 'Select site',
                        closeOnSelect: true,
                    })
                storage.set('shopifyStores2', storelist, function(error) {
                    if (error) throw error;
                });
                siteTask.set(currentSelection)
                siteTask2.set(currentSelection2)
            }
        })
        .catch(error => {
            console.log(error)
        })
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

function restartBackend() {
    disconnected()
    document.getElementById("backendStatusIcon").setAttribute("onclick", "")
    document.getElementById("backendStatusIcon").style.cursor = "default"
    statusCache = {}
    titleCache = {}
    for (var i = 1; i < document.getElementById("tasks").rows.length; i++) {
        document.getElementById("tasks").rows[i].cells[7].textContent = "Stopped"
        document.getElementById("tasks").rows[i].cells[7].style.color = "#FFFFFF";
    }
    ipcRenderer.send("message", {
        event: "restartBackend"
    })
    setTimeout(function() {
        document.getElementById("backendStatusIcon").setAttribute("onclick", "restartBackend()")
        document.getElementById("backendStatusIcon").style.cursor = "pointer"
    }, 5000);
}

function connected() {
    document.getElementById("backendStatusText").innerHTML = "Connected"
    document.getElementById("backendStatusIcon").setAttribute("src", "./images/online.png")
}

function disconnected() {
    document.getElementById("backendStatusText").innerHTML = "Disconnected"
    document.getElementById("backendStatusIcon").setAttribute("src", "./images/x.png")
}


var siteTask;
var siteTask2;
var sizeTask;
var sizeTask2;
var profileTask;
var profileTask2;
var proxyTask2;
var accountTask2;
var modeTask2;
var proxyQTSelect;
var sizeQTSelect;
var profileQTSelect;
window.onload = function() {
    reverify()
    setInterval(reverify, 20000)

    document.addEventListener("auxclick", handleNonLeftClick);
    document.addEventListener("click", stopOpen);

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault()
        }

        if (document.getElementById('taskView').style.display === "block") {
            if (event.ctrlKey && event.key === 'f') {
                if (document.getElementById("taskCreator").style.display != "block")
                    if (document.getElementById('editButton').disabled === false)
                        taskEditor()
            }
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
                    closeModal()
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
                    for (var i = 1; i < document.getElementById('tasks').rows.length; i++) {
                        if (document.getElementById("tasks").rows[i].style.display != "none")
                            deselectAll(document.getElementById('tasks').rows[i])
                    }
                }
            }
            if (event.ctrlKey && event.key === 'a') {
                if (document.activeElement.tagName != "INPUT") {
                    event.preventDefault()
                    if (document.getElementById("taskCreator").style.display != "block") {
                        for (var i = 1; i < document.getElementById('tasks').rows.length; i++) {
                            if (document.getElementById("tasks").rows[i].style.display != "none")
                                selectAll(document.getElementById('tasks').rows[i])
                        }
                    }
                }
            }
        }
    });


    window.$ = window.jQuery = require('jquery');
    const shell = require('electron').shell;


    $(".groupTable").on('contextmenu', function() {
        event.preventDefault();
        $(".custom-menu-groups").finish().show(100).
        css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
    });

    $(".taskTable").on('contextmenu', function() {
        event.preventDefault();
        if (event.target.tagName === "TD") {
            event.target.parentElement.classList.add("rowClicked")
        }
        $(".custom-menu-tasks").finish().show(100).
        css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
    });


    $(document).on("mousedown", function(e) {
        if (!$(e.target).parents(".custom-menu-groups").length > 0) {
            $(".custom-menu-groups").hide(100);
        }
        if (!$(e.target).parents(".custom-menu-tasks").length > 0) {
            $(".custom-menu-tasks").hide(100);
        }
    });


    $(".custom-menu-groups li").click(function() {
        switch ($(this).attr("data-action")) {
            case "first":
                addGroup()
                break;
            case "second":
                deleteGroup();
                break;
        }
        $(".custom-menu-groups").hide(100);
    });


    $(".custom-menu-tasks li").click(function() {
        switch ($(this).attr("data-action")) {
            case "first":
                startSelected()
                break;
            case "second":
                stopSelected();
                break;
            case "third":
                deleteSelected();
                break;
            case "fourth":
                taskEditor();
                break;
            case "fifth":
                cloneSelected();
                break;
        }
        $(".custom-menu-tasks").hide(100);
    });




    $("#tasks").on('mousedown', function() {
        if (event.target.tagName === "TD") {
            var row = event.target.parentElement
            if (event.shiftKey) {
                var startRowIndex;
                for (var i = 0; i < document.getElementById("tasks").rows.length; i++) {
                    if (document.getElementById("tasks").rows[i].classList.contains("rowClicked")) {
                        startRowIndex = i;
                        break;
                    }
                }
                if (startRowIndex < row.closest("tr").rowIndex)
                    for (var j = startRowIndex; j <= row.closest("tr").rowIndex; j++) {
                        if (document.getElementById('tasks').rows[j].style.display != "none") {
                            document.getElementById("tasks").rows[j].classList.add("rowClicked");
                        }
                    }
                else {
                    for (var i = 0; i < document.getElementById("tasks").rows.length; i++) {
                        if (document.getElementById("tasks").rows[i].classList.contains("rowClicked") && i != row.closest("tr").rowIndex) {
                            startRowIndex = i;
                            break;
                        }
                    }
                    for (var j = row.closest("tr").rowIndex; j <= startRowIndex; j++) {
                        if (document.getElementById('tasks').rows[j].style.display != "none") {
                            document.getElementById("tasks").rows[j].classList.add("rowClicked")
                        }
                    }
                }
            } else {
                if (event.ctrlKey) {
                    if (row.classList.contains("rowClicked")) {
                        row.classList.remove("rowClicked")
                    } else
                        row.classList.add("rowClicked")
                } else {
                    for (var i = 0; i < document.getElementById("tasks").rows.length; i++) {
                        document.getElementById("tasks").rows[i].classList.remove("rowClicked")
                    }
                    row.classList.add("rowClicked")
                }
            }
            isMouseDown = true;
        }
    });

    $("#tasks").on('mouseover', function() {
        if (isMouseDown) {
            if (event.target.tagName === "TD") {
                var row = event.target.parentElement
                row.classList.add("rowClicked")
            }
        }
    });

    $(document)
        .mouseup(function() {
            isMouseDown = false;
        });




    $(document).on('click', 'a[href^="http"]', function(event) {
        event.preventDefault();
        shell.openExternal(this.href);
    });


    var SlimSelect = require('slim-select')



    new SlimSelect({
        select: '#shopifyStores',
        placeholder: 'Select store',
        closeOnSelect: true,
        showSearch: false,
    })

    new SlimSelect({
        select: '#modeTask',
        placeholder: 'Select mode',
        closeOnSelect: true,
        showSearch: false,
    })

    profileQTSelect = new SlimSelect({
        select: '#profileQTSelect',
        placeholder: 'Select profile',
    })

    new SlimSelect({
        select: '#accountTask',
        placeholder: 'Select account',
        closeOnSelect: true,
        showSearch: false,
    })


    proxyQTSelect = new SlimSelect({
        select: '#proxyQTSelect',
        placeholder: 'Select proxies',
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
        placeholder: 'Select proxies',
        closeOnSelect: true,
        showSearch: false,
    })


    sizeQTSelect = new SlimSelect({
        select: '#sizeQTSelect',
        placeholder: 'Select size',
        addable: function(value) {
            for (var i = 0; i < document.getElementById("sizeQTSelect").childNodes.length; i++) {
                if (document.getElementById("sizeQTSelect").childNodes[i].tagName === "OPTGROUP") {
                    for (var j = 0; j < document.getElementById("sizeQTSelect").childNodes[i].childNodes.length; j++) {
                        if (document.getElementById("sizeQTSelect").childNodes[i].childNodes[j].tagName === "OPTION")
                            if (document.getElementById("sizeQTSelect").childNodes[i].childNodes[j].value === value)
                                return false;
                    }
                }
            }
            if (value.includes(","))
                return false;
            return value;
        }
    })

    sizeTask = new SlimSelect({
        select: '#sizeTask',
        placeholder: 'Select size',
        closeOnSelect: false,
        allowDeselectOption: true,
        showContent: 'down',
        addable: function(value) {
            for (var i = 0; i < document.getElementById("sizeTask").childNodes.length; i++) {
                if (document.getElementById("sizeTask").childNodes[i].tagName === "OPTGROUP") {
                    for (var j = 0; j < document.getElementById("sizeTask").childNodes[i].childNodes.length; j++) {
                        if (document.getElementById("sizeTask").childNodes[i].childNodes[j].tagName === "OPTION")
                            if (document.getElementById("sizeTask").childNodes[i].childNodes[j].value === value)
                                return false;
                    }
                }
            }
            if (value.includes(","))
                return false;
            return value;
        }
    })

    profileTask = new SlimSelect({
        select: '#profileTask',
        placeholder: 'Select profile',
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

    accountTask2 = new SlimSelect({
        select: '#accountTask2',
        placeholder: 'Select accounts',
        closeOnSelect: true,
        showSearch: false,
    })

    sizeTask2 = new SlimSelect({
        select: '#sizeTask2',
        placeholder: 'Select size',
        closeOnSelect: false,
        allowDeselectOption: true,
        showContent: 'down',
        addable: function(value) {
            for (var i = 0; i < document.getElementById("sizeTask2").childNodes.length; i++) {
                if (document.getElementById("sizeTask2").childNodes[i].tagName === "OPTGROUP") {
                    for (var j = 0; j < document.getElementById("sizeTask2").childNodes[i].childNodes.length; j++) {
                        if (document.getElementById("sizeTask2").childNodes[i].childNodes[j].tagName === "OPTION")
                            if (document.getElementById("sizeTask2").childNodes[i].childNodes[j].value === value)
                                return false;
                    }
                }
            }
            if (value.includes(","))
                return false;
            return value;
        }
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




    const inputElement = document.getElementById("upload-photo");
    inputElement.addEventListener("change", getFile);

    function getFile(event) {
        const input = event.target
        if ('files' in input && input.files.length > 0) {
            placeFileContent(input.files[0])
        }
    }

    function placeFileContent(file) {
        readFileContent(file).then(content => {
            var x = storage.getSync('profiles');
            for (var i = 0; i < JSON.parse(content).length; i++) {
                x.push(JSON.parse(content)[i])
                var tableRef = document.getElementById('profiles2').getElementsByTagName('tbody')[0];
                tableRef.insertRow().innerHTML =
                    "<td onclick='showProfile(this.textContent)' style='padding-bottom: 5px'>" + JSON.parse(content)[i].name + "</td>"

            }
            storage.set('profiles', x, function(error) {
                if (error) throw error;
            });
        }).catch(error => console.log(error))
    }

    function readFileContent(file) {
        const reader = new FileReader()
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result)
            reader.onerror = error => reject(error)
            reader.readAsText(file)
        })
    }



    var x = storage.getSync('profiles');
    if (Object.getOwnPropertyNames(x).length === 0) {
        storage.set('profiles', [], function(error) {
            if (error) throw error;
        });
    }
    for (var i = 0; i < x.length; i++) {

        var tableRef = document.getElementById('profiles2').getElementsByTagName('tbody')[0];
        tableRef.insertRow().innerHTML =
            "<td onclick='showProfile(this.textContent)' style='padding-bottom: 5px'>" + x[i].name + "</td>"
    }



    var x = storage.getSync('delays');
    if (Object.getOwnPropertyNames(x).length === 0) {
        storage.set('delays', [], function(error) {
            if (error) throw error;
        });
    }


    var x = storage.getSync('proxies');
    if (Object.getOwnPropertyNames(x).length === 0) {
        storage.set('proxies', [], function(error) {
            if (error) throw error;
        });
    }
    for (var i = 0; i < x.length; i++) {
        var tableRef = document.getElementById('proxies').getElementsByTagName('tbody')[0];
        tableRef.insertRow().innerHTML =
            "<td onclick='showProxies(this.textContent)' style='padding-bottom: 5px'>" + x[i].name + "</td>" +
            "<td onclick='showProxiesbyCount(this)' style='padding-bottom: 5px'>" + x[i].proxies.length + "</td>"
    }


    var x = storage.getSync('shopifyStores');
    if (Object.getOwnPropertyNames(x).length === 0) {
        storage.set('shopifyStores', [], function(error) {
            if (error) throw error;
        });
    }
    var shopifysites = document.getElementById("shopifyStores")
    document.getElementById("customShopify").innerHTML = ""
    document.getElementById("customShopify2").innerHTML = ""
    for (var i = 0; i < x.length; i++) {
        shopifysites.options[shopifysites.options.length] = new Option(x[i].site, x[i].site);
        document.getElementById("customShopify").innerHTML += "<option value='" + x[i].site + "'>" + x[i].site + "</option>"
        document.getElementById("customShopify2").innerHTML += "<option value='" + x[i].site + "'>" + x[i].site + "</option>"
    }

    siteTask.destroy()
    siteTask =
        new SlimSelect({
            select: '#siteTask',
            placeholder: 'Select site',
            closeOnSelect: true,
        })


    siteTask2.destroy()
    siteTask2 =
        new SlimSelect({
            select: '#siteTask2',
            placeholder: 'Select site',
            closeOnSelect: true,
        })

    var x = storage.getSync('shopifyStores2');
    if (Object.getOwnPropertyNames(x).length === 0) {
        storage.set('shopifyStores2', [], function(error) {
            if (error) throw error;
        });
    }



    var x = storage.getSync('accounts');
    if (Object.getOwnPropertyNames(x).length === 0) {
        storage.set('accounts', [], function(error) {
            if (error) throw error;
        });
    }
    for (var i = 0; i < x.length; i++) {
        var tableRef = document.getElementById('accounts').getElementsByTagName('tbody')[0];
        tableRef.insertRow().innerHTML =
            "<td onclick='showAccounts(this.textContent)' style='padding-bottom: 5px'>" + x[i].name + "</td>" +
            "<td onclick='showAccountsbyCount(this)' style='padding-bottom: 5px'>" + x[i].account.length + "</td>"
    }




    var x = storage.getSync('captchas');
    if (Object.getOwnPropertyNames(x).length === 0) {
        storage.set('captchas', [], function(error) {
            if (error) throw error;
        });
    }
    for (var i = 0; i < x.length; i++) {
        var harvester = document.createElement("div")
        harvester.classList.add("harvester")
        harvester.setAttribute("uuid", Object.keys(x[i])[0])
        document.getElementById("harvesterContainer").appendChild(harvester)


        var harvesterName = document.createElement("input")
        harvesterName.classList.add("harvesterName")
        harvesterName.setAttribute("onblur", "saveHarvester('" + Object.keys(x[i])[0] + "')")
        harvester.appendChild(harvesterName)

        var harvesterTypeTitle = document.createElement("div")
        harvesterTypeTitle.classList.add("harvesterTypeTitle")
        harvesterTypeTitle.textContent = "Solver Type"
        harvester.appendChild(harvesterTypeTitle)

        var harvesterTypeSelection = document.createElement("div")
        harvesterTypeSelection.classList.add("harvesterTypeSelection")
        harvester.appendChild(harvesterTypeSelection)

        var select = document.createElement("select")
        select.options[select.options.length] = new Option();
        select.options[0].setAttribute("data-placeholder", "true")
        select.setAttribute("onchange", "saveHarvester('" + Object.keys(x[i])[0] + "')")
        select.options[select.options.length] = new Option("Shopify Checkpoint", "Shopify Checkpoint");
        harvesterTypeSelection.appendChild(select)
        var SlimSelect = require('slim-select')
        var selectmaker = new SlimSelect({
            select: select,
            placeholder: 'Select type',
            closeOnSelect: true,
            showSearch: false,
        })

        var harvesterProxyTitle = document.createElement("div")
        harvesterProxyTitle.classList.add("harvesterProxyTitle")
        harvesterProxyTitle.textContent = "Proxy"
        harvester.appendChild(harvesterProxyTitle)

        var harvesterProxyEntry = document.createElement("input")
        harvesterProxyEntry.classList.add("harvesterProxyEntry")
        harvesterProxyEntry.setAttribute("onblur", "saveHarvester('" + Object.keys(x[i])[0] + "')")
        harvesterProxyEntry.setAttribute("placeholder", "Input proxy")
        harvester.appendChild(harvesterProxyEntry)

        var launchHarvester = document.createElement("img")
        launchHarvester.classList.add("launchHarvester")
        launchHarvester.setAttribute("onclick", "launchHarvester('" + Object.keys(x[i])[0] + "')")
        launchHarvester.setAttribute("src", "./images/launchHarvester.png")
        harvester.appendChild(launchHarvester)

        var signInHarvester = document.createElement("img")
        signInHarvester.classList.add("signInHarvester")
        signInHarvester.setAttribute("onclick", "signInHarvester('" + Object.keys(x[i])[0] + "')")
        signInHarvester.setAttribute("src", "./images/signInHarvester.png")
        harvester.appendChild(signInHarvester)

        var deleteHarvester = document.createElement("img")
        deleteHarvester.classList.add("deleteHarvester")
        deleteHarvester.setAttribute("onclick", "deleteHarvester('" + Object.keys(x[i])[0] + "')")
        deleteHarvester.setAttribute("src", "./images/deleteHarvester.png")
        harvester.appendChild(deleteHarvester)

        harvesterName.value = x[i][Object.keys(x[i])[0]].harvesterName
        harvesterProxyEntry.value = x[i][Object.keys(x[i])[0]].harvesterProxy
        selectmaker.set(x[i][Object.keys(x[i])[0]].harvesterType)
    }




    var tasks = storage.getSync('tasks');
    if (Object.getOwnPropertyNames(tasks).length === 0) {
        storage.set('tasks', [], function(error) {
            if (error) throw error;
        });
    }
    for (var i = 0; i < tasks.length; i++) {
        var tableRef = document.getElementById('groups').getElementsByTagName('tbody')[0];
        var row = tableRef.insertRow()
        var edit = "this.readOnly='';"
        var onblur = "this.readOnly='true';"
        var edit2 = "editGroup(this);"
        row.innerHTML =
            "<td menu='true'>" +
            "<input class='groupNameInput' type='text' onblur=" + onblur + edit2 + " readonly='true' ondblclick=" + edit + " menu='true' value='" + Object.keys(tasks[i])[0] + "'>" +
            "<div class='groupTaskAmount' menu='true'>" + tasks[i][Object.keys(tasks[i])[0]].length + " tasks</div>" +
            "</td>"
        row.setAttribute("onclick", "viewGroup(this)")
    }



    var data = storage.getSync('settings');
    if (Object.getOwnPropertyNames(data).length === 0) {
        storage.set('settings', [{ "webhook": "", "checkoutSound": false, "retryCheckouts": false, "systemNotifs": false }, {
            "qtProfile": "",
            "qtProxy": "",
            "qtSize": ""
        }], function(error) {
            if (error) throw error;
        });
    }
    document.getElementById("webhookLink").value = data[0].webhook
    if (data[0].checkoutSound == true) {
        document.getElementById("checkoutSound").checked = true
        document.getElementById("checkoutSound").style['background-color'] = '#e06767'
    }

    if (data[0].retryCheckouts == true) {
        document.getElementById("retryCheckouts").checked = true
        document.getElementById("retryCheckouts").style['background-color'] = '#e06767'
    }

    if (data[0].systemNotifs == true) {
        document.getElementById("systemNotifs").checked = true
        document.getElementById("systemNotifs").style['background-color'] = '#e06767'
    }

    if (typeof data[1] == 'undefined') {
        storage.set('settings', [{ "webhook": "", "checkoutSound": false, "retryCheckouts": false, "systemNotifs": false }, {
            "qtProfile": "",
            "qtProxy": "",
            "qtSize": ""
        }], function(error) {
            if (error) throw error;
        });
    }

    var select = document.getElementById('profileQTSelect');
    select.options.length = 0;
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('profiles2').rows[i].cells[0].textContent, document.getElementById('profiles2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('proxyQTSelect');
    select.options.length = 0;
    select.options[select.options.length] = new Option('None', '-')
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('proxies2').rows[i].cells[0].textContent, document.getElementById('proxies2').rows[i].cells[0].textContent);
    }

    profileQTSelect.set(data[1].qtProfile)
    proxyQTSelect.set(data[1].qtProxy)
    sizeQTSelect.set(data[1].qtSize)



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


function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function showProfile(profileName) {
    var fs = require('fs');
    fs.readFile(path.join(configDir, '/userdata/profiles.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        x = JSON.parse(data);

        for (var i = 0; i < x.length; i++) {
            document.getElementById('profiles2').rows[i + 1].cells[0].style.background = '';
        }

        for (var i = 0; i < x.length; i++) {
            if (x[i].name === profileName) {
                document.getElementById('profiles2').rows[i + 1].cells[0].style.background = '#181a26';
                document.getElementById('firstname').value = x[i].delivery.firstName;
                document.getElementById('lastname').value = x[i].delivery.lastName;
                document.getElementById('address').value = x[i].delivery.address1;
                document.getElementById('city').value = x[i].delivery.city;
                document.getElementById('zipcode').value = x[i].delivery.zip;
                document.getElementById('country').value = x[i].delivery.country;
                document.getElementById('state').value = x[i].delivery.state;
                document.getElementById('cardnumber').value = x[i].card.number;
                document.getElementById('expmonth').value = x[i].card.expiryMonth;
                document.getElementById('expyear').value = x[i].card.expiryYear;
                document.getElementById('cvv').value = x[i].card.cvv;
                document.getElementById('profilename').value = x[i].name;
                document.getElementById('onecheckout').value = x[i].singleCheckout;
                document.getElementById('email').value = x[i].email;
                document.getElementById('phone').value = x[i].phone;
                break;
            }
        }
    });
}

function saveHarvester(uuid) {
    var harvester = document.querySelector('[uuid="' + uuid + '"]')
    var harvesterName = harvester.children[0].value
    var harvesterProxy = harvester.children[4].value
    var harvesterType = harvester.children[2].children[0].value
    var x = storage.getSync('captchas');
    for (var i = 0; i < x.length; i++) {
        if (Object.keys(x[i])[0] === uuid) {
            x[i][uuid].harvesterName = harvesterName
            x[i][uuid].harvesterProxy = harvesterProxy
            x[i][uuid].harvesterType = harvesterType
        }
    }
    storage.set('captchas', x, function(error) {
        if (error) throw error;
    });

}

function createHarvester() {
    var SlimSelect = require('slim-select')
    var uuid = uuidv4()

    var harvester = document.createElement("div")
    harvester.classList.add("harvester")
    harvester.setAttribute("uuid", uuid)
    document.getElementById("harvesterContainer").appendChild(harvester)

    var harvesterName = document.createElement("input")
    harvesterName.classList.add("harvesterName")
    harvesterName.setAttribute("onblur", "saveHarvester('" + uuid + "')")
    harvester.appendChild(harvesterName)

    var harvesterTypeTitle = document.createElement("div")
    harvesterTypeTitle.classList.add("harvesterTypeTitle")
    harvesterTypeTitle.textContent = "Solver Type"
    harvester.appendChild(harvesterTypeTitle)

    var harvesterTypeSelection = document.createElement("div")
    harvesterTypeSelection.classList.add("harvesterTypeSelection")
    harvester.appendChild(harvesterTypeSelection)

    var select = document.createElement("select")
    select.options[select.options.length] = new Option();
    select.options[0].setAttribute("data-placeholder", "true")
    select.options[select.options.length] = new Option("Shopify Checkpoint", "Shopify Checkpoint");
    select.setAttribute("onchange", "saveHarvester('" + uuid + "')")
    harvesterTypeSelection.appendChild(select)
    var SlimSelect = require('slim-select')
    new SlimSelect({
        select: select,
        placeholder: 'Select type',
        closeOnSelect: true,
        showSearch: false,
    })

    var harvesterProxyTitle = document.createElement("div")
    harvesterProxyTitle.classList.add("harvesterProxyTitle")
    harvesterProxyTitle.textContent = "Proxy"
    harvester.appendChild(harvesterProxyTitle)

    var harvesterProxyEntry = document.createElement("input")
    harvesterProxyEntry.classList.add("harvesterProxyEntry")
    harvesterProxyEntry.setAttribute("placeholder", "Input proxy")
    harvesterProxyEntry.setAttribute("onblur", "saveHarvester('" + uuid + "')")
    harvester.appendChild(harvesterProxyEntry)

    var launchHarvester = document.createElement("img")
    launchHarvester.classList.add("launchHarvester")
    launchHarvester.setAttribute("onclick", "launchHarvester('" + uuid + "')")
    launchHarvester.setAttribute("src", "./images/launchHarvester.png")
    harvester.appendChild(launchHarvester)

    var signInHarvester = document.createElement("img")
    signInHarvester.classList.add("signInHarvester")
    signInHarvester.setAttribute("onclick", "signInHarvester('" + uuid + "')")
    signInHarvester.setAttribute("src", "./images/signInHarvester.png")
    harvester.appendChild(signInHarvester)

    var deleteHarvester = document.createElement("img")
    deleteHarvester.classList.add("deleteHarvester")
    deleteHarvester.setAttribute("onclick", "deleteHarvester('" + uuid + "')")
    deleteHarvester.setAttribute("src", "./images/deleteHarvester.png")
    harvester.appendChild(deleteHarvester)

    harvesterName.value = "Harvester " + document.getElementById("harvesterContainer").children.length;

    var x = storage.getSync('captchas');
    x.push({
        [uuid]: {
            uuid: uuid,
            harvesterName: harvesterName.value,
            harvesterProxy: harvesterProxyEntry.value,
            harvesterType: select.value
        }
    })
    storage.set('captchas', x, function(error) {
        if (error) throw error;
    });

}



function showAccounts(accountName) {
    clearAccountFields();
    document.getElementById('accountListName').value = accountName;
    var fs = require('fs');
    fs.readFile(path.join(configDir, '/userdata/accounts.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        x = JSON.parse(data);
        for (var i = 0; i < x.length; i++) {
            document.getElementById('accounts2').rows[i + 1].cells[0].style.background = '';
            document.getElementById('accounts2').rows[i + 1].cells[1].style.background = ''
        }

        for (var i = 0; i < x.length; i++) {
            if (x[i].name === accountName) {
                document.getElementById('accounts2').rows[i + 1].cells[0].style.background = '#181a26'
                document.getElementById('accounts2').rows[i + 1].cells[1].style.background = '#181a26'
                for (var j = 0; j < x[i].account.length; j++) {
                    document.getElementById("accountListEntry").value += x[i].account[j].email + ":" + x[i].account[j].password
                    if (j != x[i].account.length - 1) {
                        document.getElementById("accountListEntry").value += "\n"
                    }
                }
                break;
            }
        }
    });
}

function showProxies(proxyName) {
    clearProxyFields();
    document.getElementById('proxyListName').value = proxyName;
    var fs = require('fs');



    fs.readFile(path.join(configDir, '/userdata/proxies.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        x = JSON.parse(data);

        for (var i = 0; i < x.length; i++) {
            document.getElementById('proxies2').rows[i + 1].cells[0].style.background = '';
            document.getElementById('proxies2').rows[i + 1].cells[1].style.background = ''
        }

        for (var i = 0; i < x.length; i++) {
            if (x[i].name === proxyName) {
                document.getElementById('proxies2').rows[i + 1].cells[0].style.background = '#181a26'
                document.getElementById('proxies2').rows[i + 1].cells[1].style.background = '#181a26'
                for (var j = 0; j < x[i].proxies.length; j++) {
                    document.getElementById("proxyListEntry").value += x[i].proxies[j].ip + ":" + x[i].proxies[j].port
                    if (x[i].proxies[j].username != null || x[i].proxies[j].password != null) {
                        document.getElementById("proxyListEntry").value += ":" + x[i].proxies[j].username + ":" + x[i].proxies[j].password;
                    }
                    if (j != x[i].proxies.length - 1) {
                        document.getElementById("proxyListEntry").value += "\n"
                    }
                }
            }
        }


    });
}

function showProxiesbyCount(proxyCount) {
    var x = proxyCount.closest("tr")
    showProxies(x.cells[0].textContent)
}

function showAccountsbyCount(accountCount) {
    var x = accountCount.closest("tr")
    showAccounts(x.cells[0].textContent)
}

function changeColor(row, event) {
    if (row.checked == true) {
        row.style.background = "#e06767"
    }
    if (row.checked == false) {
        row.style.background = "#292c3f"
    }
}


function saveWebhook() {
    var fs = require('fs');
    var webhookLink = document.getElementById("webhookLink").value;
    var settings = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/settings.json'), { encoding: 'utf8', flag: 'r' }));
    settings[0].webhook = webhookLink
    fs.writeFile(path.join(configDir, '/userdata/settings.json'), JSON.stringify(settings), function(err) {
        if (err) throw err;
        console.log('Webhook saved!');
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
            }).then(response => {
                console.log("Finished sending webhook")
            })
            .catch(error => {
                console.log(error)
            })
    }
}



function createProfile() {
    var fs = require('fs');

    var profile;
    var x;
    fs.readFile(path.join(configDir, '/userdata/profiles.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        x = JSON.parse(data);
        profile = x;

        for (var i = 0; i < x.length; i++) {
            if (x[i].name === document.getElementById('profilename').value) {
                profile[i].delivery.firstName = document.getElementById('firstname').value;
                profile[i].delivery.lastName = document.getElementById('lastname').value
                profile[i].delivery.address1 = document.getElementById('address').value;
                profile[i].delivery.city = document.getElementById('city').value;
                profile[i].delivery.zip = document.getElementById('zipcode').value;
                profile[i].delivery.country = document.getElementById('country').value;
                profile[i].delivery.state = document.getElementById('state').value;
                profile[i].card.number = document.getElementById('cardnumber').value;
                profile[i].card.expiryMonth = document.getElementById('expmonth').value;
                profile[i].card.expiryYear = document.getElementById('expyear').value;
                profile[i].card.cvv = document.getElementById('cvv').value;
                profile[i].name = document.getElementById('profilename').value;
                profile[i].singleCheckout = document.getElementById('onecheckout').value;
                profile[i].email = document.getElementById('email').value;
                profile[i].phone = document.getElementById('phone').value;

                var checker = true;

                fs.writeFile(path.join(configDir, '/userdata/profiles.json'), JSON.stringify(profile), function(err) {
                    if (err) throw err;
                });
            }
        }
        if (!checker) {
            var firstname = document.getElementById('firstname').value;
            var lastname = document.getElementById('lastname').value
            var address = document.getElementById('address').value;
            var city = document.getElementById('city').value;
            var zipcode = document.getElementById('zipcode').value;
            var country = document.getElementById('country').value;
            var state = document.getElementById('state').value;
            var cardnumber = document.getElementById('cardnumber').value;
            var expmonth = document.getElementById('expmonth').value;
            var expyear = document.getElementById('expyear').value;
            var cvv = document.getElementById('cvv').value;
            var profilename = document.getElementById('profilename').value;
            var singleCheckout = document.getElementById('onecheckout').value
            var email = document.getElementById('email').value
            var phone = document.getElementById('phone').value
            var jsonStr = { "name": profilename, "email": email, "phone": phone, "singleCheckout": singleCheckout, "billingDifferent": false, "card": { "number": cardnumber, "expiryMonth": expmonth, "expiryYear": expyear, "cvv": cvv }, "delivery": { "firstName": firstname, "lastName": lastname, "address1": address, "address2": null, "zip": zipcode, "city": city, "country": country, "state": state }, "billing": { "firstName": null, "lastName": null, "address1": null, "address2": null, "zip": null, "city": null, "country": null, "state": null } }

            fs.readFile(path.join(configDir, '/userdata/profiles.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x = JSON.parse(data);
                x.push(jsonStr)

                fs.writeFile(path.join(configDir, '/userdata/profiles.json'), JSON.stringify(x), function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                    var tableRef = document.getElementById('profiles2').getElementsByTagName('tbody')[0];
                    tableRef.insertRow().innerHTML =
                        "<td onclick='showProfile(this.textContent)' style='padding-bottom: 5px'>" + profilename + "</td>"
                });

            });



        }
    });


}



function selectAll(row) {
    row.classList.add("rowClicked")
}


function deselectAll(row) {
    row.classList.remove("rowClicked")
}


function saveAccounts() {
    var fs = require('fs');
    var checker;
    var accounts;
    var x;
    fs.readFile(path.join(configDir, '/userdata/accounts.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        x = JSON.parse(data);
        var accounts = []
        overallaccounts = x;

        for (var i = 0; i < x.length; i++) {
            if (x[i].name === document.getElementById('accountListName').value) {
                checker = true;
                overallaccounts[i].account.length = 0;
                var accountsbyLines = document.getElementById('accountListEntry').value.split(/\n/)
                for (var j = 0; j < accountsbyLines.length; j++) {
                    var accountsbyColon = accountsbyLines[j].split(':');
                    var jsonStr = {
                        "email": accountsbyColon[0],
                        "password": accountsbyColon[1]
                    }
                    overallaccounts[i].account.push(jsonStr)
                }
                fs.writeFile(path.join(configDir, '/userdata/accounts.json'), JSON.stringify(overallaccounts), function(err) {
                    if (err) throw err;
                });
                document.getElementById('accounts2').rows[i + 1].cells[1].textContent = overallaccounts[i].account.length;
                break;
            }
        }
        if (!checker) {
            var accountListName = document.getElementById('accountListName').value;
            var x2 = {
                "name": accountListName,
                "account": []
            }


            var accountbyLines = document.getElementById('accountListEntry').value.split(/\n/)
            for (var j = 0; j < accountbyLines.length; j++) {
                var accountbyColon = accountbyLines[j].split(':');
                var jsonStr = {
                    "email": accountbyColon[0],
                    "password": accountbyColon[1]
                }
                x2.account.push(jsonStr)
            }

            fs.readFile(path.join(configDir, '/userdata/accounts.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x3 = JSON.parse(data);
                x3.push(x2)

                fs.writeFile(path.join(configDir, '/userdata/accounts.json'), JSON.stringify(x3), function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                    var tableRef = document.getElementById('accounts2').getElementsByTagName('tbody')[0];
                    tableRef.insertRow().innerHTML =
                        "<td onclick='showAccounts(this.textContent)' style='padding-bottom: 5px'>" + accountListName + "</td>" +
                        "<td onclick='showAccountsbyCount(this)' style='padding-bottom: 5px'>" + accountbyLines.length + "</td>"
                });
            });
        }
    });
}



function editGroup(group) {
    var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    var index = group.parentElement.parentElement.rowIndex
    var gname = group.value
    groups[index] = {
        [gname]: groups[index][Object.keys(groups[index])[0]]
    }
    fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify(groups), function(err) {
        if (err) throw err;
        console.log('Groups saved!');
    });
}

function viewGroup(group) {
    document.getElementById('createButton').disabled = false
    document.getElementById('delaysButton').style = "display: block"
    document.getElementById('editButton').disabled = false
    var groupindex;
    var groupName = group.cells[0].children[0].value
    for (var i = 0; i < document.getElementById('groups').rows.length; i++) {
        document.getElementById('groups').rows[i].cells[0].style.border = "0"
    }
    document.getElementById('groups').rows[group.rowIndex].cells[0].style['border'] = "1px solid #e06767"

    $("#tasks tr:gt(0)").remove();
    var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    for (var i = 0; i < groups.length; i++) {
        if (Object.keys(groups[i])[0] === groupName) {
            groupindex = i;
            break;
        }
    }
    for (var i = 0; i < groups[groupindex][groupName].length; i++) {
        var tableRef = document.getElementById('tasks').getElementsByTagName('tbody')[0];
        var row = tableRef.insertRow()
        var id = Object.keys(groups[groupindex][groupName][i])[0]
        if (typeof statusCache[id] != 'undefined') {
            var status = statusCache[id]
        } else
            var status = 'Stopped'
        if (typeof titleCache[id] != 'undefined') {
            var product = titleCache[id]
        } else var product = groups[groupindex][groupName][i][id].product
        row.innerHTML =
            "<td>" + id + "</td>" +
            "<td>" + groups[groupindex][groupName][i][id].site + "</td>" +
            "<td>" + groups[groupindex][groupName][i][id].mode + "</td>" + "<td class='link'>" + product + "</td>" +
            "<td class='size'>" + groups[groupindex][groupName][i][id].size + "</td>" +
            "<td>" + groups[groupindex][groupName][i][id].profile + "</td>" +
            "<td>" + groups[groupindex][groupName][i][id].proxies + "</td>" +
            "<td>" + status + "</td>"
        if (status.toUpperCase().includes("ERROR") || status === "Checkout failed") {
            document.getElementById('tasks').rows[row.rowIndex].cells[7].style.color = "#e06767"
        } else if (status === "Check email" || status === "Check webhook") {
            document.getElementById('tasks').rows[row.rowIndex].cells[7].style.color = "#4fcf91"
        }
    }
    filterTable()
}

function addGroup() {
    tableRef = document.getElementById("groups").getElementsByTagName('tbody')[0]
    var row = tableRef.insertRow()
    var id = makeid(4)
    var edit = "this.readOnly='';"
    var onblur = "this.readOnly='true';"
    var edit2 = "editGroup(this);"
    row.innerHTML =
        "<td menu='true'>" +
        "<input class='groupNameInput'type='text' onblur=" + onblur + edit2 + " readonly='true' ondblclick=" + edit + " menu='true' value=" + "'Group " + id + "'" + ">" +
        "<div class='groupTaskAmount' menu='true'>0 tasks</div>" +
        "</td>"

    row.setAttribute("onclick", "viewGroup(this)")
    var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    var groupName = "Group " + id;
    var group = {
        [groupName]: []
    }
    groups.push(group)
    fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify(groups), function(err) {
        if (err) throw err;
        console.log('Groups saved!');
    });

    var delays = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/delays.json'), 'utf-8'))
    var delay = {
        "monitor": 3000,
        "error": 3000
    }
    delays.push(delay)
    fs.writeFile(path.join(configDir, '/userdata/delays.json'), JSON.stringify(delays), function(err) {
        if (err) throw err;
        console.log('Groups saved!');
    });
}

function deleteGroup() {
    if (document.activeElement.tagName != 'INPUT') {
        var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
        for (var i = 1; i < document.getElementById("tasks").rows.length; i++) {
            selectAll(document.getElementById('tasks').rows[i])
        }
        stopSelected()
        $("#tasks tr:gt(0)").remove();
        var tableref = document.getElementById('groups')
        var groupindex;
        for (var i = 0; i < tableref.rows.length; i++) {
            if (tableref.rows[i].cells[0].style['border-left'] === "1px solid rgb(224, 103, 103)") {
                tableref.deleteRow(i);
                groupindex = i;
                break;
            }
        }
        groups.splice(groupindex, 1)
        fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify(groups), function(err) {
            if (err) throw err;
            console.log('Groups saved!');
        });
        document.getElementById('createButton').disabled = true
        document.getElementById('delaysButton').style = "display: none"
        document.getElementById('editButton').disabled = true
    }

    var delays = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/delays.json'), 'utf-8'))
    delays.splice(groupindex, 1)

    fs.writeFile(path.join(configDir, '/userdata/delays.json'), JSON.stringify(delays), function(err) {
        if (err) throw err;
        console.log('Groups saved!');
    });
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


function addTask() {
    var gname;
    var gindex;
    for (var i = 0; i < document.getElementById('groups').rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style['border-left'] === "1px solid rgb(224, 103, 103)") {
            gname = document.getElementById('groups').rows[i].cells[0].children[0].value
            gindex = i
            break;
        }
    }
    var site = document.getElementById("siteTask").value;
    var mode = document.getElementById("modeTask").value;
    var link = document.getElementById("linkTask").value;
    var profile = profileTask.selected()
    var proxies = document.getElementById("proxyTask").value;
    var accounts = document.getElementById("accountTask").value;
    var size = sizeTask.selected().toString().replaceAll(",", ", ");
    var quantity = document.getElementById("quantityTask").value;


    if (accounts === "")
        accounts = "-"
    if (proxies === "")
        proxies = "-"

    var tasks = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    if (size != "" && link != "" && mode != "" && site != "" && proxies != "" && profile != "") {
        for (var j = 0; j < profile.length; j++) {
            for (var i = 0; i < quantity; i++) {
                var id = makeid(5)
                var tableRef = document.getElementById('tasks').getElementsByTagName('tbody')[0];
                var row = tableRef.insertRow()
                row.innerHTML =
                    "<td>" + id + "</td>" +
                    "<td>" + site + "</td>" +
                    "<td>" + mode + "</td>" + "<td class='link'>" + link + "</td>" +
                    "<td class='size'>" + size + "</td>" +
                    "<td>" + profile[j] + "</td>" +
                    "<td>" + proxies + "</td>" +
                    "<td>" + 'Stopped' + "</td>"
                var task = {
                    [id]: {
                        "site": site,
                        "mode": mode,
                        "product": link,
                        "size": size,
                        "profile": profile[j],
                        "proxies": proxies,
                        "accounts": accounts,
                        "schedule": {
                            "hour": "",
                            "minute": "",
                            "second": ""
                        }
                    }
                }
                tasks[gindex][gname].push(task)
            }
        }
    }
    storage.set('tasks', tasks, function(error) {
        if (error) throw error;
    });

    document.getElementById('groups').rows[gindex].cells[0].children[1].textContent = (document.getElementById('tasks').rows.length - 1).toString() + " tasks"
}



function taskCreator() {
    if (document.getElementById('groups').rows.length > 0) {
        document.getElementById("darkenBackground").style.display = "block";
        document.getElementById("taskCreator").style.display = "block";
    }

}

function removeStore() {
    var SlimSelect = require('slim-select')

    var currentStores = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores.json'), 'utf-8'))
    for (var i = 0; i < currentStores.length; i++) {
        if (currentStores[i].site === document.getElementById("shopifyStores").value)
            currentStores.splice(i, 1)
    }
    var shopifysites = document.getElementById("shopifyStores")
    shopifysites.options.length = 0;
    for (var i = 0; i < currentStores.length; i++) {
        shopifysites.options[shopifysites.options.length] = new Option(currentStores[i].site, currentStores[i].site);
    }
    fs.writeFile(path.join(configDir, '/userdata/shopifyStores.json'), JSON.stringify(currentStores), function(err) {
        if (err) throw err;
    });
    document.getElementById("customShopify").innerHTML = ""
    document.getElementById("customShopify2").innerHTML = ""

    for (var i = 0; i < currentStores.length; i++) {
        document.getElementById("customShopify").innerHTML += "<option value='" + currentStores[i].site + "'>" + currentStores[i].site + "</option>"
        document.getElementById("customShopify2").innerHTML += "<option value='" + currentStores[i].site + "'>" + currentStores[i].site + "</option>"
    }
    siteTask.destroy()
    siteTask =
        new SlimSelect({
            select: '#siteTask',
            placeholder: 'Select site',
            closeOnSelect: true,
        })
    siteTask2.destroy()
    siteTask2 =
        new SlimSelect({
            select: '#siteTask2',
            placeholder: 'Select site',
            closeOnSelect: true,
        })
}

function addStoreConfirm() {
    var SlimSelect = require('slim-select')

    var currentStores = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores.json'), 'utf-8'))

    var baseLink = document.getElementById("baseLinkEntry").value.toLowerCase()
    if (baseLink.startsWith("http://"))
        baseLink = "https://" + baseLink.substring(7)
    if (baseLink.endsWith("/"))
        baseLink = baseLink.substring(0, baseLink.length - 1)

    currentStores.push({
        site: document.getElementById("storeNameEntry").value,
        baseLink: baseLink
    })
    var shopifysites = document.getElementById("shopifyStores")
    shopifysites.options.length = 0;
    for (var i = 0; i < currentStores.length; i++) {
        shopifysites.options[shopifysites.options.length] = new Option(currentStores[i].site, currentStores[i].site);
    }
    fs.writeFile(path.join(configDir, '/userdata/shopifyStores.json'), JSON.stringify(currentStores), function(err) {
        if (err) throw err;
    });

    document.getElementById("baseLinkEntry").value = ""
    document.getElementById("storeNameEntry").value = ""
    document.getElementById("customShopify").innerHTML = ""
    document.getElementById("customShopify2").innerHTML = ""
    for (var i = 0; i < currentStores.length; i++) {
        document.getElementById("customShopify").innerHTML += "<option value='" + currentStores[i].site + "'>" + currentStores[i].site + "</option>"
        document.getElementById("customShopify2").innerHTML += "<option value='" + currentStores[i].site + "'>" + currentStores[i].site + "</option>"
    }
    siteTask.destroy()
    siteTask =
        new SlimSelect({
            select: '#siteTask',
            placeholder: 'Select site',
            closeOnSelect: true,
        })
    siteTask2.destroy()
    siteTask2 =
        new SlimSelect({
            select: '#siteTask2',
            placeholder: 'Select site',
            closeOnSelect: true,
        })
}

function addStore() {
    document.getElementById('darkenBackground2').style.display = "block"
    document.getElementById("storeAdder").style.display = "block";
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

function delayModal() {
    document.getElementById("darkenBackground").style.display = "block";
    document.getElementById("delayModal").style.display = "block";
    var delays = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/delays.json'), 'utf-8'))
    var index;
    for (var i = 0; i < document.getElementById("groups").rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style['border'] === "1px solid rgb(224, 103, 103)") {
            index = i;
            break;
        }
    }
    document.getElementById("monitorDelay").value = delays[index].monitor
    document.getElementById("errorDelay").value = delays[index].error
}

function closeStoreModal(event) {
    if (event.target.tagName === "IMG" || event.target.className.split(" ")[0] === "modal" || event.target.className.includes('addStoreConfirmButton')) {
        document.getElementById('darkenBackground2').style.display = "none"
        document.getElementById("storeAdder").classList.add('animate__zoomOut')
        document.getElementById("storeAdder").addEventListener('animationend', () => {
            document.getElementById("storeAdder").classList.remove('animate__zoomOut')
            document.getElementById('storeAdder').style.display = "none"
        }, { once: true });
    }
}

function closeEditor(event) {
    if (event.target.tagName === "IMG" || event.target.className.split(" ")[0] === "modal" || event.target.className.includes('addTaskButton')) {
        document.getElementById('darkenBackground').style.display = "none"
        document.getElementById("taskEditor").classList.add('animate__zoomOut')
        document.getElementById("taskEditor").addEventListener('animationend', () => {
            document.getElementById("taskEditor").classList.remove('animate__zoomOut')
            document.getElementById('taskEditor').style.display = "none"
        }, { once: true });
    }
}


function closeModal(event) {
    if (event.target.tagName === "IMG" || event.target.className.split(" ")[0] === "modal") {
        document.getElementById('darkenBackground').style.display = "none"
        document.getElementById("taskCreator").classList.add('animate__zoomOut')
        document.getElementById("taskCreator").addEventListener('animationend', () => {
            document.getElementById("taskCreator").classList.remove('animate__zoomOut')
            document.getElementById('taskCreator').style.display = "none"
        }, { once: true });
    }
}


function closeDelayModal(event) {
    if (event.target.tagName === "IMG" || event.target.className.split(" ")[0] === "modal" || event.target.className.includes('addStoreConfirmButton')) {
        document.getElementById('darkenBackground').style.display = "none"
        document.getElementById("delayModal").classList.add('animate__zoomOut')
        document.getElementById("delayModal").addEventListener('animationend', () => {
            document.getElementById("delayModal").classList.remove('animate__zoomOut')
            document.getElementById('delayModal').style.display = "none"
        }, { once: true });
    }
}

async function startSelected() {
    var groupName;
    var groupIndex;
    for (var i = 0; i < document.getElementById('groups').rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style.border === "1px solid rgb(224, 103, 103)") {
            groupName = document.getElementById('groups').rows[i].cells[0].children[0].value;
            groupIndex = i;
            break;
        }
    }
    for (var i = 1; i < document.getElementById('tasks').rows.length; i++) {
        if (document.getElementById('tasks').rows[i].classList.contains("rowClicked") && document.getElementById('tasks').rows[i].cells[7].textContent === "Stopped") {
            var task = {
                "taskID": document.getElementById('tasks').rows[i].cells[0].textContent,
                "taskIndex": i - 1,
                "groupName": groupName,
                "groupIndex": groupIndex
            }
            ipcRenderer.send('taskinfo', task)
        }
    }
}


async function startAll() {
    var groupName;
    var groupIndex;
    for (var i = 0; i < document.getElementById('groups').rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style.border === "1px solid rgb(224, 103, 103)") {
            groupName = document.getElementById('groups').rows[i].cells[0].children[0].value;
            groupIndex = i;
            break;
        }
    }
    for (var i = 1; i < document.getElementById('tasks').rows.length; i++) {
        if (document.getElementById('tasks').rows[i].cells[7].textContent === "Stopped") {
            var task = {
                "taskID": document.getElementById('tasks').rows[i].cells[0].textContent,
                "taskIndex": i - 1,
                "groupName": groupName,
                "groupIndex": groupIndex
            }
            ipcRenderer.send('taskinfo', task)
        }
    }
}

function resetTasks() {
    fs.unlinkSync(path.join(configDir, '/userdata/tasks.json'));
    location.reload();
}

function resetProfiles() {
    fs.unlinkSync(path.join(configDir, '/userdata/profiles.json'));
    location.reload();
}

function resetProxies() {
    fs.unlinkSync(path.join(configDir, '/userdata/proxies.json'));
    location.reload();

}

function resetAccounts() {
    fs.unlinkSync(path.join(configDir, '/userdata/accounts.json'));
    location.reload();

}

function resetCaptchas() {
    fs.unlinkSync(path.join(configDir, '/userdata/captchas.json'));
    location.reload();

}

function resetSettings() {
    fs.unlinkSync(path.join(configDir, '/userdata/settings.json'));
    location.reload();
}

async function stopSelected() {
    for (var i = 1; i < document.getElementById('tasks').rows.length; i++) {
        if (document.getElementById('tasks').rows[i].classList.contains("rowClicked")) {
            delete statusCache[document.getElementById('tasks').rows[i].cells[0].textContent]
            delete titleCache[document.getElementById('tasks').rows[i].cells[0].textContent]
            var task = { "taskID": document.getElementById('tasks').rows[i].cells[0].textContent }
            ipcRenderer.send('stopTask', task)
        }
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


ipcRenderer.on('updateStatus', (event, taskNumber, status) => {
    statusCache[taskNumber] = status
    var path = require('path')
    var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    for (var i = 0; i < groups.length; i++) {
        for (var j = 0; j < groups[i][Object.keys(groups[i])[0]].length; j++) {
            if (Object.keys(groups[i][Object.keys(groups[i])[0]][j])[0] === taskNumber) {
                groupIndex = i;
                break;
            }
        }
    }
    if (document.getElementById('groups').rows[groupIndex].cells[0].style.border === "1px solid rgb(224, 103, 103)") {
        for (var i = 0; i < document.getElementById('tasks').rows.length; i++) {
            if (document.getElementById("tasks").rows[i].cells[0].textContent === taskNumber) {
                taskNumber = i;
                break;
            }
        }
        document.getElementById("tasks").rows[taskNumber].cells[7].textContent = status;
        if (status === "Check email" || status === "Check webhook") {
            document.getElementById("tasks").rows[taskNumber].cells[7].style.color = "#4fcf91";
            if (document.getElementById("checkoutSound").checked == true) {
                var audio = new Audio(path.join(__dirname, 'images/checkoutsound.wav'));
                audio.play();
            }
        } else if (status === "Checkout failed") {
            document.getElementById("tasks").rows[taskNumber].cells[7].style.color = "#e06767";

        } else if (status.toUpperCase().includes("ERROR")) {
            document.getElementById("tasks").rows[taskNumber].cells[7].style.color = "#e06767";
        } else
            document.getElementById("tasks").rows[taskNumber].cells[7].style.color = "#FFFFFF";
    } else {
        if (status === "Check email" || status === "Check webhook") {
            if (document.getElementById("checkoutSound").checked == true) {
                var audio = new Audio(path.join(__dirname, 'images/checkoutsound.wav'));
                audio.play();
            }
        }
    }
    filterTable()
});

ipcRenderer.on('quicktask', (event, site, input) => {
    const remote = require('electron').remote;
    tasks()
    if (document.getElementById('groups').rows.length == 0)
        addGroup()
    var tasks2 = storage.getSync("tasks")
    var gname = document.getElementById('groups').rows[0].cells[0].children[0].value
    var gindex = 0
    document.getElementById("groups").rows[0].cells[0].click()
    remote.getCurrentWindow().focus()
    var id = makeid(5)
    var tableRef = document.getElementById('tasks').getElementsByTagName('tbody')[0];
    var row = tableRef.insertRow()
    if (site === "Shiekh")
        var mode = "Fast"
    else if (site === "Federal Premium")
        var mode = "Fast"
    else if (site === "FootLocker")
        var mode = "Release"
    else if (site === "EastBay")
        var mode = "Release"
    else if (site === "FootAction")
        var mode = "Release"
    else if (site === "ChampsSports")
        var mode = "Release"
    else if (site === "FootLockerCA")
        var mode = "Release"
    else if (site === "KidsFootLocker")
        var mode = "Release"
    else if (site === "SSENSE")
        var mode = "Card"
    else {
        var mode = "Safe"
    }

    row.innerHTML =
        "<td>" + id + "</td>" +
        "<td>" + site + "</td>" +
        "<td>" + mode + "</td>" + "<td class='link'>" + input + "</td>" +
        "<td class='size'>" + storage.getSync("settings")[1].qtSize + "</td>" +
        "<td>" + storage.getSync("settings")[1].qtProfile + "</td>" +
        "<td>" + storage.getSync("settings")[1].qtProxy + "</td>" +
        "<td>" + 'Stopped' + "</td>"
    var task = {
        [id]: {
            "site": site,
            "mode": mode,
            "product": input,
            "size": storage.getSync("settings")[1].qtSize,
            "profile": storage.getSync("settings")[1].qtProfile,
            "proxies": storage.getSync("settings")[1].qtProxy,
            "accounts": "-",
            "schedule": {
                "hour": "",
                "minute": "",
                "second": ""
            }
        }
    }
    tasks2[gindex][gname].push(task)

    storage.set('tasks', tasks2, function(error) {
        if (error) throw error;
    });

    document.getElementById('groups').rows[gindex].cells[0].children[1].textContent = (document.getElementById('tasks').rows.length - 1).toString() + " tasks"

    var task3 = {
        "id": id,
        "site": site,
        "mode": mode,
        "product": input,
        "size": storage.getSync("settings")[1].qtSize,
        "profile": storage.getSync("settings")[1].qtProfile,
        "proxies": storage.getSync("settings")[1].qtProxy,
        "accounts": "-",
        "schedule": {
            "hour": "",
            "minute": "",
            "second": ""
        }
    }
    ipcRenderer.send('startQT', task3)


});

ipcRenderer.on('backendConnection', (event, status) => {
    if (status === "Connected") {
        connected()
    } else
        disconnected()
});

ipcRenderer.on('updateStats', (event, stat) => {
    /* if (stat === "checkouts") {
         var checkouts = parseInt(document.getElementById("totalCheckouts").textContent.split("checkouts")[0])
         checkouts++;
         document.getElementById("totalCheckouts").textContent = checkouts.toString() + " checkouts"
     } else if (stat === "carts") {
         var carts = parseInt(document.getElementById("totalCarts").textContent.split("carts")[0])
         carts++;
         document.getElementById("totalCarts").textContent = carts.toString() + " carts"
     } else if (stat === "fails") {
         var fails = parseInt(document.getElementById("totalFails").textContent.split("fails")[0])
         fails++;
         document.getElementById("totalFails").textContent = fails.toString() + " fails"
     }*/
});

ipcRenderer.on('updateProductTitle', (event, taskID, title) => {
    titleCache[taskID] = title
    var path = require('path')
    var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    for (var i = 0; i < groups.length; i++) {
        for (var j = 0; j < groups[i][Object.keys(groups[i])[0]].length; j++) {
            if (Object.keys(groups[i][Object.keys(groups[i])[0]][j])[0] === taskID) {
                groupIndex = i;
                break;
            }
        }
    }
    if (document.getElementById('groups').rows[groupIndex].cells[0].style.border === "1px solid rgb(224, 103, 103)") {
        for (var i = 0; i < document.getElementById('tasks').rows.length; i++) {
            if (document.getElementById('tasks').rows[i].cells[0].textContent === taskID) {
                document.getElementById('tasks').rows[i].cells[3].textContent = title;
                break;
            }
        }
    }
});


ipcRenderer.on('verified', (event) => {
    analytics()
});


ipcRenderer.on('alert', (event, alert2) => {
    alert(alert2)
});



function saveProxies() {
    var fs = require('fs');
    var checker;
    var profile;
    var x;
    fs.readFile(path.join(configDir, '/userdata/proxies.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        x = JSON.parse(data);
        var proxies = []
        overallproxies = x;

        for (var i = 0; i < x.length; i++) {
            if (x[i].name === document.getElementById('proxyListName').value) {
                checker = true;
                overallproxies[i].proxies.length = 0;
                var proxybyLines = document.getElementById('proxyListEntry').value.split(/\n/)
                if (proxybyLines[proxybyLines.length - 1].length < 1)
                    proxybyLines.pop();
                for (var j = 0; j < proxybyLines.length; j++) {
                    var proxybyColon = proxybyLines[j].split(':');
                    if (proxybyColon.length == 2) {
                        var jsonStr = {
                            "ip": proxybyColon[0],
                            "port": proxybyColon[1],
                            "username": null,
                            "password": null
                        }
                        overallproxies[i].proxies.push(jsonStr)
                    } else {
                        var jsonStr = {
                            "ip": proxybyColon[0],
                            "port": proxybyColon[1],
                            "username": proxybyColon[2],
                            "password": proxybyColon[3]
                        }
                        overallproxies[i].proxies.push(jsonStr)
                    }
                }
                fs.writeFile(path.join(configDir, '/userdata/proxies.json'), JSON.stringify(overallproxies), function(err) {
                    if (err) throw err;
                });
                document.getElementById('proxies2').rows[i + 1].cells[1].textContent = overallproxies[i].proxies.length;
            }
        }
        if (!checker) {
            var proxyListName = document.getElementById('proxyListName').value;
            var x2 = {
                "name": proxyListName,
                "favorite": false,
                "proxies": []
            }


            var proxybyLines = document.getElementById('proxyListEntry').value.split(/\n/)
            if (proxybyLines[proxybyLines.length - 1].length < 1)
                proxybyLines.pop();
            for (var j = 0; j < proxybyLines.length; j++) {
                var proxybyColon = proxybyLines[j].split(':');
                if (proxybyColon.length == 2) {
                    var jsonStr = {
                        "ip": proxybyColon[0],
                        "port": proxybyColon[1],
                        "username": null,
                        "password": null
                    }
                    x2.proxies.push(jsonStr)
                } else {
                    var jsonStr = {
                        "ip": proxybyColon[0],
                        "port": proxybyColon[1],
                        "username": proxybyColon[2],
                        "password": proxybyColon[3]
                    }
                    x2.proxies.push(jsonStr)
                }
            }

            fs.readFile(path.join(configDir, '/userdata/proxies.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x3 = JSON.parse(data);
                x3.push(x2)

                fs.writeFile(path.join(configDir, '/userdata/proxies.json'), JSON.stringify(x3), function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                    var tableRef = document.getElementById('proxies2').getElementsByTagName('tbody')[0];
                    tableRef.insertRow().innerHTML =
                        "<td onclick='showProxies(this.textContent)' style='padding-bottom: 5px'>" + proxyListName + "</td>" +
                        "<td onclick='showProxiesbyCount(this)' style='padding-bottom: 5px'>" + proxybyLines.length + "</td>"
                });
            });
        }
    });
}

function saveQT() {
    if (document.getElementById("settingsDiv").style.display === "block") {
        var settings = storage.getSync("settings")
        settings[1] = {
            "qtProfile": document.getElementById("profileQTSelect").value,
            "qtProxy": document.getElementById("proxyQTSelect").value,
            "qtSize": document.getElementById("sizeQTSelect").value
        }
        storage.set('settings', settings, function(error) {
            if (error) throw error;
        });
    }
}

function clearFields() {
    document.getElementById('firstname').value = ''
    document.getElementById('lastname').value = ''
    document.getElementById('address').value = ''
    document.getElementById('city').value = ''
    document.getElementById('zipcode').value = ''
    document.getElementById('country').value = ''
    document.getElementById('state').value = ''
    document.getElementById('cardnumber').value = ''
    document.getElementById('expmonth').value = ''
    document.getElementById('expyear').value = ''
    document.getElementById('cvv').value = ''
    document.getElementById('profilename').value = ''
    document.getElementById('onecheckout').value = ''
    document.getElementById('email').value = ''
    document.getElementById('phone').value = '';

    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        document.getElementById('profiles2').rows[i].cells[0].style.background = '';
    }
}

function clearProxyFields() {
    document.getElementById('proxyListEntry').value = ''
    document.getElementById('proxyListName').value = '';
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        document.getElementById('proxies2').rows[i].cells[0].style.background = '';
        document.getElementById('proxies2').rows[i].cells[1].style.background = '';
    }
}



function clearAccountFields() {
    document.getElementById('accountListEntry').value = ''
    document.getElementById('accountListName').value = '';
    for (var i = 1; i < document.getElementById('accounts2').rows.length; i++) {
        document.getElementById('accounts2').rows[i].cells[0].style.background = '';
        document.getElementById('accounts2').rows[i].cells[1].style.background = '';
    }
}

function deleteProxyList() {
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        if (document.getElementById('proxies2').rows[i].cells[0].style.background != '') {
            document.getElementById("proxies2").deleteRow(i);
            var fs = require('fs')
            fs.readFile(path.join(configDir, '/userdata/proxies.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x = JSON.parse(data);
                for (var j = 0; j < x.length; j++) {
                    if (x[j].name === document.getElementById("proxyListName").value) {
                        x.splice(j, 1);

                    }
                }

                clearProxyFields()

                fs.writeFile(path.join(configDir, '/userdata/proxies.json'), JSON.stringify(x), function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                });
            });
        }
    }
}



function deleteAccountList() {
    for (var i = 1; i < document.getElementById('accounts2').rows.length; i++) {
        if (document.getElementById('accounts2').rows[i].cells[0].style.background != '') {
            document.getElementById("accounts2").deleteRow(i);
            var fs = require('fs')
            fs.readFile(path.join(configDir, '/userdata/accounts.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x = JSON.parse(data);
                for (var j = 0; j < x.length; j++) {
                    if (x[j].name === document.getElementById("accountListName").value) {
                        x.splice(j, 1);
                    }
                }

                clearAccountFields()

                fs.writeFile(path.join(configDir, '/userdata/accounts.json'), JSON.stringify(x), function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                });
            });
        }
    }
}


function profile() {
    clearFields();
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("accountIcon").style.opacity = 0.3
    document.getElementById("captchaIcon").style.opacity = 0.3
    document.getElementById("profileIcon").style.opacity = 1.0
    document.getElementById("proxyIcon").style.opacity = 0.3
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('profileTitle').style.display = "block";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('profiles').style.display = "block";
    document.getElementById('proxiesTitle').style.display = "none";
    document.getElementById('proxies').style.display = "none";
    document.getElementById('accountsTitle').style.display = "none";
    document.getElementById('accounts').style.display = "none";
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById('analyticsTitle').style.display = "none";
    document.getElementById('firstname').value = ''
    document.getElementById('lastname').value = ''
    document.getElementById('address').value = ''
    document.getElementById('city').value = ''
    document.getElementById('zipcode').value = ''
    document.getElementById('country').value = ''
    document.getElementById('state').value = ''
    document.getElementById('cardnumber').value = ''
    document.getElementById('expmonth').value = ''
    document.getElementById('expyear').value = ''
    document.getElementById('cvv').value = ''
    document.getElementById('profilename').value = ''
    document.getElementById('onecheckout').value = ''
    document.getElementById('email').value = ''
    document.getElementById('phone').value = '';
    document.getElementById('captchasTitle').style.display = "none";
    document.getElementById('captchas').style.display = "none";
}

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


function tasks() {
    var select = document.getElementById('profileTask');
    select.options.length = 0;
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('profiles2').rows[i].cells[0].textContent, document.getElementById('profiles2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('proxyTask');
    select.options.length = 1;
    select.options[select.options.length] = new Option('None', '-')
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('proxies2').rows[i].cells[0].textContent, document.getElementById('proxies2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('accountTask');
    select.options.length = 1;
    select.options[select.options.length] = new Option('None', '-')
    for (var i = 1; i < document.getElementById('accounts2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('accounts2').rows[i].cells[0].textContent, document.getElementById('accounts2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('profileTask2');
    select.options.length = 1;
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('profiles2').rows[i].cells[0].textContent, document.getElementById('profiles2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('proxyTask2');
    select.options.length = 1;
    select.options[select.options.length] = new Option('None', '-')
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('proxies2').rows[i].cells[0].textContent, document.getElementById('proxies2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('accountTask2');
    select.options.length = 1;
    select.options[select.options.length] = new Option('None', '-')
    for (var i = 1; i < document.getElementById('accounts2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('accounts2').rows[i].cells[0].textContent, document.getElementById('accounts2').rows[i].cells[0].textContent);
    }
    document.getElementById("settingsIcon").style.transition = "0.3s"
    document.getElementById("taskIcon").style.transition = "0.3s"
    document.getElementById("accountIcon").style.transition = "0.3s"
    document.getElementById("proxyIcon").style.transition = "0.3s"
    document.getElementById("captchaIcon").style.transition = "0.3s"
    document.getElementById("profileIcon").style.transition = "0.3s"
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("accountIcon").style.opacity = 0.3
    document.getElementById("captchaIcon").style.opacity = 0.3
    document.getElementById("profileIcon").style.opacity = 0.3
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById("proxyIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 1.0
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('taskView').style.display = "block";
    document.getElementById('analyticsTitle').style.display = "none";
    document.getElementById('profileTitle').style.display = "none";
    document.getElementById('profiles').style.display = "none";
    document.getElementById('proxiesTitle').style.display = "none";
    document.getElementById('proxies').style.display = "none";
    document.getElementById('accountsTitle').style.display = "none";
    document.getElementById('accounts').style.display = "none";
    document.getElementById('captchasTitle').style.display = "none";
    document.getElementById('captchas').style.display = "none";
}

function settings() {
    var select = document.getElementById('profileQTSelect');
    select.options.length = 0;
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('profiles2').rows[i].cells[0].textContent, document.getElementById('profiles2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('proxyQTSelect');
    select.options.length = 0;
    select.options[select.options.length] = new Option('None', '-')
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('proxies2').rows[i].cells[0].textContent, document.getElementById('proxies2').rows[i].cells[0].textContent);
    }

    var settings = storage.getSync("settings")
    profileQTSelect.set(settings[1].qtProfile)
    proxyQTSelect.set(settings[1].qtProxy)
    sizeQTSelect.set(settings[1].qtSize)

    document.getElementById("settingsIcon").style.opacity = 1.0
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("accountIcon").style.opacity = 0.3
    document.getElementById("captchaIcon").style.opacity = 0.3
    document.getElementById("profileIcon").style.opacity = 0.3
    document.getElementById("proxyIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsDiv').style.display = "block";
    document.getElementById('profileTitle').style.display = "none";
    document.getElementById('settingsTitle').style.display = "block";
    document.getElementById('profiles').style.display = "none";
    document.getElementById('proxiesTitle').style.display = "none";
    document.getElementById('proxies').style.display = "none";
    document.getElementById('accountsTitle').style.display = "none";
    document.getElementById('accounts').style.display = "none";
    document.getElementById('captchasTitle').style.display = "none";
    document.getElementById('analyticsTitle').style.display = "none";
    document.getElementById('captchas').style.display = "none";
}

function proxies() {
    clearProxyFields();
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("accountIcon").style.opacity = 0.3
    document.getElementById("captchaIcon").style.opacity = 0.3
    document.getElementById("profileIcon").style.opacity = 0.3
    document.getElementById("proxyIcon").style.opacity = 1.0
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsDiv').style.display = "block";
    document.getElementById('profileTitle').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('profiles').style.display = "none";
    document.getElementById('proxiesTitle').style.display = "block";
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById('analyticsTitle').style.display = "none";
    document.getElementById('proxies').style.display = "block";
    document.getElementById('accountsTitle').style.display = "none";
    document.getElementById('accounts').style.display = "none";
    document.getElementById('captchasTitle').style.display = "none";
    document.getElementById('captchas').style.display = "none";
}

function accounts() {
    clearAccountFields();
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("accountIcon").style.opacity = 1.0
    document.getElementById("captchaIcon").style.opacity = 0.3
    document.getElementById("profileIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("proxyIcon").style.opacity = 0.3
    document.getElementById('taskView').style.display = "none";
    document.getElementById('profileTitle').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('profiles').style.display = "none";
    document.getElementById('proxiesTitle').style.display = "none";
    document.getElementById('proxies').style.display = "none";
    document.getElementById('accountsTitle').style.display = "block";
    document.getElementById('accounts').style.display = "block";
    document.getElementById('analyticsView').style.display = "none"
    document.getElementById('analyticsTitle').style.display = "none";;
    document.getElementById('captchasTitle').style.display = "none";
    document.getElementById('captchas').style.display = "none";
}

function captchas() {
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("accountIcon").style.opacity = 0.3
    document.getElementById("captchaIcon").style.opacity = 1.0
    document.getElementById("profileIcon").style.opacity = 0.3
    document.getElementById("proxyIcon").style.opacity = 0.3
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('profileTitle').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('analyticsView').style.display = "none";
    document.getElementById('analyticsTitle').style.display = "none";
    document.getElementById('profiles').style.display = "none";
    document.getElementById('proxiesTitle').style.display = "none";
    document.getElementById('proxies').style.display = "none";
    document.getElementById('accountsTitle').style.display = "none";
    document.getElementById('accounts').style.display = "none";
    document.getElementById('captchasTitle').style.display = "block";
    document.getElementById('captchas').style.display = "block";

}

function analytics() {
    document.getElementById("checkoutsTable").innerHTML = ""
    updateAnalytics()
    setProfilePicture();
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 1.0
    document.getElementById('profileTitle').style.display = "none";
    document.getElementById('profiles').style.display = "none";
    document.getElementById("accountIcon").style.opacity = 0.3
    document.getElementById("captchaIcon").style.opacity = 0.3
    document.getElementById("profileIcon").style.opacity = 0.3
    document.getElementById('analyticsTitle').style.display = "block";
    document.getElementById("proxyIcon").style.opacity = 0.3
    document.getElementById('analyticsView').style.display = "block";
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('proxiesTitle').style.display = "none";
    document.getElementById('proxies').style.display = "none";
    document.getElementById('accountsTitle').style.display = "none";
    document.getElementById('accounts').style.display = "none";
    document.getElementById('captchasTitle').style.display = "none";
    document.getElementById('captchas').style.display = "none";
}