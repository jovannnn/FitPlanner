function formatirajDatum(datum) {
    if (!datum) return "Not entered";
    const delovi = datum.split("-");
    return delovi.length === 3 ? `${delovi[2]}.${delovi[1]}.${delovi[0]}` : datum;
}

function podgotviPdfObrazec() {
    const ime = bezbedenTekst(tekovenPlan.korisnik || "Not entered");
    const naslov = bezbedenTekst(tekovenPlan.naslov || "My weekly workout");
    let html = `
      <header class="glava"><div class="logo">FITPLANNER · TRAINING PLAN</div>
        <h1>My weekly workout</h1><p>Personalized weekly training schedule</p></header>
      <section class="info">
        <div><small>User</small><strong>${ime}</strong></div>
        <div><small>Start date</small><strong>${formatirajDatum(tekovenPlan.datum)}</strong></div>
        <div><small>Goal</small><strong>${bezbedenTekst(tekovenPlan.cel)}</strong></div>
        <div><small>Level</small><strong>${bezbedenTekst(tekovenPlan.nivo)}</strong></div>
      </section>`;

    listaDenovi.forEach(den => {
        const vezbi = vezbiZaDen(den);
        html += `<section class="den"><h2>${den} · ${vremeZaDen(den)} minutes</h2>`;
        if (!vezbi.length) {
            html += `<p class="prazno">There are no planned activities for this day.</p>`;
        } else {
            html += `<table><thead><tr><th>Exercise</th><th>Time</th><th>Серии</th><th>Repetitions</th><th>Pause</th><th>Note</th></tr></thead><tbody>`;
            vezbi.forEach(v => {
                html += `<tr><td>${bezbedenTekst(v.ime)}</td><td>${Number(v.vreme)||0} min.</td><td>${bezbedenTekst(v.serii||"-")}</td><td>${bezbedenTekst(v.povtoruvanja||"-")}</td><td>${Number(v.pauza||0)} sec.</td><td>${bezbedenTekst(v.zabeleska||"-")}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
        html += `</section>`;
    });
    html += `<section class="total"><b>Total training days:</b> ${brojAktivniDenovi()} &nbsp; | &nbsp; <b>Total exercise:</b> ${tekovenPlan.vezbi.length} &nbsp; | &nbsp; <b>Total time:</b> ${vkupnoNedelnoVreme()} minutes</section>`;
    if (tekovenPlan.zabeleski) html += `<section class="note"><b>Notes:</b> ${bezbedenTekst(tekovenPlan.zabeleski)}</section>`;
    html += `<footer>Create with FitPlanner · Train smart with your fitness plan.</footer>`;
    return html;
}

const stilDokument = `
  @page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;background:#fff;color:#26364a;font-family:Arial,"Noto Sans",sans-serif;font-size:11px;line-height:1.45}
  .strana{width:100%;max-width:850px;margin:0 auto;padding:28px;background:#fff}.glava{border-bottom:3px solid #84cc16;padding-bottom:16px;margin-bottom:18px}.logo{font-size:11px;font-weight:bold;letter-spacing:1.5px;color:#4d7c0f}.glava h1{font-size:25px;margin:9px 0 4px;color:#142235}.glava p{margin:0;color:#64748b}.info{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:20px}.info div{border:1px solid #dbe3ec;border-radius:7px;padding:9px}.info small{display:block;color:#64748b;margin-bottom:3px}.info strong{font-size:12px}.den{margin:0 0 16px;break-inside:avoid}.den h2{font-size:14px;background:#eef5e5;border-left:4px solid #84cc16;padding:8px 10px;margin:0 0 8px;color:#243449}.prazno{color:#8793a2;font-size:10px}table{width:100%;border-collapse:collapse;font-size:9px}th{background:#243449;color:#fff;text-align:left;padding:7px 5px}td{border:1px solid #dbe3ec;padding:6px 5px;vertical-align:top;overflow-wrap:anywhere}tr{break-inside:avoid}.total,.note{border:1px solid #dbe3ec;border-radius:7px;padding:11px;margin-top:13px}.total{background:#f4f8ee}.note{background:#f8fafc}footer{margin-top:22px;padding-top:10px;border-top:1px solid #dbe3ec;text-align:center;color:#718096;font-size:9px}
  @media screen{body{background:#e9edf2}.strana{min-height:100vh;box-shadow:0 2px 12px #0002}}
  @media print{body{background:#fff}.strana{max-width:none;padding:0;box-shadow:none}}
`;
let tekovenDokumentHtml = "";
let tekovenDokumentUrl = null;

function zatvoriPdfPregled() {
    document.getElementById("pdfModal").classList.remove("otvorena");
    document.getElementById("pdfModal").setAttribute("aria-hidden", "true");
}

async function generirajPdf() {
    vcitajPodatociOdForma();
    zacuvajPlan();
    if (!tekovenPlan.vezbi || tekovenPlan.vezbi.length === 0) {
        prikaziPoraka("First add an exercise to the schedule.");
        return;
    }
    try {
        prikaziPoraka("The document is being prepared for review...");
        const sodrzina = podgotviPdfObrazec();
        tekovenDokumentHtml = `<!doctype html><html lang="mk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${bezbedenTekst(tekovenPlan.naslov || "FitPlanner план")}</title><style>${stilDokument}</style></head><body><main class="strana">${sodrzina}</main></body></html>`;
        if (!sodrzina || !sodrzina.includes("<table>") || !tekovenPlan.vezbi.length) throw new Error("The content of the document is not complete.");
        if (tekovenDokumentUrl) URL.revokeObjectURL(tekovenDokumentUrl);
        tekovenDokumentUrl = URL.createObjectURL(new Blob([tekovenDokumentHtml], {type:"text/html;charset=utf-8"}));
        document.getElementById("pdfPregledRamka").src = tekovenDokumentUrl;
        const modal = document.getElementById("pdfModal");
        modal.classList.add("otvorena");
        modal.setAttribute("aria-hidden", "false");
        prikaziPoraka("The plan has been saved. Check the document before printing or saving it as a PDF.");
    } catch (e) {
        console.error("Error while preparing document:", e);
        prikaziPoraka("We were unable to create the document. Check the entered data and try again.");
    }
}

function prezemiPregledPdf() {
    if (!tekovenDokumentHtml) {
        prikaziPoraka("First prepared the review of the document.");
        return;
    }
    // Отворање на прозорецот со клик.
    const prozorec = window.open("", "_blank");
    if (!prozorec) {
        prikaziPoraka("The browser blocked the window. Try again.");
        return;
    }
    let pecatenjeStartuvano = false;
    const startuvajPecatenje = () => {
        if (pecatenjeStartuvano) return;
        pecatenjeStartuvano = true;
        prozorec.focus();
        prozorec.print();
    };
    prozorec.addEventListener("load", startuvajPecatenje, {once:true});
    prozorec.document.open();
    prozorec.document.write(tekovenDokumentHtml);
    prozorec.document.close();
    prozorec.setTimeout(startuvajPecatenje, 900);
}

document.addEventListener("DOMContentLoaded", () => {
    ["zatvoriPdfPregled", "zatvoriPdfPregledDno"].forEach(id => document.getElementById(id).addEventListener("click", zatvoriPdfPregled));
    document.getElementById("prezemiPregledPdf").addEventListener("click", prezemiPregledPdf);
    document.getElementById("pdfModal").addEventListener("click", e => { if (e.target.id === "pdfModal") zatvoriPdfPregled(); });
});
