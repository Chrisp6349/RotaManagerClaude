/**
 * viewer-publish.js
 * -----------------
 * Converts the flat `rota` object into a structured payload (grouped by
 * day/theatre) and publishes it to the Google Sheets backend, for
 * whatever read-only "viewer" consumes the published data.
 */

// Transforms the flat rota keys (e.g. "Monday_t1_odp1") into a nested
// object grouped by day, theatre, support, and on-call/waiting-list info.
function buildViewerData() {
    const days = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];
    const theatres = [
        { key: "t1", name: "Theatre 1" },
        { key: "t2", name: "Theatre 2" },
        { key: "t4", name: "Theatre 4" },
        { key: "t5", name: "Theatre 5" },
        { key: "cath", name: "Cath Lab" }
    ];

    const viewer = {
        week: weekInput.value,
        published: new Date().toISOString(),
        days: {}
    };

    days.forEach(day => {
        if (day === "Saturday" || day === "Sunday") {

            viewer.days[day] = {
                weekend: true,

                onCall: {
                    odp1: rota[`${day}_oncall_odp1`] || "",
                    session1: rota[`${day}_oncall_session1`] || "",
                    odp2: rota[`${day}_oncall_odp2`] || "",
                    session2: rota[`${day}_oncall_session2`] || "",
                    anaesthetist: rota[`${day}_oncall_anaes`] || ""
                },

                waitingList: {
                    odp: rota[`${day}_wl_odp`] || "",
                    anaesthetist: rota[`${day}_wl_anaes`] || ""
                }
            };

        } else {

            viewer.days[day] = {
                theatres: [],
                support: {
                    odp1: rota[`${day}_support1`] || "",
                    odp2: rota[`${day}_support2`] || "",
                    odp3: rota[`${day}_support3`] || "",
                    list: rota[`${day}_support_list`] || ""
                },
                onCall: {
                    odp: rota[`${day}_oncall_odp`] || "",
                    extra: rota[`${day}_oncall_extra`] || "",
                    anaesthetist: rota[`${day}_oncall_anaes`] || "",
                    fromHome: !!rota[`${day}_fromhome`]
                }
            };

            theatres.forEach(t => {
                viewer.days[day].theatres.push({
                    theatre: t.name,
                    odp1: rota[`${day}_${t.key}_odp1`] || "",
                    odp2: rota[`${day}_${t.key}_odp2`] || "",
                    anaesthetist: rota[`${day}_${t.key}_anaes`] || "",
                    list: rota[`${day}_${t.key}_list`] || ""
                });
            });
        }
    });

    return viewer;
}

// Sends the current week's data to Google Sheets as the "published"
// viewer version, for read-only consumers to pick up.
async function publishViewer() {
    // Copy every current dropdown into rota
    document.querySelectorAll("select").forEach(s => {
        rota[s.dataset.key] = s.value;
    });

    // Copy all weekend checkboxes if any exist
    document.querySelectorAll("input[type='checkbox']").forEach(c => {
        rota[c.dataset.key] = c.checked;
    });

    const published = buildViewerData();

    console.log(published);

    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "publish",
                data: published
            })
        });

        alert("✅ Viewer Published");

    } catch (err) {
        console.error(err);
        alert("Publish failed");
    }
}
