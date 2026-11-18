# Disk & RAID Simulator

Open `index.html` in a browser (needs internet once for Three.js from cdnjs).

| File | Purpose |
|---|---|
| `index.html` | Page markup and script loading order |
| `css/styles.css` | Dark "Disk Lab" theme |
| `js/core.js` | Helpers, disk database (localStorage), T(I/O) and R(I/O) calculator, tabs |
| `js/units.js` | Data-size (byte/KB/MB/GB/TB) and time (µs/ms/s/min) converter |
| `js/raid.js` | RAID 0/1/4/5 layouts, block mapping, comparison table, XOR parity demo |
| `js/extras.js` | Disk scheduling, amortization, checksums, SSD vs HDD |
| `js/disk3d.js` | Realistic 3D hard disk (Three.js r128) |
| `js/storage-sims.js` | Journaling crash scenarios, LFS cleaner, SSD FTL + garbage collection |
| `js/main.js` | Start-up |

Scripts are plain (non-module) so the app works when opened straight from disk.
