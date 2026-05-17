import { profileInfo } from '@/app/app.const'
import Hero from '@/components/cv/Hero'
import Section from '@/components/cv/Section'
import Summary from '@/components/cv/Summary'
import Experience from '@/components/cv/Experience'
import Projects from '@/components/cv/Projects'
import ContactCTA from '@/components/cv/ContactCTA'
import PageViewTracker from '@/components/PageViewTracker'

export default function MainPage() {
  return (
    <main>
      <PageViewTracker />
      <div className="container">
        <Hero />

        <Section id="about" eyebrow="Profile" title="Who I am, in one read">
          <Summary />
        </Section>

        <Section id="experience" eyebrow="Career" title="Where I've shipped">
          <Experience data={profileInfo.experience} />
        </Section>

        <Section id="projects" eyebrow="Work" title="Selected projects">
          <Projects data={profileInfo.projects} />
        </Section>

        <div id="contact">
          <ContactCTA />
        </div>
      </div>
    </main>
  )
}
