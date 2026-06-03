const STORAGE_KEY = 'stepstoneHiddenJobs';

var jobsToHide = {};
var temporarilyShowingAll = false;

function findJobListingsRoot(root = document) {
  const container = root.querySelector('[data-genesis-element="CARD_GROUP_CONTAINER"]');
  if (!container) return [];
  return container.querySelectorAll(':scope > article');
}

function getJobId(jobElement) {
  const jobLink = jobElement.querySelector('a[href]');
  if (jobLink?.href) {
    const url = new URL(jobLink.href, location.href);
    return url.pathname;
  }

  // Fallback when no link is present
  if (jobElement.dataset.jobid) return jobElement.dataset.jobid;
  if (jobElement.dataset.id) return jobElement.dataset.id;
  return null;
}

async function load() {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const listings = findJobListingsRoot();
    for (const el of listings) {
      if (contentHelpers.hasButton(el)) continue;
      const id = getJobId(el);
      if (!id) continue;
      contentHelpers.addButton(el, id, STORAGE_KEY, jobsToHide);
      if (jobsToHide[id] && !temporarilyShowingAll) {
        contentHelpers.hideLi(el);
      }
    }
}

function showAllHiddenJobs() {
  temporarilyShowingAll = true;
  findJobListingsRoot().forEach(jobElement => {
      contentHelpers.showLi(jobElement);
  });
}

function rehideAllJobs() {
  temporarilyShowingAll = false;
  findJobListingsRoot().forEach(jobElement => {
    const id = getJobId(jobElement);
    if (jobsToHide[id]) {
      contentHelpers.hideLi(jobElement);
    }
  });
}

async function init() {

    await new Promise(resolve => setTimeout(resolve, 1500));

    jobsToHide = await contentHelpers.getHiddenJobs(STORAGE_KEY);

    const observer = new MutationObserver(() => {
        load();
    });

    const resultsContainer = document.querySelector('[data-genesis-element="CARD_GROUP_CONTAINER"]');
    if (resultsContainer) {
      observer.observe(resultsContainer, {
          childList: true,
          subtree: true
      });
    }

    load();

}

init();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'showHiddenJobs') {
    showAllHiddenJobs();
    sendResponse({ success: true });
  } else if (request.type === 'rehideHiddenJobs') {
    rehideAllJobs();
    sendResponse({ success: true });
  }
});
