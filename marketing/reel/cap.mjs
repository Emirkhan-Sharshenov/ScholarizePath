import {chromium} from 'playwright-core';import {spawn} from 'child_process';
const mode=process.argv[2]||'stills';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--disable-web-security','--allow-file-access-from-files']});
const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('pageerror',e=>console.log('ERR',e.message));pg.on('console',m=>m.type()==='error'&&console.log('CONSOLE',m.text()));
await pg.goto('file://'+process.cwd()+'/'+(process.env.REEL||'reel')+'.html?capture');await pg.evaluate(()=>document.fonts.ready);
await pg.evaluate(()=>Promise.all(['800 40px Manrope','700 40px Manrope','500 40px Manrope','800 40px "Plus Jakarta Sans"','500 40px Inter','600 40px Inter','700 40px Inter'].map(f=>document.fonts.load(f,'Аa'))));
if(mode==='stills'){const ts=(process.argv[3]||'1,2.5,5,6.5,9,10.5,13,15,18,19.5,23,24.3,27,28.5,31,32.5,35,37.5').split(',').map(Number);
 for(const t of ts){await pg.evaluate(t=>render(t),t);await pg.screenshot({path:`still_${t}.jpg`,type:'jpeg',quality:80});}}
else{const fps=30,N=Math.round(38.5*fps);const ff=spawn(process.env.FF,['-y','-f','image2pipe','-framerate',''+fps,'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart','-r',''+fps,(process.env.REEL||'reel')+'.mp4'],{stdio:['pipe','ignore','inherit']});
 for(let i=0;i<N;i++){await pg.evaluate(t=>render(t),i/fps);const buf=await pg.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150==0)console.log(i,'/',N);}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));}
await b.close();
