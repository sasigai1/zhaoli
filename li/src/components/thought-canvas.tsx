import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { layoutThoughts, pathToRoot } from "@/lib/layout";
import type { ViewState } from "@/lib/types";
import { useAppStore, useCurrentDiscussion } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThoughtEdges } from "@/components/thought-edges";
import { ThoughtNode } from "@/components/thought-node";

const MIN_SCALE = 0.22;
const MAX_SCALE = 2.1;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function ThoughtCanvas() {
  const discussion = useCurrentDiscussion();
  const selectedId = useAppStore((s) => s.selectedId);
  const editingId = useAppStore((s) => s.editingId);
  const linkMode = useAppStore((s) => s.linkMode);
  const justAddedId = useAppStore((s) => s.justAddedId);
  const fitNonce = useAppStore((s) => s.fitNonce);
  const select = useAppStore((s) => s.select);
  const setEditing = useAppStore((s) => s.setEditing);
  const setLinkMode = useAppStore((s) => s.setLinkMode);
  const addLink = useAppStore((s) => s.addLink);
  const removeLink = useAppStore((s) => s.removeLink);
  const reparent = useAppStore((s) => s.reparent);
  const updateThought = useAppStore((s) => s.updateThought);
  const deleteThought = useAppStore((s) => s.deleteThought);
  const toggleCollapse = useAppStore((s) => s.toggleCollapse);
  const persistView = useAppStore((s) => s.setView);
  const hydrated = useAppStore((s) => s.hydrated);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dragLine, setDragLine] = useState<{
    fromId: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [view, setViewState] = useState<ViewState>(discussion.view);

  const viewRef = useRef(view);
  viewRef.current = view;
  const persistTimer = useRef(0);
  const fittedFor = useRef<string | null>(null);

  const updateView = useCallback(
    (next: ViewState) => {
      viewRef.current = next;
      setViewState(next);
      window.clearTimeout(persistTimer.current);
      persistTimer.current = window.setTimeout(() => persistView(next), 400);
    },
    [persistView],
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(persistTimer.current);
      persistView(viewRef.current);
    };
  }, [persistView]);

  const discussionId = discussion.id;
  useEffect(() => {
    const stored = useAppStore.getState().current().view;
    if (stored.scale > 0) {
      setViewState(stored);
      fittedFor.current = discussionId;
      return;
    }
    if (viewRef.current.scale > 0 && fittedFor.current === discussionId) {
      return;
    }
    setViewState({ x: 0, y: 0, scale: 0 });
    fittedFor.current = null;
  }, [discussionId, hydrated]);

  const collapsed = useMemo(
    () => new Set(discussion.collapsedIds),
    [discussion.collapsedIds],
  );

  const { boxes, width, height } = useMemo(
    () => layoutThoughts(discussion.thoughts, collapsed),
    [discussion.thoughts, collapsed],
  );

  const boxesRef = useRef(boxes);
  boxesRef.current = boxes;
  const thoughtsRef = useRef(discussion.thoughts);
  thoughtsRef.current = discussion.thoughts;

  const selectedPath = useMemo(() => {
    const path = pathToRoot(discussion.thoughts, selectedId);
    return new Set(path.map((t) => t.id));
  }, [discussion.thoughts, selectedId]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    if (vw < 40 || vh < 40) return;
    const pad = 40;
    const scale = clamp(
      Math.min(
        (vw - pad * 2) / Math.max(width, 1),
        (vh - pad * 2) / Math.max(height, 1),
      ),
      MIN_SCALE,
      1,
    );
    const x = (vw - width * scale) / 2;
    const y = Math.max(pad, (vh - height * scale) / 3.6);
    updateView({ x, y, scale });
  }, [width, height, updateView]);

  useEffect(() => {
    if (size.w < 40) return;
    if (fittedFor.current === discussion.id) return;
    if (viewRef.current.scale > 0) {
      fittedFor.current = discussion.id;
      return;
    }
    fitView();
    fittedFor.current = discussion.id;
  }, [discussion.id, size.w, size.h, fitView]);

  useEffect(() => {
    fittedFor.current = null;
  }, [discussion.id]);

  useEffect(() => {
    if (fitNonce === 0) return;
    fitView();
  }, [fitNonce, fitView]);

  useEffect(() => {
    if (!justAddedId) return;
    const box = boxes[justAddedId];
    const el = viewportRef.current;
    if (!box || !el) return;
    const { x, y, scale } = viewRef.current;
    if (scale <= 0) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const targetSX = vw / 2;
    const targetSY = vh * 0.74;
    const sx = x + (box.x + box.w / 2) * scale;
    const sy = y + (box.y + box.h) * scale;
    updateView({
      x: x + (targetSX - sx),
      y: y + (targetSY - sy),
      scale,
    });
  }, [justAddedId, boxes, updateView]);

  const prevSelected = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    prevSelected.current = undefined;
  }, [discussion.id]);

  useEffect(() => {
    if (prevSelected.current === undefined) {
      prevSelected.current = selectedId;
      return;
    }
    if (prevSelected.current === selectedId) return;
    prevSelected.current = selectedId;
    if (!selectedId || justAddedId) return;
    const box = boxes[selectedId];
    const el = viewportRef.current;
    if (!box || !el) return;
    const { x, y, scale } = viewRef.current;
    if (scale <= 0) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const sx = x + (box.x + box.w / 2) * scale;
    const sy = y + (box.y + box.h / 2) * scale;
    const margin = 56;
    let nx = x;
    let ny = y;
    if (sx < margin) nx += margin - sx;
    if (sx > vw - margin) nx -= sx - (vw - margin);
    if (sy < margin) ny += margin - sy;
    if (sy > vh - margin) ny -= sy - (vh - margin);
    if (nx !== x || ny !== y) updateView({ x: nx, y: ny, scale });
  }, [selectedId, justAddedId, boxes, updateView]);

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const el = viewportRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const { x, y, scale } = viewRef.current;
    const s = scale || 1;
    return {
      x: (clientX - rect.left - x) / s,
      y: (clientY - rect.top - y) / s,
    };
  }, []);

  const hitNode = useCallback((worldX: number, worldY: number) => {
    const map = boxesRef.current;
    for (const t of thoughtsRef.current) {
      const b = map[t.id];
      if (!b) continue;
      if (
        worldX >= b.x &&
        worldX <= b.x + b.w &&
        worldY >= b.y &&
        worldY <= b.y + b.h
      ) {
        return t.id;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { x, y, scale } = viewRef.current;
      const s = scale || 1;
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const wx = (cx - x) / s;
        const wy = (cy - y) / s;
        const factor = e.deltaY > 0 ? 0.94 : 1.06;
        const next = clamp(s * factor, MIN_SCALE, MAX_SCALE);
        updateView({ x: cx - wx * next, y: cy - wy * next, scale: next });
        return;
      }
      updateView({ x: x - e.deltaX, y: y - e.deltaY, scale: s });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [updateView]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let startDist = 0;
    let startScale = 1;
    const distance = (touches: TouchList) => {
      const a = touches.item(0);
      const b = touches.item(1);
      if (!a || !b) return 0;
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startDist = distance(e.touches) || 1;
        startScale = viewRef.current.scale || 1;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const a = e.touches.item(0);
      const b = e.touches.item(1);
      if (!a || !b) return;
      const rect = el.getBoundingClientRect();
      const cx = (a.clientX + b.clientX) / 2 - rect.left;
      const cy = (a.clientY + b.clientY) / 2 - rect.top;
      const { x, y, scale } = viewRef.current;
      const s = scale || 1;
      const next = clamp(
        startScale * (distance(e.touches) / startDist),
        MIN_SCALE,
        MAX_SCALE,
      );
      const wx = (cx - x) / s;
      const wy = (cy - y) / s;
      updateView({ x: cx - wx * next, y: cy - wy * next, scale: next });
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
    };
  }, [updateView]);

  const onPointerDownBg = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-node-id]")) return;
    if (linkMode) {
      setLinkMode(false);
      return;
    }
    e.preventDefault();
    setPanning(true);
    const originX = e.clientX;
    const originY = e.clientY;
    const start = { ...viewRef.current };
    const move = (ev: PointerEvent) => {
      updateView({
        x: start.x + (ev.clientX - originX),
        y: start.y + (ev.clientY - originY),
        scale: start.scale || 1,
      });
    };
    const up = () => {
      setPanning(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startNodeDrag = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const box = boxes[id];
    if (!box) return;
    const originX = e.clientX;
    const originY = e.clientY;
    const x1 = box.x + box.w / 2;
    const y1 = box.y + box.h / 2;
    let dragging = false;

    const move = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < 8) return;
        dragging = true;
      }
      const w = screenToWorld(ev.clientX, ev.clientY);
      setHoverId(hitNode(w.x, w.y));
      setDragLine({
        fromId: id,
        x1,
        y1,
        x2: w.x,
        y2: w.y,
      });
    };
    const up = (ev: PointerEvent) => {
      if (dragging) {
        const w = screenToWorld(ev.clientX, ev.clientY);
        const target = hitNode(w.x, w.y);
        if (target && target !== id) reparent(id, target);
      }
      setDragLine(null);
      setHoverId(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onNodeClick = (id: string) => {
    if (linkMode && selectedId && selectedId !== id) {
      addLink(selectedId, id);
      return;
    }
    select(id);
  };

  const { x, y, scale } =
    view.scale > 0 ? view : { x: 0, y: 80, scale: 1 };
  const compact = scale < 0.6;
  const empty = discussion.thoughts.length === 0;

  return (
    <div
      ref={viewportRef}
      data-canvas="lilu"
      className={cn(
        "relative min-h-0 flex-1 touch-none overflow-hidden overscroll-none",
        panning ? "cursor-grabbing" : "cursor-grab",
        linkMode && "cursor-alias",
      )}
      onPointerDown={onPointerDownBg}
    >
      <div
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{
          width,
          height,
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
        }}
      >
        <ThoughtEdges
          thoughts={discussion.thoughts}
          links={discussion.links}
          boxes={boxes}
          selectedId={selectedId}
          selectedPath={selectedPath}
          width={width}
          height={height}
          scale={scale}
          dragLine={
            dragLine
              ? {
                  x1: dragLine.x1,
                  y1: dragLine.y1,
                  x2: dragLine.x2,
                  y2: dragLine.y2,
                }
              : null
          }
          onRemoveLink={removeLink}
        />

        {discussion.thoughts.map((t) => {
          const box = boxes[t.id];
          if (!box) return null;
          const onPath = selectedPath.size === 0 || selectedPath.has(t.id);
          const isChildOfSelected =
            selectedId !== null && t.parentId === selectedId;
          return (
            <ThoughtNode
              key={t.id}
              thought={t}
              box={box}
              thoughts={discussion.thoughts}
              selected={selectedId === t.id}
              dimmed={Boolean(selectedId) && !onPath && !isChildOfSelected}
              collapsed={collapsed.has(t.id)}
              justAdded={justAddedId === t.id}
              linkMode={linkMode}
              dropTarget={hoverId === t.id && dragLine !== null}
              compact={compact}
              onSelect={() => onNodeClick(t.id)}
              onEdit={() => setEditing(t.id)}
              onDelete={() => deleteThought(t.id)}
              onToggleCollapse={() => toggleCollapse(t.id)}
              onStartLink={() => {
                select(t.id);
                setLinkMode(true);
              }}
              onDragPointerDown={(ev) => startNodeDrag(t.id, ev)}
              editing={editingId === t.id}
              onCommitEdit={(text) => updateThought(t.id, text)}
              onCancelEdit={() => setEditing(null)}
            />
          );
        })}
      </div>

      {empty ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
          <p className="font-display max-w-xs text-center text-lg text-muted">
            从下面写下第一句
          </p>
        </div>
      ) : null}

      {linkMode ? (
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-md bg-fg px-3 py-1.5 text-xs text-bg">
          点另一个想法，把它们连起来
        </div>
      ) : null}
    </div>
  );
}

export function FitViewButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const requestFit = useAppStore((s) => s.requestFit);
  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      onClick={requestFit}
      {...props}
    >
      {children ?? "看全貌"}
    </Button>
  );
}
