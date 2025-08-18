#!/usr/bin/python3
import sqlite3
import os
import secrets
import fileinput

#   Set Response Headers

#   1.  Connect to the database file "py-sessions.db".
con = sqlite3.connect("py-sessions.db")
cur = con.cursor()
#   2.  Create a database table "sessions" if it doesn't already exist in
#       py-sessions.db.
res = cur.execute("SELECT name FROM sqlite_master WHERE name='sessions'")
if res.fetchone() is None:
    cur.execute("CREATE TABLE sessions(sessionID, name)")
#   3.  Define variables session_id and name.
#		1.	session_id = ''
#		2.	DEFAULT_NAME = "You don't have a username."
#		3.	name = DEFAULT_NAME
session_id = ""
DEFAULT_NAME = "You don't have a username."
name = DEFAULT_NAME
#   4.  If request r contains a Cookie header with value "SESSID=x"
#   *   This means that we've already assigned this client a cookie, and so
#       there should exist a database entry for this client's session id.
cookie_index = os.environ["HTTP_COOKIE"].find("SESSID=")
if cookie_index != -1:
	cookie_value = os.environ["HTTP_COOKIE"][cookie_index + len("SESSID="):].split(";")[0]
	# print(f"Test-Header-1: cookie_value={cookie_value}")
#       1.  session_id = x
	session_id = cookie_value
#       2.  If there exists an entry in the sessions database with sessionID
#           being session_id:
#       *   This means that the session_id of this client is valid and has a
#           record in the database.
	res = cur.execute("SELECT name FROM sessions WHERE sessionID = ?", (session_id, ))
	res = res.fetchone()
	# print(f"Test-Header-2: result: {res}")
#           1.  name = database.get(session_id)["name"]
#       3.  Otherwise:
#       *   This means that the client sent an incorrect session ID, but we can
#			still use it. Create a new session.
#			1.	database.create(session_id, {"name": DEFAULT_NAME})
	if res is None:
		name = DEFAULT_NAME
		cur.execute("INSERT INTO sessions VALUES(?, ?)", (session_id, DEFAULT_NAME))
		con.commit()
	else:
		name = res[0]
#	5.	Otherwise (r does not contain a Cookie header with value "SESSID=x"):
#	*	This means we need to create a new session for the client and send the
#		client a cookie with their session ID.
else:
#		1.	Create a new session ID.
#			1.	session_id = random string
	session_id = secrets.token_urlsafe(16)
#		2.	Create a new session record in the database.
#			1.	database.create(session_id, {"name": DEFAULT_NAME})
	cur.execute("INSERT INTO sessions VALUES(?, ?)", (session_id, DEFAULT_NAME))
	con.commit()
#		3.	Set cookie for client.
#			1.	print(f"Set-Cookie: SESSID={session_id}")
	print(f"Set-Cookie: SESSID={session_id}")
	
#	Close database connection
con.close()

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

print(f"<p><strong>Name: </strong> {name}</p>")

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