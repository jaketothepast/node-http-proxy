import requests
import os

# TODO - Make this configurable based on config file test section.
http_proxy = "http://127.0.0.1:8124"

def test_proxy_basic():
    resp = requests.get("http://httpbin.org", proxies={"http": http_proxy})
    assert resp.status_code == 200

def test_proxy_block_page():
    for i in range(2):
        requests.get("http://httpbin.org", proxies={"http": http_proxy})
    assert requests.get("http://httpbin.org", proxies={"http": http_proxy}).status_code == 403
    