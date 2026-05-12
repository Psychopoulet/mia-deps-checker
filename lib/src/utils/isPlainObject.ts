// module

export default function isPlainObject (value: unknown): boolean {

    if ("object" !== typeof value || null === value) {
        return false;
    }

    return Object.getPrototypeOf(value) === Object.getPrototypeOf({});

}
