document.addEventListener('DOMContentLoaded', () => {

    initEmblemSelector();

    if (window.tftData) {
        // Data loaded successfully
    } else {
        console.error('Data loading failed: window.tftData not found.');
        const app = document.getElementById('app');
        if (app) app.innerHTML = '<p style="text-align:center; color: #ff6b6b; padding: 20px;">Data file (data.js) could not be loaded. Please check your internet connection or ensure files are in the correct folder.</p>';
    }
});

/* --- Emblem Selection Logic --- */

const emblemTraits = [
    "Arcanist", "Bilgewater", "Bruiser", "Defender", "Demacia", "Disruptor",
    "Freljord", "Gunslinger", "Invoker", "Ionia", "Ixtal", "Juggernaut",
    "Longshot", "Noxus", "Piltover", "Quickstriker", "Slayer", "Vanquisher",
    "Void", "Warden", "Yordle", "Zaun"
];

let selectedEmblems = [];

// --- Unit Cost Data (Sourced from champion_db.json) ---
const unitCosts = {
    "Aatrox": 5, "Ahri": 3, "Ambessa": 4, "Anivia": 1, "Annie": 5, "Aphelios": 2, "Ashe": 2,
    "Aurelion Sol": 5, "Azir": 5, "Bard": 2, "Baron Nashor": 5, "Bel'Veth": 4, "Blitzcrank": 1,
    "Braum": 4, "Briar": 1, "Brock": 5, "Caitlyn": 1, "Cho'Gath": 2, "Darius": 3, "Diana": 4,
    "Dr. Mundo": 3, "Draven": 3, "Ekko": 2, "Fiddlesticks": 5, "Fizz": 4, "Galio": 5,
    "Gangplank": 3, "Garen": 4, "Graves": 2, "Gwen": 3, "Illaoi": 1, "Jarvan IV": 1, "Jhin": 1,
    "Jinx": 3, "Kai'Sa": 4, "Kalista": 4, "Kennen": 3, "Kindred": 5, "Kobuko & Yuumi": 3,
    "Kog'Maw": 1, "LeBlanc": 3, "Leona": 3, "Lissandra": 4, "Loris": 3, "Lucian & Senna": 5,
    "Lulu": 1, "Lux": 4, "Malzahar": 3, "Mel": 5, "Milio": 3, "Miss Fortune": 4, "Nasus": 4,
    "Nautilus": 3, "Neeko": 2, "Nidalee": 4, "Orianna": 2, "Ornn": 5, "Poppy": 2, "Qiyana": 1,
    "Rek'Sai": 2, "Renekton": 4, "Rift Herald": 4, "Rumble": 1, "Ryze": 5, "Sejuani": 3,
    "Seraphine": 4, "Sett": 5, "Shen": 1, "Shyvana": 5, "Singed": 4, "Sion": 2, "Skarner": 4,
    "Sona": 1, "Swain": 4, "Sylas": 5, "T-Hex": 5, "Tahm Kench": 5, "Taric": 4, "Teemo": 2,
    "Thresh": 5, "Tristana": 2, "Tryndamere": 2, "Twisted Fate": 2, "Vayne": 3, "Veigar": 4,
    "Vi": 2, "Viego": 1, "Volibear": 5, "Warwick": 4, "Wukong": 4, "Xerath": 5, "Xin Zhao": 2,
    "Yasuo": 2, "Yone": 4, "Yorick": 2, "Yunara": 4, "Zaahen": 5, "Ziggs": 5, "Zilean": 5, "Zoe": 3
};

function getUnitCost(name) {
    return unitCosts[name] || 1; // Default to 1 (Gray)
}

function initEmblemSelector() {
    const container = document.getElementById('emblem-container');
    const generateBtn = document.getElementById('generate-btn');
    const countSpan = document.getElementById('selection-count');

    if (!container) return;

    // Clear container
    container.innerHTML = '';

    emblemTraits.forEach(trait => {
        const item = document.createElement('div');
        item.className = 'emblem-item';
        item.dataset.trait = trait;

        // Construct Image URL
        const traitLower = trait.toLowerCase();
        const imageUrl = `https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/traits/spatula/set16/tft16_emblem_${traitLower}.tft_set16.png`;

        item.innerHTML = `
            <img src="${imageUrl}" alt="${trait}" onerror="this.src='https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/traits/spatula/set16/tft16_emblem_unknown.tft_set16.png'">
            <span>${trait}</span>
        `;

        item.addEventListener('click', () => {
            toggleEmblemSelection(trait, item);
        });

        container.appendChild(item);
    });

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (selectedEmblems.length === 3) {
                generateComps(selectedEmblems);
            }
        });
    }
}

