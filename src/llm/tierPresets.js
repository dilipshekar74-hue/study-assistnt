/**
 * tierPresets.js
 * Pre-loaded demonstration states and curriculum presets for all 5 academic tiers + Admin GATE DA.
 * Adheres strictly to .agents/rules/custom-llm-engine.md and .agents/rules/admin-gate-da.md
 */

import { GATE_DA_CURATED_PROBLEMS } from './gateDaEngine.js';

export const ACADEMIC_TIERS = [
  {
    id: 'tier_primary',
    name: 'Primary (Grades 1–5)',
    shortName: 'Primary (1–5)',
    badge: 'Grades 1–5 • Primary',
    color: 'emerald',
    description: 'Everyday concrete analogies, visual counting blocks, playful 2-option discovery.',
  },
  {
    id: 'tier_middle',
    name: 'Middle School (Grades 6–8)',
    shortName: 'Middle (6–8)',
    badge: 'Grades 6–8 • Middle',
    color: 'cyan',
    description: 'Introductory STEM, fill-in-the-blank scaffolding (___), proportional reasoning.',
  },
  {
    id: 'tier_high',
    name: 'High School (Grades 9–12)',
    shortName: 'High School (9–12)',
    badge: 'Grades 9–12 • High School',
    color: 'indigo',
    description: 'Formal NCERT/CBSE/AP rigor, 3-Chunk Rule, explicit physical units, LaTeX derivation.',
  },
  {
    id: 'tier_undergrad',
    name: 'Undergrad (B.Tech / B.Sc)',
    shortName: 'Undergrad (B.Tech)',
    badge: 'Undergraduate • Engineering & CS',
    color: 'amber',
    description: 'Asymptotic complexity O(n log n), invariant proofs, Python CodeRunner execution.',
  },
  {
    id: 'tier_masters',
    name: 'Master’s & Research',
    shortName: 'Master’s / Research',
    badge: 'Postgrad • Master’s & Research',
    color: 'violet',
    description: 'Optimization duality, matrix calculus, theorem-proof structures, study matrix.',
  },
  {
    id: 'admin_gate_da',
    name: '⚡ GATE DA Admin Command',
    shortName: 'GATE DA Admin',
    badge: 'ADMIN • IIT GATE DA Exam Engine',
    color: 'rose',
    isAdminOnly: true,
    description: 'Official IIT GATE Data Science & AI Engine: <60s shortcuts, distractor traps, live scoring.',
  }
];

