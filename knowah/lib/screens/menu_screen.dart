// Imports Flutter's ready-made building blocks (buttons, text, screens)
import 'package:material_ui/material_ui.dart';

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
                            const Text(
                                'KNOWAH',
                                style: TextStyle(
                                    fontFamily: 'RubikDirt', 
                                    fontSize: 64, 
                                    fontWeight: FontWeight.bold
                                ),
                            ),
                            // The tagline
                            const Text(
                                'It knows. Noah knows.',
                                style: TextStyle(
                                    fontSize: 20, 
                                    fontWeight: FontWeight.normal
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
                                                ElevatedButton(
                                                    onPressed: () {},
                                                    child: const Text('+ New Project'),
                                                ),
                                                const SizedBox(height: 8),

                                                // Button 2 - Open Project
                                                OutlinedButton(
                                                    onPressed: () {},
                                                    child: const Text('Open Project'),
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
                                                const Text(
                                                    'RECENT PROJECTS',
                                                    textAlign: TextAlign.center,
                                                    style: TextStyle(
                                                        fontSize: 20,
                                                        fontWeight: FontWeight.normal,
                                                        color: Color(0XFF8A90B3),
                                                    ),
                                                ),
                                                const SizedBox(height: 4),

                                                // Example games for Recent Projects
                                                OutlinedButton(
                                                    onPressed: () {},
                                                    child: const Text('Side-Scroller'),
                                                ),
                                                const SizedBox(height: 8),

                                                OutlinedButton(
                                                    onPressed: () {},
                                                    child: const Text('Card Battler'),
                                                ),
                                                const SizedBox(height: 8),

                                                OutlinedButton(
                                                    onPressed: () {},
                                                    child: const Text('Maze Runner'),
                                                ),
                                                const SizedBox(height: 8),
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
}