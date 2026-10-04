import { DEFAULT_RULES } from "./domain.js";

export const CHURCHES = [
  {
    id: "mng",
    code: "MAN",
    name: "St. John’s Church, MA Nagar",
    place: "MA Nagar",
    type: "Pastorate church",
    pastor: "Rev. Samuel David",
    color: "green",
    established: 1962,
  },
  {
    id: "sol",
    code: "SHO",
    name: "CSI Church, Sholavaram",
    place: "Sholavaram",
    type: "Branch church",
    pastor: "Rev. Peter Raj",
    color: "blue",
    established: 1978,
  },
  {
    id: "sri",
    code: "LAR",
    name: "CSI Church, Laranodai",
    place: "Laranodai",
    type: "Branch church",
    pastor: "Rev. Isaac Joseph",
    color: "purple",
    established: 1985,
  },
  {
    id: "kpd",
    code: "SIR",
    name: "CSI Church, Siruniyam",
    place: "Siruniyam",
    type: "Branch church",
    pastor: "Rev. Thomas Paul",
    color: "orange",
    established: 1994,
  },
];
export const churchById = (id) =>
  CHURCHES.find((c) => c.id === id) || CHURCHES[0];
const firstNames = [
  "Daniel",
  "Rebecca",
  "Samuel",
  "Esther",
  "Joshua",
  "Mary",
  "David",
  "Ruth",
  "John",
  "Rachel",
  "Andrew",
  "Hannah",
  "Peter",
  "Grace",
  "Joseph",
  "Sarah",
  "Benjamin",
  "Lydia",
  "Isaac",
  "Naomi",
  "Aaron",
  "Deborah",
  "Joel",
  "Miriam",
  "Philip",
  "Abigail",
  "Caleb",
  "Joanna",
  "Nathan",
  "Elizabeth",
  "Thomas",
];
const lastNames = [
  "Selvaraj",
  "Samuel",
  "David",
  "Raj",
  "Joseph",
  "Arul",
  "Prakash",
  "Daniel",
];
const localDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function createSeed() {
  const now = new Date();
  const today = localDate(now);
  const members = Array.from({ length: 248 }, (_, i) => {
    const birth = new Date(
      now.getFullYear() - (8 + ((i * 7) % 71)),
      (i * 5 + 1) % 12,
      ((i * 3 + 4) % 27) + 1,
    );
    const church = CHURCHES[i % 4].id;
    return {
      id: `member-${i + 1}`,
      name: `${firstNames[i % 31]} ${lastNames[Math.floor(i / 31)]}`,
      church,
      secondary: i % 19 === 0 ? [CHURCHES[(i + 1) % 4].id] : [],
      gender: i % 2 ? "Female" : "Male",
      dob: localDate(birth),
      anniversary:
        i % 7 === 0 && 8 + ((i * 7) % 71) > 25
          ? `${now.getFullYear() - 12}-10-${String((i % 27) + 1).padStart(2, "0")}`
          : "",
      phone: `+91 90000 ${String(10000 + i)}`,
      email: `${firstNames[i % 31].toLowerCase()}.${i + 1}@example.com`,
      address: `${i + 1}, Church Street, ${churchById(church).place}, Tamil Nadu`,
      sandhai: String(Math.floor(i / 4) + 1).padStart(4, "0"),
      status: "Active",
      role: i < 4 ? "Pastor" : i < 12 ? "Committee member" : "Member",
      joined: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.min(now.getDate(), (i % 27) + 1)).padStart(2, "0")}`,
      consent: { whatsapp: i % 9 !== 0, sms: i % 13 !== 0 },
    };
  });
  members[0] = {
    ...members[0],
    name: "Daniel Selvaraj",
    dob: "1987-05-14",
    role: "Secretary",
    consent: { whatsapp: true, sms: true },
  };
  const celebrations = [
    ["Rebecca Samuel", 0, 28],
    ["Joshua David", 1, 24],
    ["Esther & Samuel Raj", 2, 44],
    ["Mary Joseph", 3, 62],
    ["Aaron Prakash", 5, 17],
  ];
  celebrations.forEach(([name, days, age], idx) => {
    const event = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + days,
    );
    const date = localDate(
      new Date(event.getFullYear() - age, event.getMonth(), event.getDate()),
    );
    members[20 + idx] = {
      ...members[20 + idx],
      name,
      gender: idx % 2 ? "Male" : "Female",
      ...(idx === 2
        ? { anniversary: date, dob: "1982-06-10" }
        : { dob: date, anniversary: "" }),
    };
  });
  [
    "Anita Grace",
    "Stephen Peter",
    "Christina Paul",
    "Joel Immanuel",
    "Lydia Arul",
  ].forEach((name, i) =>
    members.push({
      id: `pending-${i}`,
      name,
      church: CHURCHES[i % 4].id,
      secondary: [],
      gender: i % 2 ? "Male" : "Female",
      dob: `${1995 + i}-03-12`,
      anniversary: "",
      phone: `+91 90000 2000${i}`,
      email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      address: "Tamil Nadu",
      sandhai: i === 1 ? "A-108" : "",
      status: "Pending",
      role: "Member",
      joined: today,
      consent: { whatsapp: true, sms: true },
    }),
  );
  return {
    version: 1,
    members,
    rules: DEFAULT_RULES,
    notices: [
      {
        id: "notice-1",
        title: "A Sunday to come together",
        description:
          "Join our pastorate-wide harvest thanksgiving service. Bring your family as we gather in gratitude, worship, and fellowship.",
        church: "all",
        category: "Worship",
        date: today,
        author: "Rev. Joseph Paul",
        pinned: true,
        event: "Sunday · 8:30 AM",
        location: "St. John’s Church, MA Nagar",
      },
      {
        id: "notice-2",
        title: "Little hearts, big faith",
        description:
          "Sunday school registration is open! A new season of stories, songs, and growing together begins this month.",
        church: "mng",
        category: "Sunday school",
        date: today,
        author: "Rebecca Samuel",
        event: "Sundays · 10:30 AM",
        location: "Parish hall",
      },
      {
        id: "notice-3",
        title: "Youth fellowship evening",
        description:
          "An evening of music, meaningful conversations, and a shared meal. All young people across our churches are welcome.",
        church: "all",
        category: "Fellowship",
        date: today,
        author: "Joshua David",
        event: "Saturday · 6:00 PM",
        location: "CSI Church, Sholavaram",
      },
    ],
    campaigns: [
      {
        id: "roof",
        title: "A stronger roof. A lasting home.",
        description:
          "Help restore the roof of CSI Church, Sholavaram and keep our place of worship safe for generations to come.",
        church: "sol",
        goal: 250000,
        pledged: 185000,
        category: "Church restoration",
        color: "green",
      },
      {
        id: "school",
        title: "Give a child a brighter start",
        description:
          "School supplies and learning support for 40 children in our community.",
        church: "mng",
        goal: 100000,
        pledged: 76000,
        category: "Community care",
        color: "orange",
      },
      {
        id: "outreach",
        title: "A little care goes a long way",
        description:
          "Monthly essentials and warm meals for our senior members and neighbors.",
        church: "sri",
        goal: 50000,
        pledged: 38000,
        category: "Outreach",
        color: "purple",
      },
    ],
    donations: [
      {
        id: "donation-1",
        campaign: "roof",
        donor: "Daniel Selvaraj",
        amount: 55000,
        method: "Online demo",
        date: today,
      },
      {
        id: "donation-2",
        campaign: "roof",
        donor: "Sunday offering",
        amount: 37500,
        method: "Cash",
        date: today,
      },
      {
        id: "donation-3",
        campaign: "school",
        donor: "Women’s fellowship",
        amount: 25000,
        method: "Cash",
        date: today,
      },
      {
        id: "donation-4",
        campaign: "school",
        donor: "Rebecca Samuel",
        amount: 16000,
        method: "Online demo",
        date: today,
      },
      {
        id: "donation-5",
        campaign: "outreach",
        donor: "Anonymous",
        amount: 15000,
        method: "Online demo",
        date: today,
      },
    ],
    prayers: [
      {
        id: "prayer-1",
        name: "Mary Joseph",
        church: "mng",
        category: "Healing",
        message:
          "Please pray for my mother as she recovers from surgery, and for strength and peace for our family.",
        status: "New",
        date: today,
        private: true,
      },
      {
        id: "prayer-2",
        name: "Andrew Raj",
        church: "sol",
        category: "Family",
        message:
          "Remember our family as we move to a new home and begin a new chapter together.",
        status: "Praying",
        date: today,
        private: false,
      },
      {
        id: "prayer-3",
        name: "Hannah David",
        church: "sri",
        category: "Guidance",
        message:
          "Pray for wisdom and clarity as I prepare for my final examinations.",
        status: "New",
        date: today,
        private: true,
      },
    ],
    messages: [
      {
        id: "message-1",
        title: "Sunday service reminder",
        body: "Dear church family, join us this Sunday at 8:30 AM for our harvest thanksgiving service. We look forward to worshipping together.",
        channel: "whatsapp",
        churches: [],
        groups: ["Whole church"],
        count: 218,
        status: "Demo completed",
        date: today,
      },
      {
        id: "message-2",
        title: "Youth fellowship · This Saturday",
        body: "An evening of music and fellowship awaits! See you at CSI Church, Sholavaram this Saturday at 6 PM.",
        channel: "sms",
        churches: ["sol"],
        groups: ["Youth"],
        count: 18,
        status: "Draft",
        date: today,
      },
    ],
    activity: [
      {
        id: "activity-1",
        title: "Welcome to your connected community",
        detail: "Your pastorate workspace is ready to explore.",
        date: today,
      },
    ],
    settings: {
      birthdayWishes: true,
      anniversaryWishes: true,
      wishTime: "07:00",
      pastorate: "M. A Nagar Pastorate",
      diocese: "CSI Diocese",
    },
  };
}
