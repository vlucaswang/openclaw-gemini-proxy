import pty from 'node-pty';

export class Proxy {
  constructor(options = {}) {
    this.command = options.command || 'gemini';
    this.args = options.args || [];
    this.env = options.env || process.env;
    this.cwd = options.cwd || process.cwd();
  }

  async run(additionalArgs = []) {
    const finalArgs = [...this.args, ...(Array.isArray(additionalArgs) ? additionalArgs : [additionalArgs])];
    return new Promise((resolve, reject) => {
      let output = '';
      const ptyProcess = pty.spawn(this.command, finalArgs, {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: this.cwd,
        env: this.env
      });

      ptyProcess.onData((data) => {
        output += data;
      });

      ptyProcess.onExit(({ exitCode, signal }) => {
        if (exitCode === 0) {
          resolve(output);
        } else {
          reject(new Error(`Process exited with code ${exitCode}, output: ${output}`));
        }
      });
    });
  }
}
