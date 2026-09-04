import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "../server.js";
//#region node_modules/@tanstack/start-server-core/dist/esm/createSsrRpc.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/schedule/ai.ts
var parseScheduleAi = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("b26ba2ae128dd7caebc18bdab0fef3437e6559933975d69fbdd1ce6af7af79a5"));
var briefTodayAi = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("a935454a2dba8eb4bce6823cbca089233751a581002ec55226bdf4f0c4f29d30"));
//#endregion
export { parseScheduleAi as n, briefTodayAi as t };
