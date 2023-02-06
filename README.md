# Kindle dashboard
A dashboard for kindle devices. Web application that runs on a Kindle device, using [alpine_kindle](https://github.com/schuhumi/alpine_kindle), written in NodeJS, using Express and Handlebars

## Requirements
- A Kindle device that can be jailbroken (see mobileread forum for more info)
- A server that can run nodejs applications

## Features
- Shows the current time and date
- Shows the forecast for the next 24 hours (using [met.no](https://api.met.no) API)
- Shows the day's sunrise, sunset and noon times (using [met.no](https://api.met.no) API)
- Lets you control your smart home lights (using Home Assistant)

## Recommendations
- This app is optimized for Kindle Paperwhite 4, since that's the one I own. It should work on other devices, but it might not look as good.
- The battery life of the Kindle has not been measured. I will update the readme once I have some numbers.

## Installation
### Server
- Clone the repository to your server `git clone https://github.com/bruhtek/kindle_dashboard.git`
- Rename `.env.sample` to `.env` and fill in the values
- Install the dependencies `yarn install`
- Build the application `yarn run build`
- Start the application `yarn run start`

### Kindle
1. Jailbreak your kindle.
2. Install [alpine_kindle](https://github.com/schuhumi/alpine_kindle)
3. (Optional, possibly not required) Change the timezone (Example for `Europe/Berlin`) 
    - `sudo apk add tzdata --allow-untrusted`
    - `setup-timezone -z Europe/Berlin`
    - `echo Europe/Berlin > /etc/timezone`
    - Check with `date`
4. Open Chromium browser, and go to the server's IP address, port 3000
5. You're all set!
