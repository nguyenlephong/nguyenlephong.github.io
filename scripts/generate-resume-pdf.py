#!/usr/bin/env python3
"""Generate the public ATS-friendly resume from the repository profile data."""

from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        HRFlowable,
        KeepTogether,
        PageBreak,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )
except ImportError as error:
    raise SystemExit(
        "Missing resume PDF dependencies. Run: "
        "python3 -m pip install reportlab pypdf"
    ) from error


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = PROJECT_ROOT / "output/pdf/NguyenLePhong_Lead_Software_Engineer.pdf"
PUBLIC_OUTPUT = PROJECT_ROOT / "public/NguyenLePhong_Lead_Software_Engineer.pdf"

NAVY = colors.HexColor("#17324D")
TEAL = colors.HexColor("#0B7189")
INK = colors.HexColor("#1B2631")
MUTED = colors.HexColor("#52606D")
RULE = colors.HexColor("#CBD5E1")
PALE = colors.HexColor("#F4F7FA")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def load_resume_data() -> dict:
    command = [
        "node",
        "--experimental-strip-types",
        "--no-warnings",
        str(PROJECT_ROOT / "scripts/export-resume-data.mjs"),
    ]
    result = subprocess.run(
        command,
        cwd=PROJECT_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def escaped(value: object) -> str:
    return html.escape(str(value), quote=True)


def build_styles() -> dict[str, ParagraphStyle]:
    styles = getSampleStyleSheet()
    return {
        "name": ParagraphStyle(
            "ResumeName",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=24,
            textColor=NAVY,
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "headline": ParagraphStyle(
            "ResumeHeadline",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=13,
            textColor=TEAL,
            alignment=TA_CENTER,
            spaceAfter=3,
        ),
        "contact": ParagraphStyle(
            "ResumeContact",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=10,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "section": ParagraphStyle(
            "ResumeSection",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=12,
            textColor=NAVY,
            spaceBefore=5,
            spaceAfter=2,
        ),
        "body": ParagraphStyle(
            "ResumeBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.4,
            leading=10.5,
            textColor=INK,
            spaceAfter=2.5,
        ),
        "body_small": ParagraphStyle(
            "ResumeBodySmall",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.7,
            leading=9.5,
            textColor=INK,
            spaceAfter=1.5,
        ),
        "bullet": ParagraphStyle(
            "ResumeBullet",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.1,
            leading=10.1,
            textColor=INK,
            leftIndent=10,
            firstLineIndent=-7,
            spaceAfter=1.7,
        ),
        "company": ParagraphStyle(
            "ResumeCompany",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=9.6,
            leading=11,
            textColor=NAVY,
        ),
        "role": ParagraphStyle(
            "ResumeRole",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.3,
            leading=10,
            textColor=TEAL,
        ),
        "meta": ParagraphStyle(
            "ResumeMeta",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.8,
            leading=9.5,
            textColor=MUTED,
            alignment=TA_RIGHT,
        ),
        "tech": ParagraphStyle(
            "ResumeTech",
            parent=styles["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=7.3,
            leading=9,
            textColor=MUTED,
            spaceAfter=3,
        ),
    }


def section_heading(title: str, styles: dict[str, ParagraphStyle]) -> list:
    return [
        Paragraph(escaped(title.upper()), styles["section"]),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceAfter=3),
    ]


def job_block(job: dict, styles: dict[str, ParagraphStyle]) -> list:
    heading = Table(
        [
            [
                Paragraph(escaped(job["company"]), styles["company"]),
                Paragraph(escaped(job["location"]), styles["meta"]),
            ],
            [
                Paragraph(escaped(job["title"]), styles["role"]),
                Paragraph(escaped(job["duration"]), styles["meta"]),
            ],
        ],
        colWidths=[118 * mm, 62 * mm],
        hAlign="LEFT",
    )
    heading.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 1),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 2),
            ]
        )
    )

    first_items = [heading]
    if job["summary"]:
        first_items.append(Paragraph(escaped(job["summary"]), styles["body_small"]))
    if job["contributions"]:
        first_items.append(
            Paragraph(f"- {escaped(job['contributions'][0])}", styles["bullet"])
        )

    items = [KeepTogether(first_items)]
    for contribution in job["contributions"][1:]:
        items.append(Paragraph(f"- {escaped(contribution)}", styles["bullet"]))
    if job["technologies"]:
        items.append(
            Paragraph(
                f"<b>Technologies:</b> {escaped(', '.join(job['technologies']))}",
                styles["tech"],
            )
        )
    return items


