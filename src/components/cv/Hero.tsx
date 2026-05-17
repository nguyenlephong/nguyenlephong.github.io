'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'
import { LuMail, LuPhone, LuDownload, LuMapPin } from 'react-icons/lu'
import { profileInfo, APP_ROUTE } from '@/app/app.const'
import { track } from '@/lib/analytics'
import CountUp from '@/components/motion/CountUp'

const stats = [
  { label: 'Years of experience', value: '8+' },
  { label: 'Engineers led', value: '12+' },
  { label: 'MAU served', value: '15M+' },
  { label: 'Domains delivered', value: '20+' },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Hero() {
  const c = profileInfo.contact
  const reduced = useReducedMotion()

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease },
        }

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-bleed" aria-hidden="true" />
      <div className="hero-grid">
        <div className="hero-meta">
          <motion.span className="eyebrow" {...fade(0)}>
            <span className="status-dot" aria-hidden="true" /> Open to senior / lead opportunities
          </motion.span>
          <motion.h1 id="hero-heading" className="hero-name" {...fade(0.08)}>
            Nguyen <span className="accent">Le Phong</span>
          </motion.h1>
          <motion.p className="hero-role" {...fade(0.16)}>
            Senior Software Engineer · Tech Lead<br />
            <span className="hero-role-sub">Full-stack · Platform engineering · Delivery leadership</span>
          </motion.p>

          <motion.p className="hero-bio" {...fade(0.24)}>
            I design and operate end-to-end systems — front-end apps, backend services, CI/CD pipelines,
            release workflows, and production infrastructure. Lately I lead an 11-person team shipping
            multi-tenant platforms, secure financial integrations, and Micro-Frontend architectures.
          </motion.p>

          <motion.ul className="hero-contact" {...fade(0.3)}>
            <li>
              <LuMapPin size={16} aria-hidden="true" />
              <span>Ho Chi Minh City, Vietnam</span>
            </li>
            <li>
              <a
                href={`mailto:${c.email}`}
                onClick={() => track('cv_contact_click', { channel: 'email' })}
              >
                <LuMail size={16} aria-hidden="true" />
                <span>{c.email}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${c.phone.replace(/\D/g, '')}`}
                onClick={() => track('cv_contact_click', { channel: 'phone' })}
              >
                <LuPhone size={16} aria-hidden="true" />
                <span>{c.phone}</span>
              </a>
            </li>
          </motion.ul>

          <motion.div className="hero-cta" {...fade(0.36)}>
            <Link
              href={APP_ROUTE.CV_PDF}
              target="_blank"
              className="btn btn-primary"
              onClick={() => track('cv_resume_download', { source: 'hero' })}
            >
              <LuDownload size={16} aria-hidden="true" /> Download résumé
            </Link>
            <a
              href={`mailto:${c.email}`}
              className="btn btn-secondary"
              onClick={() => track('cv_contact_click', { channel: 'email', source: 'hero_cta' })}
            >
              Get in touch
            </a>
          </motion.div>

          <motion.ul className="social-row" aria-label="Social profiles" {...fade(0.42)}>
            <SocialIcon href={c.linkedin} label="LinkedIn" platform="linkedin">
              <FaLinkedin size={18} />
            </SocialIcon>
            <SocialIcon href={c.github} label="GitHub" platform="github">
              <FaGithub size={18} />
            </SocialIcon>
            <SocialIcon href={c.leetcode} label="LeetCode" platform="leetcode">
              <SiLeetcode size={18} />
            </SocialIcon>
            <SocialIcon href={c.youtube} label="YouTube" platform="youtube">
              <FaYoutube size={18} />
            </SocialIcon>
          </motion.ul>
        </div>

        <motion.aside
          className="hero-stats"
          aria-label="Career highlights"
          initial={reduced ? false : 'hidden'}
          animate={reduced ? undefined : 'visible'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
          }}
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              className="stat-card"
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
              }}
            >
              <div className="stat-value">
                <CountUp value={s.value} />
              </div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </motion.aside>
      </div>
    </section>
  )
}

function SocialIcon({
  href,
  label,
  platform,
  children,
}: {
  href: string
  label: string
  platform: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer me"
        aria-label={label}
        className="social-icon"
        onClick={() => track('cv_social_click', { platform })}
      >
        {children}
      </Link>
    </li>
  )
}