function toggleEmblemSelection(trait, element) {
    const index = selectedEmblems.indexOf(trait);
    const generateBtn = document.getElementById('generate-btn');
    const countSpan = document.getElementById('selection-count');

    if (index > -1) {
        // Deselect
        selectedEmblems.splice(index, 1);
        element.classList.remove('selected');
    } else {
        // Select (check limit)
        if (selectedEmblems.length < 3) {
            selectedEmblems.push(trait);
            element.classList.add('selected');
        } else {
            alert("You can select a maximum of 3 emblems.");
            return;
        }
    }

    if (countSpan) countSpan.textContent = selectedEmblems.length;
    if (generateBtn) generateBtn.disabled = selectedEmblems.length !== 3;
}
/* --- UNIT RULES IMPLEMENTATION --- */
function checkUnitRules(unit, currentComp, selectedTraits) {
    // 1. Zaahen: Asla katılamaz.
    if (unit.name === 'Zaahen') return false;

    // Hesaplamalar için geçici trait sayıları (mevcut comp + aday unit)
    const counts = {};

    // Amblemleri ekle
    selectedTraits.forEach(t => counts[t] = (counts[t] || 0) + 1);

    // Mevcut unistleri ekle
    currentComp.forEach(u => u.traits.forEach(t => counts[t] = (counts[t] || 0) + 1));

    // Aday unitin kendisini de sayıma dahil et (kural "including himself" diyor)
    unit.traits.forEach(t => counts[t] = (counts[t] || 0) + 1);

    // Helper: Trait sayısını getir
    const getCount = (trait) => counts[trait] || 0;
    // Helper: Unit var mı?
    const hasUnit = (name) => currentComp.some(u => u.name === name);

    // --- Kurallar ---

    // Yorick, Gwen, Kalista, Thresh: > 3 Shadow Isles (En az 4)
    if (['Yorick', 'Gwen', 'Kalista', 'Thresh'].includes(unit.name)) {
        if (getCount('Shadow Isles') <= 3) return false;
    }

    // Yone: Yasuo olmalı VE en az 5 Ionia
    if (unit.name === 'Yone') {
        if (!hasUnit('Yasuo')) return false;
        if (getCount('Ionia') < 5) return false;
    }

    // Galio: En az 7 Demacia
    if (unit.name === 'Galio') {
        if (getCount('Demacia') < 7) return false;
    }

    // Tahm Kench: En az 3 Bilgewater
    if (unit.name === 'Tahm Kench') {
        if (getCount('Bilgewater') < 3) return false;
    }

    // T-Hex: En az 6 Piltover
    if (unit.name === 'T-Hex') {
        if (getCount('Piltover') < 6) return false;
    }

    // Aurelion Sol: En az 3 Targon
    if (unit.name === 'Aurelion Sol') {
        if (getCount('Targon') < 3) return false;
    }

    // Baron Nashor: En az 7 Void
    if (unit.name === 'Baron Nashor') {
        if (getCount('Void') < 7) return false;
    }

    // Brock: En az 3 Ixtal
    if (unit.name === 'Brock') {
        if (getCount('Ixtal') < 3) return false;
    }

    return true; // Kurala takılmadıysa uygundur
}

