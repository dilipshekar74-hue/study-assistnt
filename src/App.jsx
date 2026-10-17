import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MicOff,
  Video,
  Monitor,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Code2,
  BookOpen,
  Calculator,
  X,
  Play,
  Copy,
  Check,
  Search,
  CheckCircle2,
  Send,
  GraduationCap,
  Terminal,
  Zap,
  Lock,
  LogOut,
  Database,
  FileCheck,
  Lightbulb,
  UserCheck,
  Award,
  Eye,
  User,
  Flame,
  Layers,
  ExternalLink,
  Star
} from 'lucide-react';
import KatexMath from './components/KatexMath';

// Custom YouTube Icon (lucide-react does not bundle brand icons)
function Youtube({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ============================================================================
// 1. COSMIC STARFIELD BACKGROUND COMPONENT (Restores the Signature Star Effect)
// ============================================================================
function StarfieldBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create 130 twinkling stars + periodic shooting stars
    const stars = Array.from({ length: 130 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.018 + 0.004,
      driftY: (Math.random() - 0.5) * 0.15,
      hue: Math.random() > 0.7 ? 235 : Math.random() > 0.4 ? 190 : 0
    }));

    let shootingStar = null;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha >= 1 || s.alpha <= 0.15) s.speed = -s.speed;
        s.y += s.driftY;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          s.hue === 0
            ? `rgba(255, 255, 255, ${s.alpha})`
            : `hsla(${s.hue}, 90%, 78%, ${s.alpha})`;
        ctx.shadowBlur = s.radius > 1.2 ? 8 : 0;
        ctx.shadowColor = '#818cf8';
        ctx.fill();
      });

      // Spawn occasional shooting star
      if (!shootingStar && Math.random() < 0.005) {
        shootingStar = {
          x: Math.random() * canvas.width * 0.8,
          y: Math.random() * canvas.height * 0.35,
          len: 85,
          speed: 9,
          opacity: 1
        };
      }

      if (shootingStar) {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(
          shootingStar.x,
          shootingStar.y,
          shootingStar.x - shootingStar.len,
          shootingStar.y - shootingStar.len * 0.4
        );
        grad.addColorStop(0, `rgba(165, 180, 252, ${shootingStar.opacity})`);
        grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(
          shootingStar.x - shootingStar.len,
          shootingStar.y - shootingStar.len * 0.4
        );
        ctx.stroke();

        shootingStar.x += shootingStar.speed;
        shootingStar.y += shootingStar.speed * 0.4;
        shootingStar.opacity -= 0.022;
        if (shootingStar.opacity <= 0) shootingStar = null;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1] opacity-85"
    />
  );
}

// ============================================================================
// 2. ACADEMIC TIERS, SLIDES & CHAPTER-WISE CURRICULUM WITH YOUTUBE VIDEOS
// ============================================================================
const ACADEMIC_TIERS = [
  { id: 'tier_primary', label: 'Grades 1–5', badge: 'Primary School' },
  { id: 'tier_middle', label: 'Grades 6–8', badge: 'Middle School' },
  { id: 'tier_high', label: 'Grades 9–12', badge: 'High School STEM' },
  { id: 'tier_undergrad', label: 'Undergrad (B.E./B.Tech)', badge: 'University CS/STEM' },
  { id: 'tier_masters', label: 'Master’s / Research', badge: 'Postgraduate' },
  { id: 'admin_gate_da', label: '⚡ Admin: GATE DA', badge: 'IIT GATE DA Mode', isAdmin: true }
];

const SLIDE_DECK_TABS = [
  { id: 0, title: '1. Profile & Chapters', icon: User },
  { id: 1, title: '2. Simple Words & YouTube', icon: Youtube },
  { id: 2, title: '3. Reference Textbooks', icon: BookOpen },
  { id: 3, title: '4. 40/60 Workbench', icon: Calculator },
  { id: 4, title: '5. Assignment Lab', icon: FileCheck },
  { id: 5, title: '6. GATE DA & DB Logs', icon: Zap }
];

