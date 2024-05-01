import { CustomOptionElement, CustomSelectElement } from "./x-select/x-select";

declare global {
    interface HTMLElementTagNameMap {
        "x-select": CustomSelectElement;
        "x-option": CustomOptionElement;
    }
    interface HTMLMouseEvent extends MouseEvent{
        target: HTMLElement;
    }
}
