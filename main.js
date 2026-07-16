/**
 * main.js
 * -------
 * Entry point. Loaded last, after config/state/render/data/print/viewer,
 * so every function it needs already exists. Triggers the initial load
 * of whichever week is selected (or the current week, by default).
 */

loadWeek();
