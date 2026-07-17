import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const root = new URL("../", import.meta.url);

function read(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("family members expose aliases without a public name field", () => {
  const data = read("src/app/[locale]/(site)/heartbeats/family.data.ts");
  const client = read("src/app/[locale]/(site)/heartbeats/HeartbeatsClient.tsx");
  const entries = [...data.matchAll(/id: 'm\d+', alias: '([^']+)'/g)];

  assert.ok(entries.length > 0, "expected family member entries");
  assert.doesNotMatch(data, /\bname:/);
  assert.doesNotMatch(data, /\bname: string/);
  assert.doesNotMatch(client, /person\.name/);
});

test("family member birthdates keep their original month and day", () => {
  const data = read("src/app/[locale]/(site)/heartbeats/family.data.ts");
  const expected = new Map([
    ["m01", "1997-07-01"],
    ["m02", "2005-06-09"],
    ["m03", "1976-11-18"],
    ["m04", "1976-02-19"],
    ["m05", "1983-03-02"],
    ["m06", "1939-04-20"],
    ["m07", "1944-05-02"],
    ["m08", "1946-04-02"],
  ]);

  for (const [id, dob] of expected) {
    assert.match(data, new RegExp(`id: '${id}'.*dob: '${dob}'`));
  }

  assert.doesNotMatch(data, /dob: '\\d{4}-01-01'/);
});

test("heartbeats renders as a daily dashboard without the old aurora shell", () => {
  const client = read("src/app/[locale]/(site)/heartbeats/HeartbeatsClient.tsx");
  const css = read("src/app/[locale]/(site)/heartbeats/heartbeats.css");

  assert.match(client, /className="heartbeats-focus"/);
  assert.match(client, /className="heartbeats-overview"/);
  assert.match(client, /className="heartbeats-workspace"/);
  assert.match(css, /conic-gradient\(var\(--hb-warm\)/);
  assert.match(css, /\.heartbeats-field/);
  assert.doesNotMatch(client, /heartbeats-aurora/);
  assert.doesNotMatch(css, /aurora-blob/);
});

test("heartbeats birthday countdown is calculated by date, not current hour", () => {
  const client = read("src/app/[locale]/(site)/heartbeats/HeartbeatsClient.tsx");

  assert.match(client, /const today = now\.startOf\('day'\)/);
  assert.match(
    client,
    /const nextBirthday = thisYearBirthday\.isBefore\(today\)\s+\? thisYearBirthday\.add\(1, 'year'\)\s+: thisYearBirthday/,
  );
  assert.match(client, /daysUntilBirthday: nextBirthday\.diff\(today, 'day'\)/);
});

test("heartbeats copy stays positive and avoids life-countdown framing", () => {
  const client = read("src/app/[locale]/(site)/heartbeats/HeartbeatsClient.tsx");

  assert.match(client, /chuẩn bị một lời nhắn đúng lúc/);
  assert.match(client, /dịp gia đình quan\s+trọng/);
  assert.match(client, /Mốc kỷ niệm/);
  assert.doesNotMatch(client, /đếm từng giây/);
  assert.doesNotMatch(client, /Tổng ngày sống/);
  assert.doesNotMatch(client, /thời gian\s+đã đi qua bao lâu/);
  assert.doesNotMatch(client, /ngày đã đi qua cùng nhau/);
});
