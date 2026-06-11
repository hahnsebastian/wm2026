const fs = require('fs');

const matchesData = `
M1,Mexico,South Korea
M2,South Africa,Czechia
M3,Mexico,South Africa
M4,South Korea,Czechia
M5,Mexico,Czechia
M6,South Korea,South Africa
M7,Canada,Bosnia and Herzegovina
M8,Qatar,Switzerland
M9,Canada,Qatar
M10,Bosnia and Herzegovina,Switzerland
M11,Canada,Switzerland
M12,Bosnia and Herzegovina,Qatar
M13,Brazil,Morocco
M14,Haiti,Scotland
M15,Brazil,Haiti
M16,Morocco,Scotland
M17,Brazil,Scotland
M18,Morocco,Haiti
M19,United States,Paraguay
M20,Australia,Türkiye
M21,United States,Australia
M22,Paraguay,Türkiye
M23,United States,Türkiye
M24,Paraguay,Australia
M25,Germany,Côte d'Ivoire
M26,Ecuador,Curaçao
M27,Germany,Ecuador
M28,Côte d'Ivoire,Curaçao
M29,Germany,Curaçao
M30,Côte d'Ivoire,Ecuador
M31,Netherlands,Japan
M32,Sweden,Tunisia
M33,Netherlands,Sweden
M34,Japan,Tunisia
M35,Netherlands,Tunisia
M36,Japan,Sweden
M37,Belgium,Egypt
M38,Iran,New Zealand
M39,Belgium,Iran
M40,Egypt,New Zealand
M41,Belgium,New Zealand
M42,Egypt,Iran
M43,Spain,Uruguay
M44,Saudi Arabia,Cape Verde
M45,Spain,Saudi Arabia
M46,Uruguay,Cape Verde
M47,Spain,Cape Verde
M48,Uruguay,Saudi Arabia
M49,France,Senegal
M50,Norway,Iraq
M51,France,Norway
M52,Senegal,Iraq
M53,France,Iraq
M54,Senegal,Norway
M55,Argentina,Algeria
M56,Austria,Jordan
M57,Argentina,Austria
M58,Algeria,Jordan
M59,Argentina,Jordan
M60,Algeria,Austria
M61,Portugal,Colombia
M62,Uzbekistan,DR Congo
M63,Portugal,Uzbekistan
M64,Colombia,DR Congo
M65,Portugal,DR Congo
M66,Colombia,Uzbekistan
M67,England,Croatia
M68,Ghana,Panama
M69,England,Ghana
M70,Croatia,Panama
M71,England,Panama
M72,Croatia,Ghana
`;

const lines = matchesData.trim().split('\n');
const wcFixtures = lines.map((line, index) => {
  const parts = line.split(',');
  if (parts.length !== 3) return null;
  const matchId = parts[0];
  const home = parts[1].trim();
  const away = parts[2].trim();
  
  // Kickoff base time: June 11, 2026, add 4 hours per match
  const kickoff = new Date(new Date("2026-06-11T12:00:00Z").getTime() + index * 4 * 60 * 60 * 1000);
  
  const groupIndex = Math.floor(index / 6);
  const groupChar = String.fromCharCode(65 + groupIndex); // Group A through L

  return `    {
      homeTeam: "${home}",
      awayTeam: "${away}",
      kickoffTime: new Date("${kickoff.toISOString()}"),
      stage: "Group Stage (Group ${groupChar})",
    }`;
}).filter(Boolean);

const replacement = `  // Future World Cup 2026 fixtures
  const wcFixtures = [
${wcFixtures.join(',\n')}
  ];`;

let seedContent = fs.readFileSync('prisma/seed.ts', 'utf8');

// Replace everything between "// Future World Cup 2026 fixtures" and "const seededWcFixtures = [];"
const regex = /\/\/ Future World Cup 2026 fixtures[\s\S]*?(?=const seededWcFixtures = \[\];)/;
seedContent = seedContent.replace(regex, replacement + "\n\n  ");

fs.writeFileSync('prisma/seed.ts', seedContent);
console.log("Successfully updated prisma/seed.ts");