export const TIER_DEMO_PRESETS = {
  tier_primary: {
    id: 'preset_primary',
    tierId: 'tier_primary',
    title: 'The Great Pizza Fraction Adventure',
    subject: 'Elementary Math',
    messages: [
      {
        id: 'msg-p1',
        role: 'user',
        content: 'How do fractions work when sharing pizza slices with my friends?',
        textParagraphs: ['How do fractions work when sharing pizza slices with my friends?'],
        timestamp: '10:15 AM',
      },
      {
        id: 'msg-p2',
        role: 'assistant',
        sender: 'ved',
        timestamp: '10:15 AM',
        hasReasoning: true,
        reasoningLatency: '0.4s',
        indexedDocs: 'Primary Math • Visual Fraction Blocks',
        steps: [
          { id: 1, text: 'Calibrated Tier: Primary (Grades 1–5)', status: 'success' },
          { id: 2, text: 'Enforced Zero Abstract Jargon & Max 2 sentences rule', status: 'success' },
          { id: 3, text: 'Dispatched pizza slice story cards to right canvas', status: 'success' },
        ],
        thoughtTrace: `[Tier]: tier_primary (Grade 4)
[Strategy]: Use pizza slicing analogy. Avoid abstract definitions like "numerator" without visual anchor.
[Turn 1 Rule]: Ask a playful 2-option discovery question.`,
        textParagraphs: [
          'Imagine you bake one giant cheesy pizza and cut it into 4 equal slices! 🍕',
          'If you and your friend eat 3 of those slices, you have enjoyed 3 out of 4 parts.'
        ],
        inlineFormula: '\\frac{\\text{3 slices eaten}}{\\text{4 total equal slices}} = \\frac{3}{4}',
        elicitationChips: [
          { label: '🍕 What if we cut 8 slices?', query: 'What happens if we cut the pizza into 8 slices instead?' },
          { label: '💡 Give me a hint', query: 'Can you show me another fun fraction analogy?' },
          { label: '🧪 Test my understanding', query: 'Ask me a quick pizza slice question!' }
        ]
      }
    ],
    artifact: {
      isOpen: true,
      type: 'notes',
      title: 'Pizza Fraction Storyboard',
      stepBadge: 'Step 1: Visual Counting',
      validationStatus: 'Validated',
      content: `# The Pizza Slice Explorer 🍕

## Equal Slices Make Fractions
When you divide any whole thing into **equal pieces**, each piece is a fraction!

- **Total slices at the bottom (Denominator)**: Tells you how many equal slices in the whole pie.
- **Slices you pick at the top (Numerator)**: Tells you how many slices are on your plate.

### 🌟 Try This Active Challenge
If a chocolate bar has 6 little squares and you share 2 squares with your best friend:
- Bottom number = **6**
- Top number = **2**
- Your fraction = **2 / 6** (or **1 / 3** of the bar!)
`,
      metadata: {
        step: 'Visual Analogy 1',
        status: 'Validated',
        pedagogicalNote: 'Fractions always require pieces to be exactly equal in size!'
      }
    }
  },

  tier_middle: {
    id: 'preset_middle',
    tierId: 'tier_middle',
    title: 'Balance Scale Linear Equations',
    subject: 'Pre-Algebra',
    messages: [
      {
        id: 'msg-m1',
        role: 'user',
        content: 'How do I solve the equation 2x + 5 = 19 without getting confused?',
        textParagraphs: ['How do I solve the equation 2x + 5 = 19 without getting confused?'],
        timestamp: '11:02 AM',
      },
      {
        id: 'msg-m2',
        role: 'assistant',
        sender: 'ved',
        timestamp: '11:02 AM',
        hasReasoning: true,
        reasoningLatency: '0.6s',
        indexedDocs: 'Middle School Pre-Algebra • Balance Scales',
        steps: [
          { id: 1, text: 'Calibrated Tier: Middle (Grades 6–8)', status: 'success' },
          { id: 2, text: 'Formulated balance scale analogy with scaffolding blanks', status: 'success' },
          { id: 3, text: 'Mounted step equation card to right workbench', status: 'success' },
        ],
        thoughtTrace: `[Tier]: tier_middle (Grade 7)
[Strategy]: Scaffolding Question with fill-in-the-blank (___).
[Rule]: Do not give direct answer 7. Prompt student to isolate the 2x term first by balancing both sides.`,
        textParagraphs: [
          'Think of the equal sign like a perfectly balanced seesaw: whatever weight you take away from one side, you must take away from the other!',
          'To isolate $2x$, what happens when we subtract the loose $+5$ weight from both sides?',
          'Fill in the missing blank on our balance scale:'
        ],
        inlineFormula: '2x + 5 - 5 = 19 - 5 \\implies 2x = \\_\\_\\_',
        elicitationChips: [
          { label: '⚖️ What is 19 - 5?', query: 'Show me the next balance step for 2x = 14.' },
          { label: '💡 Give me a hint', query: 'Why do we subtract 5 before dividing by 2?' },
          { label: '⚠️ Common sign pitfalls', query: 'What mistake do students make when moving terms across the equals sign?' }
        ]
      }
    ],
    artifact: {
      isOpen: true,
      type: 'math',
      title: 'Balance Scale Equation Isolation',
      stepBadge: 'Step 2: Subtraction Scaffolding',
      validationStatus: 'Needs Input',
      content: '2x = 14 \\implies x = \\frac{14}{2} = 7',
      metadata: {
        step: 'Step 2: Balance Isolation',
        status: 'Needs Input',
        pedagogicalNote: 'Golden rule of algebra: Whatever operation you perform on the left side, execute identically on the right side.'
      }
    }
  },

  tier_high: {
    id: 'preset_high',
    tierId: 'tier_high',
    title: 'Work-Kinetic Energy Theorem & Non-Conservative Forces',
    subject: 'Physics (AP / CBSE)',
    messages: [
      {
        id: 'msg-h1',
        role: 'user',
        content: 'Derive the Work-Energy Theorem for a variable force F(x) and show how it relates to kinetic energy.',
        textParagraphs: ['Derive the Work-Energy Theorem for a variable force F(x) and show how it relates to kinetic energy.'],
        timestamp: '02:18 PM',
      },
      {
        id: 'msg-h2',
        role: 'assistant',
        sender: 'ved',
        timestamp: '02:18 PM',
        hasReasoning: true,
        reasoningLatency: '1.2s',
        indexedDocs: 'Resnick & Halliday Ch. 7 • Work & Kinetic Energy',
        steps: [
          { id: 1, text: 'Identified Tier: tier_high (Grade 11 / AP Physics)', status: 'success' },
          { id: 2, text: 'Enforced 3-Chunk Rule & Physical Units carrying (J, m/s²)', status: 'success' },
          { id: 3, text: 'Suppressed Turn 1 turnkey answer; mounted 4-step KaTeX derivation canvas', status: 'success' },
        ],
        thoughtTrace: `[Tier]: tier_high (Grade 11)
[Pedagogy]: Level 2 Scaffolding.
[Invariant]: Never reveal the final integrated scalar answer on Turn 1.
[LaTeX Anchor]: Display definition integral and prompt student for the velocity chain rule substitution.`,
        textParagraphs: [
          'The net work done on a particle equals the integral of the resultant force over its spatial displacement.',
          'Using Newton’s second law $F_{\\text{net}} = m \\frac{dv}{dt}$, we can connect position displacement $dx$ directly with velocity $v$.',
          'Observe how the differential chain rule identity converts $(dv/dt) \\, dx$ into $v \\, dv$:'
        ],
        inlineFormula: 'W_{\\text{net}} = \\int_{x_i}^{x_f} m \\frac{dv}{dt} \\, dx = m \\int_{v_i}^{v_f} v \\, dv',
        elicitationChips: [
          { label: '💡 Give me a hint', query: 'How does the chain rule allow replacing (dv/dt) dx with v dv?' },
          { label: '📊 Show graphical intuition', query: 'Show the work integral as the area under an F(x) curve.' },
          { label: '⚠️ Non-conservative force traps', query: 'How do friction and non-conservative work alter ΔK?' }
        ]
      }
    ],
    artifact: {
      isOpen: true,
      type: 'math',
      title: 'Work-Kinetic Energy Derivation',
      stepBadge: 'Step 3: Integral Evaluation',
      validationStatus: 'Validated',
      content: 'W_{\\text{net}} = m \\left[ \\frac{v^2}{2} \\right]_{v_i}^{v_f} = \\frac{1}{2} m v_f^2 - \\frac{1}{2} m v_i^2 = \\Delta K',
      metadata: {
        step: 'Step 3: Definite Integration',
        status: 'Validated',
        pedagogicalNote: 'Carries physical units of Joules (J = kg·m²/s²). Valid for both constant and position-dependent forces.'
      }
    }
  },

  tier_undergrad: {
    id: 'preset_undergrad',
    tierId: 'tier_undergrad',
    title: 'Dijkstra’s Algorithm with Min-Heap Priority Queue',
    subject: 'Computer Science (DSA)',
    messages: [
      {
        id: 'msg-u1',
        role: 'user',
        content: 'Explain Dijkstra’s algorithm complexity with an adjacency list and min-heap, and show Python implementation with a dry-run trace.',
        textParagraphs: ['Explain Dijkstra’s algorithm complexity with an adjacency list and min-heap, and show Python implementation with a dry-run trace.'],
        timestamp: '03:45 PM',
      },
      {
        id: 'msg-u2',
        role: 'assistant',
        sender: 'ved',
        timestamp: '03:45 PM',
        hasReasoning: true,
        reasoningLatency: '1.4s',
        indexedDocs: 'CLRS Ch. 24 • Single-Source Shortest Paths',
        steps: [
          { id: 1, text: 'Identified Tier: tier_undergrad (B.Tech Computer Science)', status: 'success' },
          { id: 2, text: 'Formulated Asymptotic Bound: O((V + E) log V)', status: 'success' },
          { id: 3, text: 'Dispatched Python CodeRunner with dry-run state trace table to Workbench', status: 'success' },
        ],
        thoughtTrace: `[Tier]: tier_undergrad (DSA)
[Pedagogy]: Rigorous edge-relaxation invariants.
[Key Invariant]: Dijkstra greedily extracts the minimum tentative distance. It assumes non-negative edge weights w(u, v) >= 0.
[Workbench]: Code exceeds 15 lines; mounted inside CodeRunner component with live state table.`,
        textParagraphs: [
          'Dijkstra solves the single-source shortest path problem on weighted directed graphs with non-negative edge weights $w(u, v) \\ge 0$.',
          'Using a binary min-heap priority queue, each vertex extraction takes $\\mathcal{O}(\\log V)$, and each edge relaxation takes $\\mathcal{O}(\\log V)$ amortized.',
          'The total time complexity is bounded by $\\mathcal{O}((V + E) \\log V)$, while space complexity is $\\mathcal{O}(V)$ for the distance map and heap.'
        ],
        inlineFormula: 'T(V, E) = \\mathcal{O}(|V| \\log |V| + |E| \\log |V|) = \\mathcal{O}((|V| + |E|) \\log |V|)',
        elicitationChips: [
          { label: '🐍 Run Python Trace', query: 'Walk me through the heap state table step-by-step.' },
          { label: '⚡ Negative Edge Counterexample', query: 'Show why Dijkstra fails when an edge has negative weight.' },
          { label: '🧪 Test with 5-Node Graph', query: 'Trace Dijkstra on a triangle graph with an alternate detour path.' }
        ]
      }
    ],
    artifact: {
      isOpen: true,
      type: 'code',
      title: 'Dijkstra Min-Heap Implementation',
      stepBadge: 'Python 3 Sandbox',
      validationStatus: 'Validated',
      content: `import heapq

def dijkstra(graph, start):
    """
    Computes shortest distances from start node in O((V + E) log V).
    graph: dict mapping node -> list of tuples (neighbor, weight)
    """
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]  # (current_distance, node)
    visited = set()

    while pq:
        curr_dist, u = heapq.heappop(pq)

        if u in visited:
            continue
        visited.add(u)

        for v, weight in graph[u]:
            distance = curr_dist + weight
            # Relaxation invariant
            if distance < distances[v]:
                distances[v] = distance
                heapq.heappush(pq, (distance, v))

    return distances

# Example Graph
graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('A', 4), ('C', 1), ('D', 5)],
    'C': [('A', 2), ('B', 1), ('D', 8), ('E', 10)],
    'D': [('B', 5), ('C', 8), ('E', 2)],
    'E': [('C', 10), ('D', 2)]
}

shortest_paths = dijkstra(graph, 'A')
print("Shortest Paths from A:", shortest_paths)`,
      metadata: {
        step: 'Python 3 Runner',
        status: 'Validated',
        complexity: 'Time: O((V + E) log V) | Space: O(V)',
        pedagogicalNote: 'Dijkstra fails on graphs with negative cycles or negative edge weights because greedy commitments cannot be retracted.'
      }
    }
  },

  tier_masters: {
    id: 'preset_masters',
    tierId: 'tier_masters',
    title: 'Karush-Kuhn-Tucker (KKT) Conditions & Dual SVM Optimization',
    subject: 'Machine Learning Theory & Convex Optimization',
    messages: [
      {
        id: 'msg-m1',
        role: 'user',
        content: 'Formulate the Lagrangian dual for Hard-Margin SVM and state the KKT conditions with complementary slackness.',
        textParagraphs: ['Formulate the Lagrangian dual for Hard-Margin SVM and state the KKT conditions with complementary slackness.'],
        timestamp: '04:12 PM',
      },
      {
        id: 'msg-m2',
        role: 'assistant',
        sender: 'ved',
        timestamp: '04:12 PM',
        hasReasoning: true,
        reasoningLatency: '1.8s',
        indexedDocs: 'Boyd & Vandenberghe Ch. 5 • Duality & KKT Invariants',
        steps: [
          { id: 1, text: 'Identified Tier: tier_masters (Postgraduate / Research)', status: 'success' },
          { id: 2, text: 'Verified Slater’s Condition for Strong Duality (affine constraints)', status: 'success' },
          { id: 3, text: 'Mounted Theorem-Proof Matrix & Flashcard Study Guide to Workbench', status: 'success' },
        ],
        thoughtTrace: `[Tier]: tier_masters (Optimization / ML)
[Rigor]: Full Karush-Kuhn-Tucker (KKT) theorem structure.
[Slater's Condition]: Since constraints are affine and data is linearly separable, strong duality holds (primal opt = dual opt).
[Complementary Slackness]: α_i * [y_i(w^T x_i + b) - 1] = 0 implies only support vectors have α_i > 0.`,
        textParagraphs: [
          'For linearly separable data, the primal hard-margin SVM minimizes $\\frac{1}{2} \\|w\\|^2$ subject to affine inequality constraints $y_i(w^T x_i + b) \\ge 1$.',
          'Because the objective is strictly convex quadratic and constraints are affine, Slater’s condition holds, guaranteeing strong duality with zero duality gap.',
          'Complementary slackness enforces that Lagrange multipliers $\\alpha_i$ are strictly zero for all points that do not lie directly on the supporting hyperplanes.'
        ],
        inlineFormula: '\\alpha_i \\left( y_i(w^T x_i + b) - 1 \\right) = 0, \\quad \\forall i \\in \\{1, \\dots, n\\}',
        elicitationChips: [
          { label: '📐 Check Slater’s Condition', query: 'Explain how Slater’s constraint qualification guarantees strong duality here.' },
          { label: '⚡ Dual Kernel Trick', query: 'How does substituting w = ∑ α_i y_i x_i yield the Gram kernel matrix K_ij = x_i^T x_j?' },
          { label: '🧪 Test Non-Separable Case', query: 'Show how slack variables ξ_i modify the KKT dual into the box-constrained soft-margin SVM.' }
        ]
      }
    ],
    artifact: {
      isOpen: true,
      type: 'notes',
      title: 'KKT Invariants & SVM Dual Matrix',
      stepBadge: 'Graduate Study Matrix',
      validationStatus: 'Validated',
      content: `# KKT Conditions for Hard-Margin SVM

## 1. Primal Problem Formulation
$$\\min_{w, b} \\frac{1}{2} \\|w\\|^2 \\quad \\text{s.t.} \\quad 1 - y_i(w^T x_i + b) \\le 0, \\quad \\forall i = 1, \\dots, n$$

## 2. Lagrangian Function
$$\\mathcal{L}(w, b, \\alpha) = \\frac{1}{2} w^T w - \\sum_{i=1}^n \\alpha_i \\left[ y_i(w^T x_i + b) - 1 \\right]$$

## 3. The 4 KKT Conditions
1. **Stationarity:**
   $$\\nabla_w \\mathcal{L} = w - \\sum_{i=1}^n \\alpha_i y_i x_i = 0 \\implies w = \\sum_{i=1}^n \\alpha_i y_i x_i$$
   $$\\frac{\\partial \\mathcal{L}}{\\partial b} = -\\sum_{i=1}^n \\alpha_i y_i = 0$$

2. **Primal Feasibility:**
   $$y_i(w^T x_i + b) - 1 \\ge 0, \\quad \\forall i$$

3. **Dual Feasibility:**
   $$\\alpha_i \\ge 0, \\quad \\forall i$$

4. **Complementary Slackness:**
   $$\\alpha_i \\left[ y_i(w^T x_i + b) - 1 \\right] = 0, \\quad \\forall i$$
   - If $y_i(w^T x_i + b) > 1$ (point strictly inside margin) $\\implies \\alpha_i = 0$.
   - If $\\alpha_i > 0 \\implies y_i(w^T x_i + b) = 1$ (point is an active **Support Vector**).
`,
      metadata: {
        step: 'Graduate Study Guide',
        status: 'Validated',
        pedagogicalNote: 'Complementary slackness is the mathematical foundation for sparsity in SVM solutions.'
      }
    }
  },

  admin_gate_da: {
    id: 'preset_admin_gate_da',
    tierId: 'admin_gate_da',
    title: 'IIT GATE DA Exam Engine: Linear Algebra & Spectral SVD',
    subject: 'GATE DA (Data Science & AI)',
    messages: [
      {
        id: 'msg-g1',
        role: 'user',
        content: 'Solve GATE DA Problem: Let A be 4x3 with singular values 5, 3, 0. What are trace, det, and rank of M = AᵀA? Reveal IIT question-setter traps.',
        textParagraphs: ['Solve GATE DA Problem: Let A be 4x3 with singular values 5, 3, 0. What are trace, det, and rank of M = AᵀA? Reveal IIT question-setter traps.'],
        timestamp: '05:30 PM',
      },
      {
        id: 'msg-g2',
        role: 'assistant',
        sender: 'ved',
        timestamp: '05:30 PM',
        hasReasoning: true,
        reasoningLatency: '0.9s',
        indexedDocs: 'Official GATE DA Syllabus • Pillar 2: Linear Algebra (SVD & Gram Matrices)',
        steps: [
          { id: 1, text: 'Activated IIT GATE DA Exam Engine Mode (Ved-GATE-DA)', status: 'success' },
          { id: 2, text: 'Tagged Syllabus Pillar: LIN_ALG (Singular Value Decomposition)', status: 'success' },
          { id: 3, text: 'Executed 20-Sec Eigenvalue Sum & Determinant Shortcut', status: 'success' },
          { id: 4, text: 'Decoded IIT Distractor Traps A/B/C/D into GateDaWorkbench', status: 'success' },
        ],
        thoughtTrace: `[Mode]: Admin GATE DA Exam Engine
[Pillar]: LIN_ALG (Linear Algebra)
[Question Format]: 2-Mark MCQ (Negative marking: -2/3 = -0.66)
[<60s Shortcut]: Eigenvalues of AᵀA are the squares of singular values σ_i².
λ = {5², 3², 0²} = {25, 9, 0}.
tr(M) = 25 + 9 + 0 = 34.
det(M) = 25 * 9 * 0 = 0.
rank(M) = 2.
Correct Option: A.
[Distractor Analysis]:
- Option B tests forgetting to square singular values (5 + 3 = 8).
- Option C tests ignoring zero eigenvalue in determinant product (25 * 9 = 225).
- Option D tests multiplying singular values without squaring.`,
        textParagraphs: [
          '**IIT GATE DA Question Setter Heuristic:** In SVD questions, IIT professors test whether you remember that the eigenvalues of the Gramian $A^T A$ are the squares of the singular values $\\lambda_i = \\sigma_i^2$, not the singular values themselves.',
          'With singular values $\\{5, 3, 0\\}$, the eigenvalues are $\\{25, 9, 0\\}$. The trace is $\\sum \\lambda_i = 34$, and since $\\sigma_3 = 0$, $\\det(M) = 0$ and $\\operatorname{rank}(M) = 2$.',
          '**Correct Answer: Option A.** Explore the interactive Gate Simulator on the right to test your speed under negative marking conditions!'
        ],
        inlineFormula: 'M = A^T A \\implies \\operatorname{spec}(M) = \\{ \\sigma_1^2, \\sigma_2^2, \\sigma_3^2 \\} = \\{25, 9, 0\\}',
        elicitationChips: [
          { label: '⚡ 30-Sec Shortcut', query: 'Show how trace and determinant eliminate options B, C, D in 20 seconds.' },
          { label: '🪤 Decode IIT Distractors', query: 'Explain the psychological traps behind Distractor options B and C.' },
          { label: '🎯 Generate 2-Mark NAT Variant', query: 'Generate an isomorphic GATE DA NAT question on PCA covariance rank.' },
          { label: '🐍 Run Python Trace', query: 'Verify with numpy.linalg.svd and eigvals in Python.' }
        ]
      }
    ],
    artifact: {
      isOpen: true,
      type: 'gate_simulator',
      title: 'IIT GATE DA Problem: SVD & Gram Matrix',
      stepBadge: 'Pillar: Linear Algebra (2 Marks)',
      validationStatus: 'Trap Alert',
      content: GATE_DA_CURATED_PROBLEMS[0].questionText,
      metadata: {
        step: 'GATE DA Mock Test',
        status: 'Active Question',
        problemId: 'gate-da-001',
        pillar: 'LIN_ALG',
        marks: 2,
        type: 'MCQ',
        negativeMarks: -0.66,
        shortcut: GATE_DA_CURATED_PROBLEMS[0].shortcut,
        distractorTraps: GATE_DA_CURATED_PROBLEMS[0].distractorTraps,
        fullDerivation: GATE_DA_CURATED_PROBLEMS[0].fullDerivation
      }
    }
  }
};
