// src/llm/vedCustomLlm.js

export const ACADEMIC_TIERS = [
  { id: 'tier_primary', label: 'Grades 1–5', badge: 'Primary School', short: 'G1–5' },
  { id: 'tier_middle', label: 'Grades 6–8', badge: 'Middle School', short: 'G6–8' },
  { id: 'tier_high', label: 'Grades 9–12', badge: 'High School STEM', short: 'G9–12' },
  { id: 'tier_undergrad', label: 'Undergrad (B.Tech)', badge: 'University Engg', short: 'UG' },
  { id: 'tier_masters', label: 'Master’s / Research', badge: 'Postgrad & R&D', short: 'MS/M.Tech' },
  { id: 'admin_gate_da', label: 'IIT GATE DA Mastery', badge: 'IIT GATE DA Engine', short: 'GATE DA', isAdmin: false }
];

export const GATE_DA_PILLARS = [
  { id: 'PROB_STAT', name: 'Probability & Stats' },
  { id: 'LIN_ALG', name: 'Linear Algebra' },
  { id: 'CALC_OPT', name: 'Calculus & Optimization' },
  { id: 'PYTHON_DSA', name: 'Python & DSA' },
  { id: 'DBMS_DW', name: 'DBMS & Warehousing' },
  { id: 'ML', name: 'Machine Learning' },
  { id: 'AI', name: 'Artificial Intelligence' }
];

