/**
 * config.js
 * ---------
 * All static data for the rota: the list of staff, dropdown options, and
 * the Google Apps Script endpoint the app reads/writes to.
 *
 * Edit staff names, list options, or bank holiday dates here each year -
 * nothing else in the app needs to change.
 */

// Staff who can be allocated as ODP (Operating Department Practitioner)
const odps = [
    "Amelia", "Becky", "Chris", "Darren", "Dave", "Greg",
    "Kristian", "Larry", "Mihaela", "Pierre", "Steve"
];

// Anaesthetists, referred to by their initials
const anaes = [
    "PMR", "CD", "SE", "JA", "ZB", "NM", "LC", "PJ",
    "JH", "SB", "MC", "JC", "CH", "VR", "TG", "TB", "AMINU"
];

// Options shown in the "list type" dropdown for each theatre/support slot
const listOptions = [
    "", "ENT", "NO LIST", "NO SODP", "AM LIST", "PM LIST",
    "BANK HOLIDAY", "THEATRE MAINTENANCE", "CARDIAC", "THORACIC",
    "TAVI", "CME MORNING", "AWAY DAY", "EPIC TRAINING", "THORACIC CT3"
];

// Options for the weekday on-call "extra" dropdown
const extraOC = ["", "EXTRA O/C"];

// Day groupings used to build the weekday/weekend tables
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const weekends = ["Saturday", "Sunday"];

// Known bank holidays - shown in red on the relevant day label.
// Update this each year.
const bankHolidays = {
    "2026-01-01": "BANK HOLIDAY",
    "2026-04-03": "BANK HOLIDAY",
    "2026-04-06": "BANK HOLIDAY",
    "2026-05-04": "BANK HOLIDAY",
    "2026-05-25": "BANK HOLIDAY",
    "2026-08-31": "BANK HOLIDAY",
    "2026-12-25": "BANK HOLIDAY",
    "2026-12-28": "BANK HOLIDAY"
};

// Google Apps Script Web App endpoint that stores/serves rota data in
// a Google Sheet. Used for loading, saving, and publishing the viewer.
const API_URL = "https://script.google.com/macros/s/AKfycbwibS_YU3P7Gf0dnbZJH7gE1_FjjfCIt_jsJ05HcZ8QzQVJjb2fhQOIb8VIoaS2GgTa/exec";
