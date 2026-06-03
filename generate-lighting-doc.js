const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, PageNumber, AlignmentType, HeadingLevel, WidthType,
  BorderStyle, ShadingType, PageBreak
} = require("docx");
const fs = require("fs");

// Palette: Deep Sea Tech (DM-1 style) — fits 3D/tech project
const P = {
  primary: "162235",
  body: "1C2A3D",
  secondary: "6878A0",
  accent: "37DCF2",
  surface: "EDF3F5",
  headerBg: "1B6B7A",
  headerText: "FFFFFF",
  innerLine: "C8DDE2",
};
const c = (hex) => hex;

// Table helper — Horizontal-Only with accent header
function makeTable(headers, rows, colWidths) {
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 2, color: P.headerBg },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: P.headerBg },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.innerLine },
    insideVertical: { style: BorderStyle.NONE },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) =>
      new TableCell({
        width: { size: colWidths[i], type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: P.headerBg },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: P.headerText, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
      })
    ),
  });

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      cantSplit: true,
      children: row.map((cell, ci) =>
        new TableCell({
          width: { size: colWidths[ci], type: WidthType.PERCENTAGE },
          shading: ri % 2 === 0 ? { type: ShadingType.CLEAR, fill: P.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
          margins: { top: 50, bottom: 50, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 20, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
        })
      ),
    })
  );

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [headerRow, ...dataRows] });
}

// Heading builders
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, size: 24, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 420 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 22, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}
function bodyNoIndent(text) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 22, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}
function code(text) {
  return new Paragraph({
    spacing: { line: 280, after: 40 },
    indent: { left: 400 },
    children: [new TextRun({ text, size: 18, color: P.secondary, font: { ascii: "Consolas", eastAsia: "Consolas" } })],
  });
}

// ===================== DOCUMENT CONTENT =====================

const coverChildren = [
  new Paragraph({ spacing: { before: 3600 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "INSTOD", size: 56, bold: true, color: P.headerBg, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "3D Interior Design Previewer", size: 28, color: P.secondary, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent.replace("#",""), space: 20 } },
    indent: { left: 3000, right: 3000 },
    children: [],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Complete Lighting System Documentation", size: 36, bold: true, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: "Technical Reference — Every Light, Every Parameter, Every Mood", size: 22, color: P.secondary, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "Next.js + Three.js r184+ (Physically Correct Lighting)", size: 20, color: P.secondary, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Last Updated: June 2, 2026", size: 20, color: P.secondary, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  }),
];

