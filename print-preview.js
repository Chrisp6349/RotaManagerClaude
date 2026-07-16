/**
 * print-preview.js
 * ----------------
 * Opens a separate print-friendly window showing the current week's
 * allocations as static text (dropdowns are replaced with plain values),
 * ready to print and put up in the office.
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

    const p = window.open("", "_blank");
    const today = new Date().toLocaleString();

    p.document.write(`<!DOCTYPE html><html><head><title>🖨 Print Preview</title><style>
body{font-family:Arial,sans-serif;margin:20px}
.toolbar{display:flex;justify-content:flex-end;gap:10px;margin-bottom:4px}
button{padding:8px 14px}
.header{display:flex;align-items:center;gap:16px;margin-bottom:4px}.header-text{flex:1;text-align:center}.logo{height:60px}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:3px}
@media print{.toolbar{display:none}@page{size:A4 landscape;margin:8mm}}
</style></head><body>
<div class='toolbar'><button onclick='window.print()'>🖨 Print</button><button onclick='window.close()'>✖ Close Preview</button></div>
<div class="header"><img class="logo" src="assets/logo.jpg"><div class="header-text"><h1>Cardiothoracic Theatre SODP Allocations</h1><div>Cardiothoracic Theatres</div><div>Derriford Hospital</div><div><b>Week Commencing:</b> ${formatWeekCommencing(weekInput.value)}</div></div></div>
<div id='content'></div><div style='text-align:right;margin-top:12px'>Printed: ${today}</div></body></html>`);

    p.document.getElementById('content').innerHTML = document.getElementById('weekdayRota').innerHTML + "<h2 style='text-align:center'></h2>" + document.getElementById('weekendRota').innerHTML;

    // Replace each <select> with its currently selected text, since a
    // printed page can't show interactive dropdowns.
    p.document.querySelectorAll('select').forEach(sel => {
        const d = p.document.createElement('div');
        d.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
        d.style.fontWeight = 'bold';
        d.style.fontSize = '15px';
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
            span.style.fontSize = "12px";
            span.style.textAlign = "center";
            cb.parentElement.replaceWith(span);
        } else {
            cb.parentElement.remove();
        }
    });
}
