import { Client, GatewayIntentBits, SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { createLuckyWheelGif } from './lucky-wheel.js';
import fs from 'fs/promises';
import 'dotenv/config';
import express from "express"
const app = express();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});
var listener = app.listen(process.env.PORT || 2000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
app.listen(() => console.log("I'm Ready To Work..! 24H"));
app.get('/', (req, res) => {
  res.send(`
  <body>
  <center><h1>Bot 24H ON!</h1></center
  </body>`)
});
async function loadPrizes() {
    const data = await fs.readFile('./prizes.json', 'utf8');
    return JSON.parse(data);
}
function selectWinner(prizes) {
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.percentage, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < prizes.length; i++) {
        random -= prizes[i].percentage;
        if (random <= 0) {
            return i;
        }
    }
    return prizes.length - 1;
}

const wheelCommand = new SlashCommandBuilder()
    .setName('wheel')
    .setDescription('إنشاء عجلة حظ مع الجوائز')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('المستخدم الذي سيظهر في وسط العجلة')
            .setRequired(true)
    );

client.once('ready', async () => {
    console.log(`تم تسجيل الدخول كـ ${client.user.tag}`);
    
    try {
        await client.application.commands.create(wheelCommand);
        console.log('تم تسجيل الأمر بنجاح');
    } catch (error) {
        console.error('خطأ في تسجيل الأمر:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== 'wheel') return;

    await interaction.deferReply();

    try {
        const prizes = await loadPrizes();
        const user = interaction.options.getUser('user');
        
        // اختيار الفائز بناءً على النسب المئوية
        const selectedWinnerIndex = selectWinner(prizes);
        const winner = prizes[selectedWinnerIndex];
        
        // إنشاء GIF
        const gifBuffer = await createLuckyWheelGif(
            prizes,
            selectedWinnerIndex,
            user.displayAvatarURL({ extension: 'png', size: 256 })
        );

        const attachment = new AttachmentBuilder(gifBuffer, { name: 'lucky-wheel.gif' });

        const embed = new EmbedBuilder()
            .setColor(winner.color)
            .setTitle('🎉 نتيجة عجلة الحظ')
            .addFields(
                { name: 'الفائز', value: user.toString(), inline: true },
                { name: 'الجائزة', value: winner.value, inline: true },
                { name: 'نسبة الفوز', value: `${winner.percentage}%`, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({
            content: `🎊 مبروك! ${user.toString()} فاز بـ **${winner.value}**!`,
            embeds: [embed],
            files: [attachment]
        });

    } catch (error) {
        console.error('خطأ:', error);
        await interaction.editReply('حدث خطأ أثناء إنشاء عجلة الحظ. الرجاء المحاولة مرة أخرى.');
    }
});

client.login(process.env.DISCORD_TOKEN);
