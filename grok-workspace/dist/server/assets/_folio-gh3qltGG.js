import { C as localIsoDate } from "./router-C8liBYT1.js";
import { t as DayEditor } from "./day-editor-DaL1pcR1.js";
import { jsx } from "react/jsx-runtime";
//#region src/routes/_folio/index.tsx?tsr-split=component
function TodayPage() {
	return /* @__PURE__ */ jsx(DayEditor, { date: localIsoDate() });
}
//#endregion
export { TodayPage as component };
