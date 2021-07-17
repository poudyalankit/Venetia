const electron = require('electron');


const { ipcRenderer } = electron;
var path = require('path')
var isMouseDown = false;

const configDir = (electron.app || electron.remote.app).getPath('userData');

var fs = require('fs');
const { controllers } = require('chart.js');
const { eventNames } = require('process');

var statusCache = {}
var titleCache = {}
if (!fs.existsSync(configDir + "/userdata")) {
    fs.mkdirSync(configDir + "/userdata");
}


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
    var fs = require('fs');
    var settings = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/settings.json'), { encoding: 'utf8', flag: 'r' }));
    settings[0].retryCheckouts = document.getElementById("retryCheckouts").checked
    settings[0].systemNotifs = document.getElementById("systemNotifs").checked
    settings[0].checkoutSound = document.getElementById("checkoutSound").checked
    fs.writeFile(path.join(configDir, '/userdata/settings.json'), JSON.stringify(settings), function(err) {
        if (err) throw err;
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


function launchHarvester() {
    for (var i = 1; i < document.getElementById('captchas2').rows.length; i++) {
        if (document.getElementById('captchas2').rows[i].cells[0].style.background != '') {
            var harvesterProxy = document.getElementById('harvesterProxy').value;
            var harvesterName = document.getElementById('harvesterName').value;
            ipcRenderer.send('launchHarvester', harvesterName, harvesterProxy)
        }
    }
}

function googleSignIn() {
    for (var i = 1; i < document.getElementById('captchas2').rows.length; i++) {
        if (document.getElementById('captchas2').rows[i].cells[0].style.background != '') {
            var harvesterProxy = document.getElementById('harvesterProxy').value;
            var harvesterName = document.getElementById('harvesterName').value;
            ipcRenderer.send('googleSignIn', harvesterName, harvesterProxy)
        }
    }
}


function modeChoices() {

    if (document.getElementById("siteTask").value === "FootLockerCA" || document.getElementById("siteTask").value === "FootLocker" || document.getElementById("siteTask").value === "EastBay" || document.getElementById("siteTask").value === "ChampsSports" || document.getElementById("siteTask").value === "FootAction" || document.getElementById("siteTask").value === "KidsFootLocker") {
        var select = document.getElementById("modeTask")
        document.getElementById("captchaLess").checked = false;
        document.getElementById("accountTask").disabled = false;
        document.getElementById("modeTask").disabled = false;
        document.getElementById("sizeTask").disabled = false;
        document.getElementById("proxyTask").disabled = false;
        document.getElementById("scheduleFeature").style = "display: none";

        document.getElementById("profileTask").disabled = false;
        document.getElementById("quantityTask").disabled = false;
        document.getElementById("linkTask").disabled = false;
        document.getElementById("hourTaskEntry").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Release", "Release");
        if (document.getElementById("proxyTask").value != "-") {
            document.getElementById("captchaLessLabel").textContent = "Captchaless"
            document.getElementById("captchaLess").style = "position: absolute; top: 510px; left:440px; display: block"
            document.getElementById("captchaLessLabel").style = "position: absolute; top: 513px; font-size: 12px; width: 200px; left: 476px; display: block; color: white;font-family: Poppins;"
        }
    }

    if (document.getElementById("siteTask").value === "SSENSE") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = false;
        document.getElementById("modeTask").disabled = false;
        document.getElementById("sizeTask").disabled = false;
        document.getElementById("proxyTask").disabled = false;
        document.getElementById("profileTask").disabled = false;
        document.getElementById("quantityTask").disabled = false;
        document.getElementById("linkTask").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Safe", "Safe");
        select.options[select.options.length] = new Option("Preload", "Preload");
        select.options[select.options.length] = new Option("Fast", "Fast");
        document.getElementById("captchaLess").style = "position: absolute; top: 510px; left:440px; display: block"
        document.getElementById("captchaLessLabel").style = "position: absolute; top: 513px; font-size: 12px; width: 200px; left: 476px; display: block; color: white;font-family: Poppins;"
        document.getElementById("captchaLess").checked = false;
        document.getElementById("captchaLessLabel").textContent = "Card checkout"
        document.getElementById("scheduleFeature").style = "display: none";
    }


    if (document.getElementById("siteTask").value === "Shiekh") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = false;
        document.getElementById("modeTask").disabled = false;
        document.getElementById("sizeTask").disabled = false;
        document.getElementById("proxyTask").disabled = false;
        document.getElementById("profileTask").disabled = false;
        document.getElementById("quantityTask").disabled = false;
        document.getElementById("linkTask").disabled = false;
        select.options.length = 0;
        document.getElementById("scheduleFeature").style = "display: block";
        select.options[select.options.length] = new Option("Fast", "Fast");
        document.getElementById("captchaLess").style = "display: none;"
        document.getElementById("captchaLessLabel").style = "display: none;"
        document.getElementById("captchaLess").checked = false;
    }

    if (document.getElementById("siteTask").value === "Federal Premium") {
        var select = document.getElementById("modeTask")
        document.getElementById("accountTask").disabled = true;
        document.getElementById("modeTask").disabled = false;
        document.getElementById("scheduleFeature").style = "display: none";
        document.getElementById("sizeTask").disabled = false;
        document.getElementById("proxyTask").disabled = false;
        document.getElementById("profileTask").disabled = false;
        document.getElementById("quantityTask").disabled = false;
        document.getElementById("linkTask").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Fast", "Fast");
        document.getElementById("captchaLess").style = "display: none;"
        document.getElementById("captchaLessLabel").style = "display: none;"
        document.getElementById("captchaLess").checked = false;
    }

    if (document.getElementById("siteTask").value === "Supreme") {
        var select = document.getElementById("modeTask")
        document.getElementById("modeTask").disabled = false;
        document.getElementById("proxyTask").disabled = false;
        document.getElementById("profileTask").disabled = false;
        document.getElementById("quantityTask").disabled = false;
        document.getElementById("linkTask").disabled = false;
        document.getElementById("sizeTask").disabled = false;
        var accounts = document.getElementById("accountTask")
        accounts.options.length = 0;
        document.getElementById("scheduleFeature").style = "display: none";

        accounts.options[accounts.options.length] = new Option("No Account", "-")
        select.options.length = 0;
        select.options[select.options.length] = new Option("Hybrid", "Hybrid");
        select.options[select.options.length] = new Option("Restock", "Restock");
        document.getElementById("captchaLess").style = "display: none;"
        document.getElementById("captchaLessLabel").style = "display: none;"
        document.getElementById("captchaLess").checked = false;
    }

    var shopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores2.json'), { encoding: 'utf8', flag: 'r' }));
    var customshopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores.json'), { encoding: 'utf8', flag: 'r' }));
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
            document.getElementById("modeTask").disabled = false;
            document.getElementById("sizeTask").disabled = false;
            document.getElementById("proxyTask").disabled = false;
            document.getElementById("profileTask").disabled = false;
            document.getElementById("quantityTask").disabled = false;
            document.getElementById("linkTask").disabled = false;
            document.getElementById("scheduleFeature").style = "display: none";

            select.options.length = 0;
            select.options[select.options.length] = new Option("Safe", "Safe");
            select.options[select.options.length] = new Option("Preload", "Preload");
            select.options[select.options.length] = new Option("Fast", "Fast");
            select.options[select.options.length] = new Option("Prestock", "Prestock");
            document.getElementById("captchaLess").style = "display: none;"
            document.getElementById("captchaLessLabel").style = "display: none;"
            document.getElementById("captchaLess").checked = false;
            break;
        }
    }
}

