// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Event listner for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.
function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href,
  });
  return false;
}

// Given an array of URLs, build a DOM list of those URLs in the
// browser action popup.
function buildPopupDom(divName, data) {
  const popupDiv = document.getElementById(divName);

  const ul = document.createElement('ul');
  popupDiv.appendChild(ul);

  for (let i = 0, ie = data.length; i < ie; i += 1) {
    const a = document.createElement('a');
    a.href = data[i];
    a.appendChild(document.createTextNode(data[i]));
    a.addEventListener('click', onAnchorClick);

    const li = document.createElement('li');
    li.appendChild(a);

    ul.appendChild(li);
  }
}

// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function buildTypedUrlList(divName) {
  // To look for history items visited in the last week,
  // subtract a week of milliseconds from the current time.
  const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  const oneWeekAgo = new Date().getTime() - millisecondsPerWeek;

  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  let numRequestsOutstanding = 0;

  // Maps URLs to a count of the number of times the user typed that URL into
  // the omnibox.
  const urlToCount = {};

  // This function is called when we have the final list of URls to display.
  const onAllVisitsProcessed = () => {
    // Get the top scorring urls.
    const urlArray = [];
    for (const url in urlToCount) {
      urlArray.push(url);
    }

    // Sort the URLs by the number of times the user typed them.
    urlArray.sort((a, b) => urlToCount[b] - urlToCount[a]);

    buildPopupDom(divName, urlArray.slice(0, 10));
  };

  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  const processVisits = (url, visitItems) => {
    for (let i = 0, ie = visitItems.length; i < ie; i += 1) {
      // Ignore items unless the user typed the URL.
      if (visitItems[i].transition != 'typed') {
        continue;
      }

      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }

      urlToCount[url] += 1;
    }

    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };

  chrome.history.search(
    {
      text: '', // Return every history item....
      startTime: oneWeekAgo, // that was accessed less than one week ago.
    },
    (historyItems) => {
      // For each history item, get details on all visits.
      for (let i = 0; i < historyItems.length; i += 1) {
        const { url } = historyItems[i];
        const processVisitsWithUrl = (u) =>
          // We need the url of the visited item to process the visit.
          // Use a closure to bind the  url into the callback's args.
          (visitItems) => {
            processVisits(u, visitItems);
          };
        chrome.history.getVisits({ url }, processVisitsWithUrl(url));
        numRequestsOutstanding += 1;
      }
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    },
  );
}

document.addEventListener('DOMContentLoaded', () => {
  buildTypedUrlList('typedUrl_div');
});
