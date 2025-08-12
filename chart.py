#!/usr/bin/env python3
"""
Swimlane Project Tracker - Local Web Server with Shared Storage
Simple HTTP server to serve the swimlane project tracker webpage locally with shared data storage.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import socket
import json
import urllib.parse
from pathlib import Path
from datetime import datetime

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"

def get_all_ips():
    """Get all available IP addresses for this machine"""
    hostname = socket.gethostname()
    ips = []
    try:
        # Get all IP addresses associated with the hostname
        for info in socket.getaddrinfo(hostname, None):
            ip = str(info[4][0])
            if ip not in ips and not ip.startswith('127.') and ':' not in ip:
                ips.append(ip)
    except Exception:
        pass
    
    # Also try getting the primary local IP
    primary_ip = get_local_ip()
    if primary_ip not in ips and not primary_ip.startswith('127.'):
        ips.append(primary_ip)
    
    return ips

class SharedDataHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler that supports shared data storage via API endpoints"""
    
    DATA_FILE = 'shared_project_data.json'
    
    def do_GET(self):
        """Handle GET requests - serve files or API endpoints"""
        if self.path == '/api/data':
            self.serve_project_data()
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests - save project data"""
        if self.path == '/api/data':
            self.save_project_data()
        else:
            self.send_error(404)
    
    def serve_project_data(self):
        """Send the current project data as JSON"""
        try:
            if os.path.exists(self.DATA_FILE):
                with open(self.DATA_FILE, 'r', encoding='utf-8') as f:
                    data = f.read()
            else:
                # Return default data if no file exists
                data = json.dumps(self.get_default_data(), indent=2)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(data.encode('utf-8'))
            
        except Exception as e:
            print(f"Error serving data: {e}")
            self.send_error(500)
    
    def save_project_data(self):
        """Save posted project data to file"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse and validate JSON
            data = json.loads(post_data.decode('utf-8'))
            
            # Add server timestamp
            data['lastSaved'] = datetime.now().isoformat()
            data['serverTimestamp'] = datetime.now().isoformat()
            
            # Save to file
            with open(self.DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'success': True, 'timestamp': data['serverTimestamp']}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
            print(f"✅ Project data saved at {data['serverTimestamp']}")
            
        except Exception as e:
            print(f"Error saving data: {e}")
            self.send_error(500)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def get_default_data(self):
        """Return default project data"""
        return {
            "weeks": 9,
            "swimlanes": [
                {"id": "marketing", "name": "Marketing"},
                {"id": "management", "name": "Management"},
                {"id": "webdesign", "name": "Web Design Team"}
            ],
            "tasks": [
                {
                    "id": "suggest-changes",
                    "name": "Suggest changes to website",
                    "swimlane": "marketing",
                    "start": 2,
                    "duration": 1,
                    "color": "#FF9800",
                    "dependencies": []
                },
                {
                    "id": "evaluate-changes",
                    "name": "Evaluate changes",
                    "swimlane": "management",
                    "start": 3,
                    "duration": 1,
                    "color": "#2196F3",
                    "dependencies": ["suggest-changes"]
                },
                {
                    "id": "check-changes",
                    "name": "Check suggested changes",
                    "swimlane": "webdesign",
                    "start": 4,
                    "duration": 1,
                    "color": "#2196F3",
                    "dependencies": ["evaluate-changes"]
                },
                {
                    "id": "reevaluate-changes",
                    "name": "Re-evaluate changes",
                    "swimlane": "management",
                    "start": 6,
                    "duration": 1,
                    "color": "#2196F3",
                    "dependencies": ["check-changes"]
                },
                {
                    "id": "evaluate-new-changes",
                    "name": "Evaluate new changes",
                    "swimlane": "management",
                    "start": 7,
                    "duration": 1,
                    "color": "#2196F3",
                    "dependencies": ["reevaluate-changes"]
                },
                {
                    "id": "implement-changes",
                    "name": "Implement changes to website",
                    "swimlane": "marketing",
                    "start": 9,
                    "duration": 2,
                    "color": "#FF9800",
                    "dependencies": ["evaluate-new-changes"]
                }
            ],
            "version": "1.0",
            "created": datetime.now().isoformat()
        }

def main():
    # Set the port
    PORT = 8000
    
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    
    # Change to the script directory to serve files from there
    os.chdir(script_dir)
    
    # Get local IP address
    local_ip = get_local_ip()
    all_ips = get_all_ips()
    
    # Create the HTTP server - bind to all interfaces with "0.0.0.0"
    Handler = SharedDataHandler
    
    try:
        with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
            print(f"🚀 Swimlane Project Tracker starting...")
            print(f"📂 Serving files from: {script_dir}")
            print(f"💾 Shared data file: {Handler.DATA_FILE}")
            print(f"🌐 Local access: http://localhost:{PORT}")
            print(f"🌍 Primary network IP: http://{local_ip}:{PORT}")
            
            if all_ips:
                print(f"📱 All available network URLs:")
                for ip in all_ips:
                    print(f"   http://{ip}:{PORT}")
            
            print(f"📄 Opening in your browser...")
            print(f"⏹️  Press Ctrl+C to stop the server")
            print(f"")
            print(f"🤝 SHARED DATA:")
            print(f"   All users on the network will share the same project data")
            print(f"   Changes made by one person will be visible to everyone")
            print(f"   Data is stored in: {Handler.DATA_FILE}")
            print(f"")
            print(f"🔥 FIREWALL TROUBLESHOOTING:")
            print(f"   If others can't access the URLs above, try:")
            print(f"   1. Run this command as Administrator in PowerShell:")
            print(f"      New-NetFirewallRule -DisplayName 'Python Server' -Direction Inbound -Protocol TCP -LocalPort {PORT} -Action Allow")
            print(f"   2. Or temporarily disable Windows Firewall for testing")
            print(f"   3. Make sure you're on the same WiFi/network")
            print(f"")
            
            # Open the webpage in the default browser
            webbrowser.open(f"http://localhost:{PORT}")
            
            # Start the server
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {PORT} is already in use. Please close other applications using this port or try a different port.")
            sys.exit(1)
        else:
            print(f"❌ Error starting server: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()