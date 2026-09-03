import { useEffect, useState } from "react";
//#region src/hooks/use-now.ts
function useNow(intervalMs = 1e3) {
	const [now, setNow] = useState(() => /* @__PURE__ */ new Date());
	useEffect(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
	return now;
}
//#endregion
export { useNow as t };
