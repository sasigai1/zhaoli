//#region node_modules/.nitro/vite/services/ssr/assets/types-BWtpnAqn.js
var NODE_KINDS = [
	"question",
	"claim",
	"evidence",
	"objection",
	"tension",
	"synthesis",
	"aside"
];
var EDGE_KINDS = [
	"supports",
	"opposes",
	"answers",
	"derives",
	"qualifies",
	"relates"
];
var KIND_LABEL = {
	question: "问",
	claim: "立",
	evidence: "据",
	objection: "驳",
	tension: "折",
	synthesis: "合",
	aside: "旁"
};
var EDGE_LABEL = {
	supports: "支持",
	opposes: "反驳",
	answers: "回应",
	derives: "推出",
	qualifies: "限定",
	relates: "相关"
};
function isNodeKind(value) {
	return NODE_KINDS.includes(value);
}
function isEdgeKind(value) {
	return EDGE_KINDS.includes(value);
}
//#endregion
export { isNodeKind as i, KIND_LABEL as n, isEdgeKind as r, EDGE_LABEL as t };
