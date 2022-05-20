import { Container, inject } from "inversify";
import { makeFluentProvideDecorator } from "inversify-binding-decorators";

export var container = new Container();
const provide = makeFluentProvideDecorator(container);

export function Provide(symbol: any): any {
    return provide(symbol).done();
}

export function Inject(symbol: any): any {
    return inject(symbol);
}

export function ProvideAsSingleton(symbol: any): any {
    return provide(symbol).inSingletonScope().done();
}