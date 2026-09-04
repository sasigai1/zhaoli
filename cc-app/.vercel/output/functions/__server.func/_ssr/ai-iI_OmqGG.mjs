import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as colorForType, n as EVENT_TYPES } from "./types-DkEh41EK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-iI_OmqGG.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asType(value) {
	return EVENT_TYPES.includes(value) ? value : "other";
}
function asTime(value) {
	if (typeof value !== "string") return null;
	const m = value.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
	return m ? `${m[1]}:${m[2]}` : null;
}
function asDate(value, fallback) {
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
	return fallback;
}
function asReminder(value) {
	const n = typeof value === "number" ? value : Number(value);
	return [
		0,
		5,
		10,
		15,
		30,
		60,
		120,
		1440
	].includes(n) ? n : 15;
}
function normalizeEvents(raw, todayISO) {
	const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray(raw.events) ? raw.events : [];
	const drafts = [];
	for (const item of list) {
		if (!item || typeof item !== "object") continue;
		const row = item;
		const title = String(row.title ?? "").trim();
		if (!title) continue;
		const type = asType(row.type);
		const startTime = asTime(row.startTime);
		const endTime = asTime(row.endTime);
		const allDay = Boolean(row.allDay) || !startTime;
		drafts.push({
			title: title.slice(0, 80),
			notes: String(row.notes ?? "").slice(0, 400),
			date: asDate(row.date, todayISO),
			startTime: allDay ? null : startTime,
			endTime: allDay ? null : endTime,
			allDay,
			type,
			color: colorForType(type),
			reminderMinutes: allDay ? null : asReminder(row.reminderMinutes ?? 15)
		});
	}
	return drafts;
}
function extractJson(text) {
	const body = (text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? text).trim();
	const start = body.indexOf("{") >= 0 && (body.indexOf("[") < 0 || body.indexOf("{") < body.indexOf("[")) ? body.indexOf("{") : body.indexOf("[");
	const jsonText = start >= 0 ? body.slice(start) : body;
	return JSON.parse(jsonText);
}
var parseScheduleAi_createServerFn_handler = createServerRpc({
	id: "b26ba2ae128dd7caebc18bdab0fef3437e6559933975d69fbdd1ce6af7af79a5",
	name: "parseScheduleAi",
	filename: "src/lib/schedule/ai.ts"
}, (opts) => parseScheduleAi.__executeServer(opts));
var parseScheduleAi = createServerFn({ method: "POST" }).validator((input) => input).handler(parseScheduleAi_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const system = `你是日程解析器。把用户的一句话拆成一条或多条日程。只返回 JSON：
{"events":[{"title":"短标题","date":"YYYY-MM-DD","startTime":"HH:mm或null","endTime":"HH:mm或null","allDay":true/false,"type":"work|personal|health|study|social|focus|rest|other","notes":"","reminderMinutes":15}]}
规则：
- 今天是 ${data.todayISO} ${data.weekday}，按公历换算「明天 / 后天 / 周几 / x月x日」。
- 没说钟点但提到上午/下午/晚上/早上 → 分别记 09:00 / 14:00 / 20:00 / 07:30，allDay=false。
- 完全没说时段 → allDay=true，startTime=null。
- 一句话里多件事必须拆开，不要合并成一条。
- title 去掉日期时间词，保留事件本身。
- 不要发明用户没提到的事项。
- reminderMinutes 仅可选 0,5,10,15,30,60,120,1440。`;
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: .2,
				max_tokens: 900,
				messages: [{
					role: "system",
					content: system
				}, {
					role: "user",
					content: data.text.slice(0, 800)
				}]
			})
		});
		if (!res.ok) return {
			ok: false,
			error: `xAI ${res.status}`
		};
		const content = (await res.json()).choices?.[0]?.message?.content ?? "";
		let parsed;
		try {
			parsed = extractJson(content);
		} catch {
			return {
				ok: false,
				error: "parse"
			};
		}
		const events = normalizeEvents(parsed, data.todayISO);
		if (events.length === 0) return {
			ok: false,
			error: "empty"
		};
		return {
			ok: true,
			events
		};
	} catch {
		return {
			ok: false,
			error: "network"
		};
	}
});
var briefTodayAi_createServerFn_handler = createServerRpc({
	id: "a935454a2dba8eb4bce6823cbca089233751a581002ec55226bdf4f0c4f29d30",
	name: "briefTodayAi",
	filename: "src/lib/schedule/ai.ts"
}, (opts) => briefTodayAi.__executeServer(opts));
var briefTodayAi = createServerFn({ method: "POST" }).validator((input) => input).handler(briefTodayAi_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	if (data.events.length === 0) return {
		ok: true,
		text: "今天没有写下任何安排。留白也可以是一种节奏。"
	};
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: .4,
				max_tokens: 280,
				messages: [{
					role: "system",
					content: "你是克制的日程助手。用简体中文写不超过 80 字的今日简报：先点出节奏（忙/松/偏某类），再给一句可执行的提醒。不要列表，不要表情符号，不要鸡汤。"
				}, {
					role: "user",
					content: `${data.todayISO} 的安排：${JSON.stringify(data.events)}`
				}]
			})
		});
		if (!res.ok) return {
			ok: false,
			error: `xAI ${res.status}`
		};
		const text = ((await res.json()).choices?.[0]?.message?.content ?? "").trim();
		if (!text) return {
			ok: false,
			error: "empty"
		};
		return {
			ok: true,
			text
		};
	} catch {
		return {
			ok: false,
			error: "network"
		};
	}
});
//#endregion
export { briefTodayAi_createServerFn_handler, parseScheduleAi_createServerFn_handler };
