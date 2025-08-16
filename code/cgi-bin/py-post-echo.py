#!/usr/bin/python3
import fileinput

#   Set Response Headers
print("Content-Type: text/html\n")

#   Set Response message body (HTML payload)
html_start = """
<!DOCTYPE html>
<html>
    <head>
        <title>POST Request Echo</title>
    </head>
    <body>
        <h1 align="center">POST Request Echo</h1>
        <hr>
        <p>
            <strong>Message Body:</strong>
        </p>
        <ul>
"""

print(html_start)

s = ''
for line in fileinput.input():
    s += line

if len(s) == 0:
    print("<li>(null)</li>")
else:
    print(f"<li>{s}</li>")

print("</ul></body></html>")