// Initialize an array to store event data
let eventDataArray = [];

// Add event listener to track typing events on input fields
document.addEventListener("change", function (event) {
  sendEventData("typing", event.target);
});

// Listen for page change events
window.addEventListener("beforeunload", function () {
  // Send all accumulated event data to background script when the page changes
  sendAllEventData();
});

// Function to send event data to the background script
function sendEventData(eventType, targetElement) {
  // Extract relevant information from the event
  const eventData = {
    eventType: eventType,
    target: {
      tagName: targetElement.tagName,
      id: targetElement.id,
      className: targetElement.className,
      name: targetElement.name,
      // xPath: getXPath(targetElement), // Helper function to get XPath of the target element
      name: targetElement.name,
      typedValue: targetElement.value, // Include the typed value
    },
    url: window.location.href,
  };

  // Push event data to the array
  eventDataArray.push(eventData);
}

// Function to send all accumulated event data to the background script
function sendAllEventData() {
  // Send the event data array to the background script
  if (chrome.runtime && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: "eventCaptured", data: eventDataArray });
  }
  // Clear the event data array
  eventDataArray = [];
}
