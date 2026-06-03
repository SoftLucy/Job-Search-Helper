const STORAGE_KEY = 'arbeitsagenturHiddenJobs';

var jobsToHide = {};
var temporarilyShowingAll = false;

function findJobListingsRoot(root = document) {
    const ul = root.querySelector('[id^="ergebnisliste-liste-"]');
    if (!ul) return [];
    return ul.querySelectorAll(':scope > li');
}

function getJobId(liElement) {
  const link = liElement.querySelector('a[href]');
  if (link?.href) {
    const url = new URL(link.href, location.href);
    return url.pathname;
  }
  return null;
}

async function load() {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const listings = findJobListingsRoot();
  for (const li of listings) {
    if (contentHelpers.hasButton(li)) continue;
    const id = getJobId(li);
    if (!id) continue;
    contentHelpers.addButton(li, id, STORAGE_KEY, jobsToHide);
    if (jobsToHide[id] && !temporarilyShowingAll) {
      contentHelpers.hideLi(li);
    }
  }
}

function showAllHiddenJobs() {
  temporarilyShowingAll = true;
  findJobListingsRoot().forEach(li => {
    contentHelpers.showLi(li);
  });
}

function rehideAllJobs() {
  temporarilyShowingAll = false;
  findJobListingsRoot().forEach(li => {
    const id = getJobId(li);
    if (jobsToHide[id]) {
      contentHelpers.hideLi(li);
    }
  });
}

async function init() {
  await new Promise(resolve => setTimeout(resolve, 1500));

  jobsToHide = await contentHelpers.getHiddenJobs(STORAGE_KEY);

  const observer = new MutationObserver(() => {
    load();
  });

  observer.observe(
        document.querySelector('[id^="ergebnisliste-liste-"]'),
        {
            childList: true,
            subtree: true
        }
    );

  load();
}

init();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'showHiddenJobs') {
    showAllHiddenJobs();
    sendResponse({ success: true });
  } else if (request.type === 'rehideHiddenJobs') {
    rehideAllJobs();
    sendResponse({ success: true });
  }
});
