export default function PipelineDiagram() {
  // Colors matched to heqinghuang.com Ink & Parchment theme
  const c = {
    text: "#1a1a1a",
    muted: "#737373",
    border: "#d4d4d4",
    accent: "#b8845a",
    bg: "#f5f5f5",
    paper: "#ffffff",
    label: "#999",
    ghost: "#b0b0b0",
  };

  return (
    <div className="pipeline-diagram">
      <svg
        viewBox="0 0 800 420"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label="Second Brain pipeline architecture"
      >
        {/* === COLUMN 1: SOURCES === */}
        <text x="70" y="24" fill={c.label} fontSize="10" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          SOURCES
        </text>

        <rect x="10" y="38" width="120" height="38" rx="2" stroke={c.border} fill={c.bg} />
        <text x="70" y="62" fill={c.text} fontSize="12" fontFamily="monospace" textAnchor="middle">
          Kindle Notes
        </text>

        <rect x="10" y="84" width="120" height="38" rx="2" stroke={c.border} fill={c.bg} />
        <text x="70" y="108" fill={c.text} fontSize="12" fontFamily="monospace" textAnchor="middle">
          Articles
        </text>

        <rect x="10" y="130" width="120" height="38" rx="2" stroke={c.border} fill={c.bg} />
        <text x="70" y="154" fill={c.text} fontSize="12" fontFamily="monospace" textAnchor="middle">
          Podcasts
        </text>

        <rect x="10" y="176" width="120" height="38" rx="2" stroke={c.border} fill={c.bg} />
        <text x="70" y="200" fill={c.text} fontSize="12" fontFamily="monospace" textAnchor="middle">
          Videos
        </text>

        <rect x="10" y="222" width="120" height="38" rx="2" stroke={c.ghost} fill="none" strokeDasharray="5 3" />
        <text x="70" y="246" fill={c.ghost} fontSize="12" fontFamily="monospace" textAnchor="middle">
          + source
        </text>

        {/* Arrows: Sources -> Vault */}
        <line x1="130" y1="57" x2="175" y2="112" stroke={c.border} strokeWidth="1" />
        <line x1="130" y1="103" x2="175" y2="118" stroke={c.border} strokeWidth="1" />
        <line x1="130" y1="149" x2="175" y2="130" stroke={c.border} strokeWidth="1" />
        <line x1="130" y1="195" x2="175" y2="145" stroke={c.border} strokeWidth="1" />
        <polygon points="173,109 178,115 172,114" fill={c.border} />

        {/* === COLUMN 2: OBSIDIAN VAULT === */}
        <text x="275" y="24" fill={c.label} fontSize="10" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          VAULT (iCLOUD)
        </text>

        <rect x="175" y="38" width="200" height="132" rx="3" stroke={c.accent} fill={c.paper} strokeWidth="1.5" />
        <text x="275" y="60" fill={c.accent} fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          Obsidian Vault
        </text>

        {/* Folder grid */}
        <rect x="188" y="72" width="85" height="28" rx="2" stroke={c.border} fill={c.bg} />
        <text x="230" y="90" fill={c.text} fontSize="10" fontFamily="monospace" textAnchor="middle">10 Notes/</text>

        <rect x="280" y="72" width="85" height="28" rx="2" stroke={c.border} fill={c.bg} />
        <text x="322" y="90" fill={c.text} fontSize="10" fontFamily="monospace" textAnchor="middle">20 Ideas/</text>

        <rect x="188" y="106" width="85" height="28" rx="2" stroke={c.border} fill={c.bg} />
        <text x="230" y="124" fill={c.text} fontSize="10" fontFamily="monospace" textAnchor="middle">30 Concept/</text>

        <rect x="280" y="106" width="85" height="28" rx="2" stroke={c.border} fill={c.bg} />
        <text x="322" y="124" fill={c.text} fontSize="10" fontFamily="monospace" textAnchor="middle">00 Meta/</text>

        <rect x="188" y="142" width="177" height="20" rx="2" stroke={c.border} fill="none" strokeDasharray="4 3" />
        <text x="275" y="156" fill={c.muted} fontSize="9" fontFamily="monospace" textAnchor="middle">
          CLAUDE.md (schema)
        </text>

        {/* Arrow: Vault <-> Claude Code */}
        <line x1="275" y1="170" x2="275" y2="206" stroke={c.accent} strokeWidth="1" />
        <polygon points="272,204 278,204 275,210" fill={c.accent} />

        <line x1="255" y1="232" x2="255" y2="170" stroke={c.accent} strokeWidth="1" strokeDasharray="4 3" />
        <polygon points="252,172 258,172 255,166" fill={c.accent} />
        <text x="244" y="198" fill={c.muted} fontSize="9" fontFamily="monospace" textAnchor="end">writes</text>

        {/* === COLUMN 2 BOTTOM: CLAUDE CODE === */}
        <text x="275" y="222" fill={c.label} fontSize="10" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          AI ENGINE
        </text>

        <rect x="190" y="232" width="170" height="52" rx="3" stroke={c.accent} fill={c.paper} strokeWidth="1.5" />
        <text x="275" y="254" fill={c.accent} fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          Claude Code
        </text>
        <text x="275" y="272" fill={c.muted} fontSize="10" fontFamily="monospace" textAnchor="middle">
          extract / synthesize / link
        </text>

        {/* === COLUMN 3: GITHUB === */}
        <text x="530" y="24" fill={c.label} fontSize="10" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          SYNC
        </text>

        {/* Arrow: Vault -> GitHub */}
        <line x1="375" y1="104" x2="445" y2="72" stroke={c.border} strokeWidth="1" />
        <polygon points="443,69 449,73 442,75" fill={c.border} />
        <text x="410" y="80" fill={c.muted} fontSize="9" fontFamily="monospace" textAnchor="middle">
          auto-push
        </text>

        <rect x="450" y="38" width="160" height="56" rx="3" stroke={c.border} fill={c.bg} />
        <text x="530" y="62" fill={c.text} fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          GitHub
        </text>
        <text x="530" y="80" fill={c.muted} fontSize="10" fontFamily="monospace" textAnchor="middle">
          h3qing/obsidian
        </text>

        {/* Arrow: GitHub -> Web App */}
        <line x1="530" y1="94" x2="530" y2="130" stroke={c.border} strokeWidth="1" />
        <polygon points="527,128 533,128 530,134" fill={c.border} />
        <text x="544" y="116" fill={c.muted} fontSize="9" fontFamily="monospace" textAnchor="start">API</text>

        {/* === COLUMN 3 BOTTOM: WEB APP === */}
        <text x="530" y="148" fill={c.label} fontSize="10" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          WEB APP
        </text>

        <rect x="430" y="156" width="200" height="128" rx="3" stroke={c.accent} fill={c.paper} strokeWidth="1.5" />
        <text x="530" y="178" fill={c.accent} fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          secondbrain.
        </text>
        <text x="530" y="192" fill={c.accent} fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          heqinghuang.com
        </text>

        {/* Public */}
        <rect x="442" y="202" width="88" height="40" rx="2" stroke={c.border} fill={c.bg} />
        <text x="486" y="218" fill={c.muted} fontSize="9" fontFamily="monospace" textAnchor="middle">PUBLIC</text>
        <text x="486" y="232" fill={c.text} fontSize="10" fontFamily="monospace" textAnchor="middle">Graph + Feed</text>

        {/* Private */}
        <rect x="538" y="202" width="82" height="40" rx="2" stroke={c.accent} fill={c.bg} />
        <text x="579" y="218" fill={c.accent} fontSize="9" fontFamily="monospace" textAnchor="middle">PRIVATE</text>
        <text x="579" y="232" fill={c.text} fontSize="10" fontFamily="monospace" textAnchor="middle">Review</text>

        {/* Devices */}
        <rect x="442" y="250" width="178" height="26" rx="2" stroke={c.border} fill="none" strokeDasharray="4 3" />
        <text x="530" y="268" fill={c.ghost} fontSize="10" fontFamily="monospace" textAnchor="middle">
          Kindle / Phone / Browser
        </text>

        {/* Arrow: Review -> GitHub (write-back loop) */}
        <line x1="630" y1="222" x2="660" y2="222" stroke={c.accent} strokeWidth="1" />
        <line x1="660" y1="222" x2="660" y2="66" stroke={c.accent} strokeWidth="1" />
        <line x1="660" y1="66" x2="610" y2="66" stroke={c.accent} strokeWidth="1" />
        <polygon points="612,63 612,69 606,66" fill={c.accent} />
        <text x="670" y="150" fill={c.muted} fontSize="9" fontFamily="monospace" textAnchor="start" transform="rotate(90, 670, 120)">
          review decisions
        </text>

        {/* === BOTTOM: HUMAN REVIEW LOOP === */}
        <rect x="175" y="330" width="460" height="50" rx="3" stroke={c.accent} fill="none" strokeDasharray="5 3" />
        <text x="405" y="352" fill={c.accent} fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          HUMAN REVIEW LOOP
        </text>
        <text x="405" y="370" fill={c.muted} fontSize="10" fontFamily="monospace" textAnchor="middle">
          AI extracts. Human reviews. Only approved content goes public.
        </text>

        {/* Dashed lines to human review loop */}
        <line x1="275" y1="284" x2="275" y2="330" stroke={c.border} strokeWidth="1" strokeDasharray="4 3" />
        <line x1="530" y1="284" x2="530" y2="330" stroke={c.border} strokeWidth="1" strokeDasharray="4 3" />

        {/* === CAPTION === */}
        <text x="400" y="408" fill={c.muted} fontSize="10" fontFamily="monospace" textAnchor="middle">
          150+ books in the vault. The graph grows as you review. Fork: github.com/h3qing/second-brain
        </text>
      </svg>
    </div>
  );
}
