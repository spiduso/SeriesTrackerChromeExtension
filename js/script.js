/**
 * Get tab url from chrome query of an active tab
 */
async function getUrl() {
    let queryOptions = {active: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.url;
}

/**
 * Gets info about series from link url.
 * @param  {String} link link url of the series
 */
function getDataFromUrl(link) {
    const split_link = link.split('/');

    const dict = {
        "name": split_link[4].replaceAll('-', ' '),
        "season": split_link[5].slice(1, 3),
        "episode": split_link[5].slice(4, 6),
        "link": link
    }

    return dict;
}

/**
 * Clears database.
 */
async function deleteDatabase() {
    await chrome.storage.sync.remove("shows");
    await load(true);
}

async function deleteShow(name) {
    const result = (await chrome.storage.sync.get("shows"));

    if (!("shows" in result)) {
        await load();
        return;
    }

    const shows = result.shows;
    delete shows[name]

    await chrome.storage.sync.set({["shows"]: shows});
    await load();
}

/**
 * Saves series name and url to the database.
 */
async function save() {
    const current_url = await getUrl();
    const series_name = getDataFromUrl(current_url).name;

    const result = (await chrome.storage.sync.get("shows"));

    if (!("shows" in result)) {
        result["shows"] = {};
    }

    const shows = result.shows;
    shows[series_name] = current_url;

    await chrome.storage.sync.set({["shows"]: shows});
    await load();
}

/**
 * Loads series info from the database.
 */
async function load() {
    // Delete current table
    const table = document.getElementById("shows-table");
    const totalRowCount = table.tBodies[0].rows.length;
    for (let i = 0; i < totalRowCount; i++) {
        table.tBodies[0].deleteRow(0);
    }

    // Retrieve database
    const result = await chrome.storage.sync.get("shows");
    if (!("shows" in result)) return;

    const shows = result.shows;
    // Sort series by name and add rows with cells with info to the table
    for (const showUrl of Object.values(shows).sort().reverse()) {
        table.tBodies[0].insertRow(0);
        const row = table.insertRow(1);
        const del = row.insertCell(0);
        const name = row.insertCell(1);
        const season = row.insertCell(2);
        const episode = row.insertCell(3);
        const link = row.insertCell(4);

        const info = getDataFromUrl(showUrl);
        del.innerHTML = `<a style="text-decoration: none;" href="">&#10060;</a>`;
        del.onclick = (event) => deleteShow(info.name);
        del.style.textAlign = "center";
        name.innerHTML = info.name;
        season.innerHTML = info.season;
        episode.innerHTML = info.episode;
        link.innerHTML = `<a href="${showUrl}" target=\"_blank\">Link</a>`;
    }

}

async function loadLinks() {
    const result = await chrome.storage.sync.get("hostnames");

    if (!("hostnames" in result)) return null;

    return result.hostnames;
}

(async () => {
    // load database
    await load();
    document.getElementById("delDbButton").addEventListener("click", deleteDatabase);
    document.getElementById("optionsBtn").addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    const links = await loadLinks();
    if (links === null) return;

    const url = await getUrl();
    if (links.some(link => url.startsWith(link))) {
        document.getElementById("saveButton").addEventListener("click", save);
        document.getElementById('saveButton').disabled = false;
    }
})();
