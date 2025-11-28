import { Feature } from "@/src/modules/projects/feature";
import AgsProject from "../..";
import { StringUtils } from "@/src/modules/utils/string-utils";
import { TextFile } from "@/src/modules/files/text-file";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";
import ErrorsFeature from "../errors/errors.feature";

export default class EnvFeature extends Feature<AgsProject> {

    readonly #errors = this.inject(ErrorsFeature);

    name () { return "env"; }
    version () { return "1.0.0"; }

    async init () {}


    async addEnvvar (name: string, { required }: { required: boolean }) {
        const varname = StringUtils.pascalCase(name);
        const envName = StringUtils.upperSnakeCase(name);

        const envFile = new TextFile(this.project.workdirSubpath(".env"));
        await envFile.appendLine(`${envName}=`);

        const envLib = new TextFile(this.workdirFeatureSubpath("index.ts"));
        await envLib.insertTagLine("Variables", `${varname}: GLib.getenv("${envName}")${required ? "!" : ""},`);

        if (required) {
            await envLib.insertTagLine("Validations", `$assert(Environment.${varname}, Errors.EnvironmentVariableNotFound('${name}'));`);
            await vscodeOpen(envFile.path);
        }
    }
}