#!/usr/bin/env bun

import ora from "ora";
import path from "path";
import prompts from "prompts";
import color from "picocolors";
import utils from "./utils";
import readline from "readline";
import { createTemplate } from "./templates/create";
import { existsSync, promises as fs } from "fs";

const templates: Record<string, { path: string; displayTitle: string }> = {
   Typescript: { path: "templates/Typescript", displayTitle: color.blueBright("Typescript") },
   Javascript: { path: "templates/Javascript", displayTitle: color.yellowBright("Javascript") },
};

async function waitForKeyPress() {
   console.log(color.gray("\nPress any key to exit..."));
   return new Promise<void>((resolve) => {
      const rl = readline.createInterface({
         input: process.stdin,
         output: process.stdout,
      });
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once("data", () => {
         rl.close();
         process.stdin.setRawMode(false);
         resolve();
      });
   });
}

async function installDependencies(targetPath: string) {
   const spinner = ora({ text: "Installing dependencies...", spinner: "sand", color: "magenta" }).start();
   try {
      const { stdout, stderr, exitCode } = Bun.spawn(["bun", "install"], { cwd: targetPath });
      if (stderr) throw new Error(stderr);
      const output = await Bun.readableStreamToText(stdout);
      spinner.succeed("Dependencies installed successfully!");
      await Bun.sleep(0)
      console.log(
         output
            .split("\n")
            .filter((line) => line.startsWith("\u001B[0m\u001B[32m+\u001B[0m"))
            .map((line) => `  ${line}`)
            .join("\n")
      );
   } catch (error) {
      spinner.fail("An error occurred during dependency installation.");
      await Bun.sleep(0)
      throw error;
   }
}

function clickablePath(filePath: string): string {
   return process.stdout.isTTY
      ? `\u001b]8;;${filePath}\u0007${filePath}\u001b]8;;\u0007`
      : filePath;
}

async function main() {
   console.clear()
   console.log(color.greenBright("Welcome to the MCPE-Script Project Creator!"));
   console.log(color.gray("============================================"));

   const versionsPromise = [utils.getVersions('@minecraft/server'), utils.getVersions('@minecraft/server-ui')];

   try {
      const { projectName } = await prompts({
         type: "text",
         name: "projectName",
         message: "Enter the project name:",
         validate: (value) =>
            value.trim()
               ? !existsSync(path.join(process.cwd(), value))
                  ? true
                  : `Directory \"${value}\" already exists!`
               : "Project name cannot be empty.",
      }, {
         onCancel: async () => {
            await Bun.sleep(0);
            throw new Error("Project creation canceled.")
         }
      }) as { projectName: string };
      await Bun.sleep(0);

      const { description } = await prompts({
         type: "text",
         name: "description",
         message: "Enter the project description:"
      }, {
         onCancel: async () => {
            await Bun.sleep(0);
            throw new Error("Project creation canceled.");
         }
      }) as { description: string };
      await Bun.sleep(0);

      const { selectedTemplate } = await prompts({
         type: "select",
         name: "selectedTemplate",
         message: "Choose a template:",
         choices: Object.keys(templates).map((key) => ({
            title: templates[key].displayTitle,
            value: key,
         })),
      }, {
         onCancel: async () => {
            await Bun.sleep(0);
            throw new Error("Project creation canceled.")
         }
      }) as { selectedTemplate: 'Typescript' | 'Javascript' };
      await Bun.sleep(0);

      const groupedVersions: Record<string, Record<string, string>> = {};

      (await Promise.all(versionsPromise)).forEach((versions, index) => {
         const key = index === 0 ? "@minecraft/server" : "@minecraft/server-ui";
         versions
            .filter((v) => v.endsWith("-stable"))
            .forEach((v) => {
               const { npm, mc } = utils.parseMinecraftVersions(v);
               if (!groupedVersions[mc]) groupedVersions[mc] = {};
               groupedVersions[mc][key] = v;
            });
      });

      const groupedVersionsKeys = Object.keys(groupedVersions);

      const { selectedMinecraftVersion } = await prompts({
         type: "select",
         name: "selectedMinecraftVersion",
         message: "Choose a Minecraft version:",
         choices: groupedVersionsKeys.map((mc, i) => ({
            title: i === 0 ? mc + color.reset(color.gray(' - (latest)')) : mc,
            value: mc,
         })),
      }, {
         onCancel: async () => {
            await Bun.sleep(0);
            throw new Error("Project creation canceled.")
         }
      }) as { selectedMinecraftVersion: string };
      await Bun.sleep(0);

      const targetPath = path.join(process.cwd(), projectName);
      const selectedVersions = groupedVersions[selectedMinecraftVersion] as {
         "@minecraft/server-ui": string;
         "@minecraft/server": string;
      };
      const minecraftVersion = selectedMinecraftVersion.split(".").map(Number) as [number, number, number];

      const minecraftModuleVersions = {
         "@minecraft/server": utils.parseMinecraftVersions(selectedVersions["@minecraft/server"]).npm + "-beta",
         "@minecraft/server-ui": utils.parseMinecraftVersions(selectedVersions["@minecraft/server-ui"]).npm + "-beta",
      };

      const startTimer = Date.now();


      const info: Info = {
         template: selectedTemplate,
         targetPath,
         minecraftNPMVersions: selectedVersions,
         name: projectName,
         description,
         minecraftVersion,
         minecraftModuleVersions,
      };
      try {
         await Promise.all([
            fs.mkdir(targetPath, { recursive: true }),
            createTemplate(info),
            installDependencies(targetPath),
         ]);
      } catch (error) {
         await fs.rmdir(targetPath, { recursive: true });
         throw error;
      }

      const endTimer = Date.now() - startTimer;

      console.log(
         color.greenBright(
            `\nProject \"${projectName}\" created successfully! ${color.gray(`[${endTimer >= 1000 ? (endTimer / 1000).toFixed(1) + 's' : endTimer + 'ms'}]`)}`
         )
      );
      console.log(color.cyanBright(`Location: "${color.white(clickablePath(targetPath))}"`));
   } catch (error) {
      console.error(`✖ ${error.message}`);
   }
   await waitForKeyPress();
}

main().catch(async (err) => {
   console.error("`✖ An unexpected error occurred:", err.message);
   await waitForKeyPress();
   process.exit(1);
});
