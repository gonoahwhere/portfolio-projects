// Flutter's building blocks, needed to draw a test screen
import 'package:material_ui/material_ui.dart';

// testWidgets lets us test a screen without opening the app
import 'package:flutter_test/flutter_test.dart';

// Drift's in memory database, for tests
import 'package:drift/native.dart';

// The database and the screen we are testing
import 'package:knowah/database/app_db.dart';
import 'package:knowah/screens/menu_screen.dart';

void main() {
    // TC03: the menu must show the 2 required buttons
    testWidgets('TC03: Main menu shows New Project and Open Project buttons', (tester) async {
        // A fresh, empty database that lives only in memory
        final database = AppDB(NativeDatabase.memory());

        // Draw the screen inside a minimal app, passing the Menu the database
        await tester.pumpWidget(MaterialApp(home: MenuScreen(database: database)));
        
        // Wait for the Menu to finish reading from the database, then redraw
        // runAsync lets real database work happen inside a widget test
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
        await tester.pump();

        // find.text looks for the text on the screen
        // findsOneWidget means it's to expect to find exactly one widget
        expect(find.text('+ New Project'), findsOneWidget);
        expect(find.text('Open Project'), findsOneWidget);

        // Close the database
        await tester.runAsync(() => database.close());
    });
}