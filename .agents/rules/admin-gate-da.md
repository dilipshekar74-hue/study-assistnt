---
trigger: always_on
---

---
trigger: always_on
description: "Admin-exclusive LLM mode and workbench specifications for GATE Data Science and Artificial Intelligence (GATE DA) preparation"
---

# Admin Mode: GATE DA (Data Science & AI) Command Center (`Ved-GATE-DA`)

## 1. Activation & Security Scope
- When `isAdminMode === true` and mode is set to `admin_gate_da`, bypass K-12 Socratic simplification and engage **IIT GATE DA Exam Engine Mode**.
- Prioritize mathematical rigor, speed-solving shortcuts, option-elimination heuristics, and IIT question-setter trap detection.

## 2. Official GATE DA Syllabus Domain Knowledge
The LLM must classify and tag every Admin query into one of the **7 Core GATE DA Pillars + General Aptitude**:

1. **Probability & Statistics (`PROB_STAT`):**
   - Counting (permutations/combinations), axiomatic probability, sample space, independent/mutually exclusive events, marginal/conditional/joint probability, Bayes Theorem.
   - Conditional expectation/variance, mean, median, mode, standard deviation, correlation, covariance.
   - Random variables: discrete PMFs (Uniform, Bernoulli, Binomial, Poisson) and continuous PDFs (Uniform, Exponential, Normal, Standard Normal, $t$-distribution, $\chi^2$-distribution), CDFs.
   - Central Limit Theorem, confidence intervals, $z$-test, $t$-test, $\chi^2$-test, Maximum Likelihood Estimation (MLE) & MAP.

2. **Linear Algebra (`LIN_ALG`):**
   - Vector spaces, subspaces, linear dependence/independence, basis, dimension.
   - Matrices: projection, orthogonal, idempotent, partition matrices, quadratic forms.
   - Systems of linear equations, Gaussian elimination, eigenvalues & eigenvectors, determinant, rank, nullity, projections, LU decomposition, Singular Value Decomposition (SVD).

3. **Calculus & Optimization (`CALC_OPT`):**
   - Functions of a single variable, limit, continuity, differentiability.
   - Taylor series, maxima and minima, single-variable optimization, convexity & KKT intuition for ML.

4. **Programming, Data Structures & Algorithms in Python (`PYTHON_DSA`):**
   - Python-specific semantics (mutability, list comprehensions, recursion depth, slicing complexity).
   - Stacks, queues, linked lists, trees, binary search trees, hash tables.
   - Search (linear, binary), Sorting (selection, bubble, insertion, divide-and-conquer mergesort & quicksort).
   - Graph theory fundamentals, BFS/DFS traversals, topological sort, shortest path algorithms (Dijkstra, Bellman-Ford).

5. **Database Management & Warehousing (`DBMS_DW`):**
   - ER model, relational model, relational algebra, tuple calculus, SQL queries (joins, aggregations, correlated subqueries).
   - Integrity constraints, functional dependencies, normal forms (1NF, 2NF, 3NF, BCNF), file organization, indexing (B/B+ trees).
   - Data transformation (normalization, discretization, sampling, compression), multidimensional warehouse schemas (star/snowflake), concept hierarchies, OLAP measure computations.

6. **Machine Learning (`ML`):**
   - Supervised Learning: Simple/multiple linear regression, ridge/lasso regularization, logistic regression, $k$-NN, Naive Bayes, Linear Discriminant Analysis (LDA), Support Vector Machines (SVM dual/kernels), Decision Trees (Information Gain, Gini), Multi-Layer Perceptron (MLP), feed-forward neural networks & backpropagation.
   - Bias-variance tradeoff, cross-validation (Leave-One-Out, $k$-fold).
   - Unsupervised Learning: $k$-means, $k$-medoid, hierarchical clustering (top-down/bottom-up, single/complete/average linkage), Principal Component Analysis (PCA).

7. **Artificial Intelligence (`AI`):**
   - Search: Uninformed (BFS, DFS, UCS, IDS), Informed (Greedy Best-First, $A^*$, admissibility & consistency of heuristics), Adversarial (Minimax, Alpha-Beta pruning).
   - Logic: Propositional logic, Predicate (First-Order) logic, resolution & unification.
   - Reasoning under Uncertainty: Conditional independence in Bayesian networks, exact inference via Variable Elimination, approximate inference via sampling (Rejection, Likelihood Weighting, Gibbs).

8. **General Aptitude (`GA`):**
   - Quantitative aptitude, analytical/spatial reasoning, data interpretation, and verbal deduction.

## 3. GATE Question Types & Scoring Telemetry
Every practice problem or solution generated in `admin_gate_da` mode must specify:
- **Question Format:**
  - `MCQ` (Multiple Choice Question: 1 out of 4 options correct; `-1/3` negative mark for 1-mark questions, `-2/3` for 2-mark questions).
  - `MSQ` (Multiple Select Question: 1 or more out of 4 options correct; **0 negative marking**, no partial credit).
  - `NAT` (Numerical Answer Type: Real number entered via virtual keypad; **0 negative marking**, specify rounding precision e.g., "round off to 2 decimal places").
- **Trap Analysis Block:** Explicitly state why each incorrect option (Distractor A/B/C/D) was engineered (e.g., "Option B results from forgetting to center the data matrix before computing the covariance matrix in PCA").
- **Shortcut / Exam Heuristic:** Provide a $< 60\text{s}$ verification trick (e.g., trace/determinant eigenvalue check, $2 \times 2$ counterexample matrix, or Python dry-run invariant) alongside the full derivation.