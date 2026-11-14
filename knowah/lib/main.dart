// Imports Flutter's ready-made building blocks (buttons, text, screens)
import 'package:material_ui/material_ui.dart';

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
        return const MaterialApp(
            title: 'KNOWAH',
            // Scaffold is a blank page, Center puts the text in the middle
            home: Scaffold(body: Center(child: Text('KNOWAH'))),
        );
    }
}