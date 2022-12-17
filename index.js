import { Client, EmbedBuilder } from "discord.js";
import prompts from "prompts";
import * as dotenv from "dotenv";
import chalk from "chalk";
import fetch from "node-fetch";
import ora from "ora";
dotenv.config();

console.log(chalk.bold.green("Discord Active Developer Badge"));
console.log(chalk.bold(chalk.red("Remember to do not share your Discord Bot token with anyone!\n")));

console.log(chalk.bold("This tool will help you to get the " + chalk.cyan.underline("Discord Active Developer Badge")));
console.log(chalk.bold("If you have any problem, please contact me on Discord: " + chalk.cyan.underline("Majonez.exe#2495\n")));

export async function checkToken(value) {
 const res = await fetch("https://discord.com/api/v10/users/@me", {
  method: "GET",
  headers: {
   Authorization: `Bot ${value.toString()}`,
  },
 });
 return res.status !== 200 ? false : true;
}

const community = await prompts({
 type: "select",
 name: "value",
 message: "You created new Discord Server and enabled Community in Server Settings?",
 choices: [
  { title: "Yes", value: true },
  { title: "No", value: false },
 ],
});

if (!community.value) {
 console.log(chalk.bold.red("✖ You need to create new Discord Server and enable Community in Server Settings!"));
 process.exit(0);
}

const token = await prompts({
 type: "password",
 name: "token",
 message: "Enter your Discord Bot token",
 validate: (value) => {
  return checkToken(value);
 },
});

console.log();
const spinner = ora(chalk.bold("Running Discord Bot")).start();

const client = new Client({
 intents: [],
});

try {
 client.login(token.token);
} catch (e) {
 console.log(e);
}

const slashSpinner = ora(chalk.bold("Creating slash command interaction..."));
client.on("ready", async (client) => {
 spinner.succeed(chalk.bold(`Logged in as ${chalk.cyan.underline(client.user.tag)}!`));
 console.log(chalk.bold.green("✔") + chalk.bold(" Use this link to add your bot to your server: " + chalk.cyan.italic.underline(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot\n`)));
 slashSpinner.start();
 await client.application?.commands.set([
  {
   name: "active",
   description: "Get the Discord Active Developer Badge",
  },
 ]);

 slashSpinner.text = chalk.bold("Go to your Discord Server (where you added your bot) and use the slash command " + chalk.cyan.bold("/active"));
 slashSpinner.start();
});

client.on("interactionCreate", async (interaction) => {
 if (!interaction.isCommand()) return;

 if (interaction.commandName === "active") {
  // create embed
  const embed = new EmbedBuilder().setAuthor({ name: "Discord Active Developer Badge", iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless" }).setTitle("You have successfully ran the slash command!").setColor("#34DB98").setDescription("- Go to *https://discord.com/developers/active-developer* and claim your badge\n - Verification can take up to 24 hours, so wait patiently until you get your badge").setFooter({ text: "Made by Majonez.exe#2495", iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless" });

  slashSpinner.succeed(chalk.bold("You have successfully ran the slash command! Follow the instructions in Discord Message that you received!"));
  await interaction.reply({ embeds: [embed], ephemeral: true });
 }
});
