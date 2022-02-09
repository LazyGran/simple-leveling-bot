//all libraries needed for this bot. Change nothing here unless you know what you are doing!
const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const random = require('random');
const fs = require('fs');

const prefix = '.'; //change to your preffered prefix, default '.'
const client = new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const token = jsonfile.readFileSync('token.json')

if(!token) console.log("error") 
else       client.login(token)

client.once('ready', () =>
{
    console.log('started')  //tells you when the bot is started in the console
})

client.on('message', message =>
{
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(message.author.bot) return;              //checks if the bot sended the message
    if(message.channel.type === 'dm') return;   //checks if the message was a dm, all dms are gonna be ignored!

    //basic things needed for leveling
    var stats = {}; //the variable everything is stored it

    if(fs.existsSync('data.json'))  //checks if a data.json exist, if not it will create one
    {
        stats = jsonfile.readFileSync('data.json')
    }
    if(message.guild.id in stats === false)
    {
        stats[message.guild.id] = {};
    }

    const guildStats = stats[message.guild.id]

    if(message.author.id in guildStats === false) //checks if the user is in the "stats" variable, if not it will enter the user and give it the default values
    {
        guildStats[message.author.id] =
        {
            xp: 0,  //base xp a new user gets when sending his first message
            level: 0,   //base level a new user gets when sending his first message
            msgsend: 0  //the total amount of messages a member has sent
        }
    }
    
    const userStats = guildStats[message.author.id];

    //counting the total messages
    userStats.msgsend++

    //adding xp
    userStats.xp = userStats.xp + 1;
    userStats.last_message = Date.now();
    
    //adding a level 
    const xpreq = 25*userStats.level + 25
    if(userStats.xp >= xpreq)
    {
        userStats.xp = 0
        userStats.level++
        message.channel.send(`<@${message.author.id}>, you just leveled up! You are now level ${userStats.level}`)
    }
    //entering the "stats" variable in data.json to save it
    jsonfile.writeFileSync('data.json', stats);



    //level command, shows your your current level, xp, xp needed to level up and total messages send
    if(command === 'level')
    {
        const embed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
        .setDescription(
            `You're currently level ${userStats.level} \n
            You have ${userStats.xp}xp and need ${xpreq}xp to level up \n
            You've sent a total of ${userStats.msgsend} messages`)
        .setFooter('Made by Gran')
        
        message.channel.send(embed)
    }
    
    //ping command, shows you API & Bot latency as well as the userid of the bot owner, read readme to know more about that
    if(command === 'ping')
    {
        const botlatency = Date.now() - message.createdTimestamp    //the bots latency
        const apilatency = Math.round(client.ws.ping)   //the discord apis latency
        const embed = new Discord.MessageEmbed()
        .setColor('#a31a1a')
        .setAuthor('Latency')
        .setDescription(
            `Bot latency is ${botlatency}ms \n
             API latency is ${apilatency}ms \n`)
        .setFooter('Made by Gran')

        message.channel.send(embed)
    }
})

