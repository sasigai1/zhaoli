import type { Session } from "./types";

const T = Date.parse("2026-08-31T22:18:00+08:00");

export const SAMPLE_SESSION: Session = {
  id: "sample-work",
  title: "要不要换工作",
  createdAt: T,
  updatedAt: T + 36 * 60 * 1000,
  spine: "我还愿不愿意把自己放进一个会失败的位置 → 先给自己一个失败的沙盘",
  entries: [
    {
      id: "e1",
      createdAt: T,
      text: "我最近一直在想要不要换工作。现在的岗位已经很熟了，工资也不算低，可是每天上班都有一种说不清的闷。",
    },
    {
      id: "e2",
      createdAt: T + 6 * 60 * 1000,
      text: "说是闷，其实是觉得自己不再被需要成长，只是被需要产出。去年到现在几乎没有新的问题要解决。",
    },
    {
      id: "e3",
      createdAt: T + 14 * 60 * 1000,
      text: "但是一想到辞职，就害怕。房贷、父母、以及那种「你已经不年轻了」的声音。稳定本身也是一种能力。",
    },
    {
      id: "e4",
      createdAt: T + 21 * 60 * 1000,
      text: "如果只是为了稳定留下，三年后的我会不会更难走？那时候熟练变成惯性，惯性变成退路消失。",
    },
    {
      id: "e5",
      createdAt: T + 28 * 60 * 1000,
      text: "所以真正的问题也许不是「要不要换」，而是「我还愿不愿意把自己放进一个会失败的位置」。",
    },
    {
      id: "e6",
      createdAt: T + 36 * 60 * 1000,
      text: "我可以先不辞职。内部转岗，或者业余做一件必须从零开始的事，给自己一个失败的沙盘。如果连这个都迈不出，辞职大概率也只是换一个闷法。",
    },
  ],
  nodes: [
    {
      id: "n1",
      kind: "question",
      text: "要不要换工作？",
      sourceIds: ["e1"],
      createdAt: T,
    },
    {
      id: "n2",
      kind: "claim",
      text: "岗位已熟、薪水尚可，但每天有一种说不清的闷",
      sourceIds: ["e1"],
      createdAt: T,
    },
    {
      id: "n3",
      kind: "claim",
      text: "不再被需要成长，只是被需要产出",
      sourceIds: ["e2"],
      createdAt: T + 6 * 60 * 1000,
    },
    {
      id: "n4",
      kind: "evidence",
      text: "一年几乎没有新的问题要解决",
      sourceIds: ["e2"],
      createdAt: T + 6 * 60 * 1000,
    },
    {
      id: "n5",
      kind: "objection",
      text: "辞职意味着房贷、父母与「已经不年轻」的压力",
      sourceIds: ["e3"],
      createdAt: T + 14 * 60 * 1000,
    },
    {
      id: "n6",
      kind: "claim",
      text: "稳定本身也是一种能力",
      sourceIds: ["e3"],
      createdAt: T + 14 * 60 * 1000,
    },
    {
      id: "n7",
      kind: "aside",
      text: "若只为稳定留下，三年后熟练会变成失去退路的惯性",
      sourceIds: ["e4"],
      createdAt: T + 21 * 60 * 1000,
    },
    {
      id: "n8",
      kind: "synthesis",
      text: "真正的问题是：我还愿不愿意把自己放进一个会失败的位置",
      sourceIds: ["e5"],
      createdAt: T + 28 * 60 * 1000,
    },
    {
      id: "n9",
      kind: "synthesis",
      text: "先给自己一个失败的沙盘，而不是立刻辞职",
      sourceIds: ["e6"],
      createdAt: T + 36 * 60 * 1000,
    },
  ],
  edges: [
    { id: "x1", from: "n1", to: "n2", kind: "answers" },
    { id: "x2", from: "n2", to: "n3", kind: "derives" },
    { id: "x3", from: "n3", to: "n4", kind: "supports" },
    { id: "x4", from: "n1", to: "n5", kind: "opposes" },
    { id: "x5", from: "n5", to: "n6", kind: "derives" },
    { id: "x6", from: "n6", to: "n7", kind: "qualifies" },
    { id: "x7", from: "n1", to: "n8", kind: "derives" },
    { id: "x8", from: "n8", to: "n9", kind: "derives" },
    { id: "x9", from: "n7", to: "n8", kind: "relates" },
    { id: "x10", from: "n3", to: "n8", kind: "relates" },
  ],
};
