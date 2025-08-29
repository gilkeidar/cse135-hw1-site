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

class StaticData {
    constructor() {
        console.log("Creating StaticData object.");
    }
}

class PerformanceData {
    constructor() {
        console.log("Creating PerformanceData object.");
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
}

async function sendUserSessionObject() {
    console.log("sendUserSessionObject()");

    //  1.  If user_session is set in localStorage:
    let user_session = localStorage.getItem(ls_USER_SESSION);
    if (user_session) {
        console.log("Attempting to send UserSession object...");
        //  1.  Send the stringified JSON of the UserSession object in
        //      localStorage to USER_SESSION_ENDPOINT with a POST request.
        //  2.  If the request succeeds, unset user_session in localStorage.

        const response = await fetch(USER_SESSION_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: user_session
        });

        if (response.ok) {
            console.log("Sending UserSession object succeeded.");

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

    //  1.  Determine whether a user already exists; if not, generate a new ID.
    if (!localStorage.getItem(ls_USER_ID)) {
        console.log("Unknown user - creating new user ID.");

        let user_id = generateID();

        console.log(`Storing user ID ${user_id} in localStorage.`);
        localStorage.setItem(ls_USER_ID, user_id);
    }

    //  2.  Determine whether a user session already exists.

    //      1.  A user session does not exist - create one.
    let session_id = localStorage.getItem(ls_SESSION_ID);
    if (!session_id) {
        console.log("A user session does not exist - creating one.");

        createUserSession();
    }
    else {
        //  2.  A user session does exist.
        console.log(`User session does exist with session_id ${session_id}.`);

        //      1.  Send any unsent data of the previous user session.
        console.log(`Sending any unsent data of session ${session_id}.`);
        try {
            sendUserSessionObject();
            sendActivityBurstObject();
        } catch (error) {
            console.error(error);
        }

        //      2.  If the user session has expired, create a new user session.
        let session_start = Date.parse(localStorage.getItem(ls_SESSION_START));
        let current_time = new Date();

        if (isNaN(session_start)
            || Math.abs(current_time - session_start) > MAX_SESSION_TIME) {
            console.log("Past session is either invalid or expired - creating "
                + "new session.");

            createUserSession();
        }
    }
    

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

addEventListener("load", (event) => {
    console.log("Page load event has fired.");
    setTimeout(() => {
        console.log("Page load event has completed.");

        //  Wait for page load event to complete so that 
        //  window.performance.timing.loadEventEnd value is set.
        loadEventHandler();
    }, 0);
});