import { useState, useRef, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "nourriture", label: "Nourriture", emoji: "🍚" },
  { id: "transport", label: "Transport", emoji: "🚕" },
  { id: "loyer", label: "Loyer", emoji: "🏠" },
  { id: "cie", label: "CIE", emoji: "💡" },
  { id: "sodeci", label: "SODECI", emoji: "💧" },
  { id: "credit", label: "Crédit tel.", emoji: "📱" },
  { id: "sorties", label: "Sorties", emoji: "🎉" },
  { id: "famille", label: "Famille", emoji: "👨‍👩‍👧" },
  { id: "divers", label: "Divers", emoji: "🙏" },
];

const INCOME_SOURCES = [
  { id: "salaire_extra", label: "Salaire extra", emoji: "💼" },
  { id: "vente",        label: "Vente",          emoji: "🛒" },
  { id: "mobile_money", label: "Mobile Money",   emoji: "📲" },
  { id: "transfert",    label: "Transfert reçu", emoji: "💸" },
  { id: "remboursement",label: "Remboursement",  emoji: "🔄" },
  { id: "autre_entree", label: "Autre",          emoji: "✨" },
];

const MESSAGES = {
  safe: [
    "Tu gères bien ton djai ! 💪",
    "Chef(fe), tu es sérieux avec ça 🎯",
    "Budget sous contrôle, on valide ! ✅",
  ],
  warning: [
    "Chef(fe)... doucement 😅",
    "Hum hum... tu commences à forcer là 👀",
    "Attention hein, on n'est pas encore fin du mois 😬",
  ],
  danger: [
    "Fin du mois va être cardio... 🔴",
    "Mon ami(e), il faut reposer la main là 😭",
    "Dieu seul sait comment tu vas finir ce mois 😂",
  ],
};

function formatFCFA(amount) {
  if (!amount && amount !== 0) return "–";
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
}

function getStatusInfo(pct) {
  if (pct >= 95) return { color: "#ef4444", bg: "#fef2f2", level: "danger", badge: "🚨 Budget en danger" };
  if (pct >= 80) return { color: "#f97316", bg: "#fff7ed", level: "warning", badge: "⚠️ Attention" };
  return { color: "#22c55e", bg: "#f0fdf4", level: "safe", badge: "💪 Mois maîtrisé" };
}

function getRandMessage(level) {
  const arr = MESSAGES[level];
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────

function OnboardingScreen({ onStart }) {
  const [salaire, setSalaire] = useState("");
  const [epargne, setEpargne] = useState("");
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goNext = () => {
    if (!salaire || isNaN(Number(salaire.replace(/[\s\u00a0\u202f]/g, "")))) return;
    setAnimating(true);
    setTimeout(() => { setStep(1); setAnimating(false); }, 300);
  };

  const handleStart = () => {
    const s = Number(salaire.replace(/[\s\u00a0\u202f]/g, ""));
    const e = Number((epargne || "0").replace(/[\s\u00a0\u202f]/g, ""));
    if (!s) return;
    onStart({ salaire: s, epargne: e });
  };

  const handleNumInput = (setter) => (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setter(raw ? new Intl.NumberFormat("fr-FR").format(Number(raw)) : "");
  };

  return (
    <div style={styles.onboarding}>
      <div style={styles.logoWrap}>
        <div style={styles.logoCircle}>💰</div>
        <h1 style={styles.logoTitle}>Fin du Mois</h1>
        <p style={styles.logoSub}>Ton budget en main, toujours.</p>
      </div>

      <div style={{ ...styles.card, opacity: animating ? 0 : 1, transition: "opacity 0.3s" }}>
        {step === 0 ? (
          <>
            <p style={styles.question}>Combien tu gagnes par mois ? 💼</p>
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type="text"
                inputMode="numeric"
                placeholder="ex: 250 000"
                value={salaire}
                onChange={handleNumInput(setSalaire)}
              />
              <span style={styles.inputSuffix}>FCFA</span>
            </div>
            <button
              style={{ ...styles.btn, opacity: salaire ? 1 : 0.5 }}
              onClick={goNext}
              disabled={!salaire}
            >
              Continuer →
            </button>
          </>
        ) : (
          <>
            <p style={styles.question}>Tu veux épargner combien ? 🏦</p>
            <p style={styles.hint}>(Laisse vide si pas d'objectif)</p>
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type="text"
                inputMode="numeric"
                placeholder="ex: 30 000"
                value={epargne}
                onChange={handleNumInput(setEpargne)}
              />
              <span style={styles.inputSuffix}>FCFA</span>
            </div>
            <button style={styles.btn} onClick={handleStart}>
              👉 Voir ma situation
            </button>
            <button style={styles.btnGhost} onClick={() => setStep(0)}>
              ← Retour
            </button>
          </>
        )}
      </div>

      <p style={styles.footer}>Gratuit · Sans inscription · 100% privé</p>
    </div>
  );
}

function AddExpenseSheet({ onAdd, onClose }) {
  const [montant, setMontant] = useState("");
  const [cat, setCat] = useState(null);
  const [libelle, setLibelle] = useState("");
  const [note, setNote] = useState("");
  const [shake, setShake] = useState(false);
  const [shakeLibelle, setShakeLibelle] = useState(false);
  const libelleRef = useRef(null);

  const isDivers = cat?.id === "divers";

  const handleSelectCat = (c) => {
    setCat(c);
    if (c.id === "divers") {
      setTimeout(() => libelleRef.current?.focus(), 120);
    }
  };

  const handleAdd = () => {
    const m = Number(montant.replace(/[\s\u00a0\u202f]/g, ""));
    if (!m || !cat) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (isDivers && !libelle.trim()) {
      setShakeLibelle(true);
      setTimeout(() => setShakeLibelle(false), 500);
      libelleRef.current?.focus();
      return;
    }
    onAdd({ montant: m, categorie: cat, libelle: isDivers ? libelle.trim() : "", note, date: new Date().toISOString() });
    onClose();
  };

  return (
    <div style={styles.sheetOverlay} onClick={onClose}>
      <div style={{ ...styles.sheet, animation: "slideUp 0.35s cubic-bezier(.22,1,.36,1)" }} onClick={e => e.stopPropagation()}>
        <div style={styles.sheetHandle} />
        <h2 style={styles.sheetTitle}>Nouvelle dépense</h2>

        {/* Montant */}
        <div style={{ ...styles.inputWrap, marginBottom: 16 }}>
          <input
            style={{ ...styles.input, fontSize: 28, fontWeight: 800, ...(shake ? { animation: "shake 0.5s" } : {}) }}
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={montant}
            autoFocus
            onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setMontant(raw ? new Intl.NumberFormat("fr-FR").format(Number(raw)) : "");
            }}
          />
          <span style={{ ...styles.inputSuffix, fontSize: 18 }}>FCFA</span>
        </div>

        {/* Catégories */}
        <p style={styles.label}>Catégorie</p>
        <div style={styles.catGrid}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              style={{ ...styles.catBtn, ...(cat?.id === c.id ? styles.catBtnActive : {}) }}
              onClick={() => handleSelectCat(c)}
            >
              <span style={{ fontSize: 22 }}>{c.emoji}</span>
              <span style={styles.catLabel}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Libellé — uniquement pour Divers, obligatoire */}
        {isDivers && (
          <div style={{ marginTop: 14 }}>
            <p style={{ ...styles.label, marginBottom: 6 }}>
              Précise la dépense <span style={{ color: "#ef4444" }}>*</span>
            </p>
            <div style={{ ...styles.inputWrap, borderColor: shakeLibelle ? "#ef4444" : "#e5e7eb", animation: shakeLibelle ? "shake 0.5s" : "none" }}>
              <input
                ref={libelleRef}
                style={{ ...styles.input, fontSize: 15 }}
                type="text"
                placeholder="ex: Cérémonie, Médicaments, Cadeau..."
                value={libelle}
                onChange={e => setLibelle(e.target.value)}
                maxLength={40}
              />
            </div>
            {shakeLibelle && (
              <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Saisis un libellé pour continuer</p>
            )}
          </div>
        )}

        {/* Note optionnelle pour les autres catégories */}
        {!isDivers && (
          <input
            style={{ ...styles.input, marginTop: 12, fontSize: 14, color: "#6b7280" }}
            type="text"
            placeholder="Note (optionnel)..."
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={50}
          />
        )}

        <button style={{ ...styles.btn, marginTop: 16 }} onClick={handleAdd}>
          + Ajouter la dépense
        </button>
      </div>
    </div>
  );
}

