import { Atem, AtemConnectionStatus, AtemState } from "atem-connection";
import { AtemEvent } from "../types/enums";
import { AtemEventHandlers } from "../types/comm";

class AtemEventDispatcher {
    private atemConsole: Atem;
    private handlers: AtemEventHandlers;
    private interestingEvents: AtemEvent[];

    constructor(atemConsole: Atem, handlers: AtemEventHandlers) {
        this.atemConsole = atemConsole;

        this.registerHandlers(handlers);
    }

    private registerHandlers(handlers: AtemEventHandlers): void {
        handlers.connected?.forEach(handler => {
            this.atemConsole.on(AtemEvent.connected, () => {
                handlers.connected.forEach(handler => handler(this.atemConsole, AtemEvent.connected));
            });
        });

        handlers.stateChanged?.forEach(handler => {
            this.atemConsole.on(AtemEvent.stateChanged, (state: AtemState, paths: string[]) => {
                handlers.stateChanged.forEach(handler => handler(this.atemConsole, AtemEvent.stateChanged, state, paths));
            });
        });

        handlers.error?.forEach(handler => {
            this.atemConsole.on(AtemEvent.error, error => {
                handlers.error.forEach(handler => handler(this.atemConsole, AtemEvent.error, error));
            });
        });

        handlers.info?.forEach(handler => {
            this.atemConsole.on(AtemEvent.info, info => {
                handlers.info?.forEach(handler => handler(this.atemConsole, AtemEvent.info, info));
            });
        });
    }

    public addHandlers(newEffectHandlers: AtemEventHandlers) {
        this.registerHandlers(newEffectHandlers);
        if (this.atemConsole.status === AtemConnectionStatus.CONNECTED) {
            newEffectHandlers.connected.forEach(handler => handler(this.atemConsole, AtemEvent.connected));
        }
    }
}

export { AtemEventDispatcher };
