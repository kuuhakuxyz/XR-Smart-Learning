import {
  AchievementBadge,
  Announcement,
  AppNotification,
  ARMaterial,
  Assignment,
  AssignmentSubmission,
  DemoUser,
  LearningActivity,
  RecentActivityLog,
  StudentRosterRecord,
  SubjectMastery,
  VirtualClassroom,
  WeeklyStudyDay,
} from '../types';

export const ASSETS = {
  heroBanner: '/src/assets/images/xr_learning_hero_1794916232050.jpg',
  anatomyLab: '/src/assets/images/lab_human_anatomy_1794916232782.jpg',
  solarSystemLab: '/src/assets/images/lab_solar_system_1794916233568.jpg',
  earthScienceLab: '/src/assets/images/lab_earth_science_1794916233444.jpg',
  arDeskBackdrop: '/src/assets/images/ar_study_desk_backdrop_1794916233682.jpg',
};

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'stu-aiman',
    name: 'Aiman Hakim',
    role: 'student',
    institution: 'SMK Seri Hartamas, Kuala Lumpur',
    levelOrDepartment: 'Form 5 Science Stream (SPM)',
    initials: 'AH',
    email: 'aiman.hakim@student.moe.edu.my',
  },
  {
    id: 'stu-izzah',
    name: 'Nurul Izzah',
    role: 'student',
    institution: 'Universiti Malaya (UM)',
    levelOrDepartment: 'Year 1 · B.Sc. Biotechnology',
    initials: 'NI',
    email: 'nurul.izzah@siswa.um.edu.my',
  },
  {
    id: 'tch-farah',
    name: 'Dr. Farah Nadia',
    role: 'teacher',
    institution: 'SMK Seri Hartamas & UM STEM Hub',
    levelOrDepartment: 'Senior Biology & XR Coordinator',
    initials: 'FN',
    email: 'farah.nadia@xrsmart.edu.my',
  },
  {
    id: 'tch-razif',
    name: 'Encik Razif Zainal',
    role: 'teacher',
    institution: 'Kolej Matrikulasi Selangor',
    levelOrDepartment: 'Physics & Astronomy Lecturer',
    initials: 'RZ',
    email: 'razif.zainal@kms.edu.my',
  },
];