function AddIncomeSheet({ onAdd, onClose }) {
  const [montant, setMontant] = useState("");
  const [source, setSource] = useState(null);
  const [libelle, setLibelle] = useState("");
  const [shake, setShake] = useState(false);
  const libelleRef = useRef(null);

  const isAutre = source?.id === "autre_entree";

  const handleSelectSource = (s) => {
    setSource(s);
    if (s.id === "autre_entree") setTimeout(() => libelleRef.current?.focus(), 120);
  };

  const handleAdd = () => {
    const m = Number(montant.replace(/[\s\u00a0\u202f]/g, ""));
    if (!m || !source) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    onAdd({ montant: m, source, libelle: isAutre ? libelle.trim() : "", date: new Date().toISOString() });
    onClose();
  };

  return (
    <div style={styles.sheetOverlay} onClick={onClose}>
      <div style={{ ...styles.sheet, animation: "slideUp 0.35s cubic-bezier(.22,1,.36,1)" }} onClick={e => e.stopPropagation()}>
        <div style={styles.sheetHandle} />
        <h2 style={{ ...styles.sheetTitle, color: "#15803d" }}>💚 Entrée d'argent</h2>

        {/* Montant */}
        <div style={{ ...styles.inputWrap, marginBottom: 16, borderColor: "#16a34a44", background: "#f0fdf4" }}>
          <input
            style={{ ...styles.input, fontSize: 28, fontWeight: 800, ...(shake ? { animation: "shake 0.5s" } : {}) }}
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={montant}
            autoFocus
            onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setMontant(raw ? new Intl.NumberFormat("fr-FR").format(Number(raw)) : "");
            }}
          />
          <span style={{ ...styles.inputSuffix, fontSize: 18 }}>FCFA</span>
        </div>

        {/* Sources */}
        <p style={styles.label}>Source</p>
        <div style={styles.catGrid}>
          {INCOME_SOURCES.map(s => (
            <button
              key={s.id}
              style={{ ...styles.catBtn, ...(source?.id === s.id ? { ...styles.catBtnActive, background: "#f0fdf4", border: "2px solid #16a34a" } : {}) }}
              onClick={() => handleSelectSource(s)}
            >
              <span style={{ fontSize: 22 }}>{s.emoji}</span>
              <span style={styles.catLabel}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Libellé libre pour "Autre" */}
        {isAutre && (
          <div style={{ marginTop: 14 }}>
            <p style={{ ...styles.label, marginBottom: 6 }}>Précise la source</p>
            <div style={styles.inputWrap}>
              <input
                ref={libelleRef}
                style={{ ...styles.input, fontSize: 15 }}
                type="text"
                placeholder="ex: Petit boulot, Loterie..."
                value={libelle}
                onChange={e => setLibelle(e.target.value)}
                maxLength={40}
              />
            </div>
          </div>
        )}

        <button style={{ ...styles.btn, marginTop: 16, background: "linear-gradient(135deg, #16a34a, #15803d)" }} onClick={handleAdd}>
          + Enregistrer l'entrée
        </button>
      </div>
    </div>
  );
}

