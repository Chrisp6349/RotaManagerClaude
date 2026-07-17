/**
 * data.js
 * -------
 * Reads and writes rota data to/from the Google Sheets backend (via the
 * Apps Script Web App at API_URL), plus the safety and feedback layer:
 * unsaved-changes tracking, loading state, and save/publish messaging.
 */

// ---------------------------------------------------------------------------
// Unsaved-changes tracking
// ---------------------------------------------------------------------------

// True whenever the on-screen rota differs from what was last loaded/saved.
let dirty = false;

// The week whose data is currently on screen - used to snap the date picker
// back if the user cancels a switch away from unsaved changes.
let loadedWeek = null;

function markDirty() {
    dirty = true;
    updateDirtyBadge();
}

function clearDirty() {
    dirty = false;
    updateDirtyBadge();
}

function updateDirtyBadge() {
    const b = document.getElementById("dirtyBadge");
    if (b) b.style.display = dirty ? "inline-flex" : "none";
}

// Warn before the tab is closed or reloaded with unsaved changes.
window.addEventListener("beforeunload", (e) => {
    if (dirty) {
        e.preventDefault();
        e.returnValue = "";
    }
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

// Dims the grids and blocks clicks while a week is being fetched, so stale
// data can't be edited during the load.
function setLoading(on) {
    document.body.classList.toggle("loading-week", on);
}

// ---------------------------------------------------------------------------
// Status line under the toolbar
// ---------------------------------------------------------------------------

function setNotice(html) {
    const n = document.getElementById("noticeBar");
    if (n) n.innerHTML = html;
}

// ---------------------------------------------------------------------------
// Load / save / clear
// ---------------------------------------------------------------------------

// Loads the selected week's rota from Google Sheets and re-renders.
// Remembers the selected week in localStorage so it's pre-filled next visit.
// If there are unsaved changes, asks first - cancelling snaps the date
// picker back to the week that's actually on screen.
async function loadWeek() {
    if (dirty && loadedWeek !== null && weekInput.value !== loadedWeek) {
        if (!confirm("You have UNSAVED changes on the week commencing " + loadedWeek + ".\n\nSwitching weeks will discard them.\n\nDiscard changes and switch?")) {
            weekInput.value = loadedWeek;
            return;
        }
    }

    localStorage.setItem("selectedMonday", weekInput.value);
    setLoading(true);
    try {
        const r = await fetch(API_URL + "?week=" + weekInput.value);
        rota = await r.json();
    } catch (e) {
        console.log(e);
        rota = {};
    }
    setLoading(false);
    loadedWeek = weekInput.value;
    clearDirty();
    render();
    setNotice("&#9432; Changes are stored when you press <b>Save Rota</b> &mdash; publishing updates the viewer separately.");

    const b = document.getElementById("loadBtn");
    if (b) {
        b.textContent = "✔ Loaded";
        b.style.background = "#4CAF50";
        setTimeout(() => { b.textContent = "Load Rota"; b.style.background = ""; }, 2000);
    }
}
weekInput.onchange = loadWeek;

// Saves the current on-screen selections back to Google Sheets.
// Rebuilds the week's data purely from what is on screen, rather than
// layering on top of whatever was loaded - this stops "ghost" entries
// (keys from older versions of the app, e.g. "Monday_support") being
// carried forward forever and wrongly hiding names from the dropdowns.
async function save() {
    const fresh = {};

    document.querySelectorAll("select").forEach(s => {
        fresh[s.dataset.key] = s.value;
    });

    document.querySelectorAll('input[type="checkbox"][data-key]').forEach(c => {
        fresh[c.dataset.key] = c.checked;
    });

    rota = fresh;

    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ week: weekInput.value, data: rota })
        });
    } catch (e) {
        console.log(e);
    }
    clearDirty();
    render();
    setNotice("&#10003; Saved &mdash; the live viewer is <b>not</b> updated until you press <b>Publish to Viewer</b>.");

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

// Clears every allocation for the selected week. Requires typing CLEAR,
// so it cannot be triggered by an accidental click-through.
async function clearWeek() {
    const answer = prompt("⚠️ This will erase ALL allocations for the week commencing " + weekInput.value + " and cannot be undone.\n\nType CLEAR to confirm:");
    if (answer && answer.trim().toUpperCase() === "CLEAR") {
        rota = {};
        render();
        await save();
    }
}

// Updates in-memory rota state when a dropdown changes and re-renders,
// so the "already used today" greying-out in makeSelect() stays current.
function handleChange(sel) {
    rota[sel.dataset.key] = sel.value;
    markDirty();
    render();
}
