import "../src/x-select/index.js";

document.body.innerHTML = `
<x-select>
    <x-option value="0">sine</x-option>
    <x-option value="1">square</x-option>
    <x-option value="2">ramp-up</x-option>
    <x-option value="3">ramp-down</x-option>
</x-select>
`;
{
    /* <select>
    <option value="0">hello</option>
    <option value="">dog</option>
    <option value="cat">cat</option>
</select> */
}

document.body.addEventListener("input", (e) => {
    console.log(e.target.value);
});
