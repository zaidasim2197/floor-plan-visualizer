//#region node_modules/.nitro/vite/services/ssr/assets/event-2f2AwK3C.js
/**
* Central, CMS-ready configuration.
* Everything the client may want to change later lives here — not in components.
*/
var eventConfig = {
	name: "Marriott Exhibition & Trade Expo",
	tagline: "Where industry leaders, innovators and buyers meet.",
	description: "A two-day curated exhibition bringing together manufacturers, technology providers, distributors and enterprise buyers under one roof.",
	edition: "",
	startDate: "2026-11-18T09:00:00+05:00",
	endDate: "2026-11-19T18:00:00+05:00",
	dateLabel: "18 – 19 November 2026",
	timeLabel: "09:00 – 18:00 PKT",
	venue: {
		name: "Marriott Hotel, Grand Ballroom",
		city: "Karachi, Pakistan",
		address: "Abdullah Haroon Road, Karachi 75530"
	},
	currency: "PKR",
	contact: {
		email: "exhibitions@demo-expo.pk",
		phone: "+92 21 3568 0000",
		whatsapp: ["+92 300 1234567", "+92 321 7654321"]
	},
	booking: {
		/** Temporary hold on an unpaid booking. */
		paymentPendingMinutes: 30,
		/** Additional protected window once payment evidence is submitted. */
		paymentReviewGraceHours: 24
	},
	demo: {
		adminUsername: "admin",
		adminPassword: "Admin@123"
	},
	floorPlanLabel: "Demo Exhibition Layout"
};
var whatsappLink = (number, message) => `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
//#endregion
export { whatsappLink as n, eventConfig as t };