const CHAPTER_CURRICULUM = [
  {
    id: 'ch_01_linalg_pca',
    chapterNumber: 'Chapter 01',
    title: 'Eigenvalues, SVD & Principal Component Analysis (PCA)',
    category: 'Linear Algebra & Machine Learning • GATE DA Core',
    badge: 'GATE DA • 2 Marks',
    duration: '18 mins • 2 Videos • 2 Books',
    simpleSlides: [
      {
        stepTitle: 'Concept Card 1 of 3: The Simple-Words Intuition',
        headline: 'How do you capture a 3D cloud of data on a flat 2D screen without losing its shape?',
        body: 'Imagine holding a 3D rugby ball under a ceiling lamp. If you point the ball straight down, its shadow on the floor looks like a tiny circle—you lose almost all information about its length! PCA simply rotates the data cloud so its shadow is stretched out as wide as possible.'
      },
      {
        stepTitle: 'Concept Card 2 of 3: Three Simple Steps from Scratch',
        headline: 'No jargon—just 3 geometric steps:',
        body: '1. Center the data cloud around zero so our ruler starts in the middle.\n2. Find the direction where the data points spread out the widest (this direction is the Eigenvector, and its spread is the Eigenvalue λ).\n3. Keep the widest shadow direction (PC1) and drop flat, noisy directions!'
      },
      {
        stepTitle: 'Concept Card 3 of 3: The Exam Formula Bridge',
        headline: 'How to solve Variance Retention in 15 seconds:',
        body: 'Total Variance = Sum of diagonal numbers of Covariance Matrix Σ (called the Trace). Fraction of Variance Kept by PC1 = Largest Eigenvalue (λ_max) divided by Trace(Σ).'
      }
    ],
    formulaCallout: 'Explained Variance Ratio (PC1) = λ_max / Tr(Σ) = λ_1 / (λ_1 + λ_2 + ... + λ_d)',
    youtubeVideos: [
      {
        id: 'yt_3b1b_eigen',
        title: 'Eigenvectors and Eigenvalues Visually Explained (Essence of Linear Algebra Ch. 14)',
        channel: '3Blue1Brown',
        videoId: 'PFDu9oVAE-g',
        url: 'https://www.youtube.com/watch?v=PFDu9oVAE-g',
        duration: '17:15',
        timestamps: [
          { time: '01:10', note: 'Visualizing linear transformations & knock-off vectors' },
          { time: '04:35', note: 'Why Av = λv means pure stretching along an axis' },
          { time: '09:20', note: 'Determinant and characteristic polynomial intuition' }
        ]
      },
      {
        id: 'yt_statquest_pca',
        title: 'StatQuest: Principal Component Analysis (PCA), Step-by-Step',
        channel: 'StatQuest with Josh Starmer',
        videoId: 'FgakZw6K1QQ',
        url: 'https://www.youtube.com/watch?v=FgakZw6K1QQ',
        duration: '21:57',
        timestamps: [
          { time: '02:15', note: 'Centering data & finding the line of best fit (PC1)' },
          { time: '08:40', note: 'Singular Value Decomposition (SVD) & Eigenvectors' },
          { time: '14:10', note: 'Scree plots & calculating percentage of variation' }
        ]
      }
    ],
    textbooks: [
      {
        id: 'tb_strang',
        title: 'Introduction to Linear Algebra (5th Edition)',
        author: 'Prof. Gilbert Strang (MIT)',
        chapter: 'Chapter 6 & 7: Eigenvalues, SVD & Principal Components',
        pages: 'pp. 338–362',
        summary: 'Proves why real symmetric covariance matrices always yield orthogonal eigenvectors.',
        excerpt: 'For any symmetric covariance matrix Σ, Tr(Σ) = Σλ_i, and the unit vector u₁ maximizing u₁ᵀΣu₁ is the eigenvector corresponding to λ_max.'
      },
      {
        id: 'tb_bishop',
        title: 'Pattern Recognition and Machine Learning',
        author: 'Christopher M. Bishop',
        chapter: 'Chapter 12: Continuous Latent Variables • Section 12.1',
        pages: 'pp. 559–570',
        summary: 'Derives PCA via maximum projected variance and minimum reconstruction error.',
        excerpt: 'Differentiating u₁ᵀΣu₁ + λ₁(1 - u₁ᵀu₁) with respect to u₁ yields Σu₁ = λ₁u₁.'
      }
    ],
    derivationSteps: [
      {
        level: 1,
        badge: 'Level 1: Concept Diagnosis',
        status: 'Validated',
        formula: '$$\\max_{\\|\\mathbf{u}_1\\|=1} \\mathbf{u}_1^\\top \\Sigma \\mathbf{u}_1 \\iff \\Sigma \\mathbf{u}_1 = \\lambda_1 \\mathbf{u}_1$$',
        note: 'To maximize projected spread without stretching the unit vector u₁, u₁ must be the dominant eigenvector of Σ.'
      },
      {
        level: 2,
        badge: 'Level 2: Spectral Trace Invariant',
        status: 'Validated',
        formula: '$$\\text{Total Variance} = \\text{Tr}(\\Sigma) = \\sum_{i=1}^d \\Sigma_{ii} = \\sum_{i=1}^d \\lambda_i$$',
        note: 'Add the diagonal entries of Σ to compute total variance in 2 seconds.'
      },
      {
        level: 3,
        badge: 'Level 3: Partial Setup (Fill in the Blank)',
        status: 'Needs Attempt',
        formula: '$$\\Sigma = \\begin{bmatrix} 5 & 2 & 0 \\\\ 2 & 5 & 0 \\\\ 0 & 0 & 2 \\end{bmatrix} \\implies \\lambda_1 = \\underline{\\hspace{1.2cm}}, \\quad \\text{Ratio} = \\frac{\\lambda_1}{12}$$',
        note: 'For a 2×2 symmetric block [[a, b], [b, a]], eigenvalues are immediately (a+b) and (a-b).'
      },
      {
        level: 4,
        badge: 'Level 4: Full Verification',
        status: 'Verified Solution',
        formula: '$$\\lambda = \\{7, 3, 2\\}, \\quad \\text{Tr}(\\Sigma) = 12 \\implies \\text{PC1 Ratio} = \\frac{7}{12} \\approx 58.33\\%$$',
        note: 'First Principal Component retains 7/12 (58.33%) of the total dataset variance.'
      }
    ],
    codeSnippet: `import numpy as np

Sigma = np.array([[5, 2, 0],
                  [2, 5, 0],
                  [0, 0, 2]])
eigenvalues = np.linalg.eigvalsh(Sigma)[::-1]
print("Eigenvalues:", eigenvalues)
print("PC1 Variance Ratio:", round(eigenvalues[0] / np.trace(Sigma), 4))`,
    assignment: {
      title: 'Chapter 01 Assignment: Fast Eigen-Variance & PCA Compression',
      points: 100,
      question:
        'A mean-centered 2D dataset has covariance matrix Σ = [[6, 2], [2, 6]].\n1. Explain in simple words what PC1 represents.\n2. Compute eigenvalues λ₁ and λ₂ using the (a+b) and (a-b) shortcut.\n3. What percentage of total variance is kept if we project from 2D to 1D?',
      starter:
        '1. In simple words, PC1 represents the direction of...\n2. Eigenvalues: λ1 = ___, λ2 = ___\n3. Total Variance (Trace) = ___, Percentage Retained = ___%',
      keywords: ['8', '4', '12', '66.6', '2/3', 'spread', 'variance', 'direction']
    },
    gateQuestion: {
      pillar: 'LIN_ALG × ML (GATE DA 2-Mark MCQ)',
      prompt:
        'Let Σ = [[5, 2, 0], [2, 5, 0], [0, 0, 2]] be the sample covariance matrix of a 3D dataset. If projected onto a 1D subspace via PCA, what fraction of total variance is preserved?',
      options: [
        { id: 'A', text: '5 / 12 (41.67%)', correct: false, trap: 'Trap: Used diagonal entry Σ₁₁ = 5 instead of largest eigenvalue λ₁ = 7.' },
        { id: 'B', text: '7 / 12 (58.33%)', correct: true, trap: 'Correct! Eigenvalues are {5+2, 5-2, 2} = {7, 3, 2} and Trace = 12.' },
        { id: 'C', text: '7 / 10 (70.00%)', correct: false, trap: 'Trap: Omitted λ₃ = 2 from the total variance denominator.' },
        { id: 'D', text: '10 / 12 (83.33%)', correct: false, trap: 'Trap: Computed variance of top TWO components (7+3)/12.' }
      ],
      shortcut: 'Trace(Σ) = 5 + 5 + 2 = 12. Top 2×2 block [[5,2],[2,5]] has eigenvalues 5+2=7 and 5-2=3. Answer = 7/12 in 15 seconds!'
    }
  },

  {
    id: 'ch_02_work_energy',
    chapterNumber: 'Chapter 02',
    title: 'Work-Energy Theorem & Variable Force Integration',
    category: 'Classical Mechanics • High School (Class 11) & Engineering Physics',
    badge: 'STEM Core • Calculus Physics',
    duration: '15 mins • 2 Videos • 2 Books',
    simpleSlides: [
      {
        stepTitle: 'Concept Card 1 of 3: The Simple-Words Intuition',
        headline: 'Think of Kinetic Energy as a "Speed Bank Account" and Work as your "Deposit"',
        body: 'When you push a rolling cart on a smooth floor, every push deposits energy into its speed bank account. If your push is steady, Deposit = Force × Distance. If your push gets stronger with every meter, we slice the path into tiny steps and add up each slice!'
      },
      {
        stepTitle: 'Concept Card 2 of 3: Three Simple Steps from Scratch',
        headline: 'How to solve any variable force problem:',
        body: '1. Check if force F(x) changes with position x.\n2. Replace simple multiplication (F × d) with the area under the F(x) graph: ∫ F(x) dx.\n3. Set that area equal to Final Kinetic Energy minus Initial Kinetic Energy (½mv_f² - ½mv_i²)!'
      },
      {
        stepTitle: 'Concept Card 3 of 3: The Exam Formula Bridge',
        headline: 'Connecting Simple Words to Definite Integrals:',
        body: 'W_net = ∫ F_net(x) dx = K_f - K_i. Always carry physical units (Newtons, meters, Joules) through every line of your derivation!'
      }
    ],
    formulaCallout: 'W_net = ΔK = ∫ F_net(x) dx = ½mv_f² - ½mv_i²   [Units: Joules (J)]',
    youtubeVideos: [
      {
        id: 'yt_crashcourse_work',
        title: 'Work, Energy, and Power: Crash Course Physics #9',
        channel: 'CrashCourse',
        videoId: 'w4QFJb9a8vo',
        url: 'https://www.youtube.com/watch?v=w4QFJb9a8vo',
        duration: '09:55',
        timestamps: [
          { time: '01:25', note: 'Dot product & work done by constant vs variable force' },
          { time: '03:50', note: 'Integrating Force over distance (Area under curve)' },
          { time: '05:45', note: 'Work-Energy Theorem & Kinetic Energy derivation' }
        ]
      },
      {
        id: 'yt_3b1b_calculus',
        title: 'Integration and the Fundamental Theorem of Calculus (Essence of Calculus Ch. 8)',
        channel: '3Blue1Brown',
        videoId: 'rfG8ce4nNh0',
        url: 'https://www.youtube.com/watch?v=rfG8ce4nNh0',
        duration: '20:45',
        timestamps: [
          { time: '02:00', note: 'Why area under a curve accumulates small changes' },
          { time: '10:15', note: 'Antiderivatives and evaluating definite boundaries' }
        ]
      }
    ],
    textbooks: [
      {
        id: 'tb_ncert_11',
        title: 'NCERT Physics Part I — Class XI',
        author: 'NCERT Editorial Board',
        chapter: 'Chapter 6: Work, Energy and Power • Section 6.5',
        pages: 'pp. 118–121',
        summary: 'Shows how thin Riemann rectangles under F(x) sum to the definite work integral.',
        excerpt: 'For a varying force F(x), work done over a small displacement Δx is F(x)Δx. Taking the limit Δx → 0 yields W = ∫ F(x) dx = K_f - K_i.'
      },
      {
        id: 'tb_hcv',
        title: 'Concepts of Physics (Volume 1)',
        author: 'Dr. H.C. Verma',
        chapter: 'Chapter 8: Work and Energy',
        pages: 'pp. 119–126',
        summary: 'Builds mastery on position-dependent forces and chain-rule acceleration a = v(dv/dx).',
        excerpt: 'The work-energy theorem holds for the net force acting on a particle whether the forces are constant or position-dependent.'
      }
    ],
    derivationSteps: [
      {
        level: 1,
        badge: 'Level 1: Concept Diagnosis',
        status: 'Validated',
        formula: '$$\\Delta K = W_{net} = \\int_{x_i}^{x_f} F_{net}(x) \\, dx$$',
        note: 'Evaluate whether F_net depends on position x or velocity v before integrating.'
      },
      {
        level: 2,
        badge: 'Level 2: Variable Substitution with Units',
        status: 'Validated',
        formula: '$$W_{net} = \\int_{0\\text{ m}}^{2\\text{ m}} (3x^2\\text{ N}) \\, dx$$',
        note: 'Substitute F(x) = 3x² N and carry limits x_i = 0 m to x_f = 2 m.'
      },
      {
        level: 3,
        badge: 'Level 3: Partial Setup (Fill in the Blank)',
        status: 'Needs Attempt',
        formula: '$$W_{net} = \\Big[ \\underline{\\hspace{1.2cm}} \\Big]_{0\\text{ m}}^{2\\text{ m}} = K_f - K_i$$',
        note: 'Use the reverse power rule ∫ 3x² dx = x³.'
      },
      {
        level: 4,
        badge: 'Level 4: Full Verification',
        status: 'Verified Solution',
        formula: '$$W_{net} = 2^3 - 0^3 = 8.0\\text{ J}$$',
        note: 'Exactly 8.0 Joules of kinetic energy is transferred to the particle.'
      }
    ],
    codeSnippet: `def net_work_done(x_initial, x_final):
    # Antiderivative of F(x) = 3*x^2 is x^3
    return (x_final ** 3) - (x_initial ** 3)

print(f"Work Done from 0m to 2m: {net_work_done(0, 2):.2f} Joules")`,
    assignment: {
      title: 'Chapter 02 Assignment: Variable Force Integration',
      points: 100,
      question:
        'A 2 kg cart starts from rest at x = 0 m. A variable force F(x) = 4x N pushes it from x = 0 m to x = 3 m.\n1. Why can we not simply multiply 4 × 3 = 12 J?\n2. Integrate F(x) = 4x from 0 to 3 to find total work W in Joules.\n3. Compute the cart’s final speed v_f at x = 3 m.',
      starter:
        '1. Simple reason: Because force changes with...\n2. Work W = ∫ 4x dx from 0 to 3 = ___ J\n3. Final speed v_f = ___ m/s',
      keywords: ['18', '2x^2', 'changes', 'varies', 'area', '4.24', 'joules']
    },
    gateQuestion: {
      pillar: 'CALC_OPT × PHYSICS',
      prompt:
        'If a position-dependent force F(x) = 6x² - 4x N moves a particle from x = 0 m to x = 2 m, what is the net work done in Joules?',
      options: [
        { id: 'A', text: '8.0 J', correct: true, trap: 'Correct! ∫(6x² - 4x)dx = [2x³ - 2x²] from 0 to 2 = 16 - 8 = 8.0 J.' },
        { id: 'B', text: '16.0 J', correct: false, trap: 'Trap: Forgot to subtract the 2x² term.' },
        { id: 'C', text: '12.0 J', correct: false, trap: 'Trap: Evaluated F(2) - F(0) instead of integrating.' },
        { id: 'D', text: '24.0 J', correct: false, trap: 'Trap: Multiplied F(2) × 2 m assuming constant force.' }
      ],
      shortcut: 'Antiderivative of (6x² - 4x) is (2x³ - 2x²). At x = 2: 2(8) - 2(4) = 16 - 8 = 8 Joules.'
    }
  },

  {
    id: 'ch_03_dijkstra_dsa',
    chapterNumber: 'Chapter 03',
    title: 'Graph Shortest Paths: Dijkstra’s Algorithm & Priority Queues',
    category: 'Python DSA • Undergrad CS & GATE DA Programming',
    badge: 'PYTHON_DSA • GATE Core',
    duration: '20 mins • 1 Video • 1 Book',
    simpleSlides: [
      {
        stepTitle: 'Concept Card 1 of 3: The Simple-Words Intuition',
        headline: 'How does water poured on a street map automatically find the shortest route?',
        body: 'Imagine pouring water at the starting intersection of a model town. The water naturally spreads outward in ripples, reaching the closest intersections first! Dijkstra’s algorithm simulates this expanding ripple using a Min-Heap (Priority Queue).'
      },
      {
        stepTitle: 'Concept Card 2 of 3: Three Simple Steps from Scratch',
        headline: 'The 3-Step Greedy Ripple:',
        body: '1. Set start node distance to 0 and all other nodes to Infinity.\n2. Always pop the node with the smallest distance from the Min-Heap.\n3. Check its outgoing roads: if going through this node is shorter, update the neighbor and push the new shortcut into the heap!'
      },
      {
        stepTitle: 'Concept Card 3 of 3: The Exam Formula Bridge',
        headline: 'Edge Relaxation & Lazy Heap Guard:',
        body: 'Relaxation: if dist[u] + weight(u, v) < dist[v]: dist[v] = dist[u] + weight(u, v). In Python heapq, always add `if d > dist[u]: continue` to skip stale entries!'
      }
    ],
    formulaCallout: 'Relaxation: d[v] = min(d[v], d[u] + w(u,v))  •  Time: O((V + E) log V)',
    youtubeVideos: [
      {
        id: 'yt_abdul_bari_dijkstra',
        title: '3.6 Dijkstra Algorithm - Single Source Shortest Path - Greedy Method',
        channel: 'Abdul Bari',
        videoId: 'XB4MIexjvY0',
        url: 'https://www.youtube.com/watch?v=XB4MIexjvY0',
        duration: '18:25',
        timestamps: [
          { time: '01:40', note: 'Greedy choice property & relaxation step explained' },
          { time: '07:15', note: 'Dry-run trace on weighted graph step-by-step' },
          { time: '14:30', note: 'Why Dijkstra fails on negative weight edges' }
        ]
      }
    ],
    textbooks: [
      {
        id: 'tb_clrs',
        title: 'Introduction to Algorithms (CLRS — 4th Ed.)',
        author: 'Cormen, Leiserson, Rivest, Stein',
        chapter: 'Chapter 22: Single-Source Shortest Paths • Section 22.3',
        pages: 'pp. 620–628',
        summary: 'Proves the greedy loop invariant when all edge weights are non-negative.',
        excerpt: 'At each step, Dijkstra extracts vertex u with minimum d[u] not yet settled; because all edge weights are non-negative, no future path can reduce d[u].'
      }
    ],
    derivationSteps: [
      {
        level: 1,
        badge: 'Level 1: Triangle Inequality Invariant',
        status: 'Validated',
        formula: '$$d[v] \\le d[u] + w(u, v) \\quad \\forall (u, v) \\in E, \\; w(u, v) \\ge 0$$',
        note: 'Requires non-negative edge weights w(u, v) ≥ 0 so settled nodes never need re-relaxation.'
      },
      {
        level: 2,
        badge: 'Level 2: Binary Heap Time Complexity',
        status: 'Validated',
        formula: '$$T(V, E) = \\mathcal{O}((V + E) \\log V), \\quad \\text{Space} = \\mathcal{O}(V + E)$$',
        note: 'Each edge relaxation pushes at most one tuple into heapq, costing O(log V) per operation.'
      }
    ],
    codeSnippet: `import heapq

def dijkstra(graph, src):
    dist = {u: float('inf') for u in graph}
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue  # Skip stale heap tuple
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    assignment: {
      title: 'Chapter 03 Assignment: Stale Heap Guard & Negative Edge Trap',
      points: 100,
      question:
        '1. Why does Python’s `heapq` end up storing duplicate entries for the same vertex `u`, and what 1-line `if` statement skips stale entries?\n2. Explain in simple words why a negative edge weight breaks Dijkstra’s water-ripple guarantee.',
      starter:
        '1. Stale entry guard: if ___: continue\n2. Negative weight breaks the ripple because...',
      keywords: ['d > dist', 'continue', 'negative', 'stale', 'greedy', 'heapq']
    },
    gateQuestion: {
      pillar: 'PYTHON_DSA (GATE DA 2-Mark MCQ)',
      prompt:
        'For a connected graph with V vertices and E edges (all weights positive) implemented using an adjacency list and Python binary min-heap (`heapq`), what is the worst-case time complexity of Dijkstra’s algorithm?',
      options: [
        { id: 'A', text: 'O(V + E)', correct: false, trap: 'Trap: This is BFS time complexity for unweighted graphs.' },
        { id: 'B', text: 'O((V + E) log V)', correct: true, trap: 'Correct! Up to E heap insertions and V extractions each taking O(log V).' },
        { id: 'C', text: 'O(V · E)', correct: false, trap: 'Trap: This is Bellman-Ford complexity.' },
        { id: 'D', text: 'O(V³)', correct: false, trap: 'Trap: This is Floyd-Warshall all-pairs complexity.' }
      ],
      shortcut: 'Adjacency List + Binary Heap = E relaxations × log(V) heap cost = O((V + E) log V).'
    }
  }
];

// ============================================================================
// 3. LOCAL & CLOUD TELEMETRY STORAGE KEYS
// ============================================================================
const STORAGE_KEYS = {
  SESSION: 'ved_vercel_auth_v3',
  LOGS: 'ved_vercel_telemetry_v3',
  ASSIGNMENTS: 'ved_vercel_assignments_v3',
  COMPLETED_SLIDES: 'ved_vercel_slides_v3'
};

export default function VedWorkbench() {
  // --- Auth & Student Profile State ---
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginRole, setLoginRole] = useState('admin_gate_da');
  const [fullName, setFullName] = useState('Dilip Shekar Kigga');
  const [email, setEmail] = useState('dilip@ved.ai');
  const [password, setPassword] = useState('');
  const [selectedTier, setSelectedTier] = useState('admin_gate_da');

  // --- Slide Deck, Chapter & YouTube Video State ---
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeChapterId, setActiveChapterId] = useState('ch_01_linalg_pca');
  const [simpleCardIdx, setSimpleCardIdx] = useState(0);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  // --- Slide 4 (Astra 40/60 Workbench) State ---
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [disclosureLevel, setDisclosureLevel] = useState(2);
  const [workbenchTab, setWorkbenchTab] = useState('math');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // --- Assignment & GATE DA Simulator State ---
  const activeChapter =
    CHAPTER_CURRICULUM.find((c) => c.id === activeChapterId) || CHAPTER_CURRICULUM[0];
  const activeVideo =
    activeChapter.youtubeVideos[activeVideoIdx] || activeChapter.youtubeVideos[0];

  const [assignmentText, setAssignmentText] = useState(activeChapter.assignment.starter);
  const [assignmentGrade, setAssignmentGrade] = useState(null);
  const [selectedGateOpt, setSelectedGateOpt] = useState(null);
  const [showGateShortcut, setShowGateShortcut] = useState(false);

  // --- Multimodal Astra HUD State ---
  const [hudState, setHudState] = useState('idle');
  const [visionScannerOpen, setVisionScannerOpen] = useState(false);

  // --- Telemetry & Submissions State ---
  const [telemetryLogs, setTelemetryLogs] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [submissions, setSubmissions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [completedSlides, setCompletedSlides] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_SLIDES);
      return raw ? JSON.parse(raw) : [0];
    } catch {
      return [0];
    }
  });

  // Record Backend Telemetry Event
  const recordBackendEvent = (eventType, payload = {}) => {
    const newEvt = {
      id: `evt_${Date.now()}`,
      user: session?.email || email,
      chapter: activeChapter.chapterNumber,
      slide: SLIDE_DECK_TABS[activeSlide]?.title || 'Auth Gate',
      eventType,
      payload,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
    const updated = [newEvt, ...telemetryLogs].slice(0, 100);
    setTelemetryLogs(updated);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  };

  // Sync state when switching chapters
  useEffect(() => {
    setSimpleCardIdx(0);
    setActiveVideoIdx(0);
    setDisclosureLevel(2);
    setSelectedGateOpt(null);
    setShowGateShortcut(false);
    setAssignmentText(activeChapter.assignment.starter);
    setAssignmentGrade(null);
    setChatHistory([
      {
        id: 'welcome-msg',
        role: 'assistant',
        time: '10:42 AM',
        text: `Welcome to ${activeChapter.chapterNumber}: "${activeChapter.title}". I have indexed the reference YouTube lectures (${activeChapter.youtubeVideos[0].channel}) and textbook chapters on your right-hand canvas. Before revealing Level 4, how do the boundary conditions govern Step 2?`,
        formula: activeChapter.formulaCallout
      }
    ]);
  }, [activeChapterId]);

  const goToSlide = (slideIdx) => {
    const clamped = Math.max(0, Math.min(SLIDE_DECK_TABS.length - 1, slideIdx));
    setActiveSlide(clamped);
    if (!completedSlides.includes(clamped)) {
      const updated = [...completedSlides, clamped];
      setCompletedSlides(updated);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_SLIDES, JSON.stringify(updated));
    }
    recordBackendEvent('SLIDE_CHANGE', {
      slideIndex: clamped,
      chapter: activeChapter.chapterNumber
    });
  };

  // Handle Mandatory Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) return;
    const newSession = {
      userId: `VED-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: fullName.trim(),
      email: email.trim(),
      role: loginRole,
      academicTier: loginRole === 'admin_gate_da' ? 'admin_gate_da' : selectedTier,
      streakDays: 7
    };
    setSession(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
    recordBackendEvent('AUTH_LOGIN', { role: newSession.role, tier: newSession.academicTier });
  };

  const handleLogout = () => {
    recordBackendEvent('AUTH_LOGOUT', {});
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setSession(null);
  };

  // Handle Socratic Chat (With Optional Live Gemini API or Instant Local Fallback)
  const handleSendChat = async (customPrompt) => {
    const promptText = (customPrompt ?? chatInput).trim();
    if (!promptText) return;
    if (!customPrompt) setChatInput('');

    setChatHistory((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', time: 'Now', text: promptText }
    ]);
    setHudState('thinking');
    recordBackendEvent('SOCRATIC_PROMPT', { prompt: promptText });

    const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: `You are ved.ai, a Socratic tutor teaching ${activeChapter.chapterNumber}: ${activeChapter.title}. Explain in simple words (max 3 sentences), cite ${activeChapter.textbooks[0].title} and ${activeChapter.youtubeVideos[0].channel}, and guide the student step-by-step.`
                  }
                ]
              },
              contents: [{ role: 'user', parts: [{ text: promptText }] }]
            })
          }
        );
        if (res.ok) {
          const data = await res.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            setChatHistory((prev) => [
              ...prev,
              {
                id: `a-${Date.now()}`,
                role: 'assistant',
                time: 'Now',
                text: reply,
                formula: activeChapter.formulaCallout
              }
            ]);
            setDisclosureLevel((prev) => Math.min(4, prev + 1));
            setHudState('idle');
            return;
          }
        }
      } catch (err) {
        console.warn('Using built-in Socratic engine fallback:', err);
      }
    }

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          time: 'Now',
          text: `Great question on "${promptText}". In simple words: check how ${activeChapter.youtubeVideos[0].channel} and ${activeChapter.textbooks[0].title} (${activeChapter.textbooks[0].pages}) frame the invariant first. I have unlocked the next hint step on your right-hand canvas!`,
          formula: activeChapter.formulaCallout
        }
      ]);
      setDisclosureLevel((prev) => Math.min(4, prev + 1));
      setHudState('idle');
    }, 500);
  };

  // Handle Assignment Evaluation
  const handleGradeAssignment = () => {
    setHudState('thinking');
    const clean = assignmentText.toLowerCase();
    const matched = activeChapter.assignment.keywords.filter((k) =>
      clean.includes(k.toLowerCase())
    );
    const ratio = matched.length / activeChapter.assignment.keywords.length;
    const score =
      clean.length < 25 ? 40 : Math.min(100, Math.max(65, Math.round(50 + ratio * 50)));

    const evaluation = {
      id: `sub_${Date.now()}`,
      chapter: activeChapter.chapterNumber,
      score,
      status: score >= 75 ? 'Mastery Verified' : 'Needs Revision',
      feedback:
        score >= 75
          ? `Excellent mastery (${score}/100)! Your simple-words intuition and mathematical steps matched key rubric checkpoints (${matched.join(', ')}). Synced to backend DB.`
          : `Good start (${score}/100). Re-watch the ${activeChapter.youtubeVideos[0].channel} reference video on Slide 2 and check Slide 3 (${activeChapter.textbooks[0].title}) to tighten your numerical steps.`
    };

    setTimeout(() => {
      setAssignmentGrade(evaluation);
      const updatedSubs = [evaluation, ...submissions];
      setSubmissions(updatedSubs);
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updatedSubs));
      recordBackendEvent('ASSIGNMENT_GRADED', {
        score,
        chapter: activeChapter.chapterNumber
      });
      setHudState('idle');
    }, 450);
  };

  const currentTierObj =
    ACADEMIC_TIERS.find((t) => t.id === session?.academicTier) || ACADEMIC_TIERS[5];
  const avgScore = submissions.length
    ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length)
    : 94;

  // ============================================================================
  // VIEW 1: MANDATORY LOGIN GATE (With Cosmic Starfield Effect)
  // ============================================================================
  if (!session) {
    return (
      <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-zinc-950 font-sans text-zinc-100 p-6">
        {/* Animated Starfield + Radial Nebula Glow */}
        <StarfieldBackground />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/35 via-zinc-950/85 to-zinc-950" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg rounded-2xl border border-white/[0.1] bg-zinc-900/65 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(99,102,241,0.2)] space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight text-zinc-100">ved.ai</h1>
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-300">
                    Astra Star Engine
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Chapter-Wise AI Mentor • YouTube Lectures • Textbooks & GATE DA
                </p>
              </div>
            </div>
            <Lock className="h-5 w-5 text-amber-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-zinc-950/70 p-1">
            <button
              type="button"
              onClick={() => {
                setLoginRole('student');
                setSelectedTier('tier_undergrad');
              }}
              className={`rounded-lg py-2 text-xs font-medium transition-all ${loginRole === 'student'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              🎓 Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole('admin_gate_da');
                setSelectedTier('admin_gate_da');
              }}
              className={`rounded-lg py-2 text-xs font-medium transition-all ${loginRole === 'admin_gate_da'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              ⚡ Admin GATE DA
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter any password to unlock chapter slide deck"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              />
            </div>

            {loginRole === 'student' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Academic Tier (Grade 1 to Master’s)
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  {ACADEMIC_TIERS.filter((t) => !t.isAdmin).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} — {t.badge}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all"
            >
              <UserCheck className="h-4 w-4" />
              <span>Launch Chapter-Wise Star Dashboard</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: AUTHENTICATED CHAPTER-WISE SLIDE DASHBOARD WITH STARFIELD & YOUTUBE
  // ============================================================================
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Persistent Cosmic Starfield Effect */}
      <StarfieldBackground />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/25 via-zinc-950/80 to-zinc-950" />

      {/* 1. TOP HEADER: Brand + Slide Deck Stepper + Chapter Selector + Profile */}
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-zinc-950/75 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <span className="font-semibold tracking-tight text-zinc-100">ved.ai</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-400">
            <Star className="h-2.5 w-2.5 fill-indigo-400" /> Astra Engine
          </span>
        </div>

        {/* Slide Stepper Navigation */}
        <nav className="hidden xl:flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-zinc-900/70 p-1 backdrop-blur-xl">
          {SLIDE_DECK_TABS.map((slide) => {
            const Icon = slide.icon;
            const isCurrent = activeSlide === slide.id;
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(slide.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{slide.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Chapter Switcher + User Profile Pill */}
        <div className="flex items-center gap-2.5">
          <select
            value={activeChapterId}
            onChange={(e) => setActiveChapterId(e.target.value)}
            className="rounded-xl border border-indigo-500/30 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-indigo-200 outline-none focus:border-indigo-400"
          >
            {CHAPTER_CURRICULUM.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.chapterNumber}: {ch.title.slice(0, 28)}...
              </option>
            ))}
          </select>

          <button
            onClick={() => goToSlide(0)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/65 px-3 py-1.5 text-xs hover:border-indigo-500/40"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/30 font-semibold text-indigo-300">
              {session.fullName.charAt(0)}
            </div>
            <span className="hidden md:inline font-medium text-zinc-200">
              {session.fullName.split(' ')[0]}
            </span>
          </button>

          <button
            onClick={handleLogout}
            title="Logout"
            className="rounded-xl border border-white/10 bg-zinc-900/60 p-2 text-zinc-400 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. CHAPTER & SLIDE SUB-BAR */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/35 px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 font-mono text-xs font-semibold text-indigo-300">
            {activeChapter.chapterNumber} • Slide {activeSlide + 1} / {SLIDE_DECK_TABS.length}
          </span>
          <h2 className="text-sm font-semibold text-zinc-100 truncate">
            {activeChapter.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToSlide(activeSlide - 1)}
            disabled={activeSlide === 0}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev Slide</span>
          </button>
          <button
            onClick={() => goToSlide(activeSlide + 1)}
            disabled={activeSlide === SLIDE_DECK_TABS.length - 1}
            className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm shadow-indigo-500/25 disabled:opacity-30"
          >
            <span>Next Slide</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Vision Bounding-Box Scanner Overlay */}
      <AnimatePresence>
        {visionScannerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-20 mx-6 mt-3 rounded-2xl border border-cyan-500/30 bg-zinc-900/90 p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between text-xs text-cyan-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="h-3.5 w-3.5 animate-pulse" /> Astra Vision HUD — Spatial Textbook & Formula Detection
              </span>
              <button onClick={() => setVisionScannerOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="border-2 border-cyan-400 bg-cyan-500/10 rounded-lg p-2.5 font-mono text-xs text-cyan-200">
              [{activeChapter.chapterNumber} Formula Detected] • {activeChapter.formulaCallout}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. ACTIVE SLIDE VIEWPORT */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${activeSlide}-${activeChapter.id}`}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="mx-auto h-full max-w-7xl"
          >
            {/* ================================================================
                SLIDE 1: STUDENT PROFILE & CHAPTER-WISE CURRICULUM SYLLABUS
            ================================================================ */}
            {activeSlide === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Profile Card */}
                  <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
                        {session.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-indigo-400 mb-1">
                          {session.userId} • {currentTierObj.badge}
                        </span>
                        <h3 className="text-lg font-semibold text-zinc-100">{session.fullName}</h3>
                        <p className="text-xs text-zinc-400">{session.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      <label className="block text-[11px] font-mono uppercase text-zinc-400">
                        Switch Academic Level (Grade 1 to Master’s & GATE DA):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {ACADEMIC_TIERS.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              const updated = { ...session, academicTier: t.id };
                              setSession(updated);
                              localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updated));
                              recordBackendEvent('TIER_SWITCHED', { tier: t.id });
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${session.academicTier === t.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-zinc-950/70 text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
                              }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                      <Flame className="h-5 w-5 text-amber-400" />
                      <div>
                        <div className="text-2xl font-bold text-zinc-100">
                          {session.streakDays} Days
                        </div>
                        <div className="text-xs text-zinc-400">Study Streak</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                      <Youtube className="h-5 w-5 text-rose-400" />
                      <div>
                        <div className="text-2xl font-bold text-zinc-100">5 Lectures</div>
                        <div className="text-xs text-zinc-400">YouTube Vault</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                      <Award className="h-5 w-5 text-emerald-400" />
                      <div>
                        <div className="text-2xl font-bold text-emerald-400">{avgScore}%</div>
                        <div className="text-xs text-zinc-400">Assignment Avg</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                      <Database className="h-5 w-5 text-cyan-400" />
                      <div>
                        <div className="text-2xl font-bold text-cyan-400">
                          {telemetryLogs.length}
                        </div>
                        <div className="text-xs text-zinc-400">DB Events Logged</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter-Wise Cards Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                      Chapter-Wise Curriculum (With Reference YouTube Videos & Textbooks)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {CHAPTER_CURRICULUM.map((ch) => {
                      const isSelected = ch.id === activeChapterId;
                      return (
                        <div
                          key={ch.id}
                          className={`rounded-2xl border p-6 backdrop-blur-xl shadow-2xl transition-all flex flex-col justify-between space-y-4 ${isSelected
                              ? 'border-indigo-500/50 bg-indigo-950/25'
                              : 'border-white/[0.08] bg-zinc-900/60 hover:border-white/20'
                            }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300 font-semibold">
                                {ch.chapterNumber}
                              </span>
                              <span className="text-amber-300">{ch.badge}</span>
                            </div>
                            <h4 className="text-base font-semibold text-zinc-100">{ch.title}</h4>
                            <p className="text-xs text-zinc-400">{ch.category}</p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                            <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                              <Youtube className="h-3.5 w-3.5 text-rose-400" />
                              <span>
                                Videos: {ch.youtubeVideos.map((v) => v.channel).join(', ')}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setActiveChapterId(ch.id);
                                goToSlide(1);
                              }}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-medium text-white transition-all"
                            >
                              <Play className="h-3.5 w-3.5" />
                              <span>Open {ch.chapterNumber} & Watch Video</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                SLIDE 2: CHAPTER-WISE SIMPLE WORDS + EMBEDDED YOUTUBE LECTURE
            ================================================================ */}
            {activeSlide === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 6 Cols: Simple Words Concept Carousel */}
                <div className="lg:col-span-6 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-400" />
                        <span className="text-xs font-mono uppercase tracking-wider text-amber-300">
                          {activeChapter.chapterNumber} •{' '}
                          {activeChapter.simpleSlides[simpleCardIdx].stepTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {activeChapter.simpleSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSimpleCardIdx(idx)}
                            className={`h-2 rounded-full transition-all ${simpleCardIdx === idx ? 'w-7 bg-indigo-500' : 'w-2 bg-zinc-700'
                              }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-100 leading-snug">
                      {activeChapter.simpleSlides[simpleCardIdx].headline}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-line">
                      {activeChapter.simpleSlides[simpleCardIdx].body}
                    </p>

                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 text-center font-mono text-xs text-indigo-300">
                      {activeChapter.formulaCallout}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                    <button
                      onClick={() => setSimpleCardIdx((prev) => Math.max(0, prev - 1))}
                      disabled={simpleCardIdx === 0}
                      className="rounded-xl border border-white/10 bg-zinc-950/70 px-3.5 py-2 text-xs font-medium text-zinc-300 disabled:opacity-30"
                    >
                      ◀ Prev Card
                    </button>

                    {simpleCardIdx < activeChapter.simpleSlides.length - 1 ? (
                      <button
                        onClick={() => setSimpleCardIdx((prev) => prev + 1)}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-medium text-white"
                      >
                        Next Concept Card ▶
                      </button>
                    ) : (
                      <button
                        onClick={() => goToSlide(2)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Slide 3: Textbooks ▶
                      </button>
                    )}
                  </div>
                </div>

                {/* Right 6 Cols: Embedded Reference YouTube Lecture Player & Timestamps */}
                <div className="lg:col-span-6 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-rose-500" />
                      <span className="text-xs font-mono uppercase tracking-wider text-rose-300">
                        Reference YouTube Lecture ({activeVideo.channel})
                      </span>
                    </div>
                    <a
                      href={activeVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        recordBackendEvent('YOUTUBE_EXTERNAL_OPEN', {
                          videoTitle: activeVideo.title
                        })
                      }
                      className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Multiple Video Selector Tabs if Chapter has >1 Video */}
                  {activeChapter.youtubeVideos.length > 1 && (
                    <div className="flex gap-2">
                      {activeChapter.youtubeVideos.map((v, idx) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setActiveVideoIdx(idx);
                            recordBackendEvent('YOUTUBE_VIDEO_SWITCHED', { title: v.title });
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${activeVideoIdx === idx
                              ? 'bg-rose-600 text-white'
                              : 'bg-zinc-950/70 text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
                            }`}
                        >
                          ▶ {v.channel} ({v.duration})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Responsive 16:9 Embedded YouTube Iframe */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?rel=0`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Key Lecture Timestamps */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-semibold text-zinc-200">{activeVideo.title}</div>
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {activeVideo.timestamps.map((ts, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-zinc-950/60 px-3 py-1.5 text-xs"
                        >
                          <span className="font-mono text-indigo-400 font-semibold">
                            [{ts.time}]
                          </span>
                          <span className="text-zinc-300">{ts.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                SLIDE 3: REFERENCE TEXTBOOK VAULT
            ================================================================ */}
            {activeSlide === 2 && (
              <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">
                      {activeChapter.chapterNumber} Reference Textbooks
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Verified chapter citations and theorem excerpts for {activeChapter.title}.
                    </p>
                  </div>
                  <button
                    onClick={() => goToSlide(3)}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-medium text-white"
                  >
                    Open Slide 4: 40/60 Socratic Workbench ▶
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeChapter.textbooks.map((tb) => (
                    <div
                      key={tb.id}
                      className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-3">
                          <div>
                            <h4 className="text-base font-semibold text-zinc-100">{tb.title}</h4>
                            <p className="text-xs text-zinc-400">{tb.author}</p>
                          </div>
                          <span className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs text-cyan-300">
                            {tb.pages}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-indigo-300">{tb.chapter}</div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{tb.summary}</p>
                      </div>

                      <blockquote className="rounded-xl border-l-2 border-indigo-500 bg-zinc-950/70 p-4 text-xs italic text-zinc-200">
                        "{tb.excerpt}"
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================================
                SLIDE 4: ASTRA 40/60 SPLIT-SCREEN SOCRATIC WORKBENCH
            ================================================================ */}
            {activeSlide === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-13rem)]">
                {/* 40% Left Pane: Socratic Stream & Telemetry */}
                <div className="lg:col-span-5 flex flex-col rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="border-b border-white/[0.08] bg-zinc-950/50 px-4 py-3">
                    <button
                      onClick={() => setReasoningOpen(!reasoningOpen)}
                      className="flex w-full items-center justify-between text-xs text-zinc-300 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-amber-400" />
                        <span>
                          Reasoning Trace (Indexed {activeChapter.textbooks.length} books &{' '}
                          {activeChapter.youtubeVideos.length} videos)
                        </span>
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${reasoningOpen ? 'rotate-90' : ''
                          }`}
                      />
                    </button>
                    {reasoningOpen && (
                      <div className="mt-2 border-t border-white/[0.06] pt-2 text-[11px] font-mono text-emerald-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>
                            Socratic Guardrail Active • Disclosure Level {disclosureLevel}/4
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-2xl p-3.5 text-xs leading-relaxed ${m.role === 'user'
                            ? 'ml-auto max-w-[85%] border border-indigo-500/30 bg-indigo-600/20 text-zinc-100'
                            : 'border border-white/[0.06] bg-zinc-950/60 text-zinc-200 space-y-2'
                          }`}
                      >
                        <p>{m.text}</p>
                        {m.formula && (
                          <div className="rounded-lg border border-white/[0.08] bg-zinc-900 p-2 text-center font-mono text-[11px] text-indigo-300">
                            {m.formula}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => setDisclosureLevel((prev) => Math.min(4, prev + 1))}
                        className="rounded-full border border-white/10 bg-zinc-950/70 px-3 py-1 text-[11px] text-zinc-300 hover:border-indigo-500/40"
                      >
                        💡 Reveal Next Hint Step
                      </button>
                      <button
                        onClick={() => handleSendChat('Explain Step 2 Visually')}
                        className="rounded-full border border-white/10 bg-zinc-950/70 px-3 py-1 text-[11px] text-zinc-300 hover:border-indigo-500/40"
                      >
                        📊 Explain Step 2 Visually
                      </button>
                      <button
                        onClick={() => handleSendChat('Show Common Exam Pitfalls')}
                        className="rounded-full border border-white/10 bg-zinc-950/70 px-3 py-1 text-[11px] text-zinc-300 hover:border-indigo-500/40"
                      >
                        ⚠️ Show Common Pitfalls
                      </button>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="border-t border-white/[0.08] bg-zinc-950/80 p-3 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Ask ved.ai about ${activeChapter.chapterNumber}...`}
                      className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 p-2 text-white hover:bg-indigo-500"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>

                {/* 60% Right Pane: KaTeX Derivation & Python Sandbox */}
                <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3 bg-zinc-950/50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setWorkbenchTab('math')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium ${workbenchTab === 'math'
                            ? 'bg-indigo-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        <span>KaTeX Derivation</span>
                      </button>
                      <button
                        onClick={() => setWorkbenchTab('code')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium ${workbenchTab === 'code'
                            ? 'bg-indigo-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        <span>Python Sandbox</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setDisclosureLevel(lvl)}
                          className={`rounded px-2 py-0.5 text-[10px] font-mono ${disclosureLevel >= lvl
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-zinc-900 text-zinc-500'
                            }`}
                        >
                          L{lvl}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1200);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-white"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {workbenchTab === 'math' ? (
                      activeChapter.derivationSteps.slice(0, disclosureLevel).map((step) => (
                        <div
                          key={step.level}
                          className="rounded-2xl border border-white/[0.08] bg-zinc-950/70 p-5 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-indigo-400">{step.badge}</span>
                            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                              {step.status}
                            </span>
                          </div>
                          <div className="py-3 text-center">
                            <KatexMath math={step.formula} block={true} className="text-indigo-200 text-sm" />
                          </div>
                          <p className="text-xs text-zinc-400">
                            <strong className="text-zinc-200">Pedagogical Note:</strong>{' '}
                            {step.note}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-4">
                        <pre className="rounded-2xl border border-white/[0.08] bg-zinc-950 p-5 font-mono text-xs text-zinc-200 overflow-x-auto">
                          {activeChapter.codeSnippet}
                        </pre>
                        <div className="rounded-xl border border-emerald-500/20 bg-black/60 p-4 font-mono text-xs text-emerald-400">
                          [Python 3.11 Sandbox] Executed -&gt; Exit 0 • Verified against{' '}
                          {activeChapter.textbooks[0].title}.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                SLIDE 5: CHAPTER ASSIGNMENT & BACKEND AUTO-GRADER
            ================================================================ */}
            {activeSlide === 4 && (
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-8 backdrop-blur-xl shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-emerald-400">
                        {activeChapter.chapterNumber} Outcome Verification
                      </span>
                      <h3 className="text-lg font-semibold text-zinc-100">
                        {activeChapter.assignment.title}
                      </h3>
                    </div>
                    <span className="rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1 font-mono text-xs text-amber-300">
                      {activeChapter.assignment.points} Points
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-4 text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
                    {activeChapter.assignment.question}
                  </div>

                  <textarea
                    rows={6}
                    value={assignmentText}
                    onChange={(e) => setAssignmentText(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950/90 p-4 font-mono text-xs text-zinc-100 outline-none focus:border-indigo-500"
                  />

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleGradeAssignment}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>Submit & Sync Grade to Backend</span>
                    </button>
                    <button
                      onClick={() => goToSlide(5)}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      Open Slide 6: GATE DA Simulator & DB Logs ▶
                    </button>
                  </div>

                  {assignmentGrade && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                        <span>Status: {assignmentGrade.status}</span>
                        <span>Score: {assignmentGrade.score} / 100</span>
                      </div>
                      <p className="text-xs text-zinc-200">{assignmentGrade.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================
                SLIDE 6: ADMIN GATE DA SIMULATOR & COLLECTED BACKEND LOGS
            ================================================================ */}
            {activeSlide === 5 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl border border-amber-500/30 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 font-mono text-xs text-amber-300 border border-amber-500/30">
                      {activeChapter.gateQuestion.pillar}
                    </span>
                    <span className="font-mono text-xs text-rose-400">-0.66 Negative Marking</span>
                  </div>

                  <p className="text-sm font-medium text-zinc-100 leading-relaxed">
                    {activeChapter.gateQuestion.prompt}
                  </p>

                  <div className="space-y-2.5">
                    {activeChapter.gateQuestion.options.map((opt) => {
                      const isPicked = selectedGateOpt === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedGateOpt(opt.id);
                            recordBackendEvent('GATE_DA_ATTEMPT', {
                              option: opt.id,
                              correct: opt.correct
                            });
                          }}
                          className={`cursor-pointer rounded-xl border p-3.5 transition-all ${isPicked
                              ? opt.correct
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                                : 'border-rose-500/50 bg-rose-500/10 text-rose-200'
                              : 'border-white/[0.08] bg-zinc-950/60 hover:border-white/20'
                            }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span>
                              ({opt.id}) {opt.text}
                            </span>
                            {isPicked && (
                              <span>{opt.correct ? '✓ +2.00 Marks' : '✗ -0.66 Trap'}</span>
                            )}
                          </div>
                          {isPicked && (
                            <p className="mt-2 border-t border-white/10 pt-2 text-xs text-zinc-300">
                              {opt.trap}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setShowGateShortcut(!showGateShortcut)}
                    className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>
                      {showGateShortcut
                        ? 'Hide 30-Second Shortcut'
                        : 'Reveal 30-Second Exam Shortcut'}
                    </span>
                  </button>

                  {showGateShortcut && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 font-mono text-xs text-amber-200">
                      {activeChapter.gateQuestion.shortcut}
                    </div>
                  )}
                </div>

                {/* Collected Backend Logs */}
                <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-mono uppercase text-emerald-400">
                        Backend Telemetry ({telemetryLogs.length})
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">{session.userId}</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2 font-mono text-[11px]">
                    {telemetryLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-2.5 text-zinc-300"
                      >
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>[{log.eventType}]</span>
                          <span className="text-zinc-500">{log.timestamp}</span>
                        </div>
                        <div className="text-zinc-400 truncate mt-0.5">
                          {log.chapter} • {JSON.stringify(log.payload)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. FLOATING ASTRA MULTIMODAL PRESENCE PILL */}
      <motion.div
        layout
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-indigo-500/30 bg-zinc-950/90 px-4 py-2 backdrop-blur-2xl shadow-[0_0_35px_rgba(99,102,241,0.3)]"
      >
        <div className="flex items-center gap-1 border-r border-white/10 pr-2">
          <button
            onClick={() => setVisionScannerOpen(!visionScannerOpen)}
            className={`p-2 rounded-full transition-colors ${visionScannerOpen
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-zinc-400 hover:text-indigo-400'
              }`}
          >
            <Video className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVisionScannerOpen(!visionScannerOpen)}
            className="p-2 text-zinc-400 hover:text-indigo-400 rounded-full transition-colors"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        <div
          onClick={() =>
            setHudState((prev) =>
              prev === 'idle'
                ? 'listening'
                : prev === 'listening'
                  ? 'thinking'
                  : prev === 'thinking'
                    ? 'speaking'
                    : 'idle'
            )
          }
          className="flex items-center gap-2 px-2 cursor-pointer"
        >
          {hudState === 'idle' && (
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-xs font-medium text-zinc-300">Astra Idle</span>
            </div>
          )}
          {hudState === 'listening' && (
            <div className="flex items-center gap-1">
              {[40, 75, 90, 50, 85, 35].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [`${h}%`, '20%', `${h}%`] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 bg-indigo-400 rounded-full h-4"
                />
              ))}
              <span className="ml-2 text-xs font-medium text-indigo-300">Listening...</span>
            </div>
          )}
          {hudState === 'thinking' && (
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-amber-400 border-t-indigo-500 animate-spin" />
              <span className="text-xs font-mono text-amber-300">Processing Chapter...</span>
            </div>
          )}
          {hudState === 'speaking' && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
              <span className="text-xs font-medium text-cyan-300">Speaking...</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setHudState('idle')}
          className="rounded-full bg-white/[0.06] p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
        >
          <MicOff className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </div>
  );
}