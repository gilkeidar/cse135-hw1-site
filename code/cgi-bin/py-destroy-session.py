#!/usr/bin/python3
import os
from py_session_manager import SessionManager, SessionData

#   Set Response Headers

#   1.  Create a SessionManager and connect to the database file 
#       "py-sessions.db"
session_manager = SessionManager("py-sessions.db")

#   2.  Does the HTTP request contain a session cookie?
COOKIE_PREFIX = f"{SessionManager.SESSION_COOKIE_NAME}="
cookie_index = os.environ["HTTP_COOKIE"].find(COOKIE_PREFIX)
if cookie_index != -1:
    #   1.  Extract the cookie's value (session id)
    cookie_value = os.environ["HTTP_COOKIE"][cookie_index + len(COOKIE_PREFIX):].split(";")[0]
    session_manager.deleteSession(cookie_value)

session_manager.closeSession()

print("Content-Type: text/html\n")

#   Set Response message body (HTML payload)

html = '''
<!DOCTYPE html>
<html>
    <head>
        <title>Python Session Destroyed</title>
    </head>
    <body>
        <h1>Session Destroyed</h1>
        <a href="/py-cgiform.html">Back to the Python CGI Form</a>
        <br>
        <a href="/cgi-bin/py-sessions-1.py">Back to Page 1</a>
        <br>
        <a href="/cgi-bin/py-sessions-2.py">Back to Page 2</a>
    </body>
</html>
'''
print(html)


