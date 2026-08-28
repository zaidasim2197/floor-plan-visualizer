/**
 * Central, CMS-ready configuration.
 * Everything the client may want to change later lives here — not in components.
 */

export const eventConfig = {
  name: "Marriott Exhibition & Trade Expo",
  tagline: "Where industry leaders, innovators and buyers meet.",
  description:
    "A two-day curated exhibition bringing together manufacturers, technology providers, distributors and enterprise buyers under one roof.",
  edition: "2027 Edition",
  startDate: "2027-01-28T09:00:00+05:00",
  endDate: "2027-01-29T18:00:00+05:00",
  dateLabel: "28 – 29 January 2027",
  timeLabel: "09:00 – 18:00 PKT",
  venue: {
    name: "Marriott Hotel, Grand Ballroom",
    city: "Karachi, Pakistan",
    address: "Abdullah Haroon Road, Karachi 75530",
  },
  currency: "PKR",
  contact: {
    email: "exhibitions@demo-expo.pk",
    phone: "+92 21 3568 0000",
    whatsapp: ["+92 300 1234567", "+92 321 7654321"],
  },
  booking: {
    /** Temporary hold on an unpaid booking. */
    paymentPendingMinutes: 30,
    /** Additional protected window once payment evidence is submitted. */
    paymentReviewGraceHours: 24,
  },
  demo: {
    adminUsername: "admin",
    adminPassword: "Admin@123",
  },
  payfast: {
    merchantId: "10053591",
    merchantKey: "0mabghoryy7i6",
    sandboxUrl: "https://sandbox.payfast.co.za/eng/process",
    passphrase: "",
  },
  safepay: {
    publicKey: "sec_04fcd032-7a56-440e-a29c-95ac88b7d52f",
    secretKey: "7045f745c5708c7c938544730e5ebe363e19108f9831b3903aa8bd8bdef93773",
    sandboxCheckoutUrl: "https://sandbox.api.getsafepay.com/checkout/pay",
    environment: "sandbox",
  },
  floorPlanLabel: "Demo Exhibition Layout",
} as const;

export const whatsappLink = (number: string, message: string) =>
  `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
