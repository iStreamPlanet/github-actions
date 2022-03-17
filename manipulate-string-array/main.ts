import {getInput, setFailed, setOutput} from "@actions/core";

(async function run() {
  try {
    const string_json = getInput("string_array", { required: true });
    const string_prefix = getInput("string_prefix", { required: false });
    const string_suffix = getInput("string_suffix", { required: false });
    const replace_json = getInput("string_replace_rules", { required: false });

    const string_array = JSON.parse(string_json)
    const replace_dict = JSON.parse(replace_json)
    let new_string_array = []

    if (!Array.isArray(string_array)) {
      // noinspection ExceptionCaughtLocallyJS
      throw new TypeError("string_array must be an array of strings")
    }

    console.log(`strings count: ${string_array.length}`)
    console.log(`string_prefix: ${string_prefix}`)
    console.log(`string_suffix: ${string_suffix}`)

    // Will loop over each string and
    // 1) Apply any regex replace rules
    // 2) add prefix and suffix
    string_array.forEach(string => {
      let new_string = string
      for (let [regex_string, replacement] of Object.entries(replace_dict)) {
        const regex = stringToRegex(regex_string)
        new_string = string.replace(regex, replacement)
        if (new_string !== string){
          break;
        }
      }
      new_string_array.push(`${string_prefix}${new_string}${string_suffix}`)
    });

    console.log(`new string count: ${new_string_array.length}`)
    setOutput("new_string_array", new_string_array);
  } catch (error) {
    setFailed(error.message);
  }
})();

function stringToRegex(string: string) {
  const flags = string.replace(/.*\/([gimy]*)$/, '$1');
  const pattern = string.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');
  return new RegExp(pattern, flags);
}
