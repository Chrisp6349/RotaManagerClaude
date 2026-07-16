/**
 * data.js
 * -------
 * Reads and writes rota data to/from the Google Sheets backend (via the
 * Apps Script Web App at API_URL), and handles the small UI feedback
 * (button text/colour flashes) that confirms a load or save happened.
 */

// Loads the selected week's rota from Google Sheets and re-renders.
// Remembers the selected week in localStorage so it's pre-filled next visit.
async function loadWeek() {
    localStorage.setItem("selectedMonday", weekInput.value);
    try {
        const r = await fetch(API_URL + "?week=" + weekInput.value);
        rota = await r.json();
    } catch (e) {
        console.log(e);
        rota = {};
    }
    render();

    const b = document.getElementById("loadBtn");
    if (b) {
        b.textContent = "✔ Loaded";
        b.style.background = "#4CAF50";
        setTimeout(() => { b.textContent = "Load Rota"; b.style.background = ""; }, 2000);
    }
}
weekInput.onchange = loadWeek;

// Saves the current on-screen selections back to Google Sheets.
async function save() {
    document.querySelectorAll("select").forEach(s => {
        rota[s.dataset.key] = s.value;
    });

    document.querySelectorAll('input[type="checkbox"][data-key]').forEach(c => {
        rota[c.dataset.key] = c.checked;
    });

    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ week: weekInput.value, data: rota })
        });
    } catch (e) {
        console.log(e);
    }
    render();

    const b = document.getElementById("saveBtn");
    if (b) {
        b.textContent = "✔ Saved";
        b.style.background = "#4CAF50";
        setTimeout(() => { b.textContent = "Save Rota"; b.style.background = ""; }, 2000);
    }
}

// "From Home" checkboxes save immediately on change, unlike dropdowns
// which are only persisted when the Save button is pressed.
function saveCheckbox(cb) {
    rota[cb.dataset.key] = cb.checked;
    save();
}

// Clears every allocation for the selected week, after confirmation.
async function clearWeek() {
    if (confirm("Clear all allocations for this week?")) {
        rota = {};
        render();
        await save();
    }
}

// Updates in-memory rota state when a dropdown changes and re-renders,
// so the "already used today" greying-out in makeSelect() stays current.
function handleChange(sel) {
    rota[sel.dataset.key] = sel.value;
    render();
}
