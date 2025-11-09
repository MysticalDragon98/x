export class StringUtils {
    static pascalCase (text: string) {
        return text
            .replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
            .replace(/^[a-z]/, (c) => c.toUpperCase())
    }

    static snakeCase (text: string) {
        return text
            .replace(/([a-z])([A-Z])/g, '$1_$2') // handle camelCase
            .replace(/[\s\-]+/g, '_')           // replace spaces and dashes with _
            .replace(/[A-Z]{2,}(?=[A-Z][a-z])/g, (s) => s[0] + s.slice(1).toLowerCase()) // fix acronym splits
            .toLowerCase();
    }

    static upperSnakeCase (text: string) {
        return this.snakeCase(text).toUpperCase();
    }

    static camelCase (text: string) {
        return text
            .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
            .replace(/^[A-Z]/, (c) => c.toLowerCase())
    }
}