export const INITIAL_AR_MATERIALS: ARMaterial[] = [
  {
    id: 'ar-human-heart',
    title: 'Human Heart',
    subject: 'Biology',
    syllabusTag: 'KSSM Form 4 · Chapter 10',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    description:
      'Inspect the four chambers, major arterial vessels, and oxygenated vs. deoxygenated blood flow pathways in real-time 3D.',
    learningObjectives: [
      'Distinguish between the left and right ventricles and their muscular wall thickness.',
      'Trace systemic circulation from the left ventricle through the aorta.',
      'Identify the vena cava and pulmonary trunk connections.',
    ],
    modelTemplate: 'human-heart',
    parts: [
      {
        id: 'heart-lv',
        name: 'Left Ventricle',
        shortCode: 'LV',
        summary: 'Primary systemic pumping chamber with thick myocardium.',
        detail:
          'Receives oxygenated blood from the left atrium via the bicuspid (mitral) valve and contracts forcefully to eject blood through the aortic valve into the aorta.',
        keyFact: 'Wall thickness is roughly 3x thicker than the right ventricle.',
        anchorPosition: [0.42, -0.42, 0.45],
        meshKey: 'left-ventricle',
      },
      {
        id: 'heart-rv',
        name: 'Right Ventricle',
        shortCode: 'RV',
        summary: 'Pumps deoxygenated blood toward the lungs.',
        detail:
          'Receives venous blood from the right atrium via the tricuspid valve and propels it into the pulmonary trunk for gas exchange at the alveoli.',
        keyFact: 'Operates at roughly one-fifth the pressure of the left ventricle.',
        anchorPosition: [-0.45, -0.32, 0.42],
        meshKey: 'right-ventricle',
      },
      {
        id: 'heart-ra',
        name: 'Right Atrium',
        shortCode: 'RA',
        summary: 'Receives systemic venous return from the vena cava.',
        detail:
          'Houses the sinoatrial (SA) node — the heart’s natural pacemaker — and collects deoxygenated blood from the superior and inferior vena cava.',
        keyFact: 'SA node initiates ~72 electrical impulses per minute at rest.',
        anchorPosition: [-0.58, 0.42, 0.2],
        meshKey: 'right-atrium',
      },
      {
        id: 'heart-la',
        name: 'Left Atrium',
        shortCode: 'LA',
        summary: 'Collects freshly oxygenated blood from pulmonary veins.',
        detail:
          'Receives oxygen-rich blood returning from both lungs through four pulmonary veins before passing it downward into the left ventricle.',
        keyFact: 'Delivers blood during ventricular diastole.',
        anchorPosition: [0.55, 0.45, 0.15],
        meshKey: 'left-atrium',
      },
      {
        id: 'heart-aorta',
        name: 'Aorta Arch',
        shortCode: 'AO',
        summary: 'Largest elastic artery distributing oxygenated blood.',
        detail:
          'Arches superiorly from the left ventricle, giving off the brachiocephalic, left common carotid, and left subclavian arteries to supply the head and body.',
        keyFact: 'Elastic recoil maintains continuous diastolic blood pressure.',
        anchorPosition: [0.1, 0.95, 0.05],
        meshKey: 'aorta',
      },
      {
        id: 'heart-pulm',
        name: 'Pulmonary Artery',
        shortCode: 'PA',
        summary: 'Carries deoxygenated blood from right ventricle to lungs.',
        detail:
          'Emerges anteriorly from the right ventricle and bifurcates beneath the aortic arch into left and right pulmonary arteries.',
        keyFact: 'One of the few arteries in the body carrying deoxygenated blood.',
        anchorPosition: [-0.15, 0.72, 0.45],
        meshKey: 'pulmonary-artery',
      },
    ],
  },
  {
    id: 'ar-human-skeleton',
    title: 'Human Skeleton',
    subject: 'Biology',
    syllabusTag: 'KSSM Form 4 · Chapter 14',
    difficulty: 'Beginner',
    durationMinutes: 18,
    description:
      'Examine the axial and appendicular skeletal framework, joint articulations, and protective thoracic cage.',
    learningObjectives: [
      'Differentiate between the axial skeleton (skull, vertebral column, ribcage) and appendicular skeleton.',
      'Understand how the ribcage shields vital cardiopulmonary organs.',
      'Inspect ball-and-socket vs. hinge joint orientations.',
    ],
    modelTemplate: 'human-skeleton',
    parts: [
      {
        id: 'skel-cranium',
        name: 'Cranium & Mandible',
        shortCode: 'CR',
        summary: 'Fused cranial vault protecting the brain and sensory organs.',
        detail:
          'Composed of 22 bones including frontal, parietal, temporal, and occipital plates joined by fibrous sutures, plus the articulated mandible.',
        keyFact: 'The mandible is the only freely movable bone of the skull.',
        anchorPosition: [0, 1.48, 0.25],
        meshKey: 'cranium',
      },
      {
        id: 'skel-ribcage',
        name: 'Thoracic Ribcage',
        shortCode: 'RB',
        summary: 'Twelve pairs of curved ribs enclosing the heart and lungs.',
        detail:
          'True ribs (1–7) attach directly to the sternum via costal cartilage; false ribs (8–10) attach indirectly; floating ribs (11–12) anchor posteriorly.',
        keyFact: 'Expands upward and outward during inhalation via intercostal muscles.',
        anchorPosition: [0, 0.72, 0.36],
        meshKey: 'ribcage',
      },
      {
        id: 'skel-spine',
        name: 'Vertebral Column',
        shortCode: 'VC',
        summary: 'Flexible central axis housing the spinal cord.',
        detail:
          'Segmented into cervical (7), thoracic (12), lumbar (5), sacral, and coccygeal regions cushioned by fibrocartilage intervertebral discs.',
        keyFact: 'S-shaped curvature distributes axial body weight efficiently.',
        anchorPosition: [0, 0.4, -0.22],
        meshKey: 'spine',
      },
      {
        id: 'skel-pelvis',
        name: 'Pelvic Girdle',
        shortCode: 'PG',
        summary: 'Transfers upper-body weight to the lower limbs.',
        detail:
          'Formed by the paired hip bones (ilium, ischium, pubis) uniting with the sacrum to create deep acetabular sockets for the femurs.',
        keyFact: 'Supports abdominal viscera and anchors locomotion muscles.',
        anchorPosition: [0, -0.08, 0.25],
        meshKey: 'pelvis',
      },
      {
        id: 'skel-femur',
        name: 'Femur & Lower Limbs',
        shortCode: 'FM',
        summary: 'Longest and strongest tubular bone in the human body.',
        detail:
          'Articulates proximally at the hip ball-and-socket joint and distally at the knee hinge joint, bearing multiples of body weight during running.',
        keyFact: 'Cortical bone can withstand ~1,700 N of compressive force.',
        anchorPosition: [0.28, -0.78, 0.12],
        meshKey: 'femur',
      },
    ],
  },
  {
    id: 'ar-human-cell',
    title: 'Human Cell',
    subject: 'Biology',
    syllabusTag: 'KSSM Form 4 · Chapter 2',
    difficulty: 'Beginner',
    durationMinutes: 14,
    description:
      'Explore a cutaway eukaryotic animal cell revealing membrane-bound organelles responsible for energy, genetics, and protein synthesis.',
    learningObjectives: [
      'Locate the nucleus and explain its role in regulating cellular activities.',
      'Compare mitochondria ATP production with Golgi packaging.',
      'Observe the semi-permeable plasma membrane boundary.',
    ],
    modelTemplate: 'human-cell',
    parts: [
      {
        id: 'cell-nucleus',
        name: 'Nucleus & Nucleolus',
        shortCode: 'NU',
        summary: 'Genetic control center storing chromosomal DNA.',
        detail:
          'Enclosed by a double nuclear envelope with pores for mRNA export; the dense inner nucleolus synthesizes ribosomal RNA (rRNA).',
        keyFact: 'Contains ~2 meters of tightly coiled DNA per human cell.',
        anchorPosition: [0, 0.15, 0.15],
        meshKey: 'nucleus',
      },
      {
        id: 'cell-mito',
        name: 'Mitochondria',
        shortCode: 'MT',
        summary: 'Site of aerobic cellular respiration and ATP synthesis.',
        detail:
          'Double-membraned organelles whose folded inner cristae maximize surface area for oxidative phosphorylation.',
        keyFact: 'Muscle and cardiac cells contain thousands of mitochondria.',
        anchorPosition: [0.68, -0.1, 0.42],
        meshKey: 'mitochondria',
      },
      {
        id: 'cell-golgi',
        name: 'Golgi Apparatus',
        shortCode: 'GA',
        summary: 'Modifies, sorts, and packages proteins into vesicles.',
        detail:
          'Stacked flattened membranous sacs (cisternae) receiving transport vesicles from the endoplasmic reticulum and dispatching secretory vesicles.',
        keyFact: 'Produces lysosomes and prepares enzymes for exocytosis.',
        anchorPosition: [-0.62, -0.22, 0.35],
        meshKey: 'golgi',
      },
      {
        id: 'cell-er',
        name: 'Endoplasmic Reticulum',
        shortCode: 'ER',
        summary: 'Folded membrane network for protein and lipid synthesis.',
        detail:
          'Rough ER is studded with ribosomes translating secretory proteins; smooth ER synthesizes phospholipids and detoxifies metabolites.',
        keyFact: 'Directly continuous with the outer nuclear membrane.',
        anchorPosition: [0.35, 0.42, -0.3],
        meshKey: 'er',
      },
      {
        id: 'cell-membrane',
        name: 'Plasma Membrane',
        shortCode: 'PM',
        summary: 'Selectively permeable phospholipid bilayer boundary.',
        detail:
          'Regulates passive diffusion, osmosis, and active transport of ions and nutrients while housing surface receptor proteins.',
        keyFact: 'Described by the Fluid Mosaic Model (Singer & Nicolson).',
        anchorPosition: [-0.95, 0.35, 0.4],
        meshKey: 'membrane',
      },
    ],
  },
  {
    id: 'ar-water-molecule',
    title: 'Water Molecule',
    subject: 'Chemistry',
    syllabusTag: 'KSSM Form 4 · Chemical Bonds',
    difficulty: 'Beginner',
    durationMinutes: 10,
    description:
      'Visualize the bent covalent geometry of H₂O (104.5°), shared electron pairs, and molecular polarity.',
    learningObjectives: [
      'Understand why water adopts a bent V-shape instead of a linear geometry.',
      'Identify polar covalent O–H bonds and partial charges (δ⁻ / δ⁺).',
      'Relate molecular polarity to hydrogen bonding and high boiling point.',
    ],
    modelTemplate: 'water-molecule',
    parts: [
      {
        id: 'h2o-oxygen',
        name: 'Oxygen Atom (δ⁻)',
        shortCode: 'O',
        summary: 'Highly electronegative central atom pulling shared electrons.',
        detail:
          'Oxygen has 6 valence electrons, forming 2 single covalent bonds with hydrogen while retaining 2 unshared lone pairs that compress the bond angle.',
        keyFact: 'Electronegativity = 3.44 (Pauling scale), creating partial negative charge.',
        anchorPosition: [0, 0.38, 0.2],
        meshKey: 'oxygen',
      },
      {
        id: 'h2o-hydrogen',
        name: 'Hydrogen Atoms (δ⁺)',
        shortCode: 'H',
        summary: 'Two covalently bonded protons carrying partial positive charge.',
        detail:
          'Each hydrogen atom shares 1 electron with oxygen to achieve a stable duplet configuration, positioned symmetrically at 104.5° apart.',
        keyFact: 'Asymmetry ensures dipole moments do not cancel out.',
        anchorPosition: [-0.82, -0.45, 0.15],
        meshKey: 'hydrogen',
      },
      {
        id: 'h2o-bonds',
        name: 'Polar Covalent Bonds',
        shortCode: '104.5°',
        summary: 'Directional electron sharing at a 104.5° tetrahedral bend.',
        detail:
          'Lone-pair repulsion compresses the ideal 109.5° tetrahedral angle down to 104.5°, giving water its solvent power and surface tension.',
        keyFact: 'Bond length between O and H nuclei is 95.84 picometers.',
        anchorPosition: [0.46, -0.05, 0.15],
        meshKey: 'bonds',
      },
      {
        id: 'h2o-lonepairs',
        name: 'Lone-Pair Electron Lobes',
        shortCode: 'LP',
        summary: 'Two non-bonding electron pairs driving VSEPR geometry.',
        detail:
          'Occupy larger angular volume than bonding pairs, repelling the O–H bonds closer together and enabling up to four hydrogen bonds per molecule.',
        keyFact: 'Explains why ice floats (open hexagonal hydrogen-bonded lattice).',
        anchorPosition: [0, 0.85, -0.35],
        meshKey: 'lone-pairs',
      },
    ],
  },
  {
    id: 'ar-atomic-structure',
    title: 'Atomic Structure',
    subject: 'Chemistry',
    syllabusTag: 'KSSM Form 4 · Matter & Atomic Structure',
    difficulty: 'Intermediate',
    durationMinutes: 12,
    description:
      'Inspect a Carbon-12 Bohr planetary model showing nuclear protons, neutrons, and quantized electron energy shells.',
    learningObjectives: [
      'Identify subatomic particles (protons, neutrons, electrons) and their charges.',
      'Read electron arrangement (2.4 for Carbon) across K and L shells.',
      'Connect valence electron count to chemical bonding reactivity.',
    ],
    modelTemplate: 'atomic-structure',
    parts: [
      {
        id: 'atom-nucleus',
        name: 'Atomic Nucleus (6p⁺, 6n⁰)',
        shortCode: 'N',
        summary: 'Dense positively charged core containing protons and neutrons.',
        detail:
          'Accounts for over 99.9% of Carbon-12’s atomic mass within a radius 100,000 times smaller than the total atomic diameter.',
        keyFact: 'Proton number (Z = 6) uniquely defines the element Carbon.',
        anchorPosition: [0, 0.28, 0.25],
        meshKey: 'nucleus',
      },
      {
        id: 'atom-shell1',
        name: 'First Shell (n = 1, 2e⁻)',
        shortCode: 'K',
        summary: 'Innermost lowest-energy orbital holding up to 2 electrons.',
        detail:
          'Closest to the nucleus with strong electrostatic attraction; completely filled before electrons occupy the second shell.',
        keyFact: 'Maximum capacity follows the 2n² rule (2 × 1² = 2).',
        anchorPosition: [0.68, 0.12, 0.1],
        meshKey: 'inner-shell',
      },
      {
        id: 'atom-shell2',
        name: 'Valence Shell (n = 2, 4e⁻)',
        shortCode: 'L',
        summary: 'Outermost shell containing 4 valence electrons for covalent bonding.',
        detail:
          'With 4 valence electrons, Carbon readily forms four stable covalent bonds (tetravalency), underpinning all organic chemistry.',
        keyFact: 'Electron configuration of Carbon: 2.4 (Group 14, Period 2).',
        anchorPosition: [-1.15, -0.25, 0.25],
        meshKey: 'outer-shell',
      },
    ],
  },
  {
    id: 'ar-solar-system',
    title: 'Solar System',
    subject: 'Physics',
    syllabusTag: 'KSSM Form 2 & University Astrophysics',
    difficulty: 'Beginner',
    durationMinutes: 16,
    description:
      'Orbit around an interactive heliocentric Solar System comparing rocky terrestrial planets with outer gas and ice giants.',
    learningObjectives: [
      'Compare orbital radii and periods using Kepler’s Third Law.',
      'Distinguish inner terrestrial planets from outer Jovian giants.',
      'Inspect Earth’s habitable zone position and Saturn’s ring plane.',
    ],
    modelTemplate: 'solar-system',
    parts: [
      {
        id: 'sys-sun',
        name: 'The Sun (G2V Star)',
        shortCode: '☉',
        summary: 'Nuclear fusion core holding 99.86% of Solar System mass.',
        detail:
          'Converts ~600 million tonnes of hydrogen into helium every second via proton-proton fusion, radiating light and gravitational pull across all orbits.',
        keyFact: 'Surface photosphere temperature: ~5,778 K.',
        anchorPosition: [0, 0.55, 0],
        meshKey: 'sun',
      },
      {
        id: 'sys-terrestrial',
        name: 'Terrestrial Planets',
        shortCode: 'M·V·E·M',
        summary: 'Mercury, Venus, Earth, and Mars — dense rocky worlds.',
        detail:
          'Composed primarily of silicate rocks and metallic cores within 1.52 AU of the Sun; Earth sits cleanly in the liquid-water habitable zone.',
        keyFact: 'Earth orbital velocity averages 29.78 km/s.',
        anchorPosition: [1.05, 0.18, 0.3],
        meshKey: 'earth',
      },
      {
        id: 'sys-jupiter',
        name: 'Jupiter (Gas Giant)',
        shortCode: 'J',
        summary: 'Largest planet with immense magnetosphere and 95+ moons.',
        detail:
          'Composed predominantly of hydrogen and helium, its rapid 9.9-hour rotation drives banded zonal winds and the Great Red Spot.',
        keyFact: 'Mass is 2.5 times that of all other planets combined.',
        anchorPosition: [-1.55, 0.22, 0.55],
        meshKey: 'jupiter',
      },
      {
        id: 'sys-saturn',
        name: 'Saturn & Ring System',
        shortCode: 'S',
        summary: 'Iconic icy ring system spanning 282,000 km across.',
        detail:
          'Rings consist of billions of water-ice and rocky particles orbiting in a razor-thin equatorial sheet held by shepherd moons.',
        keyFact: 'Saturn’s mean density (0.687 g/cm³) is lower than liquid water.',
        anchorPosition: [1.85, 0.25, -0.75],
        meshKey: 'saturn',
      },
    ],
  },
  {
    id: 'ar-earth-layers',
    title: "Earth's Layers",
    subject: 'Geography',
    syllabusTag: 'KSSM Form 1 · Physical Geography',
    difficulty: 'Intermediate',
    durationMinutes: 14,
    description:
      'Slice open a cross-section of planet Earth to study the lithosphere crust, convecting mantle, liquid outer core, and solid inner core.',
    learningObjectives: [
      'Compare the depth, state of matter, and composition of Earth’s four main layers.',
      'Understand how mantle convection drives plate tectonics and earthquakes.',
      'Explain how the liquid iron outer core generates Earth’s geomagnetic field.',
    ],
    modelTemplate: 'earth-layers',
    parts: [
      {
        id: 'earth-crust',
        name: 'Crust & Lithosphere',
        shortCode: '0–70km',
        summary: 'Thin brittle outer shell divided into tectonic plates.',
        detail:
          'Oceanic crust (basalt, ~5–10 km thick) is denser than continental crust (granite, ~30–70 km thick), floating atop the asthenosphere.',
        keyFact: 'Represents less than 1% of Earth’s total planetary volume.',
        anchorPosition: [-0.88, 0.72, 0.45],
        meshKey: 'crust',
      },
      {
        id: 'earth-mantle',
        name: 'Silicate Mantle',
        shortCode: '2,890km',
        summary: 'Convecting semi-solid silicate rock driving plate motion.',
        detail:
          'Extends down to 2,890 km depth; slow thermal convection currents (cm/year) push continental drift, volcanism, and mountain building.',
        keyFact: 'Makes up ~84% of Earth’s total volume.',
        anchorPosition: [0.55, 0.45, 0.55],
        meshKey: 'mantle',
      },
      {
        id: 'earth-outer-core',
        name: 'Liquid Outer Core',
        shortCode: '2,260km',
        summary: 'Superheated molten iron-nickel dynamo generating magnetism.',
        detail:
          'Convecting liquid metal at 4,000–5,500 °C creates electric currents via the geodynamo, shielding Earth from solar wind.',
        keyFact: 'Seismic S-waves cannot travel through this liquid layer.',
        anchorPosition: [0.35, 0.1, 0.42],
        meshKey: 'outer-core',
      },
      {
        id: 'earth-inner-core',
        name: 'Solid Inner Core',
        shortCode: '1,220km',
        summary: 'Crystallized iron-nickel sphere under extreme pressure.',
        detail:
          'Despite temperatures exceeding 5,400 °C (comparable to the Sun’s surface), 3.6 million atmospheres of pressure compress it into a solid crystal.',
        keyFact: 'Grows slowly (~1 mm/year) as Earth’s interior cools.',
        anchorPosition: [0.05, 0.02, 0.25],
        meshKey: 'inner-core',
      },
    ],
  },
];

