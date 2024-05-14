// // // Listen for messages from content scripts

// // // background.js

// // console.log("i am from backgroun js");

// // // let currentTabId = null;

// // // Listen for tab creation events
// // // chrome.tabs.onCreated.addListener(function (tab) {
// // //   console.log("fetching the tab", tab);

// // //   // Check if the new tab is the active tab in a new window
// // //   if (tab.active && tab.windowId !== chrome.windows.WINDOW_ID_NONE) {
// // //     currentTabId = tab.id;
// // //     console.log("Current tab ID:", currentTabId);
// // //   }
// // // });

// // // Function to get the current tab ID
// // // function getCurrentTabId() {
// // //   return currentTabId;
// // // }
// // chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
// //   if (message.type === "eventCaptured") {
// //     // Process the captured event data
// //     console.log("Captured event:", message.data);
// //     // Convert the captured event data to JSON string
// //     let jsonString = JSON.stringify(message.data);

// //     // retrive the token of the user
// //     chrome.cookies.get(
// //       { url: "http://127.0.0.1:5500", name: "OVHC-token" },
// //       function (cookie) {
// //         // if (cookie) {
// //         // Make an HTTP POST request to send the JSON data to your database endpoint
// //         let tab_id;
// //         chrome.tabs.query(
// //           { active: true, currentWindow: true },
// //           function (tabs) {
// //             var activeTab = tabs[0];
// //             tab_id = activeTab.id;
// //             console.log("fetching tab id", tab_id);
// //             fetch("http://localhost:4000/policy", {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type": "application/json",
// //               },
// //               // body: jsonString,
// //               body: JSON.stringify({
// //                 data: jsonString,
// //                 token: cookie?.value,
// //                 tab_id,
// //               }),
// //             })
// //               .then((response) => {
// //                 if (!response.ok) {
// //                   throw new Error("Network response was not ok");
// //                 }
// //                 return response.json();
// //               })
// //               .then((data) => {
// //                 console.log("Data sent successfully:", data);
// //               })
// //               .catch((error) => {
// //                 console.log("Error sending data:", error);
// //               });
// //           }
// //         );

// //         // console.log("Cookie found:", cookie);
// //         // } else {
// //         //   console.log("Cookie not found");
// //         // }
// //       }
// //     );
// //   }
// // });

// // // Listen for messages from other parts of the extension or external sources
// // chrome.runtime.onMessageExternal.addListener(function (
// //   request,
// //   sender,
// //   sendResponse
// // ) {
// //   // Check if the message is a "ping"
// //   if (request.message === "ping") {
// //     // Respond with a message containing { pong: true }
// //     sendResponse({ pong: true });
// //   }
// // });
// // background.js

// // background.js

// console.log("Background script loaded.");

// // Initialize tabDataMap
// let tabDataMap = {};

// // Listen for messages from content scripts
// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   if (message.type === "eventCaptured") {
//     // Process the captured event data
//     console.log("Captured event:", message.data);

//     // Get the tab ID
//     let tabId = sender.tab.id;

//     // Retrieve the token of the user
//     chrome.cookies.get(
//       { url: "http://127.0.0.1:5500", name: "OVHC-token" },
//       function (cookie) {
//         if (cookie) {
//           // Convert the captured event data to JSON string
//           let jsonString = JSON.stringify(message.data);

//           // Get or create tab data in the map
//           let tabData = tabDataMap[tabId] || { events: [] };

//           // Append the new event to the existing events array
//           tabData.events.push(message.data);

//           tabDataMap[tabId] = tabData;

//           // Make an HTTP POST request to send the JSON data to your database endpoint
//           fetch("http://localhost:4000/policy", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               data: jsonString,
//               token: cookie.value,
//               tab_id: tabId,
//             }),
//           })
//             .then((response) => {
//               if (!response.ok) {
//                 throw new Error("Network response was not ok");
//               }
//               return response.json();
//             })
//             .then((data) => {
//               console.log("Data sent successfully:", data);
//             })
//             .catch((error) => {
//               console.log("Error sending data:", error);
//             });
//         } else {
//           console.log("Cookie not found");
//         }
//       }
//     );
//   }
// });

// // Listen for messages from other parts of the extension or external sources
// chrome.runtime.onMessageExternal.addListener(function (
//   request,
//   sender,
//   sendResponse
// ) {
//   // Check if the message is a "ping"
//   if (request.message === "ping") {
//     // Respond with a message containing { pong: true }
//     sendResponse({ pong: true });
//   }
// });

let tabDataMap = {};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "eventCaptured") {
    // Process the captured event data
    console.log("Captured event:", message.data);

    // Get the tab ID
    let tabId = sender.tab.id;

    // Retrieve the token of the user
    chrome.cookies.get(
      { url: "http://127.0.0.1:5500", name: "OVHC-token" },
      function (cookie) {
        if (cookie) {
          // Convert the captured event data to JSON string
          let jsonString = JSON.stringify(message.data);

          // Get or create tab data in the map
          let tabData = tabDataMap[tabId] || { events: [] };

          // Find existing entry in tabData.events
          let existingIndex = tabData.events.findIndex(
            (event) => event.tab_id === message.data.tab_id
          );

          // If entry exists, update it, else add new entry
          if (existingIndex !== -1) {
            // Merge the new data with existing data
            tabData.events[existingIndex] = Object.assign(
              tabData.events[existingIndex],
              message.data
            );
          } else {
            tabData.events.push(message.data); // Add new entry
          }

          tabDataMap[tabId] = tabData;

          // Make an HTTP POST request to send the JSON data to your database endpoint
          fetch("http://localhost:4000/policy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: jsonString,
              token: cookie.value,
              tab_id: tabId,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => {
              console.log("Data sent successfully:", data);
            })
            .catch((error) => {
              console.log("Error sending data:", error);
            });
        } else {
          console.log("Cookie not found");
        }
      }
    );
  }
});
chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  // Check if the message is a "ping"
  if (request.message === "ping") {
    // Respond with a message containing { pong: true }
    sendResponse({ pong: true });
  }
});
