#!/usr/bin/python3
import sqlite3
import os

#   Set Response Headers
print("Content-Type: text/html\n")

#   1.  Connect to the database file "py-sessions.db".
con = sqlite3.connect("py-sessions.db")
cur = con.cursor()
#   2.  Create a database table "sessions" if it doesn't already exist in
#       py-sessions.db.
res = cur.execute("SELECT name FROM sqlite_master WHERE name='sessions'")
if res.fetchone() is None:
    cur.execute("CREATE TABLE sessions(sessionID, name)")

#   3.  Define variable session_id.
session_id = ""
#   4.  If request r contains a Cookie header with value "SESSID=x"
#   *   This means that we've already assigned this client a cookie, and so
#       there should exist a database entry for this client's session id.
cookie_index = os.environ["HTTP_COOKIE"].find("SESSID=")
if cookie_index != -1:
    cookie_value = os.environ["HTTP_COOKIE"][cookie_index:].split(";")[0]
#       1.  session_id = x
    session_id = cookie_value
#       2.  Delete record with this session id.
    cur.execute("DELETE FROM sessions WHERE sessionID = ?", (session_id, ))
    con.commit()

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