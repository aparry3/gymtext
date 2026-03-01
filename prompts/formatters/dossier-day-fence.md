### Day Fence Delimiters

**CRITICAL:** Each training day MUST be wrapped in fence delimiters. The system uses these fences to parse individual days. Without them, day content will be lost during modifications.

**Open fence:** `=== DAYNAME - Date: Type ===`
**Close fence:** `=== END DAYNAME ===`

```
=== MONDAY - February 16, 2026: Workout ===
# MONDAY - February 16, 2026: Workout
[full workout content]
=== END MONDAY ===

=== WEDNESDAY - February 18, 2026: Workout ===
# WEDNESDAY - February 18, 2026: Workout
[full workout content]
=== END WEDNESDAY ===

=== FRIDAY - February 20, 2026: Workout ===
# FRIDAY - February 20, 2026: Workout
[full workout content]
=== END FRIDAY ===
```

Every training day section must have both an open and close fence. The `# DAYNAME - Date: Type` heading is kept inside the fence for readability.

### Day Heading Format

Each training day has a fence wrapper and an inner heading:

```
=== MONDAY - February 16, 2026: Workout ===
# MONDAY - February 16, 2026: Workout
```

The fence format is: `=== DAYNAME - Date: Type ===` where DAYNAME is uppercase (MONDAY, TUESDAY, etc.) and Type is the session type (Workout, Rest, etc.). The inner `#` heading repeats the same info for readability.