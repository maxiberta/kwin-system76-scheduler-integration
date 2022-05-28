# KWin Script for system76-scheduler Integration

[System76 Scheduler](https://github.com/pop-os/system76-scheduler) is a service which optimizes Linux's CPU scheduler and automatically assigns process priorities for improved desktop responsiveness.

This KWin Script interactively notifies [System76 Scheduler](https://github.com/pop-os/system76-scheduler) which app has focus via D-Bus, so it is prioritized.

# Limitations

The `system76-scheduler` service is published on the _systemwide D-Bus bus_; but [KWin Scripts](https://develop.kde.org/docs/extend/plasma/kwin/api/#functions) can only call D-Bus methods on the _user session bus_ (as far as I can tell).
This can be worked around by forwarding these specific messages from the _session bus_ to the _system bus_. See the installation instructions below.

# Installation

This KWin Script is [published at the KDE Store](https://store.kde.org/p/1789957) and can be downloaded and installed via "Get New Scripts" at the Window Management &rarr; KWin Scripts settings.

## Manual Installation

```sh
git clone https://github.com/maxiberta/kwin-system76-scheduler-integration.git
cd kwin-system76-scheduler-integration
kpackagetool5 --type=KWin/Script -i .
```

or if updating:

```sh
kpackagetool5 --type=KWin/Script -u .
```

## D-Bus Workaround (forward messages from session bus to the system bus)

Save the following script as `/usr/local/bin/system76-scheduler-dbus-proxy.sh` (or anywhere else):

```sh
#!/bin/bash
DBUS_SERVICE="com.system76.Scheduler"
DBUS_PATH="/com/system76/Scheduler"
DBUS_INTERFACE="com.system76.Scheduler"
DBUS_METHOD="SetForegroundProcess"
dbus-monitor "destination=$DBUS_SERVICE,path=$DBUS_PATH,interface=$DBUS_INTERFACE,member=$DBUS_METHOD" | 
  while true; do 
    read method call time sender _ dest serial path interface member
    read type pid
    [ "$member" = "member=$DBUS_METHOD" ] && qdbus --system $DBUS_SERVICE $DBUS_PATH $DBUS_INTERFACE.$DBUS_METHOD $pid
  done
```

and make it executable:

```sh
chmod +x /usr/local/bin/system76-scheduler-dbus-proxy.sh
```

This script can be run manually; or can be installed as a systemd user service so that it runs automatically on login.
For example, save the following service definition as `~/.config/systemd/user/com.system76.Scheduler.dbusproxy.service`:

```systemd
[Unit]
Description=Forward com.system76.Scheduler session DBus messages to the system bus

[Service]
ExecStart=/usr/local/bin/system76-scheduler-dbus-proxy.sh

[Install]
WantedBy=default.target

```

And enable it:

```sh
systemctl --user enable --now com.system76.Scheduler.dbusproxy.service
```

# Usage

1. Install and configure [System76 Scheduler](https://github.com/pop-os/system76-scheduler).
2. Install this KWin script.
3. Activate the script at System Settings &rarr; Window Management &rarr; KWin Scripts (or run `kcmshell5 kwinscripts`).
4. Run the dedicated D-Bus proxy as described above.
5. Process priority (_niceness_) of focused apps should interactively update (e.g. check the `NICE` column in `System Activity`, `htop`, or any other process manager).
