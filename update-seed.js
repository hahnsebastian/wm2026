const fs = require('fs');

const matchesData = `
M1: Mexico vs South Korea
M2: South Africa vs Czechia
M3: Mexico vs South Africa
M4: South Korea vs Czechia
M5: Mexico vs Czechia
M6: South Korea vs South Africa
M7: Canada vs Bosnia and Herzegovina
M8: Qatar vs Switzerland
M9: Canada vs Qatar
M10: Bosnia and Herzegovina vs Switzerland
M11: Canada vs Switzerland
M12: Bosnia and Herzegovina vs Qatar
M13: Brazil vs Morocco
M14: Haiti vs Scotland
M15: Brazil vs Haiti
M16: Morocco vs Scotland
M17: Brazil vs Scotland
M18: Morocco vs Haiti
M19: United States vs Paraguay
M20: Australia vs Türkiye
M21: United States vs Australia
M22: Paraguay vs Türkiye
M23: United States vs Türkiye
M24: Paraguay vs Australia
M25: Germany vs Côte d'Ivoire
M26: Ecuador vs Curaçao
M27: Germany vs Ecuador
M28: Côte d'Ivoire vs Curaçao
M29: Germany vs Curaçao
M30: Côte d'Ivoire vs Ecuador
M31: Argentina vs Spain
M32: Ukraine vs Zambia
M33: Argentina vs Ukraine
M34: Spain vs Zambia
M35: Argentina vs Zambia
M36: Spain vs Ukraine
M37: France vs Tunisia
M38: Honduras vs Denmark
M39: France vs Honduras
M40: Tunisia vs Denmark
M41: France vs Denmark
M42: Tunisia vs Honduras
M43: Belgium vs Algeria
M44: Panama vs Wales
M45: Belgium vs Panama
M46: Algeria vs Wales
M47: Belgium vs Wales
M48: Algeria vs Panama
M49: Netherlands vs Senegal
M50: Costa Rica vs Serbia
M51: Netherlands vs Costa Rica
M52: Senegal vs Serbia
M53: Netherlands vs Serbia
M54: Senegal vs Costa Rica
M55: Portugal vs Mali
M56: Jamaica vs Romania
M57: Portugal vs Jamaica
M58: Mali vs Romania
M59: Portugal vs Romania
M60: Mali vs Jamaica
M61: Italy vs Nigeria
M62: New Zealand vs Poland
M63: Italy vs New Zealand
M64: Nigeria vs Poland
M65: Italy vs Poland
M66: Nigeria vs New Zealand
M67: Colombia vs Egypt
M68: El Salvador vs Japan
M69: Colombia vs El Salvador
M70: Egypt vs Japan
M71: Colombia vs Japan
M72: Egypt vs El Salvador
`;

const lines = matchesData.trim().split('\n');
const wcFixtures = lines.map((line, index) => {
  // e.g., M1: Mexico vs South Korea
  const match = line.match(/M\d+:\s+(.+?)\s+vs\s+(.+)/);
  if (!match) return null;
  const home = match[1].trim();
  const away = match[2].trim();
  
  // Create a realistic date: start at June 11, 2026, add 4 hours per match
  const kickoff = new Date(new Date("2026-06-11T12:00:00Z").getTime() + index * 4 * 60 * 60 * 1000);
  
  // Group logic (every 6 matches is a group A-L)
  const groupIndex = Math.floor(index / 6);
  const groupChar = String.fromCharCode(65 + groupIndex);

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

// The original seed.ts has:
//   // Future World Cup 2026 fixtures
//   const wcFixtures = [ ... ];
// We will replace this section. We can use a regex to match from "  // Future World Cup 2026 fixtures" up to "  const seededWcFixtures = [];"

const regex = /\/\/ Future World Cup 2026 fixtures[\s\S]*?(?=const seededWcFixtures = \[\];)/;
seedContent = seedContent.replace(regex, replacement + "\n\n  ");

fs.writeFileSync('prisma/seed.ts', seedContent);
console.log("Successfully updated prisma/seed.ts");