function modeChoices2() {
    if (document.getElementById("siteTask2").value === "FootLockerCA" || document.getElementById("siteTask2").value === "FootLocker" || document.getElementById("siteTask2").value === "EastBay" || document.getElementById("siteTask2").value === "ChampsSports" || document.getElementById("siteTask2").value === "FootAction" || document.getElementById("siteTask2").value === "KidsFootLocker") {
        var select = document.getElementById("modeTask2")
        document.getElementById("captchaLess2").checked = false;
        document.getElementById("accountTask2").disabled = false;
        document.getElementById("modeTask2").disabled = false;
        document.getElementById("sizeTask2").disabled = false;
        document.getElementById("proxyTask2").disabled = false;
        document.getElementById("scheduleFeature2").style = "display: none";

        document.getElementById("profileTask2").disabled = false;
        document.getElementById("quantityTask2").disabled = false;
        document.getElementById("linkTask2").disabled = false;
        document.getElementById("hourTaskEntry2").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Release", "Release");
        if (document.getElementById("proxyTask2").value != "-") {
            document.getElementById("captchaLessLabel2").textContent = "Captchaless"
            document.getElementById("captchaLess2").style = "position: absolute; top: 510px; left:440px; display: block"
            document.getElementById("captchaLessLabel2").style = "position: absolute; top: 513px; font-size: 12px; width: 200px; left: 476px; display: block; color: white;font-family: Poppins;"
        }
    }

    if (document.getElementById("siteTask2").value === "SSENSE") {
        var select = document.getElementById("modeTask2")
        document.getElementById("accountTask2").disabled = false;
        document.getElementById("modeTask2").disabled = false;
        document.getElementById("sizeTask2").disabled = false;
        document.getElementById("proxyTask2").disabled = false;
        document.getElementById("profileTask2").disabled = false;
        document.getElementById("quantityTask2").disabled = false;
        document.getElementById("linkTask2").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Safe", "Safe");
        select.options[select.options.length] = new Option("Preload", "Preload");

        //select.options[select.options.length] = new Option("Fast", "Fast");
        document.getElementById("captchaLess2").style = "position: absolute; top: 510px; left:440px; display: block"
        document.getElementById("captchaLessLabel2").style = "position: absolute; top: 513px; font-size: 12px; width: 200px; left: 476px; display: block; color: white;font-family: Poppins;"
        document.getElementById("captchaLess2").checked = false;
        document.getElementById("captchaLessLabel2").textContent = "Card checkout"
        document.getElementById("scheduleFeature2").style = "display: none";
    }


    if (document.getElementById("siteTask2").value === "Shiekh") {
        var select = document.getElementById("modeTask2")
        document.getElementById("accountTask2").disabled = false;
        document.getElementById("modeTask2").disabled = false;
        document.getElementById("sizeTask2").disabled = false;
        document.getElementById("proxyTask2").disabled = false;
        document.getElementById("profileTask2").disabled = false;
        document.getElementById("quantityTask2").disabled = false;
        document.getElementById("linkTask2").disabled = false;
        select.options.length = 0;
        document.getElementById("scheduleFeature2").style = "display: block";
        select.options[select.options.length] = new Option("Fast", "Fast");
        document.getElementById("captchaLess2").style = "display: none;"
        document.getElementById("captchaLessLabel2").style = "display: none;"
        document.getElementById("captchaLess2").checked = false;
    }

    if (document.getElementById("siteTask2").value === "Federal Premium") {
        var select = document.getElementById("modeTask2")
        document.getElementById("accountTask2").disabled = true;
        document.getElementById("modeTask2").disabled = false;
        document.getElementById("scheduleFeature2").style = "display: none";
        document.getElementById("sizeTask2").disabled = false;
        document.getElementById("proxyTask2").disabled = false;
        document.getElementById("profileTask2").disabled = false;
        document.getElementById("quantityTask2").disabled = false;
        document.getElementById("linkTask2").disabled = false;
        select.options.length = 0;
        select.options[select.options.length] = new Option("Fast", "Fast");
        document.getElementById("captchaLess2").style = "display: none;"
        document.getElementById("captchaLessLabel2").style = "display: none;"
        document.getElementById("captchaLess2").checked = false;
    }


    if (document.getElementById("siteTask2").value === "Supreme") {
        var select = document.getElementById("modeTask2")
        document.getElementById("modeTask2").disabled = false;
        document.getElementById("proxyTask2").disabled = false;
        document.getElementById("profileTask2").disabled = false;
        document.getElementById("quantityTask2").disabled = false;
        document.getElementById("linkTask2").disabled = false;
        document.getElementById("sizeTask2").disabled = false;
        var accounts = document.getElementById("accountTask2")
        accounts.options.length = 0;
        document.getElementById("scheduleFeature2").style = "display: none";

        accounts.options[accounts.options.length] = new Option("No Account", "-")
        select.options.length = 0;
        select.options[select.options.length] = new Option("Hybrid", "Hybrid");
        select.options[select.options.length] = new Option("Restock", "Restock");
        document.getElementById("captchaLess2").style = "display: none;"
        document.getElementById("captchaLessLabel2").style = "display: none;"
        document.getElementById("captchaLess2").checked = false;
    }

    var shopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores2.json'), { encoding: 'utf8', flag: 'r' }));
    var customshopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores.json'), { encoding: 'utf8', flag: 'r' }));
    for (var i = 0; i < customshopify.length; i++) {
        shopify.push({
            site: customshopify[i].site,
            baseLink: customshopify[i].baseLink
        })
    }

    for (var i = 0; i < shopify.length; i++) {
        if (document.getElementById("siteTask2").value === shopify[i].site) {
            var select = document.getElementById("modeTask2")
            document.getElementById("accountTask2").disabled = false;
            document.getElementById("modeTask2").disabled = false;
            document.getElementById("sizeTask2").disabled = false;
            document.getElementById("proxyTask2").disabled = false;
            document.getElementById("profileTask2").disabled = false;
            document.getElementById("quantityTask2").disabled = false;
            document.getElementById("linkTask2").disabled = false;
            document.getElementById("scheduleFeature2").style = "display: none";

            select.options.length = 0;
            select.options[select.options.length] = new Option("Safe", "Safe");
            select.options[select.options.length] = new Option("Preload", "Preload");
            select.options[select.options.length] = new Option("Fast", "Fast");
            select.options[select.options.length] = new Option("Prestock", "Prestock");

            document.getElementById("captchaLess2").style = "display: none;"
            document.getElementById("captchaLessLabel2").style = "display: none;"
            document.getElementById("captchaLess2").checked = false;
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

function removeNulls(obj) {
    var isArray = obj instanceof Array;
    for (var k in obj) {
        if (obj[k] === null) isArray ? obj.splice(k, 1) : delete obj[k];
        else if (typeof obj[k] == "object") removeNulls(obj[k]);
    }
}

function deleteSelected() {
    stopSelected()
    if (document.getElementById('tasks').rows.length === 1)
        deleteGroup()
    else {
        var groupIndex;
        var groupName;
        var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
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
        fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify(groups), function(err) {
            if (err) throw err;
            console.log('Tasks saved!');
        });

        document.getElementById('groups').rows[groupIndex].cells[0].children[1].textContent = (document.getElementById('tasks').rows.length - 1).toString() + " tasks"
    }
}


function taskEditor() {
    if (document.getElementById('groups').rows.length > 0) {
        document.getElementById("darkenBackground").style.display = "block";
        document.getElementById("taskEditor").style.display = "block";
    }
}


function cloneSelected() {
    var fs = require('fs');
    var gname;
    var gindex;
    for (var i = 0; i < document.getElementById('groups').rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style['border-left'] === "1px solid rgb(224, 103, 103)") {
            gname = document.getElementById('groups').rows[i].cells[0].children[0].value
            gindex = i
            break;
        }
    }
    var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
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
                "<td >" + task[id].size + "</td>" +
                "<td>" + task[id].profile + "</td>" +
                "<td>" + task[id].proxies + "</td>" +
                "<td>" + 'Stopped' + "</td>"
            groups[gindex][gname].push(task)
        }
    }
    fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify(groups), function(err) {
        if (err) throw err;
        console.log('Tasks saved!');
    });

    document.getElementById('groups').rows[gindex].cells[0].children[1].textContent = (document.getElementById('tasks').rows.length - 1).toString() + " tasks"

}

