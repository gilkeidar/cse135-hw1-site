#!/usr/bin/python3
import datetime
import os

#   Get the current date and time
current_time = datetime.datetime.now()

#   Set Response Headers
print("Content-Type: text/html\n")

#   Set Message Body (HTML payload)
html_start = """
<!DOCTYPE HTML>
<html>
    <head>
        <title>Hello Python CGI World</title>
    </head>
    <body>
        <h1 align="center">Hello Python World!</h1>
        <hr>
        <p>Hello World</p>
        <p>This page was generated with the Python programming language.</p>
""";

print(html_start)
print(f"<p>This program was run at: {current_time}</p>")
print(f"<p>Your current IP Address is: {os.environ['REMOTE_ADDR']}</p>")
print("</body></html>")