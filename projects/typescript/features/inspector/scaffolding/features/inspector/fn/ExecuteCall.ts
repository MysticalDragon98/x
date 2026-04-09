import { CustomErrors, $assert } from "@features/errors";

const Errors = CustomErrors({
    MethodRequired: () => `A method name is required when executing a class static method`,
    MethodNotFound: (className: string, method: string) => `Method "${method}" not found on class "${className}"`,
    KindNotExecutable: (kind: string) => `Kind "${kind}" is not executable — only "classes" and "fn" are allowed`,
    ExecutionFailed: (name: string, reason: string) => `Execution of "${name}" failed: ${reason}`,
    ExecutionTimeout: (name: string, ms: number) => `Execution of "${name}" timed out after ${ms}ms`,
});

const TIMEOUT_MS = 300_000;

export async function ExecuteCall(
    target: any,
    kind: string,
    name: string,
    method: string | undefined,
    args: unknown[],
): Promise<unknown> {
    $assert(kind === "classes" || kind === "fn", Errors.KindNotExecutable(kind));

    let call: Promise<unknown>;

    if (kind === "fn") {
        call = Promise.resolve(target(...args));
    } else {
        $assert(method, Errors.MethodRequired());
        const methodName = method as string;
        $assert(
            typeof target[methodName] === "function" && Object.hasOwn(target, methodName),
            Errors.MethodNotFound(name, methodName),
        );
        call = Promise.resolve(target[methodName](...args));
    }

    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(Errors.ExecutionTimeout(name, TIMEOUT_MS)), TIMEOUT_MS)
    );

    return Promise.race([call, timeout]);
}