export const VIRTUAL_CLASSROOMS: VirtualClassroom[] = [
  {
    id: 'vc-anatomy-lab',
    title: 'Human Anatomy Laboratory',
    subject: 'Biology',
    instructor: 'Dr. Farah Nadia',
    syllabusTag: 'KSSM Form 4–5 & Pre-Med Lab',
    durationMinutes: 25,
    description:
      'Step inside a holographic medical research bay with three interactive stations covering cardiovascular circulation, skeletal biomechanics, and cellular ultrastructure.',
    previewImage: ASSETS.anatomyLab,
    environmentId: 'anatomy-lab',
    stations: [
      {
        id: 'st-heart',
        title: 'Cardiovascular Bay',
        areaLabel: 'Station 01 · North Bay',
        subtitle: 'Double-Circuit Heart & Vessel Flow',
        description:
          'Observe rhythmic systolic/diastolic contractions and compare pulmonary vs. systemic pressure circuits.',
        keyTakeaways: [
          'Right side pumps deoxygenated blood at low pressure to lungs.',
          'Left ventricle generates high pressure for systemic aortic delivery.',
          'Four one-way valves prevent retrograde blood backflow.',
        ],
        cameraPosition: [-3.2, 2.2, 4.2],
        lookAt: [-3.2, 1.1, 0],
        meshKey: 'station-heart',
        relatedMaterialId: 'ar-human-heart',
      },
      {
        id: 'st-skeleton',
        title: 'Osteology Rig',
        areaLabel: 'Station 02 · Center Stage',
        subtitle: 'Axial Support & Lever Mechanics',
        description:
          'Inspect how skeletal levers articulate with antagonistic muscle pairs to enable upright posture and locomotion.',
        keyTakeaways: [
          '206 adult bones divide into axial (80) and appendicular (126).',
          'Synovial fluid lubricates high-mobility ball-and-socket and hinge joints.',
          'Red bone marrow produces erythrocytes and immune leukocytes.',
        ],
        cameraPosition: [0, 2.3, 4.6],
        lookAt: [0, 1.25, 0],
        meshKey: 'station-skeleton',
        relatedMaterialId: 'ar-human-skeleton',
      },
      {
        id: 'st-cell',
        title: 'Cellular Bio-Console',
        areaLabel: 'Station 03 · East Bay',
        subtitle: 'Eukaryotic Organelle Synthesis',
        description:
          'Examine high-magnification cellular respiration and protein transport from nuclear DNA to the Golgi apparatus.',
        keyTakeaways: [
          'Mitochondria convert glucose + oxygen into usable ATP energy.',
          'Ribosomes translate mRNA blueprints into polypeptide chains.',
          'Phospholipid bilayers maintain selective intracellular homeostasis.',
        ],
        cameraPosition: [3.2, 2.2, 4.2],
        lookAt: [3.2, 1.1, 0],
        meshKey: 'station-cell',
        relatedMaterialId: 'ar-human-cell',
      },
    ],
  },
  {
    id: 'vc-solar-system',
    title: 'Solar System Exploration',
    subject: 'Physics',
    instructor: 'Encik Razif Zainal',
    syllabusTag: 'KSSM Form 2 & Astrophysics Foundation',
    durationMinutes: 20,
    description:
      'Navigate a deep-space planetarium dome featuring live orbital mechanics, solar radiation zones, and planetary ring dynamics.',
    previewImage: ASSETS.solarSystemLab,
    environmentId: 'solar-observatory',
    stations: [
      {
        id: 'st-sun-core',
        title: 'Helios Core Deck',
        areaLabel: 'Station 01 · Central Star',
        subtitle: 'Solar Gravity & Fusion Energy',
        description:
          'Study gravitational centripetal force keeping all eight planets bound in elliptical Keplerian orbits.',
        keyTakeaways: [
          'Gravitational attraction decreases inversely with the square of distance (1/r²).',
          'Solar wind shapes planetary magnetospheres and cometary tails.',
          'Nuclear fusion releases radiant energy powering Earth’s climate.',
        ],
        cameraPosition: [0, 2.5, 5.2],
        lookAt: [0, 1.0, 0],
        meshKey: 'station-sun',
        relatedMaterialId: 'ar-solar-system',
      },
      {
        id: 'st-earth-orbit',
        title: 'Goldilocks Zone',
        areaLabel: 'Station 02 · Inner Orbit',
        subtitle: 'Earth-Moon Orbital Dynamics',
        description:
          'Examine why 1.0 AU enables liquid oceans, seasonal axial tilt (23.5°), and lunar tidal locking.',
        keyTakeaways: [
          'Axial tilt of 23.5° causes seasonal variations in solar insolation.',
          'The Moon stabilizes Earth’s axial wobble and drives ocean tides.',
          'Atmospheric greenhouse balance prevents extreme thermal swings.',
        ],
        cameraPosition: [-2.8, 1.8, 3.8],
        lookAt: [-2.1, 0.9, 0.6],
        meshKey: 'station-earth-orbit',
        relatedMaterialId: 'ar-solar-system',
      },
      {
        id: 'st-outer-giants',
        title: 'Outer Ring Sector',
        areaLabel: 'Station 03 · Jovian Rim',
        subtitle: 'Gas Giants & Ring Resonance',
        description:
          'Observe Jupiter and Saturn’s massive gravitational wells and ice-particle ring structures beyond the frost line.',
        keyTakeaways: [
          'Low temperatures beyond the frost line allowed giant planets to accrete vast gas envelopes.',
          'Saturn’s Roche limit prevents icy ring debris from coalescing into a moon.',
          'Orbital periods lengthen dramatically with distance (T² ∝ r³).',
        ],
        cameraPosition: [3.6, 2.1, 4.0],
        lookAt: [2.8, 0.9, -0.5],
        meshKey: 'station-saturn',
        relatedMaterialId: 'ar-solar-system',
      },
    ],
  },
  {
    id: 'vc-earth-science',
    title: 'Earth & Environmental Science',
    subject: 'Geography',
    instructor: 'Puan Siti Aminah',
    syllabusTag: 'KSSM Geography & Environmental Systems',
    durationMinutes: 22,
    description:
      'Tour a virtual geophysical field station displaying Earth’s internal cross-section, tectonic plate boundaries, and atmospheric carbon monitoring.',
    previewImage: ASSETS.earthScienceLab,
    environmentId: 'earth-station',
    stations: [
      {
        id: 'st-core-cutaway',
        title: 'Planetary Interior',
        areaLabel: 'Station 01 · Geosphere Dome',
        subtitle: 'Crust, Mantle & Core Stratification',
        description:
          'Inspect seismic-wave evidence revealing Earth’s concentric density layers from granite crust to solid iron core.',
        keyTakeaways: [
          'Seismic P-waves refract and S-waves vanish at the liquid outer core boundary.',
          'Density increases steadily from 2.7 g/cm³ (crust) to 13 g/cm³ (inner core).',
          'Radioactive decay sustains internal geothermal heat flow.',
        ],
        cameraPosition: [-2.6, 2.1, 4.3],
        lookAt: [-2.6, 1.1, 0],
        meshKey: 'station-geosphere',
        relatedMaterialId: 'ar-earth-layers',
      },
      {
        id: 'st-tectonics',
        title: 'Tectonic Ridge Table',
        areaLabel: 'Station 02 · Fault Line Bay',
        subtitle: 'Convergent & Divergent Plate Motion',
        description:
          'Analyze how Sundaland stability compares with the nearby Ring of Fire subduction trenches across Southeast Asia.',
        keyTakeaways: [
          'Divergent ridges form new oceanic basalt crust via seafloor spreading.',
          'Subduction zones recycle dense oceanic plates into the mantle, triggering volcanoes.',
          'Malaysia sits on the stable Sunda Plate, though regional tremors propagate.',
        ],
        cameraPosition: [0.2, 2.4, 4.4],
        lookAt: [0.2, 0.9, 0],
        meshKey: 'station-tectonics',
        relatedMaterialId: 'ar-earth-layers',
      },
      {
        id: 'st-atmosphere',
        title: 'Climate Telemetry Mast',
        areaLabel: 'Station 03 · Eco Tower',
        subtitle: 'Tropical Hydrological & Carbon Cycles',
        description:
          'Review tropical rainforest carbon sequestration, monsoon moisture transport, and urban heat island mitigation.',
        keyTakeaways: [
          'Tropical dipterocarp forests act as vital terrestrial carbon sinks.',
          'Equatorial convection drives Northeast and Southwest Monsoon rainfall patterns.',
          'Protecting mangrove coastlines buffers storm surges and erosion.',
        ],
        cameraPosition: [3.1, 2.2, 4.1],
        lookAt: [3.1, 1.2, 0],
        meshKey: 'station-climate',
      },
    ],
  },
];

