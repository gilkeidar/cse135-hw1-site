#   This script shouldn't be executed by the server directly. It acts as a
#   library for the other Python session pages.
import secrets
import sqlite3

class SessionData:
    #   Default username value.
    DEFAULT_NAME = "You don't have a username."
    #   Length (in characters) of session id value.
    SESSION_ID_LENGTH = 16

    def __init__(self, name = DEFAULT_NAME, session_id = None):
        if session_id is None:
            #   Generate a new session ID.
            self.session_id = secrets.token_urlsafe(SessionData.SESSION_ID_LENGTH)
        else:
            self.session_id = session_id
        self.name = name

class SessionManager:
    #   Name of session cookie (name in HTTP Cookie and Set-Cookie headers)
    SESSION_COOKIE_NAME = "SESSID"
    #   Name of database table
    TABLE_NAME = "sessions"

    def __init__(self, databasePath):
        #   1.  Connect to the database file at databasePath.
        self.__con = sqlite3.connect(databasePath)
        #   2.  Initialize database cursor
        self.__cur = self.__con.cursor()
        #   3.  Create a database table "sessions" if it doesn't already exist
        #       in the database file.
        res = self.__cur.execute("SELECT name FROM sqlite_master WHERE name=?",
                                (SessionManager.TABLE_NAME,))
        if res.fetchone() is None:
            self.__cur.execute("CREATE TABLE ?(sessionID, name)", 
                                (SessionManager.TABLE_NAME,))
    
    def createSession(self):
        #   Create a new session and return its SessionData object.
        #   1.  Create a new SessionData object.
        newSession = SessionData()
        #   2.  Store the session object in the database.
        self.__cur.execute("INSERT INTO ? VALUES(?, ?)", 
                           (SessionManager.TABLE_NAME, newSession))
        self.__con.commit()
        #   3.  Set session cookie for the client.
        print(f"Set-Cookie: {SessionManager.SESSION_COOKIE_NAME}={newSession.session_id}")
        #   4.  Return the session object.
        return newSession
    
    def findSessionInDatabase(self, session_id):
        #   Attempt to find a session row in the database with the given session
        #   id.
        res = self.__cur.execute("SELECT * FROM ? WHERE sessionID = ?",
                                 (SessionManager.TABLE_NAME, session_id))
        res = res.fetchone()
        if res is None:
            return None
        else:
            #   res = (sessionID, name)
            return SessionData(res[1], res[0])
    
    def openSession(self, session_id):
        if session_id is None:
            #   This means that the HTTP request does not contain a session
            #   cookie.
            return self.createSession()
        else:
            #   This means that the HTTP request does contain a session cookie.
            #   1.  Look-up session with session ID session_id in the database.
            session = self.findSessionInDatabase(session_id)
            if session is None:
                return self.createSession()
            return session
        
    def closeSession(self):
        #   1.  Close connection with database.
        self.__con.close()

    def updateSession(self, session_id, request_method, payload):
        #   Check whether request method is POST and payload contains a
        #   "username=s1" string.
        USERNAME_STRING = "username="
        username_ind = payload.find(USERNAME_STRING)
        if (request_method.find("POST") != -1 and username_ind != -1):
            #   1.  Extract username
            name = payload[username_ind + len(USERNAME_STRING):]
            #   2.  Look-up session with the given session id.
            session = self.findSessionInDatabase(session_id)
            
            if session is None:
                return None
            else:
                #   1.  Update session to have new name value.
                session.name = name
                #   2.  Update session object in database.
                self.__cur.execute("UPDATE ? SET name = ? WHERE sessionID = ?",
                        (SessionManager.TABLE_NAME, session.name, session_id))
                self.__con.commit()
                return session
        return None

    def deleteSession(self, session_id):
        if session_id is not None:
            #   1.  Delete session object in database with the given session_id.
            self.__cur.execute("DELETE FROM ? WHERE sessionID = ?",
                               (SessionManager.TABLE_NAME, session_id))
            self.__con.commit()
            #   2.  Tell client to clear the session cookie.
            print(f"Set-Cookie: {SessionManager.SESSION_COOKIE_NAME}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT")

