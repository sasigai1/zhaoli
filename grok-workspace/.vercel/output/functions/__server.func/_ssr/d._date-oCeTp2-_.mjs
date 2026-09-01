import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route } from "./router-CaGjStSs.mjs";
import { t as DayEditor } from "./day-editor-CZj2smUU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/d._date-oCeTp2-_.js
var import_jsx_runtime = require_jsx_runtime();
function DayPage() {
	const { date } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayEditor, { date });
}
//#endregion
export { DayPage as component };
