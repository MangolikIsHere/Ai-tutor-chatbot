ML_KEYWORDS = [
    # Core
    "machine learning", "ml", "ai", "deep learning", "dl",
    "supervised", "unsupervised", "reinforcement learning",

    # Algorithms
    "regression", "classification", "clustering",
    "linear regression", "logistic regression",
    "decision tree", "random forest", "xgboost",
    "svm", "knn", "naive bayes",

    # Neural
    "neural network", "cnn", "rnn", "lstm",
    "transformer", "bert",

    # Concepts
    "overfitting", "underfitting", "bias variance",
    "gradient descent", "loss function",
    "activation function", "dropout",
    "cross validation",

    # Metrics
    "precision", "recall", "f1 score",
    "roc", "auc", "confusion matrix",

    # Data / tools
    "numpy", "pandas", "sklearn",
    "scikit learn", "tensorflow", "pytorch",

    # Math
    "statistics", "probability",
    "linear algebra", "matrix", "vector",
    "pca", "dimensionality reduction",

    # NLP/CV
    "nlp", "computer vision",

    # Educational wording
    "explain", "define", "difference between",
    "compare", "formula", "intuition",
    "advantages", "disadvantages",
    "when to use", "interview question"
]


def build_rag_prompt(context: str, query: str) -> str:
    return f"""
You are an expert Machine Learning tutor.

Use the context below if relevant.
If context is insufficient, use your own knowledge.

Context:
{context}

Question:
{query}

Give a clear concise answer with examples if useful.
"""


def build_plain_prompt(query: str) -> str:
    return f"""
You are a helpful assistant.

Question:
{query}

Give a clear concise answer.
"""