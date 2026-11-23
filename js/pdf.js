function formatirajDatum(datum) {
    if (!datum) return "Не е внесен";
    const delovi = datum.split("-");
    return delovi.length === 3 ? `${delovi[2]}.${delovi[1]}.${delovi[0]}` : datum;
}

function podgotviPdfObrazec() {
    const ime = bezbedenTekst(tekovenPlan.korisnik || "Не е внесено");
    const naslov = bezbedenTekst(tekovenPlan.naslov || "Мој неделен тренинг");
    let html = `
      <header class="glava"><div class="logo">FITPLANNER · ТРЕНИНГ ПЛАН</div>
        <h1>${naslov}</h1><p>Персонализиран неделен распоред за тренинг</p></header>
      <section class="info">
        <div><small>Корисник</small><strong>${ime}</strong></div>
        <div><small>Датум на почеток</small><strong>${formatirajDatum(tekovenPlan.datum)}</strong></div>
        <div><small>Цел</small><strong>${bezbedenTekst(tekovenPlan.cel)}</strong></div>
        <div><small>Ниво</small><strong>${bezbedenTekst(tekovenPlan.nivo)}</strong></div>
      </section>`;

    listaDenovi.forEach(den => {
        const vezbi = vezbiZaDen(den);
        html += `<section class="den"><h2>${den} · ${vremeZaDen(den)} минути</h2>`;
        if (!vezbi.length) {
            html += `<p class="prazno">Нема планирани активности за овој ден.</p>`;
        } else {
            html += `<table><thead><tr><th>Вежба</th><th>Време</th><th>Серии</th><th>Повторувања</th><th>Пауза</th><th>Забелешка</th></tr></thead><tbody>`;
            vezbi.forEach(v => {
                html += `<tr><td>${bezbedenTekst(v.ime)}</td><td>${Number(v.vreme)||0} мин.</td><td>${bezbedenTekst(v.serii||"-")}</td><td>${bezbedenTekst(v.povtoruvanja||"-")}</td><td>${Number(v.pauza||0)} сек.</td><td>${bezbedenTekst(v.zabeleska||"-")}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
        html += `</section>`;
    });
    html += `<section class="total"><b>Вкупно тренинг денови:</b> ${brojAktivniDenovi()} &nbsp; | &nbsp; <b>Вкупно вежби:</b> ${tekovenPlan.vezbi.length} &nbsp; | &nbsp; <b>Вкупно време:</b> ${vkupnoNedelnoVreme()} минути</section>`;
    if (tekovenPlan.zabeleski) html += `<section class="note"><b>Забелешки:</b> ${bezbedenTekst(tekovenPlan.zabeleski)}</section>`;
    html += `<footer>Креирано со FitPlanner · Тренирај паметно со твојот фитнес план.</footer>`;
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
        prikaziPoraka("Прво додај барем една вежба во распоредот.");
        return;
    }
    try {
        prikaziPoraka("Документот се подготвува за преглед...");
        const sodrzina = podgotviPdfObrazec();
        tekovenDokumentHtml = `<!doctype html><html lang="mk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${bezbedenTekst(tekovenPlan.naslov || "FitPlanner план")}</title><style>${stilDokument}</style></head><body><main class="strana">${sodrzina}</main></body></html>`;
        if (!sodrzina || !sodrzina.includes("<table>") || !tekovenPlan.vezbi.length) throw new Error("Содржината на документот не е комплетна.");
        if (tekovenDokumentUrl) URL.revokeObjectURL(tekovenDokumentUrl);
        tekovenDokumentUrl = URL.createObjectURL(new Blob([tekovenDokumentHtml], {type:"text/html;charset=utf-8"}));
        document.getElementById("pdfPregledRamka").src = tekovenDokumentUrl;
        const modal = document.getElementById("pdfModal");
        modal.classList.add("otvorena");
        modal.setAttribute("aria-hidden", "false");
        prikaziPoraka("Планот е зачуван. Провери го документот пред печатење или зачувување како PDF.");
    } catch (e) {
        console.error("Грешка при подготовка на документ:", e);
        prikaziPoraka("Не успеавме да го подготвиме документот. Провери ги внесените податоци и обиди се повторно.");
    }
}

function prezemiPregledPdf() {
    if (!tekovenDokumentHtml) {
        prikaziPoraka("Прво подготви го прегледот на документот.");
        return;
    }
    // Отворање на прозорецот со клик.
    const prozorec = window.open("", "_blank");
    if (!prozorec) {
        prikaziPoraka("Прелистувачот го блокираше прозорецот. Обиди се повторно.");
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
