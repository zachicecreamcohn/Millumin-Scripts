// EOS to Millumin Column Trigger
//
// Listens for OSC active-cue messages from ETC EOS and launches the Millumin
// column matching the EOS cue number whenever the active cue changes.
//
// EOS sends /eos/out/active/cue/<list>/<cue> once per second with a float
// argument (% complete). We fire Millumin only when the cue number changes.
//
// SETUP:
//   1. In EOS: Setup > System > Show Control > OSC TX — enable UDP TX,
//      set the IP to this machine and port to whatever Millumin listens on.
//   2. Add this script to a layer in Millumin and run it. It runs indefinitely.
//   3. Millumin columns are 1-indexed and matched by cue number (rounded to int).

var EOS_CUE_LIST = 1; // EOS cue list number to listen to

var ACTIVE_CUE_PATTERN = new RegExp("^/eos/out/active/cue/" + EOS_CUE_LIST + "/(\\d+(?:\\.\\d+)?)$");

function onOSCEvent(event) {
    var address = event["address"];
    if (!address) return;

    var match = address.match(ACTIVE_CUE_PATTERN);
    if (!match) return;

    var cueNumber = match[1];
    var columnIndex = Math.round(parseFloat(cueNumber));
    if (columnIndex === Millumin.getLaunchedColumnIndex()) return;
    log("EOS active cue: " + cueNumber + " -> launching Millumin column " + columnIndex);
    Millumin.launchColumn(columnIndex);
}
