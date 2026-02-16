#!/usr/bin/env python3
import re
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

link_re = re.compile(r"\[.*?\]\((.*?)\)")

def is_external(href: str) -> bool:
    return href.startswith("http://") or href.startswith("https://") or href.startswith("mailto:") or href.startswith("#")

def resolve_target(source: Path, target: str) -> Path:
    # remove query and fragment
    t = target.split('#',1)[0].split('?',1)[0]
    if t == '':
        return source
    p = Path(t)
    if p.is_absolute():
        # absolute path from repo root
        return (ROOT / p.relative_to('/')).resolve()
    return (source.parent / p).resolve()

broken = []

def is_ignored(path: Path) -> bool:
    parts = set(path.parts)
    if 'node_modules' in parts or 'vendor' in parts or '.git' in parts:
        return True
    return False

for md in ROOT.rglob('*.md'):
    if is_ignored(md):
        continue
    try:
        text = md.read_text(encoding='utf-8')
    except Exception:
        continue
    for m in link_re.finditer(text):
        href = m.group(1).strip()
        if is_external(href):
            continue
        target_path = resolve_target(md, href)
        # If the resolved path is inside node_modules or vendor, ignore.
        if is_ignored(target_path):
            continue
        if not target_path.exists():
            broken.append((str(md.relative_to(ROOT)), href, str(target_path)))

if not broken:
    print('No broken internal markdown links found.')
    sys.exit(0)

print('Broken links found:')
for src, href, resolved in broken:
    print(f'- {src} -> {href}  (resolved: {resolved})')

print(f"\nTotal broken links: {len(broken)}")
sys.exit(2)
