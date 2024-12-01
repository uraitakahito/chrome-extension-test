/**
 * Stops the service worker associated with a given extension ID. This is done
 * by creating a new Chrome DevTools Protocol session, finding the target ID
 * associated with the worker and running the Target.closeTarget command.
 *
 * @param {Page} browser Browser instance
 * @param {string} extensionId Extension ID of worker to terminate
 */
async function stopServiceWorker(browser, extensionId) {
  const host = `chrome-extension://${extensionId}`;

  const target = await browser.waitForTarget((t) => t.type() === 'service_worker' && t.url().startsWith(host));

  const worker = await target.worker();
  await worker.close();
}

export default stopServiceWorker;
