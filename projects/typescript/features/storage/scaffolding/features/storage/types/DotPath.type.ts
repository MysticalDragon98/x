export type DotPath<T> = {
    [K in keyof T & string]: T[K] extends object?
        K | `${K}.${DotPath<T[K]>}` : K
}[keyof T & string];