#!/usr/bin/env python3
"""Refresh the inline-script hashes after changes to su.grades index.html."""
from pathlib import Path
import base64, hashlib, re
root = Path(__file__).resolve().parent
path = root / 'index.html'
s = path.read_text(encoding='utf-8')
s = re.sub(r'<!-- CSP hashes: regenerate with refresh-csp.py when inline scripts change\. --><meta http-equiv="Content-Security-Policy" content="[^"]*">', '', s)
scripts = re.findall(r'<script\b([^>]*)>([\s\S]*?)</script\s*>', s, re.I)
hashes = []
for attrs, code in scripts:
    if re.search(r'\bsrc\s*=', attrs, re.I) or not code.strip():
        continue
    digest = base64.b64encode(hashlib.sha256(code.encode('utf-8')).digest()).decode('ascii')
    hashes.append("'sha256-" + digest + "'")
assert len(hashes) == 4, f'Unexpected inline script count: {len(hashes)}'
policy = '; '.join([
    "default-src 'self'", "base-uri 'none'", "object-src 'none'", "frame-src 'none'",
    "script-src 'self' " + ' '.join(hashes),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:", "connect-src 'self'", "worker-src 'self' blob:",
    "form-action 'self' https://formsubmit.co"
])
marker = '<meta name="google-site-verification"'
assert marker in s
meta = '<!-- CSP hashes: regenerate with refresh-csp.py when inline scripts change. --><meta http-equiv="Content-Security-Policy" content="' + policy + '">'
s = s.replace(marker,meta + marker,1)
if '<meta name="referrer"' not in s:
    s = s.replace(meta,meta + '<meta name="referrer" content="strict-origin-when-cross-origin">',1)
path.write_text(s, encoding='utf-8')
print(f'Updated CSP with {len(hashes)} inline script hashes')
