#!/usr/bin/python3
import sqlite3
import os

#   Set Response Headers
print("Content-Type: text/html\n")

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
session_id = 0
name = "You do not have a name set."
session_data = {"name": name}

#   4.  If request r contains a Cookie header with value "SESSID=x":
#   *   This means that we've already assigned this client a cookie, and so
#       should exist a database entry for it.
cookie_index = os.environ["HTTP_COOKIE"].find("SESSID=")
cookie_value = os.environ["HTTP_COOKIE"][cookie_index:].split(";")[0]
print(f"<p>Cookies:{os.environ["HTTP_COOKIE"]}</p>")
print(f"<p>Cookie index:{cookie_index}</p>")
print(f"<p>Cookie value (1):{os.environ["HTTP_COOKIE"][cookie_index:]}</p>")
print(f"<p>Cookie value (2):{os.environ["HTTP_COOKIE"][cookie_index:].split(";")}</p>")
print(f"<p>Cookie value (3):{cookie_value}</p>")

#       1.  session_id = x
#       2.  session_data = database.get(session_id)
#       3.  if session_data is null, then the client sent an incorrect session
#           ID. Create a new session.
#           1.  session_data = database.create(session_id, {name = "You don't have a username."})
#   5.  Otherwise (r does not contain a Cookie header with value "SESSID=x"):
#   *   This means we need to create a new session for the client.
#       1.  Create a new session ID.
#           1.  session_id = randomInt()
#       2.  Create a new session object.
#           1.  session_data = database.create(session_id, {name = "You don't have a username."})
#   6.  If r is a GET request:
#   *   This means that the request doesn't come from the HTML form, and so we
#       don't need to update the database entry of this session.
#       1.  name = session_data["name"]
#   7.  Otherwise if r is a POST request:
#   *   This means that the request may have come from the HTML form; check for
#       the username=x payload.
#       1.  If the payload of r contains "username=x":
#           1.  name = x
#           2.  session_data["name"] = name
#           3.  database.update(session_id, session_data)

#   Set Response message body (HTML payload)