export const INITIAL_ACTIVITIES: LearningActivity[] = [
  {
    id: 'act-heart-quiz',
    title: 'Identify the Parts of the Human Heart',
    subject: 'Biology',
    difficulty: 'Intermediate',
    type: 'quiz',
    estimatedMinutes: 6,
    description:
      'Test your ability to distinguish heart chambers, valves, and major blood vessels studied in the 3D Heart model.',
    questions: [
      {
        id: 'hq-1',
        prompt: 'Which chamber has the thickest muscular wall to pump oxygenated blood throughout the entire body?',
        options: ['Right Atrium', 'Left Ventricle', 'Right Ventricle', 'Left Atrium'],
        correctIndex: 1,
        explanation:
          'The left ventricle must generate high systolic pressure to propel blood through the systemic circulation via the aorta.',
      },
      {
        id: 'hq-2',
        prompt: 'Which major vessel carries deoxygenated blood from the right ventricle directly to the lungs?',
        options: ['Aorta', 'Superior Vena Cava', 'Pulmonary Artery', 'Pulmonary Vein'],
        correctIndex: 2,
        explanation:
          'The pulmonary artery is an exception among arteries because it carries deoxygenated blood away from the heart to the lungs.',
      },
      {
        id: 'hq-3',
        prompt: 'Where is the sinoatrial (SA) node — the heart’s natural pacemaker — located?',
        options: ['Wall of the Right Atrium', 'Apex of the Left Ventricle', 'Base of the Aorta', 'Interventricular Septum'],
        correctIndex: 0,
        explanation:
          'The SA node sits in the upper wall of the right atrium and initiates each cardiac contraction wave.',
      },
      {
        id: 'hq-4',
        prompt: 'Which valve prevents backflow of blood from the left ventricle into the left atrium during systole?',
        options: ['Tricuspid Valve', 'Bicuspid (Mitral) Valve', 'Pulmonary Semilunar Valve', 'Aortic Valve'],
        correctIndex: 1,
        explanation:
          'The bicuspid (mitral) valve guards the left atrioventricular opening and snaps shut during ventricular contraction.',
      },
      {
        id: 'hq-5',
        prompt: 'Oxygenated blood returning from the lungs enters the heart through the:',
        options: ['Inferior Vena Cava into Right Atrium', 'Pulmonary Veins into Left Atrium', 'Aorta into Left Ventricle', 'Coronary Sinus into Right Ventricle'],
        correctIndex: 1,
        explanation:
          'Four pulmonary veins deliver freshly oxygenated blood from the left and right lungs into the left atrium.',
      },
    ],
  },
  {
    id: 'act-planets-match',
    title: 'Match Planets with Their Descriptions',
    subject: 'Physics',
    difficulty: 'Beginner',
    type: 'matching',
    estimatedMinutes: 5,
    description:
      'Drag and drop (or tap to assign) each Solar System body to its defining physical and orbital characteristic.',
    matchingPairs: [
      {
        id: 'pm-1',
        term: 'Mercury',
        matchLabel: 'Closest planet to the Sun with extreme day-night temperature swings',
        explanation: 'Without a substantial atmosphere, Mercury swings from 430 °C by day to -180 °C at night.',
      },
      {
        id: 'pm-2',
        term: 'Earth',
        matchLabel: 'Rocky world in the habitable zone sustaining liquid surface oceans',
        explanation: 'At 1.0 AU with a nitrogen-oxygen atmosphere, Earth maintains liquid water across 71% of its surface.',
      },
      {
        id: 'pm-3',
        term: 'Jupiter',
        matchLabel: 'Largest gas giant famous for its Great Red Spot storm',
        explanation: 'Jupiter’s mass exceeds all other Solar System planets combined and hosts an anticyclonic storm wider than Earth.',
      },
      {
        id: 'pm-4',
        term: 'Saturn',
        matchLabel: 'Low-density giant surrounded by an expansive water-ice ring plane',
        explanation: 'Saturn’s bright rings consist of countless reflective water-ice fragments orbiting along its equator.',
      },
    ],
  },
  {
    id: 'act-elements-quiz',
    title: 'Identify Chemical Elements & Bonding',
    subject: 'Chemistry',
    difficulty: 'Intermediate',
    type: 'quiz',
    estimatedMinutes: 6,
    description:
      'Evaluate your mastery of atomic structure, proton numbers, and covalent geometry from the Chemistry 3D models.',
    questions: [
      {
        id: 'cq-1',
        prompt: 'A Carbon-12 atom has proton number 6. What is its electron arrangement?',
        options: ['2.2.2', '2.4', '2.6', '4.2'],
        correctIndex: 1,
        explanation: 'The first shell holds 2 electrons and the remaining 4 occupy the second valence shell (2.4).',
      },
      {
        id: 'cq-2',
        prompt: 'Why does a water molecule (H₂O) form a bent shape with a 104.5° bond angle instead of a straight line?',
        options: [
          'Hydrogen atoms attract each other magnetically',
          'Two lone electron pairs on oxygen repel the bonding pairs',
          'Oxygen only has two valence electrons',
          'Water molecules are ionic crystals',
        ],
        correctIndex: 1,
        explanation: 'Lone-pair–bond-pair repulsion pushes the two O–H covalent bonds down from 109.5° to 104.5°.',
      },
      {
        id: 'cq-3',
        prompt: 'Which subatomic particle determines the chemical identity of an element in the Periodic Table?',
        options: ['Neutron', 'Proton', 'Valence Electron only', 'Alpha Particle'],
        correctIndex: 1,
        explanation: 'The proton number (atomic number Z) uniquely defines which element an atom belongs to.',
      },
      {
        id: 'cq-4',
        prompt: 'In an H₂O molecule, why does Oxygen carry a partial negative charge (δ⁻)?',
        options: [
          'It loses two electrons permanently to Hydrogen',
          'It has higher electronegativity and pulls shared electrons closer',
          'It contains more neutrons than protons',
          'Hydrogen repels electrons completely',
        ],
        correctIndex: 1,
        explanation: 'Oxygen’s strong electronegativity (3.44) draws shared electron density toward itself, creating molecular polarity.',
      },
    ],
  },
  {
    id: 'act-cell-label',
    title: 'Label the Parts of a Human Cell',
    subject: 'Biology',
    difficulty: 'Beginner',
    type: 'matching',
    estimatedMinutes: 5,
    description:
      'Match each eukaryotic organelle with its primary biological function inside the human cell.',
    matchingPairs: [
      {
        id: 'cl-1',
        term: 'Nucleus',
        matchLabel: 'Stores DNA chromosomes and regulates gene expression',
        explanation: 'The nucleus protects genetic instructions and coordinates cellular growth and division.',
      },
      {
        id: 'cl-2',
        term: 'Mitochondria',
        matchLabel: 'Generates ATP energy through aerobic cellular respiration',
        explanation: 'Inner cristae folds maximize ATP production from glucose and oxygen.',
      },
      {
        id: 'cl-3',
        term: 'Golgi Apparatus',
        matchLabel: 'Modifies, sorts, and packages proteins into secretory vesicles',
        explanation: 'Acts as the cell’s dispatch station receiving proteins from the endoplasmic reticulum.',
      },
      {
        id: 'cl-4',
        term: 'Plasma Membrane',
        matchLabel: 'Selectively permeable phospholipid bilayer controlling entry and exit',
        explanation: 'Maintains internal homeostasis by regulating ion channels, osmosis, and active transport.',
      },
    ],
  },
];

