import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "../server.js";
import { z } from "zod";
//#region node_modules/@tanstack/start-server-core/dist/esm/createServerRpc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/ai.ts?tss-serverfn-split
var KindSchema = z.enum([
	"work",
	"life",
	"focus",
	"rest"
]);
var ParsedEventSchema = z.object({
	title: z.string().min(1).max(80),
	start: z.string().min(1),
	end: z.string().min(1),
	allDay: z.boolean().optional(),
	kind: KindSchema,
	reminderMinutes: z.number().int().nullable().optional(),
	location: z.string().nullable().optional(),
	notes: z.string().nullable().optional()
});
var ParseResultSchema = z.object({
	events: z.array(ParsedEventSchema).min(1).max(8),
	reply: z.string().min(1).max(120)
});
var BriefResultSchema = z.object({
	headline: z.string().min(1).max(20),
	body: z.string().min(1).max(180),
	energy: z.enum([
		"light",
		"steady",
		"full"
	])
});
var SculptMoveSchema = z.object({
	id: z.string(),
	title: z.string(),
	newStart: z.string(),
	newEnd: z.string(),
	reason: z.string().max(80)
});
var SculptResultSchema = z.object({
	summary: z.string().min(1).max(160),
	moves: z.array(SculptMoveSchema).max(8)
});
async function chat(system, user, maxTokens) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "书记此刻不在。请稍后再试，或改用手写。"
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .25,
			max_tokens: maxTokens,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `书记未能落笔（${res.status}）`
	};
	const text = (await res.json()).choices?.[0]?.message?.content ?? "";
	if (!text.trim()) return {
		ok: false,
		error: "书记没有写出内容。"
	};
	return {
		ok: true,
		text
	};
}
function extractJson(text) {
	const trimmed = text.trim();
	const raw = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? trimmed;
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start === -1 || end === -1) throw new Error("no-json");
	return JSON.parse(raw.slice(start, end + 1));
}
var ParseInput = z.object({
	text: z.string().min(1).max(500),
	nowIso: z.string(),
	timeZone: z.string(),
	selectedDate: z.string(),
	defaultReminder: z.number().nullable()
});
var parseSchedule_createServerFn_handler = createServerRpc({
	id: "c9a2a8338cb76306fa056f0980e70f0018c1f5c5bf06d51ff7195615fe81d514",
	name: "parseSchedule",
	filename: "src/lib/ai.ts"
}, (opts) => parseSchedule.__executeServer(opts));
var parseSchedule = createServerFn({ method: "POST" }).validator((input) => ParseInput.parse(input)).handler(parseSchedule_createServerFn_handler, async ({ data }) => {
	const result = await chat(`你是「素笺」的日程书记。把用户的一句话整理成结构化日程。
只输出 JSON，不要 markdown，不要解释。
形状：
{"events":[{"title":"","start":"ISO8601","end":"ISO8601","allDay":false,"kind":"work|life|focus|rest","reminderMinutes":15,"location":null,"notes":null}],"reply":"一句短确认"}
规则：
- 当前时间：${data.nowIso}；时区：${data.timeZone}；界面选中的日期：${data.selectedDate}
- 没说时长，默认 60 分钟；全天事项 allDay=true，start 当天 00:00，end 当天 23:59
- 没说提醒，reminderMinutes=${data.defaultReminder}
- 相对时间（十分钟后、今晚、下周）按当前时间理解
- 若只给了钟点没给日期，落在选中日期
- kind：会议/工作/邮件=work；家人/出行/用餐/就医=life；写作/学习/深度=focus；休息/散步/睡眠=rest
- 标题短、像写在纸上的一行字，不要加引号
- 最多 8 件事`, data.text, 700);
	if (!result.ok) return result;
	try {
		const parsed = ParseResultSchema.parse(extractJson(result.text));
		return {
			ok: true,
			reply: parsed.reply,
			events: parsed.events.map((event) => ({
				title: event.title.trim(),
				start: event.start,
				end: event.end,
				allDay: event.allDay ?? false,
				kind: event.kind,
				reminderMinutes: event.reminderMinutes ?? data.defaultReminder,
				location: event.location ?? "",
				notes: event.notes ?? ""
			}))
		};
	} catch {
		return {
			ok: false,
			error: "没能读懂，请换一种更具体的说法。"
		};
	}
});
var BriefInput = z.object({
	nowIso: z.string(),
	date: z.string(),
	events: z.array(z.object({
		title: z.string(),
		start: z.string(),
		end: z.string(),
		allDay: z.boolean(),
		kind: KindSchema
	}))
});
var writeBrief_createServerFn_handler = createServerRpc({
	id: "402a9c830cf27c958fe1e1034f7b0d618f04142da7ea4e72229192f87c77c5e0",
	name: "writeBrief",
	filename: "src/lib/ai.ts"
}, (opts) => writeBrief.__executeServer(opts));
var writeBrief = createServerFn({ method: "POST" }).validator((input) => BriefInput.parse(input)).handler(writeBrief_createServerFn_handler, async ({ data }) => {
	const list = data.events.length === 0 ? "（这一天还是空白）" : data.events.map((event) => event.allDay ? `全天 · ${event.title} · ${event.kind}` : `${event.start}–${event.end} · ${event.title} · ${event.kind}`).join("\n");
	const result = await chat(`你是「素笺」的日程书记，为这一天写一则日简。
只输出 JSON：{"headline":"不超过12字","body":"两句，平静、具体、不鸡汤、不夸张","energy":"light|steady|full"}
energy：事项少或偏休息=light；均衡=steady；会议与深度很多=full
现在是 ${data.nowIso}，日期 ${data.date}。用中文。不要 markdown。`, list, 280);
	if (!result.ok) return result;
	try {
		return {
			ok: true,
			...BriefResultSchema.parse(extractJson(result.text))
		};
	} catch {
		return {
			ok: false,
			error: "日简没有写完，请再试一次。"
		};
	}
});
var SculptInput = z.object({
	nowIso: z.string(),
	date: z.string(),
	events: z.array(z.object({
		id: z.string(),
		title: z.string(),
		start: z.string(),
		end: z.string(),
		allDay: z.boolean(),
		kind: KindSchema
	}))
});
var sculptSchedule_createServerFn_handler = createServerRpc({
	id: "6c0ea454a951f1473acbb37e8fd3bcb1718a5a43933998f1cab927d9c09f5d02",
	name: "sculptSchedule",
	filename: "src/lib/ai.ts"
}, (opts) => sculptSchedule.__executeServer(opts));
var sculptSchedule = createServerFn({ method: "POST" }).validator((input) => SculptInput.parse(input)).handler(sculptSchedule_createServerFn_handler, async ({ data }) => {
	const list = data.events.map((event) => `${event.id} | ${event.start}–${event.end} | ${event.title} | ${event.kind} | allDay=${event.allDay}`).join("\n");
	const result = await chat(`你是「素笺」的日程书记。若这一天拥挤或冲突，提出少量调整。
只输出 JSON：{"summary":"一句总评","moves":[{"id":"原id","title":"原标题","newStart":"ISO","newEnd":"ISO","reason":"不超过20字"}]}
规则：
- 只移动必要的事项，不删，不改标题
- 全天事项不要放进 moves
- 不要把专注切碎；优先让会议错开、给午饭留空
- 若已经疏朗，moves 为空，summary 说明无需改动
- 现在 ${data.nowIso}，日期 ${data.date}
- 不要 markdown`, list || "（空白）", 500);
	if (!result.ok) return result;
	try {
		return {
			ok: true,
			...SculptResultSchema.parse(extractJson(result.text))
		};
	} catch {
		return {
			ok: false,
			error: "疏时未能完成，请再试一次。"
		};
	}
});
//#endregion
export { parseSchedule_createServerFn_handler, sculptSchedule_createServerFn_handler, writeBrief_createServerFn_handler };
