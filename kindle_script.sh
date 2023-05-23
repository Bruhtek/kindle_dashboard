#!/bin/sh

FILE_WEATHER="weather"
FILE_ERROR="weather-error"
FILE_BATTERY="battery"

LOG="/mnt/us/weather.log"

HOSTNAME="Kindle"

SUSPENDTIME=1800

wlan_status() {
	echo `lipc-get-prop com.lab126.wifid cmState | grep -c "CONNECTED"`
}

kill_kindle() {
  initctl stop framework    > /dev/null 2>&1
  initctl stop cmd          > /dev/null 2>&1
  initctl stop phd          > /dev/null 2>&1
  initctl stop volumd       > /dev/null 2>&1
  initctl stop tmd          > /dev/null 2>&1
  initctl stop webreader    > /dev/null 2>&1
  killall lipc-wait-event   > /dev/null 2>&1
}

while true; do

	kill_kindle

  	### Enable CPU Powersave
	CPUMODE=`cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor | grep -c "powersave"`
	if [ ${CPUMODE} -eq 0 ]; then
		echo powersave > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
		echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | CPU slowed down." >> ${LOG} 2>&1
	fi

	### Disable Screensaver, no energy saving by powerd
	# powerd buggy since 5.4.5 - https://www.mobileread.com/forums/showthread.php?t=235821
	SCREENSAVER=`lipc-get-prop com.lab126.powerd status | grep -c "prevent_screen_saver:1"`
	if [ ${SCREENSAVER} -eq 0 ]; then
		lipc-set-prop com.lab126.powerd preventScreenSaver 1 >> ${LOG} 2>&1
		echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | Standard sleep deactivated." >> ${LOG} 2>&1
	fi

	rm weather

	BATTERY=`gasgauge-info -s`
  	echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | Battery: ${BATTERY}%" >> ${LOG} 2>&1

	if [ ${BATTERY} -le 10 ]; then
		echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | Battery low, turning off the device: ${BATTERY}%" >> ${LOG} 2>&1
		eips -c
		fbink -g file=$FILE_BATTERY,halign=CENTER,valign=CENTER
		echo 0 > /sys/class/rtc/rtc0/wakealarm
		echo "mem" > /sys/power/state
	fi

	WAKEUPTIME=$SUSPENDTIME
	echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | Current time: $(date '+%Y-%m-%d %H:%M:%S')." >> ${LOG} 2>&1

	WLANTRIES=10
	WLANCONNECTED=`wlan_status`
	while [ $WLANCONNECTED = 0 ]; do
		echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | WLAN not connected, waiting 3 seconds." >> ${LOG} 2>&1
		sleep 3

		WLANCONNECTED=`wlan_status`
		WLANTRIES=$((WLANTRIES-1))
		if [ ${WLANTRIES} -eq 0 ]; then
			echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | WLAN not connected, timeout." >> ${LOG} 2>&1
			break
		fi
	done

	echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | WLAN connected: ${WLANCONNECTED}" >> ${LOG} 2>&1

	if [ ${WLANCONNECTED} -eq 1 ]; then
		echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | WLAN connected, downloading weather data." >> ${LOG} 2>&1
		if wget -O ${FILE_WEATHER} http://192.168.0.193:3000/render/vertical?battery="$BATTERY" ; then
				eips -c
				fbink -i $FILE_WEATHER
		else
				eips -c
				fbink -g file=$FILE_ERROR,halign=CENTER,valign=CENTER
		fi
	else
		echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | WLAN not connected, skipping weather data." >> ${LOG} 2>&1
	fi

	cat ${LOG} | ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o ConnectTimeout=1 -o ConnectionAttempts=1 -i kindle_rsa kindle@192.168.0.193 "cat >> /home/kindle/weather.log"
	if [ $? -eq 0 ]; then
		echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | Log uploaded." >> ${LOG} 2>&1
		rm ${LOG}
		touch ${LOG}
	else
		echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | Log upload failed." >> ${LOG} 2>&1
	fi




 	echo "$(date '+%Y-%m-%d_%H:%M:%S') | ${HOSTNAME} | Going to sleep." >> ${LOG} 2>&1
  	rtcwake -d /dev/rtc1 -m mem -s ${WAKEUPTIME}

done