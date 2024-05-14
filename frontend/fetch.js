document.getElementById("myForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(this);
  const jsonData = {};
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });

  fetch("http://localhost:4000/add-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: jsonData }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      document.getElementById("myForm").reset();
      return response.json();
    })
    .then((data) => {
      document.cookie = `OVHC-token=${data.message}; path=/`;
      window.location.href = "page.html";

      // chrome.cookies.set(

      //   {
      //     url: "http://127.0.0.1:5500",
      //     name: "OVHC-token",
      //     value: data.message || "no token found",
      //     expirationDate: new Date().getTime() / 1000 + 3600 * 24 * 30,
      //   },
      //   function (cookie) {
      //     console.log("Cookie has been set:", cookie);
      //   }
      // );

      //  return false;
    })
    .catch((error) =>
      console.log("There was a problem with the fetch operation:", error)
    );
});
