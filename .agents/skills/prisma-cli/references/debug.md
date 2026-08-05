# prisma debug

Prints information helpful for debugging and bug reports.

## Command

```bash
prisma debug [options]
```

## What It Does

Outputs diagnostics about your Prisma environment, including:
- schema paths and resolved config files
- engine-cache directory and engine binary diagnostics
- environment variables relevant to the CLI and Prisma Client
- terminal/CI status and runtime availability checks
- version details derived from `prisma version`

## Options

| Option | Description |
|--------|-------------|
| `--schema` | Path to schema file |
| `--config` | Custom path to your Prisma config file |

## Example Output

```text
prisma               : 7.9.1
Engine Cache         : ...
Schema Path          : prisma/schema.prisma
Terminal Status      : interactive
CI Environment       : false
``` 

## When to Use

- **Troubleshooting**: Checking version mismatches
- **Reporting Issues**: Including environment info in GitHub issues
- **Verifying Installation**: Ensuring correct binaries are downloaded
