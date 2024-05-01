/**
 * @this {HTMLElement}
 * @param {HTMLMouseEvent} e
 */
function clickOutside(e) {
    if (!this.contains(e.target)) {
        this.dispatchEvent(new CustomEvent("click-outside"));
    }
}

const customSelectTemplate = document.createElement("template");
customSelectTemplate.innerHTML = `
<style>
    :host{
        display: block;
        box-sizing: border-box;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;

        max-width: max-content;

    }
    :host([open]) #list{
        opacity: 1;
        pointer-events: unset;
    }
    #selected{
        border: 1px currentColor solid;
        padding: 4px;
    }
    #list{
        padding: 4px;
        margin-top: 4px;

        background-color: #fff;
        position: absolute;

        opacity: 0;
        pointer-events: none;
        display:flex;
        flex-direction: column;
        gap: 4px;
        border: 1px currentColor solid;
    } 
    ::slotted([selected]){
        border-bottom: 1px currentColor solid;
    }
</style>
<div id="selected"></div>
<div id="list">
    <slot></slot>
</div>
`;

export class CustomSelectElement extends HTMLElement {
    #value = "";

    #clickOutsideController = new AbortController();

    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        this.shadowRoot.append(customSelectTemplate.content.cloneNode(true));

        this.#attachListeners();

        this.value = this.getAttribute("value");
    }

    #attachListeners() {
        this.addEventListener("select", this.#selectHandler.bind(this));
        this.shadowRoot
            .getElementById("selected")
            .addEventListener("click", (e) => {
                this.open();
            });

        this.shadowRoot.addEventListener("slotchange", (e) => {
            let options = [...this.querySelectorAll("x-option")];

            let minLength = options.reduce((prev, curr) => {
                return Math.max(prev, curr.textContent.length);
            }, 0);

            this.shadowRoot.getElementById(
                "selected"
            ).style.minWidth = `${minLength}ch`;

            let noSelected = options.every(
                (option) => !option.hasAttribute("selected")
            );

            if (noSelected) {
                this.querySelector("x-option").select(true);
            }
        });

        this.addEventListener("click-outside", (e) => {
            this.open(false);
        });
    }

    /**@param {boolean} [force] */
    open(force) {
        this.toggleAttribute("open", force);
        if (this.hasAttribute("open")) {
            this.#attachClickOutside();
        } else {
            this.#attachClickOutside(true);
        }
    }

    /**@param {SelectEvent} e*/
    #selectHandler(e) {
        if (!(e.target instanceof CustomOptionElement)) return;
        e.stopPropagation();

        this.shadowRoot.querySelector("x-option")?.remove();

        /**@type {CustomOptionElement} */ //@ts-ignore
        let optionClone = e.target.cloneNode(true);
        e.target.toggleAttribute("selected", true);

        this.querySelectorAll("x-option").forEach((option) => {
            if (option != e.target) {
                option.removeAttribute("selected");
            }
        });

        this.shadowRoot.getElementById("selected").textContent = "";
        this.shadowRoot.getElementById("selected").append(optionClone);

        this.#value = optionClone.value;

        this.open(false);

        if (!e.silent) {
            this.dispatchEvent(new InputEvent("input", { bubbles: true }));
        }
    }

    get value() {
        return this.#value;
    }
    set value(value) {
        this.querySelectorAll("x-option").forEach((option, i) => {
            if (option.value == value) {
                option.dispatchEvent(new SelectEvent());
            }
        });
    }

    #attachClickOutside(remove = false) {
        this.#clickOutsideController.abort();
        if (!remove) {
            this.#clickOutsideController = new AbortController();

            window.addEventListener("click", clickOutside.bind(this), {
                signal: this.#clickOutsideController.signal,
            });
        }
    }
    connectedCallback() {}

    disconnectedCallback() {
        this.#clickOutsideController.abort();
    }
}

export class SelectEvent extends CustomEvent {
    #silent = false;

    /**
     * @param {boolean} [silent]
     */
    constructor(silent) {
        super("select", { bubbles: true });
        this.#silent = silent;
    }

    get silent() {
        return this.#silent;
    }

    get detail() {
        return super.detail;
    }

    /**@type {HTMLElement} */
    get target() {
        return super.target;
    }
}

const customOptionTemplate = document.createElement("template");
customOptionTemplate.innerHTML = `
<style>
    :host{
        display: block;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        width: 100%;
    }
</style>
<slot></slot>
`;

export class CustomOptionElement extends HTMLElement {
    #value = "";
    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        this.shadowRoot.append(customOptionTemplate.content.cloneNode(true));

        this.#attachListeners();

        let valueAttr = this.getAttribute("value");

        this.#value = valueAttr || this.textContent;

        if (this.hasAttribute("selected")) {
            this.select();
        }
    }

    #attachListeners() {
        this.addEventListener("click", this.#clickHandler.bind(this));
    }

    /**@param {MouseEvent} e */
    #clickHandler(e) {
        if (this.hasAttribute("selected")) return;
        this.select();
    }

    /**@param {SelectEvent['silent']} [silent] */
    select(silent) {
        this.dispatchEvent(new SelectEvent(silent));
    }

    get value() {
        return this.#value;
    }

    connectedCallback() {}
    disconnectedCallback() {}
}
