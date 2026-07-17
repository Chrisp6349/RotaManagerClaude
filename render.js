/**
 * render.js
 * ---------
 * Builds the weekday and weekend allocation tables from the `rota` object
 * and writes them into the page. Called after every load/change/save so
 * the on-screen tables always reflect the current `rota` state.
 */

// Returns the ODPs and anaesthetists already allocated elsewhere on the
// given day, so makeSelect() can grey out duplicate selections.
function used(day) {
    let o = [], a = [];
    Object.entries(rota).forEach(([k, v]) => {
        if (!k.startsWith(day + "_") || !v || k.includes("oncall") || k.includes("_list")) return;
        k.includes("_anaes") ? a.push(v) : o.push(v);
    });
    return { o, a };
}

// Builds a single <select> dropdown for one allocation field.
// `restricted` (default true) hides names already used elsewhere that day,
// so the same person can't accidentally be double-booked.
function makeSelect(day, field, list, type, restricted = true) {
    let key = day + "_" + field,
        current = rota[key] || "",
        u = used(day);
    let h = `<select data-key="${key}" onchange="handleChange(this)"><option value=""></option>`;
    list.forEach(n => {
        let hide = false;
        if (restricted) {
            if (type == "odp") hide = u.o.includes(n) && n !== current;
            if (type == "anaes") hide = u.a.includes(n) && n !== current;
        }
        if (!hide) h += `<option ${current === n ? "selected" : ""}>${n}</option>`;
    });
    return h + "</select>";
}

// Label for a day column header, e.g. "Monday 6th" - includes a bank
// holiday marker where applicable. `i` is the offset from the selected
// Monday (0 = Monday ... 6 = Sunday).
function dayLabel(i) {
    let d = new Date(weekInput.value);
    d.setDate(d.getDate() + i);
    let ds = d.toISOString().split("T")[0];
    let txt = `${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i]} ${suffix(d.getDate())}`;
    if (bankHolidays[ds]) txt += `<br><span style="color:red;font-weight:bold">BANK HOLIDAY</span>`;
    return txt;
}

// Builds the four dropdowns for one theatre on one weekday:
// two ODPs, one anaesthetist, one list-type.
function theatreCell(day, p) {
    return makeSelect(day, p + "_odp1", odps, "odp")
        + makeSelect(day, p + "_odp2", odps, "odp")
        + makeSelect(day, p + "_anaes", anaes, "anaes")
        + makeSelect(day, p + "_list", listOptions, "list", false);
}

// Rebuilds both the weekday and weekend tables from the current `rota`
// state and writes them into the page.
// True when the date `i` days after the selected Monday is today - used to
// highlight the current day's row so it's found at a glance.
function isToday(i) {
    let d = new Date(weekInput.value);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
}

function render() {
    let h = `<table><tr><th>Day</th><th class="theatre-col">Theatre 1</th><th class="theatre-col">Theatre 2</th><th class="theatre-col">Theatre 4</th><th class="theatre-col">Theatre 5</th><th class="theatre-col">Cath Lab</th><th class="support-col">Support</th><th class="oncall-col">On Call</th></tr>`;

    weekdays.forEach((d, i) => h += `<tr${isToday(i) ? " class='today'" : ""}><td class='daycell'>${dayLabel(i)}</td><td>${theatreCell(d, "t1")}</td><td>${theatreCell(d, "t2")}</td><td>${theatreCell(d, "t4")}</td><td>${theatreCell(d, "t5")}</td><td>${theatreCell(d, "cath")}</td><td>
        ${makeSelect(d, "support1", odps, "odp")}
        ${makeSelect(d, "support2", odps, "odp")}
        ${makeSelect(d, "support3", odps, "odp")}
        <br>
        ${makeSelect(d, "support_list", listOptions, "list", false)}
    </td><td>${makeSelect(d, "oncall_odp", odps, "odp", false)}${makeSelect(d, "oncall_extra", extraOC, "list", false)}<label style="display:block;font-size:11px;margin:3px 0;"><input type="checkbox" data-key="${d}_fromhome" onchange="saveCheckbox(this)"> From Home</label>${makeSelect(d, "oncall_anaes", anaes, "anaes", false)}</td></tr>`);

    document.getElementById("weekdayRota").innerHTML = h + "</table>";

    // Checkboxes aren't controlled via the data-key selected attribute like
    // <select> options are, so their checked state is applied here.
    document.querySelectorAll('input[type="checkbox"][data-key]').forEach(c => c.checked = !!rota[c.dataset.key]);

    let w = `<table class="weekend-table"><tr><th class="weekend-day">Day</th><th class="weekend-col">On Call ODP</th><th class="weekend-col">On Call Anaesthetist</th><th class="weekend-col">Waiting List</th></tr>`;
    weekends.forEach((d, i) => w += `<tr${isToday(i + 5) ? " class='today'" : ""}><td class='daycell'>${dayLabel(i + 5)}</td><td>${makeSelect(d, "oncall_odp1", odps, "odp", false)}${makeSelect(d, "oncall_session1", ["ALL DAY", "AM", "PM"], "list", false)}<br>${makeSelect(d, "oncall_odp2", odps, "odp", false)}${makeSelect(d, "oncall_session2", ["ALL DAY", "AM", "PM"], "list", false)}</td><td>${makeSelect(d, "oncall_anaes", anaes, "anaes", false)}</td><td>${makeSelect(d, "wl_odp", odps, "odp", false)}${makeSelect(d, "wl_anaes", anaes, "anaes", false)}</td></tr>`);

    document.getElementById("weekendRota").innerHTML = w + "</table>";
}
