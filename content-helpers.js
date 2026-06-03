(function() {
  async function getHiddenJobs(storageKey) {
    return new Promise(resolve => {
      chrome.storage.local.get({ [storageKey]: {} }, result => {
        resolve(result[storageKey] || {});
      });
    });
  }

  async function saveHiddenJobs(storageKey, jobsObj) {
    return chrome.storage.local.set({ [storageKey]: jobsObj });
  }

  async function addHiddenJob(storageKey, jobsObj, id) {
    jobsObj[id] = true;
    await saveHiddenJobs(storageKey, jobsObj);
  }

  async function removeHiddenJob(storageKey, jobsObj, id) {
    delete jobsObj[id];
    await saveHiddenJobs(storageKey, jobsObj);
  }

  function hideLi(el) {
    el.style.display = 'none';
  }

  function showLi(el) {
    el.style.display = '';
  }

  function hasButton(el) {
    return el.querySelector('.hide-button') !== null;
  }

  function addButton(el, id, storageKey, jobsToHide) {
    const button = document.createElement('button');
    button.textContent = 'Hide';
    button.className = 'hide-button';
    button.style.cssText = `
      display: block;
      width: 100%;
      padding: 10px;
      margin-top: 8px;
      background: #f5a623;
      color: #111;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    `;

    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      event.preventDefault();
      hideLi(el);
      await addHiddenJob(storageKey, jobsToHide, id);
    });

    el.appendChild(button);
  }

  window.contentHelpers = {
    getHiddenJobs,
    addHiddenJob,
    removeHiddenJob,
    hideLi,
    showLi,
    hasButton,
    addButton
  };
})();
