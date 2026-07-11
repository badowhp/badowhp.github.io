import { writeFile } from "node:fs/promises";

function option(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const port = Number(option("--port", "9333"));
const url = option("--url", "http://127.0.0.1:8000/");
const width = Number(option("--width", "1440"));
const height = Number(option("--height", "1100"));
const screenshotPath = option("--screenshot", "/private/tmp/hipo-browser-qa.png");
const menuScreenshotPath = option("--menu-screenshot");
const mobile = process.argv.includes("--mobile");
const fullPagePath = option("--full-page-screenshot");
const reportPath = option("--report");

if (typeof WebSocket === "undefined") {
  throw new Error("Run with: node --experimental-websocket scripts/browser-qa.mjs ...");
}

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((entry) => entry.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error(`No debuggable Chrome page found on port ${port}`);

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const eventWaiters = new Map();
const consoleErrors = [];
const networkFailures = [];

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(`${message.error.code}: ${message.error.message}`));
    else resolve(message.result);
    return;
  }

  if (message.method === "Runtime.exceptionThrown") {
    consoleErrors.push(message.params.exceptionDetails?.text || "Uncaught runtime exception");
  }
  if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params.entry.level)) {
    consoleErrors.push(`${message.params.entry.level}: ${message.params.entry.text}`);
  }
  if (message.method === "Network.loadingFailed" && !message.params.canceled) {
    networkFailures.push(`${message.params.errorText}: ${message.params.requestId}`);
  }
  if (message.method === "Network.responseReceived" && message.params.response.status >= 400) {
    networkFailures.push(`${message.params.response.status}: ${message.params.response.url}`);
  }

  const waiters = eventWaiters.get(message.method);
  if (waiters?.length) {
    const resolve = waiters.shift();
    resolve(message.params);
  }
});

function send(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function once(method) {
  return new Promise((resolve) => {
    const waiters = eventWaiters.get(method) || [];
    waiters.push(resolve);
    eventWaiters.set(method, waiters);
  });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Browser evaluation failed");
  return result.result.value;
}

async function screenshot(filename, fullPage = false) {
  let params = { format: "png", fromSurface: true, captureBeyondViewport: fullPage };
  if (fullPage) {
    const metrics = await send("Page.getLayoutMetrics");
    const size = metrics.cssContentSize || metrics.contentSize;
    params = {
      ...params,
      clip: { x: 0, y: 0, width: size.width, height: size.height, scale: 1 }
    };
  }
  const capture = await send("Page.captureScreenshot", params);
  await writeFile(filename, Buffer.from(capture.data, "base64"));
}

await Promise.all([
  send("Page.enable"),
  send("Runtime.enable"),
  send("Network.enable"),
  send("Log.enable")
]);
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile,
  screenWidth: width,
  screenHeight: height
});

const loaded = once("Page.loadEventFired");
await send("Page.navigate", { url });
await loaded;
await delay(250);

const layout = await evaluate(`(() => {
  const root = document.documentElement;
  const body = document.body;
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  return {
    title: document.title,
    language: root.lang,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    documentScrollWidth: root.scrollWidth,
    bodyScrollWidth: body.scrollWidth,
    horizontalOverflow: root.scrollWidth > window.innerWidth || body.scrollWidth > window.innerWidth,
    menuToggleDisplay: menuToggle ? getComputedStyle(menuToggle).display : null,
    menuExpanded: menuToggle?.getAttribute('aria-expanded'),
    menuHidden: mobileMenu?.hidden,
    h1: document.querySelector('h1')?.textContent.trim(),
    activeElement: document.activeElement?.tagName
  };
})()`);

await screenshot(screenshotPath);
if (fullPagePath) await screenshot(fullPagePath, true);

let menu = null;
if (mobile) {
  menu = await evaluate(`(() => {
    const toggle = document.querySelector('.menu-toggle');
    const panel = document.getElementById('mobile-menu');
    toggle.focus();
    toggle.click();
    return {
      expanded: toggle.getAttribute('aria-expanded'),
      hidden: panel.hidden,
      bodyLocked: document.body.classList.contains('menu-open'),
      firstLinkHeight: panel.querySelector('a')?.getBoundingClientRect().height || 0
    };
  })()`);
  await delay(80);
  if (menuScreenshotPath) await screenshot(menuScreenshotPath);
  menu.escapeResult = await evaluate(`(() => {
    const toggle = document.querySelector('.menu-toggle');
    const panel = document.getElementById('mobile-menu');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return {
      expanded: toggle.getAttribute('aria-expanded'),
      hidden: panel.hidden,
      focusReturned: document.activeElement === toggle,
      bodyUnlocked: !document.body.classList.contains('menu-open')
    };
  })()`);
}

const report = {
  url,
  viewport: { width, height, mobile },
  screenshot: screenshotPath,
  fullPageScreenshot: fullPagePath || null,
  menuScreenshot: menuScreenshotPath || null,
  layout,
  menu,
  consoleErrors,
  networkFailures
};

const serializedReport = `${JSON.stringify(report, null, 2)}\n`;
if (reportPath) await writeFile(reportPath, serializedReport, "utf8");
process.stdout.write(serializedReport);
socket.close();

if (layout.horizontalOverflow || consoleErrors.length || networkFailures.length) process.exitCode = 1;
if (mobile && (!menu || menu.expanded !== "true" || menu.hidden || menu.firstLinkHeight < 44 || !menu.escapeResult.focusReturned)) {
  process.exitCode = 1;
}

await delay(25);
process.exit(process.exitCode || 0);