// Curated GATE DA Questions across all 7 Pillars with IIT Trap Decoders & <30s Shortcuts
export const GATE_DA_PROBLEMS_BY_PILLAR = {
  LIN_ALG: {
    pillar: 'LIN_ALG × ML',
    qType: 'MCQ (2 Marks • -2/3 Negative)',
    statement: 'Let X be a mean-centered data matrix with sample covariance matrix Σ = [[5, 2, 0], [2, 5, 0], [0, 0, 2]]. If Principal Component Analysis (PCA) is used to project the data onto a 1-dimensional subspace that maximizes projected variance, what fraction of the total variance is retained?',
    options: [
      { id: 'A', text: '5 / 12 (41.67%)', isCorrect: false, trap: 'Trap: Took the diagonal entry Σ₁₁ = 5 instead of the largest eigenvalue λ₁ = 7.' },
      { id: 'B', text: '7 / 12 (58.33%)', isCorrect: true, trap: 'Correct! Block-diagonal structure gives eigenvalues {5+2, 5-2, 2} = {7, 3, 2}. Trace = 12, so λ_max / Trace = 7/12.' },
      { id: 'C', text: '7 / 10 (70.00%)', isCorrect: false, trap: 'Trap: Forgot to include λ₃ = 2 in the denominator total variance.' },
      { id: 'D', text: '10 / 12 (83.33%)', isCorrect: false, trap: 'Trap: Computed variance retained by top TWO principal components (7+3)/12 instead of 1D subspace.' }
    ],
    shortcut: '1. Total Variance = Trace(Σ) = 5 + 5 + 2 = 12 (takes 2 seconds).\n2. Top-left 2×2 block [[5, 2], [2, 5]] is symmetric with constant diagonal: eigenvalues are immediately (5+2)=7 and (5-2)=3.\n3. PC1 Variance Ratio = λ_max / Trace = 7 / 12.'
  },
  PROB_STAT: {
    pillar: 'PROB_STAT',
    qType: 'MCQ (2 Marks • -2/3 Negative)',
    statement: 'A medical diagnostic test has a 95% sensitivity (true positive rate) and 90% specificity (true negative rate). In a population where a rare disease has a prevalence of 1%, what is the posterior probability P(Disease | Test Positive)?',
    options: [
      { id: 'A', text: '8.76%', isCorrect: true, trap: 'Correct! P(D|+) = (0.95 × 0.01) / [(0.95 × 0.01) + (0.10 × 0.99)] = 0.0095 / (0.0095 + 0.099) = 8.76%.' },
      { id: 'B', text: '95.00%', isCorrect: false, trap: 'Trap: Base Rate Fallacy. Confusing sensitivity P(+|D) = 95% with posterior probability P(D|+).' },
      { id: 'C', text: '48.97%', isCorrect: false, trap: 'Trap: Assumed a balanced 50% prior prevalence instead of the true 1% base rate.' },
      { id: 'D', text: '9.50%', isCorrect: false, trap: 'Trap: Missed dividing by the marginal probability of testing positive P(+).' }
    ],
    shortcut: '⚡ Frequency Table Shortcut (assume 10,000 people):\n- Sick: 1% of 10,000 = 100 people. 95 test positive.\n- Healthy: 9,900 people. 10% false positive = 990 test positive.\n- P(Disease | +) = 95 / (95 + 990) = 95 / 1085 ≈ 8.76% (Solves in 20 seconds).'
  },
  CALC_OPT: {
    pillar: 'CALC_OPT',
    qType: 'MCQ (2 Marks • -2/3 Negative)',
    statement: 'Consider the function f(x, y) = x² + 4xy + 5y² - 6x - 14y + 10. What is the nature of the critical point (x*, y*)?',
    options: [
      { id: 'A', text: 'Strict Global Minimum at (1, 1)', isCorrect: true, trap: 'Correct! Gradient ∇f = [2x + 4y - 6, 4x + 10y - 14] = 0 yields x=1, y=1. Hessian H = [[2, 4], [4, 10]]. det(H) = 20 - 16 = 4 > 0, trace = 12 > 0 (Positive Definite).' },
      { id: 'B', text: 'Saddle Point at (1, 1)', isCorrect: false, trap: 'Trap: Calculation error in Hessian determinant (forgot to square the cross-partial: 4² = 16).' },
      { id: 'C', text: 'Strict Global Maximum at (1, 1)', isCorrect: false, trap: 'Trap: Inverted second derivative test; positive trace implies curvature opens upward (minimum).' },
      { id: 'D', text: 'No critical point exists in ℝ²', isCorrect: false, trap: 'Trap: Assumed linear dependence between gradient equations.' }
    ],
    shortcut: '⚡ Hessian Eigenvalue Check:\nH = [[2, 4], [4, 10]]. Trace = 12, Det = 20 - 16 = 4.\nSince Det > 0 and H₁₁ = 2 > 0, both eigenvalues are strictly positive. Immediate strict global minimum!'
  },
  PYTHON_DSA: {
    pillar: 'PYTHON_DSA',
    qType: 'MCQ (2 Marks • -2/3 Negative)',
    statement: 'What is the exact time complexity of building a Binary Heap of n elements using the bottom-up Heapify approach versus repeated push into an initially empty heap?',
    options: [
      { id: 'A', text: 'O(n) for bottom-up Heapify vs O(n log n) for repeated pushes', isCorrect: true, trap: 'Correct! Bottom-up heapify runs in Σ (h / 2ʰ) = O(n) amortized, while repeated insertions take Σ log i = O(n log n).' },
      { id: 'B', text: 'O(n log n) for both approaches', isCorrect: false, trap: 'Trap: Naive upper bound fallacy. Assuming each of the n nodes sifts down height log n without accounting for fewer nodes at higher depths.' },
      { id: 'C', text: 'O(n) for both approaches', isCorrect: false, trap: 'Trap: Confusing amortized array appending with binary heap bubble-up path.' },
      { id: 'D', text: 'O(log n) for bottom-up Heapify vs O(n) for repeated pushes', isCorrect: false, trap: 'Trap: Confusing single extract-min complexity with entire heap construction.' }
    ],
    shortcut: '⚡ Closed-form Summation: Most nodes in a complete binary tree are near the leaves! Half the nodes have height 0 (0 swaps), 1/4 have height 1 (1 swap), 1/8 have height 2 (2 swaps). Series n Σ (h/2ʰ) converges to 2n = O(n).'
  },
  DBMS_DW: {
    pillar: 'DBMS_DW',
    qType: 'MCQ (2 Marks • -2/3 Negative)',
    statement: 'A relation R(A, B, C, D) has functional dependencies F = {A → B, B → C, C → D, D → A}. In which highest normal form does relation R reside?',
    options: [
      { id: 'A', text: 'Boyce-Codd Normal Form (BCNF)', isCorrect: true, trap: 'Correct! Candidate keys are A, B, C, and D (each determines all other attributes via the cycle). In every FD X → Y, determinant X is a Superkey! Hence R is in BCNF.' },
      { id: 'B', text: 'Third Normal Form (3NF) but not BCNF', isCorrect: false, trap: 'Trap: Assumed transitive dependency exists without noticing that B, C, D are all Candidate Keys themselves.' },
      { id: 'C', text: 'Second Normal Form (2NF)', isCorrect: false, trap: 'Trap: Confused candidate keys with partial dependencies.' },
      { id: 'D', text: 'First Normal Form (1NF)', isCorrect: false, trap: 'Trap: Failed to compute attribute closures {A}⁺, {B}⁺, {C}⁺, {D}⁺.' }
    ],
    shortcut: '⚡ Cycle Invariant: The dependency cycle A → B → C → D → A makes every single attribute a Candidate Key! When every determinant is a superkey, the relation is automatically in BCNF!'
  },
  ML: {
    pillar: 'ML',
    qType: 'MCQ (2 Marks • -2/3 Negative)',
    statement: 'A linear Hard-Margin Support Vector Machine classifier in ℝ² produces an optimal hyperplane with weight vector w = [3, -4]ᵀ and bias b = 10. What is the geometric margin γ (the separation width between the positive and negative margin hyperplanes)?',
    options: [
      { id: 'A', text: '0.40', isCorrect: true, trap: 'Correct! The geometric width between planes wᵀx + b = ±1 is 2 / ||w||₂. Here ||w||₂ = √(3² + (-4)²) = 5. Width = 2 / 5 = 0.40.' },
      { id: 'B', text: '0.20', isCorrect: false, trap: 'Trap: Half-margin error. Calculated distance from boundary to one support vector (1/||w|| = 1/5 = 0.20) instead of total separation width.' },
      { id: 'C', text: '2.00', isCorrect: false, trap: 'Trap: Forgot to divide by the L2 norm of the weight vector w.' },
      { id: 'D', text: '5.00', isCorrect: false, trap: 'Trap: Computed ||w|| = 5 directly and assumed the norm itself represents the margin.' }
    ],
    shortcut: '⚡ Euclidean Norm Shortcut: Distance between parallel hyperplanes wᵀx + b = +1 and wᵀx + b = -1 is 2 / ||w||. ||[3, -4]|| = 5. Margin = 2/5 = 0.40 in 5 seconds!'
  },
  AI: {
    pillar: 'AI',
    qType: 'MCQ (2 Marks • -2/3 Negative)',
    statement: 'In the A* Search algorithm, let h*(n) denote the true optimal cost from node n to the goal. Which condition guarantees that A* graph search (with duplicate node elimination) is both optimal and never re-expands a closed node?',
    options: [
      { id: 'A', text: 'Consistency (Monotonicity): h(n) ≤ c(n, a, n\') + h(n\') and h(G) = 0', isCorrect: true, trap: 'Correct! Consistency (triangle inequality) guarantees that f(n) non-decreases along every path, ensuring optimal paths are found without node re-expansion in graph search.' },
      { id: 'B', text: 'Admissibility only: h(n) ≤ h*(n)', isCorrect: false, trap: 'Trap: Admissibility guarantees optimality for TREE search, but Graph search with closed sets requires CONSISTENCY to avoid re-opening closed nodes!' },
      { id: 'C', text: 'Overestimation: h(n) ≥ h*(n)', isCorrect: false, trap: 'Trap: Overestimation breaks both admissibility and optimality.' },
      { id: 'D', text: 'Uniform heuristic: h(n) = 0 for all nodes', isCorrect: false, trap: 'Trap: h(n)=0 reduces A* to Dijkstra/Uniform Cost Search; it is admissible but loses informed heuristic pruning.' }
    ],
    shortcut: '⚡ Tree vs Graph Search Invariant:\n- Tree search optimality ⟹ Admissibility h(n) ≤ h*(n).\n- Graph search (no re-expansion) optimality ⟹ Consistency h(n) ≤ c(n, a, n\') + h(n\').'
  }
};

