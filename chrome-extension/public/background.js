chrome.runtime.onInstalled.addListener(function(details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'www.primevideo.com',
              pathPrefix: '/detail/',
              schemes: ['http', 'https']
            }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });