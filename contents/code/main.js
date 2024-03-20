// See https://develop.kde.org/docs/plasma/kwin/api/

workspace.windowActivated.connect(function(client) {
    //console.log("CLIENT PID", client.pid);
    callDBus("com.system76.Scheduler", "/com/system76/Scheduler", "com.system76.Scheduler", "SetForegroundProcess", client.pid);
})
