(async () => {
  try {
    // 1) Get all devices
    const devRes = await fetch("/api/s/default/stat/device");
    if (!devRes.ok) throw new Error("Device fetch failed: " + devRes.status);
    const devJson = await devRes.json();

    // 2) Get all port profiles (port configurations)
    const profRes = await fetch("/api/s/default/rest/portconf");
    if (!profRes.ok) throw new Error("Port profile fetch failed: " + profRes.status);
    const profJson = await profRes.json();

    // Build a lookup table for port profiles by _id
    const portconfMap = {};
    profJson.data.forEach(p => {
      portconfMap[p._id] = p;
    });

    // 3) Filter switches
    const switches = devJson.data.filter(d => d.type === "usw");

    let lines = [];
    lines.push("UniFi Switch Port Configuration Export");
    lines.push("Generated: " + new Date().toISOString());
    lines.push("=====================================");
    lines.push("");

    switches.forEach(sw => {
      const swName = sw.name || sw.device_name || sw.model || sw.mac;
      lines.push(`SWITCH: ${swName}`);
      lines.push(`  Model: ${sw.model}   IP: ${sw.ip || "N/A"}   MAC: ${sw.mac}`);
      lines.push("  Ports:");

      (sw.port_table || [])
        .filter(p => typeof p.port_idx !== "undefined") // filter out non-ports
        .sort((a, b) => a.port_idx - b.port_idx)
        .forEach(port => {
          const idx = port.port_idx;
          const portName = port.name || "";
          const upDown = port.up ? "UP" : "DOWN";
          const speed = port.speed ? `${port.speed} Mbps` : "N/A";
          const poeState = port.poe_enable ? (port.poe_mode || "enabled") : "off";

          const profile = portconfMap[port.portconf_id];
          const profileName = profile ? (profile.name || profile._id) : "Unknown profile";
          const mode = (profile && (profile.op_mode || profile.mode)) || port.op_mode || "unknown";
          const vlan =
            profile && typeof profile.vlan !== "undefined"
              ? profile.vlan
              : (profile && typeof profile.native_networkconf_id !== "undefined"
                  ? `native-net:${profile.native_networkconf_id}`
                  : "N/A");

          lines.push(
            `    IP: ${sw.ip || "N/A"} | Port ${idx}:` +
            (portName ? ` "${portName}"` : "") +
            ` | Profile: ${profileName}` +
            ` | Mode: ${mode}` +
            ` | VLAN: ${vlan}` +
            ` | PoE: ${poeState}` +
            ` | Link: ${upDown}` +
            ` | Speed: ${speed}`
          );
        });

      lines.push(""); // blank line between switches
    });

    const output = lines.join("\n");

    console.log("=== BEGIN OUTPUT SAMPLE ===");
    console.log(output.slice(0, 2000));
    console.log("=== END OUTPUT SAMPLE (full content will be in the file) ===");

    // 4) Create and trigger a download of a txt file
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unifi_switch_ports.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("✅ Done. File download should have started: unifi_switch_ports.txt");
  } catch (err) {
    console.error("❌ Error during export:", err);
  }
})();

