import { useState, useRef } from "react";

const SECTIONS = [
  {
    title: "Inspection Visuelle",
    icon: "🔍",
    color: "#0369a1",
    items: [
      "État de surface conforme (absence de bulles, cloques, fissures)",
      "Finition régulière et homogène sur l'ensemble de la zone",
      "Uniformité de la couleur et de la texture",
      "Absence de traces de coulure ou de surépaisseur",
      "Joints et raccords propres et alignés",
      "Absence de décollements ou de zones non adhérentes",
      "Planéité et niveau conformes aux tolérances",
    ],
  },
  {
    title: "Tests Techniques",
    icon: "🧪",
    color: "#7c3aed",
    items: [
      "Test d'étanchéité réalisé — résultat conforme",
      "Test d'adhérence réalisé — résultat conforme",
      "Épaisseur du revêtement mesurée — dans les tolérances",
      "Temps de séchage / réticulation respecté",
      "Dureté / résistance mécanique vérifiée",
      "Pente et évacuation d'eau conformes (si applicable)",
    ],
  },
  {
    title: "Conformité au Devis",
    icon: "📋",
    color: "#b45309",
    items: [
      "Produits utilisés conformes aux spécifications du devis",
      "Nombre de couches appliquées conforme",
      "Surface traitée correspond au métrage du devis",
      "Travaux supplémentaires documentés et validés",
      "Délais d'intervention respectés",
    ],
  },
  {
    title: "Propreté du Chantier",
    icon: "🧹",
    color: "#047857",
    items: [
      "Zone de travail nettoyée et dégagée",
      "Déchets et emballages évacués",
      "Protections des zones adjacentes retirées",
      "Aucun dommage sur les surfaces environnantes",
      "Outillage et matériel récupérés",
    ],
  },
];

function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    onChange(canvasRef.current.toDataURL());
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onChange("");
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        style={{
          border: "1.5px solid #cbd5e1",
          borderRadius: 8,
          background: "#fff",
          width: "100%",
          maxWidth: 400,
          height: 120,
          touchAction: "none",
          cursor: "crosshair",
        }}
      />
      <button
        onClick={clear}
        style={{
          marginTop: 4,
          fontSize: 13,
          color: "#64748b",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Effacer la signature
      </button>
    </div>
  );
}