// ── Messages drôles contextuels ──────────────────────────────────────────────
function getViralMessage(pct, restant, topCat, jour) {
  if (pct >= 100) return { msg: `Budget explosé 💥 Il me reste ${formatFCFA(restant)} FCFA... En mode survie jusqu'à la paie 😭`, emoji: "💀" };
  if (pct >= 95) {
    const msgs = [
      `Je suis à ${pct}% de mon budget et on est le ${jour}... Priez pour moi 🙏`,
      `Fin du mois va être TRÈS sport... ${pct}% déjà parti 😭 Quelqu'un a du riz ?`,
      `Mon compte me regarde comme : "vraiment ?" — ${pct}% dépensé 💀`,
    ];
    return { msg: msgs[Math.floor(Math.random()*msgs.length)], emoji: "😭" };
  }
  if (pct >= 80) {
    const msgs = [
      `Chef... doucement hein 😅 J'ai déjà dépensé ${pct}% de mon budget ce mois-ci`,
      `${topCat ? topCat.emoji + " " + topCat.label + " a mangé le plus dans mon budget ce mois" : "Attention, " + pct + "% du budget est parti"} 👀`,
      `Il me reste ${formatFCFA(restant)} pour finir le mois... Je gère 😬`,
    ];
    return { msg: msgs[Math.floor(Math.random()*msgs.length)], emoji: "😬" };
  }
  if (pct >= 50) {
    const msgs = [
      `${pct}% de mon budget utilisé — je surveille mes dépenses avec Fin du Mois 💰`,
      `À mi-parcours ce mois-ci : ${pct}% dépensé, ${formatFCFA(restant)} restants. On tient ! 💪`,
      `${topCat ? "Ma plus grosse dépense ce mois : " + topCat.emoji + " " + topCat.label : "Budget à " + pct + "%"}. Je maîtrise ! ✅`,
    ];
    return { msg: msgs[Math.floor(Math.random()*msgs.length)], emoji: "😊" };
  }
  const msgs = [
    `Seulement ${pct}% de mon budget dépensé ce mois-ci 💪 Qui fait mieux que moi ?`,
    `Budget maîtrisé ! ${pct}% dépensé, ${formatFCFA(restant)} encore disponibles. Flexer un peu 😎`,
    `Ce mois-ci je suis sérieux avec mon argent 🎯 ${pct}% de budget utilisé seulement`,
  ];
  return { msg: msgs[Math.floor(Math.random()*msgs.length)], emoji: "🏆" };
}

