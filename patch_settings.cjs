const fs = require('fs');
const file = 'src/components/SettingsPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

const newSection = `
        {/* ========================================================================= */}
        {/* SECTION 4C: DATA ANALYSIS MODE SELECTION */}
        {/* ========================================================================= */}
        <div>
          <label className="text-xs font-mono font-black text-[#111b15] dark:text-slate-200 uppercase flex items-center gap-1.5 mb-2.5">
            <Sparkles size={14} className="text-[#00b84a]" />
            <span>Data Analysis Mode</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: '10_DATA',
                name: '10 Data Analysis (Fast)',
                desc: 'Fast predictions using the latest 10 draw results. Recommended for speed.',
                tag: 'FAST MODE',
              },
              {
                id: '500_DATA',
                name: '100 & 500 Data Analysis (Deep)',
                desc: 'Deep AI analysis using extended history patterns. Slower but highly accurate.',
                tag: 'DEEP AI MODE',
              },
            ].map(s => {
              const isActive = settings.dataAnalysisMode === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playClick();
                    vibrate(20);
                    onUpdateSettings({ dataAnalysisMode: s.id as any });
                    showToast(\`Switched to \${s.name}\`);
                  }}
                  className={\`p-3.5 rounded-2xl border text-left transition-all shadow-sm flex flex-col justify-between gap-2 \${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/15'
                      : 'liquid-pill border-emerald-500/15 hover:border-emerald-500/30'
                  }\`}
                  id={\`settings-data-mode-\${s.id}\`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-space font-black text-xs text-[#111b15] dark:text-white">
                      {s.name}
                    </span>
                    {isActive && <Check size={14} className="text-[#00b84a]" />}
                  </div>
                  <div className="text-[10.5px] text-[#3d5c47] dark:text-slate-400 font-semibold leading-relaxed">
                    {s.desc}
                  </div>
                  <span className="text-[9.5px] font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
`;

code = code.replace(
  '{/* ========================================================================= */}\\n        {/* SECTION 5: AUTOMATION & RISK MANAGEMENT */}',
  newSection + '\\n        {/* ========================================================================= */}\\n        {/* SECTION 5: AUTOMATION & RISK MANAGEMENT */}'
);

fs.writeFileSync(file, code);
