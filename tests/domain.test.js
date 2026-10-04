import test from "node:test";
import assert from "node:assert/strict";
import {
  ageOn,
  groupsFor,
  membersInScope,
  recipientsFor,
  membershipConflict,
  nextSandhai,
  nextOccurrence,
  celebrationsFor,
} from "../src/domain.js";

const today = new Date(2026, 9, 3);
const member = {
  id: "one",
  name: "Demo Member",
  church: "mng",
  secondary: ["sol"],
  dob: "2004-10-03",
  gender: "Male",
  role: "Member",
  status: "Active",
  phone: "+91 90000 00000",
  sandhai: "A-01",
  consent: { whatsapp: true, sms: false },
};

test("age changes on the birthday, not at the start of the year", () => {
  assert.equal(ageOn("2004-10-03", today), 22);
  assert.equal(ageOn("2004-10-04", today), 21);
});

test("fellowships overlap and configurable age boundaries have no gaps", () => {
  assert.deepEqual(groupsFor(member, undefined, today), [
    "Whole church",
    "Men",
    "Youth",
    "Youth men",
  ]);
  assert.ok(
    groupsFor({ ...member, dob: "2010-10-03" }, undefined, today).includes(
      "Sunday school",
    ),
  );
  assert.ok(
    groupsFor({ ...member, dob: "2009-10-03" }, undefined, today).includes(
      "Youth",
    ),
  );
  assert.ok(
    groupsFor({ ...member, dob: "1992-10-03" }, undefined, today).includes(
      "Middle-aged",
    ),
  );
  assert.ok(
    groupsFor({ ...member, dob: "1966-10-03" }, undefined, today).includes(
      "Seniors",
    ),
  );
  assert.ok(
    groupsFor(
      member,
      { sundayMax: 12, youthMax: 20, seniorMin: 55 },
      today,
    ).includes("Middle-aged"),
  );
});

test("a secondary church association is included in audience scope", () => {
  assert.equal(membersInScope([member], ["sol"]).length, 1);
  assert.equal(membersInScope([member], ["sri"]).length, 0);
});

test("audiences deduplicate across churches and overlapping groups", () => {
  assert.equal(
    recipientsFor([member], ["mng", "sol"], ["Men", "Youth"], "whatsapp")
      .length,
    1,
  );
});

test("messages exclude pending, archived, missing-contact, and non-consenting members", () => {
  const records = [
    member,
    { ...member, id: "pending", status: "Pending" },
    { ...member, id: "archived", status: "Archived" },
    { ...member, id: "no-phone", phone: "" },
    { ...member, id: "no-consent", consent: { whatsapp: false } },
  ];
  assert.deepEqual(
    recipientsFor(records, [], [], "whatsapp").map((m) => m.id),
    ["one"],
  );
  assert.equal(recipientsFor([member], [], [], "sms").length, 0);
});

test("Sandhai numbers are case-insensitive within a church and reusable across churches", () => {
  assert.equal(membershipConflict([member], "mng", " a-01 "), true);
  assert.equal(membershipConflict([member], "sol", "A-01"), false);
  assert.equal(membershipConflict([member], "mng", "A-01", "one"), false);
});

test("new Sandhai numbers skip existing and archived numbers", () => {
  const records = [
    { ...member, sandhai: "0001" },
    { ...member, id: "two", sandhai: "0002", status: "Archived" },
  ];
  assert.equal(nextSandhai(records, "mng"), "0003");
  assert.equal(nextSandhai(records, "sol"), "0001");
});

test("celebrations roll over the year and observe leap birthdays on February 28", () => {
  assert.equal(nextOccurrence("2000-10-03", today).days, 0);
  assert.equal(nextOccurrence("2000-01-01", new Date(2026, 11, 31)).days, 1);
  const leap = nextOccurrence("2000-02-29", new Date(2026, 1, 27));
  assert.equal(leap.date.getMonth(), 1);
  assert.equal(leap.date.getDate(), 28);
  assert.equal(leap.days, 1);
});

test("celebrations only contain active members and are ordered by next occurrence", () => {
  const records = [
    member,
    { ...member, id: "tomorrow", dob: "2000-10-04", anniversary: "2020-10-03" },
    { ...member, id: "archived", status: "Archived" },
  ];
  const events = celebrationsFor(records, today);
  assert.equal(events.length, 3);
  assert.deepEqual(
    events.map((e) => e.days),
    [0, 0, 1],
  );
  assert.equal(
    events.filter((e) => e.type === "Wedding anniversary").length,
    1,
  );
});
