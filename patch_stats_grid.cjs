const fs = require('fs');
const file = 'src/components/StatsGrid.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update WIN ACCURACY
code = code.replace(
  "color: 'text-sky-700 dark:text-sky-300',\n      bgGlow: 'bg-sky-500/10 border-sky-500/25',\n      iconBg: 'bg-sky-500 text-white',",
  "color: theme?.isDark ? 'text-emerald-300' : 'text-[#006b28]',\n      customColor: theme ? (theme.isDark ? theme.accent : theme.primary) : undefined,\n      bgGlow: 'bg-emerald-500/10 border-emerald-500/25 premium-glass',\n      iconBg: 'bg-[#00b84a] text-white',\n      customIconBg: theme ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined,"
);

// Update JACKPOTS
code = code.replace(
  "color: 'text-amber-800 dark:text-amber-300',\n      bgGlow: 'bg-amber-500/10 border-amber-500/25',\n      iconBg: 'bg-amber-500 text-white',",
  "color: theme?.isDark ? 'text-emerald-300' : 'text-[#006b28]',\n      customColor: theme ? (theme.isDark ? theme.accent : theme.primary) : undefined,\n      bgGlow: 'bg-emerald-500/10 border-emerald-500/25 premium-glass',\n      iconBg: 'bg-[#00b84a] text-white',\n      customIconBg: theme ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined,"
);

// Update LOSSES
code = code.replace(
  "color: 'text-rose-800 dark:text-rose-300',\n      bgGlow: 'bg-rose-500/10 border-rose-500/25',\n      iconBg: 'bg-rose-500 text-white',",
  "color: theme?.isDark ? 'text-emerald-300' : 'text-[#006b28]',\n      customColor: theme ? (theme.isDark ? theme.accent : theme.primary) : undefined,\n      bgGlow: 'bg-emerald-500/10 border-emerald-500/25 premium-glass',\n      iconBg: 'bg-[#00b84a] text-white',\n      customIconBg: theme ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : undefined,"
);

// Add premium-glass to TOTAL WINS as well so it explicitly has the animation
code = code.replace(
  "bgGlow: 'bg-emerald-500/10 border-emerald-500/25',",
  "bgGlow: 'bg-emerald-500/10 border-emerald-500/25 premium-glass',"
);

// Also remove `liquid-glass` from the card class so they don't get the white background override
code = code.replace(
  "className={`rounded-2xl border p-3 flex flex-col justify-between ${\n                isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'\n              } ${card.bgGlow} shadow-sm transition-all duration-300`}",
  "className={`rounded-2xl border p-3 flex flex-col justify-between ${card.bgGlow} shadow-sm transition-all duration-300 hover:scale-[1.02]`}"
);

fs.writeFileSync(file, code);
