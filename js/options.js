// Saves options to chrome.storage
const saveOptions = async () => {
    const hostnames = document.getElementById("sites").value;
    console.log(hostnames)
    let arr = hostnames.trim().split("\n");
    console.log(arr)
    arr = [...new Set(arr)].filter(item => item.trim().length !== 0)

    console.log(arr)
    await chrome.storage.sync.set({["hostnames"]: arr});
};

async function loadLinks() {
    const result = await chrome.storage.sync.get("hostnames");
    result.hostnames.push("");
    document.getElementById("sites").textContent = result.hostnames.join("\n");
}

document.addEventListener('DOMContentLoaded', loadLinks);
document.getElementById('save').addEventListener('click', saveOptions);