/* =========================================================
   Логика за креирање и управување со тренинг планот
   ========================================================= */
const klucZaZacuvuvanje = "fitplanner_plan_v1";

/* Почетна состојба на планот со 7 денови во неделата */
let tekovenPlan = {
    korisnik: "",
    naslov: "Мој неделен тренинг",
    cel: "Подобрување на кондицијата",
    nivo: "Почетник",
    datum: "",
    zabeleski: "",
    vezbi: []
};

/* Вчитување на претходно зачуван план од прелистувачот */
function vcitajPlan() {
    try {
        const zacuvanTekst = localStorage.getItem(klucZaZacuvuvanje);
        if (zacuvanTekst) {
            const zacuvanPlan = JSON.parse(zacuvanTekst);
            if (zacuvanPlan && Array.isArray(zacuvanPlan.vezbi)) {
                tekovenPlan = { ...tekovenPlan, ...zacuvanPlan };
            }
        }
    } catch (greska) {
        console.error("Грешка при читање на зачуваниот план:", greska);
    }
}

/* Зачувување на тековниот план во LocalStorage */
function zacuvajPlan() {
    try {
        localStorage.setItem(klucZaZacuvuvanje, JSON.stringify(tekovenPlan));
        prikaziPoraka("Планот е успешно зачуван.");
        return true;
    } catch (greska) {
        console.error("Грешка при зачувување:", greska);
        prikaziPoraka("Планот не може да се зачува во прелистувачот.");
        return false;
    }
}

/* Враќање на сите вежби од конкретниот ден */
function vezbiZaDen(den) {
    return tekovenPlan.vezbi.filter(vezba => vezba.den === den);
}

/* Пресметка на вкупно времетрање на вежби за одреден ден */
function vremeZaDen(den) {
    return vezbiZaDen(den).reduce((zbir, vezba) => zbir + Number(vezba.vreme || 0), 0);
}

/* Пресметка на вкупно време за целата недела */
function vkupnoNedelnoVreme() {
    return tekovenPlan.vezbi.reduce((zbir, vezba) => zbir + Number(vezba.vreme || 0), 0);
}

/* Пресметка на бројот на денови со најмалку една вежба */
function brojAktivniDenovi() {
    return listaDenovi.filter(den => vezbiZaDen(den).length > 0).length;
}

/* Креирање на единствен идентификатор за вежба */
function kreirajId() {
    return "vezba_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

/* Додавање нова или ажурирање на постоечка вежба */
function dodadiIliUrediVezba(podatoci) {
    if (podatoci.id) {
        const indeks = tekovenPlan.vezbi.findIndex(vezba => vezba.id === podatoci.id);
        if (indeks !== -1) {
            tekovenPlan.vezbi[indeks] = { ...tekovenPlan.vezbi[indeks], ...podatoci };
            return;
        }
    }
    tekovenPlan.vezbi.push({ ...podatoci, id: kreirajId() });
}

/* Бришење на вежба според нејзиниот идентификатор */
function izbrisiVezba(id) {
    tekovenPlan.vezbi = tekovenPlan.vezbi.filter(vezba => vezba.id !== id);
}

/* Враќање на податоците од формата */
function vcitajPodatociOdForma() {
    tekovenPlan.korisnik = document.getElementById("imeKorisnik").value.trim();
    tekovenPlan.naslov = document.getElementById("naslovPlan").value.trim() || "Мој неделен тренинг";
    tekovenPlan.cel = document.getElementById("celTrening").value;
    tekovenPlan.nivo = document.getElementById("nivoTrening").value;
    tekovenPlan.datum = document.getElementById("datumPocetok").value;
    tekovenPlan.zabeleski = document.getElementById("zabeleskiPlan").value.trim();
}

/* Прикажување на податоците во формата */
function postaviPodatociVoForma() {
    document.getElementById("imeKorisnik").value = tekovenPlan.korisnik || "";
    document.getElementById("naslovPlan").value = tekovenPlan.naslov || "";
    document.getElementById("celTrening").value = tekovenPlan.cel;
    document.getElementById("nivoTrening").value = tekovenPlan.nivo;
    document.getElementById("datumPocetok").value = tekovenPlan.datum || "";
    document.getElementById("zabeleskiPlan").value = tekovenPlan.zabeleski || "";
}

/* Креирање безбедно прикажување на HTML текст */
function bezbedenTekst(vrednost) {
    return String(vrednost ?? "").replace(/[&<>"']/g, znak => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[znak]);
}

/* Прикажување кратка порака после извршена активност */
function prikaziPoraka(tekst) {
    let poraka = document.getElementById("izvestuvanje");
    if (!poraka) {
        poraka = document.createElement("div");
        poraka.id = "izvestuvanje";
        poraka.className = "izvestuvanje";
        document.body.appendChild(poraka);
        poraka.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:50;padding:13px 17px;border-radius:10px;background:#17283d;color:white;font-size:12px;box-shadow:0 8px 25px #14223533;max-width:calc(100% - 40px);";
    }
    poraka.textContent = tekst;
    poraka.style.display = "block";
    clearTimeout(window.fitPlannerPoraka);
    window.fitPlannerPoraka = setTimeout(() => poraka.style.display = "none", 2800);
}
