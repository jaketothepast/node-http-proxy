# Node HTTP Proxy

This project is an HTTP proxy, written in Node.js.

I wrote this because I deal with proxies at work all the time, and wanted to write one as an exercise. I chose
Node.js due to the event-driven architecture lending itself well to networking applications and because I 
am familiar with the language.

My goal for this project is to have it be easy to spin up, and compatible with major browsers. It will do 2 things.

1. It will monitor application-level traffic (anything over HTTP/HTTPS) - and log it.
2. It will block traffic after it's detected that you've been on a certain site for too long.

In the future I would like it to:

1. Block traffic based on pre-configured block rules.
2. Attempt to block any content it deems dangerous.
3. Provide a web interface for configuration management.
4. Provide a configuration file.

So in reality, it will be a tool to help monitor your internet usage and block you from spending too much time on any particular site!

# Testing

To test, can either spin up the vagrant instance, or utilize the unit tests.

# Testing Locally

The directory `./test` includes Python based tests intended to stress the proxy.
To run them, install the requirements with Pip, then run
`python3 test_proxy.py`. Ensure the proxy is running by running `node index.js` before testing.

# TODO

1. ~~Setup a server that listens on a port~~
2. ~~Write a rudimentary parsing routine.~~
3. Get Jest tests set up for the parsing routine.
4. Get Vagrantfile so can test with an actual browser that asks for a proxy.
5. Implement forwarding an HTTP request to the host after requesting it.
6. Return response from forwarded HTTP request to client.
7. Add some sort of backing store for keeping track of how many requests go to certain hosts.
8. Add blocking for going over time limits on hosts.