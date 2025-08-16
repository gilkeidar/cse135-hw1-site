#!/usr/bin/python3
import os
from urllib import parse

#   Set Response Headers
print("Content-Type: text/html\n")

#   Set Response message body (HTML payload)
html_start = """
<!DOCTYPE html>
<html>
    <head>
        <title>GET Query String</title>
    </head>
    <body>
        <h1 align="center">GET Query String</h1>
        <hr>
"""
print(html_start)

#   Print raw query string
query_string = os.environ['QUERY_STRING']
print(f"<p>Raw Query String: {query_string}</p>")

#   Print formatted query string
print("<p>Formatted Query String:</p>")
print("<table><tbody>")

query_dictionary = parse.parse_qs(query_string)

for x in query_dictionary:
    print(f"<tr><td>{x}:</td><td>{query_dictionary[x][0]}</td></tr>")

print("</tbody></table></body></html>")