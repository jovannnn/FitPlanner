function prikaziRaspored() {
    const mreza = document.getElementById("denoviMreza");

    mreza.innerHTML = listaDenovi.map((den, indeks) => {
        const vezbi = vezbiZaDen(den);
        const sodrzina = vezbi.length
            ? vezbi.map(vezba => `
                <div class="vezba-red">
                    <div class="vezba-podatoci">
                        <span class="vezba-ime">${bezbedenTekst(vezba.ime)}</span>
                        <span class="vezba-meta">${Number(vezba.vreme)} мин. · ${bezbedenTekst(vezba.serii || "-")} серии · ${bezbedenTekst(vezba.povtoruvanja || "-")} повторувања</span>
                    </div>
                    <div class="vezba-akcii">
                        <button class="malo-kopce" type="button" data-akcija="uredi" data-id="${vezba.id}" aria-label="Уреди вежба">✎</button>
                        <button class="malo-kopce izbrisi" type="button" data-akcija="izbrisi" data-id="${vezba.id}" aria-label="Избриши вежба">×</button>
                    </div>
                </div>
            `).join("")
            : `<div class="prazno-den">Нема додадени вежби.<br>Додај активност за овој ден.</div>`;

        return `
            <article class="den-karticka">
                <div class="den-zaglavie">
                    <span class="den-ime">${String(indeks + 1).padStart(2, "0")} · ${den}</span>
                    <span class="den-vreme">${vremeZaDen(den)} мин.</span>
                </div>
                <div class="den-sodrzina">${sodrzina}</div>
                <div class="den-dno">
                    <span>${vezbi.length} ${vezbi.length === 1 ? "вежба" : "вежби"}</span>
                    <strong>Вкупно: ${vremeZaDen(den)} мин.</strong>
                </div>
            </article>
        `;
    }).join("");

    /* По секое прикажување повторно се ажурираат статистиките */
    prikaziStatistika();
}

/* Ажурирање на трите картички од статистиката */
function prikaziStatistika() {
    document.getElementById("brojDenovi").textContent = brojAktivniDenovi();
    document.getElementById("vkupnoVreme").innerHTML = `${vkupnoNedelnoVreme()} <small>мин.</small>`;
    document.getElementById("brojVezbi").textContent = tekovenPlan.vezbi.length;
}

/* Пополнување на паѓачки менија */
function popolniIzbori() {
    document.getElementById("denVezba").innerHTML = listaDenovi
        .map(den => `<option value="${den}">${den}</option>`).join("");

    const grupirani = {};
    bibliotekaVezbi.forEach(vezba => {
        if (!grupirani[vezba.kategorija]) grupirani[vezba.kategorija] = [];
        grupirani[vezba.kategorija].push(vezba);
    });

    document.getElementById("imeVezba").innerHTML = `<option value="">Избери вежба...</option>` + Object.entries(grupirani).map(([kategorija, vezbi]) => `
        <optgroup label="${bezbedenTekst(kategorija)}">
            ${vezbi.map(vezba => `<option value="${bezbedenTekst(vezba.ime)}">${bezbedenTekst(vezba.ime)}</option>`).join("")}
        </optgroup>
    `).join("") + `<option value="__sopstvena__">＋ Не ја пронајдов вежбата – внеси своја</option>`;
}

/* Прикажување на дополнителни полиња за рачно внесена вежба */
function prikaziPolinjaZaSopstvenaVezba(prikazi) {
    const polinja = document.getElementById("sopstvenaVezbaPolinja");
    polinja.hidden = !prikazi;
    document.getElementById("sopstvenoImeVezba").required = prikazi;
}

/* Се отвора прозорец за нова вежба */
function otvoriModal(den = "Понеделник", id = null) {
    const forma = document.getElementById("formaVezba");
    forma.reset();
    document.getElementById("urediVezbaId").value = "";
    prikaziPolinjaZaSopstvenaVezba(false);
    document.getElementById("modalNaslov").textContent = id ? "Уреди вежба" : "Додај вежба";
    document.getElementById("denVezba").value = den;

    if (id) {
        const vezba = tekovenPlan.vezbi.find(stavka => stavka.id === id);
        if (vezba) {
            document.getElementById("urediVezbaId").value = vezba.id;
            document.getElementById("denVezba").value = vezba.den;
            const postoiVoBiblioteka = bibliotekaVezbi.some(stavka => stavka.ime === vezba.ime);
            if (postoiVoBiblioteka) {
                document.getElementById("imeVezba").value = vezba.ime;
            } else {
                document.getElementById("imeVezba").value = "__sopstvena__";
                prikaziPolinjaZaSopstvenaVezba(true);
                document.getElementById("sopstvenoImeVezba").value = vezba.ime;
                document.getElementById("sopstvenaKategorija").value = vezba.kategorija || "Друго";
            }
            document.getElementById("vremeVezba").value = vezba.vreme;
            document.getElementById("seriiVezba").value = vezba.serii;
            document.getElementById("povtoruvanjaVezba").value = vezba.povtoruvanja || "";
            document.getElementById("pauzaVezba").value = vezba.pauza || 0;
            document.getElementById("zabeleskaVezba").value = vezba.zabeleska || "";
        }
    }

    document.getElementById("pozadinaModal").classList.add("otvorena");
    document.getElementById("pozadinaModal").setAttribute("aria-hidden", "false");
}

