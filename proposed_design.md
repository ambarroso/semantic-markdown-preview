
# Proposed Tagging System

## 1. Primary Language (Format)
Always use the correct format name as the first word. This guarantees VS Code uses the correct grammar natively.
- `turtle`
- `n3`
- `trig`

## 2. Modifiers (View Mode)
Add a second word to tell the extension what to do.
- **(default)**: Syntax highlighting only.
- `preview`: Syntax highlighting + Graph.
- `graph`: Graph only (no code).

## Examples

### Just Code (Standard)
```turtle
:a :b :c .
```

### Code + Graph (Interactive)
```turtle preview
:a :b :c .
```

### Just Graph (Visual)
```turtle graph
:a :b :c .
```

