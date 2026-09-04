//#region node_modules/.nitro/vite/services/ssr/assets/types-DkEh41EK.js
var TYPE_META = {
	work: {
		label: "工作",
		swatch: "#5C6B76",
		hint: "会议、项目、职场"
	},
	personal: {
		label: "生活",
		swatch: "#A38B6F",
		hint: "家事、琐碎、自我"
	},
	health: {
		label: "健康",
		swatch: "#6A7A64",
		hint: "运动、就医、休息恢复"
	},
	study: {
		label: "学习",
		swatch: "#4F5B68",
		hint: "阅读、课程、练习"
	},
	social: {
		label: "社交",
		swatch: "#8C6E62",
		hint: "朋友、聚会、拜访"
	},
	focus: {
		label: "专注",
		swatch: "#3E3C39",
		hint: "深度工作、写作"
	},
	rest: {
		label: "休息",
		swatch: "#8E9594",
		hint: "闲暇、睡眠、留白"
	},
	other: {
		label: "其他",
		swatch: "#7A746A",
		hint: "不好归类的安排"
	}
};
var SWATCHES = [
	{
		id: "ink",
		name: "墨",
		hex: "#2F2D2A"
	},
	{
		id: "charcoal",
		name: "玄",
		hex: "#3E3C39"
	},
	{
		id: "slate",
		name: "青石",
		hex: "#5C6B76"
	},
	{
		id: "dusk",
		name: "黛",
		hex: "#4F5B68"
	},
	{
		id: "mist",
		name: "雾青",
		hex: "#7B8B93"
	},
	{
		id: "sage",
		name: "苔",
		hex: "#6A7A64"
	},
	{
		id: "bamboo",
		name: "竹青",
		hex: "#5E7260"
	},
	{
		id: "olive",
		name: "橄榄",
		hex: "#7A7A5A"
	},
	{
		id: "sand",
		name: "暖沙",
		hex: "#A38B6F"
	},
	{
		id: "clay",
		name: "陶",
		hex: "#8C6E62"
	},
	{
		id: "terra",
		name: "赭",
		hex: "#8A5E4E"
	},
	{
		id: "tea",
		name: "茶褐",
		hex: "#7A746A"
	},
	{
		id: "stone",
		name: "花岗",
		hex: "#8A8580"
	},
	{
		id: "moon",
		name: "月白",
		hex: "#8E9594"
	},
	{
		id: "paper",
		name: "牙",
		hex: "#C4B7A2"
	},
	{
		id: "bronze",
		name: "古铜",
		hex: "#9A8466"
	}
];
function colorForType(type) {
	return TYPE_META[type].swatch;
}
function readableOn(hex) {
	const h = hex.replace("#", "");
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return (r * 299 + g * 587 + b * 114) / 1e3 >= 150 ? "#1C1B18" : "#FBF8F3";
}
var EVENT_TYPES = [
	"work",
	"personal",
	"health",
	"study",
	"social",
	"focus",
	"rest",
	"other"
];
var DEFAULT_SETTINGS = {
	notifications: false,
	sound: true,
	defaultReminder: 15,
	weekStartsOn: 1
};
//#endregion
export { colorForType as a, TYPE_META as i, EVENT_TYPES as n, readableOn as o, SWATCHES as r, DEFAULT_SETTINGS as t };
