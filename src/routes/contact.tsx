import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { eventConfig, whatsappLink } from "@/config/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const title = `Contact — ${eventConfig.name}`;
const description = `Get in touch with the ${eventConfig.name} team for stall booking assistance, sponsorship, or visitor inquiries.`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Thank you for your message. Our team will contact you shortly.");
    }, 600);
  };

  return (
    <SiteLayout>
      {/* HEADER */}
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <p className="eyebrow text-primary">Get In Touch</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Contact Exhibition Directorate
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
            Have questions about space availability, pricing tiers, or custom booth design? Reach out to our dedicated exhibition team directly.
          </p>
        </div>
      </section>

      {/* MAIN CONTACT CONTENT */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* CONTACT INFO & WHATSAPP */}
          <div className="lg:col-span-5 space-y-8">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-xl font-bold text-foreground mb-6">Contact Information</h2>
              <dl className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-md bg-primary/10 p-2.5 text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase">Email Support</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{eventConfig.contact.email}</dd>
                    <dd className="text-xs text-muted-foreground">Mon - Sat: 9:00 AM - 6:00 PM PKT</dd>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-md bg-primary/10 p-2.5 text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase">Direct Hotline</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{eventConfig.contact.phone}</dd>
                    <dd className="text-xs text-muted-foreground">General Enquiries & Helpdesk</dd>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-md bg-primary/10 p-2.5 text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-muted-foreground uppercase">Venue Address</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{eventConfig.venue.name}</dd>
                    <dd className="text-xs text-muted-foreground">{eventConfig.venue.address}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* WHATSAPP ACTION CARD */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-foreground">Instant WhatsApp Assistance</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For immediate space reservation updates, receipt verification, or urgent inquiries:
              </p>
              <div className="mt-4 space-y-2">
                {eventConfig.contact.whatsapp.map((num, i) => (
                  <Button
                    key={num}
                    asChild
                    variant="outline"
                    className="w-full justify-between border-emerald-600/30 bg-background text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-500/10"
                  >
                    <a
                      href={whatsappLink(num, `Hello, I need assistance regarding ${eventConfig.name}.`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>WhatsApp Line {i + 1} ({num})</span>
                      <Send className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* INQUIRY FORM */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-border bg-card p-8 shadow-xs">
              <h2 className="text-2xl font-extrabold text-foreground">Send an Inquiry</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill in the form below and an exhibition representative will respond within 4 business hours.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-lg bg-emerald-500/10 p-6 border border-emerald-500/30 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                  <h3 className="mt-3 text-lg font-bold text-foreground">Message Sent Successfully!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thank you for reaching out. We have logged your request and our team will get back to you promptly.
                  </p>
                  <Button
                    className="mt-6 font-bold"
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Your Full Name *</Label>
                      <Input id="contact-name" required placeholder="e.g. Tariq Mehmood" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-company">Company Name *</Label>
                      <Input id="contact-company" required placeholder="e.g. Apex Global Solutions" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Work Email *</Label>
                      <Input id="contact-email" type="email" required placeholder="tariq@company.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone / WhatsApp Number *</Label>
                      <Input id="contact-phone" required placeholder="+92 300 1234567" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Inquiry Subject</Label>
                    <Input id="contact-subject" placeholder="e.g. Stall Reservation / Custom Booth Specs" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message Details *</Label>
                    <Textarea
                      id="contact-message"
                      required
                      rows={5}
                      placeholder="Please let us know how we can assist you..."
                    />
                  </div>

                  <Button type="submit" className="w-full h-11 font-bold text-sm" disabled={loading}>
                    {loading ? "Sending Message..." : "Submit Inquiry"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
