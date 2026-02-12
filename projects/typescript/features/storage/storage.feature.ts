import { Feature } from "@/src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import ErrorsFeature from "../errors/errors.feature";
import UtilsFeature from "../utils/utils.feature";

export default class StorageFeature extends Feature<TypescriptProject> {
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly errors = this.inject<ErrorsFeature>(ErrorsFeature);
    readonly utils = this.inject<UtilsFeature>(UtilsFeature);
    
    name () { return "storage"; }
    version () { return "0.1.1"; }

    async init () {}
    
}
