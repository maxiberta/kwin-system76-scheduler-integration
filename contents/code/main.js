workspace.clientActivated.connect(function(client) {
    callDBus("com.system76.Scheduler", "/com/system76/Scheduler", "com.system76.Scheduler", "SetForegroundProcess", client.pid);
})
