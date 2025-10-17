
# Data Processor CLI

A command-line utility for processing data files in various formats.

## Installation

```sh
npm install -g data-processor
```

## Usage

```sh
A data processing utility (data-processor v1.0.0)
USAGE:
  data-processor <OPTIONS>

OPTIONS:
  -h, --help                     Display this help message
  -v, --version                  Display this version
  -i, --input <input>            Input file path
  -f, --format <format>          Output format (json, csv, xml)
  -o, --output <output>          Output file path

```

## Examples

### Convert a CSV file to JSON

```sh
data-processor --input data.csv --format json --output data.json
```

### Process a file and print to stdout

```sh
data-processor --input data.csv
```

## Advanced Usage

For more complex scenarios, you can:

1. Chain commands with pipes
2. Use glob patterns for batch processing
3. Configure processing with a config file

## API Reference

The CLI is built on top of the data-processor library, which you can also use programmatically.
  