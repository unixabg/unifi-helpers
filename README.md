# unifi-helpers
Helper tools for UniFi deployments
# UniFi Switch Port Export & Automation Toolkit

This repository contains tools for extracting UniFi switch port configuration data directly from a UniFi Network Controller and using that data to automate port-level operations such as PoE power-cycling or VLAN changes.

It is designed for environments with many UniFi switches where bulk operations and inventory auditing are needed.

---

# 🔍 Overview

This toolkit provides:

### **1. A UniFi Switch Port Exporter (JavaScript)**
Located in:
`./javascript/unifi-switch-port-exporter.js`

This script is executed **inside your web browser’s console** while logged into a UniFi Network Controller.
It queries the UniFi internal API and produces a detailed, machine-parsable text file:

```
unifi_switch_ports.txt
```

### **2. An Automation Script Example (Bash)**
Located in:
`./examples/unifi-vlan-reboot`

This script processes a list of switch/port commands and performs SSH-based actions (such as PoE power cycle or VLAN operations). It is structured for batch automation and can operate in a while-read loop consuming device lists.

---

# 🧩 Workflow Overview

The typical flow looks like this:

## **Step 1 — Export switch port information**

1. Log into your UniFi Network Controller (web UI).
2. Open Developer Tools → Console.
3. Paste the content of:

```
./javascript/unifi-switch-port-exporter.js
```

4. Press **Enter**.

The script will:

- Query the UniFi API for devices and port profiles
- Extract all switches (`type === "usw"`)
- Resolve port settings (port profiles, VLANs, PoE, link status, speed)
- Prefix every port entry with the switch’s IP address
- Generate a downloadable file:

```
unifi_switch_ports.txt
```

Example of exported output:

```
SWITCH: ES-IDF-Annex-Ubnt-1
  Model: US8P150   IP: 172.16.98.130   MAC: b4:fb:e4:56:e9:86
  Ports:
    IP: 172.16.98.130 | Port 1: "Port 1" | Profile: All | Mode: switch | VLAN: N/A | PoE: off | Link: DOWN | Speed: N/A
    IP: 172.16.98.130 | Port 2: "Port 2" | Profile: All | Mode: switch | VLAN: N/A | PoE: off | Link: DOWN | Speed: N/A
```

---

## **Step 2 — Parse the exported file**

You can use simple tools like `grep`, `awk`, and `sed` to generate run-tables.

Example: extract all ports using the “20-Security” profile:

```bash
grep 20-Security unifi_switch_ports.txt   | awk '{print "./unifi-vlan-reboot " $2 " admin " ($5+0)}'
```

You can redirect these to a file:

```bash
grep 20-Security unifi_switch_ports.txt   | awk '{print $2 " admin " ($5+0)}' > devices.txt
```

Resulting file format:

```
172.16.99.50 admin 10
172.16.99.50 admin 21
172.16.99.50 admin 22
```

---

## **Step 3 — Perform automation actions**

Use the example script:

```
./examples/unifi-vlan-reboot
```

This script supports **two modes**:

### **A. Batch mode (preferred)**
Give it a devices file:

```bash
./unifi-vlan-reboot devices.txt
```

### **B. One-off mode**

```bash
./unifi-vlan-reboot 172.16.98.45 admin 13
```

---

# 🛠 Features & Notes

- Fully automated switch port inventory generation
- Downstream automation-friendly output
- Stateless SSH connections
- Safe while-read loops (`ssh -n`)

---

# 🪪 License

See the included `LICENSE` file.

