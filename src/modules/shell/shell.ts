import { exec } from "child_process";

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
    
}