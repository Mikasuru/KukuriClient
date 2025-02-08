import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';
import Logger from '../../modules/Logger';

const command: Command = {
    name: 'role',
    description: 'Manage server roles',
    category: 'Moderation',
    aliases: ['roles', 'rolemanage'],
    cooldown: 5,
    usage: '.role <add/remove/create/delete/info> [@user] [@role]\nExample: .role add @user @role',
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        try {
            if (!message.guild) {
                await message.reply('```❌ This command can only be used in a server```');
                return;
            }

            if (!args[0]) {
                await message.reply(
                    '```Usage:\n' +
                    '.role add @user @role - Add role to user\n' +
                    '.role remove @user @role - Remove role from user\n' +
                    '.role create [name] [color] - Create new role\n' +
                    '.role delete @role - Delete role\n' +
                    '.role info @role - Show role information```'
                );
                return;
            }

            const action = args[0].toLowerCase();

            switch (action) {
                case 'add': {
                    const targetUser = message.mentions.members?.first();
                    const role = message.mentions.roles.first();

                    if (!targetUser || !role) {
                        await message.reply('```❌ Please mention both a user and a role```');
                        return;
                    }

                    if (targetUser.roles.cache.has(role.id)) {
                        await message.reply('```❌ User already has this role```');
                        return;
                    }

                    await targetUser.roles.add(role);
                    await message.reply(`\`\`\`✅ Added role ${role.name} to ${targetUser.user.username}\`\`\``);
                    break;
                }

                case 'remove': {
                    const targetUser = message.mentions.members?.first();
                    const role = message.mentions.roles.first();

                    if (!targetUser || !role) {
                        await message.reply('```❌ Please mention both a user and a role```');
                        return;
                    }

                    if (!targetUser.roles.cache.has(role.id)) {
                        await message.reply('```❌ User does not have this role```');
                        return;
                    }

                    await targetUser.roles.remove(role);
                    await message.reply(`\`\`\`✅ Removed role ${role.name} from ${targetUser.user.username}\`\`\``);
                    break;
                }

                case 'create': {
                    if (args.length < 2) {
                        await message.reply('```❌ Please provide a role name```');
                        return;
                    }

                    const name = args[1];
                    const color = args[2] || 'DEFAULT';

                    const newRole = await message.guild.roles.create({
                        name: name,
                        reason: `Created by ${message.author.tag}`
                    });

                    await message.reply(`\`\`\`✅ Created new role: ${newRole.name}\`\`\``);
                    break;
                }

                case 'delete': {
                    const role = message.mentions.roles.first();

                    if (!role) {
                        await message.reply('```❌ Please mention a role to delete```');
                        return;
                    }

                    const roleName = role.name;
                    await role.delete();
                    await message.reply(`\`\`\`✅ Deleted role: ${roleName}\`\`\``);
                    break;
                }

                case 'info': {
                    const role = message.mentions.roles.first();

                    if (!role) {
                        await message.reply('```❌ Please mention a role```');
                        return;
                    }

                    const infoEmbed = new WebEmbed()
                        .setColor(role.color || 'BLUE')
                        .setTitle(`Role Information: ${role.name}`)
                        .setDescription([
                            `ID: ${role.id}`,
                            `Color: ${role.hexColor}`,
                            `Created: ${role.createdAt.toLocaleDateString()}`,
                            `Position: ${role.position}`,
                            `Members: ${role.members.size}`,
                            `Hoisted: ${role.hoist ? 'Yes' : 'No'}`,
                            `Mentionable: ${role.mentionable ? 'Yes' : 'No'}`,
                            `Permissions: ${role.permissions.toArray().join(', ') || 'None'}`
                        ].join('\n'));

                    await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${infoEmbed}` });
                    break;
                }

                default: {
                    await message.reply('```❌ Invalid action. Use .role for help```');
                }
            }

        } catch (error) {
            Logger.error(`Error in role command: ${(error as Error).message}`);
            await message.reply('```❌ An error occurred while managing roles```');
        }
    }
};

export default command;