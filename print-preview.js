/**
 * print-preview.js
 * ----------------
 * Opens a separate print-friendly window showing the current week's
 * allocations as static text (dropdowns are replaced with plain values),
 * ready to print and put up in the office.
 *
 * The sheet must read perfectly in black and white - the office printer
 * may not be colour - so structure is carried by weight, rules, and
 * shading, with colour only as a bonus on colour printers/screens.
 */

// Formats an ISO date as "6th July 2026" for the print preview header.
function formatWeekCommencing(iso) {
    const d = new Date(iso + "T00:00:00");
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const day = d.getDate();
    const suf = (n) => {
        if (n % 100 >= 11 && n % 100 <= 13) return "th";
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };
    return `${day}${suf(day)} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Uppercases a value for display, or returns "" if empty.
// (Currently unused elsewhere, kept from the original app.)
function fmt(v) {
    return v ? v.toUpperCase() : "";
}

// "Open Viewer" is currently just an alias for the print preview.
function viewerMode() {
    printFriendlyView();
}

// Builds and opens the print-friendly window: captures the current
// dropdown/checkbox selections, then renders a plain-text version of
// both tables (with the department logo and header) in a new tab.
function printFriendlyView() {
    document.querySelectorAll("select").forEach(s => rota[s.dataset.key] = s.value);
    document.querySelectorAll('input[type="checkbox"][data-key]')
        .forEach(c => rota[c.dataset.key] = c.checked);

    // The preview opens as a blank window, so a relative path like
    // "logo.jpg" has nothing to resolve against and the image would break.
    // Resolve it to a full address against this page before injecting it.
    const logoUrl = new URL(LOGO_PATH, window.location.href).href;

    const p = window.open("", "_blank");
    const today = new Date().toLocaleString();

    p.document.write(`<!DOCTYPE html><html><head><title>Print Preview</title><style>
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111}

/* On-screen toolbar - never printed */
.toolbar{display:flex;justify-content:flex-end;gap:10px;margin-bottom:10px}
.toolbar button{font:inherit;font-size:14px;font-weight:700;padding:9px 16px;
  border-radius:6px;border:1px solid #98A2AB;background:#fff;cursor:pointer}
.toolbar button:first-child{background:#005EB8;border-color:#005EB8;color:#fff}

/* Header band - compact so the tables get the page */
.header{display:flex;align-items:center;gap:14px;border-bottom:2px solid #111;
  padding-bottom:6px;margin-bottom:8px}
.logo{height:50px}
.header-text{flex:1;text-align:center}
.header-text h1{margin:0;font-size:19px;letter-spacing:.02em}
.header-sub{margin:2px 0 0;font-size:13px;color:#444}
.header-week{margin:4px 0 0;font-size:16px;font-weight:700}

/* Tables - sized so weekday + weekend fill one A4 landscape sheet */
table{width:100%;border-collapse:collapse;margin-bottom:10px}
th{background:#fff;color:#111;font-size:12px;letter-spacing:.06em;
  text-transform:uppercase;text-align:center;padding:6px 5px;
  border:1px solid #666;border-bottom:3px double #111}
td{border:1px solid #666;padding:3px 5px;vertical-align:top}
tr:nth-child(even) td{background:#F1F1F1}

/* Day cells anchor each row */
.daycell{font-weight:800;font-size:13px;text-align:center;background:#E2E2E2 !important;
  border-right:2px solid #111;width:8%}

/* Values that replace the dropdowns - empty slots collapse so the
   filled ones can be bigger without taller boxes. Uppercase is
   display-only: the stored names are unchanged. */
td div{font-weight:700;font-size:13px;text-align:center;padding:0;line-height:1.25;text-transform:uppercase}
td div:empty{display:none}

/* On Call column: heaviest ink on the page - it's what people look for */
table:first-of-type td:last-child{border-left:2px solid #111}
table:first-of-type th:last-child{border-left:2px solid #111}

h2{margin:2px 0}
.printed{margin-top:6px;text-align:right;font-size:10px;color:#555}

@media print{
  .toolbar{display:none}
  @page{size:A4 landscape;margin:6mm}
  body{margin:0}
  th,td{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  td,th{page-break-inside:avoid}
}
</style></head><body>
<div class='toolbar'><button onclick='window.print()'>&#128424; Print</button><button onclick='window.close()'>&#10006; Close Preview</button></div>
<div class="header"><img class="logo" src="${logoUrl}"><div class="header-text"><h1>Cardiothoracic Theatre SODP Allocations</h1><p class="header-sub">Cardiothoracic Theatres &middot; Derriford Hospital</p><p class="header-week">Week Commencing: ${formatWeekCommencing(weekInput.value)}</p></div></div>
<div id='content'></div><div class='printed'>Printed: ${today}</div></body></html>`);

    p.document.getElementById('content').innerHTML = document.getElementById('weekdayRota').innerHTML + "<h2 style='text-align:center'></h2>" + document.getElementById('weekendRota').innerHTML;

    // Replace each <select> with its currently selected text, since a
    // printed page can't show interactive dropdowns.
    p.document.querySelectorAll('select').forEach(sel => {
        const d = p.document.createElement('div');
        d.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
        d.style.fontWeight = 'bold';
        d.style.fontSize = '13px';   // sized so a full week fills one A4 landscape sheet
        d.style.textAlign = 'center';
        sel.replaceWith(d);
    });

    // Replace each "From Home" checkbox with a text label if checked,
    // or remove it entirely if not - checkboxes don't print well either.
    p.document.querySelectorAll("input[type='checkbox'][data-key]").forEach((cb, index) => {
        const day = weekdays[index];
        const checked = !!rota[`${day}_fromhome`];

        if (checked) {
            const span = p.document.createElement("div");
            span.textContent = "FROM HOME";
            span.style.fontWeight = "bold";
            span.style.fontSize = "11px";
            span.style.textAlign = "center";
            cb.parentElement.replaceWith(span);
        } else {
            cb.parentElement.remove();
        }
    });
}
