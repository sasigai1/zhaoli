export const RELATIONS = ["continue", "branch", "counter", "question"] as const;
export type Relation = (typeof RELATIONS)[number];

export const RELATION_META: Record<
  Relation,
  { label: string; hint: string; placeholder: string }
> = {
  continue: {
    label: "续",
    hint: "接着往下",
    placeholder: "接着刚才的想法…",
  },
  branch: {
    label: "分",
    hint: "另一个角度",
    placeholder: "换一个角度看…",
  },
  counter: {
    label: "反",
    hint: "反过来想",
    placeholder: "可是，反过来想…",
  },
  question: {
    label: "问",
    hint: "追问",
    placeholder: "这里有个问题…",
  },
};

export type Thought = {
  id: string;
  text: string;
  parentId: string | null;
  relation: Relation;
  createdAt: number;
};

export type ExtraLink = {
  id: string;
  fromId: string;
  toId: string;
  relation: Relation;
};

export type ViewState = {
  x: number;
  y: number;
  scale: number;
};

export type Discussion = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  thoughts: Thought[];
  links: ExtraLink[];
  collapsedIds: string[];
  view: ViewState;
};
