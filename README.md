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
kpackagetool6 --type KWin/Script -i .
```

or if updating:

```sh
kpackagetool6 --type=KWin/Script -u .
```

## D-Bus Workaround (forward messages from session bus to the system bus)

Save [this script](system76-scheduler-dbus-proxy.sh) as `~/.local/bin/system76-scheduler-dbus-proxy.sh` (or anywhere else), and make it executable:

```sh
chmod +x ~/.local/bin/system76-scheduler-dbus-proxy.sh
```

You may also need to change `qdbus` in the script to the name of qdbus binary on your machine (it can be `qdbus6` or `qdbus-qt6`).
The script can be run manually; or can be installed as a systemd user service so that it runs automatically on login.
For example, save the following service definition as `~/.config/systemd/user/com.system76.Scheduler.dbusproxy.service`:

```systemd
[Unit]
Description=Forward com.system76.Scheduler session DBus messages to the system bus

[Service]
ExecStart=%h/.local/bin/system76-scheduler-dbus-proxy.sh

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
3. Activate the script at System Settings &rarr; Window Management &rarr; KWin Scripts (or run `kcmshell6 kcm_kwin_scripts`).
4. Run the dedicated D-Bus proxy as described above.
5. Process priority (_niceness_) of focused apps should interactively update (e.g. check the `NICE` column in `System Activity`, `htop`, or any other process manager).
