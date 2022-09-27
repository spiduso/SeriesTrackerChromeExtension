/**
 * Get tab url from chrome query of an active tab
 */
async function getUrl(){
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.url;
}

/**
 * Gets info about series from link url.
 * @param  {String} link link url of the series
 */
function getDataFromUrl_SvetSerialu(link) {
  const split_link = link.split('/');

  return {
    "name": split_link[4].replaceAll('-', ' '),
    "season": split_link[5].slice(1,3),
    "episode": split_link[5].slice(4,6),
    "link": link
  }
}

/**
 * Clears database.
 */
async function deleteDatabase(){
  await chrome.storage.sync.clear();
  await load(true);
}

/**
 * Saves series name and url to the database.
 */
async function save() {
    const current_url = await getUrl();
    const series_name = await getDataFromUrl_SvetSerialu(current_url).name;
    await chrome.storage.sync.set({[series_name]: current_url});
    await load();
}

/**
 * Loads series info from the database.
 */
async function load() {
  // Retrieve database
  await chrome.storage.sync.get(null, async function(result) {
    let series = result;
    const table = document.getElementById("classID");

    // Delete current table
    const totalRowCount = table.tBodies[0].rows.length;
    for (let i = 0; i < totalRowCount; i++) {
      table.tBodies[0].deleteRow(0);
    }

    // Sort series by name and add rows with cells with info to the table
    const sorted_series = Object.keys(series).sort().reverse();
    for (const serie of sorted_series) {
      table.tBodies[0].insertRow(0);
      const row = table.insertRow(1);
      const name = row.insertCell(0);
      const season = row.insertCell(1);
      const episode = row.insertCell(2);
      const link = row.insertCell(3);

      const info = getDataFromUrl(series[serie]);
      name.innerHTML = info.name;
      season.innerHTML = info.season;
      episode.innerHTML = info.episode;
      link.innerHTML = "<a href='"+ series[serie] +"' target=\"_blank\" >Link</a>"
    }
  });
}

(async() => {
  // load database
  await load();
  document.getElementById("delDbButton").addEventListener("click", deleteDatabase);

  // if url is from series page, enable save button
  const url = await getUrl();
  if(url.startsWith('https://svetserialu.to/serial/')) {
    document.getElementById("saveButton").addEventListener("click", save);
    document.getElementById('saveButton').disabled = false;
  }})();
