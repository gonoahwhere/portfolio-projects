// Flutter's building blocks, needed to draw a test screen
import 'package:material_ui/material_ui.dart';

// testWidgets lets us test a screen without opening the app
import 'package:flutter_test/flutter_test.dart';

// This screen doesn't exist yet, so the test will fail
import 'package:knowah/screens/menu_screen.dart';

void main() {
    // TC03: the menu must show the 2 required buttons
    testWidgets('TC03: Main menu shows New Project and Open Project buttons', (tester) async {
        // Draw the screen inside a minimal app, like a pretend phone
        await tester.pumpWidget(const MaterialApp(home: MenuScreen()));

        // find.text looks for the text on the screen
        // findsOneWidget means it's to expect to find exactly one widget
        expect(find.text('+ New Project'), findsOneWidget);
        expect(find.text('Open Project'), findsOneWidget);
    });
}