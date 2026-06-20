# Documentation

This folder documents the technical shape of the Nguyen Le Phong profile site.
It is written for mixed audiences: engineers should be able to locate the
important files quickly, and non-technical readers should still understand what
the system does.

## Start Here

- [Technical Specification](./technical-specification.md) explains the product
  purpose, tech stack, routing, content model, analytics, deployment, and
  operational rules.
- [Diagrams](./diagrams/) contains PlantUML files written in a C4-style view of
  the system.

## PlantUML Diagrams

The diagrams use the public C4-PlantUML include files:

```plantuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml
```

Render them with any PlantUML-capable editor, or from the command line:

```bash
plantuml docs/diagrams/*.puml
```

If your PlantUML environment cannot access the internet, download the required
C4-PlantUML include files locally and replace the `!include` URLs in each
diagram.

## Scope

These documents describe the current repository architecture. They do not
change routing, locale behavior, SEO paths, analytics, Firebase engagement, or
deployment behavior.
