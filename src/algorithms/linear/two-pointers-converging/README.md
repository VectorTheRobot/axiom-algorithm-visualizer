# Two Pointers: Converging (Opposite-Ends)

## Description

The **Converging Two Pointers** technique initializes two indices at opposite ends of a linear sequence (`left = 0` and `right = n - 1`) and moves them inward toward each other until they meet (`left < right`).

Instead of using nested loops to inspect every possible pair `(i, j)` in $O(N^2)$ time, converging pointers exploit a **monotonic relationship** (most commonly a sorted array) to eliminate an entire row or column of the search space with every single step, reducing execution time to $O(N)$.

### When to Identify & Apply This Technique

- The input array is already sorted (or sorting it in $O(N \log N)$ does not break index requirements).
- You are searching for pairs, triplets (combined with an outer loop, e.g. _3Sum_), or boundaries that satisfy a target sum, product, or geometric optimization (e.g. _Container With Most Water_, _Trapping Rain Water_).
- You need to verify symmetry or perform an in-place reversal (e.g. _Valid Palindrome_).

---

## Core Components

1. **Boundary Initialization**
   - Set `left = 0` (minimum boundary) and `right = arr.length - 1` (maximum boundary).

2. **Convergence Condition**
   - Loop while `left < right` when evaluating distinct-element pairs.
   - Loop while `left <= right` when evaluating middle-element states such as palindromes.

3. **State Evaluation**
   - Compute the current candidate using `arr[left]` and `arr[right]`.

   ```java
   int sum = arr[left] + arr[right];
   ```

4. **Deterministic Pointer Advancement**
   - If the current state is **too small** (`sum < target`), increment `left++`.
   - If the current state is **too large** (`sum > target`), decrement `right--`.
   - If the current state **matches**, record the result and advance one or both pointers depending on the problem requirements.

### Canonical Java Template

```java
public int[] twoSumSorted(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;

    while (left < right) {

        // Use long if values may approach Integer.MAX_VALUE
        int sum = nums[left] + nums[right];

        if (sum == target) {
            return new int[] { left, right };
        } else if (sum < target) {
            left++;   // Need a larger value
        } else {
            right--;  // Need a smaller value
        }
    }

    return new int[] { -1, -1 };
}
```

---

## Java Collections & Standard Library Utilities

Converging two pointers requires **random $O(1)$ index access**, which determines which Java utilities are appropriate.

### 1. `Arrays.sort(int[] a)`

- Essential preprocessing step when the input is unsorted and original ordering is unimportant.
- Uses Dual-Pivot Quicksort for primitive arrays.
- Time: **$O(N \log N)$**
- Stack Space: **$O(\log N)$**

### 2. `ArrayList<E>` (`List` Interface)

- Supports:

```java
list.get(left);
list.get(right);
```

- Backed by a contiguous array.
- Provides **$O(1)$ random access**.

### 3. ⚠️ Anti-Pattern: `LinkedList`

Avoid:

```java
linkedList.get(i);
```

Each access requires traversal from the head or tail.

As a result, a pointer scan that should run in **$O(N)$** may degrade into **$O(N^2)$**.

### 4. `List.of(...)` and `Arrays.asList(...)`

Useful for constructing result pairs or triplets:

```java
List.of(a, b);
List.of(a, b, c);
```

Commonly used when returning:

```java
List<List<Integer>>
```

### 5. `String.toCharArray()` vs `String.charAt(i)`

Both provide **$O(1)$** access.

```java
char[] chars = s.toCharArray();
```

is generally preferred when performing in-place swaps during palindrome and reversal problems.

---

## Data Structures

### 1. Contiguous Arrays

```java
int[]
char[]
T[]
```

Primary structure enabling cache-friendly, bidirectional pointer movement in **$O(1)$** time.

### 2. Value-Index Tuples

```java
int[][] pairs;
```

where:

```java
pairs[i] = new int[] { value, originalIndex };
```

Useful when:

- The input is unsorted.
- Original indices must be returned after sorting.
- A `HashMap` solution is disallowed or undesirable due to memory constraints.

---

## Invariants & Edge-Case Handling

### Loop Invariant

At the start of every iteration:

```java
while (left < right)
```

No valid target pair can exist using:

- Any index `i < left`
- Any index `j > right`

Those regions have already been eliminated as either:

- **Strictly too small**, or
- **Strictly too large**

to satisfy the target condition.

---

## Critical Edge Cases

### 1. Self-Pairing Bug

If a problem requires **distinct elements** (e.g. _Two Sum II_):

✅ Correct

```java
left < right
```

❌ Incorrect

```java
left <= right
```

Otherwise both pointers may collide on the same element and incorrectly count it twice.

---

### 2. Duplicate Skipping (3Sum, 4Sum)

When returning unique value combinations, duplicate values can produce identical results.

Always guard duplicate-skipping loops:

```java
while (left < right && nums[left] == nums[left + 1]) {
    left++;
}

while (left < right && nums[right] == nums[right - 1]) {
    right--;
}
```

---

### 3. Integer Overflow

Potential issue:

```java
nums[left] + nums[right]
```

when values approach `Integer.MAX_VALUE`.

Safer alternatives:

```java
long sum = (long) nums[left] + nums[right];
```

or

```java
nums[left] > target - nums[right]
```

---

### 4. Empty or Single-Element Arrays

```java
nums.length < 2
```

causes:

```java
left < right
```

to immediately evaluate to `false`.

This safely bypasses the loop and prevents:

```java
IndexOutOfBoundsException
```

---

## Complexity

| Metric              | Sorted Input                                                                                    | Unsorted Input (Requires Sort)                                                                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Time Complexity** | **$O(N)$**. Each iteration moves either `left` or `right`. At most `N` pointer movements occur. | **$O(N \log N)$**. Dominated by sorting, followed by an **$O(N)$** pointer scan.                                                                                                                                       |
| **Auxiliary Space** | **$O(1)$**. Only the pointer variables are required.                                            | **$O(\log N)$ to $O(N)$**, depending on the sorting algorithm used. Primitive-array quicksort typically uses **$O(\log N)$** stack space, while object sorting (Timsort) may require up to **$O(N)$** auxiliary space. |
