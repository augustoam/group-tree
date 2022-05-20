import "reflect-metadata";
import { container } from "./context/IocProvider";
import { Application } from "./context/Application";

container.get<Application>(Application).bootstrap();
