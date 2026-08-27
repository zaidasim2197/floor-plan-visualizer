import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { _ as statusLabel, s as cn } from "./SiteLayout-CKYIau6i.mjs";
import { n as statusTone } from "./booking-format-CKKEcEYb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusBadge-Ctudv6cz.js
var import_jsx_runtime = require_jsx_runtime();
function StatusBadge({ status, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap", statusTone[status], className),
		children: statusLabel[status]
	});
}
//#endregion
export { StatusBadge as t };
