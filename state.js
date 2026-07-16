/**
 * state.js
 * --------
 * Shared state for the currently-viewed week, plus small date helpers.
 * `rota` and `weekInput` are used across render.js, data.js, print-preview.js
 * and viewer-publish.js, so they live here in one place.
 */

// Returns the ISO date (YYYY-MM-DD) of the Monday of the current week
function mondayOfCurrentWeek() {
    let d = new Date();
    let day = (d.getDay() + 6) % 7; // 0 = Monday, ... 6 = Sunday
    d.setDate(d.getDate() - day);
    return d.toISOString().split('T')[0];
}

// Ordinal suffix for a day-of-month number, e.g. 1 -> "1st", 22 -> "22nd"
function suffix(n) {
    if (n % 100 >= 11 && n % 100 <= 13) return n + "th";
    switch (n % 10) {
        case 1: return n + "st";
        case 2: return n + "nd";
        case 3: return n + "rd";
        default: return n + "th";
    }
}

// The "Week Commencing" date picker
const weekInput = document.getElementById("weekDate");

// Default to whatever was last selected, otherwise this week's Monday
weekInput.value = localStorage.getItem("selectedMonday") || mondayOfCurrentWeek();

// In-memory copy of the currently loaded week's allocations.
// Keyed as "<Day>_<field>", e.g. "Monday_t1_odp1".
let rota = {};

// Builds the localStorage key for a given week (currently unused by the
// app - allocations are stored remotely via Google Sheets - but kept in
// case local caching is wanted later).
function storageKey() {
    return "rota_" + weekInput.value;
}