export const INITIAL_WEEKLY_ACTIVITY: WeeklyStudyDay[] = [
  { day: 'Mon', minutes: 35, modules: 2 },
  { day: 'Tue', minutes: 48, modules: 3 },
  { day: 'Wed', minutes: 25, modules: 1 },
  { day: 'Thu', minutes: 60, modules: 4 },
  { day: 'Fri', minutes: 42, modules: 2 },
  { day: 'Sat', minutes: 55, modules: 3 },
  { day: 'Sun', minutes: 30, modules: 2 },
];

export const INITIAL_SUBJECT_MASTERY: SubjectMastery[] = [
  { subject: 'Biology', score: 86, completedLessons: 6, totalLessons: 8 },
  { subject: 'Chemistry', score: 79, completedLessons: 4, totalLessons: 6 },
  { subject: 'Physics', score: 84, completedLessons: 5, totalLessons: 6 },
  { subject: 'Geography', score: 76, completedLessons: 3, totalLessons: 5 },
];

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'badge-ar-explorer',
    title: 'Spatial Explorer',
    description: 'Inspected 3 or more 3D/AR learning models across STEM subjects.',
    criteria: 'Inspect 3 AR/3D Models',
    unlocked: true,
    unlockedAt: '14 Nov 2026',
    category: 'ar',
  },
  {
    id: 'badge-anatomy-ace',
    title: 'Anatomy Ace',
    description: 'Achieved 80% or higher on a Biology interactive assessment.',
    criteria: 'Score 80%+ on Biology Activity',
    unlocked: false,
    category: 'quiz',
  },
  {
    id: 'badge-vr-pioneer',
    title: 'Virtual Lab Pioneer',
    description: 'Studied interactive stations inside a Virtual Classroom environment.',
    criteria: 'Complete 2 Virtual Classroom Stations',
    unlocked: false,
    category: 'vr',
  },
  {
    id: 'badge-quiz-master',
    title: 'STEM Mastery',
    description: 'Complete at least 3 interactive quizzes or matching challenges.',
    criteria: 'Finish 3 Activities',
    unlocked: false,
    category: 'consistency',
  },
];

