/* main.js: start-up (loads last) */
jOpts();lfs();ftl();
fillSel(0);extras();init();if(!ok)$("pt").textContent="3D engine failed to load; the calculators still work."
