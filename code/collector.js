//  Constants

//  Length of user and session IDs (in characters)
const ID_LENGTH = 20;

//  Number of letters in the alphabet
const NUM_LETTERS = 26;
const NUM_DIGITS = 10;

//  Number of possible characters in an ID
const ID_ALPHABET_SIZE = NUM_LETTERS * 2 + NUM_DIGITS;

//  Session time length (30 minutes in ms) 
//  (30 min * 60 sec / min * 1000 ms / sec)
const MAX_SESSION_TIME = 30 * 60 * 1000;

//  Activity collection period interval (10 sec in ms)
const ACTIVITY_COLLECTION_PERIOD = 10 * 1000;

//  localStorage keys
const ls_USER_ID = "user_id";
const ls_SESSION_ID = "session_id";
const ls_USER_SESSION = "user_session";
const ls_ACTIVITY_BURST = "activity_burst";
const ls_SESSION_START = "session_start";

const USER_SESSION_ENDPOINT = "https://gilkeidar.com/json/user-sessions";
const ACTIVITY_BURST_ENDPOINT = 
    "https://gilkeidar.com/json/activity-bursts";

class ActivityData {
    constructor(session_id, activity_type, time_stamp, activity) {
        this.session_id = session_id;
        this.activity_type = activity_type;
        this.time_stamp = time_stamp;
        this.activity = activity;
    }

    // constructor(session_id, event, activity) {
    //     this.session_id = session_id;
    //     this.activity_type = event.type;
    //     this.activity = activity;
    //     // this.time_stamp = event.timeStamp;
    //     this.time_stamp = Date.now();
    // }
}

class ActivityBurst {
    static MAX_ACTIVITY_BURST_SIZE = 10000;

    constructor() {
        //  Time of earliest ActivityData object in array
        this.burst_start = 0;

        //  Time of latest ActivityData object in array
        this.burst_end = 0;

        //  Initialize array of ActivityData objects
        this.activity = [];
    }

    addActivityData(activityData) {
        console.log("addActivityData()");
        if (this.activity.length == 0) {
            //  ActivityData array is empty; set burst_start timestamp
            this.burst_start = activityData.time_stamp;
        }

        //  Only push ActivityData to array if it fits
        if (this.activity.length < ActivityBurst.MAX_ACTIVITY_BURST_SIZE) {
            this.activity.push(activityData);
            this.burst_end = activityData.time_stamp;
        }
    }
}

class StaticData {
    constructor() {
        console.log("Creating StaticData object.");
        
        //  1.  Get the user agent string
        this["user-agent"] = window.navigator.userAgent;

        //  2.  Get the user's language
        this["user-language"] = window.navigator.language;

        //  3.  Get whether the user accepts cookies
        this["user-accepts-cookies"] = window.navigator.cookieEnabled;

        //  4.  Get whether the user accepts JavaScript (trivially true if this
        //      script is running)
        this["user-allows-javascript"] = true;

        //  5.  Get whether the user allows images
        this["user-allows-images"] = !!document.createElement("img");

        //  6.  Get whether the user allows CSS
        //      (Done by testing whether a very basic property is supported)
        this["user-allows-css"] = CSS.supports("color", "red");

        //  7.  Get the user's screen dimensions
        this["user-screen-dimensions"] = {
            width: window.screen.width,
            height: window.screen.height
        };

        //  8.  Get the user's window dimensions
        this["user-window-dimensions"] = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        //  9.  Get the user's network connection type
        this["user-network-connection-type"] =
            window.navigator.connection.effectiveType;
    }
}

class PerformanceData {
    constructor() {
        console.log("Creating PerformanceData object.");

        let loadStart = window.performance.timing.loadEventStart;
        let loadEnd = window.performance.timing.loadEventEnd;
        let loadTime = loadEnd - loadStart;

        //  1.  Get the timing object
        this["timing-object"] = window.performance.timing;
        this["page-load-start"] = loadStart;
        this["page-load-end"] = loadEnd;
        this["page-load-time"] = loadTime;
    }
}

class UserSession {
    constructor(id, user_id) {
        this.id = id;
        this.user_id = user_id;
        this.static_data = new StaticData();
        this.performance_data = new PerformanceData();
    }
}

//  Global Variables

//  Global in-memory activity burst (for current ACTIVITY_COLLECTION_PERIOD)
let activity_burst = new ActivityBurst();

//  Overwrite console to track console errors
// (from https://stackoverflow.com/questions/8000009/is-there-a-way-in-javascript-to-listen-console-events)
let _log = console.log, _warn = console.warn, _error = console.error;

console.log = function() {
    return _log.apply(console, arguments);
}

console.warn = function() {
    return _warn.apply(console, arguments);
}

console.error = function() {
    // activityEventHandler(
    //     {
    //         type: "console_error"
    //     }, 
    //     {
    //         arguments : arguments
    //     }
    // );

    return _error.apply(console, arguments);
}

//  Function Definitions

/**
 * Generate a random user or session ID string of the given length.
 * @param {Number} id_length 
 */
