import { n as Route } from "./router-C8liBYT1.js";
import { t as DayEditor } from "./day-editor-DaL1pcR1.js";
import { jsx } from "react/jsx-runtime";
//#region src/routes/_folio/d.$date.tsx?tsr-split=component
function DayPage() {
	const { date } = Route.useParams();
	return /* @__PURE__ */ jsx(DayEditor, { date });
}
//#endregion
export { DayPage as component };
