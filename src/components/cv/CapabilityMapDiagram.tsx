import type { CSSProperties, ReactNode } from "react";

export const capabilityKeys = [
  "crossDevice",
  "rollouts",
  "zeroToPilot",
  "multiTenant",
  "leadership",
  "fintech"
] as const;
export type CapabilityKey = (typeof capabilityKeys)[number];

export const MAP_VIEWBOX = { x: 0, y: 0, w: 1200, h: 660 };

/** Zone bounds in viewBox units; the compact layout zooms the camera onto one. */
export const zoneBounds: Record<
  CapabilityKey,
  { x: number; y: number; w: number; h: number }
> = {
  crossDevice: { x: 30, y: 30, w: 420, h: 280 },
  rollouts: { x: 470, y: 30, w: 270, h: 300 },
  zeroToPilot: { x: 760, y: 30, w: 410, h: 280 },
  multiTenant: { x: 30, y: 350, w: 420, h: 280 },
  leadership: { x: 470, y: 350, w: 270, h: 280 },
  fintech: { x: 760, y: 350, w: 410, h: 280 }
};

// Edge geometry lives here so the stroke and the packet riding it share one path.
const P = {
  syncOut: "M222 128 C 272 92, 300 92, 348 118",
  syncBack: "M348 168 C 300 200, 272 200, 222 166",
  flagTenant: "M605 106 C 605 128, 528 128, 528 146",
  flagSegment: "M605 106 L 605 146",
  flagEnv: "M605 106 C 605 128, 682 128, 682 146",
  session: "M846 236 L 878 236",
  laneA: "M182 420 C 214 420, 214 466, 238 470",
  laneB: "M182 490 L 238 490",
  laneC: "M182 560 C 214 560, 214 514, 238 510",
  tokenA: "M346 470 C 366 466, 366 420, 384 420",
  tokenB: "M346 490 L 384 490",
  tokenC: "M346 510 C 366 514, 366 560, 384 560",
  toGtel: "M892 486 C 960 486, 970 432, 1038 432",
  toNapas: "M892 506 C 960 506, 970 552, 1038 552",
  retry: "M1090 576 C 1090 628, 842 628, 842 522",
  // Links between zones: practices that travelled from one system to another.
  defaultOff: "M554 84 C 500 70, 470 96, 420 112",
  killSwitch: "M656 84 C 700 70, 740 92, 788 112",
  teamToFlags: "M605 432 C 605 380, 605 360, 605 318",
  teamToGateway: "M700 500 C 730 500, 756 496, 788 496"
};

type ZoneProps = {
  id: CapabilityKey;
  active: CapabilityKey;
  onSelect: (key: CapabilityKey) => void;
  children: ReactNode;
};

function Zone({ id, active, onSelect, children }: ZoneProps) {
  const b = zoneBounds[id];
  return (
    <g
      className={id === active ? "cm-zone is-active" : "cm-zone"}
      onClick={() => onSelect(id)}
    >
      <rect
        className="cm-zone-hit"
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={22}
      />
      {children}
    </g>
  );
}

function Packets({ paths, dur = 2.4 }: { paths: string[]; dur?: number }) {
  return (
    <g className="cm-packets">
      {paths.map((d, i) => (
        <circle key={d} r={4}>
          <animateMotion
            dur={`${dur}s`}
            begin={`${(i * dur) / paths.length}s`}
            repeatCount="indefinite"
            path={d}
          />
        </circle>
      ))}
    </g>
  );
}

type DrawingProps = { figure: string; live: boolean };

/** Edges a packet rides in each shared drawing; case files replay them once. */
export const zonePacketPaths = {
  multiTenant: [P.laneA, P.laneB, P.laneC, P.tokenA, P.tokenB, P.tokenC],
  zeroToPilot: [P.session]
};

/** The zeroToPilot zone drawing, shared with its case file in Projects. */
export function ZeroToPilotDrawing({ figure, live }: DrawingProps) {
  return (
    <>
      <text className="cm-figure" x={1140} y={60} textAnchor="end">
        {figure}
      </text>
      <rect
        className="cm-node is-host"
        x={790}
        y={78}
        width={350}
        height={212}
        rx={20}
      />
      <text className="cm-label" x={812} y={108}>
        VETC app
      </text>
      <text className="cm-note" x={812} y={128}>
        4.3M users
      </text>
      <rect
        className="cm-node is-key"
        x={878}
        y={150}
        width={238}
        height={122}
        rx={14}
      />
      <text className="cm-label" x={896} y={178}>
        BonBon
      </text>
      <text className="cm-note" x={896} y={197}>
        mini app · 12 screens
      </text>
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          className="cm-tile"
          style={{ "--i": i } as CSSProperties}
          x={896 + (i % 6) * 34}
          y={212 + Math.floor(i / 6) * 26}
          width={28}
          height={20}
          rx={4}
        />
      ))}
      <circle className="cm-node is-key" cx={834} cy={236} r={12} />
      <circle className="cm-key" cx={829} cy={236} r={4} />
      <path className="cm-key" d="M833 236 H 842 M 839.5 236 v 3.5" />
      <path className="cm-edge" d={P.session} />
      <text className="cm-note" x={812} y={274}>
        session
      </text>
      {live && <Packets paths={[P.session]} dur={1.2} />}
    </>
  );
}

