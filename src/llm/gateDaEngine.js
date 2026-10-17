/**
 * gateDaEngine.js
 * Official IIT GATE Data Science & AI (GATE DA) Curriculum, Pillars, Scoring Telemetry & Problems.
 * Adheres strictly to .agents/rules/admin-gate-da.md
 */

export const GATE_DA_PILLARS = {
  PROB_STAT: {
    id: 'PROB_STAT',
    name: 'Probability & Statistics',
    shortName: 'Prob & Stats',
    color: 'indigo',
    topics: [
      'Counting & Axiomatic Probability',
      'Bayes Theorem & Conditional Probability',
      'Random Variables (PMF, PDF, CDF)',
      'Expectation & Variance',
      'Distributions (Binomial, Poisson, Normal, t, Chi-square)',
      'Central Limit Theorem',
      'Hypothesis Testing & Confidence Intervals',
      'MLE & MAP Estimation'
    ]
  },
  LIN_ALG: {
    id: 'LIN_ALG',
    name: 'Linear Algebra',
    shortName: 'Linear Algebra',
    color: 'cyan',
    topics: [
      'Vector Spaces & Subspaces',
      'Linear Independence, Basis & Dimension',
      'Matrices, Projections & Quadratic Forms',
      'Systems of Linear Equations',
      'Eigenvalues & Eigenvectors',
      'LU Decomposition',
      'Singular Value Decomposition (SVD)',
      'Principal Component Analysis (PCA)'
    ]
  },
  CALC_OPT: {
    id: 'CALC_OPT',
    name: 'Calculus & Optimization',
    shortName: 'Calculus & Opt',
    color: 'emerald',
    topics: [
      'Single Variable Limits & Continuity',
      'Differentiability & Taylor Series',
      'Maxima, Minima & Optimization',
      'Convex Functions & Jensen Inequality',
      'Gradient Descent & KKT Intuition'
    ]
  },
  PYTHON_DSA: {
    id: 'PYTHON_DSA',
    name: 'Programming, Data Structures & Python',
    shortName: 'Python & DSA',
    color: 'amber',
    topics: [
      'Python Semantics, Mutability & Slicing',
      'Stacks, Queues & Linked Lists',
      'Trees, BST & Hash Tables',
      'Sorting & Divide-and-Conquer',
      'Graph Traversals (BFS, DFS)',
      'Topological Sort & Shortest Paths (Dijkstra, Bellman-Ford)'
    ]
  },
  DBMS_DW: {
    id: 'DBMS_DW',
    name: 'Database Management & Warehousing',
    shortName: 'DBMS & DW',
    color: 'violet',
    topics: [
      'ER & Relational Model',
      'Relational Algebra & Tuple Calculus',
      'SQL Queries, Joins & Subqueries',
      'Functional Dependencies & Normal Forms (1NF-BCNF)',
      'File Indexing (B/B+ Trees)',
      'Data Warehousing, Star/Snowflake & OLAP'
    ]
  },
  ML: {
    id: 'ML',
    name: 'Machine Learning',
    shortName: 'Machine Learning',
    color: 'rose',
    topics: [
      'Linear & Regularized Regression (Ridge/Lasso)',
      'Logistic Regression & LDA',
      'SVM (Primal/Dual & Kernels)',
      'Decision Trees & Gini/Entropy',
      'k-NN & Naive Bayes',
      'Neural Networks & Backpropagation',
      'Clustering (k-Means, Hierarchical)',
      'PCA & Dimensionality Reduction'
    ]
  },
  AI: {
    id: 'AI',
    name: 'Artificial Intelligence',
    shortName: 'Artificial Intel',
    color: 'teal',
    topics: [
      'Uninformed Search (BFS, DFS, UCS)',
      'Informed Search (Greedy, A* Admissibility)',
      'Adversarial Search (Minimax, Alpha-Beta)',
      'Propositional & First-Order Logic',
      'Bayesian Networks & Conditional Independence',
      'Exact Inference (Variable Elimination)',
      'Approximate Inference (Sampling)'
    ]
  },
  GA: {
    id: 'GA',
    name: 'General Aptitude',
    shortName: 'Aptitude',
    color: 'zinc',
    topics: [
      'Quantitative Aptitude & Proportions',
      'Analytical & Spatial Reasoning',
      'Data Interpretation & Probability'
    ]
  }
};

