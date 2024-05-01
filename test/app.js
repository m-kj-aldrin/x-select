import "../src/index.js";

document.body.innerHTML = `
<x-select>
    <x-option value="0">hello</x-option>
    <x-option value="">dog</x-option>
    <x-option value="cat">cat</x-option>
</x-select>
`;
{/* <select>
    <option value="0">hello</option>
    <option value="">dog</option>
    <option value="cat">cat</option>
</select> */}

document.body.addEventListener("input", (e) => {
    console.log(e.target.value);
});