function update() {
    ipcRenderer.send('update')
}

function deleteAllProfiles() {
    $("#profiles2 tr:gt(0)").remove();
    fs.writeFile(path.join(configDir, '/userdata/profiles.json'), JSON.stringify([]), function(err) {})
}

function deleteProfile() {
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        if (document.getElementById('profiles2').rows[i].cells[0].style.background != '') {
            document.getElementById("profiles2").deleteRow(i);
            var fs = require('fs')
            fs.readFile(path.join(configDir, '/userdata/profiles.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x = JSON.parse(data);
                for (var j = 0; j < x.length; j++) {

                    if (x[j].name === document.getElementById("profilename").value) {

                        x.splice(j, 1);
                    }

                }
                clearFields()

                fs.writeFile(path.join(configDir, '/userdata/profiles.json'), JSON.stringify(x), function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                });

            });
        }
    }



}


function reverify() {
    var fs = require('fs');
    const got = require('got');
    got({
            method: 'get',
            url: 'https://venetiabots.com/api/shopifyStores',
            responseType: 'json'
        }).then(response => {
            var storelist = []
            var select = document.getElementById("siteTask")
            var select2 = document.getElementById("siteTask2")
            var currentSelection = document.getElementById("siteTask").value
            var currentEditedSelection = document.getElementById("siteTask2").value
            select.options.length = 12;
            select2.options.length = 12;
            for (var i = 0; i < response.body.length; i++) {
                select.options[select.options.length] = new Option(response.body[i].site, response.body[i].site);
                select2.options[select2.options.length] = new Option(response.body[i].site, response.body[i].site);
                storelist.push({
                    site: response.body[i].site,
                    baseLink: response.body[i].baseLink
                })
            }
            select.options[select.options.length] = new Option("-- Custom Shopify -- ", "-- Custom Shopify --")
            select2.options[select2.options.length] = new Option("-- Custom Shopify -- ", "-- Custom Shopify --")
            select.options[select.options.length - 1].disabled = true;
            select2.options[select2.options.length - 1].disabled = true;
            var customshopify = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores.json'), { encoding: 'utf8', flag: 'r' }));
            for (var i = 0; i < customshopify.length; i++) {
                select.options[select.options.length] = new Option(customshopify[i].site, customshopify[i].site);
                select2.options[select2.options.length] = new Option(customshopify[i].site, customshopify[i].site);
            }
            fs.writeFile(path.join(configDir, '/userdata/shopifyStores2.json'), JSON.stringify(storelist), function(err) {
                if (err) throw err;
            });
            document.getElementById("siteTask").value = currentSelection
            document.getElementById("siteTask2").value = currentEditedSelection
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

    require('select2')($);

    $('#shopifyStores').select2({
        placeholder: "Select store"
    });

    $('#profileQTSelect').select2({
        placeholder: "Select profile"
    });

    $('#proxyQTSelect').select2({
        placeholder: "Select proxies"
    });

    $('#sizeQTSelect').select2({
        placeholder: "Select size",
        tags: true
    });

    $('#siteTask').select2({
        placeholder: "Select site"
    });

    $('#accountTask').select2({
        placeholder: "Select accounts"
    });

    $('#modeTask').select2({
        placeholder: "Select mode",
        minimumResultsForSearch: Infinity
    });

    $('#sizeTask').select2({
        placeholder: "Select size",
        tags: true,
    });

    //$('#sizeTask').attr('multiple', 'multiple');


    $('#profileTask').select2({
        placeholder: "Select profile"
    });

    $('#proxyTask').select2({
        placeholder: "Select proxies"
    });


    $('#siteTask2').select2({
        placeholder: "Select site"
    });

    $('#accountTask2').select2({
        placeholder: "Select accounts"
    });

    $('#modeTask2').select2({
        placeholder: "Select mode",
        minimumResultsForSearch: Infinity
    });

    $('#sizeTask2').select2({
        placeholder: "Select size",
        tags: true
    });

    $('#profileTask2').select2({
        placeholder: "Select profile"
    });

    $('#proxyTask2').select2({
        placeholder: "Select proxies"
    });



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
            fs.readFile(path.join(configDir, '/userdata/profiles.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x = JSON.parse(data);
                for (var i = 0; i < JSON.parse(content).length; i++) {
                    x.push(JSON.parse(content)[i])
                    var tableRef = document.getElementById('profiles2').getElementsByTagName('tbody')[0];
                    tableRef.insertRow().innerHTML =
                        "<td onclick='showProfile(this.textContent)' style='padding-bottom: 5px'>" + JSON.parse(content)[i].name + "</td>"

                }
                fs.writeFile(path.join(configDir, '/userdata/profiles.json'), JSON.stringify(x), function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');

                });

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


    var fs = require('fs');



    fs.readFile(path.join(configDir, '/userdata/profiles.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/profiles.json'), JSON.stringify([]), function(err) {})
            throw err;
        }
        var x = JSON.parse(data);
        for (var i = 0; i < x.length; i++) {

            var tableRef = document.getElementById('profiles2').getElementsByTagName('tbody')[0];
            tableRef.insertRow().innerHTML =
                "<td onclick='showProfile(this.textContent)' style='padding-bottom: 5px'>" + x[i].name + "</td>"
        }

    });


    fs.readFile(path.join(configDir, '/userdata/delays.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/delays.json'), JSON.stringify([]), function(err) {})
            throw err;
        }
    });




    fs.readFile(path.join(configDir, '/userdata/proxies.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/proxies.json'), JSON.stringify([]), function(err) {})

            throw err;
        }
        var x = JSON.parse(data);
        for (var i = 0; i < x.length; i++) {
            var tableRef = document.getElementById('proxies').getElementsByTagName('tbody')[0];
            tableRef.insertRow().innerHTML =
                "<td onclick='showProxies(this.textContent)' style='padding-bottom: 5px'>" + x[i].name + "</td>" +
                "<td onclick='showProxiesbyCount(this)' style='padding-bottom: 5px'>" + x[i].proxies.length + "</td>"
        }
    });

    fs.readFile(path.join(configDir, '/userdata/shopifyStores.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/shopifyStores.json'), JSON.stringify([]), function(err) {})

            throw err;
        }
        var x = JSON.parse(data);
        var shopifysites = document.getElementById("shopifyStores")
        shopifysites.options.length = 0;
        shopifysites.options[shopifysites.options.length] = new Option('', '')

        for (var i = 0; i < x.length; i++) {
            shopifysites.options[shopifysites.options.length] = new Option(x[i].site, x[i].site);
        }

    });

    fs.readFile(path.join(configDir, '/userdata/shopifyStores2.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/shopifyStores2.json'), JSON.stringify([]), function(err) {})
            throw err;
        }
    });


    fs.readFile(path.join(configDir, '/userdata/accounts.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/accounts.json'), JSON.stringify([]), function(err) {})

            throw err;
        }
        var x = JSON.parse(data);
        for (var i = 0; i < x.length; i++) {
            var tableRef = document.getElementById('accounts').getElementsByTagName('tbody')[0];
            tableRef.insertRow().innerHTML =
                "<td onclick='showAccounts(this.textContent)' style='padding-bottom: 5px'>" + x[i].name + "</td>" +
                "<td onclick='showAccountsbyCount(this)' style='padding-bottom: 5px'>" + x[i].account.length + "</td>"
        }
    });

    fs.readFile(path.join(configDir, '/userdata/harvesters.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/harvesters.json'), JSON.stringify([]), function(err) {})
            throw err;
        }
        var x = JSON.parse(data);
        for (var i = 0; i < x.length; i++) {

            var tableRef = document.getElementById('captchas2').getElementsByTagName('tbody')[0];
            tableRef.insertRow().innerHTML =
                "<td onclick='showHarvesters(this.textContent)' style='padding-bottom: 5px'>" + x[i].name + "</td>"
        }

    });

    fs.readFile(path.join(configDir, '/userdata/logs.txt'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/logs.txt'), "", function(err) {})
            throw err;
        }
    })

    fs.readFile(path.join(configDir, '/userdata/tasks.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify([]), function(err) {})
            throw err;
        }
        var tasks = JSON.parse(data);
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
    })


    fs.readFile(path.join(configDir, '/userdata/settings.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/settings.json'), JSON.stringify([{ "webhook": "", "checkoutSound": false, "retryCheckouts": false, "systemNotifs": false }, {
                "qtProfile": "",
                "qtProxy": "",
                "qtSize": ""
            }]), function(err) {})
            throw err;
        }
        data = JSON.parse(data)
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
            fs.writeFile(path.join(configDir, '/userdata/settings.json'), JSON.stringify([{ "webhook": "", "checkoutSound": false, "retryCheckouts": false, "systemNotifs": false }, {
                "qtProfile": "",
                "qtProxy": "",
                "qtSize": ""
            }]), function(err) {})
        }

        var select = document.getElementById('profileQTSelect');
        select.options.length = 0;
        select.options[select.options.length] = new Option('', '')
        for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
            select.options[select.options.length] = new Option(document.getElementById('profiles2').rows[i].cells[0].textContent, document.getElementById('profiles2').rows[i].cells[0].textContent);
        }

        var select = document.getElementById('proxyQTSelect');
        select.options.length = 0;
        select.options[select.options.length] = new Option('', '')
        select.options[select.options.length + 1] = new Option('No Proxy', '-')
        for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
            select.options[select.options.length] = new Option(document.getElementById('proxies2').rows[i].cells[0].textContent, document.getElementById('proxies2').rows[i].cells[0].textContent);
        }

        $('#profileQTSelect').val(data[1].qtProfile);
        $('#proxyQTSelect').val(data[1].qtProxy);
        $('#sizeQTSelect').val(data[1].qtSize);
        $('#sizeQTSelect').trigger('change')

    });

    fs.readFile(path.join(configDir, '/userdata/apiKey.json'), 'utf-8', (err, data) => {
        if (err) {
            fs.writeFile(path.join(configDir, '/userdata/apiKey.json'), JSON.stringify([{ "service": '', "apiKey": '' }]), function(err) {})
            throw err;
        }
        data = JSON.parse(data)
        document.getElementById("capMonsterKey").value = data[0].apiKey;
        document.getElementById("apiSelection").value = data[0].service;
    });

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
                var tableRef = document.getElementById('checkoutsTable').getElementsByTagName('tbody')[0];
                var d = new Date(success[i]['Date'])
                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                var checkoutDate = months[d.getMonth()] + " " + d.getDay()
                tableRef.insertRow().innerHTML =
                    "<td class='checkouts'>" + success[i]['Product'] + "</td>" + "<td>" + success[i]['Site'] + "</td>" + "<td>" + success[i]['Price'] + "</td>" +
                    "<td>" + success[i]['Size'] + "</td>" + "<td>" + checkoutDate + "</td>"
            }
            document.getElementById("totalSpent").textContent = "$" + total.toString()
            var checkouts = [0, 0, 0, 0, 0, 0, 0]
            for (var i = 1; i < document.getElementById('checkoutsTable').rows.length; i++) {
                if (document.getElementById('checkoutsTable').rows[i].cells[4].textContent.includes("Jan"))
                    checkouts[0]++
                    else if (document.getElementById('checkoutsTable').rows[i].cells[4].textContent.includes("Feb"))
                        checkouts[1]++
                        else if (document.getElementById('checkoutsTable').rows[i].cells[4].textContent.includes("Mar"))
                            checkouts[2]++
                            else if (document.getElementById('checkoutsTable').rows[i].cells[4].textContent.includes("Apr"))
                                checkouts[3]++
                                else if (document.getElementById('checkoutsTable').rows[i].cells[4].textContent.includes("May"))
                                    checkouts[4]++
                                    else if (document.getElementById('checkoutsTable').rows[i].cells[4].textContent.includes("Jun"))
                                        checkouts[5]++
                                        else if (document.getElementById('checkoutsTable').rows[i].cells[4].textContent.includes("Jul"))
                                            checkouts[6]++

            }
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



