'use client'
import { profileInfo } from '@/app/app.const'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'

export default function Summary() {
  const { description, skills } = profileInfo.summary
  return (
    <>
      <Stagger className="prose" stagger={0.06}>
        {description.map((html) => (
          <StaggerItem key={html}>
            <p className="prose-p" dangerouslySetInnerHTML={{ __html: html }} />
          </StaggerItem>
        ))}
      </Stagger>
      <Stagger as="ul" className="skill-list" stagger={0.05}>
        {skills.map((html) => (
          <StaggerItem
            as="li"
            key={html}
            className="skill-list-item"
          >
            <span dangerouslySetInnerHTML={{ __html: html }} />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  )
}
