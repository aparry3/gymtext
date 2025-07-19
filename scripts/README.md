# GymText Test Scripts

## test-mesocycle

A comprehensive script for testing fitness program creation and mesocycle breakdown functionality.

### Usage

```bash
pnpm test:mesocycle -p <phone> [options]
```

### Options

- `-p, --phone <phone>` - Phone number of the user (required)
- `-c, --create` - Create a new fitness program
- `-b, --breakdown` - Breakdown mesocycles into detailed workouts
- `-m, --mesocycle <index>` - Specific mesocycle index to breakdown (0-based)
- `-d, --date <date>` - Start date in YYYY-MM-DD format
- `-u, --url <url>` - API endpoint URL (default: http://localhost:3000/api/agent)
- `-v, --verbose` - Show verbose output

### Examples

#### 1. Create a new fitness program
```bash
pnpm test:mesocycle -p +1234567890 --create
```

#### 2. Breakdown mesocycles (uses last created program)
```bash
pnpm test:mesocycle -p +1234567890 --breakdown
```

#### 3. Create and breakdown in one command
```bash
pnpm test:mesocycle -p +1234567890 --create --breakdown
```

#### 4. Breakdown specific mesocycle with custom start date
```bash
pnpm test:mesocycle -p +1234567890 --breakdown --mesocycle 0 --date 2025-01-22
```

#### 5. Test transition microcycle (non-Monday start)
```bash
# Starting on Wednesday - will create 5-day transition
pnpm test:mesocycle -p +1234567890 --create --breakdown --date 2025-01-22 -v
```

#### 6. Test different start days
```bash
# Monday start (no transition)
pnpm test:mesocycle -p +1234567890 --breakdown --date 2025-01-20

# Friday start (3-day transition)
pnpm test:mesocycle -p +1234567890 --breakdown --date 2025-01-24

# Sunday start (1-day transition)
pnpm test:mesocycle -p +1234567890 --breakdown --date 2025-01-26
```

### Features

- **Transition Microcycle Support**: Automatically detects non-Monday start dates and creates appropriate transition periods
- **Selective Breakdown**: Can breakdown specific mesocycles by index
- **Verbose Mode**: Shows full program JSON for debugging
- **Progress Tracking**: Displays workout counts and types for each generated microcycle

### Notes

- The script stores the last created program in memory, so you can run `--breakdown` after `--create` without specifying the program
- Transition microcycles are marked with `weekNumber: 0` and contain fewer than 7 days
- Make sure the user is registered in the system before running these commands