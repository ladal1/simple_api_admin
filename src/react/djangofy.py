import os
import sys
import re


def replace(matchobj):
    path = re.findall(r'/[^/"]*', matchobj.group(0))
    format = "".join(path[1:])
    return "{% static '" + format + "' %}"


def djangofy(file):
    data = file.read()
    finds = re.sub(r'"/static/[^\"]*"', replace, data)
    finds = "{% load static %} {% csrf_token %}" + finds
    file.seek(0)
    file.write(finds)
    print("Djangofy finished - Successfully templated the file.")


if __name__ == "__main__":
    assert len(sys.argv) == 2, "Usage djangofy.py <path to html>"
    if not os.path.isfile(sys.argv[1]):
        print('File does not exist.')
    with open(sys.argv[1], 'r+') as f:
        djangofy(f)