export default function App() {
  const [project, setProject] = useState({
    ref: "",
    client: "",
    site: "",
    date: new Date().toISOString().slice(0, 10),
    technicien: "",
  });
  const [checks, setChecks] = useState(() =>
    SECTIONS.map((s) => s.items.map(() => ({ ok: false, na: false })))
  );
  const [comments, setComments] = useState(() =>
    SECTIONS.map((s) => s.items.map(() => ""))
  );
  const [generalComment, setGeneralComment] = useState("");
  const [validation, setValidation] = useState({
    nom: "",
    date: new Date().toISOString().slice(0, 10),
    signature: "",
  });
  const [verdict, setVerdict] = useState("");

  const toggle = (si, ii, field) => {
    setChecks((prev) => {
      const n = prev.map((s) => s.map((i) => ({ ...i })));
      if (field === "ok") {
        n[si][ii].ok = !n[si][ii].ok;
        if (n[si][ii].ok) n[si][ii].na = false;
      } else {
        n[si][ii].na = !n[si][ii].na;
        if (n[si][ii].na) n[si][ii].ok = false;
      }
      return n;
    });
  };

  const total = SECTIONS.reduce((a, s) => a + s.items.length, 0);
  const checked = checks.flat().filter((c) => c.ok).length;
  const naCount = checks.flat().filter((c) => c.na).length;
  const applicable = total - naCount;
  const pct = applicable > 0 ? Math.round((checked / applicable) * 100) : 0;

  const handlePrint = () => window.print();

  const pctColor =
    pct === 100 ? "#047857" : pct >= 75 ? "#b45309" : "#dc2626";

  return (
    <div
      style={{
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        maxWidth: 800,
        margin: "0 auto",
        padding: "16px 12px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          button { display: none !important; }
          .no-print { display: none !important; }
          input, textarea, select { border: 1px solid #e2e8f0 !important; }
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #0369a1 !important;
          box-shadow: 0 0 0 2px rgba(3,105,161,0.15);
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
          borderRadius: 12,
          padding: "24px 20px",
          marginBottom: 20,
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 28 }}>✅</span>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: -0.3,
              }}
            >
              Contrôle Qualité Post-Intervention
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.85 }}>
              Étanchéité & Revêtement de Sol — Palco
            </p>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "16px 16px 12px",
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 15,
            fontWeight: 700,
            color: "#334155",
          }}
        >
          Informations Chantier
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 14px",
          }}
        >
          {[
            ["Réf. chantier", "ref", "text"],
            ["Client", "client", "text"],
            ["Adresse / Site", "site", "text"],
            ["Date intervention", "date", "date"],
            ["Technicien(s)", "technicien", "text"],
          ].map(([label, key, type]) => (
            <div
              key={key}
              style={key === "site" ? { gridColumn: "1/-1" } : {}}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 3,
                }}
              >
                {label}
              </label>
              <input
                type={type}
                value={project[key]}
                onChange={(e) =>
                  setProject((p) => ({ ...p, [key]: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 7,
                  fontSize: 14,
                  background: "#f8fafc",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 56,
            height: 56,
            flexShrink: 0,
          }}
        >
          <svg
            viewBox="0 0 36 36"
            style={{ width: 56, height: 56, transform: "rotate(-90deg)" }}
          >
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={pctColor}
              strokeWidth="3"
              strokeDasharray={`${pct * 0.974} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: pctColor,
            }}
          >
            {pct}%
          </span>
        </div>
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
          <strong style={{ color: "#0f172a" }}>{checked}</strong> conforme
          {checked > 1 ? "s" : ""} / {applicable} applicable
          {applicable > 1 ? "s" : ""}
          {naCount > 0 && (
            <span style={{ marginLeft: 8, color: "#94a3b8" }}>
              ({naCount} N/A)
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section, si) => (
        <div
          key={si}
          style={{
            background: "#fff",
            borderRadius: 10,
            marginBottom: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "2px solid " + section.color + "22",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>{section.icon}</span>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: section.color,
              }}
            >
              {section.title}
            </h3>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                fontWeight: 600,
                color: "#94a3b8",
              }}
            >
              {checks[si].filter((c) => c.ok).length}/
              {section.items.filter((_, i) => !checks[si][i].na).length}
            </span>
          </div>
          <div style={{ padding: "6px 0" }}>
            {section.items.map((item, ii) => (
              <div
                key={ii}
                style={{
                  padding: "10px 16px",
                  borderBottom:
                    ii < section.items.length - 1
                      ? "1px solid #f1f5f9"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <button
                      onClick={() => toggle(si, ii, "ok")}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        border:
                          "2px solid " +
                          (checks[si][ii].ok ? "#047857" : "#d1d5db"),
                        background: checks[si][ii].ok ? "#047857" : "#fff",
                        color: "#fff",
                        fontSize: 16,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .15s",
                      }}
                    >
                      {checks[si][ii].ok && "✓"}
                    </button>
                    <button
                      onClick={() => toggle(si, ii, "na")}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        border:
                          "2px solid " +
                          (checks[si][ii].na ? "#94a3b8" : "#d1d5db"),
                        background: checks[si][ii].na ? "#94a3b8" : "#fff",
                        color: checks[si][ii].na ? "#fff" : "#94a3b8",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .15s",
                      }}
                    >
                      N/A
                    </button>
                  </div>
                  <span
                    style={{
                      fontSize: 13.5,
                      color: checks[si][ii].na ? "#94a3b8" : "#334155",
                      lineHeight: 1.45,
                      textDecoration: checks[si][ii].na
                        ? "line-through"
                        : "none",
                      flex: 1,
                    }}
                  >
                    {item}
                  </span>
                </div>
                {checks[si][ii].ok === false && !checks[si][ii].na && (
                  <input
                    placeholder="Observation / action corrective..."
                    value={comments[si][ii]}
                    onChange={(e) => {
                      const n = comments.map((s) => [...s]);
                      n[si][ii] = e.target.value;
                      setComments(n);
                    }}
                    style={{
                      marginTop: 8,
                      marginLeft: 66,
                      width: "calc(100% - 80px)",
                      padding: "6px 10px",
                      border: "1.5px solid #fde68a",
                      borderRadius: 6,
                      fontSize: 13,
                      background: "#fffbeb",
                      boxSizing: "border-box",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* General Comment */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 16,
          marginBottom: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: 14,
            fontWeight: 700,
            color: "#334155",
          }}
        >
          Commentaires Généraux
        </h3>
        <textarea
          rows={3}
          placeholder="Observations, réserves, recommandations..."
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1.5px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13.5,
            resize: "vertical",
            background: "#f8fafc",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Verdict */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 16,
          marginBottom: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: 14,
            fontWeight: 700,
            color: "#334155",
          }}
        >
          Décision Finale
        </h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            ["conforme", "Conforme — Travaux acceptés", "#047857"],
            ["reserve", "Conforme avec réserves", "#b45309"],
            ["non-conforme", "Non conforme — Reprise nécessaire", "#dc2626"],
          ].map(([val, label, col]) => (
            <button
              key={val}
              onClick={() => setVerdict(val)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border:
                  "2px solid " + (verdict === val ? col : "#e2e8f0"),
                background: verdict === val ? col + "10" : "#fff",
                color: verdict === val ? col : "#64748b",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {verdict === val && "● "}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Client Validation */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "2px solid #0369a122",
        }}
      >
        <h3
          style={{
            margin: "0 0 12px",
            fontSize: 15,
            fontWeight: 700,
            color: "#0369a1",
          }}
        >
          📝 Validation Client
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 14px",
            marginBottom: 14,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                display: "block",
                marginBottom: 3,
              }}
            >
              Nom du client / représentant
            </label>
            <input
              value={validation.nom}
              onChange={(e) =>
                setValidation((v) => ({ ...v, nom: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 7,
                fontSize: 14,
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                display: "block",
                marginBottom: 3,
              }}
            >
              Date de validation
            </label>
            <input
              type="date"
              value={validation.date}
              onChange={(e) =>
                setValidation((v) => ({ ...v, date: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 7,
                fontSize: 14,
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#64748b",
              display: "block",
              marginBottom: 6,
            }}
          >
            Signature du client
          </label>
          <SignaturePad
            value={validation.signature}
            onChange={(sig) =>
              setValidation((v) => ({ ...v, signature: sig }))
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div
        className="no-print"
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          paddingBottom: 32,
        }}
      >
        <button
          onClick={handlePrint}
          style={{
            padding: "14px 32px",
            borderRadius: 10,
            border: "none",
            background:
              "linear-gradient(135deg, #0c4a6e, #0369a1)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(3,105,161,0.3)",
            letterSpacing: 0.3,
          }}
        >
          🖨️ Imprimer / Exporter PDF
        </button>
      </div>
    </div>
  );
}
