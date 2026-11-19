// Imports Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Knowahs colours, the 3D text helper and the 3D button
import 'package:knowah/themes/app_colours.dart';
import 'package:knowah/themes/effects.dart';
import 'package:knowah/widgets/button_3d.dart';

// The Item and the screen we are moving to
import 'package:knowah/models/item.dart';
import 'package:knowah/screens/item_list_screen.dart';

// The Menu is the first screen the user sees
// StatelessWidget means it never changes once it is drawn
class MenuScreen extends StatelessWidget {
    const MenuScreen({super.key});

    @override
    Widget build(BuildContext context) {
        // Scaffold is a blank page
        return Scaffold(
            // Center puts everything in the middle of the page
            body: Center(
                // Scrolls if the window is too short to fit everything
                child: SingleChildScrollView(
                    // Column stacks its children from top to bottom
                    child: Column(
                        // Only as tall as its contents, so Centre can centre it
                        mainAxisSize: MainAxisSize.min,
                        children: [
                            // The app name
                            Text(
                                'KNOWAH',
                                style: TextStyle(
                                    fontFamily: 'RubikDirt', 
                                    fontSize: 64, 
                                    fontWeight: FontWeight.bold,
                                    // Adds a 3D effect using shadows
                                    shadows: extrude(AppColours.cyanShadow, 6),
                                ),
                            ),
                            // The tagline
                            Text(
                                'It knows. Noah knows.',
                                style: TextStyle(
                                    fontSize: 20, 
                                    fontWeight: FontWeight.normal,
                                    shadows: extrude(AppColours.textDimShadow, 2),
                                )
                            ),
                            // SizedBox is just empty space between things
                            const SizedBox(height: 24),

                            // Wrap puts its children side by side if there is room
                            // If not, the second child drops underneath (mobile)
                            Wrap(
                                // Centres the groups sideways
                                alignment: WrapAlignment.center,
                                // Keeps both groups lined up at the top
                                crossAxisAlignment: WrapCrossAlignment.start,
                                // Gap between the groups when side by side
                                spacing: 80,
                                // Gap between the groups when stacked
                                runSpacing: 32,
                                children: [
                                    // Left group: the 2 main buttons (fixed width, never stretches)
                                    SizedBox(
                                        width: 320,
                                        child: Column(
                                            mainAxisSize: MainAxisSize.min,
                                            // Makes the buttons fill the 320 pixels
                                            crossAxisAlignment: CrossAxisAlignment.stretch,
                                            children: [
                                                // Invisible copy of the 'Recent Projects' heading
                                                // Takes up the same space, so buttons line up properly
                                                const Opacity(
                                                    opacity: 0,
                                                    child: Text(
                                                        'RECENT PROJECTS',
                                                        textAlign: TextAlign.center,
                                                        style: TextStyle(
                                                            fontSize: 20,
                                                            fontWeight: FontWeight.normal
                                                        ),
                                                    ),
                                                ),
                                                const SizedBox(height: 4),

                                                // Button 1 - New Project, onPressed does nothing yet (empty function)
                                                Button3D(
                                                    filled: true,
                                                    label: '+ New Project',
                                                    onPressed: () {},
                                                ),
                                                const SizedBox(height: 14),

                                                // Button 2 - Open Project
                                                Button3D(
                                                    label: 'Open Project',
                                                    onPressed: () {},
                                                ),
                                            ],
                                        ),
                                    ),

                                    // Right group: Recent Projects (same fixed width)
                                    SizedBox(
                                        width: 320,
                                        child: Column(
                                            mainAxisSize: MainAxisSize.min,
                                            crossAxisAlignment: CrossAxisAlignment.stretch,
                                            children: [
                                                // Recent Projects section
                                                Text(
                                                    'RECENT PROJECTS',
                                                    textAlign: TextAlign.center,
                                                    style: TextStyle(
                                                        fontSize: 20,
                                                        fontWeight: FontWeight.normal,
                                                        color: AppColours.textDim,
                                                        shadows: extrude(AppColours.textDimShadow, 2),
                                                    ),
                                                ),
                                                const SizedBox(height: 4),

                                                // Example games for Recent Projects
                                                Button3D(
                                                    label: 'Side-Scroller',
                                                    onPressed: () => _openProject(context),
                                                ),
                                                const SizedBox(height: 14),

                                                Button3D(
                                                    label: 'Card Battler',
                                                    onPressed: () => _openProject(context),
                                                ),
                                                const SizedBox(height: 14),

                                                Button3D(
                                                    label: 'Maze Runner',
                                                    onPressed: () => _openProject(context),
                                                ),
                                                const SizedBox(height: 14),
                                            ],
                                        ),
                                    ),
                                ],
                            ),
                        ],
                    ),
                ),
            )
        );
    }

    // Moves to the Item list for a project
    // The items are placeholders for now, until the SQLite Database is connected
    void _openProject(BuildContext context) {
        // Navigator.push moves to a new screen
        Navigator.push(
            context,
            MaterialPageRoute(
                // The screen to show
                builder: (context) => ItemListScreen(
                    items: [
                        Item(title: 'Double Jump', status: ItemStatus.active),
                        Item(title: 'Level 2'),
                        Item(title: 'Slime Enemy'),
                        Item(title: 'Character Floats'),
                    ],
                ),
            ),
        );
    }
}