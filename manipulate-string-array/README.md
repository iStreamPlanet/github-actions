# manipulate-string-array javascript action

This action gives one the ability to perform basic string manipulations across all strings in an array 

## Inputs

### `string_array`

**Required** The initial array of strings

### `string_prefix`

**Optional** String to apply as the prefix for every string in the array

### `string_replace_rules`

**Optional** JSON encoded list of regex that will be applied for replacing characters in the new string array. \
The key is the regex, and value is the replacement. The algorithm stops checking rules after the first match.

### `string_suffix`

**Optional** String to apply as the suffix for every string in the array

## Outputs

### `new_string_array`

A JSON-encoded array containing the modified strings

## Example usage

```yaml
  - uses: iStreamPlanet/github-actions/manipulate-string-array@main
    with:
      string_replace_rules: '{"/hello\s+world/gi": "Hi!"}'
      string_array: '["Hello World", "hELlo    WORLD"]'
      string_suffix: ' Lets go!'
```

# Development

To build the action for distribution run `npm run build` before committing your changes.