export const INITIAL_RECENT_ACTIVITIES: RecentActivityLog[] = [
  {
    id: 'rec-1',
    title: 'Human Heart 3D Dissection',
    category: 'AR Model',
    subject: 'Biology',
    timestamp: 'Today, 09:40 AM',
    metricText: '6/6 parts inspected',
  },
  {
    id: 'rec-2',
    title: 'Solar System Exploration Lab',
    category: 'Virtual Classroom',
    subject: 'Physics',
    timestamp: 'Yesterday, 04:15 PM',
    metricText: '2 stations studied',
  },
  {
    id: 'rec-3',
    title: 'Identify Chemical Elements & Bonding',
    category: 'Interactive Quiz',
    subject: 'Chemistry',
    timestamp: '15 Nov 2026',
    metricText: 'Score: 80%',
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-heart-lab',
    title: 'Cardiovascular Pathway Worksheet & 3D Check',
    subject: 'Biology',
    dueDate: '22 Nov 2026',
    description:
      'Explore all six labeled parts of the Human Heart 3D model, then submit a brief 3-sentence summary tracing oxygenated blood from the lungs to the aorta.',
    linkedMaterialId: 'ar-human-heart',
    linkedActivityId: 'act-heart-quiz',
    assignedBy: 'Dr. Farah Nadia',
  },
  {
    id: 'asg-water-dipole',
    title: 'Water Molecule Polarity & Angle Lab',
    subject: 'Chemistry',
    dueDate: '25 Nov 2026',
    description:
      'Inspect the H₂O 3D model in AR mode and explain how lone-pair electron repulsion creates the 104.5° bent geometry.',
    linkedMaterialId: 'ar-water-molecule',
    linkedActivityId: 'act-elements-quiz',
    assignedBy: 'Dr. Farah Nadia',
  },
  {
    id: 'asg-earth-tectonics',
    title: 'Geosphere Cutaway Observation Log',
    subject: 'Geography',
    dueDate: '28 Nov 2026',
    description:
      'Visit Station 01 & 02 in the Earth & Environmental Science Virtual Classroom and submit notes contrasting the outer and inner core.',
    linkedMaterialId: 'ar-earth-layers',
    assignedBy: 'Encik Razif Zainal',
  },
];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-heart-lab',
    studentId: 'stu-aiman',
    studentName: 'Aiman Hakim',
    studentLevel: 'Form 5 Science',
    status: 'Pending',
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-water-dipole',
    studentId: 'stu-aiman',
    studentName: 'Aiman Hakim',
    studentLevel: 'Form 5 Science',
    status: 'Graded',
    submittedAt: '14 Nov 2026',
    notes: 'Oxygen pulls shared electrons strongly due to electronegativity 3.44, while two lone pairs compress H-O-H to 104.5 degrees.',
    attachmentName: 'water_polarity_notes.pdf',
    grade: 92,
    teacherFeedback: 'Clear explanation connecting VSEPR lone pairs with partial charges.',
  },
  {
    id: 'sub-3',
    assignmentId: 'asg-earth-tectonics',
    studentId: 'stu-aiman',
    studentName: 'Aiman Hakim',
    studentLevel: 'Form 5 Science',
    status: 'Pending',
  },
  {
    id: 'sub-4',
    assignmentId: 'asg-heart-lab',
    studentId: 'stu-izzah',
    studentName: 'Nurul Izzah',
    studentLevel: 'Year 1 Biotech',
    status: 'Submitted',
    submittedAt: '16 Nov 2026',
    notes: 'Pulmonary veins -> Left Atrium -> Bicuspid Valve -> Left Ventricle -> Aortic Valve -> Aorta.',
    attachmentName: 'cardiac_pathway_summary.docx',
  },
  {
    id: 'sub-5',
    assignmentId: 'asg-water-dipole',
    studentId: 'stu-tan',
    studentName: 'Tan Wei Ming',
    studentLevel: 'Form 5 Science',
    status: 'Submitted',
    submittedAt: '16 Nov 2026',
    notes: 'Completed AR desk inspection and recorded bond angle and hydrogen bonding notes.',
    attachmentName: 'h2o_geometry_lab.pdf',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'SPM Biology AR Practical Week Starts Monday',
    body: 'Please complete the Human Heart and Human Cell 3D inspections before Friday’s synchronous review in the Human Anatomy Virtual Lab.',
    author: 'Dr. Farah Nadia',
    subject: 'Biology',
    publishedAt: '16 Nov 2026',
  },
  {
    id: 'ann-2',
    title: 'New Astrophysics Station Live in Planetarium',
    body: 'Station 03 (Outer Ring Sector) now highlights Saturn’s Roche limit and Keplerian orbital period comparisons.',
    author: 'Encik Razif Zainal',
    subject: 'Physics',
    publishedAt: '14 Nov 2026',
  },
];

