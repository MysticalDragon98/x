import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";

export default class GoogleSheetsFeature extends Feature<TypescriptProject> {

    name () { return "google-sheets"; }
    version () { return "1.0.0"; }

    async init () {
        await this.addInitializer(
            `import GoogleSheetsFeature from "./features/google-sheets";`,
            `GoogleSheetsFeature.init(),`
        );
    }
}