// Chạy: npm test (node:test có sẵn trong Node, không cần thư viện).
import test from "node:test";
import assert from "node:assert/strict";
import * as p from "./protocol.js";

const state = { currentTime: 100, isPlaying: true, rate: 1, sentAt: 10_000 };

test("expectedTime bù độ trễ khi đang phát", () => {
    assert.equal(p.expectedTime(state, 10_800), 100.8);
    assert.equal(p.expectedTime({ ...state, rate: 2 }, 11_000), 102);
});
test("expectedTime không cộng khi đang dừng", () => {
    assert.equal(p.expectedTime({ ...state, isPlaying: false }, 20_000), 100);
});
test("expectedTime chặn trễ âm và trễ quá lớn (lệch đồng hồ)", () => {
    assert.equal(p.expectedTime(state, 9_000), 100);
    assert.equal(p.expectedTime(state, 60_000), 100 + p.MAX_LATENCY_S);
});
test("needsResync theo ngưỡng 1.5s", () => {
    assert.equal(p.needsResync(10, 11.4), false);
    assert.equal(p.needsResync(10, 11.6), true);
    assert.equal(p.needsResync(12, 10), true);
});

const m = (clientId, joinedAt) => ({
    clientId,
    nickname: clientId,
    hue: 1,
    joinedAt,
});
test("pickHost chọn người vào sớm nhất, bỏ qua exclude", () => {
    const list = [m("cccccc", 3), m("aaaaaa", 1), m("bbbbbb", 2)];
    assert.equal(p.pickHost(list), "aaaaaa");
    assert.equal(p.pickHost(list, ["aaaaaa"]), "bbbbbb");
    assert.equal(p.pickHost([]), null);
});
test("pickHost trùng joinedAt thì so clientId (mọi máy cùng kết quả)", () => {
    assert.equal(p.pickHost([m("zzzzzz", 5), m("yyyyyy", 5)]), "yyyyyy");
    assert.equal(p.pickHost([m("yyyyyy", 5), m("zzzzzz", 5)]), "yyyyyy");
});
test("isNewerHost: epoch lớn thắng", () => {
    assert.equal(
        p.isNewerHost({ id: "bbbbbb", epoch: 2 }, { id: "aaaaaa", epoch: 1 }),
        true,
    );
    assert.equal(
        p.isNewerHost({ id: "aaaaaa", epoch: 1 }, { id: "bbbbbb", epoch: 2 }),
        false,
    );
    assert.equal(
        p.isNewerHost({ id: "bbbbbb", epoch: 0 }, { id: null, epoch: 0 }),
        true,
    );
});
test("isNewerHost: cùng epoch thì người vào sớm hơn thắng (người mới vào không cướp host)", () => {
    const members = [m("zzzzzz", 1), m("aaaaaa", 9)];
    // zzzzzz là host thật (vào trước), aaaaaa vào sau, chưa thấy ai nên tự nhận host epoch 1
    assert.equal(
        p.isNewerHost(
            { id: "zzzzzz", epoch: 1 },
            { id: "aaaaaa", epoch: 1 },
            members,
        ),
        true,
    );
    assert.equal(
        p.isNewerHost(
            { id: "aaaaaa", epoch: 1 },
            { id: "zzzzzz", epoch: 1 },
            members,
        ),
        false,
    );
    // không có joinedAt thì so clientId
    assert.equal(
        p.isNewerHost({ id: "aaaaaa", epoch: 1 }, { id: "bbbbbb", epoch: 1 }),
        true,
    );
});
test("membersFromPresence bỏ meta giả mạo/không hợp lệ và sắp theo thứ tự vào", () => {
    const list = p.membersFromPresence({
        bbbbbb: [{ clientId: "bbbbbb", nickname: "B", hue: 10, joinedAt: 2 }],
        aaaaaa: [
            { clientId: "aaaaaa", nickname: " A ", hue: 999, joinedAt: 1 },
        ],
        cccccc: [{ clientId: "aaaaaa", nickname: "fake", joinedAt: 0 }],
        dddddd: [{ clientId: "dddddd", nickname: "", joinedAt: 3 }],
    });
    assert.deepEqual(
        list.map((x) => x.clientId),
        ["aaaaaa", "bbbbbb"],
    );
    assert.equal(list[0].nickname, "A");
    assert.equal(list[0].hue, 359);
});
test("sanitizeState chặn payload sai kiểu / quá lớn", () => {
    const ok = {
        from: "aaaaaa",
        hostId: "aaaaaa",
        epoch: 1,
        movieSlug: "phim-a",
        server: 0,
        episode: "tap-01",
        currentTime: 12,
        isPlaying: true,
        rate: 1,
        allowAll: false,
        sentAt: 1,
    };
    assert.ok(p.sanitizeState(ok));
    assert.equal(p.sanitizeState({ ...ok, rate: 100 }), null);
    assert.equal(p.sanitizeState({ ...ok, currentTime: NaN }), null);
    assert.equal(p.sanitizeState({ ...ok, movieSlug: "../x" }), null);
    assert.equal(p.sanitizeState({ ...ok, junk: "x".repeat(5000) }), null);
    assert.equal(p.sanitizeState("x"), null);
});
test("sanitizeChat làm sạch và cắt độ dài", () => {
    const msg = p.sanitizeChat({
        id: "abcdefgh",
        from: "aaaaaa",
        nickname: "A",
        hue: 1,
        text: "  <img onerror=x>\u202E" + "a".repeat(400),
        sentAt: 1,
    });
    assert.equal(msg.text.length, p.CHAT_MAX_LENGTH);
    assert.ok(!msg.text.includes("\u202E"));
    assert.equal(
        p.sanitizeChat({
            id: "abcdefgh",
            from: "aaaaaa",
            nickname: "A",
            text: "   ",
        }),
        null,
    );
});
test("rate limiter cửa sổ trượt", () => {
    const allow = p.createRateLimiter(2, 1000);
    assert.equal(allow(0), true);
    assert.equal(allow(10), true);
    assert.equal(allow(20), false);
    assert.equal(allow(1001), true);
});
test("nearestRate", () => {
    assert.equal(p.nearestRate(1.1), 1);
    assert.equal(p.nearestRate(1.8), 1.75);
});
