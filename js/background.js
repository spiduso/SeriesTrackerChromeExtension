chrome.runtime.onInstalled.addListener(async function (details) {
    console.log(details)
    if (details.reason === "install") {
        await chrome.storage.sync.set({["hostnames"]: ["https://svetserialu.io/serial/"]});
    }
});