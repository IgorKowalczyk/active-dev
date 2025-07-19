import chalk from "chalk";
import { Client, EmbedBuilder, IntentsBitField, MessageFlags, Events } from "discord.js";
import fetch from "node-fetch";
import ora from "ora";
import prompts from "prompts";

console.log(chalk.bold.green("Discord Active Developer Badge"));
console.log(chalk.bold(chalk.red("Remember to do not share your Discord Bot token with anyone!\n")));

console.log(chalk.bold("This tool will help you to get the " + chalk.cyan.underline("Discord Active Developer Badge")));
console.log(chalk.bold("If you have any problem, please contact me on Discord: " + chalk.cyan.underline("majonez.exe") + "\n"));

export async function checkToken(value: string): Promise<boolean> {
 if (!value) return false;

 const res = await fetch("https://discord.com/api/v10/users/@me", {
  method: "GET",
  headers: {
   Authorization: `Bot ${value.toString()}`,
  },
 });
 return res.status !== 200 ? false : true;
}

const community = await prompts({
 type: "confirm",
 name: "value",
 message: "You created new Discord Server and enabled Community in Server Settings?",
 initial: true,
});

if (!community.value) {
 console.log(chalk.bold.red("✖ You need to create new Discord Server and enable Community in Server Settings!"));
 /* eslint-disable-next-line node/no-process-exit */
 process.exit(0);
}

const tokenPrompt = await prompts({
 type: "password",
 name: "token",
 message: "Enter your Discord Bot token (you can paste it by pressing Ctrl + Shift + V):",

 validate: async (value: string) => {
  const valid = await checkToken(value);
  return valid ? true : "Invalid Discord Bot token!";
 },
});

const valid = await checkToken(tokenPrompt.token);

if (!valid) {
 console.log(chalk.bold.red("✖ Invalid Discord Bot token!"));
 /* eslint-disable-next-line node/no-process-exit */
 process.exit(0);
}

console.log();
const spinner = ora(chalk.bold("Running Discord Bot")).start();

const client = new Client({
 intents: [IntentsBitField.Flags.Guilds],
});

try {
 client.login(tokenPrompt.token);
} catch (_e) {
 spinner.fail(chalk.bold("Error while logging in to Discord! GG, You broke Discord!"));
 /* eslint-disable-next-line node/no-process-exit */
 process.exit(0);
}

const slashSpinner = ora(chalk.bold("Creating slash command interaction..."));

client.on("ready", async (client) => {
 spinner.succeed(chalk.bold(`Logged in as ${chalk.cyan.underline(client.user.tag)}!`));
 console.log(
  chalk.bold.green("✔") +
   chalk.bold(
    " Use this link to add your bot to your server: " +
     chalk.cyan.italic.underline(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot\n`)
   )
 );
 await client.application?.commands.set([
  {
   name: "active",
   description: "Get the Discord Active Developer Badge",
  },
 ]);

 slashSpinner.text = chalk.bold("Go to your Discord Server (where you added your bot) and use the slash command " + chalk.cyan.bold("/active"));
 slashSpinner.start();
});

client.on(Events.InteractionCreate, async (interaction) => {
 try {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "active") {
   console.log(chalk.bold.green("Slash command interaction received!"));
   const embed = new EmbedBuilder() // prettier
    .setAuthor({
     name: "Discord Active Developer Badge",
     iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
    })
    .setTitle("You have successfully ran the slash command!")
    .setColor("#34DB98")
    .setDescription(
     "- Go to *https://discord.com/developers/active-developer* and claim your badge\n - Verification can take up to 24 hours, so wait patiently until you get your badge"
    )
    .setFooter({
     text: "Made by @majonez.exe",
     iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
    });
   slashSpinner.succeed(
    chalk.bold(
     "You have successfully ran the slash command! Follow the instructions in Discord Message that you received!. Now you can close this application by pressing Ctrl + C"
    )
   );

   await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
 } catch {
  slashSpinner.fail(
   chalk.bold.red("Error while creating slash command interaction! This can sometimes happen, but don't worry - just kick your bot from the server and run this application again!")
  );
  /* eslint-disable-next-line node/no-process-exit */
  process.exit(0);
 }
});
