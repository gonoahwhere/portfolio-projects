// Imports Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Knowahs colours, the 3D text helper and the 3D button
import 'package:knowah/themes/app_colours.dart';
import 'package:knowah/themes/effects.dart';
import 'package:knowah/widgets/button_3d.dart';

// The Item and the screen we are moving to
import 'package:knowah/models/item.dart';
import 'package:knowah/screens/item_list_screen.dart';

// The database the Menu reads its projects from
import 'package:knowah/database/app_db.dart';

// The Project that comes back from the database
import 'package:knowah/models/project.dart';

// The Link made in another file
import 'package:knowah/models/link.dart';

// The Menu is the first screen the user sees
// StatefulWidget because it changes while the app runs (the list of projects load in)
class MenuScreen extends StatefulWidget {
    // The database to read the projects from, passed in by whoever shows the Menu
    final AppDB database;

    const MenuScreen({super.key, required this.database});

    @override
    State<MenuScreen> createState() => _MenuScreenState();
}

// This is the part that remembers the loaded projects
class _MenuScreenState extends State<MenuScreen> {
    // The projects shown in the recent list (empty until the database answers)
    List<Project> _projects = [];

    // initState runs once, when the screen is first created
    @override
    void initState() {
        super.initState();
        // Start loading the projects
        _loadProjects();
    }

    // Asks the database for every project, then redraws the screen with them
    Future<void> _loadProjects() async {
        // widget.database reaches the database field on MenuScreen above
        final projects = await widget.database.getAllProjects();

        // 'mounted' is false is the screen went away while waiting
        if (!mounted) return;

        // setState puts the projects in the list and redraws the scene
        setState(() => _projects = projects);
    }

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

                                                // One button for every project loaded in from the database
                                                // The ...[ ] puts a button and its spacing into the list together
                                                for (final project in _projects) ... [
                                                    Button3D(
                                                        // The project's name is the button's text
                                                        label: project.name,
                                                        onPressed: () => _openProject(context),
                                                    ),
                                                    const SizedBox(height: 14),
                                                ]
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
                builder: (context) {
                    // Placeholder items, kept in variables so the links can point at them
                    final doubleJump = Item(title: 'Double Jump', status: ItemStatus.active);
                    final level2 = Item(title: 'Level 2');
                    final slime = Item(title: 'Slime Enemy', status: ItemStatus.active);
                    final floats = Item(title: 'Character Floats');

                    return ItemListScreen(
                        items: [doubleJump, level2, slime, floats],

                        // Placeholder links
                        links: [
                            Link(type: LinkType.introducedIn, from: doubleJump, to: level2),
                            Link(type: LinkType.relatedTo, from: floats, to: doubleJump),
                        ],
                    );
                },
            ),
        );
    }
}