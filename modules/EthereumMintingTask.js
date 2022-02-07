module.exports = class EthereumMintingTask {
    constructor(task) {
        const electron = require('electron');
        this.ipcRenderer = electron.ipcRenderer;
        this.path = require('path')
        this.fs = require('fs')
        this.ethers = require('ethers').ethers
        this.wallet = require('ethers').Wallet
        this.configDir = (electron.remote.app).getPath('userData');
        this.storage = require('electron-json-storage');
        this.storage.setDataPath(this.configDir + "/userdata")
        this.site = task.site
        this.mode = task.mode
        this.taskUUID = task.uuid
        this.groupUUID = task.groupUUID
        this.walletUUID = task.wallet
        this.networkUUID = task.network
        this.contractABI = task.contractABI
        this.parameters = task.parameters
        this.contractAddress = task.monitorInput
        this.ethValue = task.ethValue
        this.gasLimit = task.gasInformation.gasLimit
        this.maxPriorityFee = task.gasInformation.maxPriorityFee
        this.maxFee = task.gasInformation.maxFee
        this.writeFunction = task.writeFunction
        this.readFunction = task.readFunction
        this.readFunctionValue;
        this.transaction;
        this.transactionHash;
        this.transactionLink;
        this.txReceipt;
        this.key;
        this.networkURL;
        this.networkName;
        this.walletPrivateKey;
        this.walletName;
        this.webhookLink;
        this.monitorDelay = 100;
        this.errorDelay = 100;
        this.stopped = false;
    }

    async sendFailTransaction() {
        const got = require('got');
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/fail',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "monitorInput": this.contractAddress,
                    "ethTransferred": this.ethValue,
                    "transactionLink": this.transactionLink,
                    "gasLimit": this.gasLimit,
                    "maxPriorityFee": this.maxPriorityFee,
                    "maxFee": this.maxFee,
                    "timestamp": new Date(Date.now()).toISOString(),
                },
                responseType: 'json'
            }).then(response => {
                this.log("Finished")
            })
            .catch(error => {
                this.log(error)
            })

        var webhooks = this.webhookLink.split(",")
        for (var i = 0; i < webhooks.length; i++) {
            got({
                    method: 'post',
                    url: webhooks[i].trim(),
                    json: {
                        "content": null,
                        "embeds": [{
                            "title": "Transaction Failed! :octagonal_sign:",
                            "color": 14706535,
                            "fields": [{
                                    "name": "Site",
                                    "value": this.site
                                },
                                {
                                    "name": "Mode",
                                    "value": this.mode
                                },
                                {
                                    "name": "Monitor Input",
                                    "value": this.contractAddress,
                                },
                                {
                                    "name": "ETH Transferred",
                                    "value": this.ethValue,
                                },
                                {
                                    "name": "Wallet",
                                    "value": this.walletName
                                },
                                {
                                    "name": "Network",
                                    "value": this.networkName
                                },
                                {
                                    "name": "Transaction Link",
                                    "value": this.transactionLink
                                }
                            ],
                            "footer": {
                                "text": "Powered by Venetia",
                                "icon_url": "https://i.imgur.com/6h06tuW.png"
                            },
                            "timestamp": new Date(Date.now()).toISOString(),
                            "thumbnail": {
                                "url": this.imageURL
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://i.imgur.com/6h06tuW.png"
                    }
                }).then(response => {
                    this.log("Finished sending webhook")
                })
                .catch(error => {
                    this.log(error.response.body)
                })
        }
    }

    async sendSuccessTransaction() {
        const got = require('got');
        got({
                method: 'post',
                url: 'https://venetiabots.com/api/success',
                headers: {
                    'key': this.key
                },
                json: {
                    "site": this.site,
                    "mode": this.mode,
                    "monitorInput": this.contractAddress,
                    "ethTransferred": this.ethValue,
                    "transactionLink": this.transactionLink,
                    "gasLimit": this.gasLimit,
                    "maxPriorityFee": this.maxPriorityFee,
                    "maxFee": this.maxFee,
                    "timestamp": new Date(Date.now()).toISOString(),
                }
            }).then(response => {
                this.log("Finished")
            })
            .catch(error => {
                this.log(error)
            })
        var webhooks = this.webhookLink.split(",")
        for (var i = 0; i < webhooks.length; i++) {
            got({
                    method: 'post',
                    url: webhooks[i].trim(),
                    json: {
                        "content": null,
                        "embeds": [{
                            "title": "Transaction Confirmed! :tada:",
                            "color": 5230481,
                            "fields": [{
                                    "name": "Site",
                                    "value": this.site
                                },
                                {
                                    "name": "Mode",
                                    "value": this.mode
                                },
                                {
                                    "name": "Monitor Input",
                                    "value": this.contractAddress,
                                },
                                {
                                    "name": "ETH Transferred",
                                    "value": this.ethValue,
                                },
                                {
                                    "name": "Wallet",
                                    "value": this.walletName
                                },
                                {
                                    "name": "Network",
                                    "value": this.networkName
                                },
                                {
                                    "name": "Transaction Link",
                                    "value": this.transactionLink
                                }
                            ],
                            "footer": {
                                "text": "Powered by Venetia",
                                "icon_url": "https://i.imgur.com/6h06tuW.png"
                            },
                            "timestamp": new Date(Date.now()).toISOString(),
                            "thumbnail": {
                                "url": this.imageURL
                            }
                        }],
                        "username": "Venetia",
                        "avatar_url": "https://i.imgur.com/6h06tuW.png"
                    }
                }).then(response => {
                    this.log("Finished sending webhook")
                })
                .catch(error => {
                    this.log(error)
                })
        }
    }

    async getWebhook() {
        try {
            this.webhookLink = storage.getSync("settingsV2").webhook
            await this.send("Retrieved webhook")
        } catch (error) {
            await this.error("Error getting webhook", error)
            await this.stop("Error getting webhook")
        }
    }

    async getKey() {
        try {
            this.key = this.fs.readFileSync(this.path.join(this.configDir, '/userdata/key.txt'), 'utf8');
            await this.send("Retrieved key")
        } catch (error) {
            await this.error("Error getting key", error)
            await this.stop("Error getting key")
        }
    }

    async getWallet() {
        try {
            var wallets = this.storage.getSync('wallets')
            await this.send("Retrieved wallet information")
            for (var i = 0; i < Object.keys(wallets).length; i++) {
                if (Object.keys(wallets)[i] === this.walletUUID) {
                    this.walletName = wallets[this.walletUUID].walletName
                    this.walletPrivateKey = wallets[this.walletUUID].privateKey
                    break;
                }
            }
            if (this.walletName == undefined || this.walletPrivateKey == undefined) throw "Couldn't find wallet information in file"
        } catch (error) {
            await this.error("Error getting wallet", error)
            await this.stop("Error getting wallet")
        }
    }

    async getNetwork() {
        try {
            var networks = this.storage.getSync('networks')
            for (var i = 0; i < Object.keys(networks).length; i++) {
                if (Object.keys(networks)[i] === this.networkUUID) {
                    this.networkName = networks[this.networkUUID].networkName
                    this.networkURL = networks[this.networkUUID].networkRPC
                    break;
                }
            }
            if (this.networkName == undefined || this.networkURL == undefined) throw "Couldn't find network information in file"
            await this.send("Retrieved network information")
        } catch (error) {
            await this.error("Error getting network", error)
            await this.stop("Error getting network")
        }
    }

    async initializeNetwork() {
        try {
            await this.send("Initializing network...")
            this.provider = new this.ethers.providers.JsonRpcProvider(this.networkURL);
            await this.send("Initialized network")
        } catch (error) {
            await this.error("Error initializing network", error)
            await this.stop("Error initializing network")
        }
    }

    async initializeWallet() {
        try {
            await this.send("Initializing wallet...")
            this.signer = new this.ethers.Wallet(this.walletPrivateKey, this.provider);
            await this.send("Initialized wallet")
        } catch (error) {
            await this.error("Error initializing wallet", error)
            await this.stop("Error initializing wallet")
        }
    }

    async initializeContract() {
        try {
            await this.send("Initializing contract...")
            this.contract = new this.ethers.Contract(this.contractAddress, this.contractABI, this.signer);
            await this.send("Initialized contract")
        } catch (error) {
            await this.error("Error initializing contract", error)
            await this.stop("Error initializing contract")
        }
    }

    async submitTransaction() {
        try {
            await this.send("Submitting transaction...")
            this.transaction = await this.contract[this.writeFunction](this.parameters, {
                gasLimit: this.gasLimit,
                value: this.ethers.utils.parseEther(this.ethValue),
                maxPriorityFeePerGas: this.ethers.utils.parseUnits(this.maxPriorityFee, 'gwei'),
                maxFeePerGas: this.ethers.utils.parseUnits(this.maxFee, 'gwei'),
            })
            this.transactionHash = this.transaction.hash

            if (this.transaction.chainId == 1)
                this.transactionLink = "https://etherscan.io/tx/" + this.transactionHash
            else if (this.transaction.chainId == 4)
                this.transactionLink = "https://rinkeby.etherscan.io/tx/" + this.transactionHash

            await this.send("Submitted transaction")
        } catch (error) {
            await this.error("Error submitting transaction", error)
            await this.stop("Error submitting transaction")
        }
    }

    async setReadFunctionValue() {
        try {
            this.readFunctionValue = await this.contract[this.readFunction]()
        } catch (error) {
            await this.error("Error getting value", error)
            await this.stop("Error getting value")
        }
    }

    async waitForContract() {
        try {
            await this.send("Waiting for contract...")
            if (await this.contract[this.readFunction]() === this.readFunctionValue) {
                throw "Contract not ready"
            } else {
                return;
            }
        } catch (error) {
            if (error === "Contract not ready") {
                if (this.stopped == false) {
                    await sleep(this.monitorDelay)
                    await this.waitForContract()
                }
            } else {
                if (this.stopped == false) {
                    await this.error("Error viewing contract", error)
                    await sleep(this.monitorDelay)
                    await this.waitForContract()
                }
            }
        }
    }

    async waitForTransaction() {
        try {
            this.transaction = await this.provider.getTransaction(this.transactionHash)
            await this.send("Waiting for transaction...")
            if (this.transaction.confirmations == 0)
                throw "Pending transaction"
            else {
                this.txReceipt = await this.provider.getTransactionReceipt(this.transactionHash)
                if (this.txReceipt.status == 1) {
                    if (this.stopped == false) {
                        await this.sendSuccessTransaction()
                        await this.stop("Transaction Confirmed")
                    }
                } else {
                    if (this.stopped == false) {
                        await this.sendFailTransaction()
                        await this.stop("Transaction Failed")
                    }
                }
            }
        } catch (error) {
            if (error === "Pending transaction") {
                if (this.stopped == false) {
                    await sleep(this.monitorDelay)
                    await this.waitForTransaction()
                }
            } else {
                if (this.stopped == false) {
                    await this.error("Error viewing transaction", error)
                    await sleep(this.monitorDelay)
                    await this.waitForTransaction()
                }
            }
        }
    }

    log(message) {
        const winston = require('winston');
        const logConfiguration = {
            transports: [
                new winston.transports.Console({}),
                new winston.transports.File({
                    filename: this.configDir + '/logs/' + this.taskUUID + '.log'
                })
            ],
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss'
                }),
                winston.format.printf(info => `[${[info.timestamp]}] [${this.taskUUID}]: ${info.message}`),
            )
        };
        const logger = winston.createLogger(logConfiguration);
        logger.info(message)
    }

    async stop(status) {
        this.stopped = true;
        this.log(status)
        this.ipcRenderer.send('message', {
            event: "stopTask",
            data: {
                taskUUID: this.taskUUID,
                groupUUID: this.groupUUID,
                status: status
            }
        })
    }


    returnID() {
        return this.taskId;
    }

    async setDelays() {
        var fs = require('fs');
        var path = require('path')
        var delays = JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/delays.json'), 'utf8'));
        var groups = JSON.parse(fs.readFileSync(path.join(this.configDir, '/userdata/tasks.json'), 'utf8'));
        var index;
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i][Object.keys(groups[i])[0]].length; j++) {
                if (Object.keys(groups[i][Object.keys(groups[i])[0]][j])[0] === this.taskId) {
                    index = i;
                    break;
                }
            }
        }
        this.monitorDelay = delays[index].monitor
        this.errorDelay = delays[index].error
    }

    async error(status, error) {
        if (this.stopped === false) {
            this.log(status + ": " + error)
        }
    }

    async send(status) {
        if (this.stopped === false) {
            this.log(status)
            this.ipcRenderer.send('message', {
                event: "statusUpdate",
                data: {
                    taskUUID: this.taskUUID,
                    groupUUID: this.groupUUID,
                    status: status
                }
            })
        }
    }

    async initialize() {

        if (this.stopped === false)
            await this.getKey()

        if (this.stopped === false)
            await this.getWebhook()
        if (this.stopped === false)
            await this.getWallet()

        if (this.stopped === false)
            await this.getNetwork()

        if (this.stopped === false)
            await this.initializeNetwork()

        if (this.stopped === false)
            await this.initializeWallet()

        if (this.stopped === false)
            await this.initializeContract()

        if (this.stopped === false && this.mode === "Contract Monitor")
            await this.setReadFunctionValue()

        if (this.stopped === false && this.mode === "Contract Monitor")
            await this.waitForContract()

        if (this.stopped === false)
            await this.submitTransaction()

        if (this.stopped === false)
            await this.waitForTransaction()

    }

}


const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
}