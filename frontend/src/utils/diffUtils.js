/**
 * Word-level diff calculation using Longest Common Subsequence (LCS)
 * Computes added, removed, and unchanged words between parent and child prompts.
 */

export const tokenizePrompt = (text = '') => {
  return text.trim().split(/\s+/).filter(Boolean);
};

export const computePromptDiff = (parentText = '', childText = '') => {
  const wordsA = tokenizePrompt(parentText);
  const wordsB = tokenizePrompt(childText);

  const m = wordsA.length;
  const n = wordsB.length;

  if (m === 0 && n === 0) {
    return { tokens: [], addedCount: 0, removedCount: 0, unchangedCount: 0, similarity: 100 };
  }

  // DP table for LCS
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (wordsA[i - 1].toLowerCase() === wordsB[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to reconstruct the diff tokens
  let i = m;
  let j = n;
  const tokens = [];
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1].toLowerCase() === wordsB[j - 1].toLowerCase()) {
      tokens.unshift({ type: 'unchanged', text: wordsB[j - 1] });
      unchangedCount++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: 'added', text: wordsB[j - 1] });
      addedCount++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      tokens.unshift({ type: 'removed', text: wordsA[i - 1] });
      removedCount++;
      i--;
    }
  }

  const totalWords = Math.max(1, m + n);
  const similarity = Math.round((unchangedCount * 2 * 100) / totalWords);
  const mutationRate = Math.max(0, 100 - similarity);

  return {
    tokens,
    addedCount,
    removedCount,
    unchangedCount,
    similarity,
    mutationRate,
  };
};
