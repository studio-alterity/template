#!/usr/bin/env node

import chalk from "chalk";
import Enquirer from "enquirer";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { spawn } from "child_process";
import NCP from "ncp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const copyFile = promisify(NCP.ncp);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

const enquirer = new Enquirer();

const createProject = async () => {
  try {
    const { projectName } = await enquirer.prompt({
      type: "input",
      name: "projectName",
      message: "🚀 Enter the project name:",
    });

    if (!projectName) {
      throw new Error("📁 Project name is required");
    }

    const lowercaseProjectName = projectName.toLowerCase();

    if (await exists(lowercaseProjectName)) {
      throw new Error("⚠️ Project directory already exists");
    }

    if (!/^[a-z0-9-]+$/.test(lowercaseProjectName)) {
      throw new Error(
        "⚠️ Project name can only contain lowercase letters, numbers, and hyphens"
      );
    }

    if (!/^[a-z]/.test(lowercaseProjectName)) {
      throw new Error("⚠️ Project name must start with a letter");
    }

    if (lowercaseProjectName !== projectName) {
      console.log(
        chalk.yellow(
          `✨ Project name "${projectName}" renamed to "${lowercaseProjectName}"`
        )
      );
    }

    const { type } = await enquirer.prompt({
      type: "select",
      name: "type",
      message: "🛠️  Select the project type:",
      choices: ["React"],
    });

    const projectPath = path.join(process.cwd(), lowercaseProjectName);

    await mkdir(projectPath);
    console.log(chalk.green("📂 Created project directory"));

    let templatePath;

    if (type === "React") {
      templatePath = path.join(__dirname, "../templates/react");
    } else {
      throw new Error("❓ Unknown project type");
    }

    const files = await fs.promises.readdir(templatePath);

    for (const file of files) {
      await copyFile(
        path.join(templatePath, file),
        path.join(projectPath, file)
      );
    }

    console.log(chalk.green("✂️ Copied template files"));

    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(await readFile(packageJsonPath));

    packageJson.name = lowercaseProjectName;

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(chalk.green("📦 Updated package.json"));

    const gitProcess = spawn("git", ["init"], {
      cwd: path.join(process.cwd(), lowercaseProjectName),
      stdio: "inherit",
    });

    await new Promise((resolve, reject) => {
      gitProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`git init exited with code ${code}`));
        } else {
          resolve();
        }
      });
    });

    console.log(chalk.green("🎉 Project created successfully"));

    console.log(chalk.blue("⏳ Installing dependencies..."));

    const installProcess = spawn("yarn", ["install"], {
      cwd: path.join(process.cwd(), lowercaseProjectName),
      stdio: "inherit",
    });

    await new Promise((resolve, reject) => {
      installProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`yarn install exited with code ${code}`));
        }
        resolve();
      });
    });

    console.log(chalk.green("Dependencies installed"));

    const { wantsToUpgrade } = await enquirer.prompt({
      type: "confirm",
      name: "wantsToUpgrade",
      message: "🔧 Do you want to upgrade the dependencies?",
    });

    if (wantsToUpgrade) {
      console.log(chalk.blue("⬆️ Upgrading dependencies..."));

      const upgradeProcess = spawn(
        "yarn",
        ["upgrade-interactive", "--latest"],
        {
          cwd: path.join(process.cwd(), lowercaseProjectName),
          stdio: "inherit",
        }
      );

      await new Promise((resolve, reject) => {
        upgradeProcess.on("close", (code) => {
          if (code !== 0) {
            reject(
              new Error(`yarn upgrade-interactive exited with code ${code}`)
            );
          } else {
            resolve();
          }
        });
      });
    }

    console.log(
      chalk.green("🚀 Project setup complete! Run the following commands:")
    );

    console.log(chalk.blue("cd", lowercaseProjectName));

    if (type === "React") {
      console.log(chalk.blue("yarn dev"));
    }
  } catch (error) {
    console.error(chalk.red(error));
    console.error(chalk.red("❌ Project creation failed"));
    process.exit(1);
  }
};

createProject();
