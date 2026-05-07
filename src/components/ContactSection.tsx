'use client';

import { useState, type FormEvent } from 'react';
import Reveal from './Reveal';

interface ContactInfoItem {
  label: string;
  value: string;
  href?: string;
  iconPath: string;
}

// Replace these placeholders with your real contact details, or wire them up
// to NEXT_PUBLIC_* env vars if you want them configurable per environment.
const INFO: ContactInfoItem[] = [
  {
    label: 'Email',
    value: 'hello@masonry-gallery.app',
    href: 'mailto:hello@masonry-gallery.app',
    iconPath:
      'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  },
  {
    label: 'Studio',
    value: 'Open Mon–Fri, 9am–6pm',
    iconPath:
      'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  },
  {
    label: 'Response time',
    value: 'Usually within 24 hours',
    iconPath:
      'M12 6v6l4 2 M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z',
  },
];

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // No backend wired up yet — show the success state and reset the form.
    // Swap this with a fetch to your /api/contact route when you have one.
    setStatus('sending');
    window.setTimeout(() => {
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    }, 600);
  }

  return (
    <section
      id="contact"
      className="relative scroll-mt-20 border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-brand-300">
              Contact
            </span>
            <h2 className="mt-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Get in touch
            </h2>
            <p className="mt-4 text-base text-gray-400 sm:text-lg">
              Commission a shoot, license a print, or just say hi — we read
              every message.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Contact info */}
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-base font-semibold text-white">
                Reach us directly
              </h3>
              <p className="text-sm text-gray-400">
                Prefer the inbox? Drop us a line and we&apos;ll get back to you
                within a business day.
              </p>

              <ul className="mt-4 space-y-3">
                {INFO.map((item) => {
                  const inner = (
                    <span className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-200 ring-1 ring-brand-400/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={item.iconPath} />
                        </svg>
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          {item.label}
                        </span>
                        <span className="text-sm text-gray-200">
                          {item.value}
                        </span>
                      </span>
                    </span>
                  );

                  return (
                    <li key={item.label}>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="block rounded-lg px-1 py-1 transition-colors hover:bg-white/5"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div className="px-1 py-1">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal className="lg:col-span-3" delay={120}>
            <form
              onSubmit={handleSubmit}
              className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
              noValidate
            >
              {/* Success overlay — fades in when status is 'sent' */}
              <div
                aria-hidden={status !== 'sent'}
                className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center backdrop-blur-md transition-all duration-500 ${
                  status === 'sent'
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0'
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/40">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Message sent
                </h3>
                <p className="max-w-xs text-sm text-gray-400">
                  Thanks for reaching out — we&apos;ll be in touch shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-gray-200 transition-colors hover:border-white/25 hover:bg-white/10"
                >
                  Send another
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="contact-name"
                  label="Name"
                  type="text"
                  value={name}
                  onChange={setName}
                  required
                  autoComplete="name"
                />
                <Field
                  id="contact-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="Tell us what you have in mind…"
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 transition-all focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-400 hover:shadow-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 sm:w-auto"
              >
                {status === 'sending' ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="2" x2="12" y2="6" />
                      <line x1="12" y1="18" x2="12" y2="22" />
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                      <line x1="2" y1="12" x2="6" y2="12" />
                      <line x1="18" y1="12" x2="22" y2="12" />
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type: 'text' | 'email';
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  autoComplete?: string;
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  required,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400"
      >
        {label}
        {required && <span className="text-brand-400"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 transition-all focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
      />
    </div>
  );
}
