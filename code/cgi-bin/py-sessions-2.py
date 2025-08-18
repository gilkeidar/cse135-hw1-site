#!/usr/bin/python3
import os
import fileinput
from py_session_manager import SessionManager, SessionData

#   Set Response Headers

#   1.  Create a SessionManager and connect to the database file 
#       "py-sessions.db"
session_manager = SessionManager("py-sessions.db")

session = None

#   2.  Does the HTTP request contain a session cookie?
COOKIE_PREFIX = f"{SessionManager.SESSION_COOKIE_NAME}="
cookie_index = os.environ["HTTP_COOKIE"].find(COOKIE_PREFIX)
if cookie_index != -1:
    #   1.  Extract the cookie's value (session id)
    cookie_value = os.environ["HTTP_COOKIE"][cookie_index + len(COOKIE_PREFIX):].split(";")[0]
    session = session_manager.openSession(cookie_value)
else:
    #   HTTP request does not contain a session cookie.
    session = session_manager.openSession(None)

session_manager.closeSession()

print("Content-Type: text/html\n")

#   Set Response message body (HTML payload)

html_start = '''
<!DOCTYPE html>
<html>
    <head>
        <title>Python Session 2</title>
    </head>
    <body>
        <h1>Python Sessions Page 2</h1>
'''
print(html_start)

print(f"<p><strong>Name: </strong> {session.name}</p>")

html_end = '''
<br>
<br>
<a href="/cgi-bin/py-sessions-1.py">Sessions Page 1</a>
<br>
<a href="/py-cgiform.html">CGI Form</a>
<br>
<form style="margin-top: 30px" action="/cgi-bin/py-destroy-session.py"
    method="get">
    <button type="submit">Destroy Session</button>
</form>
</body>
</html>
'''
print(html_end)