function generateID(id_length) {
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
 * Creates new user session.
 * @note This function overrides the session_id, user_session, and session_start
 * key-value pairs in localStorage.
 * @note This function assumes that the user_id key-value pair is already set in
 * localStorage.
 */
function createUserSession() {
    console.log("createUserSession()");

    //  1.  Generate a new session_id and store it in localStorage.
    let session_id = generateID();

    console.log(`Creating new user session with id ${session_id} in `
        + `localStorage.`);
    localStorage.setItem(ls_SESSION_ID, session_id);

    //  2.  Set session_start to the current time in localStorage.
    let session_start = new Date();
    localStorage.setItem(ls_SESSION_START, session_start.toUTCString());

    //  3.  Create a new UserSession object and fill it with static and 
    //      performance data.
    let user_id = localStorage.getItem(ls_USER_ID);
    let user_session = new UserSession(session_id, user_id);

    //  4.  Store the UserSession object in localStorage as a stringified JSON.
    localStorage.setItem(ls_USER_SESSION, JSON.stringify(user_session));
}

async function sendActivityBurstObject() {
    console.log("sendActivityBurstObject()");

    //  1.  Try to write activity_burst from memory into localStorage if the
    //      activity_burst in localStorage is unset.
    writeActivityBurstToLocalStorage();

    //  1.  If activity_burst is set in localStorage:
    let activity_burst_string = localStorage.getItem(ls_ACTIVITY_BURST);
    if (activity_burst_string) {
        console.log("Attempting to sent ActivityBurst object...");

        //  1.  Send the stringified JSON of the ActivityBurst object in
        //      localStorage to ACTIVITY_BURST_ENDPOINT with a POST request.
        //  2.  If the request succeeds, unset activity_burst in localStorage.

        const response = await fetch(ACTIVITY_BURST_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: activity_burst_string
        });

        if (response.ok) {
            console.log("Sending ActivityBurst object succeeded.");
            console.log("Clearing it from localStorage.");

            localStorage.removeItem(ls_ACTIVITY_BURST);
        }
        else {
            console.error(`Sending ActivityBurst object failed: received`
                + ` response code ${response.status}.`);
        }
    }
}

async function sendUserSessionObject() {
    console.log("sendUserSessionObject()");

    //  1.  If user_session is set in localStorage:
    let user_session_string = localStorage.getItem(ls_USER_SESSION);
    if (user_session_string) {
        console.log("Attempting to send UserSession object...");

        //  1.  Send the stringified JSON of the UserSession object in
        //      localStorage to USER_SESSION_ENDPOINT with a POST request.
        //  2.  If the request succeeds, unset user_session in localStorage.

        const response = await fetch(USER_SESSION_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: user_session_string
        });

        if (response.ok) {
            console.log("Sending UserSession object succeeded.");
            console.log("Clearing it from localStorage.");

            localStorage.removeItem(ls_USER_SESSION);
        }
        else {
            console.error(`Sending UserSession object failed: received response`
                    + ` code ${response.status}.`);
        }
    }
    
}

function loadEventHandler() {
    console.log("loadEventHandler()");

    //  1.  Determine whether a user already exists; if not, generate a new ID
    //      and a new user session.
    if (!localStorage.getItem(ls_USER_ID)) {
        console.log("Unknown user - creating new user ID.");

        let user_id = generateID();

        console.log(`Storing user ID ${user_id} in localStorage.`);
        localStorage.setItem(ls_USER_ID, user_id);

        console.log("Creating a new session for the new user.");
        createUserSession();
    }
    else {
        //  2.  The user does exist - determine whether a user session already 
        //      exists.
        console.log(
            `User is known, with id ${localStorage.getItem(ls_USER_ID)}.`);

        //  Get user session id (if it exists)
        let session_id = localStorage.getItem(ls_SESSION_ID);

        if (!session_id) {
            //  1.  A user session does not exist - create one.
            console.log("A user session does not exist - creating one.");

            createUserSession();
        }
        else {
            //  2.  A user session does exist.
            console.log(
                `User session does exist with session_id ${session_id}.`);

            //      1.  Send any unsent data of the previous user session.
            console.log(`Sending any unsent data of session ${session_id}.`);
            try {
                sendUserSessionObject();
                sendActivityBurstObject();
            } catch (error) {
                console.error(error);
            }

            //      2.  If the user session has expired, create a new user 
            //          session.
            let session_start = 
                Date.parse(localStorage.getItem(ls_SESSION_START));
            let current_time = new Date();

            if (isNaN(session_start)
                || Math.abs(current_time - session_start) > MAX_SESSION_TIME) {
                console.log("Past session is either invalid or expired - "
                    + "creating new session.");

                createUserSession();
            }
        }
    }

    //  By this point, a user id and user session exist.

    //  3.  Send current user session data (UserSession object) to the server.
    console.log("Sending current user session data (if necessary).");
    try {
        sendUserSessionObject();
    } catch(error) {
        console.error(error);
    }

    //  4.  Setup sending user session data and activity data burst to the
    //      server every ACTIVITY_COLLECTION_PERIOD seconds.
    setInterval(() => {
        console.log(`Sending data to server (every `
                    + `${ACTIVITY_COLLECTION_PERIOD} milliseconds).`);
        try {
            sendUserSessionObject();
            sendActivityBurstObject();
        } catch (error) {
            console.log(error);
        }
    }, ACTIVITY_COLLECTION_PERIOD)
}

