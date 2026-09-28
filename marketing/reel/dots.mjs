import fs from 'fs'; import {feature} from 'topojson-client'; import {geoContains} from 'd3-geo';
const topo=JSON.parse(fs.readFileSync('/home/user/ScholarizePath/public/data/countries-50m.json'));
const land=feature(topo,topo.objects.countries);
const pts=[];const step=1.6;
for(let lat=-58;lat<=78;lat+=step){const n=Math.max(1,Math.round(360*Math.cos(lat*Math.PI/180)/step));
 for(let i=0;i<n;i++){const lon=-180+i*360/n; if(land.features.some(f=>geoContains(f,[lon,lat])))pts.push([+lon.toFixed(1),+lat.toFixed(1)]);}}
fs.writeFileSync('dots.js','window.LAND='+JSON.stringify(pts)+';');console.log(pts.length);
