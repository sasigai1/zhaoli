import type { Discussion, Thought } from "./types";

const T0 = 1756700400000;

function t(
  id: string,
  text: string,
  parentId: string | null,
  relation: Thought["relation"],
  offset: number,
): Thought {
  return {
    id,
    text,
    parentId,
    relation,
    createdAt: T0 + offset * 60_000,
  };
}

export function createSampleDiscussion(): Discussion {
  return {
    id: "disc-sample",
    title: "什么是真正的简单",
    createdAt: T0,
    updatedAt: T0 + 12 * 60_000,
    links: [
      {
        id: "link-sample-1",
        fromId: "t-6",
        toId: "t-9",
        relation: "continue",
      },
    ],
    collapsedIds: [],
    view: { x: 0, y: 0, scale: 0 },
    thoughts: [
      t("t-1", "简单不是少，而是恰好。", null, "continue", 0),
      t("t-2", "少，是在做删减。恰好，是结构对了。", "t-1", "branch", 1),
      t("t-3", "结构一对准，再多的细节也会自己安静下来。", "t-2", "continue", 2),
      t(
        "t-4",
        "可是很多所谓的简单，只是把复杂藏到了别处。",
        "t-3",
        "counter",
        3,
      ),
      t("t-5", "那怎么分辨「恰好」和「藏起来」？", "t-4", "question", 4),
      t("t-6", "往回看的时候，脉络还在不在。还在，就是恰好。", "t-5", "continue", 5),
      t(
        "t-7",
        "界面上的简单，常常把选择交给了使用者的记忆。",
        "t-1",
        "branch",
        6,
      ),
      t("t-8", "真正的简单不需要记忆。", "t-7", "counter", 7),
      t(
        "t-9",
        "所以这个工具不该教我怎么想，只该把我想过的形状留下来。",
        "t-8",
        "continue",
        8,
      ),
      t("t-10", "那自我讨论为什么会乱？", "t-1", "question", 9),
      t(
        "t-11",
        "因为想法是线性冒出来的，而道理是有分叉的。",
        "t-10",
        "continue",
        10,
      ),
      t("t-12", "乱，不是想错了，是形状还没被看见。", "t-11", "continue", 11),
    ],
  };
}

export function createBlankDiscussion(title = "新的讨论"): Discussion {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    thoughts: [],
    links: [],
    collapsedIds: [],
    view: { x: 0, y: 0, scale: 0 },
  };
}
