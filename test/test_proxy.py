import requests

# TODO - Make this configurable based on config file test section.
http_proxy = "http://127.0.0.1:8124"

def test_proxy_basic():
    resp = requests.get("http://google.com", proxies={"http": http_proxy})
    
    