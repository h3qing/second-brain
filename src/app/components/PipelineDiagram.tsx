export default function PipelineDiagram() {
  return (
    <div className="pipeline-diagram">
      <svg
        viewBox="0 0 720 380"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label="Second Brain pipeline architecture"
      >
        {/* === LEFT: SOURCES === */}
        <text x="60" y="20" fill="#8a7e6e" fontSize="8" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          SOURCES
        </text>

        {/* Kindle */}
        <rect x="10" y="32" width="100" height="32" rx="2" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="60" y="52" fill="#1a1a1a" fontSize="10" fontFamily="monospace" textAnchor="middle">
          Kindle Notes
        </text>

        {/* Articles */}
        <rect x="10" y="72" width="100" height="32" rx="2" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="60" y="92" fill="#1a1a1a" fontSize="10" fontFamily="monospace" textAnchor="middle">
          Articles
        </text>

        {/* Podcasts */}
        <rect x="10" y="112" width="100" height="32" rx="2" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="60" y="132" fill="#1a1a1a" fontSize="10" fontFamily="monospace" textAnchor="middle">
          Podcasts
        </text>

        {/* Videos */}
        <rect x="10" y="152" width="100" height="32" rx="2" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="60" y="172" fill="#1a1a1a" fontSize="10" fontFamily="monospace" textAnchor="middle">
          Videos
        </text>

        {/* + source placeholder */}
        <rect x="10" y="192" width="100" height="32" rx="2" stroke="#d4c9b8" fill="none" strokeDasharray="4 3" />
        <text x="60" y="212" fill="#8a7e6e" fontSize="10" fontFamily="monospace" textAnchor="middle">
          + source
        </text>

        {/* === ARROWS: Sources -> Vault === */}
        <line x1="110" y1="48" x2="160" y2="100" stroke="#d4c9b8" strokeWidth="1" />
        <line x1="110" y1="88" x2="160" y2="100" stroke="#d4c9b8" strokeWidth="1" />
        <line x1="110" y1="128" x2="160" y2="110" stroke="#d4c9b8" strokeWidth="1" />
        <line x1="110" y1="168" x2="160" y2="120" stroke="#d4c9b8" strokeWidth="1" />
        <polygon points="158,97 160,103 155,100" fill="#d4c9b8" />

        {/* === CENTER TOP: OBSIDIAN VAULT === */}
        <text x="245" y="20" fill="#8a7e6e" fontSize="8" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          VAULT (iCLOUD)
        </text>

        <rect x="160" y="32" width="170" height="110" rx="2" stroke="#8b6914" fill="#faf8f5" />
        <text x="245" y="50" fill="#8b6914" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          OBSIDIAN VAULT
        </text>

        {/* Inner folders */}
        <rect x="170" y="58" width="70" height="24" rx="1" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="205" y="74" fill="#1a1a1a" fontSize="8" fontFamily="monospace" textAnchor="middle">
          10 Notes/
        </text>

        <rect x="250" y="58" width="70" height="24" rx="1" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="285" y="74" fill="#1a1a1a" fontSize="8" fontFamily="monospace" textAnchor="middle">
          20 Ideas/
        </text>

        <rect x="170" y="88" width="70" height="24" rx="1" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="205" y="104" fill="#1a1a1a" fontSize="8" fontFamily="monospace" textAnchor="middle">
          30 Concept/
        </text>

        <rect x="250" y="88" width="70" height="24" rx="1" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="285" y="104" fill="#1a1a1a" fontSize="8" fontFamily="monospace" textAnchor="middle">
          00 Meta/
        </text>

        <rect x="170" y="118" width="150" height="18" rx="1" stroke="#d4c9b8" fill="none" strokeDasharray="3 2" />
        <text x="245" y="131" fill="#8a7e6e" fontSize="7" fontFamily="monospace" textAnchor="middle">
          CLAUDE.md (schema)
        </text>

        {/* === ARROW: Vault -> Claude Code === */}
        <line x1="245" y1="142" x2="245" y2="170" stroke="#8b6914" strokeWidth="1" />
        <polygon points="242,168 248,168 245,174" fill="#8b6914" />

        {/* === CENTER BOTTOM: CLAUDE CODE === */}
        <text x="245" y="186" fill="#8a7e6e" fontSize="8" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          AI ENGINE
        </text>

        <rect x="170" y="192" width="150" height="44" rx="2" stroke="#8b6914" fill="#faf8f5" />
        <text x="245" y="210" fill="#8b6914" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          Claude Code
        </text>
        <text x="245" y="226" fill="#8a7e6e" fontSize="8" fontFamily="monospace" textAnchor="middle">
          extract / synthesize / link
        </text>

        {/* Arrow back up: Claude -> Vault (writes ideas + concepts) */}
        <line x1="225" y1="192" x2="225" y2="142" stroke="#8b6914" strokeWidth="1" strokeDasharray="4 3" />
        <polygon points="222,144 228,144 225,138" fill="#8b6914" />
        <text x="215" y="165" fill="#8a7e6e" fontSize="7" fontFamily="monospace" textAnchor="end">
          writes
        </text>

        {/* === RIGHT SIDE: SYNC + DEPLOY === */}

        {/* Arrow: Vault -> GitHub */}
        <line x1="330" y1="87" x2="390" y2="87" stroke="#d4c9b8" strokeWidth="1" />
        <polygon points="388,84 394,87 388,90" fill="#d4c9b8" />
        <text x="360" y="80" fill="#8a7e6e" fontSize="7" fontFamily="monospace" textAnchor="middle">
          auto-push
        </text>

        {/* GitHub */}
        <text x="470" y="20" fill="#8a7e6e" fontSize="8" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          SYNC
        </text>

        <rect x="395" y="32" width="150" height="50" rx="2" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="470" y="52" fill="#1a1a1a" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          GitHub
        </text>
        <text x="470" y="68" fill="#8a7e6e" fontSize="8" fontFamily="monospace" textAnchor="middle">
          h3qing/obsidian (private)
        </text>

        {/* Arrow: GitHub -> Vercel App */}
        <line x1="470" y1="82" x2="470" y2="110" stroke="#d4c9b8" strokeWidth="1" />
        <polygon points="467,108 473,108 470,114" fill="#d4c9b8" />
        <text x="482" y="100" fill="#8a7e6e" fontSize="7" fontFamily="monospace" textAnchor="start">
          API
        </text>

        {/* Vercel App - main box */}
        <text x="470" y="122" fill="#8a7e6e" fontSize="8" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle">
          WEB APP
        </text>

        <rect x="380" y="130" width="180" height="110" rx="2" stroke="#8b6914" fill="#faf8f5" />
        <text x="470" y="148" fill="#8b6914" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          secondbrain.heqinghuang.com
        </text>

        {/* Public section */}
        <rect x="390" y="156" width="76" height="36" rx="1" stroke="#d4c9b8" fill="#f5f0e8" />
        <text x="428" y="168" fill="#8a7e6e" fontSize="7" fontFamily="monospace" textAnchor="middle">
          PUBLIC
        </text>
        <text x="428" y="180" fill="#1a1a1a" fontSize="8" fontFamily="monospace" textAnchor="middle">
          Graph + Feed
        </text>
        <text x="428" y="189" fill="#1a1a1a" fontSize="8" fontFamily="monospace" textAnchor="middle">
        </text>

        {/* Private section */}
        <rect x="474" y="156" width="76" height="36" rx="1" stroke="#8b6914" fill="#f5f0e8" />
        <text x="512" y="168" fill="#8b6914" fontSize="7" fontFamily="monospace" textAnchor="middle">
          PRIVATE
        </text>
        <text x="512" y="180" fill="#1a1a1a" fontSize="8" fontFamily="monospace" textAnchor="middle">
          Review Queue
        </text>

        {/* Kindle device */}
        <rect x="390" y="200" width="160" height="28" rx="1" stroke="#d4c9b8" fill="none" strokeDasharray="3 2" />
        <text x="470" y="218" fill="#8a7e6e" fontSize="8" fontFamily="monospace" textAnchor="middle">
          Kindle / Phone / Browser
        </text>

        {/* Arrow: Review writes back to GitHub */}
        <line x1="560" y1="174" x2="590" y2="174" stroke="#8b6914" strokeWidth="1" />
        <line x1="590" y1="174" x2="590" y2="57" stroke="#8b6914" strokeWidth="1" />
        <line x1="590" y1="57" x2="545" y2="57" stroke="#8b6914" strokeWidth="1" />
        <polygon points="547,54 547,60 541,57" fill="#8b6914" />
        <text x="598" y="120" fill="#8a7e6e" fontSize="7" fontFamily="monospace" textAnchor="start" transform="rotate(90, 598, 100)">
          review decisions
        </text>

        {/* === BOTTOM: HUMAN REVIEW LOOP === */}
        <rect x="160" y="280" width="400" height="44" rx="2" stroke="#d4c9b8" fill="none" strokeDasharray="4 3" />
        <text x="360" y="298" fill="#8b6914" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="600">
          HUMAN REVIEW LOOP
        </text>
        <text x="360" y="314" fill="#8a7e6e" fontSize="8" fontFamily="monospace" textAnchor="middle">
          AI extracts. Human reviews. Only approved content goes public.
        </text>

        {/* Arrows connecting to human review loop */}
        <line x1="245" y1="236" x2="245" y2="280" stroke="#d4c9b8" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="470" y1="240" x2="470" y2="280" stroke="#d4c9b8" strokeWidth="1" strokeDasharray="3 2" />

        {/* === CAPTION === */}
        <text x="360" y="355" fill="#8a7e6e" fontSize="8" fontFamily="monospace" textAnchor="middle">
          150+ books in the vault. 9 extracted so far. The graph grows as you review.
        </text>
        <text x="360" y="370" fill="#8a7e6e" fontSize="8" fontFamily="monospace" textAnchor="middle">
          Fork this project: github.com/h3qing/second-brain
        </text>
      </svg>
    </div>
  );
}