function showHarvesters(harvesterName) {
    clearHarvesterFields()
    var fs = require('fs');
    fs.readFile(path.join(configDir, '/userdata/harvesters.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        x = JSON.parse(data);

        for (var i = 0; i < x.length; i++) {
            document.getElementById('captchas2').rows[i + 1].cells[0].style.background = '';
        }

        for (var i = 0; i < x.length; i++) {
            if (x[i].name === harvesterName) {
                document.getElementById('captchas2').rows[i + 1].cells[0].style.background = '#181a26';
                document.getElementById('harvesterName').value = x[i].name;
                document.getElementById('harvesterProxy').value = x[i].proxy;
                break;
            }
        }
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

    /*  if (event.shiftKey) {
          var startRowIndex;
          for (var i = 0; i < document.getElementById("tasks").rows.length; i++) {
              if (document.getElementById("tasks").rows[i].cells[0].children[0].checked == true) {
                  startRowIndex = i;
                  break;
              }
          }
          console.log(row.closest("tr").rowIndex)
          if (startRowIndex < row.closest("tr").rowIndex)
              for (var j = startRowIndex; j <= row.closest("tr").rowIndex; j++) {
                  if (document.getElementById('tasks').rows[j].style.display != "none") {
                      document.getElementById("tasks").rows[j].cells[0].children[0].checked = true;
                      document.getElementById("tasks").rows[j].cells[0].children[0].style.background = "#e06767";
                  }
              }
          else {
              for (var i = 0; i < document.getElementById("tasks").rows.length; i++) {
                  if (document.getElementById("tasks").rows[i].cells[0].children[0].checked == true && i != row.closest("tr").rowIndex) {
                      startRowIndex = i;
                      break;
                  }
              }
              for (var j = row.closest("tr").rowIndex; j <= startRowIndex; j++) {
                  if (document.getElementById('tasks').rows[j].style.display != "none") {
                      document.getElementById("tasks").rows[j].cells[0].children[0].checked = true;
                      document.getElementById("tasks").rows[j].cells[0].children[0].style.background = "#e06767";
                  }
              }
          }
      }*/
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

function saveToken() {
    var fs = require('fs');
    var x = JSON.stringify([{ "service": document.getElementById("apiSelection").value, "apiKey": document.getElementById("capMonsterKey").value }])
    fs.writeFile(path.join(configDir, '/userdata/apiKey.json'), x, function(err) {
        if (err) throw err;
        console.log('Saved!');
    });
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

function saveHarvester() {
    var fs = require('fs');
    var checker;
    var harvester;
    var x;
    fs.readFile(path.join(configDir, '/userdata/harvesters.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        x = JSON.parse(data);
        harvester = x;

        for (var i = 0; i < x.length; i++) {
            if (x[i].name === document.getElementById('harvesterName').value) {
                harvester[i].name = document.getElementById('harvesterName').value;
                harvester[i].proxy = document.getElementById('harvesterProxy').value;

                checker = true;

                fs.writeFile(path.join(configDir, '/userdata/harvesters.json'), JSON.stringify(harvester), function(err) {
                    if (err) throw err;
                });
            }
        }
        if (!checker) {
            var harvesterName = document.getElementById('harvesterName').value;
            var harvesterProxy = document.getElementById('harvesterProxy').value;
            var jsonStr = { "name": harvesterName, "proxy": harvesterProxy }

            fs.readFile(path.join(configDir, '/userdata/harvesters.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x = JSON.parse(data);
                x.push(jsonStr)

                fs.writeFile(path.join(configDir, '/userdata/harvesters.json'), JSON.stringify(x), function(err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                    var tableRef = document.getElementById('captchas2').getElementsByTagName('tbody')[0];
                    tableRef.insertRow().innerHTML =
                        "<td onclick='showHarvesters(this.textContent)' style='padding-bottom: 5px'>" + harvesterName + "</td>"
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
            "<td >" + groups[groupindex][groupName][i][id].size + "</td>" +
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
    var fs = require('fs');
    var groups = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    var gname;
    var gindex;
    for (var i = 0; i < document.getElementById('groups').rows.length; i++) {
        if (document.getElementById('groups').rows[i].cells[0].style['border-left'] === "1px solid rgb(224, 103, 103)") {
            gname = document.getElementById('groups').rows[i].cells[0].children[0].value
            gindex = i
            break;
        }
    }
    var site = document.getElementById("siteTask2").value;
    var mode = document.getElementById("modeTask2").value;
    var link = document.getElementById("linkTask2").value;
    var profile = document.getElementById("profileTask2").value;
    var proxies = document.getElementById("proxyTask2").value;
    var accounts = document.getElementById("accountTask2").value;
    var size = document.getElementById("sizeTask2").value;
    var hour = document.getElementById("hourTaskEntry2").value
    var minute = document.getElementById("minuteTaskEntry2").value
    var second = document.getElementById("secondTaskEntry2").value
    console.log(hour)
    if (document.getElementById("captchaLess").checked == true && document.getElementById("captchaLessLabel").innerHTML === "Card checkout")
        mode += "-C"
    else
    if (document.getElementById("captchaLess").checked == true)
        mode += "-NC"

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
            }
            if (profile != "") {
                document.getElementById("tasks").rows[i].cells[5].textContent = profile;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['profile'] = profile
            }
            if (size != "") {
                document.getElementById("tasks").rows[i].cells[4].textContent = size;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['size'] = size
            }
            if (accounts != "") {
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['accounts'] = accounts
            }

            if (proxies != "") {
                document.getElementById("tasks").rows[i].cells[6].textContent = proxies;
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['proxies'] = proxies
            }

            if (hour != "") {
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['schedule']['hour'] = hour
            }

            if (minute != "") {
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['schedule']['minute'] = minute
            }

            if (second != "") {
                groups[gindex][gname][i - 1][document.getElementById('tasks').rows[i].cells[0].textContent]['schedule']['second'] = second
            }
        }
    }

    fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify(groups), function(err) {
        if (err) throw err;
        console.log('Tasks saved!');
    });
    closeEditor(event)
    stopSelected()
}


function addTask() {
    var fs = require('fs');
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
    var profile = document.getElementById("profileTask").value;
    var proxies = document.getElementById("proxyTask").value;
    var accounts = document.getElementById("accountTask").value;
    var size = document.getElementById("sizeTask").value;
    var quantity = document.getElementById("quantityTask").value;
    var hour = document.getElementById("hourTaskEntry").value
    var minute = document.getElementById("minuteTaskEntry").value
    var second = document.getElementById("secondTaskEntry").value

    if (document.getElementById("captchaLess").checked == true && site === "SSENSE")
        mode += "-C"
    else
    if (document.getElementById("captchaLess").checked == true)
        mode += "-NC"

    if (accounts === "")
        accounts = "-"
    var tasks = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
    if (size != "" && link != "" && mode != "" && site != "" && proxies != "" && profile != "") {
        if (profile === "Use All Profiles") {
            for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
                console.log(document.getElementById('profiles2').rows.length)
                for (var j = 0; j < quantity; j++) {
                    profile = document.getElementById("profiles2").rows[i].cells[0].textContent
                    var id = makeid(5)
                    var tableRef = document.getElementById('tasks').getElementsByTagName('tbody')[0];
                    var row = tableRef.insertRow()
                    row.innerHTML =
                        "<td>" + id + "</td>" +
                        "<td>" + site + "</td>" +
                        "<td>" + mode + "</td>" + "<td class='link'>" + link + "</td>" +
                        "<td >" + size + "</td>" +
                        "<td>" + profile + "</td>" +
                        "<td>" + proxies + "</td>" +
                        "<td>" + 'Stopped' + "</td>"
                    var task = {
                        [id]: {
                            "site": site,
                            "mode": mode,
                            "product": link,
                            "size": size,
                            "profile": profile,
                            "proxies": proxies,
                            "accounts": accounts,
                            "schedule": {
                                "hour": hour,
                                "minute": minute,
                                "second": second
                            }
                        }
                    }
                    tasks[gindex][gname].push(task)
                }
            }
        } else {
            for (var i = 0; i < quantity; i++) {
                var id = makeid(5)
                var tableRef = document.getElementById('tasks').getElementsByTagName('tbody')[0];
                var row = tableRef.insertRow()
                row.innerHTML =
                    "<td>" + id + "</td>" +
                    "<td>" + site + "</td>" +
                    "<td>" + mode + "</td>" + "<td class='link'>" + link + "</td>" +
                    "<td >" + size + "</td>" +
                    "<td>" + profile + "</td>" +
                    "<td>" + proxies + "</td>" +
                    "<td>" + 'Stopped' + "</td>"
                var task = {
                    [id]: {
                        "site": site,
                        "mode": mode,
                        "product": link,
                        "size": size,
                        "profile": profile,
                        "proxies": proxies,
                        "accounts": accounts,
                        "schedule": {
                            "hour": hour,
                            "minute": minute,
                            "second": second
                        }
                    }
                }
                tasks[gindex][gname].push(task)
            }
        }
    }
    fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify(tasks), function(err) {
        if (err) throw err;
        console.log('Tasks saved!');
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
    var currentStores = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/shopifyStores.json'), 'utf-8'))
    for (var i = 0; i < currentStores.length; i++) {
        if (currentStores[i].site === document.getElementById("shopifyStores").value)
            currentStores.splice(i, 1)
    }
    var shopifysites = document.getElementById("shopifyStores")
    shopifysites.options.length = 0;
    shopifysites.options[shopifysites.options.length] = new Option('', '')

    for (var i = 0; i < currentStores.length; i++) {
        shopifysites.options[shopifysites.options.length] = new Option(currentStores[i].site, currentStores[i].site);
    }
    fs.writeFile(path.join(configDir, '/userdata/shopifyStores.json'), JSON.stringify(currentStores), function(err) {
        if (err) throw err;
    });
    var separatorOption;
    for (var i = 0; i < document.getElementById("siteTask").options.length; i++) {
        if (document.getElementById("siteTask").options[i].value === "-- Custom Shopify --") {
            separatorOption = i;
            break;
        }
    }
    document.getElementById("siteTask").options.length = i + 1;
    for (var i = 0; i < currentStores.length; i++) {
        document.getElementById("siteTask").options[document.getElementById("siteTask").options.length] = new Option(currentStores[i].site, currentStores[i].site)
    }
}

function addStoreConfirm() {
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
    shopifysites.options[shopifysites.options.length] = new Option('', '')
    for (var i = 0; i < currentStores.length; i++) {
        shopifysites.options[shopifysites.options.length] = new Option(currentStores[i].site, currentStores[i].site);
    }
    fs.writeFile(path.join(configDir, '/userdata/shopifyStores.json'), JSON.stringify(currentStores), function(err) {
        if (err) throw err;
    });

    document.getElementById("baseLinkEntry").value = ""
    document.getElementById("storeNameEntry").value = ""
    var separatorOption;
    for (var i = 0; i < document.getElementById("siteTask").options.length; i++) {
        if (document.getElementById("siteTask").options[i].value === "-- Custom Shopify --") {
            separatorOption = i;
            break;
        }
    }
    document.getElementById("siteTask").options.length = i + 1;
    for (var i = 0; i < currentStores.length; i++) {
        document.getElementById("siteTask").options[document.getElementById("siteTask").options.length] = new Option(currentStores[i].site, currentStores[i].site)
    }
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
    fs.unlinkSync(path.join(configDir, '/userdata/harvesters.json'));
    fs.unlinkSync(path.join(configDir, '/userdata/apiKey.json'));
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
});

ipcRenderer.on('quicktask', (event, site, input) => {
    const remote = require('electron').remote;
    tasks()
    if (document.getElementById('groups').rows.length == 0)
        addGroup()
    var tasks2 = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/tasks.json'), { encoding: 'utf8', flag: 'r' }));
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
        var mode = "Safe"
    else {
        var mode = "Safe"
    }

    row.innerHTML =
        "<td>" + id + "</td>" +
        "<td>" + site + "</td>" +
        "<td>" + mode + "</td>" + "<td class='link'>" + input + "</td>" +
        "<td >" + document.getElementById("sizeQTSelect").value + "</td>" +
        "<td>" + document.getElementById("profileQTSelect").value + "</td>" +
        "<td>" + document.getElementById("proxyQTSelect").value + "</td>" +
        "<td>" + 'Stopped' + "</td>"
    var task = {
        [id]: {
            "site": site,
            "mode": mode,
            "product": input,
            "size": document.getElementById("sizeQTSelect").value,
            "profile": document.getElementById("profileQTSelect").value,
            "proxies": document.getElementById("proxyQTSelect").value,
            "accounts": "-",
            "schedule": {
                "hour": "",
                "minute": "",
                "second": ""
            }
        }
    }
    tasks2[gindex][gname].push(task)

    fs.writeFile(path.join(configDir, '/userdata/tasks.json'), JSON.stringify(tasks2), function(err) {
        if (err) throw err;
        console.log('Tasks saved!');
    });
    document.getElementById('groups').rows[gindex].cells[0].children[1].textContent = (document.getElementById('tasks').rows.length - 1).toString() + " tasks"

    var task3 = {
        "id": id,
        "site": site,
        "mode": mode,
        "product": input,
        "size": document.getElementById("sizeQTSelect").value,
        "profile": document.getElementById("profileQTSelect").value,
        "proxies": document.getElementById("proxyQTSelect").value,
        "accounts": "-",
        "schedule": {
            "hour": "",
            "minute": "",
            "second": ""
        }
    }
    ipcRenderer.send('startQT', task3)


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
        var settings = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/settings.json'), { encoding: 'utf8', flag: 'r' }));
        console.log(document.getElementById("proxyQTSelect").value)
        settings[1] = {
            "qtProfile": document.getElementById("profileQTSelect").value,
            "qtProxy": document.getElementById("proxyQTSelect").value,
            "qtSize": document.getElementById("sizeQTSelect").value
        }
        fs.writeFile(path.join(configDir, '/userdata/settings.json'), JSON.stringify(settings), function(err) {
            if (err) throw err;
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


function clearHarvesterFields() {
    document.getElementById('harvesterName').value = ''
    document.getElementById('harvesterProxy').value = '';
    for (var i = 1; i < document.getElementById('captchas2').rows.length; i++) {
        document.getElementById('captchas2').rows[i].cells[0].style.background = '';
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

function deleteHarvester() {
    for (var i = 1; i < document.getElementById('captchas2').rows.length; i++) {
        if (document.getElementById('captchas2').rows[i].cells[0].style.background != '') {
            document.getElementById("captchas2").deleteRow(i);
            var fs = require('fs')
            fs.readFile(path.join(configDir, '/userdata/harvesters.json'), 'utf-8', (err, data) => {
                if (err) throw err;
                x = JSON.parse(data);
                for (var j = 0; j < x.length; j++) {
                    if (x[j].name === document.getElementById("harvesterName").value) {
                        x.splice(j, 1);

                    }
                }

                clearHarvesterFields()

                fs.writeFile(path.join(configDir, '/userdata/harvesters.json'), JSON.stringify(x), function(err) {
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
                        //console.log(x);
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
    document.getElementById('taskTitle').style.display = "none";
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
    select.options[select.options.length] = new Option('', '')
    select.options[select.options.length + 1] = new Option('Use All Profiles', 'Use All Profiles')
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('profiles2').rows[i].cells[0].textContent, document.getElementById('profiles2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('proxyTask');
    select.options.length = 0;
    select.options[select.options.length] = new Option('', '')
    select.options[select.options.length + 1] = new Option('No Proxy', '-')
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('proxies2').rows[i].cells[0].textContent, document.getElementById('proxies2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('accountTask');
    select.options.length = 0;
    select.options[select.options.length] = new Option('', '')
    select.options[select.options.length + 1] = new Option('No Account', '-')
    for (var i = 1; i < document.getElementById('accounts2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('accounts2').rows[i].cells[0].textContent, document.getElementById('accounts2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('profileTask2');
    select.options.length = 0;
    select.options[select.options.length] = new Option('', '')
    select.options[select.options.length + 1] = new Option('Use All Profiles', 'Use All Profiles')
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('profiles2').rows[i].cells[0].textContent, document.getElementById('profiles2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('proxyTask2');
    select.options.length = 0;
    select.options[select.options.length] = new Option('', '')
    select.options[select.options.length + 1] = new Option('No Proxy', '-')
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('proxies2').rows[i].cells[0].textContent, document.getElementById('proxies2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('accountTask2');
    select.options.length = 0;
    select.options[select.options.length] = new Option('', '')
    select.options[select.options.length + 1] = new Option('No Account', '-')
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
    document.getElementById('taskTitle').style.display = "block";
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
    select.options[select.options.length] = new Option('', '')
    for (var i = 1; i < document.getElementById('profiles2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('profiles2').rows[i].cells[0].textContent, document.getElementById('profiles2').rows[i].cells[0].textContent);
    }

    var select = document.getElementById('proxyQTSelect');
    select.options.length = 0;
    select.options[select.options.length] = new Option('', '')
    select.options[select.options.length + 1] = new Option('No Proxy', '-')
    for (var i = 1; i < document.getElementById('proxies2').rows.length; i++) {
        select.options[select.options.length] = new Option(document.getElementById('proxies2').rows[i].cells[0].textContent, document.getElementById('proxies2').rows[i].cells[0].textContent);
    }

    var settings = JSON.parse(fs.readFileSync(path.join(configDir, '/userdata/settings.json'), { encoding: 'utf8', flag: 'r' }));

    $('#profileQTSelect').val(settings[1].qtProfile);
    $('#proxyQTSelect').val(settings[1].qtProxy);
    $('#sizeQTSelect').val(settings[1].qtSize);

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
    document.getElementById('taskTitle').style.display = "none";
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
    document.getElementById('taskTitle').style.display = "none";
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
    document.getElementById('taskTitle').style.display = "none";
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
    clearHarvesterFields()
    document.getElementById("settingsIcon").style.opacity = 0.3
    document.getElementById("taskIcon").style.opacity = 0.3
    document.getElementById("analyticsIcon").style.opacity = 0.3
    document.getElementById("accountIcon").style.opacity = 0.3
    document.getElementById("captchaIcon").style.opacity = 1.0
    document.getElementById("profileIcon").style.opacity = 0.3
    document.getElementById("proxyIcon").style.opacity = 0.3
    document.getElementById('taskView').style.display = "none";
    document.getElementById('settingsDiv').style.display = "none";
    document.getElementById('taskTitle').style.display = "none";
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
    $("#checkoutsTable tr:gt(0)").remove();
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
    document.getElementById('taskTitle').style.display = "none";
    document.getElementById('settingsTitle').style.display = "none";
    document.getElementById('proxiesTitle').style.display = "none";
    document.getElementById('proxies').style.display = "none";
    document.getElementById('accountsTitle').style.display = "none";
    document.getElementById('accounts').style.display = "none";
    document.getElementById('captchasTitle').style.display = "none";
    document.getElementById('captchas').style.display = "none";
}