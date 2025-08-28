//  Constants
const ID_LENGTH = 20;
const NUM_LETTERS = 26;
const NUM_DIGITS = 10;
const ASCII_a = 97;

//  30 minutes in ms (30 min * 60 sec / min * 1000 ms / sec)
const MAX_SESSION_TIME = 30 * 60 * 1000;

//  lowercase, uppercase, digits
const ID_ALPHABET_SIZE = NUM_LETTERS * 2 + NUM_DIGITS;  

//  localStorage key names
const USER_ID = "user_id";
const SESSION_ID = "session_id";
const USER_SESSION = "user_session";
const ACTIVITY_BURST = "activity_burst";
const SESSION_START = "session_start";

const USER_SESSION_ENDPOINT = "https://gilkeidar.com/json/user-sessions";

//  Global Variables

let user_id = "";
let session_id = "";
let session_start;
let page_load_start;

/**
 * Generates a random user or session ID string of length ID_LENGTH.
 * @returns 
 */
function generateID() {
    let id = "";
    for (let i = 0; i < ID_LENGTH; i++) {
        let rIndex = Math.floor(Math.random() * ID_ALPHABET_SIZE);

        if (rIndex < NUM_LETTERS) {
            //  Append lower-case letter
            id += String.fromCharCode("a".charCodeAt(0) + rIndex);
        }
        else if (rIndex < NUM_LETTERS * 2) {
            //  Append upper-case letter
            id += String.fromCharCode("A".charCodeAt(0) + rIndex - NUM_LETTERS);
        }
        else {
            //  Append digit
            id += String.fromCharCode("0".charCodeAt(0) 
                + rIndex - (2 * NUM_LETTERS));
        }
    }

    return id;
}

/**
 * Send the ActivityBurst object in localStorage to the server if it exists.
 * Then, clear the object in localStorage.
 */
function sendActivityBurstObject() {
    console.log("Sending ActivityBurst object to server (if it exists).");
}

/**
 * Send the UserSession object in localStorage to the server if it exists.
 * Then, clear the object in localStorage.
 */
async function sendUserSessionObject() {
    console.log("Sending UserSession object to server (if it exists).");
    let user_session_string = localStorage.getItem(USER_SESSION);

    if (!user_session_string)   return;

    const response = await fetch(USER_SESSION_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: user_session_string
    });

    //  6.  If the request was successful, clear the UserSession object from
    //      localStorage.
    if (response.status == 201) {
        console.log("Response succeeded.");

        localStorage.removeItem(USER_SESSION);
    }
    else {
        console.error(`Server responded with code ${response.status}.`
                + ` Not removing user session object.`);
    }
}

/**
 * Creates a StaticData object, fills it, and returns it.
 */
function getStaticData() {
    console.log("Getting static data of this session.");
    let static_data = {};

    //  1.  Get the user agent string
    static_data["user-agent"] = window.navigator.userAgent;

    //  2.  Get the user's language
    static_data["user-language"] = window.navigator.language;

    //  3.  Get whether the user accepts cookies
    static_data["user-accepts-cookies"] = window.navigator.cookieEnabled;

    //  4.  Get whether the user accepts JavaScript (trivially true if this
    //      script is running)
    static_data["user-allows-javascript"] = true;

    //  5.  Get whether the user allows images
    static_data["user-allows-images"] = !!document.createElement("img");

    //  6.  Get whether the user allows css
    //      (Done by testing whether a very basic property is supported)
    static_data["user-allows-css"] = CSS.supports("color", "red");

    //  7.  Get the user's screen dimensions
    static_data["user-screen-dimensions"] = {
        width: window.screen.width,
        height: window.screen.height
    };

    //  8.  Get the user's window dimensions
    static_data["user-window-dimensions"] = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    //  9.  Get the user's network connection type
    static_data["user-network-connection-type"] = 
        window.navigator.connection.effectiveType;

    return static_data;
}

function getPerformanceData() {
    console.log("Getting performance data of this session.");
    let loadStart = window.performance.timing.loadEventStart;
    let loadEnd = window.performance.timing.loadEventEnd;
    let loadTime = loadEnd - loadStart;

    return {
        "timing-object": window.performance.timing,
        "page-load-start": loadStart,
        "page-load-end": loadEnd,
        "page-load-time": loadTime
    };
}

/**
 * Create a new user session, UserSession object, store the UserSession object
 * in localStorage, then send it to the server.
 */
async function createUserSession() {
    console.log("Creating new user session.");

    //  1.  Generate a new session_id and store it in localStorage.
    session_id = generateID();
    localStorage.setItem(SESSION_ID, session_id);

    //  2.  Set session_start to the current time in localStorage.
    session_start = new Date();
    localStorage.setItem(SESSION_START, session_start.toUTCString());

    //  3.  Create a new UserSession object and fill it with static and 
    //      performance data.
    let user_session = {
        id: session_id,
        user_id: user_id,
        static_data: getStaticData(),
        performance_data: getPerformanceData()
    };

    //  4.  Store the UserSession object in localStorage.
    let user_session_string = JSON.stringify(user_session);
    localStorage.setItem(USER_SESSION, user_session_string);

    //  5.  Attempt to send the UserSession object to /json/user-session with a 
    //      POST request.
    await sendUserSessionObject();
}

async function loadEventHandler(event) {
console.log("Page has loaded.");
    console.log(window.performance.timing.loadEnd);

    //  Determine whether a user session already exists
    if (!localStorage.getItem(USER_ID)) {
        //  This means that this is an unknown client. A new user ID and session
        //  will need to be created.
        console.log("Unknown user - creating new user ID.");

        //  1.  Generate a new user_id and store it in localStorage.
        user_id = generateID();
        
        console.log("Storing user ID in localStorage.");
        localStorage.setItem(USER_ID, user_id);
    }

    if (!localStorage.getItem(SESSION_ID)) {
        //  This means that there is no current user session. A new user session
        //  will need to be created.
        console.log("No current user session - creating one.");

        //  1.  Create a new user session.
        await createUserSession();
    }
    else {
        //  This means that a previous user session does exist for this client.
        //  This previous user session may have data in localStorage that should
        //  be sent to the server before other data is sent.
        //  It's possible that this previous user session has expired and so a
        //  new user session should be created.
        console.log("There is a past user session.");

        //  1.  Send any leftover data of this user session to the server.
        console.log("Sending left-over data from this session to the server.");
        await sendUserSessionObject();
        await sendActivityBurstObject();

        //  2.  If session_start doesn't exist in localStorage or if it has
        //      expired, create a new UserSession.
        session_start = Date.parse(localStorage.getItem(SESSION_START));
        page_load_start = new Date();

        if (isNaN(session_start) 
            || Math.abs(page_load_start - session_start) > MAX_SESSION_TIME) {
            console.log("Past session either invalid or expired - creating new session.");
            await createUserSession();
        }
    }
}

addEventListener("load", async (event) => {
    setTimeout(await loadEventHandler(event), 0);
});


// console.log("hello there");

// addEventListener("load", (event) => {
//     console.log("Page has loaded!");
//     console.log(event);

//     //  Attempt to send the user agent string back to the /json/user-sessions

//     let userAgent = navigator.userAgent;

//     let data = {
//         id: Math.floor((Math.random() * 100000)),
//         userAgent: userAgent
//     };

//     const request = new Request("https://gilkeidar.com/json/user-sessions", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//     });


//     fetch(request)
//         .then((response) => {
//             console.log(`Received response with status code ${response.status}!`);
//             return response.json();
//         })
//         .then((jsonBody) => {
//             console.log("Response data:");
//             console.log(jsonBody);
//         });
// });