function ShareCard({ salaire, depenses, entrees, epargne, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = depenses.reduce((s, d) => s + d.montant, 0);
  const totalEntrees = entrees.reduce((s, e) => s + e.montant, 0);
  const budget = salaire + totalEntrees;
  const restant = budget - total;
  const pct = Math.min(100, Math.round((total / budget) * 100));
  const status = getStatusInfo(pct);
  const jour = new Date().getDate();

  // Top catégorie
  const byCategory = {};
  depenses.forEach(d => { byCategory[d.categorie.id] = (byCategory[d.categorie.id] || 0) + d.montant; });
  const topCatEntry = Object.entries(byCategory).sort((a,b) => b[1]-a[1])[0];
  const topCat = topCatEntry ? CATEGORIES.find(c => c.id === topCatEntry[0]) : null;

  const { msg, emoji } = getViralMessage(pct, restant, topCat, jour);
  const shareText = `${msg}\n\n👉 Gère ton budget avec Fin du Mois 🇨🇮`;

  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Dynamically load html2canvas if not already loaded
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const canvas = await window.html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const link = document.createElement("a");
      link.download = "fin-du-mois.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch(e) { alert("Erreur lors du téléchargement"); }
    setDownloading(false);
  };

  return (
    <div style={styles.sheetOverlay} onClick={onClose}>
      <div style={{ ...styles.sheet, animation: "slideUp 0.35s cubic-bezier(.22,1,.36,1)" }} onClick={e => e.stopPropagation()}>
        <div style={styles.sheetHandle} />
        <h2 style={styles.sheetTitle}>Partager ma situation 📤</h2>

        {/* Carte visuelle téléchargeable */}
        <div ref={cardRef} style={{
          background: pct >= 95 ? "linear-gradient(135deg, #1a0a0a, #2d0f0f)"
            : pct >= 80 ? "linear-gradient(135deg, #1a1000, #2d1f00)"
            : "linear-gradient(135deg, #0a1a10, #0f2d1a)",
          borderRadius: 20,
          padding: "24px 20px",
          marginBottom: 16,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Fond décoratif */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: status.color + "15" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: status.color + "10" }} />

          {/* Header carte */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, position: "relative" }}>
            <div>
              <p style={{ color: "#ffffff88", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
                Fin du Mois 🇨🇮
              </p>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
            </div>
            <span style={{ fontSize: 32 }}>{emoji}</span>
          </div>

          {/* Pourcentage géant */}
          <p style={{ color: status.color, fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 4, position: "relative", fontFamily: "'Space Grotesk', sans-serif" }}>
            {pct}<span style={{ fontSize: 24 }}>%</span>
          </p>
          <p style={{ color: "#ffffff88", fontSize: 13, marginBottom: 16, position: "relative" }}>
            du budget dépensé ce mois
          </p>

          {/* Barre de progression */}
          <div style={{ background: "#ffffff15", borderRadius: 99, height: 10, marginBottom: 16, overflow: "hidden", position: "relative" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${status.color}99, ${status.color})`, borderRadius: 99 }} />
          </div>

          {/* Stats en 2 colonnes */}
          <div style={{ display: "flex", gap: 12, marginBottom: 14, position: "relative" }}>
            <div style={{ flex: 1, background: "#ffffff0d", borderRadius: 12, padding: "10px 12px" }}>
              <p style={{ color: "#ffffff66", fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Dépensé</p>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{formatFCFA(total)}</p>
            </div>
            <div style={{ flex: 1, background: "#ffffff0d", borderRadius: 12, padding: "10px 12px" }}>
              <p style={{ color: "#ffffff66", fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Restant</p>
              <p style={{ color: restant < 0 ? "#ef4444" : "#22c55e", fontWeight: 800, fontSize: 14 }}>{formatFCFA(restant)}</p>
            </div>
          </div>

          {/* Top catégorie */}
          {topCat && (
            <div style={{ background: "#ffffff0d", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
              <span style={{ fontSize: 18 }}>{topCat.emoji}</span>
              <div>
                <p style={{ color: "#ffffff66", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Plus grosse dépense</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{topCat.label} — {formatFCFA(byCategory[topCat.id])}</p>
              </div>
            </div>
          )}
        </div>

        {/* Message contextuel drôle */}
        <div style={{ background: "#f9fafb", borderRadius: 14, padding: "12px 14px", marginBottom: 16, borderLeft: `3px solid ${status.color}` }}>
          <p style={{ color: "#374151", fontSize: 13, fontStyle: "italic", lineHeight: 1.5 }}>"{msg}"</p>
        </div>

        {/* Boutons */}
        <button style={{ ...styles.btn, background: "#25D366", marginBottom: 8 }} onClick={handleWhatsApp}>
          📲 Partager sur WhatsApp
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...styles.btnGhost, flex: 1 }} onClick={handleCopy}>
            {copied ? "✅ Copié !" : "📋 Copier"}
          </button>
          <button style={{ ...styles.btnGhost, flex: 1 }} onClick={handleDownload} disabled={downloading}>
            {downloading ? "⏳..." : "🖼️ Image PNG"}
          </button>
        </div>
        <button style={{ ...styles.btnGhost, marginTop: 8 }} onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD VIEW (Camembert + Stats) ──────────────────────────────────────
const PIE_COLORS = ["#22c55e","#f97316","#3b82f6","#a855f7","#ec4899","#14b8a6","#f59e0b","#ef4444","#6366f1"];

function DashboardView({ config, depenses, entrees }) {
  const { salaire, epargne } = config;
  const totalEntrees = entrees.reduce((s, e) => s + e.montant, 0);
  const budget = salaire + totalEntrees;
  const total = depenses.reduce((s, d) => s + d.montant, 0);
  const restant = budget - total;
  const pct = Math.min(100, Math.round((total / budget) * 100));
  const status = getStatusInfo(pct);

  // Data par catégorie pour le camembert
  const byCategory = {};
  depenses.forEach(d => {
    byCategory[d.categorie.id] = (byCategory[d.categorie.id] || 0) + d.montant;
  });
  const pieData = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amt]) => {
      const cat = CATEGORIES.find(c => c.id === id);
      return { id, label: cat.label, emoji: cat.emoji, amt, pct: total > 0 ? Math.round((amt / total) * 100) : 0 };
    });

  // Camembert dessiné à la main avec SVG
  const size = 200;
  const cx = size / 2, cy = size / 2, r = 80, innerR = 45;
  let startAngle = -Math.PI / 2;
  const slices = pieData.map((d, i) => {
    const angle = (d.amt / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
    const xi1 = cx + innerR * Math.cos(startAngle), yi1 = cy + innerR * Math.sin(startAngle);
    const xi2 = cx + innerR * Math.cos(endAngle),   yi2 = cy + innerR * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1} Z`;
    const slice = { ...d, path, color: PIE_COLORS[i % PIE_COLORS.length] };
    startAngle = endAngle;
    return slice;
  });

  const [hoveredSlice, setHoveredSlice] = useState(null);

  if (depenses.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>📊</p>
        <p style={{ color: "#9ca3af", fontSize: 15 }}>Ajoute des dépenses pour voir ton analyse</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 120px" }}>

      {/* Résumé chiffres clés */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16, paddingTop: 4 }}>
        {[
          { label: "Budget total", val: formatFCFA(budget), color: "#fff", bg: "#1a1a2e" },
          { label: "Total dépensé", val: formatFCFA(total), color: status.color, bg: "#1a1a2e" },
          { label: "Restant", val: formatFCFA(restant), color: restant < 0 ? "#ef4444" : "#22c55e", bg: "#1a1a2e" },
          { label: "Taux consommé", val: pct + "%", color: status.color, bg: "#1a1a2e" },
        ].map((item, i) => (
          <div key={i} style={{ background: item.bg, borderRadius: 16, padding: "14px 16px" }}>
            <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</p>
            <p style={{ color: item.color, fontWeight: 800, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif" }}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Camembert SVG */}
      <div style={{ background: "#fff", borderRadius: 20, padding: "20px 16px", marginBottom: 16 }}>
        <h3 style={{ ...styles.sectionTitle, paddingTop: 0, marginBottom: 16 }}>Répartition des dépenses</h3>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, position: "relative" }}>
          <svg width={size} height={size} style={{ overflow: "visible" }}>
            {slices.map((s, i) => (
              <path
                key={i}
                d={s.path}
                fill={s.color}
                opacity={hoveredSlice === null || hoveredSlice === i ? 1 : 0.4}
                style={{ cursor: "pointer", transition: "opacity 0.2s", transform: hoveredSlice === i ? "scale(1.04)" : "scale(1)", transformOrigin: `${cx}px ${cy}px` }}
                onMouseEnter={() => setHoveredSlice(i)}
                onMouseLeave={() => setHoveredSlice(null)}
                onTouchStart={() => setHoveredSlice(hoveredSlice === i ? null : i)}
              />
            ))}
            {/* Centre du donut */}
            <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: "#111827", fontFamily: "Nunito" }}>
              {hoveredSlice !== null ? slices[hoveredSlice].emoji : pct + "%"}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 10, fill: "#6b7280", fontFamily: "Nunito" }}>
              {hoveredSlice !== null ? slices[hoveredSlice].label : "dépensé"}
            </text>
            {hoveredSlice !== null && (
              <text x={cx} y={cy + 26} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: slices[hoveredSlice].color, fontFamily: "Nunito" }}>
                {slices[hoveredSlice].pct}%
              </text>
            )}
          </svg>
        </div>

        {/* Légende */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: hoveredSlice === i ? s.color + "15" : "#f9fafb", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={() => setHoveredSlice(i)} onMouseLeave={() => setHoveredSlice(null)}
              onTouchStart={() => setHoveredSlice(hoveredSlice === i ? null : i)}
            >
              <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 16 }}>{s.emoji}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#374151" }}>{s.label}</span>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{s.pct}%</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{formatFCFA(s.amt)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Entrées résumé */}
      {entrees.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 20, padding: "20px 16px", marginBottom: 16 }}>
          <h3 style={{ ...styles.sectionTitle, paddingTop: 0, marginBottom: 12, color: "#15803d" }}>💚 Entrées du mois</h3>
          {(() => {
            const bySource = {};
            entrees.forEach(e => { bySource[e.source.id] = (bySource[e.source.id] || { ...e.source, total: 0 }); bySource[e.source.id].total += e.montant; });
            return Object.values(bySource).sort((a,b) => b.total - a.total).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < Object.values(bySource).length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#374151" }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>+{formatFCFA(s.total)}</span>
              </div>
            ));
          })()}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4, borderTop: "2px solid #f0fdf4" }}>
            <span style={{ fontWeight: 800, color: "#15803d", fontSize: 14 }}>Total entrées</span>
            <span style={{ fontWeight: 800, color: "#16a34a", fontSize: 14 }}>+{formatFCFA(totalEntrees)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ config, depenses, entrees, onAddExpense, onAddEntree, onDeleteExpense, onDeleteEntree, onReset }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [addedIdx, setAddedIdx] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // "home" | "dashboard"

  // ── Export Excel ──────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();
    const mois = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    // Feuille 1 : Dépenses
    const depRows = [["Date", "Catégorie", "Libellé", "Note", "Montant (FCFA)"]];
    depenses.forEach(d => depRows.push([
      new Date(d.date).toLocaleDateString("fr-FR"),
      d.categorie.label,
      d.libelle || "",
      d.note || "",
      d.montant,
    ]));
    depRows.push(["", "", "", "TOTAL", depenses.reduce((s,d) => s + d.montant, 0)]);
    const wsDep = XLSX.utils.aoa_to_sheet(depRows);
    wsDep["!cols"] = [{wch:14},{wch:18},{wch:22},{wch:22},{wch:18}];
    XLSX.utils.book_append_sheet(wb, wsDep, "Dépenses");

    // Feuille 2 : Entrées
    const entRows = [["Date", "Source", "Libellé", "Montant (FCFA)"]];
    entrees.forEach(e => entRows.push([
      new Date(e.date).toLocaleDateString("fr-FR"),
      e.source.label,
      e.libelle || "",
      e.montant,
    ]));
    entRows.push(["", "", "TOTAL", entrees.reduce((s,e) => s + e.montant, 0)]);
    const wsEnt = XLSX.utils.aoa_to_sheet(entRows);
    wsEnt["!cols"] = [{wch:14},{wch:20},{wch:22},{wch:18}];
    XLSX.utils.book_append_sheet(wb, wsEnt, "Entrées");

    // Feuille 3 : Résumé par catégorie
    const byCategory = {};
    depenses.forEach(d => { byCategory[d.categorie.label] = (byCategory[d.categorie.label] || 0) + d.montant; });
    const totalDep = depenses.reduce((s,d) => s + d.montant, 0);
    const resumeRows = [["Catégorie", "Montant (FCFA)", "% du total"]];
    Object.entries(byCategory).sort((a,b) => b[1]-a[1]).forEach(([cat, amt]) => {
      resumeRows.push([cat, amt, totalDep > 0 ? +(amt/totalDep*100).toFixed(1) : 0]);
    });
    resumeRows.push(["TOTAL DÉPENSES", totalDep, 100]);
    resumeRows.push([""]);
    resumeRows.push(["Salaire de base", salaire, ""]);
    resumeRows.push(["Total entrées", entrees.reduce((s,e) => s + e.montant, 0), ""]);
    resumeRows.push(["Budget total", salaire + entrees.reduce((s,e) => s + e.montant, 0), ""]);
    resumeRows.push(["Restant", salaire + entrees.reduce((s,e) => s + e.montant, 0) - totalDep, ""]);
    if (epargne > 0) resumeRows.push(["Objectif épargne", epargne, ""]);
    const wsRes = XLSX.utils.aoa_to_sheet(resumeRows);
    wsRes["!cols"] = [{wch:24},{wch:18},{wch:14}];
    XLSX.utils.book_append_sheet(wb, wsRes, "Résumé");

    XLSX.writeFile(wb, `FinDuMois_${mois}.xlsx`);
  };

  const { salaire, epargne } = config;
  const totalEntrees = entrees.reduce((s, e) => s + e.montant, 0);
  const budget = salaire + totalEntrees;
  const total = depenses.reduce((s, d) => s + d.montant, 0);
  const restant = budget - total;
  const pct = Math.min(100, Math.round((total / budget) * 100));
  const status = getStatusInfo(pct);
  const statusMessage = getRandMessage(status.level);

  const handleAdd = (dep) => {
    onAddExpense(dep);
    setAddedIdx(0);
    setTimeout(() => setAddedIdx(null), 1200);
  };

  // Group depenses by category for mini chart
  const byCategory = {};
  depenses.forEach(d => {
    byCategory[d.categorie.id] = (byCategory[d.categorie.id] || 0) + d.montant;
  });
  const topCats = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, amt]) => ({
      ...CATEGORIES.find(c => c.id === id),
      amt,
      pct: Math.round((amt / total) * 100),
    }));

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.headerSub}>Mon budget</p>
          <h1 style={styles.headerTitle}>Fin du Mois 💰</h1>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button style={{ ...styles.exportBtn }} onClick={handleExportExcel} title="Exporter Excel">📥 Excel</button>
          <button style={styles.resetBtn} onClick={onReset} title="Recommencer">⚙️</button>
        </div>
      </div>

      {/* Onglets */}
      <div style={styles.tabBar}>
        <button style={{ ...styles.tabBtn, ...(activeTab === "home" ? styles.tabBtnActive : {}) }} onClick={() => setActiveTab("home")}>
          🏠 Accueil
        </button>
        <button style={{ ...styles.tabBtn, ...(activeTab === "dashboard" ? styles.tabBtnActive : {}) }} onClick={() => setActiveTab("dashboard")}>
          📊 Dashboard
        </button>
      </div>

      {activeTab === "dashboard" ? (
        <DashboardView config={config} depenses={depenses} entrees={entrees} />
      ) : (<>
      {/* Status card */}
      <div style={{ ...styles.statusCard, background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)` }}>
        <div style={styles.statusBadge}>
          <span style={{ ...styles.badge, background: status.color + "22", color: status.color }}>
            {status.badge}
          </span>
        </div>
        <p style={styles.statusMessage}>{statusMessage}</p>

        {/* Progress ring area */}
        <div style={styles.progressWrap}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: `${pct}%`, background: status.color }} />
          </div>
          <div style={styles.progressLabels}>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>0</span>
            <span style={{ color: status.color, fontWeight: 700, fontSize: 14 }}>{pct}%</span>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>100</span>
          </div>
        </div>

        {/* 3 stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <p style={styles.statLabel}>Budget</p>
            <p style={styles.statValue}>{formatFCFA(budget)}</p>
          </div>
          <div style={{ ...styles.statItem, borderLeft: "1px solid #ffffff22", borderRight: "1px solid #ffffff22" }}>
            <p style={styles.statLabel}>Dépensé</p>
            <p style={{ ...styles.statValue, color: status.color }}>{formatFCFA(total)}</p>
          </div>
          <div style={styles.statItem}>
            <p style={styles.statLabel}>Restant</p>
            <p style={{ ...styles.statValue, color: restant < 0 ? "#ef4444" : "#22c55e" }}>
              {formatFCFA(restant)}
            </p>
          </div>
        </div>

        {/* Pills salaire + entrées */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <div style={{ ...styles.epargneBar, flex: 1 }}>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>💼 Salaire :</span>
            <span style={{ color: "#86efac", fontWeight: 700, fontSize: 12 }}> {formatFCFA(salaire)}</span>
          </div>
          {totalEntrees > 0 && (
            <div style={{ ...styles.epargneBar, flex: 1 }}>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>💚 Entrées :</span>
              <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 12 }}> +{formatFCFA(totalEntrees)}</span>
            </div>
          )}
        </div>

        {/* Objectif épargne avec barre de progression */}
        {epargne > 0 && (() => {
          const epargneAtteint = Math.min(epargne, Math.max(0, restant));
          const epargnePct = Math.round((epargneAtteint / epargne) * 100);
          const epargneColor = epargnePct >= 100 ? "#60a5fa" : epargnePct >= 50 ? "#f97316" : "#ef4444";
          return (
            <div style={{ marginTop: 14, background: "#ffffff0d", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "#9ca3af", fontSize: 12, fontWeight: 700 }}>🏦 Objectif épargne</span>
                <span style={{ color: epargneColor, fontWeight: 800, fontSize: 13 }}>
                  {formatFCFA(epargne)}
                  {epargnePct >= 100
                    ? " ✅"
                    : <span style={{ color: "#6b7280", fontWeight: 600 }}> ({epargnePct}%)</span>
                  }
                </span>
              </div>
              <div style={{ background: "#ffffff15", borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{
                  width: `${epargnePct}%`,
                  height: "100%",
                  background: epargneColor,
                  borderRadius: 99,
                  transition: "width 0.8s cubic-bezier(.22,1,.36,1)",
                }} />
              </div>
              <p style={{ color: "#6b7280", fontSize: 11, marginTop: 6 }}>
                {epargnePct >= 100
                  ? "Épargne sécurisée ce mois-ci 💪"
                  : `Il te manque encore ${formatFCFA(epargne - epargneAtteint)} pour atteindre ton objectif`
                }
              </p>
            </div>
          );
        })()}
      </div>

      {/* Top categories */}
      {topCats.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Top dépenses</h3>
          <div style={styles.catList}>
            {topCats.map(c => (
              <div key={c.id} style={styles.catRow}>
                <span style={styles.catRowEmoji}>{c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.catRowMeta}>
                    <span style={styles.catRowName}>{c.label}</span>
                    <span style={styles.catRowAmt}>{formatFCFA(c.amt)}</span>
                  </div>
                  <div style={styles.catRowTrack}>
                    <div style={{ ...styles.catRowBar, width: `${c.pct}%`, background: status.color + "cc" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entrées d'argent */}
      {entrees.length > 0 && (
        <div style={styles.section}>
          <h3 style={{ ...styles.sectionTitle, color: "#15803d" }}>💚 Entrées du mois</h3>
          <div style={styles.txList}>
            {[...entrees].reverse().map((e, i) => (
              <div key={i} style={{ ...styles.txItem, borderLeft: "3px solid #22c55e" }}>
                <span style={styles.txEmoji}>{e.source.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ ...styles.txCat, color: "#15803d" }}>
                    {e.source.id === "autre_entree" && e.libelle ? e.libelle : e.source.label}
                  </p>
                  {e.source.id === "autre_entree" && e.libelle && <p style={styles.txNote}>✨ Autre</p>}
                  <p style={styles.txDate}>{new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ ...styles.txAmount, color: "#16a34a" }}>+{formatFCFA(e.montant)}</p>
                  <button style={styles.txDelete} onClick={() => onDeleteEntree(entrees.length - 1 - i)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Dépenses récentes</h3>
        {depenses.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 36 }}>🧾</p>
            <p style={{ color: "#9ca3af", fontSize: 14 }}>Aucune dépense pour l'instant.</p>
            <p style={{ color: "#d1d5db", fontSize: 13 }}>Appuie sur + pour commencer.</p>
          </div>
        ) : (
          <div style={styles.txList}>
            {[...depenses].reverse().map((d, i) => (
              <div
                key={i}
                style={{
                  ...styles.txItem,
                  ...(addedIdx === i && i === 0 ? { animation: "fadeIn 0.5s" } : {}),
                }}
              >
                <span style={styles.txEmoji}>{d.categorie.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={styles.txCat}>
                    {d.categorie.id === "divers" && d.libelle ? d.libelle : d.categorie.label}
                  </p>
                  {d.categorie.id === "divers" && d.libelle && (
                    <p style={styles.txNote}>🙏 Divers</p>
                  )}
                  {d.categorie.id !== "divers" && d.note && <p style={styles.txNote}>{d.note}</p>}
                  <p style={styles.txDate}>{new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ ...styles.txAmount, color: "#ef4444" }}>-{formatFCFA(d.montant)}</p>
                  <button style={styles.txDelete} onClick={() => onDeleteExpense(depenses.length - 1 - i)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spacer for FAB */}
      <div style={{ height: 120 }} />
      </>)}

      {/* FABs */}
      <div style={styles.fabWrap}>
        <button style={{ ...styles.fabShare }} onClick={() => setShowShare(true)}>
          📤 Partager
        </button>
        <button style={{ ...styles.fabIncome }} onClick={() => setShowIncome(true)}>
          💚 Entrée
        </button>
        <button style={styles.fab} onClick={() => setShowAdd(true)}>
          + Dépense
        </button>
      </div>

      {showAdd && (
        <AddExpenseSheet onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}
      {showIncome && (
        <AddIncomeSheet onAdd={(e) => { onAddEntree(e); setShowIncome(false); }} onClose={() => setShowIncome(false)} />
      )}
      {showShare && (
        <ShareCard salaire={salaire} depenses={depenses} entrees={entrees} epargne={epargne} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "findumois_v2";

export default function App() {
  const [config, setConfig] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [entrees, setEntrees] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { config: c, depenses: d, entrees: en } = JSON.parse(saved);
        setConfig(c);
        setDepenses(d || []);
        setEntrees(en || []);
      }
    } catch {}
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (config) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, depenses, entrees }));
    }
  }, [config, depenses, entrees]);

  const handleStart = (cfg) => setConfig(cfg);
  const handleAddExpense = (dep) => setDepenses(prev => [...prev, dep]);
  const handleDeleteExpense = (idx) => setDepenses(prev => prev.filter((_, i) => i !== idx));
  const handleAddEntree = (en) => setEntrees(prev => [...prev, en]);
  const handleDeleteEntree = (idx) => setEntrees(prev => prev.filter((_, i) => i !== idx));

  const handleReset = () => {
    if (window.confirm("Recommencer un nouveau mois ?")) {
      localStorage.removeItem(STORAGE_KEY);
      setConfig(null);
      setDepenses([]);
      setEntrees([]);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Grotesk:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #f3f4f6; font-family: 'Nunito', sans-serif; }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        ::-webkit-scrollbar { width: 0; }
        input:focus { outline: 2px solid #16a34a; outline-offset: 2px; }
      `}</style>

      {config ? (
        <Dashboard
          config={config}
          depenses={depenses}
          entrees={entrees}
          onAddExpense={handleAddExpense}
          onAddEntree={handleAddEntree}
          onDeleteExpense={handleDeleteExpense}
          onDeleteEntree={handleDeleteEntree}
          onReset={handleReset}
        />
      ) : (
        <OnboardingScreen onStart={handleStart} />
      )}
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  // Onboarding
  onboarding: {
    minHeight: "100dvh",
    background: "linear-gradient(160deg, #052e16 0%, #14532d 40%, #166534 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    gap: 28,
  },
  logoWrap: { textAlign: "center" },
  logoCircle: {
    fontSize: 56,
    marginBottom: 8,
    display: "block",
    filter: "drop-shadow(0 4px 20px rgba(34,197,94,0.5))",
    animation: "pulse 2.5s infinite",
  },
  logoTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#ffffff",
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: -1,
  },
  logoSub: { color: "#86efac", fontSize: 15, marginTop: 4 },
  card: {
    background: "rgba(255,255,255,0.97)",
    borderRadius: 24,
    padding: "32px 24px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  question: { fontSize: 20, fontWeight: 800, color: "#111827", textAlign: "center" },
  hint: { color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: -8 },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#f9fafb",
    borderRadius: 14,
    border: "2px solid #e5e7eb",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "14px 16px",
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "'Nunito', sans-serif",
    color: "#111827",
    width: "100%",
  },
  inputSuffix: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 700,
    paddingRight: 14,
    whiteSpace: "nowrap",
  },
  btn: {
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "16px 24px",
    fontSize: 16,
    fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
    width: "100%",
    boxShadow: "0 4px 15px rgba(22,163,74,0.4)",
    transition: "transform 0.1s, box-shadow 0.1s",
  },
  btnGhost: {
    background: "transparent",
    color: "#6b7280",
    border: "2px solid #e5e7eb",
    borderRadius: 14,
    padding: "14px 24px",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
    width: "100%",
  },
  footer: { color: "#4ade80", fontSize: 12, textAlign: "center" },

  // Dashboard
  dashboard: {
    maxWidth: 480,
    margin: "0 auto",
    minHeight: "100dvh",
    background: "#f3f4f6",
    paddingBottom: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 20px 12px",
    background: "#fff",
  },
  headerSub: { color: "#9ca3af", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" },
  headerTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#111827" },
  resetBtn: { background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 8 },

  statusCard: {
    margin: "0 0 16px",
    padding: "24px 20px",
    borderRadius: "0 0 28px 28px",
    color: "#fff",
  },
  statusBadge: { marginBottom: 8 },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 700,
  },
  statusMessage: { fontSize: 16, fontWeight: 700, color: "#e5e7eb", marginBottom: 20 },
  progressWrap: { marginBottom: 20 },
  progressTrack: { background: "#ffffff22", borderRadius: 99, height: 12, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 99, transition: "width 0.8s cubic-bezier(.22,1,.36,1)" },
  progressLabels: { display: "flex", justifyContent: "space-between", marginTop: 6 },
  statsRow: { display: "flex", gap: 0 },
  statItem: { flex: 1, textAlign: "center", padding: "0 8px" },
  statLabel: { color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  statValue: { color: "#fff", fontSize: 14, fontWeight: 800 },
  epargneBar: { marginTop: 16, padding: "10px 14px", background: "#ffffff11", borderRadius: 12, display: "flex", gap: 4, flexWrap: "wrap" },

  section: { padding: "0 16px", marginBottom: 16 },
  sectionTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 12, paddingTop: 4 },

  catList: { display: "flex", flexDirection: "column", gap: 10 },
  catRow: { display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 14, padding: "12px 14px" },
  catRowEmoji: { fontSize: 22, width: 32, textAlign: "center" },
  catRowMeta: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  catRowName: { color: "#374151", fontWeight: 700, fontSize: 14 },
  catRowAmt: { color: "#111827", fontWeight: 800, fontSize: 14 },
  catRowTrack: { background: "#f3f4f6", borderRadius: 99, height: 6, overflow: "hidden" },
  catRowBar: { height: "100%", borderRadius: 99, transition: "width 0.6s" },

  emptyState: { textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 16 },
  txList: { display: "flex", flexDirection: "column", gap: 8 },
  txItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#fff",
    borderRadius: 14,
    padding: "12px 14px",
  },
  txEmoji: { fontSize: 24, width: 36, textAlign: "center" },
  txCat: { fontWeight: 700, color: "#111827", fontSize: 14 },
  txNote: { color: "#9ca3af", fontSize: 12 },
  txDate: { color: "#d1d5db", fontSize: 11, marginTop: 2 },
  txAmount: { fontWeight: 800, color: "#111827", fontSize: 15, whiteSpace: "nowrap" },
  txDelete: { background: "none", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: 14, marginTop: 4, padding: "2px 4px" },

  fabWrap: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 10,
    zIndex: 100,
    width: "calc(100% - 32px)",
    maxWidth: 448,
  },
  fab: {
    flex: 1,
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    border: "none",
    borderRadius: 18,
    padding: "18px 24px",
    fontSize: 17,
    fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
    boxShadow: "0 8px 25px rgba(22,163,74,0.5)",
  },
  fabIncome: {
    flex: "0 0 auto",
    background: "linear-gradient(135deg, #16a34a22, #15803d33)",
    color: "#15803d",
    border: "2px solid #16a34a66",
    borderRadius: 18,
    padding: "18px 14px",
    fontSize: 14,
    fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  fabShare: {
    flex: "0 0 auto",
    background: "#fff",
    color: "#374151",
    border: "2px solid #e5e7eb",
    borderRadius: 18,
    padding: "18px 18px",
    fontSize: 15,
    fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    whiteSpace: "nowrap",
  },

  // Sheet / Modal
  sheetOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 200,
    display: "flex",
    alignItems: "flex-end",
    backdropFilter: "blur(4px)",
  },
  sheet: {
    background: "#fff",
    borderRadius: "28px 28px 0 0",
    padding: "12px 20px 40px",
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    maxHeight: "90dvh",
    overflowY: "auto",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    background: "#e5e7eb",
    borderRadius: 99,
    margin: "0 auto 20px",
  },
  sheetTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 20 },
  label: { color: "#6b7280", fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },

  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  catBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "12px 8px",
    background: "#f9fafb",
    border: "2px solid transparent",
    borderRadius: 14,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  catBtnActive: {
    background: "#f0fdf4",
    border: "2px solid #16a34a",
  },
  catLabel: { fontSize: 11, fontWeight: 700, color: "#374151", textAlign: "center" },

  tabBar: {
    display: "flex",
    background: "#fff",
    borderBottom: "2px solid #f3f4f6",
    padding: "0 16px",
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    padding: "12px 8px",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    fontFamily: "'Nunito', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: "#9ca3af",
    cursor: "pointer",
    transition: "all 0.15s",
    marginBottom: -2,
  },
  tabBtnActive: {
    color: "#16a34a",
    borderBottom: "3px solid #16a34a",
  },
  exportBtn: {
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  sharePreview: {
    border: "2px solid",
    borderRadius: 20,
    padding: "24px 20px",
    textAlign: "center",
    marginBottom: 4,
  },
};
