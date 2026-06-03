const unhideAllButton = document.getElementById('unhideAllButton');
const rehideAllButton = document.getElementById('rehideAllButton');
const clearStorageButton = document.getElementById('clearStorageButton');
const hiddenCountDisplay = document.getElementById('hiddenCount');
const siteNameDisplay = document.getElementById('siteName');

const INDEED_KEY = 'indeedHiddenJobs';
const STEPSTONE_KEY = 'stepstoneHiddenJobs';
const LINKEDIN_KEY = 'linkedinHiddenJobs';
const ARBEITSAGENTUR_KEY = 'arbeitsagenturHiddenJobs';

let currentStorageKey = null;
let currentSite = null;

async function detectSite() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs.length) return null;
  
  const url = tabs[0].url || '';
  
  if (url.includes('indeed.com')) {
    return { site: 'Indeed', key: INDEED_KEY };
  } else if (url.includes('stepstone.')) {
    return { site: 'Stepstone', key: STEPSTONE_KEY };
  } else if (url.includes('linkedin.com/jobs')) {
    return { site: 'LinkedIn', key: LINKEDIN_KEY };
  } else if (url.includes('arbeitsagentur') || url.includes('jobboerse.arbeitsagentur')) {
    return { site: 'Arbeitsagentur', key: ARBEITSAGENTUR_KEY };
  }
  
  return null;
}

async function getHiddenJobs() {
  if (!currentStorageKey) return {};
  const data = await chrome.storage.local.get({ [currentStorageKey]: {} });
  return data[currentStorageKey];
}

async function updateHiddenCount() {
  const hiddenJobs = await getHiddenJobs();
  const count = Object.keys(hiddenJobs).length;
  hiddenCountDisplay.textContent = `Hidden jobs: ${count}`;
  
  if (currentSite) {
    siteNameDisplay.textContent = `Site: ${currentSite}`;
  }
}

async function sendMessageToContentScript(message) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length && tabs[0].id) {
    chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
      // Content script may not be injected on this tab
    });
  }
}

unhideAllButton.addEventListener('click', async () => {
  await sendMessageToContentScript({ type: 'showHiddenJobs' });
  unhideAllButton.style.display = 'none';
  rehideAllButton.style.display = 'block';
});

rehideAllButton.addEventListener('click', async () => {
  await sendMessageToContentScript({ type: 'rehideHiddenJobs' });
  rehideAllButton.style.display = 'none';
  unhideAllButton.style.display = 'block';
});

clearStorageButton.addEventListener('click', async () => {
  if (currentStorageKey) {
    await chrome.storage.local.set({ [currentStorageKey]: {} });
    await updateHiddenCount();
    alert('Storage cleared for this site!');
  }
});

// Initialize on popup open
(async () => {
  const siteInfo = await detectSite();
  if (siteInfo) {
    currentStorageKey = siteInfo.key;
    currentSite = siteInfo.site;
    await updateHiddenCount();
  } else {
    hiddenCountDisplay.textContent = 'Open Indeed or Stepstone job search';
    unhideAllButton.disabled = true;
  }
})();