function generateComps(selectedTraits) {
    if (!window.tftData) {
        alert("Data not loaded yet, please wait.");
        return;
    }

    const { traits: allTraits, units: allUnits } = window.tftData;
    const resultsContainer = document.getElementById('comp-results');
    if (resultsContainer) resultsContainer.innerHTML = '<p>Calculating...</p>';

    const allGeneratedComps = [];
    const NUM_ITERATIONS = 5;

    for (let i = 0; i < NUM_ITERATIONS; i++) {
        let comp = [];

        // Scope helpers
        const getTraitInfo = (name) => allTraits.find(t => t.name === name);
        const getActiveCounts = (currentComp) => {
            const counts = {};
            selectedTraits.forEach(t => counts[t] = (counts[t] || 0) + 1);
            currentComp.forEach(u => u.traits.forEach(t => counts[t] = (counts[t] || 0) + 1));
            return counts;
        };

        // 1. ADIM
        for (const emblem of selectedTraits) {
            const info = getTraitInfo(emblem);
            if (!info) continue;
            let counts = getActiveCounts(comp);
            let current = counts[emblem] || 0;
            const firstThreshold = info.thresholds[0];

            if (current < firstThreshold) {
                let needed = firstThreshold - current;
                let candidates = allUnits.filter(u =>
                    u.traits.includes(emblem) &&
                    !comp.some(c => c.id === u.id) &&
                    checkUnitRules(u, comp, selectedTraits)
                );

                // Shuffle for variety
                candidates.sort(() => Math.random() - 0.5);
                // Then prioritize slightly
                candidates.sort((a, b) => {
                    const scoreA = a.traits.filter(t => selectedTraits.includes(t)).length + Math.random();
                    const scoreB = b.traits.filter(t => selectedTraits.includes(t)).length + Math.random();
                    return scoreB - scoreA;
                });

                for (let k = 0; k < needed; k++) {
                    if (candidates[k]) comp.push(candidates[k]);
                }
            }
        }

        // 2. ADIM
        while (comp.length < 9) {
            const counts = getActiveCounts(comp);
            let bestUnit = null;
            let maxScore = -Infinity;

            const candidates = allUnits.filter(u =>
                !comp.some(c => c.id === u.id) &&
                checkUnitRules(u, comp, selectedTraits)
            );

            if (candidates.length === 0) break;

            for (const unit of candidates) {
                let score = 0;
                unit.traits.forEach(t => {
                    const info = getTraitInfo(t);
                    if (info) {
                        if (info.units.length === 1) return; // Ignore unique
                        const current = counts[t] || 0;
                        const nextThreshold = info.thresholds.find(th => th > current);
                        if (nextThreshold) {
                            if (current + 1 === nextThreshold) score += 50;
                            else if (current > 0) score += 10;
                            else score += 2;
                        }
                    }
                });
                const emblemSynergy = unit.traits.filter(t => selectedTraits.includes(t)).length;
                score += emblemSynergy * 5;
                score += Math.random() * 5; // Extra randomness

                if (score > maxScore) {
                    maxScore = score;
                    bestUnit = unit;
                }
            }

            // Taric fallback
            if (maxScore < 2) {
                const taric = allUnits.find(u => u.name === 'Taric' && !comp.some(c => c.id === u.id));
                if (taric) bestUnit = taric;
            }

            if (bestUnit) comp.push(bestUnit);
            else break;
        }
        allGeneratedComps.push(comp);
    }

    displayCompResults(allGeneratedComps, selectedTraits);
}

function displayCompResults(comps, selectedTraits) {
    const resultsContainer = document.getElementById('comp-results');
    if (!resultsContainer) return;

    const { traits: allTraits } = window.tftData;
    let finalHtml = '';

    comps.forEach((comp, idx) => {
        const finalCounts = {};
        selectedTraits.forEach(t => finalCounts[t] = (finalCounts[t] || 0) + 1);
        comp.forEach(u => u.traits.forEach(t => finalCounts[t] = (finalCounts[t] || 0) + 1));

        const activeTraitList = Object.keys(finalCounts)
            .map(traitName => {
                const info = allTraits.find(t => t.name === traitName);
                if (!info) return null;
                if (info.units.length === 1) return null; // Unique hidden

                const count = finalCounts[traitName];
                let styleClass = 'trait-inactive';
                if (info.thresholds.some(th => count >= th)) {
                    styleClass = 'trait-active-bronze';
                    const maxTh = info.thresholds[info.thresholds.length - 1];
                    if (count >= maxTh) styleClass = 'trait-active-prismatic';
                    else if (count >= info.thresholds[1]) styleClass = 'trait-active-gold';
                } else {
                    return null;
                }
                return { name: traitName, count, icon: info.icon, styleClass };
            })
            .filter(item => item !== null)
            .sort((a, b) => b.count - a.count);

        const activeTraitsHtml = activeTraitList.map(t => `
            <div class="trait-badge ${t.styleClass}">
                <span class="trait-count">${t.count}</span>
                <span class="trait-text">${t.name}</span>
            </div>
        `).join('');

        finalHtml += `<div class="comp-box" style="margin-bottom: 20px;">`;
        finalHtml += `<div class="active-traits-container">`;
        finalHtml += activeTraitsHtml;
        finalHtml += `</div>`;
        finalHtml += `<div class="comp-grid">`;
        comp.forEach(u => {
            const cost = getUnitCost(u.name);
            finalHtml += `
                <div class="comp-unit-card cost-${cost}">
                    <div class="unit-image-wrapper">
                        <img src="${u.image_url}" alt="${u.name}" onerror="this.src='https://raw.communitydragon.org/latest/game/assets/characters/tft16_aatrox/hud/tft16_aatrox_square.tft_set16.png'">
                    </div>
                    <div class="unit-name">${u.name}</div>
                </div>
            `;
        });
        finalHtml += `</div></div>`;
    });

    resultsContainer.innerHTML = finalHtml;
}
