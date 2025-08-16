#!/usr/bin/python3
import os
import fileinput

#   Set Response Headers
print("Content-Type: text/html\n")

#   Set Response message body (HTML payload)
html_start = """
<!DOCTYPE html>
<html>
    <head>
        <title>General Request Echo</title>
    </head>
    <body>
        <h1 align="center">General Request Echo</h1>
        <hr>
        <table>
            <tbody>
"""
print(html_start)

#   Print Protocol
print(f"<tr><td>Protocol:</td><td>{os.environ['SERVER_PROTOCOL']}</td></tr>")

#   Print Method
print(f"<tr><td>Method:</td><td>{os.environ['REQUEST_METHOD']}</td></tr>")

#   Print Query String
print(f"<tr><td>Query String:</td><td>{os.environ['QUERY_STRING']}</td></tr>")

#   Print Message Body
s = ''
for line in fileinput.input():
    s += line
print(f"<tr><td>Message Body:</td><td>{s}</td></tr>")

print("</tbody></table></body></html>")
