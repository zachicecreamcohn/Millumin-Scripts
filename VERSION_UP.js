// NOTE: This script will quit Millumin and you'll have to reopen the file.
var projectPath = "~/Documents/Millumin Testing/Demo for Kylee.millumin";
var finderFolderPath = "~/Downloads/CONTENT";
var expandedProjectPath = runCommand("echo " + projectPath).trim();
var expandedFinderFolderPath = runCommand("echo " + finderFolderPath).trim();
var projectFolder = expandedProjectPath.substring(0, expandedProjectPath.lastIndexOf("/"));
var projectFilename = expandedProjectPath.substring(expandedProjectPath.lastIndexOf("/") + 1);
var backupFolder = projectFolder + "/BACKUP";
var logFile = "/tmp/version_up.log";

function writeLog(msg) {
    var timestamp = runCommand("date '+%Y-%m-%d %H:%M:%S'").trim();
    runCommand("echo '[" + timestamp + "] " + msg.replace(/'/g, "\\'") + "' >> " + logFile);
}

runCommand("echo '' > " + logFile);
writeLog("Script started");
writeLog("Project: " + expandedProjectPath);
writeLog("Finder folder: " + expandedFinderFolderPath);

function buildUpgradeMap() {
    var allFiles = runCommand("find '" + expandedFinderFolderPath + "' -type f").trim().split("\n");
    writeLog("Files in finder folder: " + JSON.stringify(allFiles));
    var groups = {};
    allFiles.forEach(function(fullPath) {
        var filename = fullPath.substring(fullPath.lastIndexOf("/") + 1);
        var m = filename.match(/^(.+_v)(\d+)(\.[a-zA-Z0-9]+)$/);
        if (!m) return;
        var base = m[1] + m[3];
        if (!groups[base]) groups[base] = [];
        groups[base].push({ filename: filename, fullPath: fullPath, version: parseInt(m[2]), padding: m[2].length, ext: m[3], prefix: m[1] });
    });
    var upgradeMap = {};
    Object.keys(groups).forEach(function(base) {
        var group = groups[base];
        group.sort(function(a, b) { return a.version - b.version; });
        var latest = group[group.length - 1];
        var vStr = String(latest.version);
        while (vStr.length < latest.padding) vStr = "0" + vStr;
        var latestName = latest.prefix + vStr + latest.ext;
        var latestFullPath = latest.fullPath.substring(0, latest.fullPath.lastIndexOf("/") + 1) + latestName;
        group.forEach(function(f) {
            if (f.version < latest.version) upgradeMap[f.fullPath] = latestFullPath;
        });
    });
    return upgradeMap;
}

var upgradeMap = buildUpgradeMap();
writeLog("Upgrade map: " + JSON.stringify(upgradeMap));

if (Object.keys(upgradeMap).length === 0) {
    writeLog("No media versions upgraded. Everything appears to be up to date.");
    log("No media versions upgraded. Everything appears to be up to date.");
} else {
    writeLog("Saving project...");
    Millumin.saveProject(null);

    runCommand("mkdir -p '" + backupFolder + "'");
    var timestamp = runCommand("date +%Y%m%d_%H%M%S").trim();
    var backupPath = backupFolder + "/" + projectFilename.replace(".millumin", "") + "_" + timestamp + ".millumin";
    runCommand("cp '" + expandedProjectPath + "' '" + backupPath + "'");
    writeLog("Backup saved to: " + backupPath);

    runCommand("cp '" + expandedProjectPath + "' /tmp/millumin_backup.millumin");

    var replacements = Object.keys(upgradeMap).map(function(oldPath) {
        var newPath = upgradeMap[oldPath];
        writeLog("Will replace: " + oldPath + " -> " + newPath);
        return "data = replace_in_plist(data, '" + oldPath + "', '" + newPath + "')";
    }).join("\n");

    var python = "import plistlib\n" +
        "def replace_in_plist(obj, old, new_):\n" +
        "    if isinstance(obj, dict):\n" +
        "        return {k: replace_in_plist(v, old, new_) for k, v in obj.items()}\n" +
        "    elif isinstance(obj, list):\n" +
        "        return [replace_in_plist(i, old, new_) for i in obj]\n" +
        "    elif isinstance(obj, str):\n" +
        "        return obj.replace(old, new_)\n" +
        "    else:\n" +
        "        return obj\n" +
        "with open('/tmp/millumin_backup.millumin', 'rb') as f:\n" +
        "    data = plistlib.load(f)\n" +
        replacements + "\n" +
        "with open('/tmp/millumin_output.millumin', 'wb') as f:\n" +
        "    plistlib.dump(data, f, fmt=plistlib.FMT_BINARY)\n" +
        "print('done')";

    writeLog("Running python plist replacement...");
    var result = runCommand("python3 -c \"" + python + "\" 2>&1");
    writeLog("Python result: " + result);

    if (result.trim() === "done") {
        runCommand("cp /tmp/millumin_output.millumin '" + expandedProjectPath + "'");
        writeLog("Output copied to project. Quitting Millumin.");
        Millumin.quit();
    } else {
        writeLog("ERROR: Python script failed. Project unchanged.");
        log("ERROR: Python script failed. Check log at: " + logFile);
    }
}
