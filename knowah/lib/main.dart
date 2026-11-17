// Imports Flutter's ready-made building blocks (buttons, text, screens)
import 'package:material_ui/material_ui.dart';

// The Menu screen from lib/screens
import 'package:knowah/screens/menu_screen.dart';

// main() is where every Dart program starts
// runApp() tells Flutter which widget to show first
void main() => runApp(const KnowahApp());

// A widget is any piece of the screen
// StatelessWidget means it never changes once it is drawn
class KnowahApp extends StatelessWidget {
    const KnowahApp({super.key});

    // build() describes what this widget looks like
    @override
    Widget build(BuildContext context) {
        // MaterialApp sets up the app's title, theme and first screen
        return MaterialApp(
            title: 'KNOWAH',
            // Theme sets the look of the whole application, so every screen matches
            theme: ThemeData(
                // Dark mode makes default text light instead of dark
                brightness: Brightness.dark,
                // The page background colour for every Scaffold
                scaffoldBackgroundColor: const Color(0xFF0A0D18),
                fontFamily: 'Sniglet',
                // Sets the colour of all text in the app, once
                // bodyColor is normal text, displayColor is big headings
                textTheme: ThemeData.dark().textTheme.apply(
                    bodyColor: const Color(0xFFE7EAF6),
                    displayColor: const Color(0xFFE7EAF6),
                    fontFamily: 'Sniglet',
                ),
                // Appearance of every solid button (+ New Project)
                elevatedButtonTheme: ElevatedButtonThemeData(
                    style: ElevatedButton.styleFrom(
                        // Buttons text colour
                        foregroundColor: const Color(0xFF5EEAD4),
                        // Buttons fill colour
                        backgroundColor: const Color(0xFF5EEAD4).withValues(alpha: 0.1),
                        // Rectangular shaped with slightly rounded corners (4 = corner radius)
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                        ),
                        // Buttons border colour and thickness
                        side: BorderSide(
                            color: Color(0xFF5EEAD4).withValues(alpha: 0.5),
                            width: 2,
                        ),
                        // Minimum width and height of the button
                        minimumSize: const Size(500, 50),
                        // Font family and size of the text inside the button
                        textStyle: const TextStyle(fontSize: 16, fontFamily: 'Sniglet'),
                        // Space inside the button, sideways first then up and down
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    ),
                ),
                // Appearance of every outlined button (Open Project)
                outlinedButtonTheme: OutlinedButtonThemeData(
                    style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF8A90B3),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                        ),
                        // Buttons border colour and thickness
                        side: BorderSide(
                            color: Color(0xFF8A90B3).withValues(alpha: 0.5),
                            width: 2,
                        ),
                        // Minimum width and height of the button
                        minimumSize: const Size(500, 50),
                        // Font family and size of the text inside the button
                        textStyle: const TextStyle(fontSize: 16, fontFamily: 'Sniglet'),
                        // Space inside the button, sideways first then up and down
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    ),
                ),
            ),
            home: const MenuScreen(),
        );
    }
}