/* Затворање на прозорецот */
function zatvoriModal() {
    document.getElementById("pozadinaModal").classList.remove("otvorena");
    document.getElementById("pozadinaModal").setAttribute("aria-hidden", "true");
}

/* Превземање на податоците од вежбата */
function obrabotiFormaVezba(nastan) {
    nastan.preventDefault();

    const eSopstvena = document.getElementById("imeVezba").value === "__sopstvena__";
    const ime = eSopstvena
        ? document.getElementById("sopstvenoImeVezba").value.trim()
        : document.getElementById("imeVezba").value;
    const kategorija = eSopstvena
        ? document.getElementById("sopstvenaKategorija").value
        : (bibliotekaVezbi.find(stavka => stavka.ime === ime)?.kategorija || "Друго");

    const podatoci = {
        id: document.getElementById("urediVezbaId").value || null,
        den: document.getElementById("denVezba").value,
        ime,
        kategorija,
        vreme: Number(document.getElementById("vremeVezba").value),
        serii: Number(document.getElementById("seriiVezba").value || 0),
        povtoruvanja: document.getElementById("povtoruvanjaVezba").value.trim(),
        pauza: Number(document.getElementById("pauzaVezba").value || 0),
        zabeleska: document.getElementById("zabeleskaVezba").value.trim()
    };

    if (!podatoci.ime || podatoci.ime === "__sopstvena__" || !podatoci.den || !Number.isFinite(podatoci.vreme) || podatoci.vreme < 1) {
        prikaziPoraka("Провери ги задолжителните полиња.");
        return;
    }

    dodadiIliUrediVezba(podatoci);
    zatvoriModal();
    prikaziRaspored();
    zacuvajPlan();
}

/* Поставување на настани */
function postaviNastani() {
    document.getElementById("kopceDodadiVezba").addEventListener("click", () => otvoriModal());
    document.getElementById("kopceNovPlan").addEventListener("click", () => {
        const potvrda = confirm("Дали сакаш да започнеш нов план? Тековниот план ќе биде избришан од прелистувачот.");
        if (!potvrda) return;
        tekovenPlan = { korisnik: "", naslov: "Мој неделен тренинг", cel: "Подобрување на кондицијата", nivo: "Почетник", datum: "", zabeleski: "", vezbi: [] };
        localStorage.removeItem(klucZaZacuvuvanje);
        postaviPodatociVoForma();
        prikaziRaspored();
        prikaziPoraka("Започна нов тренинг план.");
    });

    document.getElementById("imeVezba").addEventListener("change", nastan => {
        prikaziPolinjaZaSopstvenaVezba(nastan.target.value === "__sopstvena__");
    });
    document.getElementById("kopceZatvoriModal").addEventListener("click", zatvoriModal);
    document.getElementById("kopceOtkaziModal").addEventListener("click", zatvoriModal);
    document.getElementById("formaVezba").addEventListener("submit", obrabotiFormaVezba);
    document.getElementById("kopceZacuvaj").addEventListener("click", () => {
        vcitajPodatociOdForma();
        zacuvajPlan();
    });
    document.getElementById("kopcePdf").addEventListener("click", generirajPdf);

    /* Настаните се во динамички стил и приказ */
    document.getElementById("denoviMreza").addEventListener("click", nastan => {
        const kopce = nastan.target.closest("button[data-akcija]");
        if (!kopce) return;

        const id = kopce.dataset.id;
        if (kopce.dataset.akcija === "uredi") {
            otvoriModal(null, id);
        } else if (kopce.dataset.akcija === "izbrisi") {
            if (confirm("Дали си сигурен дека сакаш да ја избришеш оваа вежба?")) {
                izbrisiVezba(id);
                prikaziRaspored();
                zacuvajPlan();
            }
        }
    });

    /* Промените се зачувуваат автоматски */
    ["imeKorisnik", "naslovPlan", "celTrening", "nivoTrening", "datumPocetok", "zabeleskiPlan"].forEach(id => {
        document.getElementById(id).addEventListener("change", () => {
            vcitajPodatociOdForma();
            zacuvajPlan();
        });
    });

    /* Затворање на модалниот прозорец */
    document.getElementById("pozadinaModal").addEventListener("click", nastan => {
        if (nastan.target.id === "pozadinaModal") zatvoriModal();
    });
    document.addEventListener("keydown", nastan => {
        if (nastan.key === "Escape") zatvoriModal();
    });
}

/* Функција која што се извршува кога html документот ќе биде подготвен */
function startuvajAplikacija() {
    vcitajPlan();
    popolniIzbori();
    postaviPodatociVoForma();
    prikaziRaspored();
    postaviNastani();
}

/* Стартување на апликацијата по вчитување на html */
document.addEventListener("DOMContentLoaded", startuvajAplikacija);
