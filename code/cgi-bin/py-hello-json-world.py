#!/usr/bin/python3
import json
import os
import datetime

#   Set Response Headers
print("Content-Type: application/json\n")

#   Set Response message body (JSON payload)
json_contents = {
        "IP": os.environ["REMOTE_ADDR"],
        "heading": "Hello, Python!",
        "message": "This response was generated with the Python programming language",
        "time": str(datetime.datetime.now()),
        "title": "Hello, Python!"
}

print(json.dumps(json_contents))