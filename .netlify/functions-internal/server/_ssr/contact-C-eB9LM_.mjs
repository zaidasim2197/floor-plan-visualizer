import { r as __toESM } from "../_runtime.mjs";
import { n as whatsappLink, t as eventConfig } from "./event-2f2AwK3C.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as CircleCheck, h as MessageSquare, l as Send, p as Phone, v as MapPin, y as Mail } from "../_libs/lucide-react.mjs";
import { r as SiteLayout, t as Button } from "./SiteLayout-CKYIau6i.mjs";
import { n as Label, t as Input } from "./label-L6jlgP2A.mjs";
import { t as Textarea } from "./textarea-BE9s_JWl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-C-eB9LM_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContactPage() {
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setSubmitted(true);
			toast.success("Thank you for your message. Our team will contact you shortly.");
		}, 600);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-b border-border bg-surface py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-7xl px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow text-primary",
					children: "Get In Touch"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground",
					children: "Contact Exhibition Directorate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed",
					children: "Have questions about space availability, pricing tiers, or custom booth design? Reach out to our dedicated exhibition team directly."
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto w-full max-w-7xl px-4 py-16 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-12 lg:grid-cols-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-5 space-y-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-6 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-bold text-foreground mb-6",
						children: "Contact Information"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "space-y-6 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-md bg-primary/10 p-2.5 text-primary shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs font-bold text-muted-foreground uppercase",
										children: "Email Support"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-0.5 font-semibold text-foreground",
										children: eventConfig.contact.email
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-xs text-muted-foreground",
										children: "Mon - Sat: 9:00 AM - 6:00 PM PKT"
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-md bg-primary/10 p-2.5 text-primary shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs font-bold text-muted-foreground uppercase",
										children: "Direct Hotline"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-0.5 font-semibold text-foreground",
										children: eventConfig.contact.phone
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-xs text-muted-foreground",
										children: "General Enquiries & Helpdesk"
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-md bg-primary/10 p-2.5 text-primary shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs font-bold text-muted-foreground uppercase",
										children: "Venue Address"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-0.5 font-semibold text-foreground",
										children: eventConfig.venue.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-xs text-muted-foreground",
										children: eventConfig.venue.address
									})
								] })]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-6 w-6 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg font-bold text-foreground",
								children: "Instant WhatsApp Assistance"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "For immediate space reservation updates, receipt verification, or urgent inquiries:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-2",
							children: eventConfig.contact.whatsapp.map((num, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								className: "w-full justify-between border-emerald-600/30 bg-background text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-500/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: whatsappLink(num, `Hello, I need assistance regarding ${eventConfig.name}.`),
									target: "_blank",
									rel: "noreferrer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"WhatsApp Line ",
										i + 1,
										" (",
										num,
										")"
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })]
								})
							}, num))
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card p-8 shadow-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-extrabold text-foreground",
							children: "Send an Inquiry"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Fill in the form below and an exhibition representative will respond within 4 business hours."
						}),
						submitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 rounded-lg bg-emerald-500/10 p-6 border border-emerald-500/30 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto h-12 w-12 text-emerald-600" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 text-lg font-bold text-foreground",
									children: "Message Sent Successfully!"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "Thank you for reaching out. We have logged your request and our team will get back to you promptly."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-6 font-bold",
									variant: "outline",
									onClick: () => setSubmitted(false),
									children: "Send Another Message"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleSubmit,
							className: "mt-6 space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "contact-name",
											children: "Your Full Name *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "contact-name",
											required: true,
											placeholder: "e.g. Tariq Mehmood"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "contact-company",
											children: "Company Name *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "contact-company",
											required: true,
											placeholder: "e.g. Apex Global Solutions"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "contact-email",
											children: "Work Email *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "contact-email",
											type: "email",
											required: true,
											placeholder: "tariq@company.com"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "contact-phone",
											children: "Phone / WhatsApp Number *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "contact-phone",
											required: true,
											placeholder: "+92 300 1234567"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "contact-subject",
										children: "Inquiry Subject"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "contact-subject",
										placeholder: "e.g. Stall Reservation / Custom Booth Specs"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "contact-message",
										children: "Message Details *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "contact-message",
										required: true,
										rows: 5,
										placeholder: "Please let us know how we can assist you..."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									className: "w-full h-11 font-bold text-sm",
									disabled: loading,
									children: loading ? "Sending Message..." : "Submit Inquiry"
								})
							]
						})
					]
				})
			})]
		})
	})] });
}
//#endregion
export { ContactPage as component };