// function activityEventHandler(event, activity) {
//     console.log("activityEventHandler()");

//     //  1.  Create an ActivityData object for the relevant event.
//     let session_id = localStorage.getItem(ls_SESSION_ID);
//     let activityData = new ActivityData(session_id, event, activity);

//     //  2.  Attempt to add the ActivityData object to activity_burst.
//     activity_burst.addActivityData(activityData);
//     //  3.  If activity_burst is unset in localStorage:
//     if (!localStorage.getItem(ls_ACTIVITY_BURST)) {
//         //  1.  Stringify activity_burst and store it in localStorage.
//         localStorage.setItem(ls_ACTIVITY_BURST, JSON.stringify(activity_burst));
//         //  2.  Reset activity_burst in memory.
//         activity_burst = new ActivityBurst();
//     }
// }

//  Continuous Activity Event Handlers
function getActivityFromErrorEvent(event) {
    return {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    };
}

function identifyMouseButton(button_index) {
    //  Identify the mouse button clicked based on its button_index in a mouse 
    //  event
    switch (button_index) {
        case 0:
            return "left";
        case 1:
            return "middle";
        case 2:
            return "right";
        default:
            return "unknown";
    }
}

function getActivityFromClickEvent(event) {
    return {
        coordinates: {
            clientX : event.clientX,
            clientY : event.clientY
        },
        button: button
    };
}

function writeActivityBurstToLocalStorage() {
    if (!localStorage.getItem(ls_ACTIVITY_BURST) 
        && activity_burst.activity.length > 0) {
        //  1.  Stringify activity_burst and store it in localStorage.
        localStorage.setItem(ls_ACTIVITY_BURST, JSON.stringify(activity_burst));
        //  2.  Reset activity_burst in memory.
        activity_burst = new ActivityBurst();
    }
}

function getActivityFromEvent(event) {
    console.log("getActivityFromEvent()");

    if (!event) return {};

    switch (event.type) {
        case "error":
            return getActivityFromErrorEvent(event);
        case "click":
            return getActivityFromClickEvent(event);
        default:
            return {};
    }
}

function activityEventHandler(event) {
    console.log("activityEventHandler()");

    //  1.  Create an ActivityData object for the relevant event.
    let session_id = localStorage.getItem(ls_SESSION_ID);
    let activity = getActivityFromEvent(event);

    let activityData = new ActivityData(session_id, event.type, Date.now(),
        activity);

    //  2.  Attempt to add the ActivityData object to activity_burst.
    activity_burst.addActivityData(activityData);

    //  3.  Attempt to write ActivityBurst to localStorage (works if it's not
    //      set)
    writeActivityBurstToLocalStorage();
}

//  Page load handler
addEventListener("load", (event) => {
    console.log("Page load event has fired.");
    setTimeout(() => {
        console.log("Page load event has completed.");

        //  Wait for page load event to complete so that 
        //  window.performance.timing.loadEventEnd value is set.
        loadEventHandler();

        //  Setup activity event handlers
        console.log("Setting up activity event handlers.");

        //  Continuous Activity Events (built-in)
        let continuousEvents = [
            //  Error
            "error", 
            //  Mouse events
            "click", "contextmenu", "dblclick", "mousedown", "mouseenter", 
            "mouseleave",
            "mousemove", "mouseout", "mouseover", "mouseup",
            //  Key events
            "keydown", "keypress", "keyup"
        ];

        //  Setup activity event handlers for each of the built-in continuous 
        //  events
        console.log("Setting up built-in activity event handlers...");
        for (const e of continuousEvents) {
            console.log(e);
            addEventListener(e, (event) => {
                console.log("Event!");
                console.log(e);
                activityEventHandler(event);
            })
        }
    }, 0);
});



// addEventListener("error", (event) => {
//     console.log("Error occurred.");
//     console.log(event);
//     activityEventHandler(event, {
//         message: event.message,
//         filename: event.filename,
//         lineno: event.lineno,
//         colno: event.colno,
//         error: event.error
//     });
// });

// addEventListener("unhandledrejection", (event) => {
//     console.log("Unhandled rejection occurred.");
//     console.log(event);
//     activityEventHandler(event, {

//     });
// })

// addEventListener("click", (event) => {
//     console.log(event);

//     //  Identify which button was clicked
//     let button;
//     switch (event.button) {
//         case 0:
//             button = "left";
//             break;
//         case 2:
//             button = "right";
//             break;
//         default:
//             button = "unknown";
//     }

//     activityEventHandler(event, {
//         //  Cursor position (coordinates)
//         coordinates: {
//             clientX : event.clientX,
//             clientY : event.clientY
//         },

//         //  Clicks (and which mouse button was clicked)
//         button: button

//         //  Scrolling (coordinates of the scroll)
//     });
// })