// Curated Pedagogical Presets adhering to the 3-Chunk Rule & 4-Level Disclosure Ladder
export const TIER_PRESETS = {
  tier_primary: {
    reasoningTrace: {
      duration: '0.6s',
      tools: [
        { type: 'search', label: 'Loaded Visual Fraction Storyboard (Grade 4)' }
      ],
      summary: 'Primary Tier active: Using pizza slice analogy and 2-sentence cognitive chunking.'
    },
    socraticText: [
      'Imagine we have 1 whole glowing space pizza cut into 4 equal slices! 🍕 If you eat 1 slice and your friend eats 2 slices, we only count the top numbers (the slices eaten) while the bottom number stays 4.',
      'Look at the interactive fraction blocks on your right canvas. How many total fourths of the pizza did you both eat together?'
    ],
    formulaCallout: '1/4 + 2/4 = ___ / 4',
    actionChips: [
      { label: '💡 Give me a hint', action: 'hint' },
      { label: '📊 Explain Step 2 Visually', action: 'visual' },
      { label: '🧪 Test My Understanding', action: 'quiz' }
    ],
    artifact: {
      type: 'notes',
      title: 'Space Pizza Fractions & Active Flashcards',
      subtitle: 'Primary Visual Workbench',
      markdown: '### Rule of Same-Size Slices\n* **Bottom Number (Denominator = 4):** Tells us how many equal slices the whole pizza has.\n* **Top Number (Numerator):** Tells us how many slices we are counting right now.\n* **Golden Rule:** Never add the bottom numbers together!',
      flashcards: [
        { front: 'In 3/4, what does the bottom number (4) mean?', back: 'The whole pizza is cut into 4 equal slices!' },
        { front: 'What is 1/5 + 2/5?', back: '3/5 (Keep the bottom 5 the same, add 1 + 2 on top!)' },
        { front: 'Why can’t we add 1/2 + 1/3 directly?', back: 'Because the slices are different sizes! We must cut them to equal 1/6 pieces first.' }
      ]
    }
  },

  tier_middle: {
    reasoningTrace: {
      duration: '0.9s',
      tools: [
        { type: 'search', label: 'Indexed: NCERT Class 8 Force & Pressure' }
      ],
      summary: 'Middle School Tier active: Scaffolding pressure-area inverse relationship.'
    },
    socraticText: [
      'Have you noticed why a sharp knife cuts an apple easily while a blunt knife struggles, even when you push with the exact same force? It comes down to how tightly that force is concentrated over an area.',
      'Check the formula framework on your canvas. If the contact area $A$ becomes smaller while Force $F$ stays constant, what happens to Pressure $P$?'
    ],
    formulaCallout: 'P = F / A   (Units: N/m² or Pascals)',
    actionChips: [
      { label: '💡 Give me a hint', action: 'hint' },
      { label: '📊 Explain Step 2 Visually', action: 'visual' },
      { label: '⚠️ Show Common Pitfalls', action: 'pitfalls' }
    ],
    artifact: {
      type: 'notes',
      title: 'Force, Area & Pressure Explorer',
      subtitle: 'Interactive Study Notes & Flashcards',
      markdown: '### Why Snowshoes Prevent Sinking\n* **Force ($F$):** Your weight pulling downward in Newtons (`N`).\n* **Area ($A$):** Surface area touching the snow in `m²`.\n* **Key Insight:** Increasing area $A$ spreads out the force, reducing pressure $P$ so you stay on top of the snow.',
      flashcards: [
        { front: 'What is the SI unit of Pressure?', back: 'Pascal (Pa), which equals 1 N/m².' },
        { front: 'If Force = 100 N and Area = 0.5 m², what is Pressure?', back: 'P = 100 N / 0.5 m² = 200 Pa.' },
        { front: 'Why do needles have sharp tips?', back: 'Very tiny area generates immense pressure with small applied force.' }
      ]
    }
  },

  tier_high: {
    reasoningTrace: {
      duration: '1.4s',
      tools: [
        { type: 'search', label: 'Indexed: Chapter 6 Work-Energy Theorem' },
        { type: 'math', label: 'Parsed variable-force definite integral -> Exit 0' }
      ],
      summary: 'Socratic mode active: Omitting direct numerical answer on Turn 1, scaffolding integral setup.'
    },
    socraticText: [
      'Before we plug in numbers, consider what represents the total work done on the particle by a position-dependent force. By the Work-Energy Theorem, net work equals the change in kinetic energy.',
      'I have loaded the 4-Level Progressive Disclosure derivation on your right-hand canvas. If $F(x) = 3x^2\\text{ N}$ acts from $x_i = 0\\text{ m}$ to $x_f = 2\\text{ m}$, how do you set up the antiderivative?'
    ],
    formulaCallout: 'W_net = \\Delta K = \\int_{x_i}^{x_f} F_{net}(x) \\, dx   [Units: Joules (J)]',
    actionChips: [
      { label: '💡 Reveal Next Disclosure Step', action: 'next_step' },
      { label: '📊 Explain Step 2 Visually', action: 'visual' },
      { label: '⚠️ Show Common Pitfalls', action: 'pitfalls' },
      { label: '🧪 Test My Understanding', action: 'quiz' }
    ],
    artifact: {
      type: 'math',
      title: 'Kinematic Energy Derivation',
      subtitle: 'Interactive KaTeX / LaTeX Canvas',
      steps: [
        {
          level: 1,
          badge: 'Level 1: Concept Diagnosis',
          status: 'Validated',
          formula: '\\Delta K = W_{net} = \\int_{x_i}^{x_f} F_{net}(x) \\, dx',
          note: 'Since force varies with position x, we cannot use W = F·d directly; we must integrate over [x_i, x_f].'
        },
        {
          level: 2,
          badge: 'Level 2: Variable Substitution',
          status: 'Validated',
          formula: 'W_{net} = \\int_{0\\text{ m}}^{2\\text{ m}} (3x^2\\text{ N}) \\, dx',
          note: 'Substitute F(x) = 3x² N and carry boundary units in meters (m).'
        },
        {
          level: 3,
          badge: 'Level 3: Partial Setup (Fill in the Blank)',
          status: 'Needs Attempt',
          formula: 'W_{net} = \\left[ x^3 \\right]_{0\\text{ m}}^{2\\text{ m}} = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2',
          note: 'Apply the power rule ∫ xⁿ dx = xⁿ⁺¹/(n+1) to find the antiderivative of 3x².'
        },
        {
          level: 4,
          badge: 'Level 4: Full Verification',
          status: 'Verified Solution',
          formula: 'W_{net} = \\left[ x^3 \\right]_{0}^{2} = 8.0\\text{ J} \\implies v_f = \\sqrt{v_i^2 + \\frac{2(8.0\\text{ J})}{m}}',
          note: 'Evaluating at the upper and lower limits yields exactly 8.0 Joules of net work.'
        }
      ]
    }
  },

  tier_undergrad: {
    reasoningTrace: {
      duration: '1.2s',
      tools: [
        { type: 'search', label: 'Searched: "Dijkstra PriorityQueue relaxation invariant"' },
        { type: 'terminal', label: 'Executed: Python 3.11 sandbox -> Exit 0' }
      ],
      summary: 'Undergrad CS Mode: Highlighting stale priority-queue entry bug via inline diff.'
    },
    socraticText: [
      'Your Dijkstra implementation correctly initializes distances to $\\infty$, but notice what happens when a vertex $u$ is popped from `heapq` after a shorter path to $u$ was already processed.',
      'Inspect line 14 in the Code Sandbox diff on the right. What guard condition skips redundant edge relaxations to maintain $\\mathcal{O}((V + E) \\log V)$ time complexity?'
    ],
    formulaCallout: 'if current_dist > dist[u]: continue  # Skip stale heap entries',
    actionChips: [
      { label: '▶ Run Sandbox & Trace State', action: 'run_code' },
      { label: '⚠️ Show Common Pitfalls', action: 'pitfalls' },
      { label: '🧪 Test My Understanding', action: 'quiz' }
    ],
    artifact: {
      type: 'code',
      title: 'Dijkstra Shortest Path — Stale Heap Guard',
      subtitle: 'Interactive Code & Sandbox Canvas',
      code: `import heapq

def dijkstra(graph, source):
    dist = {node: float('inf') for node in graph}
    dist[source] = 0
    pq = [(0, source)]  # (distance, vertex)

    while pq:
        d, u = heapq.heappop(pq)
        
+       # Socratic Guard: Skip stale heap entries
+       if d > dist[u]:
+           continue

        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
      terminalOutput: `[Python 3.11 Sandbox] Running trace on 5-node weighted graph...
Popped (0, 'A') -> Relaxed B: 4, C: 2
Popped (2, 'C') -> Relaxed B: 3, D: 6
Popped (3, 'B') -> Relaxed D: 5
Popped (4, 'B') [STALE: 4 > dist['B'](3)] -> Skipped via Guard!
Exit 0 • Time: O((V + E) log V) • Space: O(V)`
    }
  },

  tier_masters: {
    reasoningTrace: {
      duration: '1.6s',
      tools: [
        { type: 'search', label: 'Indexed: Convex Optimization — Lagrangian Duality & KKT' },
        { type: 'math', label: 'Verified Slater Condition & Complementary Slackness' }
      ],
      summary: 'Master’s Research Mode: Deriving the Wolfe Dual for Soft-Margin Support Vector Machines.'
    },
    socraticText: [
      'When transitioning the Soft-Margin SVM primal problem into its Lagrangian dual, taking gradients with respect to the primal variables $\\mathbf{w}, b, \\xi_i$ and setting them to zero eliminates the slack variables $\\xi_i$ from the dual objective.',
      'Examine Step 2 on the derivation canvas. How does the non-negativity of the Lagrange multiplier $\\mu_i \\ge 0$ enforce the upper box constraint $\\alpha_i \\le C$?'
    ],
    formulaCallout: '\\nabla_\\xi L(w, b, \\xi, \\alpha, \\mu) = C - \\alpha_i - \\mu_i = 0 \\implies 0 \\le \\alpha_i \\le C',
    actionChips: [
      { label: '💡 Reveal Next Disclosure Step', action: 'next_step' },
      { label: '📊 Explain KKT Complementary Slackness', action: 'visual' },
      { label: '🧪 Test My Understanding', action: 'quiz' }
    ],
    artifact: {
      type: 'math',
      title: 'SVM Soft-Margin Lagrangian Dual & KKT Conditions',
      subtitle: 'Graduate Theorem & Optimization Canvas',
      steps: [
        {
          level: 1,
          badge: 'Level 1: Primal Formulation',
          status: 'Validated',
          formula: '\\min_{\\mathbf{w}, b, \\boldsymbol{\\xi}} \\frac{1}{2}\\|\\mathbf{w}\\|_2^2 + C\\sum_{i=1}^n \\xi_i \\quad \\text{s.t.} \\quad y_i(\\mathbf{w}^\\top \\mathbf{x}_i + b) \\ge 1 - \\xi_i, \\; \\xi_i \\ge 0',
          note: 'Convex quadratic program with slack variables ξ_i allowing margin violations penalized by C.'
        },
        {
          level: 2,
          badge: 'Level 2: Stationarity Conditions',
          status: 'Validated',
          formula: '\\mathbf{w} = \\sum_{i=1}^n \\alpha_i y_i \\mathbf{x}_i, \\quad \\sum_{i=1}^n \\alpha_i y_i = 0, \\quad \\alpha_i = C - \\mu_i',
          note: 'Since μ_i ≥ 0 and α_i ≥ 0, stationarity wrt ξ_i immediately yields the box constraint 0 ≤ α_i ≤ C.'
        },
        {
          level: 3,
          badge: 'Level 3: Wolfe Dual Objective',
          status: 'Needs Attempt',
          formula: '\\max_{\\boldsymbol{\\alpha}} \\sum_{i=1}^n \\alpha_i - \\frac{1}{2} \\sum_{i=1}^n \\sum_{j=1}^n \\alpha_i \\alpha_j y_i y_j K(\\mathbf{x}_i, \\mathbf{x}_j)',
          note: 'Verify which data points become Margin Support Vectors (0 < α_i < C) versus Bounded Support Vectors (α_i = C).'
        },
        {
          level: 4,
          badge: 'Level 4: KKT Support Vector Classification',
          status: 'Verified Solution',
          formula: '0 < \\alpha_i < C \\implies \\mu_i > 0 \\implies \\xi_i = 0 \\implies y_i(\\mathbf{w}^\\top \\mathbf{x}_i + b) = 1',
          note: 'By complementary slackness, points with 0 < α_i < C lie strictly on the margin hyperplane.'
        }
      ]
    }
  },

  admin_gate_da: {
    reasoningTrace: {
      duration: '1.1s',
      tools: [
        { type: 'search', label: 'GATE DA Syllabus: LIN_ALG + ML (SVD & PCA Variance)' },
        { type: 'terminal', label: 'Verified spectral trace shortcut -> < 35s solve time' }
      ],
      summary: 'IIT GATE DA Engine active: High-rigor 2-Mark NAT/MCQ simulator with IIT distractor trap analysis.'
    },
    socraticText: [
      'Welcome back, Scholar. I have loaded a 2-Mark GATE DA problem blending **Linear Algebra (SVD/Eigenvalues)** and **Machine Learning (PCA Variance Retention)** on your workbench.',
      'Before computing the characteristic polynomial $\\det(\\Sigma - \\lambda I) = 0$, apply the **Matrix Trace & Rank Invariant** to find the percentage of variance captured by the first principal component in under 30 seconds.'
    ],
    formulaCallout: '\\text{Explained Variance Ratio (PC1)} = \\frac{\\lambda_{\\max}}{\\operatorname{Tr}(\\Sigma)} = \\frac{\\lambda_1}{\\lambda_1 + \\lambda_2 + \\lambda_3}',
    actionChips: [
      { label: '⚡ Show 30-Sec Eigenvalue Shortcut', action: 'gate_shortcut' },
      { label: '🪤 Decode IIT Option Traps', action: 'gate_traps' },
      { label: '🎯 Switch to Bayes / AI Problem', action: 'gate_next' }
    ],
    artifact: {
      type: 'gate_da',
      title: 'GATE DA — 2-Mark Mock & Trap Decoder',
      subtitle: 'IIT GATE DA Prep • Linear Algebra & Machine Learning',
      question: GATE_DA_PROBLEMS_BY_PILLAR.LIN_ALG
    }
  }
};

/**
 * Calls Gemini API if VITE_GEMINI_API_KEY is configured; otherwise returns responsive pedagogical simulation
 */
export async function queryVedCustomLlm({ userPrompt, activeTier, activeGatePillar }) {
  const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const systemInstruction = `You are ved.ai (Astra Engine), an AI tutor. Active Tier: ${activeTier}. ${
        activeTier === 'admin_gate_da'
          ? `IIT GATE DA Mode active for pillar ${activeGatePillar}. Provide IIT GATE exam rigor, <60s shortcuts, and distractor trap analysis.`
          : `Follow Socratic Progressive Disclosure: never dump the final answer on Turn 1. Keep paragraphs <= 3 sentences.`
      }`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reasoningTrace: {
              duration: '0.8s',
              tools: [{ type: 'search', label: `Gemini 2.5 Flash • Tier: ${activeTier}` }],
              summary: `Processed prompt under ${activeTier} pedagogical constraints.`
            },
            socraticText: text.split('\n\n').slice(0, 3),
            formulaCallout: activeTier === 'admin_gate_da' ? `GATE DA [${activeGatePillar}] Analytical Trace` : 'Interactive Socratic Step Active'
          };
        }
      }
    } catch (err) {
      console.warn('Falling back to local Ved-Core pedagogical engine:', err);
    }
  }

  // Deterministic low-latency local simulation response
  await new Promise((r) => setTimeout(r, 500));
  return {
    reasoningTrace: {
      duration: '0.7s',
      tools: [
        { type: 'search', label: `Routed via Ved-Core (${activeTier})` },
        { type: 'math', label: 'Updated Right-Pane Canvas State -> Exit 0' }
      ],
      summary: `Applied Socratic scaffolding for "${userPrompt.slice(0, 42)}..."`
    },
    socraticText: [
      `Great question on "${userPrompt}". Let's break down the governing invariant first rather than jumping straight to the final result.`,
      activeTier === 'admin_gate_da'
        ? `For GATE DA (${activeGatePillar}), check whether dimensionality reduction or conditional independence simplifies the state space before expanding the full matrix.`
        : `Inspect the updated step on the right-hand workbench canvas. Which variable changes when you adjust the boundary condition?`
    ],
    formulaCallout:
      activeTier === 'admin_gate_da'
        ? `GATE DA [${activeGatePillar}] • Check Trace / Rank Invariant First`
        : `Step Check: Identify knowns vs. unknowns on the Canvas`
  };
}
