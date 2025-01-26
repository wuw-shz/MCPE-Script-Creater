#!/usr/bin/env bun

import ora from "ora";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function isBunInstalled(): Promise<boolean> {
   try {
      await execAsync('bun -v');
      return true;
   } catch {
      return false;
   }
}

async function installBun(): Promise<void> {
   console.clear();
   const spinner = ora({ text: "Installing Bun... 🚀", spinner: "sand", color: "magenta" });
   try {
      spinner.start();
      await execAsync("npm install -g bun");
      spinner.succeed("Bun installed successfully.");
   } catch (error: any) {
      spinner.fail("Failed to install Bun: " + error.message);
      throw new Error("Bun installation failed.");
   }
   await Bun.sleep(0)
}

(async () => {
   try {
      if (!await isBunInstalled()) {
         await installBun();
      }
      await import('./main')
   } catch (error: any) {
      console.error(`✖ ${error.message}`);
      process.exit(1);
   }
})();
