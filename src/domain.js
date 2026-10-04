export const DEFAULT_RULES = { sundayMax: 16, youthMax: 33, seniorMin: 60 };

export function ageOn(birthDate, today = new Date()) {
  const born = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(born.getTime())) return 0;
  let age = today.getFullYear() - born.getFullYear();
  if (
    today.getMonth() < born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() < born.getDate())
  )
    age--;
  return Math.max(0, age);
}

export function groupsFor(member, rules = DEFAULT_RULES, today = new Date()) {
  const age = ageOn(member.dob, today);
  const groups = ["Whole church"];
  if (age <= rules.sundayMax) groups.push("Sunday school");
  else {
    groups.push(member.gender === "Female" ? "Women" : "Men");
    if (age <= rules.youthMax)
      groups.push(
        "Youth",
        member.gender === "Female" ? "Youth women" : "Youth men",
      );
    else if (age < rules.seniorMin)
      groups.push(
        "Middle-aged",
        member.gender === "Female" ? "Middle-aged women" : "Middle-aged men",
      );
  }
  if (age >= rules.seniorMin)
    groups.push(
      "Seniors",
      member.gender === "Female" ? "Senior women" : "Senior men",
    );
  if (member.role.includes("Pastor")) groups.push("Pastors");
  if (member.role === "Committee member") groups.push("Committee members");
  if (["Administrator", "Secretary", "Treasurer"].includes(member.role))
    groups.push("Administrators");
  return groups;
}

export const GROUPS = [
  "Whole church",
  "Sunday school",
  "Youth",
  "Youth men",
  "Youth women",
  "Men",
  "Women",
  "Middle-aged",
  "Middle-aged men",
  "Middle-aged women",
  "Seniors",
  "Senior men",
  "Senior women",
  "Pastors",
  "Committee members",
  "Administrators",
];

export function membersInScope(members, churchIds = []) {
  return members.filter(
    (m) =>
      !churchIds.length ||
      churchIds.some(
        (id) => m.church === id || (m.secondary || []).includes(id),
      ),
  );
}

export function recipientsFor(
  members,
  churchIds,
  groups,
  channel,
  rules = DEFAULT_RULES,
) {
  const matching = membersInScope(members, churchIds).filter(
    (m) =>
      m.status === "Active" &&
      m.phone &&
      m.consent?.[channel] &&
      (!groups.length ||
        groups.some((group) => groupsFor(m, rules).includes(group))),
  );
  return [...new Map(matching.map((m) => [m.id, m])).values()];
}

export function membershipConflict(members, church, number, excludeId) {
  if (!number?.trim()) return false;
  return members.some(
    (m) =>
      m.id !== excludeId &&
      m.church === church &&
      m.sandhai?.trim().toLowerCase() === number.trim().toLowerCase(),
  );
}

export function nextSandhai(members, church) {
  let n = 1;
  while (membershipConflict(members, church, String(n).padStart(4, "0"))) n++;
  return String(n).padStart(4, "0");
}

export function nextOccurrence(dateString, today = new Date()) {
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const source = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(source.getTime())) return null;
  const occurrence = (year) => {
    const day = Math.min(
      source.getDate(),
      new Date(year, source.getMonth() + 1, 0).getDate(),
    );
    return new Date(year, source.getMonth(), day);
  };
  let next = occurrence(start.getFullYear());
  if (next < start) next = occurrence(start.getFullYear() + 1);
  return { date: next, days: Math.round((next - start) / 86400000) };
}

export function celebrationsFor(members, today = new Date()) {
  return members
    .filter((m) => m.status === "Active")
    .flatMap((m) =>
      ["dob", "anniversary"].flatMap((key) => {
        if (!m[key]) return [];
        const event = nextOccurrence(m[key], today);
        return event
          ? [
              {
                ...event,
                member: m,
                type: key === "dob" ? "Birthday" : "Wedding anniversary",
              },
            ]
          : [];
      }),
    )
    .sort(
      (a, b) => a.days - b.days || a.member.name.localeCompare(b.member.name),
    );
}

export const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
export const initials = (name) =>
  name
    .replace(/^(Rev\.|Dr\.)\s*/, "")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
export const uid = () => globalThis.crypto.randomUUID();
