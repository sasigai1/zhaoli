import { Button } from "@/components/ui/button";
import { useLedger } from "@/lib/folio/store";

const STEPS = [
  { no: "01", title: "每日五栏", body: "摘要、事项、正文、评估、标记。结构固定，不增不减。" },
  { no: "02", title: "齐备方可归档", body: "五栏全部达到阈值后，才允许盖章归档。草稿会自动写入本机。" },
  { no: "03", title: "已归档即锁定", body: "归档后记录只读。如需改写，先执行重开。" },
  { no: "04", title: "数据仅存本机", body: "记录保存在此设备本地。可随时导出卷宗副本。" },
];

export function ProtocolGate() {
  const onboarded = useLedger((s) => s.onboarded);
  const completeOnboarding = useLedger((s) => s.completeOnboarding);
  if (onboarded) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col overflow-y-auto bg-paper px-6 pt-safe">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-8">
        <p className="font-mono text-xs tracking-[0.22em] text-faint">FOLIO · PROTOCOL</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">归档规程</h1>
        <p className="mt-2 text-sm text-muted">每一日，归档一次。防止日后遗忘本日。</p>

        <ol className="mt-8 flex flex-1 flex-col gap-0 border-t border-rule">
          {STEPS.map((step) => (
            <li key={step.no} className="grid grid-cols-[auto_1fr] gap-3 border-b border-rule py-4">
              <span className="w-10 font-mono text-sm tabular-nums text-faint">{step.no}</span>
              <div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <Button className="mt-8 w-full" size="lg" type="button" onClick={completeOnboarding}>
          开始本日
        </Button>
        <p className="mt-3 pb-6 text-center font-mono text-[10px] tracking-[0.16em] text-faint">
          LOCAL STORE · NO ACCOUNT
        </p>
      </div>
    </div>
  );
}
