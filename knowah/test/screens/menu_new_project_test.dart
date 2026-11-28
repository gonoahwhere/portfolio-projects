// Flutter's building blocks, needed to draw a test screen
import 'package:material_ui/material_ui.dart';

// flutter_test gives us test(), expect() and the checks used below
import 'package:flutter_test/flutter_test.dart';

// Drift's in memory database, for tests
import 'package:drift/native.dart';

// The database and the screen we are testing
import 'package:knowah/database/app_db.dart';
import 'package:knowah/screens/menu_screen.dart';

void main() {
    // TC27: creating a new project adds it to the recent projects
    testWidgets('TC27: Creating a new project adds it to the recent projects', (tester) async {
        // A fresh, empty database that lives only in memory
        final database = AppDB(NativeDatabase.memory());

        // Draw the Menu, passing it the database
        await tester.pumpWidget(MaterialApp(home: MenuScreen(database: database)));

        // Wait for the Menu to finish loading the list, then redraw
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
        await tester.pump();

        // The project does not exist yet
        expect(find.text('Platformer'), findsNothing);

        // Press + New Project, and wait for the pop up to appear
        await tester.tap(find.text('+ New Project'));
        await tester.pumpAndSettle();

        // Type a name into the text box in the pop up
        await tester.enterText(find.byType(TextField), 'Platformer');

        // Press Create, and wait for the pop up to close
        await tester.tap(find.text('Create'));
        await tester.pumpAndSettle();

        // Wait for the database to save and the Menu to reload, then redraw
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
        await tester.pump();

        // The new project should now be in the recent list
        expect(find.text('Platformer'), findsOneWidget);

        // Close the database
        await tester.runAsync(() => database.close());
    });

    // TC28: pressing Create with an empty name shows a message and saves nothing
    testWidgets('TC28: An empty project name shows a message', (tester) async {
        // A fresh, empty dataabase that lives only in memory
        final database = AppDB(NativeDatabase.memory());

        // Draw the Menu, passing it the database
        await tester.pumpWidget(MaterialApp(home: MenuScreen(database: database)));

        // Wait for the Menu to finish loading the list, then redraw
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
        await tester.pump();

        // Press + New Project, and wait for the pop up to appear
        await tester.tap(find.text('+ New Project'));
        await tester.pumpAndSettle();

        // Press Create without typing a name
        await tester.tap(find.text('Create'));
        await tester.pumpAndSettle();

        // The message from the Project rule should be showing
        expect(find.text('Name cannot be empty'), findsOneWidget);

        // The pop up should still be open, so the user can fix it
        expect(find.byType(AlertDialog), findsOneWidget);

        // Nothing should have been saved to the database
        final saved = await tester.runAsync(() => database.getAllProjects());
        expect(saved, isEmpty);

        // Close the database
        await tester.runAsync(() => database.close());
    });
}