/** The multiTenant zone drawing, shared with its case file in Projects. */
export function MultiTenantDrawing({ figure, live }: DrawingProps) {
  return (
    <>
      <text className="cm-figure" x={240} y={392} textAnchor="middle">
        {figure}
      </text>
      {(["A", "B", "C"] as const).map((name, i) => (
        <g key={name} className={`cm-lane lane-${i}`}>
          <rect
            className="cm-node"
            x={56}
            y={404 + i * 70}
            width={126}
            height={32}
            rx={16}
          />
          <text
            className="cm-note"
            x={119}
            y={425 + i * 70}
            textAnchor="middle"
          >
            tenant {name}
          </text>
          <rect
            className="cm-node"
            x={384}
            y={404 + i * 70}
            width={56}
            height={32}
            rx={16}
          />
          <text
            className="cm-note"
            x={412}
            y={425 + i * 70}
            textAnchor="middle"
          >
            token
          </text>
        </g>
      ))}
      <path className="cm-edge lane-0" d={P.laneA} />
      <path className="cm-edge lane-1" d={P.laneB} />
      <path className="cm-edge lane-2" d={P.laneC} />
      <path className="cm-edge lane-0" d={P.tokenA} />
      <path className="cm-edge lane-1" d={P.tokenB} />
      <path className="cm-edge lane-2" d={P.tokenC} />
      <rect
        className="cm-node is-key"
        x={238}
        y={456}
        width={108}
        height={68}
        rx={12}
      />
      <text className="cm-label" x={292} y={485} textAnchor="middle">
        OIDC
      </text>
      <text className="cm-note" x={292} y={505} textAnchor="middle">
        OAuth 2.1
      </text>
      <text className="cm-note" x={292} y={612} textAnchor="middle">
        web · Electron
      </text>
      {live && (
        <Packets
          paths={[P.laneA, P.laneB, P.laneC, P.tokenA, P.tokenB, P.tokenC]}
          dur={2.4}
        />
      )}
    </>
  );
}

type DiagramProps = {
  active: CapabilityKey;
  onSelect: (key: CapabilityKey) => void;
  figures: Record<CapabilityKey, string>;
  animate: boolean;
};

