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

    # TODO - Use a sqlite driver here to check that httpbin.org is in the blocked table.
    #        Or mock the sqlite client.

def test_blocked_file():
    """
    Tests that the host configured to be blocked is successfully blocked.

    TODO - Mock the blocked file to be used by the proxy to not have to hardcode the host.
    """
    resp = requests.get("http://wikipedia.org", proxies={"http": http_proxy})
    assert resp.status_code == 403
    