def footer(canvas, document) -> None:
    canvas.saveState()
    canvas.setTitle("Nguyen Le Phong - Lead Software Engineer Resume")
    canvas.setAuthor("Nguyen Le Phong")
    canvas.setSubject(
        "Lead Software Engineer resume - Zalo PC, LogiUP, BonBon, and technical leadership"
    )
    canvas.setKeywords(
        "Lead Software Engineer, Technical Lead, Zalo PC, LogiUP, BonBon, Go, Python, React, System Design"
    )
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.4)
    canvas.line(15 * mm, 10 * mm, A4[0] - 15 * mm, 10 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(15 * mm, 6.8 * mm, "Nguyen Le Phong | Lead Software Engineer")
    canvas.drawRightString(
        A4[0] - 15 * mm, 6.8 * mm, f"Page {document.page}"
    )
    canvas.restoreState()


def generate_pdf(data: dict, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    styles = build_styles()
    document = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=11 * mm,
        bottomMargin=14 * mm,
        title="Nguyen Le Phong - Lead Software Engineer Resume",
        author="Nguyen Le Phong",
        subject="Current Lead Software Engineer resume",
    )

    contact = data["contact"]
    contact_line = " | ".join(
        [
            escaped(contact["phone"]),
            f'<link href="mailto:{escaped(contact["email"])}">{escaped(contact["email"])}</link>',
            f'<link href="{escaped(contact["linkedin"])}">LinkedIn</link>',
            f'<link href="{escaped(contact["github"])}">GitHub</link>',
            f'<link href="{escaped(contact["portfolio"])}">Portfolio</link>',
        ]
    )

    story = [
        Paragraph(escaped(data["name"].upper()), styles["name"]),
        Paragraph(escaped(data["headline"]), styles["headline"]),
        Paragraph(contact_line, styles["contact"]),
        Paragraph(escaped(data["location"]), styles["contact"]),
        Spacer(1, 2),
    ]

    story.extend(section_heading("Professional Summary", styles))
    story.extend(Paragraph(escaped(item), styles["body"]) for item in data["summary"])

    story.extend(section_heading("Core Expertise", styles))
    strength_rows = [
        [
            Paragraph(f"<b>{escaped(item['label'])}</b>", styles["body_small"]),
            Paragraph(escaped(item["value"]), styles["body_small"]),
        ]
        for item in data["strengths"]
    ]
    strength_table = Table(strength_rows, colWidths=[40 * mm, 140 * mm])
    strength_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 0), (0, -1), PALE),
                ("BOX", (0, 0), (-1, -1), 0.35, RULE),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, RULE),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]
        )
    )
    story.append(strength_table)

    story.extend(section_heading("Professional Experience", styles))
    for index, job in enumerate(data["experience"]):
        if index == 3:
            story.append(PageBreak())
            story.extend(section_heading("Professional Experience - Continued", styles))
        story.extend(job_block(job, styles))

    story.extend(section_heading("Selected Projects", styles))
    for project in data["projects"]:
        project_heading = Table(
            [
                [
                    Paragraph(escaped(project["name"]), styles["company"]),
                    Paragraph(escaped(project["duration"]), styles["meta"]),
                ]
            ],
            colWidths=[140 * mm, 40 * mm],
        )
        project_heading.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
                ]
            )
        )
        project_first_items = [
            project_heading,
            Paragraph(
                f"<b>Technologies:</b> {escaped(', '.join(project['technologies']))}",
                styles["tech"],
            ),
        ]
        if project["accomplishments"]:
            project_first_items.append(
                Paragraph(
                    f"- {escaped(project['accomplishments'][0])}",
                    styles["bullet"],
                )
            )
        story.append(KeepTogether(project_first_items))
        for accomplishment in project["accomplishments"][1:]:
            story.append(
                Paragraph(f"- {escaped(accomplishment)}", styles["bullet"])
            )

    story.append(Spacer(1, 3))
    story.extend(section_heading("Education", styles))
    for item in data["education"]:
        education_row = Table(
            [
                [
                    Paragraph(
                        f"<b>{escaped(item['school'])}</b><br/>{escaped(item['degree'])} - GPA {escaped(item['gpa'])}",
                        styles["body"],
                    ),
                    Paragraph(escaped(item["duration"]), styles["meta"]),
                ]
            ],
            colWidths=[140 * mm, 40 * mm],
        )
        education_row.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )
        story.append(education_row)

    document.build(story, onFirstPage=footer, onLaterPages=footer)


def verify_pdf(output: Path) -> None:
    reader = PdfReader(str(output))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    normalized_text = re.sub(r"\s+", " ", text)
    required = [
        "Lead Software Engineer",
        "building production products",
        "Mar 2, 2026 - Present",
        "message backup",
        "zCloud offload",
        "LogiUP - Multi-tenant Logistics SaaS",
        "BonBon - VETC Mini App & Automotive Platform",
        "4-person engineering team",
        "Tech Lead and system architect",
        "Electron desktop",
        "OAuth 2.1/OIDC",
        "31 typed API endpoints",
        "Top 3 finalist",
        "$500K equity investment",
        "4.3M-user app ecosystem",
        "Aug 2025 - Mar 2026",
        "8+ years",
    ]
    missing = [value for value in required if value not in normalized_text]
    if missing:
        raise RuntimeError(f"Generated resume is missing required text: {missing}")
    if len(reader.pages) != 2:
        raise RuntimeError(
            f"Expected a concise two-page resume, generated {len(reader.pages)} pages"
        )
    if output.stat().st_size < 8_000:
        raise RuntimeError("Generated PDF is unexpectedly small")


def main() -> None:
    args = parse_args()
    output = args.output.resolve()
    data = load_resume_data()
    generate_pdf(data, output)
    verify_pdf(output)

    PUBLIC_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    if output != PUBLIC_OUTPUT.resolve():
        shutil.copy2(output, PUBLIC_OUTPUT)
    verify_pdf(PUBLIC_OUTPUT)

    print(f"Generated: {output.relative_to(PROJECT_ROOT)}")
    print(f"Published: {PUBLIC_OUTPUT.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, subprocess.CalledProcessError, RuntimeError) as error:
        print(f"Resume generation failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