const bodyChildren = [
  // ========== SECTION 1: ARCHITECTURE OVERVIEW ==========
  h1("1. Lighting Architecture Overview"),

  body("The Instod 3D Interior Design Previewer employs a multi-layered physically-based lighting system built on Three.js r184+, which uses candela (cd) as the standard intensity unit for all physically correct light sources. The system is architected around four distinct lighting layers that work together to create realistic interior illumination: a global scene lighting layer providing ambient baseline illumination, a ceiling light system with five fixture presets that deliver the primary room illumination, a furniture embedded light system where individual furniture pieces carry their own light sources, and a mood/skin override system that dynamically adjusts all light parameters based on the selected atmospheric mood and room skin."),

  body("The entire lighting pipeline runs through React Three Fiber with the ACES Filmic tone mapping curve, ensuring that high-dynamic-range light intensities (ranging from 25 cd for subtle fill lights up to 1800 cd for panel ceiling lights) are smoothly compressed into displayable ranges. Tone mapping exposure varies per mood from 1.0 (daylight) down to 0.5 (night), allowing the same physical light intensities to produce dramatically different visual results without recalculating individual light values."),

  body("A critical architectural decision is the use of physically correct decay (decay=2) on all SpotLights, meaning light intensity falls off with the inverse square of distance from the source. When the range parameter is set to 0, Three.js treats this as infinite range with natural falloff. The shadow camera far plane is dynamically calculated as h * 1.5 (where h is room height) when range equals 0, preventing the catastrophic degenerate frustum bug that occurred when far was previously set to 0."),

  h2("1.1 Light Type Inventory"),

  makeTable(
    ["Light Type", "Class", "Count", "Primary Use", "Unit"],
    [
      ["AmbientLight", "THREE.AmbientLight", "1", "Baseline room illumination", "N/A (scalar)"],
      ["HemisphereLight", "THREE.HemisphereLight", "1", "Sky/ground color gradient", "N/A (scalar)"],
      ["DirectionalLight (Main)", "THREE.DirectionalLight", "1", "Sun-like directional fill + shadows", "N/A (scalar)"],
      ["DirectionalLight (Fill)", "THREE.DirectionalLight", "1", "Cool-toned fill from opposite side", "N/A (scalar)"],
      ["Ceiling SpotLight", "THREE.SpotLight", "2-4", "Primary room downlighting", "Candela (cd)"],
      ["Ceiling Fill PointLight", "THREE.PointLight", "2-4", "Ambient fill per ceiling fixture", "Candela (cd)"],
      ["Room Fill PointLight", "THREE.PointLight", "1", "Central room ambient fill", "Candela (cd)"],
      ["Furniture PointLight", "THREE.PointLight", "1 per lamp", "Local furniture illumination", "Candela (cd)"],
      ["Chandelier Tip PointLight", "THREE.PointLight", "6", "Per-arm crystal glow", "Candela (cd)"],
    ],
    [25, 22, 10, 28, 15]
  ),

  // ========== SECTION 2: GLOBAL SCENE LIGHTS ==========
  h1("2. Global Scene Lights"),

  body("These four persistent lights are created once during scene initialization and remain active across all room configurations. Their parameters are updated dynamically whenever the user changes the lighting mood or applies a room skin. Together they provide the ambient baseline upon which all ceiling and furniture lights layer their contributions."),

  h2("2.1 AmbientLight"),
  body("The AmbientLight provides a uniform, non-directional baseline illumination across the entire room. It uses a warm cream color (0xFFE8D0) that mimics the scattered light bouncing off warm interior surfaces. The default intensity of 0.5 ensures that even without any ceiling or furniture lights, the room is never completely dark, which is critical for usability since users need to see the room geometry when placing furniture. In night mood, the intensity drops dramatically to 0.08, allowing ceiling and furniture lights to become the dominant illumination sources and creating a realistic nighttime atmosphere."),

  makeTable(
    ["Mood", "Color (Hex)", "Intensity"],
    [
      ["Daylight", "0xFFE8D0", "0.3"],
      ["Golden Hour", "0xFFD8A0", "0.25"],
      ["Evening", "0xFFC880", "0.15"],
      ["Night", "0xFFE0A0", "0.08"],
      ["Default (startup)", "0xFFE8D0", "0.5"],
    ],
    [30, 35, 35]
  ),

  h2("2.2 HemisphereLight"),
  body("The HemisphereLight simulates the color gradient between sky and ground, providing a subtle directional quality to the ambient illumination. The sky color (0xFFF5E6) is a warm near-white representing indoor ceiling reflection, while the ground color (0x8B7355) is a warm brown representing floor absorption. In night mood, both colors shift to deep blue-blacks (0x1A1A2E sky, 0x0D0D15 ground) with intensity dropping to 0.08, effectively removing the sky contribution and allowing the ceiling lights to dominate the scene."),

  makeTable(
    ["Mood", "Sky Color", "Ground Color", "Intensity"],
    [
      ["Daylight", "0xFFF5E6", "0x8B7355", "0.2"],
      ["Golden Hour", "0xFFF0C0", "0x8B7355", "0.15"],
      ["Evening", "0xD8A070", "0x6B5340", "0.12"],
      ["Night", "0x1A1A2E", "0x0D0D15", "0.08"],
    ],
    [25, 25, 25, 25]
  ),

  h2("2.3 DirectionalLight (Main)"),
  body("The main DirectionalLight simulates sunlight entering through the room's windows, positioned at (4, 8, 5) relative to the room center. This light casts shadows and is the primary source of directional shadow mapping in the scene. The shadow map resolution is 2048x2048 on desktop and 1024x1024 on mobile, with the shadow camera frustum spanning a 20x20 unit square (left=-10, right=10, top=10, bottom=-10) and extending from near=0.5 to far=30. A shadow bias of -0.001 prevents shadow acne, and on desktop a shadow blur radius of 4 produces soft, realistic shadow edges. The light uses a warm white color (0xFFF0D8) that shifts warmer and dims progressively through golden, evening, and night moods."),

  makeTable(
    ["Property", "Desktop", "Mobile"],
    [
      ["Color", "0xFFF0D8", "0xFFF0D8"],
      ["Intensity (daylight)", "0.8", "0.8"],
      ["Position", "(4, 8, 5)", "(4, 8, 5)"],
      ["castShadow", "true", "true"],
      ["shadow.mapSize", "2048x2048", "1024x1024"],
      ["shadow.camera extents", "left=-10, right=10, top=10, bottom=-10", "Same"],
      ["shadow.camera near/far", "0.5 / 30", "0.5 / 30"],
      ["shadow.bias", "-0.001", "-0.001"],
      ["shadow.radius", "4", "Not set (default 1)"],
    ],
    [40, 30, 30]
  ),

  h2("2.4 DirectionalLight (Fill)"),
  body("The fill DirectionalLight is positioned at (-4, 5, -3), opposite to the main light, and provides a subtle cool-toned fill (0xE0E8F0) that prevents the shadow side of objects from appearing completely dark. This mimics the real-world phenomenon of light bouncing off walls and surfaces to illuminate shadowed areas. The fill light never casts shadows, keeping the shadow pass efficient. In night mood, its color shifts to a deep blue (0x4455AA) at intensity 0.02, providing just the faintest hint of moonlight fill."),

  makeTable(
    ["Mood", "Color", "Intensity"],
    [
      ["Daylight", "0xE0E8F0", "0.1"],
      ["Golden Hour", "0xFFE8C0", "0.08"],
      ["Evening", "0xFFC880", "0.05"],
      ["Night", "0x4455AA", "0.02"],
    ],
    [30, 35, 35]
  ),

  // ========== SECTION 3: MOOD SYSTEM ==========
  h1("3. Lighting Mood System"),

  body("The mood system is the master controller for the entire lighting pipeline. When a mood is selected, it simultaneously updates the background color, fog density and color, all four global scene lights, the renderer tone mapping exposure, and the ceiling light color palette. This ensures a cohesive atmospheric shift rather than isolated parameter changes. The four moods represent distinct times of day and emotional atmospheres."),

  h2("3.1 Mood Parameters"),

  makeTable(
    ["Parameter", "Daylight", "Golden Hour", "Evening", "Night"],
    [
      ["Background / Fog", "0xF5F0E8", "0xF0E0C8", "0xD8C8B0", "0x2A2825"],
      ["Ambient Color", "0xFFE8D0", "0xFFD8A0", "0xFFC880", "0xFFE0A0"],
      ["Ambient Intensity", "0.3", "0.25", "0.15", "0.08"],
      ["Dir Light Color", "0xFFF0D8", "0xFFE0A0", "0xFFE8C0", "0xFFE0A0"],
      ["Dir Light Intensity", "0.8", "0.6", "0.4", "0.1"],
      ["Hemi Sky / Ground", "0xFFF5E6 / 0x8B7355", "0xFFF0C0 / 0x8B7355", "0xD8A070 / 0x6B5340", "0x1A1A2E / 0x0D0D15"],
      ["Hemi Intensity", "0.2", "0.15", "0.12", "0.08"],
      ["Fill Color", "0xE0E8F0", "0xFFE8C0", "0xFFC880", "0x4455AA"],
      ["Fill Intensity", "0.1", "0.08", "0.05", "0.02"],
      ["Tone Mapping Exposure", "1.0", "1.05", "0.85", "0.5"],
      ["Ceiling Light Color", "0xFFEED0", "0xFFEED0", "0xFFEED0", "0xFFE8C0"],
      ["Ceiling Spot Intensity", "800 cd", "800 cd", "800 cd", "1200 cd"],
      ["Fog Density", "0.018", "0.018", "0.018", "0.018"],
    ],
    [25, 19, 19, 19, 18]
  ),

  body("A critical detail: in night mood, ceiling SpotLight intensity increases from 800 cd to 1200 cd while the global ambient drops to 0.08. This inversion is physically motivated: in a dark room, artificial ceiling lights must be brighter relative to the ambient to appear as the primary light source. The tone mapping exposure simultaneously drops to 0.5, which compresses the high candela values back into a perceptually dark scene, creating the illusion of a dimly lit room where the ceiling lights are the dominant but not overwhelming source."),

  // ========== SECTION 4: CEILING LIGHT SYSTEM ==========
  h1("4. Ceiling Light System"),

  body("The ceiling light system is the primary illumination layer for the room, providing top-down directional lighting through SpotLights with accompanying fill PointLights. The system supports five fixture presets (Recessed, Chandelier, Track, Panel, Pendant Row), each with distinct visual geometry and light distribution characteristics. All ceiling lights share a common set of helper functions for creating SpotLights, PointLights, fill lights, and emissive bulb meshes, ensuring consistency in shadow configuration and parameter handling."),

  h2("4.1 Shared Constants"),

  makeTable(
    ["Constant", "Daylight Value", "Night Value", "Notes"],
    [
      ["lightColor", "0xFFEED0", "0xFFE8C0", "Warm white vs warmer amber"],
      ["mainIntensity", "800 cd", "1200 cd", "Primary SpotLight candela"],
      ["fillIntensity", "40 cd", "60 cd", "Per-fixture fill PointLight"],
      ["secondaryIntensity", "500 cd", "800 cd", "Track/Pendant SpotLight cd"],
      ["secondaryFill", "25 cd", "40 cd", "Track/Pendant fill cd"],
      ["spotRange", "0", "0", "0 = infinite, rely on decay=2"],
      ["spotAngle", "PI/4 (45 deg)", "PI/4 (45 deg)", "Cone half-angle"],
      ["shadowMapSize", "512/1024", "512/1024", "Mobile/Desktop"],
      ["maxShadowLights", "2/4", "2/4", "Mobile/Desktop limit"],
    ],
    [25, 20, 20, 35]
  ),

  h2("4.2 SpotLight Helper: createSpot()"),

  body("The createSpot() helper generates a SpotLight with the correct physically correct parameters and optional shadow configuration. All SpotLights use penumbra=1.0 (fully soft edges) and decay=2 (physically correct inverse-square falloff). When shadow casting is enabled and the shadow light budget has not been exceeded, the shadow map is configured with near=0.3, far=h*1.5 (room height times 1.5), bias=-0.002, and radius=4 on desktop or 2 on mobile. The shadow.camera.far calculation uses the formula range > 0 ? range : h * 1.5, which was a critical bug fix: previously when spotRange was 0, the far plane was also set to 0, creating a degenerate shadow frustum where no shadows could render at all."),

  makeTable(
    ["Property", "Value"],
    [
      ["color", "isNight ? 0xFFE8C0 : 0xFFEED0"],
      ["intensity", "Variable (800/1200/500/1800 cd)"],
      ["range", "0 (infinite with decay=2)"],
      ["angle", "PI/4 (45 deg) or PI/3 (60 deg for Panel)"],
      ["penumbra", "1.0 (fully soft edges)"],
      ["decay", "2 (physically correct inverse-square)"],
      ["castShadow", "Conditional (limited by maxShadowLights)"],
      ["shadow.mapSize", "512x512 (mobile) / 1024x1024 (desktop)"],
      ["shadow.camera.near", "0.3"],
      ["shadow.camera.far", "h * 1.5 (when range=0)"],
      ["shadow.bias", "-0.002"],
      ["shadow.radius", "2 (mobile) / 4 (desktop)"],
    ],
    [40, 60]
  ),

  h2("4.3 PointLight Helper: createPoint()"),

  body("The createPoint() helper creates a PointLight with the same shadow configuration pattern as createSpot(). PointLights are used for omni-directional light sources where a cone-shaped beam is not appropriate, such as the central light in a chandelier. In Three.js r184+, the default decay value for PointLight is 2 (physically correct), so it does not need to be explicitly set. The shadow configuration mirrors the SpotLight helper exactly, with the same near/far/bias/radius values and the same mobile/desktop adaptive quality scaling."),

  h2("4.4 Fill Light Helper: createFill()"),

  body("Fill lights are simplified PointLights that never cast shadows. They provide ambient room illumination from the ceiling fixture position, softening the hard SpotLight cone and preventing the ceiling area from appearing artificially dark. Because they do not cast shadows, they are very inexpensive on the GPU and can be added to every ceiling fixture without impacting the shadow map budget. Typical intensities range from 25 cd (track/pendant fill) to 108 cd (panel fill, which uses 1.8x multiplier)."),

  h2("4.5 Emissive Bulb Helper: createBulb()"),

  body("Every ceiling fixture includes a small emissive sphere that visually represents the light source. The bulb uses a MeshStandardMaterial with emissive color and emissive intensity that increase in night mode (emissiveIntensity 3.0 night vs 2.0 day), creating the visual illusion of a glowing light bulb. The bulb geometry is a SphereGeometry with a small radius (typically 0.03-0.05 units), and it is positioned just below the fixture housing so it is visible to the camera. Without the emissive bulb, the light source would be invisible, and users would see a bright room with an apparently empty fixture."),

  // ========== SECTION 5: CEILING LIGHT PRESETS ==========
  h1("5. Ceiling Light Presets"),

  h2("5.1 Recessed (Default)"),

  body("The Recessed preset is the default ceiling light configuration, consisting of two ceiling-mounted can lights positioned at x=-1.5 and x=1.5 along the room's center line. Each recessed light includes a cylindrical housing mesh (CylinderGeometry 0.12 top, 0.15 bottom, 0.03 height), an emissive ring (RingGeometry inner 0.04, outer 0.11) that glows with emissiveIntensity 3.0 at night or 1.5 during day, and a small emissive bulb sphere at the fixture opening. The SpotLight points straight down from the fixture to the floor with a 45-degree cone angle, and the first two lights in the scene are allowed to cast shadows (limited by the maxShadowLights budget). Each fixture also includes a fill PointLight at 40/60 cd to soften the cone edges."),

  makeTable(
    ["Component", "Parameter", "Value"],
    [
      ["SpotLight", "intensity", "800 cd (day) / 1200 cd (night)"],
      ["SpotLight", "angle", "PI/4 (45 deg)"],
      ["SpotLight", "castShadow", "true (first 2 only)"],
      ["Fill PointLight", "intensity", "40 cd (day) / 60 cd (night)"],
      ["Fill PointLight", "castShadow", "false"],
      ["Emissive Ring", "emissiveIntensity", "1.5 (day) / 3.0 (night)"],
      ["Emissive Bulb", "emissiveIntensity", "2.0 (day) / 3.0 (night)"],
      ["Default Positions", "x, z", "(-1.5, 0) and (1.5, 0)"],
      ["Group Y Position", "height", "h - 0.015 (flush with ceiling)"],
    ],
    [25, 25, 50]
  ),

  h2("5.2 Chandelier"),

  body("The Chandelier preset creates a single central fixture with a brass mounting plate, a connecting rod, a spherical hub, and six radiating arms each tipped with a crystal sphere and a small PointLight. This is the most complex fixture geometry, featuring 6 arm-tip lights at 50/80 cd each (no shadow), a central PointLight at 800/1200 cd with shadow casting, a central fill at 40/60 cd, and a larger central emissive bulb (radius 0.05). The chandelier is positioned at the first spot position, creating a dramatic focal point in the room center. The crystal spheres use an emissive material with emissiveIntensity 0.5 (day) or 1.0 (night), giving them a subtle inner glow that mimics real crystal chandelier refraction."),

  makeTable(
    ["Component", "Parameter", "Value"],
    [
      ["Central PointLight", "intensity", "800 cd (day) / 1200 cd (night)"],
      ["Central PointLight", "castShadow", "true"],
      ["Central Fill PointLight", "intensity", "40 cd (day) / 60 cd (night)"],
      ["Arm-Tip PointLight (x6)", "intensity", "50 cd (day) / 80 cd (night)"],
      ["Arm-Tip PointLight (x6)", "castShadow", "false"],
      ["Arm-Tip PointLight (x6)", "range", "4 (limited reach)"],
      ["Crystal Emissive", "emissiveIntensity", "0.5 (day) / 1.0 (night)"],
      ["Central Emissive Bulb", "radius", "0.05"],
      ["Fixture Y Position", "height", "h - 0.02"],
    ],
    [30, 25, 45]
  ),

  h2("5.3 Track Light"),

  body("The Track Light preset installs a horizontal track bar (BoxGeometry) across the ceiling with up to four adjustable heads. Each head includes a connector cylinder, a housing cylinder, an emissive bulb, a SpotLight, and a fill PointLight. The track head SpotLights use the secondary intensity values (500/800 cd) rather than the main intensity, since multiple heads distribute the light across the room. Only the first two heads are allowed to cast shadows. The track bar geometry adapts to the number of heads and their spacing, creating a realistic commercial-style track lighting appearance."),

  makeTable(
    ["Component", "Parameter", "Value"],
    [
      ["Head SpotLight", "intensity", "500 cd (day) / 800 cd (night)"],
      ["Head SpotLight", "castShadow", "true (first 2 only)"],
      ["Head Fill PointLight", "intensity", "25 cd (day) / 40 cd (night)"],
      ["Head Fill PointLight", "castShadow", "false"],
      ["Max Heads", "count", "min(4, spotPositions.length)"],
      ["Track Bar", "geometry", "BoxGeometry(trackLen, 0.04, 0.06)"],
      ["Head Y Offset", "position", "h - 0.04 (below track)"],
    ],
    [30, 25, 45]
  ),

  h2("5.4 Panel Light"),

  body("The Panel Light preset creates a large rectangular ceiling panel with a uniformly emissive surface and a powerful central SpotLight. The panel surface uses a PlaneGeometry rotated face-down with high emissive intensity (2.5 night, 1.5 day), creating the visual impression of a flat LED panel. The central SpotLight uses 1.5x the main intensity (1200/1800 cd) with a wider 60-degree cone angle (PI/3 instead of PI/4), providing broad, even illumination across the room. The fill PointLight uses a 1.8x multiplier (72/108 cd) and is positioned lower (y=-0.3) to spread the ambient fill more evenly. This preset is the most powerful single ceiling fixture, suitable for modern minimalist rooms."),

  makeTable(
    ["Component", "Parameter", "Value"],
    [
      ["Main SpotLight", "intensity", "1200 cd (day) / 1800 cd (night)"],
      ["Main SpotLight", "angle", "PI/3 (60 deg)"],
      ["Main SpotLight", "castShadow", "true"],
      ["Fill PointLight", "intensity", "72 cd (day) / 108 cd (night)"],
      ["Fill PointLight", "position y", "-0.3 (lower than other presets)"],
      ["Panel Surface", "emissiveIntensity", "1.5 (day) / 2.5 (night)"],
      ["Panel Surface", "roughness", "0.3"],
    ],
    [30, 25, 45]
  ),

  h2("5.5 Pendant Row"),

  body("The Pendant Row preset installs up to three hanging pendant lights, one per spot position. Each pendant consists of a ceiling mount, a thin rod (0.5 units long), a cylindrical shade, an inner glow cylinder, and an emissive bulb. The SpotLight uses secondary intensity (500/800 cd) and only the first pendant is allowed to cast shadows to stay within the shadow budget. The shade geometry (cylinder tapering from 0.04 to 0.12 radius) creates a realistic lamp shade silhouette, while the inner glow cylinder uses emissive material to simulate light leaking through the shade."),

  makeTable(
    ["Component", "Parameter", "Value"],
    [
      ["Pendant SpotLight", "intensity", "500 cd (day) / 800 cd (night)"],
      ["Pendant SpotLight", "castShadow", "true (first pendant only)"],
      ["Pendant Fill PointLight", "intensity", "25 cd (day) / 40 cd (night)"],
      ["Inner Glow", "emissiveIntensity", "1.5 (day) / 2.5 (night)"],
      ["Max Pendants", "count", "min(3, spotPositions.length)"],
      ["Rod Length", "height", "0.5 units"],
      ["Shade Taper", "radii", "0.04 (top) to 0.12 (bottom)"],
    ],
    [30, 25, 45]
  ),

  // ========== SECTION 6: ROOM FILL LIGHT ==========
  h1("6. Room Fill Light"),

  body("A single dedicated PointLight is positioned at the center of the room at 70% of the room height (y = h * 0.7), providing a gentle ambient fill that prevents dark pockets in areas not directly covered by ceiling SpotLight cones or furniture lights. This light never casts shadows and uses the same warm lightColor as the ceiling fixtures. Its intensity is relatively low at 25 cd (day) or 40 cd (night), making it a subtle contribution that fills gaps rather than dominating the scene. In night mode, the room fill intensity increases to compensate for the reduced global ambient, ensuring that areas between ceiling lights remain subtly visible rather than falling to complete blackness."),

  makeTable(
    ["Property", "Daylight", "Night"],
    [
      ["Color", "0xFFEED0", "0xFFE8C0"],
      ["Intensity", "25 cd", "40 cd"],
      ["Range", "0 (infinite)", "0 (infinite)"],
      ["Position", "(0, h * 0.7, 0)", "(0, h * 0.7, 0)"],
      ["castShadow", "false", "false"],
      ["Name", "roomFillLight", "roomFillLight"],
    ],
    [30, 35, 35]
  ),

  // ========== SECTION 7: CLICK-TO-ADD CEILING LIGHT ==========
  h1("7. Click-to-Add Ceiling Light"),

  body("When a user clicks on the ceiling in edit mode, a new recessed ceiling light is dynamically added at the click position. This light uses the same parameters as the built-in recessed preset: SpotLight at 800/1200 cd with 45-degree cone and decay=2, plus a fill PointLight at 40/60 cd. The light includes an emissive bulb mesh with slightly different emissive intensity values than the buildRoom version (2.0/1.2 vs 3.0/2.0 for built-in lights)."),

  body("The ceiling-edit-mode tap handler provides an alternate code path that explicitly sets shadow parameters when shadowsOn is true: castShadow=true, shadow.mapSize 512x512 (mobile) or 1024x1024 (desktop), shadow.camera.near=0.3, shadow.camera.far=h*1.5, shadow.bias=-0.002, and shadow.radius 2 (mobile) or 4 (desktop). This ensures dynamically-added lights receive the same shadow quality as pre-built lights."),

  makeTable(
    ["Component", "Parameter", "Value"],
    [
      ["SpotLight", "intensity", "800 cd (day) / 1200 cd (night)"],
      ["SpotLight", "angle", "PI/4 (45 deg)"],
      ["SpotLight", "penumbra", "1.0"],
      ["SpotLight", "decay", "2"],
      ["Fill PointLight", "intensity", "40 cd (day) / 60 cd (night)"],
      ["Emissive Bulb", "emissiveIntensity", "1.2 (day) / 2.0 (night)"],
      ["Shadow (edit mode)", "mapSize", "512/1024 (mobile/desktop)"],
      ["Shadow (edit mode)", "camera.far", "h * 1.5"],
      ["Shadow (edit mode)", "bias", "-0.002"],
    ],
    [25, 25, 50]
  ),

  // ========== SECTION 8: FURNITURE EMBEDDED LIGHTS ==========
  h1("8. Furniture Embedded Lights"),

  body("Three furniture items include embedded PointLights that provide localized illumination, simulating real-world floor lamps, pendant lights, and table lamps. These lights are defined in the furniture-builders.ts module and are attached directly to the furniture group, so they move and rotate with the furniture when the user repositions items. Each furniture light casts shadows with a 512x512 shadow map, which is sufficient for the smaller illumination range of furniture-scale lights without consuming excessive GPU resources."),

  h2("8.1 Floor Lamp"),

  body("The Floor Lamp includes a single PointLight positioned at the top of the lamp pole (y=1.5), emitting 600 cd with a range of 8 units. This provides a warm pool of light on the ceiling and surrounding floor area, mimicking a real floor lamp's uplight effect. The shadow camera far plane matches the light range at 8 units, ensuring shadows are calculated only within the illuminated area. The lamp's emissive bulb uses emissive color 0xFFE8A0 with emissiveIntensity 1.5, creating a visible glowing bulb at the lamp's top."),

  makeTable(
    ["Property", "Value"],
    [
      ["Light Type", "THREE.PointLight"],
      ["Color", "0xFFE8C0"],
      ["Intensity", "600 cd"],
      ["Range", "8 units"],
      ["Position Y", "1.5 (top of pole)"],
      ["castShadow", "true"],
      ["shadow.mapSize", "512x512"],
      ["shadow.camera.near", "0.2"],
      ["shadow.camera.far", "8"],
      ["shadow.bias", "-0.002"],
      ["shadow.radius", "3"],
      ["Emissive Bulb Color", "0xFFF5E0"],
      ["Emissive Color", "0xFFE8A0"],
      ["Emissive Intensity", "1.5"],
    ],
    [40, 60]
  ),

  h2("8.2 Pendant Light"),

  body("The Pendant Light furniture item hangs from the ceiling and emits 900 cd from a PointLight positioned at roomH - 0.9 (just below the ceiling, inside the shade). The range of 10 units provides illumination across a larger area than the floor lamp, making it suitable for dining tables or kitchen islands. The shadow camera far plane is set to 10 units. The emissive bulb has emissiveIntensity 1.8, the brightest among furniture lights, reflecting the pendant's higher candela output."),

  makeTable(
    ["Property", "Value"],
    [
      ["Light Type", "THREE.PointLight"],
      ["Color", "0xFFE0A0"],
      ["Intensity", "900 cd"],
      ["Range", "10 units"],
      ["Position Y", "roomH - 0.9"],
      ["castShadow", "true"],
      ["shadow.mapSize", "512x512"],
      ["shadow.camera.near", "0.2"],
      ["shadow.camera.far", "10"],
      ["shadow.bias", "-0.002"],
      ["shadow.radius", "3"],
      ["Emissive Bulb Color", "0xFFF5E0"],
      ["Emissive Color", "0xFFE0A0"],
      ["Emissive Intensity", "1.8"],
    ],
    [40, 60]
  ),

  h2("8.3 Table Lamp"),

  body("The Table Lamp is the most subtle furniture light, emitting 400 cd from a PointLight at y=0.38 (just under the shade) with a limited range of 5 units. This creates a small, intimate pool of light on the desk or table surface, perfect for reading or task lighting. The lower intensity and shorter range mean this light has minimal impact on the overall room illumination but provides crucial local detail lighting. The shadow camera far is set to 5, matching the range."),

  makeTable(
    ["Property", "Value"],
    [
      ["Light Type", "THREE.PointLight"],
      ["Color", "0xFFE8C0"],
      ["Intensity", "400 cd"],
      ["Range", "5 units"],
      ["Position Y", "0.38 (under shade)"],
      ["castShadow", "true"],
      ["shadow.mapSize", "512x512"],
      ["shadow.camera.near", "0.2"],
      ["shadow.camera.far", "5"],
      ["shadow.bias", "-0.002"],
      ["shadow.radius", "3"],
      ["Emissive Bulb Color", "0xFFF5E0"],
      ["Emissive Color", "0xFFE8C0"],
      ["Emissive Intensity", "1.5"],
    ],
    [40, 60]
  ),

  // ========== SECTION 9: CANDELA REFERENCE TABLE ==========
  h1("9. Complete Candela Reference"),

  body("The following table provides a consolidated reference of every light source in the system with its intensity in both daylight and night modes, along with shadow casting status. This is the authoritative reference for understanding the relative brightness of all lights and verifying that the physical intensity hierarchy is maintained."),

  makeTable(
    ["Light Source", "Day (cd)", "Night (cd)", "Shadow?"],
    [
      ["Ceiling SpotLight (Recessed)", "800", "1200", "First 2 (4 desktop)"],
      ["Ceiling SpotLight (Track Head)", "500", "800", "First 2"],
      ["Ceiling SpotLight (Panel)", "1200", "1800", "Yes"],
      ["Ceiling SpotLight (Pendant)", "500", "800", "First pendant only"],
      ["Ceiling Fill PointLight (Recessed)", "40", "60", "No"],
      ["Ceiling Fill PointLight (Track)", "25", "40", "No"],
      ["Ceiling Fill PointLight (Panel)", "72", "108", "No"],
      ["Ceiling Fill PointLight (Pendant)", "25", "40", "No"],
      ["Chandelier Central PointLight", "800", "1200", "Yes"],
      ["Chandelier Tip PointLight (x6)", "50", "80", "No"],
      ["Chandelier Fill PointLight", "40", "60", "No"],
      ["Room Fill PointLight", "25", "40", "No"],
      ["Floor Lamp PointLight", "600", "600", "Yes (512x512)"],
      ["Pendant Light PointLight", "900", "900", "Yes (512x512)"],
      ["Table Lamp PointLight", "400", "400", "Yes (512x512)"],
    ],
    [40, 20, 20, 20]
  ),

  body("Note: Furniture lights (Floor Lamp, Pendant Light, Table Lamp) currently use fixed candela values that do not change between day and night moods. This is a known limitation: in a future update, these lights should also adapt to mood changes, increasing intensity in night mode to compensate for reduced ambient, similar to how ceiling lights behave."),

  // ========== SECTION 10: MOBILE VS DESKTOP ==========
  h1("10. Mobile vs Desktop Adaptive Lighting"),

  body("The lighting system implements a comprehensive set of adaptive quality adjustments based on the isMobileRef flag, which is set once during initialization by detecting the device's screen width and touch capability. These adjustments ensure that the 3D scene runs at acceptable frame rates on mobile GPUs while maintaining visual quality on desktop hardware. The mobile detection affects shadow maps, shadow blur, maximum shadow-casting lights, renderer pixel ratio, antialiasing, and GPU power preference."),

  makeTable(
    ["Setting", "Desktop", "Mobile"],
    [
      ["Shadow Map Type", "PCFShadowMap", "BasicShadowMap"],
      ["Pixel Ratio Cap", "2.0", "1.5"],
      ["Antialiasing", "true", "false"],
      ["Power Preference", "high-performance", "low-power"],
      ["DirLight shadow.mapSize", "2048x2048", "1024x1024"],
      ["Ceiling SpotLight shadow.mapSize", "1024x1024", "512x512"],
      ["SpotLight shadow.radius", "4", "2"],
      ["DirLight shadow.radius", "4", "Not set (default 1)"],
      ["Max shadow-casting ceiling lights", "4", "2"],
      ["Renderer Antialias", "true", "false"],
    ],
    [40, 30, 30]
  ),

  body("The BasicShadowMap type on mobile produces harder shadow edges compared to the PCFShadowMap's soft shadows on desktop, but it avoids the multiple texture samples required by PCF filtering, significantly reducing GPU fragment shader invocations. Similarly, the lower shadow map resolutions on mobile (512x512 for ceiling lights vs 1024x1024 on desktop) reduce both VRAM usage and the cost of shadow map rendering passes. The limit of 2 shadow-casting ceiling lights on mobile (vs 4 on desktop) prevents the shadow pass from becoming a bottleneck when multiple SpotLights are present."),

  // ========== SECTION 11: RENDERER CONFIGURATION ==========
  h1("11. Renderer Configuration"),

  body("The WebGL renderer is configured with physically-correct lighting support through the ACES Filmic tone mapping curve, which provides a cinematic look by smoothly compressing high-dynamic-range values. The initial tone mapping exposure is 1.1, which is then overridden by the mood system to values ranging from 0.5 (night) to 1.05 (golden hour). The output color space is set to SRGBColorSpace for correct gamma handling. These settings ensure that the physically-correct candela values produce visually pleasing results without manual gamma adjustment."),

  makeTable(
    ["Property", "Value"],
    [
      ["toneMapping", "THREE.ACESFilmicToneMapping"],
      ["toneMappingExposure (initial)", "1.1"],
      ["outputColorSpace", "THREE.SRGBColorSpace"],
      ["Daylight Exposure", "1.0"],
      ["Golden Hour Exposure", "1.05"],
      ["Evening Exposure", "0.85"],
      ["Night Exposure", "0.5"],
    ],
    [50, 50]
  ),

  h2("11.1 Fog Configuration"),

  body("An exponential-squared fog (FogExp2) is applied to the scene with a constant density of 0.018 across all moods. Only the fog color changes per mood, matching the background color to create seamless depth fading. The fog provides subtle atmospheric perspective, making distant room walls appear slightly hazier and adding depth to the scene without being visually obvious."),

  makeTable(
    ["Mood", "Fog Color", "Density"],
    [
      ["Daylight", "0xF5F0E8", "0.018"],
      ["Golden Hour", "0xF0E0C8", "0.018"],
      ["Evening", "0xD8C8B0", "0.018"],
      ["Night", "0x2A2825", "0.018"],
    ],
    [35, 35, 30]
  ),

  // ========== SECTION 12: SKIN SYSTEM ==========
  h1("12. Skin System Lighting Overrides"),

  body("The room skin system provides an additional layer of lighting customization that adjusts ambient, directional, hemisphere, and fill light parameters based on the selected room material theme. Each of the six skins defines ambientColor, ambientIntensity, dirColor, dirIntensity, and exposure values that override the mood defaults. The hemisphere light intensity is automatically derived as ambientIntensity * 0.7, and the fill light intensity is derived as (dirIntensity || 1.0) * 0.2, maintaining consistent proportional relationships across all skin and mood combinations."),

  makeTable(
    ["Skin", "Ambient Color", "Ambient Intensity", "Dir Color", "Dir Intensity", "Exposure", "Background"],
    [
      ["Default", "#FFE8D0", "0.5", "#FFF0D8", "1.8", "1.1", "#F5F0E8"],
      ["Matte Black", "#FFD8A0", "0.3", "#FFE0A0", "0.8", "0.8", "#1A1815"],
      ["Nordic Light", "#FFE8D0", "0.6", "#FFF5E0", "2.0", "1.2", "#F8F5F0"],
      ["Luxury Marble", "#FFE8D0", "0.5", "#FFF0D8", "1.8", "1.1", "#F0E8E0"],
      ["Industrial Loft", "#FFE0C0", "0.4", "#FFE8D0", "1.2", "0.95", "#D8D0C8"],
      ["Japandi Zen", "#FFE8D0", "0.55", "#FFF0D8", "1.6", "1.05", "#F0E8E0"],
    ],
    [17, 14, 14, 14, 14, 12, 15]
  ),

  // ========== SECTION 13: SHADOW SYSTEM ==========
  h1("13. Shadow System"),

  body("The shadow system is budgeted to prevent performance degradation while maintaining visual quality. A global shadowLightCount variable tracks how many lights have been granted shadow-casting privilege, and is reset each time the room is built. The budget is 4 shadow-casting lights on desktop and 2 on mobile. This budget applies only to ceiling SpotLights and chandelier PointLights; the main DirectionalLight always casts shadows and is not counted against the ceiling budget. Furniture lights have their own independent shadow maps (512x512) and are not affected by the ceiling shadow budget."),

  h2("13.1 Shadow Toggle"),

  body("A global shadow toggle allows users to disable all shadows for maximum performance. When toggled off, the main DirectionalLight's castShadow is set to false and the renderer's shadowMap.enabled is set to false. This effectively disables all shadow rendering in a single operation. However, a known limitation is that this toggle does not individually update the castShadow property on ceiling SpotLights or furniture PointLights; it relies on the renderer-level disable to prevent their shadows from rendering. When shadows are re-enabled, only the DirectionalLight's castShadow is explicitly restored."),

  h2("13.2 Window Emissive"),

  body("Windows use an emissive glass material that simulates light transmission from outside. The emissive intensity is higher during daylight (0.4) and lower at night (0.1), reflecting the reduced outdoor illumination in the evening and nighttime. The glass color (0xC8DDE8) and emissive color (0x8AB8D0) create a subtle blue-tinted transparency that suggests sky light filtering through."),

  makeTable(
    ["Property", "Daylight Value", "Night Value"],
    [
      ["Glass Color", "0xC8DDE8", "0xC8DDE8"],
      ["Emissive Color", "0x8AB8D0", "0x8AB8D0"],
      ["Emissive Intensity", "0.4", "0.1"],
      ["Roughness", "0.1", "0.1"],
      ["Metalness", "0.1", "0.1"],
    ],
    [35, 35, 30]
  ),

  // ========== SECTION 14: VIEW PAGE LIGHTING ==========
  h1("14. View Page Lighting (view/[roomId])"),

  body("The shared room view page implements its own lighting system that mirrors the editor's setup but with some important differences. The four global scene lights (Ambient, Hemisphere, Directional main, Directional fill) use the same mood-dependent configuration, with slightly different intensity values in some moods (e.g., ambient intensity 0.6 in daylight vs 0.3 in the editor) to compensate for the absence of furniture lights and the simpler room geometry."),

  body("The ceiling lights on the view page use the same candela values as the editor (800/1200 cd for SpotLights, 40/60 cd for fill PointLights), but they do not configure shadow maps. This is a significant simplification: the view page ceiling lights have castShadow left at its default (false), meaning no shadows are cast by ceiling fixtures in shared room views. This was likely a performance decision for the read-only view page."),

  h2("14.1 View Page Furniture Lights (Known Issue)"),

  body("The view page implements its own simpler furniture builders with significantly lower light intensities using the old pre-r184 arbitrary unit system instead of candela values. The Floor Lamp uses 0.6 intensity (vs 600 cd), the Pendant uses 0.8 (vs 900 cd), and the Table Lamp uses 0.3 (vs 400 cd). These values are approximately 1000x too dim compared to the physically correct candela values used in the editor's furniture builders. This is a known inconsistency that should be addressed in a future update."),

  makeTable(
    ["Furniture", "Editor (cd)", "View Page (arb.)", "Ratio"],
    [
      ["Floor Lamp", "600 cd", "0.6", "~1000x"],
      ["Pendant Light", "900 cd", "0.8", "~1125x"],
      ["Table Lamp", "400 cd", "0.3", "~1333x"],
    ],
    [25, 25, 25, 25]
  ),
];

// ===================== ASSEMBLE DOCUMENT =====================

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 280, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  sections: [
    // Cover section
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: coverChildren,
    },
    // Body section
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Instod Lighting System Documentation", size: 16, color: P.secondary, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: P.secondary })],
            }),
          ],
        }),
      },
      children: bodyChildren,
    },
  ],
});

// Generate
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/Instod-Lighting-System-Documentation.docx", buf);
  console.log("Document generated successfully!");
});
