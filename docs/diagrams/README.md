# PlantUML Diagrams

These diagrams use PlantUML with C4-PlantUML includes.

| Diagram                                                        | Purpose                                                                                            |
|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| [c4-context.puml](./c4-context.puml)                           | System context: people, the site, and external systems.                                            |
| [c4-container.puml](./c4-container.puml)                       | Containers: static Next.js app, content data, client enhancements, OG pipeline, external services. |
| [c4-component-content.puml](./c4-component-content.puml)       | Components involved in routing, i18n, content loading, metadata, and OG generation.                |
| [c4-component-engagement.puml](./c4-component-engagement.puml) | Components involved in analytics and Firebase engagement counters.                                 |
| [c4-deployment.puml](./c4-deployment.puml)                     | Deployment view from developer machine to GitHub Pages and visitor browsers.                       |

Render all diagrams:

```bash
plantuml docs/diagrams/*.puml
```
