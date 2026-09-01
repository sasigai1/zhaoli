import { KIND_LABEL, EDGE_LABEL, type NodeKind, type Session, type ThoughtNode } from "@/lib/types";
import { buildForest, relatedIds, type TreeNode } from "@/lib/tree";
import { cn } from "@/lib/utils";

type FrameworkTreeProps = {
  session: Session;
  selectedId: string | null;
  justAddedIds: string[];
  onSelect: (id: string | null) => void;
};

const KIND_CLASS: Record<NodeKind, string> = {
  question: "text-fg",
  claim: "text-kind",
  evidence: "text-muted",
  objection: "kind-oppose",
  tension: "kind-oppose",
  synthesis: "text-fg",
  aside: "text-subtle",
};

export function FrameworkTree({ session, selectedId, justAddedIds, onSelect }: FrameworkTreeProps) {
  const { roots, extras } = buildForest(session);
  const related = selectedId ? relatedIds(session, selectedId) : new Set<string>();
  const byId = new Map(session.nodes.map((n) => [n.id, n]));
  const extraByNode = new Map<string, typeof extras>();
  for (const edge of extras) {
    const list = extraByNode.get(edge.to) ?? [];
    list.push(edge);
    extraByNode.set(edge.to, list);
  }

  if (roots.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <p className="font-serif text-xl font-medium text-balance text-fg">从一句问开始</p>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-pretty text-muted">
          把还没理清的话写在下面。脉络会在上方慢慢长出来。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-8 pt-2">
      {roots.map((root) => (
        <Branch
          key={root.node.id}
          tree={root}
          depth={0}
          session={session}
          selectedId={selectedId}
          related={related}
          justAddedIds={justAddedIds}
          extraByNode={extraByNode}
          byId={byId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function Branch({
  tree,
  depth,
  session,
  selectedId,
  related,
  justAddedIds,
  extraByNode,
  byId,
  onSelect,
}: {
  tree: TreeNode;
  depth: number;
  session: Session;
  selectedId: string | null;
  related: Set<string>;
  justAddedIds: string[];
  extraByNode: Map<string, Session["edges"]>;
  byId: Map<string, ThoughtNode>;
  onSelect: (id: string | null) => void;
}) {
  const selected = selectedId === tree.node.id;
  const dimmed = selectedId !== null && !related.has(tree.node.id);
  const extras = extraByNode.get(tree.node.id) ?? [];

  return (
    <div className="relative">
      <NodeRow
        node={tree.node}
        depth={depth}
        selected={selected}
        dimmed={dimmed}
        fresh={justAddedIds.includes(tree.node.id)}
        session={session}
        extras={extras}
        byId={byId}
        onSelect={onSelect}
      />
      {tree.children.length > 0 ? (
        <div className="ml-5 border-l border-border pl-4 sm:ml-7 sm:pl-5">
          {tree.children.map((child) => (
            <Branch
              key={child.node.id}
              tree={child}
              depth={depth + 1}
              session={session}
              selectedId={selectedId}
              related={related}
              justAddedIds={justAddedIds}
              extraByNode={extraByNode}
              byId={byId}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NodeRow({
  node,
  depth,
  selected,
  dimmed,
  fresh,
  session,
  extras,
  byId,
  onSelect,
}: {
  node: ThoughtNode;
  depth: number;
  selected: boolean;
  dimmed: boolean;
  fresh: boolean;
  session: Session;
  extras: Session["edges"];
  byId: Map<string, ThoughtNode>;
  onSelect: (id: string | null) => void;
}) {
  const sources = node.sourceIds
    .map((id) => session.entries.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <article
      id={`node-${node.id}`}
      className={cn(
        "relative py-3 transition-opacity duration-300 ease-out",
        fresh && "node-enter",
        dimmed && "opacity-35",
      )}
    >
      {depth > 0 ? (
        <span aria-hidden className="absolute top-6 -left-4 h-px w-4 bg-border sm:-left-5 sm:w-5" />
      ) : null}
      <button
        type="button"
        onClick={() => onSelect(selected ? null : node.id)}
        className="flex w-full items-start gap-3 text-left"
      >
        <span
          className={cn(
            "mt-0.5 w-5 shrink-0 font-serif text-sm tracking-mark",
            KIND_CLASS[node.kind],
          )}
        >
          {KIND_LABEL[node.kind]}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 font-serif leading-relaxed text-pretty",
            node.kind === "question" || node.kind === "synthesis"
              ? "text-lg font-medium text-fg"
              : "text-base text-fg/90",
            selected && "text-fg",
          )}
        >
          {node.text}
        </span>
      </button>

      {selected ? (
        <div className="mt-3 ml-8 space-y-2">
          {extras.map((edge) => {
            const target = byId.get(edge.from);
            if (!target) return null;
            return (
              <button
                key={edge.id}
                type="button"
                onClick={() => onSelect(target.id)}
                className="block text-left text-sm text-muted transition-colors hover:text-fg"
              >
                {EDGE_LABEL[edge.kind]} · {KIND_LABEL[target.kind]} {target.text}
              </button>
            );
          })}
          {sources.map((entry) => (
            <p key={entry.id} className="text-sm leading-relaxed text-pretty text-muted">
              {entry.text}
            </p>
          ))}
        </div>
      ) : null}
    </article>
  );
}
