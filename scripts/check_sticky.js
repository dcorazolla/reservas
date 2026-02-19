const puppeteer = require('puppeteer');

(async () => {
  const url = 'http://localhost:5173/'
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // ensure calendar table present
  await page.waitForSelector('.calendar-table', { timeout: 10000 }).catch(()=>{});

  const sleep = (ms) => new Promise(r=>setTimeout(r, ms));

  async function snapshot(label) {
    return await page.evaluate((label) => {
      function infoFor(el) {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          node: el.tagName + (el.className ? `.${el.className.replace(/\s+/g,'.')}` : ''),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height),
          position: cs.position,
          topStyle: cs.top,
          overflow: { overflow: cs.overflow, overflowX: cs.overflowX, overflowY: cs.overflowY },
          transform: cs.transform,
          zIndex: cs.zIndex
        }
      }

      const header = document.querySelector('header, [data-app-header], .Header, .header, [role=banner]') || document.querySelector('header')
      const theadTh = document.querySelector('.calendar-table thead th.day-header')
      const firstRow = document.querySelector('.calendar-table tbody tr')
      const secondRow = document.querySelectorAll('.calendar-table tbody tr')[1]

      // ancestors problematic
      const problematic = [];
      let el = theadTh && theadTh.parentElement;
      while (el) {
        const s = getComputedStyle(el);
        if (s.overflow !== 'visible' || s.overflowY !== 'visible' || s.overflowX !== 'visible' || (s.transform && s.transform !== 'none')) {
          problematic.push({
            node: el.tagName + (el.className ? `.${el.className.replace(/\s+/g,'.')}` : ''),
            overflow: { overflow: s.overflow, overflowX: s.overflowX, overflowY: s.overflowY },
            position: s.position,
            transform: s.transform
          })
        }
        el = el.parentElement;
      }

      // computed header var
      let foundVars = [];
      let cur = theadTh || document.body;
      while (cur) {
        const v = getComputedStyle(cur).getPropertyValue('--app-header-h');
        if (v) foundVars.push({ node: cur.tagName + (cur.className ? `.${cur.className.replace(/\s+/g,'.')}` : ''), value: v.trim() })
        cur = cur.parentElement;
      }

      return { label, scrollY: window.scrollY, viewportHeight: window.innerHeight, header: infoFor(header), theadTh: infoFor(theadTh), firstRow: infoFor(firstRow), secondRow: infoFor(secondRow), problematic, foundVars }
    }, label)
  }

  const out = { url, steps: [] }
  out.steps.push(await snapshot('initial'))

  // compute header height
  const headerH = await page.evaluate(()=>{
    const v = getComputedStyle(document.documentElement).getPropertyValue('--app-header-h');
    return v ? parseInt(v) : 60;
  })

  // scroll so thead top reaches headerH
  const theadTop = await page.evaluate(()=>{
    const th = document.querySelector('.calendar-table thead th.day-header');
    return th ? th.getBoundingClientRect().top : null;
  })

  if (theadTop !== null) {
    const dy = theadTop - headerH + 1; // scroll down by this to push it under header
    await page.evaluate((dy)=>window.scrollBy({ top: dy, left: 0, behavior: 'auto' }), dy)
    await sleep(200)
    out.steps.push(await snapshot('after-scroll-to-stick'))

    // scroll a bit more
    await page.evaluate(()=>window.scrollBy({ top: 200, left: 0, behavior: 'auto' }))
    await sleep(200)
    out.steps.push(await snapshot('after-scroll-more'))

    // scroll back up a bit past threshold
    await page.evaluate(()=>window.scrollBy({ top: -150, left: 0, behavior: 'auto' }))
    await sleep(200)
    out.steps.push(await snapshot('after-scroll-up'))
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  process.exit(0);
})();
