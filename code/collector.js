console.log("hello there");

addEventListener("load", (event) => {
    console.log("Page has loaded!");
    console.log(event);

    //  Attempt to send the user agent string back to the /json/user-sessions

    let userAgent = navigator.userAgent;

    let data = {
        id: Math.floor((Math.random() * 100000)),
        userAgent: userAgent
    };

    const request = new Request("https://gilkeidar.com/json/user-sessions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });


    fetch(request)
        .then((response) => {
            console.log(`Received response with status code ${response.status}!`);
            return response.json();
        })
        .then((jsonBody) => {
            console.log("Response data:");
            console.log(jsonBody);
        });
});