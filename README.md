# A collection of scripts I use to make Millumin a bit easier


### Version Up
[Version Up](./VERSION_UP.js)

When run, replaces all content with its versioned up version. For example, content like `testImage_v01.png` will be replaced with `testImage_v02.png` if it exists.

> [!NOTE]
> Because of the silly way I implemented this, you'll need to relink the Finder Folder after running the script to remove dupes.


### Control from EOS

[EOS_TO_MILLUMIN](./EOS_TO_MILLUMIN.js)


This script listens for OSC messages from ETC EOS and then triggers the Millumin column with the same number as the EOS cue. Although one could use custom OSC messages from eos that conform to the Millumin OSC spec, we can use this script to avoid having to do that.


### Blackmagic ATEM Primary/Backup Switch

// CURRENTLY NOT IMPLEMENTED


This script is intended to be run on both the primary and backup Millumin machines. It listens for a custom OSC message (e.g. from the lighting console like `/atem/switch/primary` or `/atem/switch/backup`) and then triggers the appropriate ATEM switcher command to switch the primary and backup video feeds.

It should be configured so that it only listens for the command that corresponds to its machine (e.g. the primary machine only listens for `/atem/switch/primary` and the backup machine only listens for `/atem/switch/backup`), so that when the command is sent, only the appropriate machine will switch its feed. This is important to avoid both machines trying to communicate with the switcher at the same time. It's also important because if we're switching machines, the assumption is that the currently active machine is having issues, so we don't want to rely on that for the switching.
