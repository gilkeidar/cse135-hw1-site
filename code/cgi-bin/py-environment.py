#!/usr/bin/python3
import os

#   Set Response Headers
print("Content-Type: text/html\n")

#   Set Response message body (HTML payload)
html_start = """
<!DOCTYPE HTML>
<html>
    <head>
        <title>Environment Variables</title>
    </head>
    <body>
        <h1 align="center">Environment Variables</h1>
        <hr>
        <ul>
"""

print(html_start)

#   Print environment variables
for key in os.environ.keys():
    print(f"<li>{key}: {os.environ[key]}</li>")

print("</ul></body></html>")