export const GATE_DA_CURATED_PROBLEMS = [
  {
    id: 'gate-da-001',
    pillar: 'LIN_ALG',
    title: 'Singular Value Decomposition & Gram Matrix Spectral Rank',
    marks: 2,
    type: 'MCQ',
    questionText: `Let $A \\in \\mathbb{R}^{4 \\times 3}$ be a real matrix whose singular values are $\\sigma_1 = 5$, $\\sigma_2 = 3$, and $\\sigma_3 = 0$. Consider the symmetric Gram matrix $M = A^T A \\in \\mathbb{R}^{3 \\times 3}$. What are the trace $\\operatorname{tr}(M)$, the determinant $\\det(M)$, and the rank $\\operatorname{rank}(M)$ respectively?`,
    options: [
      { id: 'A', text: 'tr(M) = 34, det(M) = 0, rank(M) = 2' },
      { id: 'B', text: 'tr(M) = 8, det(M) = 0, rank(M) = 2' },
      { id: 'C', text: 'tr(M) = 34, det(M) = 225, rank(M) = 3' },
      { id: 'D', text: 'tr(M) = 15, det(M) = 0, rank(M) = 3' }
    ],
    correctAnswer: 'A',
    negativeMarks: -0.66,
    shortcut: `⚡ <30-Sec Invariant Shortcut: The eigenvalues of $M = A^T A$ are the squares of the singular values: $\\lambda_i(A^T A) = \\sigma_i^2$. Here $\\lambda = \\{5^2, 3^2, 0^2\\} = \\{25, 9, 0\\}$. Immediate sum $\\operatorname{tr}(M) = 25 + 9 + 0 = 34$. Since one eigenvalue is 0, $\\det(M) = 0$. Non-zero eigenvalues = 2, so $\\operatorname{rank}(M) = 2$. Eliminates B, C, D in under 20 seconds!`,
    distractorTraps: {
      B: 'Trap: Forgetting that eigenvalues of AᵀA are the SQUARES of singular values. Student mistakenly added σ₁ + σ₂ = 5 + 3 = 8 instead of 25 + 9 = 34.',
      C: 'Trap: Confusing product of singular values with non-zero singular values only. Computed det(M) = 25 × 9 = 225 by ignoring σ₃ = 0, wrongly concluding full rank 3.',
      D: 'Trap: Multiplied non-zero singular values (5 × 3 = 15) as the trace and assumed full column rank.'
    },
    fullDerivation: `\\text{Step 1: Singular Value Decomposition (SVD)}
A = U \\Sigma V^T \\implies A^T A = (V \\Sigma^T U^T)(U \\Sigma V^T) = V (\\Sigma^T \\Sigma) V^T

\\text{Step 2: Eigenvalues of the Gramian } M = A^T A
\\lambda_1 = \\sigma_1^2 = 5^2 = 25, \\quad \\lambda_2 = \\sigma_2^2 = 3^2 = 9, \\quad \\lambda_3 = \\sigma_3^2 = 0^2 = 0

\\text{Step 3: Trace, Determinant, and Rank Computation}
\\operatorname{tr}(M) = \\sum_{i=1}^3 \\lambda_i = 25 + 9 + 0 = 34
\\det(M) = \\prod_{i=1}^3 \\lambda_i = 25 \\times 9 \\times 0 = 0
\\operatorname{rank}(M) = |\\{ \\lambda_i > 0 \\}| = 2`
  },
  {
    id: 'gate-da-002',
    pillar: 'AI',
    title: 'Bayesian Network Conditional Independence (d-Separation)',
    marks: 2,
    type: 'MSQ',
    questionText: `Consider a Bayesian Network with directed edges:
$$X_1 \\longrightarrow X_2 \\longrightarrow X_4, \\quad X_3 \\longrightarrow X_2 \\longrightarrow X_4$$
Which of the following conditional independence statements MUST be TRUE according to d-separation?`,
    options: [
      { id: 'A', text: 'X₁ ⫫ X₃ | ∅ (X₁ and X₃ are marginally independent)' },
      { id: 'B', text: 'X₁ ⫫ X₃ | X₂ (Conditioning on common child X₂ keeps X₁ and X₃ independent)' },
      { id: 'C', text: 'X₁ ⫫ X₄ | X₂ (X₂ d-separates X₁ from X₄)' },
      { id: 'D', text: 'X₁ ⫫ X₃ | X₄ (Conditioning on descendant X₄ keeps X₁ and X₃ independent)' }
    ],
    correctAnswer: ['A', 'C'],
    negativeMarks: 0,
    shortcut: `⚡ <40-Sec V-Structure Rule:
1. $X_1 \\rightarrow X_2 \\leftarrow X_3$ is a v-structure (collider at $X_2$).
2. An unconditioned collider blocks the path! Hence $X_1 \\perp X_3 \\mid \\emptyset$ is TRUE (Option A).
3. Conditioning on collider $X_2$ or its descendant $X_4$ OPENS the active trail (explaining away). Hence Options B and D are FALSE!
4. In serial trail $X_1 \\rightarrow X_2 \\rightarrow X_4$, conditioning on non-collider $X_2$ blocks the trail. Hence Option C is TRUE! Correct: A and C.`,
    distractorTraps: {
      B: 'Trap: Classical collider misconception. Conditioning on the common child X₂ creates dependency ("explaining away effect"). Active trail is opened, so X₁ and X₃ become conditionally dependent!',
      D: 'Trap: Missing that conditioning on a descendant of a collider (X₄) ALSO activates the collider at X₂, opening the path between X₁ and X₃.'
    },
    fullDerivation: `\\text{Definition of d-separation in DAGs:}
\\text{1. V-structure (Collider): } X_1 \\rightarrow X_2 \\leftarrow X_3
\\text{Path is inactive when collider } X_2 \\text{ and all its descendants are NOT in conditioning set } Z.
\\implies Z = \\emptyset \\implies X_1 \\perp X_3 \\mid \\emptyset \\quad \\text{(Statement A is Valid)}

\\text{2. Conditioning on Collider or Descendant:}
X_2 \\in Z \\text{ or } X_4 \\in Z \\implies \\text{Trail is active}
\\implies X_1 \\not\\perp X_3 \\mid X_2 \\quad \\text{and} \\quad X_1 \\not\\perp X_3 \\mid X_4 \\quad \\text{(Statements B & D are False)}

\\text{3. Serial Connection: } X_1 \\rightarrow X_2 \\rightarrow X_4
\\text{Path is blocked when non-collider } X_2 \\in Z \\implies X_1 \\perp X_4 \\mid X_2 \\quad \\text{(Statement C is Valid)}`
  },
  {
    id: 'gate-da-003',
    pillar: 'PROB_STAT',
    title: 'Maximum Likelihood Estimation (Uniform PDF)',
    marks: 2,
    type: 'NAT',
    precision: 2,
    questionText: `Let $X_1, X_2, X_3, X_4, X_5$ be an independent and identically distributed random sample drawn from a continuous Uniform distribution $U[0, \\theta]$, where $\\theta > 0$. The observed sample values are:
$$\\{2.4, \\, 4.1, \\, 1.8, \\, 5.6, \\, 3.9\\}$$
What is the Maximum Likelihood Estimate (MLE) $\\hat{\\theta}_{\\text{MLE}}$? (Round off to 1 decimal place).`,
    correctAnswer: 5.6,
    acceptableRange: [5.5, 5.7],
    negativeMarks: 0,
    shortcut: `⚡ <15-Sec MLE Invariant: For $U[0, \\theta]$, the likelihood $L(\\theta) = \\frac{1}{\\theta^n} \\mathbb{I}_{\\{\\theta \\ge X_{(n)}\\}}$. This function is strictly decreasing in $\\theta$. To maximize $L(\\theta)$, we choose the smallest possible $\\theta$ satisfying the indicator condition: $\\hat{\\theta}_{\\text{MLE}} = \\max(X_1, \\dots, X_n) = X_{(n)}$. Maximum of sample is 5.6!`,
    distractorTraps: {
      methodOfMoments: 'Trap: Confusing MLE with Method of Moments (MoM). For MoM: E[X] = θ/2 ⇒ θ̂_MoM = 2 × X̄ = 2 × 3.56 = 7.12. Using calculus dL/dθ = 0 will fail because the likelihood boundary is non-differentiable!'
    },
    fullDerivation: `\\text{Step 1: Likelihood Function for } X_i \\sim U[0, \\theta]
f(x_i; \\theta) = \\begin{cases} \\frac{1}{\\theta}, & 0 \\le x_i \\le \\theta \\\\ 0, & \\text{otherwise} \\end{cases}
L(\\theta) = \\prod_{i=1}^n \\frac{1}{\\theta} \\mathbb{I}_{\\{0 \\le x_i \\le \\theta\\}} = \\frac{1}{\\theta^n} \\mathbb{I}_{\\{ \\max_i(x_i) \\le \\theta \\}}

\\text{Step 2: Optimization via Monotonicity}
\\frac{d}{d\\theta} \\left( \\frac{1}{\\theta^n} \\right) = -\\frac{n}{\\theta^{n+1}} < 0 \\quad \\text{for } \\theta > 0
\\text{Since } L(\\theta) \\text{ is strictly monotonically decreasing for } \\theta \\ge \\max(x_i),
\\text{the maximum occurs at the lower support boundary:}
\\hat{\\theta}_{\\text{MLE}} = \\max(x_1, x_2, x_3, x_4, x_5) = 5.6`
  },
  {
    id: 'gate-da-004',
    pillar: 'ML',
    title: 'SVM Geometric Margin & Support Vector Dual Norm',
    marks: 2,
    type: 'MCQ',
    questionText: `A linear Hard-Margin Support Vector Machine classifier in $\\mathbb{R}^2$ yields an optimal hyperplane with weight vector $w = [3, -4]^T$ and bias $b = 10$. What is the geometric margin $\\gamma$ (the total separation width between the positive and negative margin hyperplanes $w^T x + b = \\pm 1$)?`,
    options: [
      { id: 'A', text: '0.40' },
      { id: 'B', text: '0.20' },
      { id: 'C', text: '2.00' },
      { id: 'D', text: '5.00' }
    ],
    correctAnswer: 'A',
    negativeMarks: -0.66,
    shortcut: `⚡ <20-Sec Euclidean Norm Shortcut: The total separation width (margin) between supporting planes $w^T x + b = 1$ and $w^T x + b = -1$ is $\\frac{2}{\\|w\\|_2}$.
Here $\\|w\\|_2 = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = 5$.
Therefore, width $= \\frac{2}{5} = 0.40$. Instant choice A!`,
    distractorTraps: {
      B: 'Trap: Half-margin error. Calculated distance from boundary to one support vector (1/||w|| = 1/5 = 0.20) instead of total separation width between margin hyperplanes (2/||w|| = 0.40).',
      C: 'Trap: Neglected dividing by the L2 norm of w, outputting just the numerator 2.',
      D: 'Trap: Computed ||w|| = 5 directly and assumed the norm itself represents the margin.'
    },
    fullDerivation: `\\text{Step 1: Canonical Hyperplane Equations}
\\mathcal{H}_1: w^T x + b = +1, \\quad \\mathcal{H}_{-1}: w^T x + b = -1

\\text{Step 2: Geometric Distance Between Two Parallel Planes}
\\text{Distance } d = \\frac{|(+1) - (-1)|}{\\|w\\|_2} = \\frac{2}{\\|w\\|_2}

\\text{Step 3: Evaluation with Given Weight Vector}
\\|w\\|_2 = \\sqrt{3^2 + (-4)^2} = \\sqrt{25} = 5
\\gamma = \\frac{2}{5} = 0.40`
  },
  {
    id: 'gate-da-005',
    pillar: 'PYTHON_DSA',
    title: 'Python Recursion Stack Depth & Memoized Fibonacci Call Count',
    marks: 1,
    type: 'NAT',
    precision: 0,
    questionText: `Consider the following recursive Python function with an explicit call counter:
\`\`\`python
call_count = 0
def f(n):
    global call_count
    call_count += 1
    if n <= 1:
        return n
    return f(n - 1) + f(n - 2)

f(4)
\`\`\`
What is the final integer value of \`call_count\` after the execution of \`f(4)\`?`,
    correctAnswer: 9,
    acceptableRange: [9, 9],
    negativeMarks: 0,
    shortcut: `⚡ <30-Sec Invariant Shortcut: The recurrence for the total number of calls in naive Fibonacci is $C(n) = 1 + C(n-1) + C(n-2)$, with $C(0) = 1, C(1) = 1$.
$C(2) = 1 + 1 + 1 = 3$
$C(3) = 1 + 3 + 1 = 5$
$C(4) = 1 + 5 + 3 = 9$. Answer is exactly 9!`,
    distractorTraps: {
      fibValue: 'Trap: Outputting the return value of f(4) which is 3, rather than the invocation count of f().',
      binaryTreeBound: 'Trap: Assuming a full binary tree 2^(n) - 1 = 15 calls without tracing that base cases terminate early.'
    },
    fullDerivation: `\\text{Call Tree Trace for } f(4):
f(4) \\rightarrow [f(3), f(2)] \\quad (1 \\text{ call})
  f(3) \\rightarrow [f(2), f(1)] \\quad (1 \\text{ call})
    f(2) \\rightarrow [f(1), f(0)] \\quad (1 \\text{ call})
      f(1) \\quad (1 \\text{ call, base})
      f(0) \\quad (1 \\text{ call, base})
    f(1) \\quad (1 \\text{ call, base})
  f(2) \\rightarrow [f(1), f(0)] \\quad (1 \\text{ call})
    f(1) \\quad (1 \\text{ call, base})
    f(0) \\quad (1 \\text{ call, base})

\\text{Sum of all invocations} = 1 + (1 + 1 + 1 + 1 + 1) + (1 + 1 + 1) = 9`
  }
];

