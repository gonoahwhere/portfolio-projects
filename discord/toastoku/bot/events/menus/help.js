const { ActionRowBuilder, StringSelectMenuBuilder, ContainerBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");
const { MessageFlags } = require('discord-api-types/v10');

module.exports = async function handleHelpMenu(interaction) {
    if (interaction.customId !== 'toastoku_help_menu') return;
    if (interaction.user.id !== interaction.message.interaction?.user.id) {
        return interaction.reply({ content: "Only the original user can interact with this menu.", flags: MessageFlags.Ephemeral });
    }

    const selectMenuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('toastoku_help_menu')
            .setPlaceholder('Select a category...')
            .addOptions([
                { label: '🎮 Modes', value: 'modes_menu' },
                { label: '🎨 Themes', value: 'themes_menu' },
                { label: '✏️ Notes', value: 'notes_menu' },
                { label: '💡 Smart Hints', value: 'hints_menu' },
                { label: '🏆 Daily / Community Goals', value: 'goals_menu' },
                { label: '📅 Weekly Quests', value: 'quests_menu' },
                { label: '💰 Economy', value: 'economy_menu' },
                { label: '🏅 Leaderboards', value: 'leaderboards_menu' },
                { label: '⭐ Vote Rewards', value: 'vote_menu' },
                { label: '👤 Profiles', value: 'profiles_menu' },
                { label: '📊 Stats', value: 'stats_menu' },
                { label: '📖 Instructions', value: 'instructions_menu' },
                { label: '🎁 Bonuses', value: 'bonuses_menu' },
                { label: '💻 Dashboard', value: 'dashboard_menu' },
                { label: '⚙️ Commands', value: 'commands_menu' },
            ])
    );

    let container;

    switch (interaction.values[0]) {
        case 'modes_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 🎮 Modes`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Choose The Mode**
                  -# **Singleplayer**
                    -# ∘ Play at your own pace without any pressure.
                    -# ∘ Only you can interact with your game's buttons.
                    -# ∘ Pressing **End Game** will terminate the session and delete the game entirely.
                    
                  -# **Multiplayer**
                    -# ∘ Play cooperatively with other players (up to 4 per game).
                    -# ∘ Only players in the game can interact with the buttons.
                    -# ∘ On your turn, you can fill numbers or use game actions; others cannot interact until your turn ends.
                    -# ∘ Press **End Turn** to complete your move and pass control to the next player.
                    -# ∘ Game updates to show who is in the game, the current player and who is next to play.
                    -# ∘ The **Leave Game** button allows a player to exit. Players **cannot** rejoin once they leave; a new game must be created to play again.
                    -# ∘ If only 1 player remains, it turns into an **End Game** button, deleting the game entirely.

                  **Tips & Tricks**
                  -# ∘ Unfinished games **cannot** be continued once deleted. 
                  -# ∘ If you want to finish it later, leave the game running instead of ending it.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'themes_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 🎨 Themes`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                    **Appearance Options**
                    -# **General Info**
                    -# ∘ Themes change the look of your Sudoku board, from classic numbers to fun emojis.
                    -# ∘ Every player starts with 6 free themes ready to use.
                    -# ∘ Available hint phrases can vary depending on what the server administrators set.

                    -# **Free Themes**
                    -# ∘ Default Numbers — the classic style for easy readability.
                    -# ∘ Toast — playful icons based on the bot’s mascot.
                    -# ∘ Colourblind Toast — numbered version of the Toast theme for accessibility.
                    -# ∘ Animal Emojis — cats, dogs, and more.
                    -# ∘ Face Emojis — expressive characters for each number.
                    -# ∘ Transport Emojis — cars, buses, and other vehicles.

                    -# **Custom Themes**
                    -# ∘ Unlock more themes through the Dashboard.
                    -# ∘ They can be bought with Toast currency or real money.
                    -# ∘ Includes seasonal sets, special designs, and community-made collections.
                    -# ∘ New options rotate in regularly, and many can be previewed before purchase.

                    **Tips & Tricks**
                    -# ∘ Pick and choose themes every time you create a game to keep puzzles fresh.
                    -# ∘ High-contrast or emoji sets can make puzzles easier to read.
                    -# ∘ Collecting themes adds personality to multiplayer games.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'notes_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### ✏️ Notes`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Using Pencil Mode**
                  -# **Enabling Notes**
                    -# ∘ Activate pencil mode by pressing the **Pencil Mode** button while inside a cell.
                    -# ∘ The button turns **green** to show that notes are enabled.
                    -# ∘ While enabled, pressing numbers **1-9** adds them as notes to the selected cell instead of filling it.
                    -# ∘ You remain in the selected cell while adding notes, allowing multiple numbers to be added quickly.

                  -# **Disabling Notes**
                    -# ∘ Press the pencil mode button again to disable notes.
                    -# ∘ Notes mode also automatically disables if you leave the cell using the **Back to Cell** button.
                    -# ∘ Once disabled, pressing numbers **fills the cell** as usual.

                  -# **Automatic Note Updates**
                    -# ∘ If you insert a number into a cell, any conflicting notes in the **same row, column, or 3x3 grid** are automatically removed.
                    -# ∘ Example: If a cell has notes **2, 3, 4** and you enter **4** in another cell in the same row, column, or grid, the **4** is removed from the notes in that cell.
                    -# ∘ This ensures your notes stay accurate and up to date while solving the puzzle.

                  **Tips & Tricks**
                  -# ∘ Pencil mode is great for tracking possibilities without committing to a number.
                  -# ∘ Use it strategically to avoid mistakes and make solving complex puzzles easier.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'hints_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 💡 Smart Hints`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Requesting Hints**
                  -# **General Info**
                    -# ∘ Use hints by running the **/hint** command. Only works if the server administrators toggle it on.
                    -# ∘ Hints automatically fill a correct number in the puzzle to help you progress.
                    -# ∘ Server administrators can toggle this feature on or off whenever they want!

                  -# **How Hints Work**
                    -# ∘ If you select a specific cell, that cell is filled with the correct number.
                    -# ∘ You are returned to the cell selection screen, and the filled number counts as a **prefilled spot**.
                    -# ∘ Numbers provided by hints are greyed out and cannot be changed.
                    -# ∘ If no specific cell is selected within a grid, a random empty spot in that grid is filled.
                    -# ∘ If the chosen grid is full or no grid is selected, a random empty cell anywhere in the puzzle is filled.

                  **Server-Specific Settings**
                  -# **Toggling Hints**
                    -# ∘ Users with **Manage Guild** permissions can toggle the ability of using hints.
                    -# ∘ You can manage this by using **/server settings edit**.
                    -# ∘ You can also manage this on the **Dashboard** after logging in, via the Manage Server section.

                  **Tips & Tricks**
                  -# ∘ Use hints wisely, they solve a cell but count as prefilled, which can help or limit you later.
                  -# ∘ If stuck, use a hint in the smaller sections of the puzzle to avoid overwriting too many options.
                  -# ∘ Remember that hints need to be turned on in the server you're in, else it won't work.
                  -# ∘ Combine hints with pencil mode to mark possibilities before committing to a number.
                  -# ∘ You get 3 hints a day, but you can earn more through bonuses, quests and challenges!
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'goals_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 🏆 Daily / Community Goals`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Community Goals**
                  -# **Random Goals**
                    -# ∘ Every set period (e.g., 2 months or 6 months), a random community goal is selected from a predefined list.
                    -# ∘ All players contributions count towards completing the goal.
                    -# ∘ Goals can range from **Complete X Games** or **Solve X Grids**.

                  -# **Rewards**
                    -# ∘ Once the goal is completed, everyone receives a reward.
                    -# ∘ Rewards are randomized each time, keeping the incentives fresh and exciting.
                    -# ∘ Rewards can include in-game currency, bonus experience, or other special perks.

                  -# **Participation**
                    -# ∘ Contributions are automatically tracked while playing any active Sudoku game.
                    -# ∘ You do not need to perform special actions, just play and your progress counts!
                    -# ∘ Encourage friends and other players to participate to complete goals faster.
                  
                  **Daily Challenges**
                  -# **New Puzzle Each Day**
                    -# ∘ A fresh Sudoku puzzle is generated daily for all players.
                    -# ∘ The difficulty of the daily puzzle can vary between the following: **Easy**, **Medium** and **Hard**
                    -# ∘ Completing the daily puzzle grants a reward to the player who finishes it.
                    -# ∘ Both the reward amount and type are randomized each day, keeping things exciting.
                    -# ∘ Everyone has the same puzzle, so you can compare completion times and scores with friends.

                  **Tips & Tricks**
                  -# ∘ Keep an eye on the Community Goal to know what everyone is working towards.
                  -# ∘ If a goal is close to completion, focus your gameplay on that goal to maximize rewards.
                  -# ∘ Remember: the more people contributing, the quicker the community unlocks the prize!
                  -# ∘ Utilize pencil mode to mark possibilities before committing to a number.
                  -# ∘ Daily puzzles are great for practice, and increases your chances of bigger rewards.
                  -# ∘ Plan your moves: contributing strategically to goals can save time and increase efficiency.
                  -# ∘ Check progress early, sometimes your contribution might be just enough to trigger the reward.
                  -# ∘ For Daily Challenges, focus on sections you’re strongest at first, then fill in harder areas.
                  -# ∘ Don’t be afraid to experiment with different strategies, each puzzle may need a new approach.
                  -# ∘ Celebrate completing community goals with friends for shared progress.
                  -# ∘ Keep track of the randomized rewards; some days might give boosts or extra currency.
                  -# ∘ Use daily puzzles to test new strategies, themes, or practice pencil mode for tricky sections.
                  -# ∘ Remember: consistent participation in community goals and daily challenges to maximize rewards.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'quests_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 📅 Weekly Quests`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **General Info**
                  -# **What They Are**
                    -# ∘ Weekly Quests are rotating objectives that reset every week.
                    -# ∘ Completing them rewards you with bonuses like **EXP**, **Hints** or **Boosters**.
                    -# ∘ They are designed to encourage consistent play and variety in how you engage with Toastoku.

                  -# **Where to Find Them**
                  -# ∘ Quests are listed on both the dashboard and within the bot using commands.
                  -# ∘ Progress updates in real time as you play.
                  -# ∘ Each quest clearly shows its reward and how much progress you've made.

                  **Quest Types & Rewards**
                  -# **Examples of Quests**
                    -# ∘ Play or win a set number of games during the week.
                    -# ∘ Use limited to no hints for x amount of games.
                    -# ∘ Solve the daily challenge for 7 days.
                  
                  -# **Possible Rewards**
                    -# ∘ EXP to level up your profile.
                    -# ∘ Toast currency to spend in the shop.
                    -# ∘ Limited boosters to multiply your gains.
                    -# ∘ Free hints to use in tough puzzles.

                  **Tips & Tricks**
                  -# ∘ Check quests early in the week so you have time to complete them.
                  -# ∘ Combine quests with daily challenges for faster progress.
                  -# ∘ Team up with friends or your community to finish group objectives.
                  -# ∘ Save boosters until you're close to finishing a quest for maximum efficiency.
                  -# ∘ Don't forget: unclaimed rewards expire when the week resets!
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'economy_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 💰 Economy`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **General Info**
                  -# **Overview**
                    -# ∘ The Toastoku economy is built around multiple currencies and resources.
                    -# ∘ These can be earned through gameplay, quests, events or community activities.
                    -# ∘ Currencies can be spent in the **Shop** or used for customization and bonuses.

                  **Currency Types**
                  -# **Toast**
                    -# ∘ The main bot currency.
                    -# ∘ Earned by completing games, quests and voting.
                    -# ∘ Used to purchase themes, boosters and cosmetics.

                  -# **EXP**
                    -# ∘ Gained by playing and winning games.
                    -# ∘ Increases your profile level and unlocks rewards.

                  -# **Boosters**
                    -# ∘ Limited items that temporarily increase rewards.
                    -# ∘ Examples include double EXP or bonus toast gains.

                  -# **Free Hints**
                    -# ∘ A rare resource used to automatically fill correct cells in puzzles.
                    -# ∘ Can be earned through bonuses, quests, events and voting.

                  **Ways to Earn**
                  -# ∘ Win or complete puzzles to earn toast and EXP
                  -# ∘ Support Toastoku on [Top.GG](https://top.gg/bot/1384180054984097975/vote) for daily rewards.
                  -# ∘ Complete daily or weekly quests for currency and items.
                  -# ∘ Participate in special events or group objectives for shared rewards.

                  **Tips & Tricks**
                  -# ∘ Save toast for limited time shop items and seasonal themes.
                  -# ∘ Activate boosters before big sessions to maximize your earnings.
                  -# ∘ Check the dashboard regularly for special economy events.
                  -# ∘ Don't let free hints pile up; use them strategically in tough puzzles.
                  -# ∘ Tougher puzzles always lead to bigger payouts.
                  -# ∘ Remember: economy balances are always synced between the bot and the dashboard.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'leaderboards_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 🏅 Leaderboards`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Overview**
                  -# **Competitive Rankings**
                    -# ∘ Leaderboards highlight top players across different categories.
                    -# ∘ They update automatically to reflect latest progress.

                  **Tracked Categories**
                  -# **Most Toasts Earned (All Time)**
                    -# ∘ Total lifetime toasts collected since you started playing.
                    -# ∘ Recognizes dedication and long term consistency.

                  -# **Most Toasts (Current)**
                    -# ∘ The amount of toast you currently hold in your account.
                    -# ∘ A snapshot of who's the richest right now.

                  -# **Most Toasts Spent**
                    -# ∘ Tracks total toasts spent in the shop or on upgrades.
                    -# ∘ Shows off players who invest the most in customization and bonuses.

                  -# **Most Games Played**
                    -# ∘ Counts all games you've started across all modes.
                    -# ∘ Reflects overall activity and dedication.

                  -# **Most Games Won**
                    -# ∘ Tracks successfully completed games.
                    -# ∘ Focuse on skill, not just participation.

                  -# **Daily Challenges Completed**
                    -# ∘ Measures how many daily challenges you've finished.
                    -# ∘ Highlights consistency in tackling daily content.

                  **Why It Matters**
                  -# ∘ Leaderboards create friendly competition between players.
                  -# ∘ Different boards reward different play styles; grinders, collectors or winners.
                  -# ∘ Staying active in multiple categories helps boost your overall presence.

                  **Tips & Tricks**
                  -# ∘ Leaderboards are refreshed regularly and displayed on the dashboard.
                  -# ∘ Anonymous Mode hides your username from public ranking, providing you with a dummy name.
                  -# ∘ Seasonal events may introduce special temporary leaderboards.
                  -# ∘ Use leaderboards to measure progress and set new personal goals.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'vote_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### ⭐ Vote Rewards`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **General Info**
                  -# **Why Vote**
                    -# ∘ Voting supports Toastoku on [Top.GG](https://top.gg/bot/1384180054984097975/vote) and help the bot grow.
                    -# ∘ Each bot rewards you with **Bonuses** likes toast, EXP, boosters or free hints.
                    -# ∘ Voting rewards are claimable directly through the bot.

                  **Voting Mechanics**
                  -# **Daily Votes**
                    -# ∘ You can vote twice a day (every 12 hours) on supported platforms.
                    -# ∘ Each successful vote grants a standard reward.

                  -# **Weekend Double Rewards**
                    -# ∘ Votes cast on a **Friday**, **Saturday** or **Sunday** give twice the rewards.
                    -# ∘ Perfect opportunity to stock up bonuses before the new week begins.

                  **Claiming Rewards**
                  -# ∘ After voting, use the bot command **/claim** to claim your bonuses.
                  -# ∘ The command has a 12 hour cooldown and reminds you to vote if you haven't.
                  -# ∘ Rewards include toast, EXP, limited boosters and free hints.
                  -# ∘ Keep track of your vote streaks to maximize weekly gains.

                  **Tips & Tricks**
                  -# ∘ Plan weekend votes strategically to earn more bonuses.
                  -# ∘ Combine votes with daily challenges or quests for extra gains.
                  -# ∘ Voting streaks may contribute to additional seasonal events or rewards.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'profiles_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 👤 Profiles`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Overview**
                  -# **Your Identity**
                    -# ∘ Profiles represent your personal account on the bot.
                    -# ∘ They show off achievements, customization and status to other players.

                  **Profile Features**
                  -# **Custom Title**
                    -# ∘ Set a unique title that appears on your profile and in-game.
                    -# ∘ Titles can be changed anytime through the dashboard.

                  -# **Badges**
                    -# ∘ Earn badges for milestones, events or special roles.
                    -# ∘ Displayed directly on your profile to highlight accomplishments.
                    -# ∘ Edit which badges you want shown via the dashboard.

                  -# **Reputation**
                    -# ∘ Gain reputation points through positive interactions and contributions.
                    -# ∘ Reputation helps reflect your standing in the community.

                  -# **Flags & Roles**
                    -# ∘ Certain flags like **Toastoku #1** or **Support Team** are displayed.
                    -# ∘ These are automatically synced to your profile if eligible.

                  **Customization**
                  -# **Anonymous Mode**
                    -# ∘ Hide your name and profile details on leaderboards.
                    -# ∘ This also prevents other users checking your profile or stats.
                    -# ∘ Useful if you prefer privacy while still playing competitively.

                  -# **Themes & Cosmetics**
                    -# ∘ Apply purchased cosmetics to your profiles appearance.
                    -# ∘ Purchase new Toastoku themes for your games to enhance variations.
                    
                  **Tips & Tricks**
                  -# ∘ Your profile updates in real time across the bot and dashboard.
                  -# ∘ Use your profile to showcase progress, status annd unique unlocks.
                  -# ∘ Keep customizing: more badges, themes and titles can be earned over time.
                  -# ∘ Profiles are yours to control, using privacy settings.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'stats_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 📊 Stats`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Overview**
                  -# **Game History**
                    -# ∘ View details of your last **10** games directly in the dashboard, or via **/stats**.
                    -# ∘ Each entry shows results, performance and key decisions.

                  **What's Tracked**
                  -# **Hints Used**
                    -# ∘ See how many hints you relied on in each game.
                    -# ∘ Helps track improvement over time as you learn to solve without hints.

                  -# **Completion Status**
                    -# ∘ Shows whether each game was successfully completed or left unfinished.
                    -# ∘ Useful for spotting trends in wins vs incomplete runs.

                  -# **Game Type**
                    -# ∘ Records whether the game was **Singleplayer** or **Multiplayer**.
                    -# ∘ Makes it easy to filter your playstyle preferences.

                  -# **Game Difficulty**
                    -# ∘ View your most frequent difficulty level.
                    -# ∘ Allows you to visually see yourself improving for those tougher puzzles.

                  **Why It Matters**
                  -# ∘ Track your consistency and see how often you complete games.
                  -# ∘ Monitor hint usage to improve puzzle solving skills.
                  -# ∘ Compare differnt game difficulties/modes to see where you perform best.

                  **Tips & Tricks**
                  -# ∘ Stats update automatically after each game ends.
                  -# ∘ Use stats to set personal goals, like finishing **5** games with **0** hints.
                  -# ∘ The dashboard lets you revisit past performance anytime.
                  -# ∘ More detailed breakdowns (like average solve time) may be added in future updates.

                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'instructions_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 📖 Instructions`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Creating a Game**
                  -# **Game Persistence:** 
                    -# ∘ All games are saved automatically and can be continued even if the bot restarts.
                    -# ∘ Only players in the game can interact with its buttons.

                  -# **Starting a Game:**
                    -# ∘ Use **/sudoku play <difficulty> <theme> <mode>** to create a new game.
                    -# ∘ **difficulty** sets how many cells are prefilled and determines the challenge level.
                    -# ∘ **theme** chooses the grid style — either standard numbers or one of the emoji sets.
                    -# ∘ **mode** selects singleplayer or multiplayer (up to 4 players).

                  -# **Game Completion:**  
                    -# ∘ Once all cells are filled, the solution is checked automatically.  
                    -# ∘ If incorrect, the bot highlights which cells are wrong so you can continue correcting them.  
                    -# ∘ If correct, a completion message is shown, buttons are removed, and the game is deleted.

                  **General Gameplay**
                  -# **Grid Selection:**  
                    -# ∘ Begin by selecting a grid.  
                    -# ∘ The selected grid is highlighted in **light blue**.

                  -# **Cell Selection:**  
                    -# ∘ After choosing a grid, select a cell within it.  
                    -# ∘ Press **Back to Grid** to return to grid selection.  
                    -# ∘ The previously selected grid remains highlighted to indicate focus.

                  -# **Number Selection:**  
                    -# ∘ Prefilled cells are greyed out and cannot be changed.  
                    -# ∘ Tap a number to fill the cell and return to cell selection.  
                    -# ∘ Tap a cell you already filled to reset it to blank.  
                    -# ∘ Press **Back to Cell** to return to cell selection.  
                    -# ∘ Selected cell row and column are highlighted in **light blue**, with the cell itself in **darker blue**.  
                    -# ∘ Conflicting cells in the same row, column, or grid are highlighted in **red**.

                  **Tips & Tricks**
                  -# ∘ Plan ahead! Use pencil mode to jot down possible numbers before committing.  
                  -# ∘ Pay attention to highlighted conflicts — they save you from mistakes.  
                  -# ∘ In multiplayer, communicate with your teammates to avoid overwriting each other’s moves.  
                  -# ∘ Take advantage of hints strategically to fill tricky spots without ruining your notes.  
                  -# ∘ Experiment with different themes to make gameplay visually enjoyable and easier to track.  
                  -# ∘ Remember: **End Game** deletes your session, only use it when you’re done or want to restart.  
                  -# ∘ Use **Back to Grid** and **Back to Cell** often to stay oriented in larger puzzles.  
                  -# ∘ For faster play, focus on one row, column, or grid at a time to minimize errors.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'bonuses_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 🎁 Bonuses`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Types of Bonuses**
                  -# **EXP**
                    -# ∘ Earn experience points to level up your account and unlock rewards.

                  -# **Boosters**
                    -# ∘ Limited time power-ups that enhance gameplay or rewards.
                    -# ∘ Examples include double EXP and faster hint regeneration.

                  -# **Free Hints**
                    -# ∘ Use hints to solve tough puzzles without penalty.
                    -# ∘ Hints are rare but can be earned through events, milestones or voting!

                  -# **Toast Currency**
                    -# ∘ Exclusive bot currency used for purchases in the shop.
                    -# ∘ Spend it on new themes, boosters or other unlockables.

                  **How to Earn Bonuses**
                  -# **Voting**
                    -# ∘ Support Toastoku on [Top.GG](https://top.gg/bot/1384180054984097975/vote) to claim daily rewards.
                    -# ∘ Votes can be completed every 12 hours!
                  
                  -# **Game Completion**
                    -# ∘ Successfully finish games to receive EXP, toast or boosters.

                  -# **Daily Challenges**
                    -# ∘ Complete the rotating challenges each day for guaranteed bonuses.

                  -# **Weekly Quests**
                    -# ∘ Finish your quests in a timely manner to reap great rewards.

                  -# **Community Goals**
                    -# ∘ Work together with other players to unlock shared rewards for everyone.
                    -# ∘ These rewards are often larger in size, but appear less often.

                  -# **Special Events**
                    -# ∘ Participate in seasonal or limited time events for unique bonuses.
                    -# ∘ Completing games in the [Toastoku Community](https://discord.com/invite/TQNQSen7Ur) grant larger rewards.

                  **Tips & Tricks**
                  -# ∘ Bonuses stack with each other, plan your boosters for maximum effect.
                  -# ∘ Daily challenges and voting are the easiest way to stock up on rewards.
                  -# ∘ Keep an eye out for event alerts to grab time limited bonuses.
                  -# ∘ Use your free hints wisely, they can turn a loss into a win.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'dashboard_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### 💻 Dashboard`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Logging In**
                  -# **Discord Authentication**
                    -# ∘ Log in with your Discord account to securely access your data.
                    -# ∘ The dashboard only shows information for the account you sign in with.
                    -# ∘ Permissions are synced automatically, no extra setup is needed.
                    
                  **Your Account**
                  -# **Profile Management**
                    -# ∘ View and edit your profile information linked to the bot.
                    -# ∘ Update your custom biography, title and personal settings.
                    -# ∘ Enable **Anonymous Mode** to hide your identity on leaderboards.

                  **Features & Sections**
                  -# **Shop**
                    -# ∘ Purchase themes, cosmetics and other upgrades directly from the dashboard.
                    -# ∘ All purchases are instantly applied to your bot account.
                    -# ∘ Purchases are tied to the bot account they were bought on.

                  -# **Leaderboards**
                    -# ∘ See how you rank globally against other players.
                    -# ∘ toggle between different stat categories like 'Most Toast Ever Earned'.

                  -# **Stats & History**
                    -# ∘ Track your progress, game history and detailed statistics.
                    -# ∘ Get insights into performance over time with visual breakdowns.

                  -# **Alerts & Notifications**
                    -# ∘ Configure which alerts you receive in Discord via the Dashboard.
                    -# ∘ Toggle notifications such as event reminders, shop sales or little updates!
                  
                  **Customization**
                  -# **Themes**
                    -# ∘ Browse and purchase new visual themes for the bot using our new currency!
                    -# ∘ Themes are automatically added to your collection upon purchasing.

                  -# **Settings**
                    -# ∘ Manage privacy, notification preferences and advanced options.
                    -# ∘ Everything is synced across the bot and dashboard in real time.

                  **Tips & Tricks**
                  -# ∘ Your Discord login ensures everything stays tied to your account.
                  -# ∘ Purchases, stats and settings made on the dashboard appear on the bot instantly.
                  -# ∘ Logging out will hide your info until you log back in.
                  -# ∘ If you run into issues, make sure you're signed in with the same Discord account.
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        case 'commands_menu':
            container = new ContainerBuilder()
                .addTextDisplayComponents(td => td.setContent(`### ⚙️ Commands`))
                .addSeparatorComponents(s => s)
                .addTextDisplayComponents(td => td.setContent(stripIndents`
                  **Everyone**
                  -# ∘ /changelogs - to view the most recent changes to Toastoku!
                  -# ∘ /daily - to play the daily challenge!
                  -# ∘ /help - to bring up this beautiful menu!
                  -# ∘ /hint - to use one of your hints!
                  -# ∘ /leaderboard - to view the top ranking players!
                  -# ∘ /profile - to view your bots profile!
                  -# ∘ /quests - to view your weekly quests!
                  -# ∘ /settings - to enable/disable your bots settings!
                  -# ∘ /stats - to view your last 10 games!
                  -# ∘ /sudoku play <difficulty> <theme> <mode> - to create a game of Sudoku!
                  -# ∘ /vote - to vote and help us grow Toastoku!

                  **Server Administrators**
                  -# ∘ /server-settings edit - to enable/disable server settings
                `))
                .addSeparatorComponents(s => s)
                .addActionRowComponents(selectMenuRow)
        break;
        default: return;
    }

    return interaction.update({ components: [container] });
}