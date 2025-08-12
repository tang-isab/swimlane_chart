# Swimlane Project Tracker

A visual project tracking tool with swimlanes, task dependencies, and timeline management.

## Features

- ✅ Customizable number of weeks (default: 9)
- ✅ Multiple swimlanes (Marketing, Management, Web Design Team)
- ✅ Task dependencies with visual arrows
- ✅ Color-coded tasks
- ✅ Blocked task highlighting
- ✅ Easy task and swimlane management
- ✅ **Real-time shared storage** - Everyone sees the same data
- ✅ **Auto-save with server sync**
- ✅ **Export/Import projects as JSON files**
- ✅ **Collaborative editing** - Multiple users, one project

## How to Run

### Option 1: Using Python directly
```bash
python chart.py
```

### Option 2: Using the batch file (Windows)
Double-click `start_server.bat`

## Sharing on Network

When you run the server, it will display:
- **Local access**: `http://localhost:8000` (only on your computer)
- **Network access**: `http://YOUR_IP:8000` (accessible to others on your network)

### For others to access:

1. Make sure they're on the same network (WiFi/LAN)
2. Share the network URL: `http://YOUR_IP:8000`
3. Configure Windows Firewall (see below)

### Quick Firewall Fix:

**Option 1: Automatic (Recommended)**
1. Right-click `setup_firewall.bat` and select "Run as administrator"
2. Follow the prompts

**Option 2: Manual PowerShell Command**
Run PowerShell as Administrator and execute:
```powershell
New-NetFirewallRule -DisplayName "Swimlane Project Tracker" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

**Option 3: GUI Method**
1. Open Windows Defender Firewall with Advanced Security
2. Click "Inbound Rules" → "New Rule"
3. Select "Port" → Next
4. Select "TCP" and enter "8000" → Next
5. Select "Allow the connection" → Next
6. Check all profiles → Next
7. Name it "Swimlane Project Tracker" → Finish

### Troubleshooting:

**If others still can't access:**
1. **Check your IP**: The server will show all available network URLs when it starts
2. **Test locally first**: Make sure `http://localhost:8000` works
3. **Same network**: Ensure everyone is on the same WiFi/LAN
4. **Firewall**: Try temporarily disabling Windows Firewall to test
5. **Antivirus**: Some antivirus software blocks incoming connections
6. **Router**: Some routers block device-to-device communication

**Common IP addresses to try:**
- If you see multiple IPs when the server starts, try each one
- Usually starts with 192.168.x.x or 10.x.x.x

## Usage

### Basic Operations
1. **Add Swimlanes**: Click "Add Swimlane" to create new categories
2. **Add Tasks**: Click "Add Task" to create new project items
3. **Set Dependencies**: When adding tasks, select which task this depends on
4. **Edit Tasks**: Click on any task to edit its properties
5. **Delete**: Hover over swimlanes to see delete button
6. **Adjust Timeline**: Change the number of weeks and click "Update"

### Saving & Loading
- **Shared Storage**: All changes are automatically saved to the server and shared with everyone
- **Real-time Sync**: When one person makes changes, others will see them immediately
- **Auto-Save**: All changes are automatically saved to the shared server storage
- **Export Project**: Click "💾 Save Project" to download your project as a JSON file
- **Import Project**: Click "📁 Load Project" to load a previously saved JSON file
- **Reset**: Click "🔄 Reset" to return to the default sample project
- **Fallback**: If server storage fails, it falls back to local browser storage

### Collaboration
1. **Real-time Sharing**: Everyone on the network shares the same live project data
2. **Instant Updates**: Changes made by one person appear immediately for others
3. **Conflict-free**: Server manages all data to prevent conflicts
4. **Backup Options**: Export projects for backup or sharing with external teams

## Task Features

- **Dependencies**: Tasks with dependencies show red arrows pointing to them
- **Blocked Tasks**: Tasks that can't start yet appear red and semi-transparent
- **Color Coding**: Choose custom colors for different task types
- **Double-click**: Double-click tasks to mark them as completed

## Files

- `index.html` - Main webpage
- `styles.css` - Styling and layout
- `script.js` - Interactive functionality
- `chart.py` - Local web server
- `start_server.bat` - Easy Windows launcher