export function computeNetScore(answers = [], questions = GATE_DA_CURATED_PROBLEMS) {
  let netScore = 0;
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  const pillarStats = {};

  for (const q of questions) {
    pillarStats[q.pillar] = pillarStats[q.pillar] || { attempted: 0, correct: 0, score: 0 };
    const ans = answers.find(a => a.questionId === q.id);
    if (!ans || ans.userResponse === null || ans.userResponse === undefined) continue;

    attempted++;
    pillarStats[q.pillar].attempted++;

    let isCorrect = false;
    if (q.type === 'MCQ') {
      isCorrect = ans.userResponse === q.correctAnswer;
    } else if (q.type === 'MSQ') {
      const uSet = new Set(ans.userResponse || []);
      const cSet = new Set(q.correctAnswer || []);
      isCorrect = uSet.size === cSet.size && [...uSet].every(x => cSet.has(x));
    } else if (q.type === 'NAT') {
      const numVal = parseFloat(ans.userResponse);
      if (q.acceptableRange) {
        isCorrect = numVal >= q.acceptableRange[0] && numVal <= q.acceptableRange[1];
      } else {
        isCorrect = Math.abs(numVal - q.correctAnswer) < 0.05;
      }
    }

    if (isCorrect) {
      correct++;
      netScore += q.marks;
      pillarStats[q.pillar].correct++;
      pillarStats[q.pillar].score += q.marks;
    } else {
      incorrect++;
      if (q.type === 'MCQ') {
        const penalty = q.marks === 1 ? (1 / 3) : (2 / 3);
        netScore -= penalty;
        pillarStats[q.pillar].score -= penalty;
      }
    }
  }

  return {
    netScore: parseFloat(netScore.toFixed(2)),
    attempted,
    correct,
    incorrect,
    accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
    pillarStats
  };
}
