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
- The battery hovers around 20 minutes for 1% of battery, which results in ~30 hours of display. It's not the best, but not the worst either

## Installation
### Server
- Clone the repository to your server `git clone https://github.com/bruhtek/kindle_dashboard.git`
- Rename `.env.sample` to `.env` and fill in the values
- Install the dependencies `yarn install`
- Build the application `yarn build`
- Start the application `yarn start`
### or Docker - just build the image, expose port 3000, include env variables

### Kindle
1. Jailbreak your kindle.
2. Disable sleep mode (write `~ds` in search bar on some kindles)
2. Install [alpine_kindle](https://github.com/schuhumi/alpine_kindle)
3. Modify the script at `~/.local/bin/getBat.sh` by adding the following line after the `echo "${PR_BATTERY_RESULT}%"` line:
    - `wget "http://YOUR_SERVER_ADRESS:3000/api/setBattery?battery=${PR_BATTERY_RESULT}" -qO- > /dev/null`
    - It makes the Kindle send the battery level to the server every time the battery level is updated (to show the battery level on the dashboard)
4. Change the timezone (Example for `Europe/Berlin`) 
    - `sudo apk add tzdata --allow-untrusted`
    - `setup-timezone -z Europe/Berlin`
    - `echo Europe/Berlin > /etc/timezone`
    - Check with `date`
5. Open Chromium browser, and go to the server's IP address, port 3000
6. You're all set!
