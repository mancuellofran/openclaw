import { describe, expect, it } from "vitest";
import { resolveNodeCommandAllowlist } from "./node-command-policy.js";

describe("resolveNodeCommandAllowlist", () => {
  it("includes iOS service commands by default", () => {
    const allow = resolveNodeCommandAllowlist(
      {},
      {
        platform: "ios 26.0",
        deviceFamily: "iPhone",
      },
    );

    expect(allow.has("device.info")).toBe(true);
    expect(allow.has("device.status")).toBe(true);
    expect(allow.has("system.notify")).toBe(true);
    expect(allow.has("contacts.search")).toBe(true);
    expect(allow.has("calendar.events")).toBe(true);
    expect(allow.has("reminders.list")).toBe(true);
    expect(allow.has("photos.latest")).toBe(true);
    expect(allow.has("motion.activity")).toBe(true);
  });

  it("applies denyCommands as exact removals", () => {
    const allow = resolveNodeCommandAllowlist(
      {
        gateway: {
          nodes: {
            denyCommands: ["camera.snap", "screen.record"],
          },
        },
      },
      { platform: "ios", deviceFamily: "iPhone" },
    );
    expect(allow.has("camera.snap")).toBe(false);
    expect(allow.has("screen.record")).toBe(false);
    expect(allow.has("camera.clip")).toBe(true);
  });
});
