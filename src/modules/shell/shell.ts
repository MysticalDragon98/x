import { exec, spawnSync } from "child_process";

export class Shell {
  
    static exec (command: string, { cwd }: { cwd?: string } = {}) {
        return new Promise((resolve, reject) => {
            // Execute the command
            exec(command, { cwd }, (error, stdout, stderr) => {
              if (error) {
                reject(`Error executing command: ${error}`);
                return;
              }
        
              // Resolve the promise with the command's stdout
              resolve(stdout);
            });
        });
    }

    static shellName () {
      return process.env.SHELL_NAME || "default";
    }

    static isCliAvailable(cmd: string): boolean {
      const checker = process.platform === "win32" ? "where" : "which";
      const result = spawnSync(checker, [cmd], { stdio: "ignore" });
      return result.status === 0;
    }
}