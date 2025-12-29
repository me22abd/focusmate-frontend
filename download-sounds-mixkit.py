#!/usr/bin/env python3
"""
Download sound files from Mixkit URLs
Note: These URLs may require browser-based download due to CDN protection
"""

import urllib.request
import os
import json

# Read sounds.json to get URLs
with open('public/sounds.json', 'r') as f:
    sounds = json.load(f)

os.chdir('public/sounds')

# Create directories
for sound in sounds:
    category_dir = sound['file'].split('/')[2]  # Extract category from path
    os.makedirs(category_dir, exist_ok=True)

# Download each file
for sound in sounds:
    url = sound['url']
    filepath = sound['file'].replace('/sounds/', '')  # Remove /sounds/ prefix
    
    print(f"Downloading: {filepath}")
    
    try:
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
        req.add_header('Referer', 'https://mixkit.co')
        req.add_header('Accept', 'audio/mpeg, audio/*, */*')
        
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read()
            if len(data) > 1000:  # Valid MP3 should be > 1KB
                with open(filepath, 'wb') as f:
                    f.write(data)
                print(f"  ✅ Downloaded: {filepath} ({len(data)} bytes)")
            else:
                print(f"  ⚠️  File too small, may be error page: {filepath} ({len(data)} bytes)")
    except urllib.error.HTTPError as e:
        print(f"  ❌ HTTP Error {e.code}: {filepath}")
        print(f"     You may need to download manually from: {url}")
    except Exception as e:
        print(f"  ❌ Error: {filepath} - {e}")

print("\n✅ Download script complete!")
print("⚠️  If files failed, download manually from mixkit.co and save to the paths in sounds.json")










