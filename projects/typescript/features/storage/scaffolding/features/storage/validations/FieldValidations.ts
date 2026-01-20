import { $assert, CustomErrors } from "@/features/errors";

const Errors = CustomErrors({
    ValueMustBeOfType: (type: string) => `The value must be of type ${type}`,
})

export class FieldValidations {

    static class (value: any, _class: any) {
        $assert(value instanceof _class, Errors.ValueMustBeOfType(_class.name));
    }
}