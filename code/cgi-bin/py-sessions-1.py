#!/usr/bin/python3
import sqlite3
import os
import secrets
import fileinput

#   Set Response Headers
print("Content-Type: text/html\n")

html_start = '''
<!DOCTYPE html>
<html>
    <head>
        <title>Python Session 1</title>
    </head>
    <body>
        <h1>Python Sessions Page 1</h1>
'''
print(html_start)

#   Receive POST request and store username value in session.
#   Receive request r.
#   1.  Connect to the "py-sessions.db" database.
#   2.  Create the "sessions" table if it doesn't already exist.
#   Case 1: r contains a Cookie header with the name "SESSID".
#   *   This means that the relevant session ID was already given to the client.
#       Lookup the corresponding entry in the database to find the "name"
#       attribute.
#       1.  session_id = value of SESSID cookie header in r.
#       2.  session_data = database.get(session_id)
#   Case 2: r does not contain a Cookie header with the name "SESSID".
#   *   This means that we need to create a session ID for this client.
#       1.  session_id = randomly generate new session_id
#       2.  session_data = database.create(session_id, {name: "You haven't setup
#               a name"})
#   Case 1: r is a GET request.
#   *   This means that the request doesn't come from the HTML form, and so no
#       need to update a database entry that corresponds with the cookie if it
#       exists.
#       1.  name = session_data["name"]
#   Case 2: r is a POST request.
#   *   If r contains "username=" in its payload, then update the session_data
#       object to contain the new name, and update the database entry.
#       1.  If r.payload.contains("username="):
#           1.  name = r.payload["username"]
#           2.  session_data["name"] = name
#           3.  database.update(session_id, session_data)

#   1.  Connect to the database "py-sessions.db".
con = sqlite3.connect("py-sessions.db")
print("<p>Connected to database <code>py-sessions.db</code>.</p>")
cur = con.cursor()

#   2.  Create a database table "sessions" if it doesn't already exist.
#   *   The database needs two columns: (sessionID, name)
res = cur.execute("SELECT name FROM sqlite_master WHERE name='sessions'")
if res.fetchone() is None:
    cur.execute("CREATE TABLE sessions(sessionID, name)")
    print("<p>Created table <code>sessions</code> with columns for sessionID and name.</p>")

#   3.  Define variables session_id, session_data, and name.
session_id = ""
name = "You do not have a name set."
session_data = {"name": name}

cookie_index = os.environ["HTTP_COOKIE"].find("SESSID=")
#   4.  If request r contains a Cookie header with value "SESSID=x":
#   *   This means that we've already assigned this client a cookie, and so
#       should exist a database entry for it.
if cookie_index != -1:
    cookie_value = os.environ["HTTP_COOKIE"][cookie_index:].split(";")[0]
    print(f"<p>Cookies:{os.environ["HTTP_COOKIE"]}</p>")
    print(f"<p>Cookie index:{cookie_index}</p>")
    print(f"<p>Cookie value (1):{os.environ["HTTP_COOKIE"][cookie_index:]}</p>")
    print(f"<p>Cookie value (2):{os.environ["HTTP_COOKIE"][cookie_index:].split(";")}</p>")
    print(f"<p>Cookie value (3):{cookie_value}</p>")

#       1.  session_id = x
    session_id = cookie_value
    print(f"<p>Session ID: {session_id}</p>")
#       2.  session_data = database.get(session_id)
    res = cur.execute("SELECT name FROM sessions WHERE sessionID=VALUES(?)", session_id)
    session_data["name"] = res.fetchone()
    print(f"<p>Result: {res}</p>")
    print(f"<p>Result (session_data['name']): {session_data["name"]}</p>")
#       3.  if session_data is null, then the client sent an incorrect session
#           ID. Create a new session.
    if session_data["name"] is None:
        print(f"<p>session_data['name'] is null - client sent incorrect session id.</p>")
#           1.  session_data = database.create(session_id, {name = "You don't have a username."})
        session_data["name"] = name
        cur.execute("INSERT INTO sessions VALUES(?, ?)", (session_id, session_data["name"]))
        con.commit()
#   5.  Otherwise (r does not contain a Cookie header with value "SESSID=x"):
else:
#   *   This means we need to create a new session for the client.
#       1.  Create a new session ID.
#           1.  session_id = random string
    session_id = secrets.token_urlsafe(16)
#       2.  Create a new session object.
#           1.  session_data = database.create(session_id, {name = "You don't have a username."})
    session_data["name"] = name
    cur.execute("INSERT INTO sessions VALUES(?, ?)", (session_id, session_data["name"]))
    con.commit()
#   6.  If r is a GET request:
if os.environ["REQUEST_METHOD"].find("GET") != -1:
#   *   This means that the request doesn't come from the HTML form, and so we
#       don't need to update the database entry of this session.
#       1.  name = session_data["name"]
    name = session_data["name"]
#   7.  Otherwise if r is a POST request:
elif os.environ["REQUEST_METHOD"].find("POST") != -1:
#   *   This means that the request may have come from the HTML form; check for
#       the username=x payload.
#       1.  If the payload of r contains "username=x":
    r_payload = ""
    for line in fileinput.input():
        r_payload += line
    
    username_ind = r_payload.find("username")
    if username_ind != -1:
#           1.  name = x
        name = r_payload[username_ind + len("username"):]
#           2.  session_data["name"] = name
        session_data["name"] = name
#           3.  database.update(session_id, session_data)
        cur.execute("UPDATE sessions SET name = VALUES(?) WHERE sessionID=VALUES(?)", (name, session_id))

#   Set Response message body (HTML payload)
print(f"<p><strong>Name: </strong> {name}</p>")

html_end = '''
<br>
<br>
<a href="/cgi-bin/py-sessions-2.py">Sessions Page 2</a>
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