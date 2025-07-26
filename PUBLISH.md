# Publishing Guide

### Step 1: Version the Package

```bash
# For patch releases (bug fixes)
npm version patch

# For minor releases (new features)
npm version minor

# For major releases (breaking changes)
npm version major

# Or set version manually
npm version 1.0.0
```

### Step 2: Review Package Contents

```bash
# See what files will be published
npm pack --dry-run

# Create a test package (optional)
npm pack
```

The package should include:

- ✅ `dist/` directory with built files
- ✅ `package.json`
- ✅ `README.md`
- ❌ `src/` directory (excluded)
- ❌ `examples/` directory (excluded)
- ❌ Test files (excluded)

### Step 3: Publish to npm

```bash
# Login to npm (if not already logged in)
npm login

# Publish the package
npm publish

# For scoped packages or first-time publishing
npm publish --access public
```
