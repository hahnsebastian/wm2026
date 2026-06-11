const fs = require('fs');

// CEST times from user, converted to UTC (subtract 2h)
function cestToUtc(cestStr) {
  const [datePart, timePart] = cestStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [h, m] = timePart.split(':').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, h - 2, m, 0));
  return d.toISOString();
}

const matches = [
  { home: "Mexico", away: "South Korea", cest: "2026-06-19 03:00", group: "A" },
  { home: "South Africa", away: "Czechia", cest: "2026-06-18 18:00", group: "A" },
  { home: "Mexico", away: "South Africa", cest: "2026-06-11 21:00", group: "A" },
  { home: "South Korea", away: "Czechia", cest: "2026-06-12 04:00", group: "A" },
  { home: "Mexico", away: "Czechia", cest: "2026-06-24 23:00", group: "A" },
  { home: "South Korea", away: "South Africa", cest: "2026-06-24 23:00", group: "A" },
  { home: "Canada", away: "Bosnia and Herzegovina", cest: "2026-06-12 21:00", group: "B" },
  { home: "Qatar", away: "Switzerland", cest: "2026-06-13 21:00", group: "B" },
  { home: "Canada", away: "Qatar", cest: "2026-06-19 00:00", group: "B" },
  { home: "Bosnia and Herzegovina", away: "Switzerland", cest: "2026-06-18 21:00", group: "B" },
  { home: "Canada", away: "Switzerland", cest: "2026-06-24 21:00", group: "B" },
  { home: "Bosnia and Herzegovina", away: "Qatar", cest: "2026-06-24 21:00", group: "B" },
  { home: "Brazil", away: "Morocco", cest: "2026-06-14 00:00", group: "C" },
  { home: "Haiti", away: "Scotland", cest: "2026-06-14 03:00", group: "C" },
  { home: "Brazil", away: "Haiti", cest: "2026-06-20 02:30", group: "C" },
  { home: "Morocco", away: "Scotland", cest: "2026-06-20 00:00", group: "C" },
  { home: "Brazil", away: "Scotland", cest: "2026-06-24 20:00", group: "C" },
  { home: "Morocco", away: "Haiti", cest: "2026-06-24 20:00", group: "C" },
  { home: "United States", away: "Paraguay", cest: "2026-06-13 03:00", group: "D" },
  { home: "Australia", away: "Türkiye", cest: "2026-06-14 06:00", group: "D" },
  { home: "United States", away: "Australia", cest: "2026-06-19 21:00", group: "D" },
  { home: "Paraguay", away: "Türkiye", cest: "2026-06-20 05:00", group: "D" },
  { home: "United States", away: "Türkiye", cest: "2026-06-26 00:00", group: "D" },
  { home: "Paraguay", away: "Australia", cest: "2026-06-26 00:00", group: "D" },
  { home: "Germany", away: "Côte d'Ivoire", cest: "2026-06-20 22:00", group: "E" },
  { home: "Ecuador", away: "Curaçao", cest: "2026-06-21 02:00", group: "E" },
  { home: "Germany", away: "Ecuador", cest: "2026-06-25 22:00", group: "E" },
  { home: "Côte d'Ivoire", away: "Curaçao", cest: "2026-06-25 22:00", group: "E" },
  { home: "Germany", away: "Curaçao", cest: "2026-06-14 19:00", group: "E" },
  { home: "Côte d'Ivoire", away: "Ecuador", cest: "2026-06-15 01:00", group: "E" },
  { home: "Netherlands", away: "Japan", cest: "2026-06-14 22:00", group: "F" },
  { home: "Sweden", away: "Tunisia", cest: "2026-06-15 04:00", group: "F" },
  { home: "Netherlands", away: "Sweden", cest: "2026-06-20 19:00", group: "F" },
  { home: "Japan", away: "Tunisia", cest: "2026-06-21 06:00", group: "F" },
  { home: "Netherlands", away: "Tunisia", cest: "2026-06-26 01:00", group: "F" },
  { home: "Japan", away: "Sweden", cest: "2026-06-26 01:00", group: "F" },
  { home: "Belgium", away: "Egypt", cest: "2026-06-15 21:00", group: "G" },
  { home: "Iran", away: "New Zealand", cest: "2026-06-16 03:00", group: "G" },
  { home: "Belgium", away: "Iran", cest: "2026-06-21 21:00", group: "G" },
  { home: "Egypt", away: "New Zealand", cest: "2026-06-22 03:00", group: "G" },
  { home: "Belgium", away: "New Zealand", cest: "2026-06-26 22:00", group: "G" },
  { home: "Egypt", away: "Iran", cest: "2026-06-26 22:00", group: "G" },
  { home: "Spain", away: "Uruguay", cest: "2026-06-15 18:00", group: "H" },
  { home: "Saudi Arabia", away: "Cape Verde", cest: "2026-06-16 00:00", group: "H" },
  { home: "Spain", away: "Saudi Arabia", cest: "2026-06-21 18:00", group: "H" },
  { home: "Uruguay", away: "Cape Verde", cest: "2026-06-22 00:00", group: "H" },
  { home: "Spain", away: "Cape Verde", cest: "2026-06-26 19:00", group: "H" },
  { home: "Uruguay", away: "Saudi Arabia", cest: "2026-06-26 19:00", group: "H" },
  { home: "France", away: "Senegal", cest: "2026-06-16 21:00", group: "I" },
  { home: "Norway", away: "Iraq", cest: "2026-06-17 00:00", group: "I" },
  { home: "France", away: "Norway", cest: "2026-06-22 19:00", group: "I" },
  { home: "Senegal", away: "Iraq", cest: "2026-06-22 22:00", group: "I" },
  { home: "France", away: "Iraq", cest: "2026-06-26 23:00", group: "I" },
  { home: "Senegal", away: "Norway", cest: "2026-06-26 23:00", group: "I" },
  { home: "Argentina", away: "Algeria", cest: "2026-06-17 03:00", group: "J" },
  { home: "Austria", away: "Jordan", cest: "2026-06-17 06:00", group: "J" },
  { home: "Argentina", away: "Austria", cest: "2026-06-22 15:00", group: "J" },
  { home: "Algeria", away: "Jordan", cest: "2026-06-23 01:00", group: "J" },
  { home: "Argentina", away: "Jordan", cest: "2026-06-27 18:00", group: "J" },
  { home: "Algeria", away: "Austria", cest: "2026-06-27 18:00", group: "J" },
  { home: "Portugal", away: "Colombia", cest: "2026-06-17 19:00", group: "K" },
  { home: "Uzbekistan", away: "DR Congo", cest: "2026-06-18 00:00", group: "K" },
  { home: "Portugal", away: "Uzbekistan", cest: "2026-06-23 15:00", group: "K" },
  { home: "Colombia", away: "DR Congo", cest: "2026-06-24 00:00", group: "K" },
  { home: "Portugal", away: "DR Congo", cest: "2026-06-27 21:30", group: "K" },
  { home: "Colombia", away: "Uzbekistan", cest: "2026-06-27 21:30", group: "K" },
  { home: "England", away: "Croatia", cest: "2026-06-17 22:00", group: "L" },
  { home: "Ghana", away: "Panama", cest: "2026-06-18 01:00", group: "L" },
  { home: "England", away: "Ghana", cest: "2026-06-23 18:00", group: "L" },
  { home: "Croatia", away: "Panama", cest: "2026-06-23 21:00", group: "L" },
  { home: "England", away: "Panama", cest: "2026-06-27 23:00", group: "L" },
  { home: "Croatia", away: "Ghana", cest: "2026-06-27 23:00", group: "L" },
];

const fixtureEntries = matches.map(m => {
  const utc = cestToUtc(m.cest);
  return `    {
      homeTeam: "${m.home}",
      awayTeam: "${m.away}",
      kickoffTime: new Date("${utc}"),
      stage: "Group Stage (Group ${m.group})",
    }`;
});

const replacement = `  // Future World Cup 2026 fixtures
  const wcFixtures = [
${fixtureEntries.join(',\n')}
  ];`;

let seedContent = fs.readFileSync('prisma/seed.ts', 'utf8');
const regex = /\/\/ Future World Cup 2026 fixtures[\s\S]*?(?=const seededWcFixtures = \[\];)/;
seedContent = seedContent.replace(regex, replacement + "\n\n  ");
fs.writeFileSync('prisma/seed.ts', seedContent);
console.log("seed.ts updated successfully");
