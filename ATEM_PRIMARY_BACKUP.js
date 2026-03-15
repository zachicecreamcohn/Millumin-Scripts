// Blackmagic ATEM Primary/Backup Switch
//
// Run this script on BOTH the primary and backup Millumin machines.
// Each machine only responds to its own OSC address, so only one machine
// acts on any given switch command.
//
// SETUP:
//   Primary machine:   Set THIS_MACHINE_ROLE = "primary"
//   Backup machine:    Set THIS_MACHINE_ROLE = "backup"
//
//   The OSC sender (e.g. EOS, QLab) should send to BOTH machines' IPs.
//   /atem/switch/primary  -> primary machine executes its ATEM action
//   /atem/switch/backup   -> backup machine executes its ATEM action
//
// REQUIRES: pip3 install PyATEMMax

var THIS_MACHINE_ROLE = "primary"; // "primary" or "backup"

var ATEM_IP           = "192.168.0.100"; // IP of the Blackmagic ATEM switcher
var ATEM_ME           = 0;               // M/E bank index (0 = M/E 1)
var ATEM_INPUT_SOURCE = 1;               // ATEM input number this machine is connected to

var MY_OSC_ADDRESS = "/atem/switch/" + THIS_MACHINE_ROLE;

function switchATEM() {
    log("Setting preview to input " + ATEM_INPUT_SOURCE + " and executing auto on M/E " + (ATEM_ME + 1) + " (" + THIS_MACHINE_ROLE + " machine)");

    var python =
        "import PyATEMMax\n" +
        "switcher = PyATEMMax.ATEMMax()\n" +
        "switcher.connect('" + ATEM_IP + "')\n" +
        "switcher.waitForConnection()\n" +
        "switcher.setPreviewInputVideoSource(" + ATEM_ME + ", " + ATEM_INPUT_SOURCE + ")\n" +
        "switcher.execAutoME(" + ATEM_ME + ")\n" +
        "print('ok')";

    var result = runCommand("python3 -c \"" + python + "\"");

    if (result.trim() === "ok") {
        log("ATEM auto executed successfully");
    } else {
        log("ATEM error: " + result.trim());
    }
}

function onOSCEvent(event) {
    var address = event["address"];
    if (!address) return;
    if (address === MY_OSC_ADDRESS) switchATEM();
}

log("ATEM " + THIS_MACHINE_ROLE + " script running. Listening for: " + MY_OSC_ADDRESS);
