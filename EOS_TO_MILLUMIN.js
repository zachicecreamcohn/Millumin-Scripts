// EOS to Millumin Column Trigger
//
// Listens for OSC cue-fire events from ETC EOS and launches the Millumin
// column matching the EOS cue number.
//
// EOS sends /eos/out/event/cue/<list>/<cue>/fire when a cue is fired.
// Whole cue numbers (e.g. 5) launch by index; decimal cues (e.g. 1.5) launch by name.
//
// SETUP:
//   1. In EOS: Setup > System > Show Control > OSC TX — enable UDP TX,
//      set the IP to this machine and port to whatever Millumin listens on.
//   2. Add this script to a layer in Millumin and run it. It runs indefinitely.

var EOS_CUE_LIST = 1; // EOS cue list number to listen to

var CUE_FIRE_PATTERN = new RegExp("^/eos/out/event/cue/" + EOS_CUE_LIST + "/(\\d+(?:\\.\\d+)?)/fire$");

function onOSCEvent(event) {
    var address = event["address"];
    if (!address) return;

    var match = address.match(CUE_FIRE_PATTERN);
    if (!match) return;

    var cueNumber = match[1];
    if (cueNumber.indexOf(".") === -1) {
        Millumin.launchColumn(parseInt(cueNumber, 10));
    } else {
        Millumin.launchColumn(cueNumber);
    }
}
