const fs = require('fs');
const file = 'src/components/StatsGrid.tsx';
let code = fs.readFileSync(file, 'utf8');

const originalStatCards = `  const statCards = [
    {
      label: 'TOTAL WINS',
      value: stats.wins,
      icon: Trophy,
      color: theme?.isDark ? 'text-emerald-300' : 'text-[#006b28]',
      customColor: theme ? (theme.isDark ? theme.accent : theme.primary) : undefined,
      bgGlow: 'bg-emerald-500/10 border-emerald-500/25',
      iconBg: 'bg-[#00b84a] text-white',
      customIconBg: theme ? \`linear-gradient(135deg, \${theme.primary}, \${theme.secondary})\` : undefined,
    },
    {
      label: 'WIN ACCURACY',
      value: \`\${winRate}%\`,
      icon: Percent,
      color: 'text-sky-700 dark:text-sky-300',
      bgGlow: 'bg-sky-500/10 border-sky-500/25',
      iconBg: 'bg-sky-500 text-white',
    },
    {
      label: 'JACKPOTS',
      value: stats.jacks,
      icon: Crown,
      color: 'text-amber-800 dark:text-amber-300',
      bgGlow: 'bg-amber-500/10 border-amber-500/25',
      iconBg: 'bg-amber-500 text-white',
    },
    {
      label: 'LOSSES',
      value: stats.losses,
      icon: XCircle,
      color: 'text-rose-800 dark:text-rose-300',
      bgGlow: 'bg-rose-500/10 border-rose-500/25',
      iconBg: 'bg-rose-500 text-white',
    },
  ];`;

// Replace the array
code = code.replace(/  const statCards = \[[\s\S]*?  \];/, originalStatCards);

// Replace the rendering classname
const renderClassOld = "className={`rounded-2xl border p-3 flex flex-col justify-between ${card.bgGlow} shadow-sm transition-all duration-300 hover:scale-[1.02]`}";
const renderClassNew = "className={`rounded-2xl border p-3 flex flex-col justify-between ${\n                isDarkTheme ? 'liquid-glass-dark' : 'liquid-glass'\n              } ${card.bgGlow} shadow-sm transition-all duration-300`}";

code = code.replace(renderClassOld, renderClassNew);

fs.writeFileSync(file, code);
