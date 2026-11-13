import type { Metadata } from "next";
import ContactForm from "../../../components/ContactForm";
import PageHero from "../../../components/PageHero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Discuss a project, research collaboration or digital transformation requirement with Agentic Research Labs.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="CONTACT" title={<>Let’s discuss your <em>project.</em></>} lead="Tell us about your organisation, research collaboration or digital transformation requirement. We read every enquiry and reply by email." />
      <section className="contact-band contact-page">
        <div className="section-wrap contact-inner">
          <div className="contact-copy" data-reveal>
            <h2>Send an enquiry</h2>
            <p>Please do not include patient data, identity documents or confidential government material in this form.</p>
            <dl className="contact-details">
              <div><dt>Company</dt><dd>Agentic Research Labs (Pvt) Ltd</dd></div>
              <div><dt>Location</dt><dd>Lahore, Pakistan</dd></div>
              <div><dt>Email</dt><dd><a href="mailto:info@agenticresearchlabs.com">info@agenticresearchlabs.com</a></dd></div>
            </dl>
          </div>
          <div className="contact-panel" data-reveal>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