export default function CapabilityMapDiagram({
  active,
  onSelect,
  figures,
  animate
}: DiagramProps) {
  const zone = { active, onSelect };
  const live = (key: CapabilityKey) => animate && active === key;

  return (
    <>
      <g className="cm-links">
        <path d={P.defaultOff} />
        <path d={P.killSwitch} />
        <path d={P.teamToFlags} />
        <path d={P.teamToGateway} />
        <text x={488} y={66} textAnchor="middle">
          default off
        </text>
        <text x={722} y={66} textAnchor="middle">
          kill-switch
        </text>
        <text x={618} y={378}>
          same team
        </text>
      </g>

      <Zone id="crossDevice" {...zone}>
        <text className="cm-figure" x={285} y={70} textAnchor="middle">
          {figures.crossDevice}
        </text>
        <rect
          className="cm-node"
          x={70}
          y={98}
          width={152}
          height={98}
          rx={10}
        />
        <rect
          className="cm-screen"
          x={82}
          y={110}
          width={128}
          height={74}
          rx={4}
        />
        <path className="cm-stroke" d="M146 196 L 146 214 M118 216 L 174 216" />
        <rect
          className="cm-node"
          x={348}
          y={84}
          width={66}
          height={124}
          rx={14}
        />
        <rect
          className="cm-screen"
          x={356}
          y={100}
          width={50}
          height={90}
          rx={4}
        />
        <path className="cm-edge" d={P.syncOut} />
        <path className="cm-edge" d={P.syncBack} />
        <text className="cm-label" x={146} y={246} textAnchor="middle">
          Zalo PC
        </text>
        <text className="cm-label" x={381} y={246} textAnchor="middle">
          Mobile
        </text>
        <text className="cm-note" x={285} y={150} textAnchor="middle">
          sync v2
        </text>
        <text className="cm-note" x={285} y={282} textAnchor="middle">
          grouped retry · backup → restore
        </text>
        {live("crossDevice") && (
          <Packets paths={[P.syncOut, P.syncBack]} dur={1.6} />
        )}
      </Zone>

      <Zone id="rollouts" {...zone}>
        <rect
          className="cm-node is-key"
          x={554}
          y={66}
          width={102}
          height={40}
          rx={20}
        />
        <rect
          className="cm-switch"
          x={568}
          y={78}
          width={28}
          height={16}
          rx={8}
        />
        <circle className="cm-switch-knob" cx={588} cy={86} r={5} />
        <text className="cm-label" x={606} y={91}>
          flag
        </text>
        <path className="cm-edge" d={P.flagTenant} />
        <path className="cm-edge" d={P.flagSegment} />
        <path className="cm-edge" d={P.flagEnv} />
        {[
          ["tenant", 528],
          ["segment", 605],
          ["env", 682]
        ].map(([label, x]) => (
          <g key={label}>
            <rect
              className="cm-node"
              x={Number(x) - 36}
              y={146}
              width={72}
              height={28}
              rx={14}
            />
            <text className="cm-note" x={Number(x)} y={165} textAnchor="middle">
              {label}
            </text>
          </g>
        ))}
        {Array.from({ length: 30 }, (_, i) => (
          <rect
            key={i}
            className="cm-tenant"
            style={{ "--i": i } as CSSProperties}
            x={517 + (i % 10) * 18}
            y={198 + Math.floor(i / 10) * 18}
            width={13}
            height={13}
            rx={3}
          />
        ))}
        <text className="cm-figure" x={605} y={292} textAnchor="middle">
          {figures.rollouts}
        </text>
        {live("rollouts") && (
          <Packets paths={[P.flagTenant, P.flagSegment, P.flagEnv]} dur={1.8} />
        )}
      </Zone>

      <Zone id="zeroToPilot" {...zone}>
        <ZeroToPilotDrawing figure={figures.zeroToPilot} live={live("zeroToPilot")} />
      </Zone>

      <Zone id="multiTenant" {...zone}>
        <MultiTenantDrawing figure={figures.multiTenant} live={live("multiTenant")} />
      </Zone>

      <Zone id="leadership" {...zone}>
        <text className="cm-figure" x={605} y={470} textAnchor="middle">
          {figures.leadership}
        </text>
        {Array.from({ length: 11 }, (_, i) => {
          const qc = i >= 8;
          const col = qc ? i - 8 : i % 4;
          const row = qc ? 2 : Math.floor(i / 4);
          return (
            <circle
              key={i}
              className={qc ? "cm-person is-qc" : "cm-person"}
              style={{ "--i": i } as CSSProperties}
              cx={(qc ? 573 : 557) + col * 32}
              cy={500 + row * 34}
              r={10}
            />
          );
        })}
        <text className="cm-note" x={676} y={521}>
          dev
        </text>
        <text className="cm-note is-qc" x={676} y={572}>
          QC
        </text>
      </Zone>

      <Zone id="fintech" {...zone}>
        <rect
          className="cm-node"
          x={788}
          y={472}
          width={104}
          height={48}
          rx={12}
        />
        <text className="cm-label" x={840} y={502} textAnchor="middle">
          core
        </text>
        <path className="cm-edge" d={P.toGtel} />
        <path className="cm-edge" d={P.toNapas} />
        <rect
          className="cm-node is-key"
          x={1038}
          y={410}
          width={104}
          height={44}
          rx={12}
        />
        <text className="cm-label" x={1090} y={438} textAnchor="middle">
          Gtel
        </text>
        <rect
          className="cm-node is-key"
          x={1038}
          y={530}
          width={104}
          height={44}
          rx={12}
        />
        <text className="cm-label" x={1090} y={558} textAnchor="middle">
          Napas
        </text>
        <g className="cm-lock" transform="translate(956 482)">
          <rect x={-9} y={-2} width={18} height={14} rx={3} />
          <path d="M-5 -2 V -6 a5 5 0 0 1 10 0 V -2" />
        </g>
        <text className="cm-note" x={965} y={402} textAnchor="middle">
          mTLS · RSA-4096 · AES-256
        </text>
        <path className="cm-edge is-dashed" d={P.retry} />
        <text className="cm-note" x={966} y={642} textAnchor="middle">
          retry queue · idempotent replay
        </text>
        {live("fintech") && (
          <Packets paths={[P.toGtel, P.toNapas, P.retry]} dur={2.2} />
        )}
      </Zone>
    </>
  );
}
