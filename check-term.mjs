import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", headless: true });
for (const [w, h, tag] of [[390, 844, "mobile"], [1440, 1000, "desktop"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", e => errs.push(String(e).slice(0, 140)));
  p.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
  await p.goto("https://triple4c.com/login", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2500);
  await p.fill("#login-email", "qa.bot@triple4c.co.za");
  await p.fill("#login-password", "Test4321");
  await p.click("button[type=submit]");
  await p.waitForSelector("h1:has-text('Welcome back')", { timeout: 45000 });
  await p.waitForTimeout(3500);
  const dash = await p.evaluate(() => ({
    sub: document.querySelector("h1")?.parentElement?.querySelector("p:last-child")?.textContent?.trim(),
    today: [...document.querySelectorAll("section")].find(s => /Today/i.test(s.textContent || ""))?.innerText.replace(/\s+/g, " ").slice(0, 120),
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  console.log(`[${tag}] "${dash.sub}"`);
  console.log(`   today: ${dash.today}`);
  console.log(`   overflow=${dash.over}`);

  await p.goto("https://triple4c.com/timetable", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(4500);
  const tt = await p.evaluate(() => ({
    banner: /No live classes yet/i.test(document.body.innerText),
    term: document.body.innerText.match(/Term 1, 2027[^\n]*/)?.[0] || null,
    joinDisabled: [...document.querySelectorAll("button")].filter(b => /Join Live|Enter Classroom/i.test(b.textContent || "")).map(b => b.disabled),
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  console.log(`   timetable banner=${tt.banner} term="${tt.term}" joinDisabled=${JSON.stringify(tt.joinDisabled)} overflow=${tt.over}`);
  console.log(`   errors: ${errs.length ? [...new Set(errs)][0] : "none"}`);
  await p.screenshot({ path: `term-${tag}.png` });
  await ctx.close();
}
await b.close();