export const INITIAL_STUDENT_ROSTER: StudentRosterRecord[] = [
  {
    id: 'stu-aiman',
    name: 'Aiman Hakim',
    level: 'Form 5 Science · SMK Seri Hartamas',
    completionPercent: 72,
    averageScore: 83,
    lessonsCompleted: 18,
    weeklyMinutes: 295,
    lastActive: 'Today, 09:40 AM',
  },
  {
    id: 'stu-izzah',
    name: 'Nurul Izzah',
    level: 'Year 1 Biotech · Universiti Malaya',
    completionPercent: 88,
    averageScore: 91,
    lessonsCompleted: 22,
    weeklyMinutes: 340,
    lastActive: 'Today, 08:15 AM',
  },
  {
    id: 'stu-tan',
    name: 'Tan Wei Ming',
    level: 'Form 5 Science · SMK Seri Hartamas',
    completionPercent: 64,
    averageScore: 78,
    lessonsCompleted: 16,
    weeklyMinutes: 210,
    lastActive: 'Yesterday, 09:20 PM',
  },
  {
    id: 'stu-kavitha',
    name: 'Kavitha Devi',
    level: 'Form 4 STEM · SMK Seri Hartamas',
    completionPercent: 80,
    averageScore: 87,
    lessonsCompleted: 20,
    weeklyMinutes: 280,
    lastActive: 'Yesterday, 05:10 PM',
  },
  {
    id: 'stu-daniel',
    name: 'Daniel Lim',
    level: 'Matrikulasi Sains · KMS',
    completionPercent: 54,
    averageScore: 71,
    lessonsCompleted: 13,
    weeklyMinutes: 165,
    lastActive: '14 Nov 2026',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'not-1',
    title: 'Assignment Graded: Water Molecule Polarity',
    detail: 'Dr. Farah Nadia scored your lab submission 92/100.',
    time: '2h ago',
    read: false,
    targetScreen: 'lms',
  },
  {
    id: 'not-2',
    title: 'New Virtual Classroom Station Added',
    detail: 'Explore Saturn & Ring Resonance in Solar System Exploration.',
    time: '1d ago',
    read: false,
    targetScreen: 'virtual-classrooms',
  },
  {
    id: 'not-3',
    title: 'Weekly STEM Milestone',
    detail: 'You completed 4h 55m of interactive XR study this week.',
    time: '2d ago',
    read: true,
    targetScreen: 'progress',
  },
];
